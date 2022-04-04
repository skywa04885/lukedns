import dgram from "dgram";
import net from "net";
import { Message } from "./protocol/Message";
import { Server } from "./Server";
import { TCPStream } from "./TCPStream";
import {
  DNSClass,
  DNSQClass,
  MessageHeaderFlags,
  MessageHeaderResponseCode,
  QType,
  Type,
} from "./protocol/Types";
import { LookupTableZone } from "./lookup/LookupTableZone";
import { LookupTable } from "./lookup/LookupTable";
import { LookupTableRecord } from "./lookup/LookupTableRecord";
import { Statistics } from "./Statistics";
import { QuestionSection } from "./protocol/QuestionSection";
import { LabelSequence } from "./protocol/datatypes/LabelSequence";
import { logger } from "./logger";

export enum ServerConnectionType {
  TCP = "TCP",
  UDP = "UDP",
}

export class ServerConnection {
  public constructor(
    protected _type: ServerConnectionType,
    protected _server: Server
  ) {}

  /**
   * Gets called on a AXFR question.
   * @param message the message containing the question.
   * @protected
   */
  protected _on_axfr_question(message: Message) {
    // Checks if we're actually dealing with a TCP connection, if not refuse the AXFR request.
    if (this._type !== ServerConnectionType.TCP) {
      message.header.response_code = MessageHeaderResponseCode.Refused;
      return this._write(message);
    }

    // Gets the question from the message.
    const question: QuestionSection = message.question!;

    // Gets the name of the zone requested.
    const requested_zone_name: LabelSequence = question.qname;
    const requested_zone_class: DNSClass | DNSQClass = question.qclass;

    // Gets the zone based on the name and class.
    const zone: LookupTableZone | undefined =
      LookupTable.instance.match_zone(requested_zone_name);
    if (!zone) {
      message.header.response_code = MessageHeaderResponseCode.NameError;
      return this._write(message);
    }

    // Writes all the records to the client.
    [
      // Always begin with SOA.
      zone._records.soa,
      // The other's order doesn't matter.
      zone._records.txt,
      zone._records.ptr,
      zone._records.ns,
      zone._records.mx,
      zone._records.ns,
      zone._records.h_info,
      zone._records.cname,
      zone._records.a,
      zone._records.aaaa,
      // Always end with SOA
      zone._records.soa,
    ].forEach((records: LookupTableRecord[]): void => {
      records.forEach((record: LookupTableRecord): void => {
        message.push_answer(record.rr);
      });
    });

    // Writes the response.
    message.header.set_flags(MessageHeaderFlags.AA);
    message.header.response_code = MessageHeaderResponseCode.NoError;
    this._write(message);
  }

  protected _on_general_record_question(message: Message) {
    // Gets the zone for which we can query the records, if it does not exist
    //  send an error telling that we don't have access to that domain.
    const zone: LookupTableZone | undefined = LookupTable.instance.match_zone(
      message.question!.qname
    );
    if (!zone) {
      message.header.response_code = MessageHeaderResponseCode.NameError;
      this._write(message);
      return;
    }

    // Sets the message flag indicating we're the authority for the given zone.
    message.header.set_flags(MessageHeaderFlags.AA);

    // Looks for matching records in the zone.
    const records: LookupTableRecord[] = zone.match_records(
      message.question!.qname,
      message.question!.qtype
    );

    // If there are no found records, respond with an error.
    if (records.length === 0) {
      message.header.response_code = MessageHeaderResponseCode.NameError;
      this._write(message);
      return;
    }

    // Processes the matches and adds them to the answers.
    records.forEach((record: LookupTableRecord): void =>
      message.push_answer(record.rr)
    );

    // Sets the flag indicating everything went fine and write the message back.
    message.header.response_code = MessageHeaderResponseCode.NoError;
    this._write(message);
  }

  /**
   * Gets called when there has been a request for which we haven't implemented something.
   * @param message the message.
   * @protected
   */
  protected _on_unimplemented_question(message: Message) {
    message.header.response_code = MessageHeaderResponseCode.NotImplemented;
    return this._write(message);
  }

  /**
   * Gets called when a new message is received.
   * @param buffer the buffer containing the message.
   */
  protected _on_message(buffer: Buffer) {
    // Parses the message, and sets the flag indicating the response.
    let [, message] = Message.decode(buffer);
    message.header.set_flags(MessageHeaderFlags.QR);

    // Checks if there are any questions at all.
    if (!message.question) {
      message.header.response_code = MessageHeaderResponseCode.Refused;
      this._write(message);
      return;
    }

    // Checks the question type and calls the appropriate function.
    switch (message.question.qtype) {
      // Handles the AXFR questions.
      case QType.AXFR: {
        this._on_axfr_question(message);
        break;
      }
      // Handles all the standard records.
      case Type.AAAA:
      case Type.TXT:
      case Type.A:
      case Type.MX:
      case Type.HINFO:
      case Type.CNAME:
      case Type.PTR:
      case Type.SOA:
      case Type.NS: {
        this._on_general_record_question(message);
        break;
      }
      // Logs that we couldn't handle the request.
      default: {
        logger.warn(
          `Couldn't handle question of q-type ${message.question.qtype} because of missing implementation.`
        );
        this._on_unimplemented_question(message);
        break;
      }
    }

    if (message.question.qtype === QType.AXFR) {
      return this._on_axfr_question(message);
    }
  }

  /**
   * Writes the given buffer to the socket.
   * @param message the message to write to the socket.
   */
  protected _write(message: Message): void {
    throw new Error("Not implemented!");
  }
}

export class TCPServerConnection extends ServerConnection {
  protected _socket: net.Socket;
  protected _tcp_stream: TCPStream;

  public constructor(_server: Server, _socket: net.Socket) {
    super(ServerConnectionType.TCP, _server);

    this._socket = _socket;
    this._socket.on("error", this._on_error);

    this._tcp_stream = new TCPStream((buffer: Buffer) => {
      Statistics.instance.increment_tcp_query_count();
      this._on_stream_message(buffer);
    });
    this._socket.pipe(this._tcp_stream);
  }

  /**
   * Writes the given buffer to the socket.
   * @param message the message to write to the socket.
   */
  protected _write(message: Message): void {
    this._socket.write(message.encode(true));
  }

  /**
   * Gets called when a new message is streamed in.
   * @param buffer the buffer containing the message.
   */
  protected _on_stream_message(buffer: Buffer): void {
    this._on_message(buffer);
  }

  protected _on_error(error: Error): void {
    logger.error("An error occurred in a TCP server connection: ", { error });
  }
}

export class UDPServerConnecton extends ServerConnection {
  public constructor(
    _server: Server,
    protected _remote_info: dgram.RemoteInfo
  ) {
    super(ServerConnectionType.UDP, _server);
  }

  /**
   * Writes the given buffer to the socket.
   * @param message the message to write to the socket.
   */
  protected _write(message: Message): void {
    let encoded: Buffer = message.encode(false);
    if (encoded.length > 512) {
      // Sets the truncated flag.
      message.header.set_flags(MessageHeaderFlags.TC);

      // Clears the contents (why waste bandwidth).
      message.clear_questions();
      message.clear_answers();
      message.clear_aditional();
      message.clear_authority();

      // Sets the new truncated response.
      encoded = message.encode(false);
    }

    this._server.dgram_socket.send(
      message.encode(false),
      this._remote_info.port,
      this._remote_info.address
    );
  }

  /**
   * Supplies the message.
   * @param buffer the buffer containing the message.
   */
  public supply(buffer: Buffer): void {
    Statistics.instance.increment_udp_query_count();
    this._on_message(buffer);
  }
}

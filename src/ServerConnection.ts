import dgram from "dgram";
import net from "net";
import { Message } from "./proto/Message";
import { Server } from "./Server";
import { TCPStream } from "./TCPStream";
import { MessageHeaderFlags, MessageHeaderResponseCode } from "./proto/Types";
import { LookupTableZone } from "./lookup/LookupTableZone";
import { LookupTable } from "./lookup/LookupTable";
import { LookupTableRecord } from "./lookup/LookupTableRecord";
import { Statistics } from "./Statistics";

export class ServerConnection {
  public constructor(protected _server: Server) {}

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

    // Gets the zone for which we can query the records, if it does not exist
    //  send an error telling that we don't have access to that domain.
    const zone: LookupTableZone | undefined = LookupTable.instance.match_zone(
      message.question.qname
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
      message.question.qname,
      message.question.qtype
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
    super(_server);

    this._socket = _socket;

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
}

export class UDPServerConnecton extends ServerConnection {
  public constructor(
    _server: Server,
    protected _remote_info: dgram.RemoteInfo
  ) {
    super(_server);
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

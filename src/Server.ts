import dgram from "dgram";
import net from "net";
import { TCPServerConnection, UDPServerConnecton } from "./ServerConnection";
import { Config } from "./config/Config";
import {logger} from "./logger";

export class Server {
  protected static _instance: Server;

  protected _dgram_socket: dgram.Socket;
  protected _tcp_server: net.Server;

  public static get instance(): Server {
    if (!this._instance) {
      this._instance = new Server();
    }

    return this._instance;
  }

  public get dgram_socket(): dgram.Socket {
    return this._dgram_socket;
  }

  protected constructor() {
    this._dgram_socket = dgram.createSocket("udp4");

    this._dgram_socket.on('error', this._on_udp_error);
    this._dgram_socket.on(
      "message",
      (buffer: Buffer, r_info: dgram.RemoteInfo): void =>
        this._handle_udp(buffer, r_info)
    );

    this._dgram_socket.bind(Config.instance.server.udp_port, Config.instance.server.udp_host);

    this._tcp_server = net.createServer();
    this._tcp_server.on('error', this._on_tcp_server_error)
    this._tcp_server.on("connection", (socket: net.Socket): void => {
      try {
        new TCPServerConnection(this, socket);
      } catch (e) {
        logger.error(`An error occurred in the TCP Server Connection:`, {error: e});
      }
    });

    this._tcp_server.listen(
      Config.instance.server.tcp_port,
      Config.instance.server.tcp_host,
      Config.instance.server.tcp_backlog
    );
  }

  /**
   * Gets called when an error occurred on the UDP socket.
   * @param error the error.
   * @protected
   */
  protected _on_udp_error(error: Error) {
    logger.error('An error occurred on the UDP DNS socket: ', error);
  }

  /**
   * Gets called when an error occurred on the TCP server.
   * @param error the error.
   * @protected
   */
  protected _on_tcp_server_error(error: Error) {
    logger.error('An error occurred on the TCP DNS Server: ', error);
  }

  /**
   * Gets called when a new DNS UDP packet has been received.
   * @param buffer the buffer to read.
   * @param r_info the remote info.
   */
  protected _handle_udp(buffer: Buffer, r_info: dgram.RemoteInfo): void {
    new UDPServerConnecton(this, r_info).supply(buffer);
  }
}

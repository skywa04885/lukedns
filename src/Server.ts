import dgram from "dgram";
import net from "net";
import { TCPServerConnection, UDPServerConnecton } from "./ServerConnection";
import { Config } from "./config/Config";

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

    this._dgram_socket.on(
      "message",
      (buffer: Buffer, r_info: dgram.RemoteInfo): void =>
        this._handle_udp(buffer, r_info)
    );

    this._dgram_socket.bind(Config.instance.server.udp_port, Config.instance.server.udp_host);

    this._tcp_server = net.createServer();

    this._tcp_server.on("connection", (socket: net.Socket): void => {
      new TCPServerConnection(this, socket);
    });

    this._tcp_server.listen(
      Config.instance.server.tcp_port,
      Config.instance.server.tcp_host,
      Config.instance.server.tcp_backlog
    );
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

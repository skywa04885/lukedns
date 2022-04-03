import { Writable } from "stream";
import { UINT16_SIZE } from "./protocol/Types";

export type TCPStreamMessageCallback = (message: Buffer) => void;

export class TCPStream extends Writable {
    protected _callback: TCPStreamMessageCallback;
    protected _message_size?: number;
    protected _buffer?: Buffer;

    public constructor(callback: TCPStreamMessageCallback) {
        super();

        this._callback = callback;
        this._message_size = undefined;
        this._buffer = undefined;
    }

    public _write(chunk: Buffer, encoding: BufferEncoding, callback: (error?: Error) => void): void {
        // Adds teh chunk to the buffer.
        if (this._buffer) {
            this._buffer = Buffer.concat([ this._buffer, chunk ]);
        } else {
            this._buffer =  chunk;
        }

        // If not a message size, we're receiving one.
        if (!this._message_size) {
            if (chunk.length >= UINT16_SIZE) {
                this._message_size = this._buffer.readUint16BE(0);
                this._buffer = this._buffer.slice(2);
            } else {
                return;
            }
        }

        // Checks if there is enough data, if not just
        //  return and wait until there is more.
        if (this._buffer.length < this._message_size) {
            return;
        }

        // Calls the callback.
        this._callback(this._buffer.slice(0, this._message_size));

        // Trims the buffer.
        if (this._buffer.length === this._message_size) {
            this._buffer = undefined;
        } else {
            this._buffer = this._buffer.slice(this._message_size);
        }
        
        // Resets the message size.
        this._message_size = undefined;
    }
}
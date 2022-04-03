import { UINT8_SIZE } from "../Types";

export class CharacterString {
    public constructor(public buffer: Buffer) {
        if (buffer.length > 255) {
            throw new Error('Buffer has a max length of 255 chars!');
        }
    }

    public encode(): Buffer {
        // Creates the result buffer.
        let result_buffer: Buffer = Buffer.allocUnsafe(this.buffer.length + UINT8_SIZE);
        let offset: number = 0;

        // Writes the length octet, and then the copy of the string.
        result_buffer.writeUint8(this.buffer.length, offset);
        offset += UINT8_SIZE;
        this.buffer.copy(result_buffer, offset, 0, this.buffer.length);
        offset += this.buffer.length;

        // Returns the result.
        return result_buffer;
    }

    public static fromString(raw: string, encoding: BufferEncoding = 'utf-8') {
        return new CharacterString(Buffer.from(raw, encoding));
    }
}
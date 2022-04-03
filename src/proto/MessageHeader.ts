import {
  MessageHeaderFlags,
  MessageHeaderOpcode,
  MessageHeaderResponseCode,
  MSG_HEADER_OPCODE_OFFSET,
  MSG_HEADER_RESPONSE_CODE_OFFSET,
  UINT16_SIZE,
} from "./Types";

export function msg_header_flags_to_string(flags: number): string {
  let arr: string[] = [];

  if (flags & MessageHeaderFlags.QR) {
    arr.push("Response");
  } else {
    arr.push("Question");
  }

  if (flags & MessageHeaderFlags.AA) {
    arr.push("Authorative Answer");
  }

  if (flags & MessageHeaderFlags.TC) {
    arr.push("Truncated");
  }

  if (flags & MessageHeaderFlags.RD) {
    arr.push("Recursion Desired");
  }

  if (flags & MessageHeaderFlags.RA) {
    arr.push("Recursion Available");
  }

  return arr.join(", ");
}

export class MessageHeader {
  public constructor(
    public readonly id: number,
    public flags: number,
    public qdcount: number,
    public ancount: number,
    public nscount: number,
    public arcount: number
  ) {}

  public set opcode(opcode: MessageHeaderOpcode) {
    this.flags &= ~(0xf << MSG_HEADER_OPCODE_OFFSET);
    this.flags |= opcode << MSG_HEADER_OPCODE_OFFSET;
  }

  public get opcode(): MessageHeaderOpcode {
    return (this.flags >> MSG_HEADER_OPCODE_OFFSET) & 0xf;
  }

  public set response_code(response_code: MessageHeaderResponseCode) {
    this.flags &= ~(0xf << MSG_HEADER_RESPONSE_CODE_OFFSET);
    this.flags |= response_code << MSG_HEADER_RESPONSE_CODE_OFFSET;
  }

  public get response_code(): MessageHeaderResponseCode {
    return (this.flags >> MSG_HEADER_RESPONSE_CODE_OFFSET) & 0xf;
  }

  public are_flags_set(mask: number): boolean {
    return (this.flags & mask) !== 0;
  }

  public are_flags_clear(mask: number): boolean {
    return (this.flags & mask) === 0;
  }

  public set_flags(mask: number): MessageHeader {
    this.flags |= mask;
    return this;
  }

  public clear_flags(mask: number): MessageHeader {
    this.flags &= ~mask;
    return this;
  }

  public clear_all_flags(): void {
    this.clear_flags(
      MessageHeaderFlags.AA |
        MessageHeaderFlags.QR |
        MessageHeaderFlags.RA |
        MessageHeaderFlags.RD |
        MessageHeaderFlags.TC
    );
  }

  public get readable_obj(): any {
    return {
      id: this.id,
      flags: {
        readable: msg_header_flags_to_string(this.flags),
        opcode: this.opcode,
        response_code: this.response_code,
      },
      qdcount: this.qdcount,
      ancount: this.ancount,
      nscount: this.nscount,
      arcount: this.arcount,
    };
  }

  public static decode(
    buffer: Buffer,
    offset: number = 0
  ): [number, MessageHeader] {
    const id: number = buffer.readUint16BE(offset);
    offset += UINT16_SIZE;
    const flags: number = buffer.readUint16BE(offset);
    offset += UINT16_SIZE;
    const qdcount: number = buffer.readUint16BE(offset);
    offset += UINT16_SIZE;
    const ancount: number = buffer.readUint16BE(offset);
    offset += UINT16_SIZE;
    const nscount: number = buffer.readUint16BE(offset);
    offset += UINT16_SIZE;
    const arcount: number = buffer.readUint16BE(offset);
    offset += UINT16_SIZE;

    const header: MessageHeader = new MessageHeader(
      id,
      flags,
      qdcount,
      ancount,
      nscount,
      arcount
    );

    return [offset, header];
  }

  public encode(): Buffer {
    let result: Buffer = Buffer.allocUnsafe(6 * UINT16_SIZE);
    let offset: number = 0;

    result.writeUint16BE(this.id, offset);
    offset += UINT16_SIZE;
    result.writeUint16BE(this.flags, offset);
    offset += UINT16_SIZE;
    result.writeUint16BE(this.qdcount, offset);
    offset += UINT16_SIZE;
    result.writeUint16BE(this.ancount, offset);
    offset += UINT16_SIZE;
    result.writeUint16BE(this.nscount, offset);
    offset += UINT16_SIZE;
    result.writeUint16BE(this.arcount, offset);
    offset += UINT16_SIZE;

    return result;
  }
}

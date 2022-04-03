/*
Copyright 2022 Luke A.C.A. Rieff

Permission is hereby granted, free of charge, to any person obtaining a
copy of this software and associated documentation files (the "Software"),
to deal in the Software without restriction, including without limitation
the rights to use, copy, modify, merge, publish, distribute, sublicense,
and/or sell copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { LabelSequence } from "./datatypes/LabelSequence";
import {DNSClass, QType, Type, UINT16_SIZE, UINT32_SIZE} from "./Types";
import { IPv4Address } from "llibipaddress";

/*
    0  1  2  3  4  5  6  7  8  9  0  1  2  3  4  5
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  |                                               |
  /                                               /
  /                      NAME                     /
  |                                               |
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  |                      TYPE                     |
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  |                     CLASS                     |
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  |                      TTL                      |
  |                                               |
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  |                   RDLENGTH                    |
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--|
  /                     RDATA                     /
  /                                               /
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
*/

export class RR {
  public constructor(
    public name: LabelSequence,
    public type: Type | QType,
    public class_: DNSClass,
    public ttl: number,
    public rdata: Buffer
  ) {}

  public static decode(buffer: Buffer, offset: number = 0): [number, RR] {
    // Gets the name.
    const [name_offset, name] = LabelSequence.decode(buffer, offset);
    offset = name_offset;

    // Gets the numbers.
    const type: number = buffer.readUint16BE(offset);
    offset += UINT16_SIZE;
    const class_: number = buffer.readUint16BE(offset);
    offset += UINT16_SIZE;
    const ttl: number = buffer.readUint16BE(offset);
    offset += UINT16_SIZE;

    // Gets the RData.
    const rdlength: number = buffer.readUint16BE(offset);
    offset += UINT16_SIZE;
    const rdata: Buffer = Buffer.allocUnsafe(rdlength);
    buffer.copy(rdata, 0, offset, offset + rdlength);
    offset += rdlength;

    // Creates the RR.
    const rr: RR = new RR(name, type, class_, ttl, rdata);

    // Returns the result.
    return [offset, rr];
  }

  public encode(): Buffer {
    // Calculates the size for the buffer.
    const buffer_size: number =
      this.name.uncompressed_size + // The uncompressed size of the name.
      UINT16_SIZE + // The type.
      UINT16_SIZE + // The class.
      UINT32_SIZE + // The TTL.
      UINT16_SIZE + // The RDLength.
      this.rdata.length; // The RDData.

    // Allocates the buffer.
    let buffer: Buffer = Buffer.allocUnsafe(buffer_size);
    let offset: number = 0;

    // Encodes the name field, to the length octets and labels sequence.
    const encoded_name: Buffer = this.name.encode();
    encoded_name.copy(buffer, offset, 0, encoded_name.length);
    offset += encoded_name.length;

    // Adds the type, class, TTL and RDLength fields.
    buffer.writeUint16BE(this.type, offset);
    offset += UINT16_SIZE;
    buffer.writeUint16BE(this.class_, offset);
    offset += UINT16_SIZE;
    buffer.writeUint32BE(this.ttl, offset);
    offset += UINT32_SIZE;
    buffer.writeUint16BE(this.rdata.length, offset);
    offset += UINT16_SIZE;

    // Adds the RDData field (we copy the data because of the getter).
    this.rdata.copy(buffer, offset, 0, this.rdata.length);
    offset += this.rdata.length;

    // Returns the buffer.
    return buffer;
  }
}

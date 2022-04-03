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

import {IPv4Address, IPv6Address} from "llibipaddress";
import { CharacterString } from "./datatypes/CharacterString";
import { LabelSequence } from "./datatypes/LabelSequence";
import { UINT16_SIZE, UINT32_SIZE } from "./Types";

///////////////////////////////////////////////////
// DNS ResourceRecordData Base
///////////////////////////////////////////////////

export class ResourceRecordData {
  public encode(): Buffer {
    throw new Error("Not implemented!");
  }
}

///////////////////////////////////////////////////
// DNS ResourceRecordData CNAME
///////////////////////////////////////////////////

/*
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  /                     CNAME                     /
  /                                               /
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
*/

export class CNAME_ResourceRecordData extends ResourceRecordData {
  public constructor(public cname: LabelSequence) {
    super();
  }

  public encode(): Buffer {
    return this.cname.encode();
  }
}

///////////////////////////////////////////////////
// DNS ResourceRecordData HINFO
///////////////////////////////////////////////////

/*
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  /                      CPU                      /
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  /                       OS                      /
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
*/

export class HINFO_ResourceRecordData extends ResourceRecordData {
  public constructor(public cpu: CharacterString, public os: CharacterString) {
    super();
  }

  public encode(): Buffer {
    return Buffer.concat([this.cpu.encode(), this.os.encode()]);
  }
}

///////////////////////////////////////////////////
// DNS ResourceRecordData MX
///////////////////////////////////////////////////

/*
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  |                  PREFERENCE                   |
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  /                   EXCHANGE                    /
  /                                               /
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
*/

export class MX_ResourceRecordData extends ResourceRecordData {
  public constructor(
    public preference: number,
    public exchange: LabelSequence
  ) {
    super();
  }

  public encode(): Buffer {
    // Calculates the result buffer size, and then allocates it.
    const buffer_size: number = UINT16_SIZE + this.exchange.uncompressed_size;
    let buffer: Buffer = Buffer.allocUnsafe(buffer_size);
    let offset: number = 0;

    // Writes the preference.
    buffer.writeUint16BE(this.preference, offset);
    offset += UINT16_SIZE;

    // Writes the encoded exchange.
    const encoded_exchange: Buffer = this.exchange.encode();
    encoded_exchange.copy(buffer, offset, 0, encoded_exchange.length);
    offset += encoded_exchange.length;

    // Returns the result.
    return buffer;
  }
}

///////////////////////////////////////////////////
// DNS ResourceRecordData NS
///////////////////////////////////////////////////

/*
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  /                   NSDNAME                     /
  /                                               /
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
*/

export class NS_ResourceRecordData extends ResourceRecordData {
  public constructor(public nsdname: LabelSequence) {
    super();
  }

  public encode(): Buffer {
    return this.nsdname.encode();
  }
}

///////////////////////////////////////////////////
// DNS ResourceRecordData PTR
///////////////////////////////////////////////////

/*
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  /                   PTRDNAME                    /
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
*/

export class PTR_ResourceRecordData extends ResourceRecordData {
  public constructor(public ptrdname: LabelSequence) {
    super();
  }

  public encode(): Buffer {
    return this.ptrdname.encode();
  }
}

///////////////////////////////////////////////////
// SOA ResourceRecordData PTR
///////////////////////////////////////////////////

/*
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  /                     MNAME                     /
  /                                               /
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  /                     RNAME                     /
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  |                    SERIAL                     |
  |                                               |
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  |                    REFRESH                    |
  |                                               |
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  |                     RETRY                     |
  |                                               |
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  |                    EXPIRE                     |
  |                                               |
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  |                    MINIMUM                    |
  |                                               |
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
*/

export class SOA_ResourceRecordData extends ResourceRecordData {
  public constructor(
    public m_name: LabelSequence,
    public r_name: LabelSequence,
    public serial: number,
    public refresh: number,
    public retry: number,
    public expire: number,
    public minimum: number
  ) {
    super();
  }

  public encode(): Buffer {
    // Calculates the size for the buffer and allocates it.
    const buffer_size: number =
      this.m_name.uncompressed_size +
      this.r_name.uncompressed_size +
      UINT32_SIZE +
      UINT32_SIZE +
      UINT32_SIZE +
      UINT32_SIZE +
      UINT32_SIZE;
    let buffer: Buffer = Buffer.allocUnsafe(buffer_size);
    let offset: number = 0;

    // Writes the mname and rname.
    const mname_encoded: Buffer = this.m_name.encode();
    const rname_encoded: Buffer = this.r_name.encode();
    mname_encoded.copy(buffer, offset, 0, mname_encoded.length);
    offset += mname_encoded.length;
    rname_encoded.copy(buffer, offset, 0, rname_encoded.length);
    offset += rname_encoded.length;

    // Writes the other 32-bit ints.
    buffer.writeUint32BE(this.serial, offset);
    offset += UINT32_SIZE;
    buffer.writeUint32BE(this.refresh, offset);
    offset += UINT32_SIZE;
    buffer.writeUint32BE(this.retry, offset);
    offset += UINT32_SIZE;
    buffer.writeUint32BE(this.expire, offset);
    offset += UINT32_SIZE;
    buffer.writeUint32BE(this.minimum, offset);
    offset += UINT32_SIZE;

    // Returns the result.
    return buffer;
  }
}

///////////////////////////////////////////////////
// DNS ResourceRecordData TXT
///////////////////////////////////////////////////

/*
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  /                   TXT-DATA                    /
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
*/

export class TXT_ResourceRecordData extends ResourceRecordData {
  public constructor(public txt_data: CharacterString[]) {
    super();
  }

  public encode(): Buffer {
    return Buffer.concat(this.txt_data.map((data: CharacterString) => data.encode()));
  }
}

///////////////////////////////////////////////////
// DNS ResourceRecordData A
///////////////////////////////////////////////////

/*
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  |                    ADDRESS                    |
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
*/

export class A_ResourceRecordData extends ResourceRecordData {
  public constructor(public address: IPv4Address) {
    super();
  }

  public encode(): Buffer {
    return this.address.buffer;
  }
}

///////////////////////////////////////////////////
// DNS ResourceRecordData AAAA
///////////////////////////////////////////////////

/*
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
  |                    ADDRESS                    |
  +--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+--+
*/

export class AAAA_ResourceRecordData extends ResourceRecordData {
  public constructor(public address: IPv6Address) {
    super();
  }

  public encode(): Buffer {
    return this.address.buffer;
  }
}
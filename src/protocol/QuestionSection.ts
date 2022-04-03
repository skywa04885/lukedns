import { LabelSequence } from "./datatypes/LabelSequence";
import {DNSClass, DNSQClass, QType, Type, UINT16_SIZE} from "./Types";

export class QuestionSection {
    public constructor(
        public qname: LabelSequence,
        public qtype: Type | QType,
        public qclass: DNSClass | DNSQClass
    ) { }

    public static decode(buffer: Buffer, offset: number = 0): [number, QuestionSection] {
        const [qname_offset, qname] = LabelSequence.decode(buffer, offset);
        offset = qname_offset;
        const qtype: Type = buffer.readUint16BE(offset)
        offset += UINT16_SIZE;
        const qclass: DNSClass | DNSQClass = buffer.readUint16BE(offset);
        offset += UINT16_SIZE;

        const question_section: QuestionSection = new QuestionSection(qname, qtype, qclass);

        return [offset, question_section];
    }

    public encode(): Buffer {
        // Calculates the buffer size, and allocates it.
        const buffer_size: number = this.qname.uncompressed_size +
            UINT16_SIZE
            +UINT16_SIZE;
        let buffer: Buffer = Buffer.allocUnsafe(buffer_size);
        let offset: number = 0;

        // Add the qname.
        const qname_encoded: Buffer = this.qname.encode();
        qname_encoded.copy(buffer, offset, 0, qname_encoded.length);
        offset += qname_encoded.length;

        // Adds the other fields.
        buffer.writeUint16BE(this.qtype, offset);
        offset += UINT16_SIZE;
        buffer.writeUint16BE(this.qclass, offset);
        offset += UINT16_SIZE;

        // Returns the response.
        return buffer;
    }
}

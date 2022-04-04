import { MessageHeader } from "./MessageHeader";
import { QuestionSection } from "./QuestionSection";
import { RR } from "./ResourceRecord";
import { UINT16_SIZE } from "./Types";

export class Message {
  public constructor(
    public header: MessageHeader,
    public question: QuestionSection | undefined,
    public answer_rrs: RR[],
    public authority_rrs: RR[],
    public aditional_rrs: RR[],
    public created_at: Date = new Date()
  ) {}

  public clear_questions(): void {
    this.question = undefined;
    this.header.qdcount = 0;
  }

  public clear_answers(): void {
    this.answer_rrs = [];
    this.header.ancount = 0;
  }

  public clear_authority(): void {
    this.authority_rrs = [];
    this.header.nscount = 0;
  }

  public push_authority(rr: RR): void {
    this.authority_rrs.push(rr);
    ++this.header.nscount;
  }

  public clear_aditional(): void {
    this.aditional_rrs = [];
    this.header.arcount = 0;
  }

  public push_answer(rr: RR): void {
    this.answer_rrs.push(rr);
    ++this.header.ancount;
  }

  public encode(length_suffix: boolean = false): Buffer {
    let arr: Buffer[] = [];

    arr.push(this.header.encode());

    if (this.question) {
      arr.push(this.question.encode());
    }

    arr.push(...this.answer_rrs.map((answer: RR) => answer.encode()));
    arr.push(...this.authority_rrs.map((answer: RR) => answer.encode()));
    arr.push(...this.aditional_rrs.map((answer: RR) => answer.encode()));

    let buffer: Buffer = Buffer.concat(arr);

    if (length_suffix) {
      let temp_buffer: Buffer = Buffer.allocUnsafe(buffer.length + UINT16_SIZE);
      let temp_buffer_offset: number = 0;

      temp_buffer.writeUint16BE(buffer.length, temp_buffer_offset);
      temp_buffer_offset += UINT16_SIZE;

      buffer.copy(temp_buffer, temp_buffer_offset, 0, buffer.length);
      buffer = temp_buffer;
    }

    return buffer;
  }

  public static decode(buffer: Buffer, offset: number = 0): [number, Message] {
    const [header_offset, header] = MessageHeader.decode(buffer, offset);
    offset = header_offset;

    // Parses the questions.
    let question: QuestionSection | undefined;
    if (header.qdcount === 1) {
      // Parses the question.
      const [question_offset, _question] = QuestionSection.decode(
        buffer,
        offset
      );
      offset = question_offset;

      // Sets the question.
      question = _question;
    }

    // Parses the answer RR's.
    let answer_rrs: RR[] = [];
    for (let i: number = 0; i < header.ancount; ++i) {
      // Parses the RR.
      const [rr_offset, rr] = RR.decode(buffer, offset);
      offset += rr_offset;

      // Pushes the rr.
      answer_rrs.push(rr);
    }

    // Parses the authority pointing RR's.
    let authority_rrs: RR[] = [];
    for (let i: number = 0; i < header.nscount; ++i) {
      // Parses the RR.
      const [rr_offset, rr] = RR.decode(buffer, offset);
      offset += rr_offset;

      // Pushes the rr.
      authority_rrs.push(rr);
    }

    // Parses the aditional information holding RR's.
    let aditional_rrs: RR[] = [];
    for (let i: number = 0; i < header.arcount; ++i) {
      // Parses the RR.
      const [rr_offset, rr] = RR.decode(buffer, offset);
      offset += rr_offset;

      // Pushes the rr.
      aditional_rrs.push(rr);
    }

    // Creates the result message, and returns it.
    const message: Message = new Message(
      header,
      question,
      answer_rrs,
      authority_rrs,
      aditional_rrs
    );
    return [offset, message];
  }
}

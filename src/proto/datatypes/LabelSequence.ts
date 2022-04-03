import { UINT8_SIZE } from "../Types";

export class LabelSequence {
  /**
   * Creates a new label sequence.
   * @param labels the labels.
   */
  public constructor(public labels: string[]) {}

  /**
   * Creates a label sequence from the given labels.
   * @param labels the labels.
   */
  public static from(labels: string[] | string): LabelSequence {
    if (typeof labels === 'string') {
      labels = labels.split('.');
    }

    return new LabelSequence(labels.map((label: string): string => label.toLowerCase()));
  }

  /**
   * Gets the joined labels.
   */
  public get joined(): string {
    return this.labels.join('.');
  }

  /**
   * Gets the uncompressed size of the label sequence.
   */
  public get uncompressed_size(): number {
    // Adds the content lengths.
    let size: number = 0;
    for (const label of this.labels) {
      size += label.length;
    }

    // Adds all the length octets.
    size += this.labels.length;

    // Adds the final zero length octet.
    size += 1;

    // Returns the result.
    return size;
  }

  /**
   * Encodes the current label sequence.
   */
  public encode(): Buffer {
    // Calculates the buffer size and allocates it.
    const buffer_size: number = this.uncompressed_size;
    let buffer: Buffer = Buffer.allocUnsafe(buffer_size);
    let offset: number = 0;
    
    // Adds the labels.
    for (const label of this.labels) {
      // Writes the length octet.
      buffer.writeUint8(label.length, offset);
      offset += UINT8_SIZE;

      // Writes the label.
      buffer.write(label, offset);
      offset += label.length;
    }

    // Adds the zero length octet.
    buffer.writeUint8(0, offset);
    offset += UINT8_SIZE;
    
    // Returns the result.
    return buffer;
  }

  /**
   * Decodes an label sequence.
   * @param buffer the buffer.
   * @param offset the offset.
   */
  public static decode(
    buffer: Buffer,
    offset: number = 0
  ): [number, LabelSequence] {
    let labels: string[] = [];

    while (true) {
      // Reads the length octet (or a pointer).
      const length_octet: number = buffer.readUint8(offset);
      offset += UINT8_SIZE;

      // If the length octet is zero, we've reached the
      //  end of the label sequence.
      if (length_octet === 0) {
        break;
      }

      // Reads the label.
      labels.push(buffer.toString("utf-8", offset, offset + length_octet));

      // Increments the offset.
      offset += length_octet;
    }

    const dns_label_sequence: LabelSequence = new LabelSequence(labels);

    return [offset, dns_label_sequence];
  }

  /**
   * Checks if the current label seqeuence equals the other label sequence.
   * @param other the other label sequence.
   */
  public equals(other: LabelSequence): boolean {
    if (other.labels.length !== this.labels.length) {
      return false;
    }

    for (let i: number = 0; i < this.labels.length; ++i) {
      if (this.labels[i] !== other.labels[i]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Checks if the label sequence ends with the given label.
   * @param label the label.
   */
  public ends_with(label: string) {
    return this.labels.at(this.labels.length - 1) === label;
  }

  /**
   * Gets the label at the given index.
   * @param index the index.
   */
  public at(index: number): string {
    return this.labels[index];
  }

  /**
   * The reverse at operator.
   * @param index the index from the end.
   */
  public at_rev(index: number): string {
    return this.labels[this.labels.length - index - 1];
  }

  /**
   * The reverse generator.
   */
  public *reverse_generator(): Generator<string> {
    for (let i: number = this.labels.length - 1; i >= 0; --i) {
      yield this.labels[i];
    }
  }
}

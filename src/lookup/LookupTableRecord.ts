import { DNSClass, QType, rr_type_to_string, Type } from "../protocol/Types";
import { ResourceRecordData } from "../protocol/ResourceRecordData";
import { RR } from "../protocol/ResourceRecord";
import { LabelSequence } from "../protocol/datatypes/LabelSequence";

export class LookupTableRecord {
  public constructor(
    public type: QType | Type,
    public cls: DNSClass,
    public labels: LabelSequence,
    public ttl: number
  ) {}

  public get rdata(): ResourceRecordData {
    throw new Error("Not implemented!");
  }

  public get rr(): RR {
    return new RR(
      this.labels,
      this.type,
      this.cls,
      this.ttl,
      this.rdata.encode()
    );
  }
}

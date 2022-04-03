import { LookupTableRecord } from "./LookupTableRecord";
import { DNSClass, Type } from "../protocol/Types";
import {
  ResourceRecordData,
  SOA_ResourceRecordData,
} from "../protocol/ResourceRecordData";
import { LabelSequence } from "../protocol/datatypes/LabelSequence";

export class LookupTableSOARecord extends LookupTableRecord {
  public constructor(
    cls: DNSClass,
    labels: LabelSequence,
    ttl: number,
    public nameserver: LabelSequence,
    public administrator: LabelSequence,
    public serial: number,
    public refresh: number,
    public retry: number,
    public expire: number,
    public minimum: number
  ) {
    super(Type.SOA, cls, labels, ttl);
  }

  /**
   * Gets the ResourceRecordData.
   */
  public get rdata(): ResourceRecordData {
    return new SOA_ResourceRecordData(
      this.nameserver,
      this.administrator,
      this.serial,
      this.refresh,
      this.retry,
      this.expire,
      this.minimum
    );
  }
}

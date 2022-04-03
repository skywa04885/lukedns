import {DNSClass, RRType} from "../proto/Types";
import { LabelSequence } from "../proto/datatypes/LabelSequence";
import { LookupTableRecord } from "./LookupTableRecord";

export class LookupTableZone {
  public constructor(
    public readonly origin: LabelSequence,
    public records: LookupTableRecord[]
  ) {}

  /**
   * Matches all the records with the given parameters.
   * @param labels the labels.
   * @param type the type.
   */
  public match_records(labels: LabelSequence, type: RRType): LookupTableRecord[] {
    return this.records.filter((record: LookupTableRecord): boolean => {
      return record.labels.equals(labels) && record.type === type;
    });
  }
}

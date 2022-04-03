import {QType, Type} from "../protocol/Types";
import {LabelSequence} from "../protocol/datatypes/LabelSequence";
import {LookupTableRecord} from "./LookupTableRecord";
import {LookupTableSOARecord} from "./LookupTableSOARecord";
import {LookupTableTXTRecord} from "./LookupTableTXTRecord";
import {LookupTableARecord} from "./LookupTableARecord";
import {LookupTableCNAMERecord} from "./LookupTableCNAMERecord";
import {LookupTableHINFORecord} from "./LookupTableHINFORecord";
import {LookupTableMXRecord} from "./LookupTableMXRecord";
import {LookupTableNSRecord} from "./LookupTableNSRecord";
import {LookupTablePTRRecord} from "./LookupTablePTRRecord";
import {LookupTableAAAARecord} from "./LookupTableAAAARecord";

export interface LookupTableZoneRecords {
  // Common records, with multiple occurrences.
  a: LookupTableARecord[];
  aaaa: LookupTableAAAARecord[],
  cname: LookupTableCNAMERecord[];
  h_info: LookupTableHINFORecord[];
  mx: LookupTableMXRecord[];
  ns: LookupTableNSRecord[];
  ptr: LookupTablePTRRecord[];
  txt: LookupTableTXTRecord[];
  // Uncommon records, with single occurrences.
  soa: LookupTableSOARecord[];
}

export class LookupTableZone {
  public constructor(
    public readonly origin: LabelSequence,
    public records: LookupTableZoneRecords
  ) {}

  public records_of_type(type: Type | QType): LookupTableRecord[] {
    switch (type) {
      case Type.A:
        return this.records.a;
      case Type.AAAA:
        return this.records.aaaa;
      case Type.CNAME:
        return this.records.cname;
      case Type.HINFO:
        return this.records.h_info;
      case Type.MX:
        return this.records.mx;
      case Type.NS:
        return this.records.ns;
      case Type.PTR:
        return this.records.ptr;
      case Type.TXT:
        return this.records.txt;
      case Type.SOA:
        return this.records.soa;
      default:
        return [];
    }
  }

  /**
   * Matches all the records with the given parameters.
   * @param labels the labels.
   * @param type the type.
   */
  public match_records(labels: LabelSequence, type: Type | QType): LookupTableRecord[] {
    return this.records_of_type(type).filter((record: LookupTableRecord): boolean => {
      return record.labels.equals(labels);
    });
  }
}

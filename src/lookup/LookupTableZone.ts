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
    public readonly _origin: LabelSequence,
    public _records: LookupTableZoneRecords
  ) {}

  public get origin(): LabelSequence {
    return this._origin;
  }

  public get soa(): LookupTableSOARecord[] {
    return this._records.soa;
  }

  public get records(): LookupTableRecord[] {
    return [
      ...this._records.a,
      ...this._records.aaaa,
      ...this._records.cname,
      ...this._records.h_info,
      ...this._records.mx,
      ...this._records.ns,
      ...this._records.ptr,
      ...this._records.txt,
      ...this._records.soa,
    ];
  }

  public records_of_type(type: Type | QType): LookupTableRecord[] {
    switch (type) {
      case Type.A:
        return this._records.a;
      case Type.AAAA:
        return this._records.aaaa;
      case Type.CNAME:
        return this._records.cname;
      case Type.HINFO:
        return this._records.h_info;
      case Type.MX:
        return this._records.mx;
      case Type.NS:
        return this._records.ns;
      case Type.PTR:
        return this._records.ptr;
      case Type.TXT:
        return this._records.txt;
      case Type.SOA:
        return this._records.soa;
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

import fs from "fs";
import yaml from "js-yaml";
import {IConfigRoot} from "./Config";
import {LookupTableZone} from "../lookup/LookupTableZone";
import {LookupTableARecord} from "../lookup/LookupTableARecord";
import {LookupTableRecord} from "../lookup/LookupTableRecord";
import {LabelSequence} from "../proto/datatypes/LabelSequence";
import {IPv4Address} from "llibipaddress";
import {LookupTableMXRecord} from "../lookup/LookupTableMXRecord";
import {LookupTableTXTRecord} from "../lookup/LookupTableTXTRecord";
import {CharacterString} from "../proto/datatypes/CharacterString";
import {LookupTableNSRecord} from "../lookup/LookupTableNSRecord";
import {LookupTablePTRRecord} from "../lookup/LookupTablePTRRecord";
import {LookupTableCNAMERecord} from "../lookup/LookupTableCNAMERecord";

export enum EConfigRecordClass {
  IN = 'IN',
}

export enum EConfigRecordType {
  A = 'A',
  AAAA = 'AAAA',
  MX = 'MX',
  NS = 'NS',
  PTR = 'PTR',
  CNAME = 'CNAME',
  TXT = 'TXT',
  SOA = 'SOA',
}

export interface IConfigZoneDefaults {
  ttl: number;
  class: EConfigRecordClass;
}

export interface IConfigZone {
  origin: string;
  defaults: IConfigZoneDefaults;
  records: IConfigZoneRecord[];
}

export interface IConfigZoneRecord {
  name: string;
  type: EConfigRecordType;
  class?: EConfigRecordClass;
  ttl?: number;
}

export interface IConfigZoneRecordMX extends IConfigZoneRecord {
  preference: number;
  exchange: string;
}

export interface IConfigZoneRecordA extends IConfigZoneRecord {
  address: string
}

export interface IConfigZoneRecordAAAA extends IConfigZoneRecord {
  address: string
}

export interface IConfigZoneRecordTXT extends IConfigZoneRecord {
  texts: string[];
}

export interface IConfigZoneRecordNS extends IConfigZoneRecord {
  ns: string
}

export interface IConfigZoneRecordPTR extends IConfigZoneRecord {
  ptr: string
}

export interface IConfigZoneRecordCNAME extends IConfigZoneRecord {
  cname: string
}

export interface IConfigZoneRecordSOA extends IConfigZoneRecord {
  nameserver: string;
  administrator: string;
  refresh: number;
  retry: number;
  expire: number;
}

export class ConfigZone {
  public readonly origin: string;
  public readonly defaults: IConfigZoneDefaults;
  public readonly records: IConfigZoneRecord[];

  public constructor(zone_file: string) {
    const zone_file_contents: string = fs.readFileSync(zone_file, {
      encoding: 'utf-8'
    });

    const yaml_contents: IConfigZone = yaml.load(zone_file_contents) as IConfigZone;

    this.origin = yaml_contents.origin;
    this.defaults = yaml_contents.defaults;
    this.records = yaml_contents.records;
  }

  protected parse_name(name?: string): LabelSequence {
    // If empty, we're dealing with the origin.
    if (!name) {
      return LabelSequence.from(this.origin);
    }

    // If the name doesn't end with a '.' we're dealing with a full
    //  domain and not a subdomain, just parse and return.
    if (!name.endsWith('.')) {
      return LabelSequence.from(name);
    }

    // Returns the name with the origin after.
    return LabelSequence.from(`${name}${this.origin}`);
  }

  protected parse_record_a(record: IConfigZoneRecordA): LookupTableRecord {
    return new LookupTableARecord(
      this.parse_name(record.name),
      record.ttl ?? this.defaults.ttl,
      IPv4Address.decode(record.address)
    );
  }

  protected parse_record_txt(record: IConfigZoneRecordTXT): LookupTableRecord {
    return new LookupTableTXTRecord(
      this.parse_name(record.name),
      record.ttl ?? this.defaults.ttl,
      record.texts.map((text: string) => CharacterString.fromString(text))
    );
  }

  protected parse_record_ns(record: IConfigZoneRecordNS): LookupTableRecord {
    return new LookupTableNSRecord(
      this.parse_name(record.name),
      record.ttl ?? this.defaults.ttl,
      this.parse_name(record.ns),
    );
  }

  protected parse_record_ptr(record: IConfigZoneRecordPTR): LookupTableRecord {
    return new LookupTablePTRRecord(
      this.parse_name(record.name),
      record.ttl ?? this.defaults.ttl,
      this.parse_name(record.ptr),
    );
  }

  protected parse_record_cname(record: IConfigZoneRecordCNAME): LookupTableRecord {
    return new LookupTableCNAMERecord(
      LabelSequence.from(record.name ?? this.origin),
      record.ttl ?? this.defaults.ttl,
      this.parse_name(record.cname),
    );
  }

  protected parse_record_mx(record: IConfigZoneRecordMX): LookupTableRecord {
    return new LookupTableMXRecord(
      this.parse_name(record.name), record.ttl ?? this.defaults.ttl,
      this.parse_name(record.exchange),
      record.preference
    );
  }

  public parse_record(record: IConfigZoneRecord): LookupTableRecord {
    switch (record.type) {
      case EConfigRecordType.A:
        return this.parse_record_a(record as IConfigZoneRecordA);
      case EConfigRecordType.MX:
        return this.parse_record_mx(record as IConfigZoneRecordMX);
      case EConfigRecordType.NS:
        return this.parse_record_ns(record as IConfigZoneRecordNS);
      case EConfigRecordType.CNAME:
        return this.parse_record_cname(record as IConfigZoneRecordCNAME);
      case EConfigRecordType.PTR:
        return this.parse_record_ptr(record as IConfigZoneRecordPTR);
      case EConfigRecordType.TXT:
        return this.parse_record_txt(record as IConfigZoneRecordTXT);
      default:
        throw new Error(`Record type '${record.type}' is not implemented!`);
    }
  }

  public parse_zone(): LookupTableZone {
    const records: LookupTableRecord[] = this.records.map((record: IConfigZoneRecord): LookupTableRecord => {
      return this.parse_record(record);
    });

    const origin: LabelSequence = LabelSequence.from(this.origin);

    return new LookupTableZone(origin, records);
  }
}
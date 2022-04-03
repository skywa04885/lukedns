import yaml from "js-yaml";
import path from "path";
import fs from "fs";
import { IPv4Address } from "llibipaddress";
import {
  LookupTableARecord,
  LookupTableCNAMERecord,
  LookupTableMXRecord,
  LookupTableNSRecord,
  LookupTablePTRRecord,
  LookupTableRecord,
  LookupTableTXTRecord,
  prepare_labels,
} from "./LookupTable";

/**
 * Decodes the raw time string to seconds.
 * @param raw the raw time with a unit assigned.
 * @return the number of seconds.
 */
function time_decode(raw: string): number {
  // Matches the TTL string.
  const match: RegExpMatchArray | undefined =
    raw.match(/^(?<time>[0-9]+)(?<unit>(s|m|h|d|m|y))$/) ?? undefined;
  if (!match) {
    throw new Error(`Invalid TTL value ${raw}`);
  }

  // Gets the raw time and the unit.
  let time: number = parseInt(match.groups!.time!);
  const unit: string = match.groups!.unit!;

  // Performs the conversion.
  switch (unit) {
    case "s":
      break;
    case "m":
      time *= 60;
      break;
    case "h":
      time *= 60 * 60;
      break;
    case "d":
      time *= 60 * 60 * 24;
      break;
    case "m":
      time *= 60 * 60 * 24 * 31;
      break;
    case "y":
      time *= 60 * 60 * 24 * 31 * 12;
      break;
    default:
      break;
  }

  // Returns the result.
  return time;
}

export enum EYamlRecordType {
  MX = "MX",
  A = "A",
  TXT = "TXT",
  AAAA = "AAAA",
  NS = "NS",
  CNAME = "CNAME",
  PTR = "PTR",
}

export interface IYamlRecordBase {
  name: string;
  type: EYamlRecordType;
  ttl: string;
}

export interface IYamlARecord {
  address: string;
}

export interface IYamlTXTRecord {
  txts: string[];
}

export interface IYamlMXRecord {
  exchange: string;
  preference: number;
}

export interface IYamlNSRecord {
  ns: string;
}

export interface IYamlPTRRecord {
  ptr: string;
}

export interface IYamlCNAMERecord {
  cname: string;
}

export interface IYamlRoot {
  records: IYamlRecordBase[];
}

function yaml_parse_a_record(
  record: IYamlARecord & IYamlRecordBase
): LookupTableRecord {
  return new LookupTableARecord(
    prepare_labels(record.name),
    time_decode(record.ttl),
    IPv4Address.decode(record.address)
  );
}

function yaml_parse_txt_record(
  record: IYamlTXTRecord & IYamlRecordBase
): LookupTableRecord {
  return new LookupTableTXTRecord(
    prepare_labels(record.name),
    time_decode(record.ttl),
    record.txts
  );
}

function yaml_parse_mx_record(
  record: IYamlMXRecord & IYamlRecordBase
): LookupTableRecord {
  return new LookupTableMXRecord(
    prepare_labels(record.name),
    time_decode(record.ttl),
    prepare_labels(record.exchange),
    record.preference
  )
}

function yaml_parse_ns_record(
  record: IYamlNSRecord & IYamlRecordBase
): LookupTableRecord {
  return new LookupTableNSRecord(
    prepare_labels(record.name),
    time_decode(record.ttl),
    prepare_labels(record.ns)
  );
}

function yaml_parse_ptr_record(record: IYamlPTRRecord & IYamlRecordBase): LookupTableRecord {
  return new LookupTablePTRRecord(
    prepare_labels(record.name),
    time_decode(record.ttl),
    prepare_labels(record.ptr)
  );
}

function yaml_parse_cname_record(record: IYamlCNAMERecord & IYamlRecordBase): LookupTableRecord {
  return new LookupTableCNAMERecord(
    prepare_labels(record.name),
    time_decode(record.ttl),
    prepare_labels(record.cname)
  );
}

export function zone_get_records(zone_path?: string) {
  if (!zone_path) {
    zone_path = path.join(process.cwd(), "fannst.yaml");
  }

  // Gets the zone file contents.
  const zone_file_contents: string = fs.readFileSync(zone_path, {
    encoding: "utf-8",
  });

  // Parses the YAML file.
  const zone_file_yaml: IYamlRoot = yaml.load(zone_file_contents) as IYamlRoot;

  // Parses the records.
  let records: LookupTableRecord[] = [];
  zone_file_yaml.records.forEach((record: any) => {
    switch (record.type) {
      case EYamlRecordType.A:
        records.push(yaml_parse_a_record(record));
        break;
      case EYamlRecordType.TXT:
        records.push(yaml_parse_txt_record(record));
        break;
      case EYamlRecordType.MX:
        records.push(yaml_parse_mx_record(record));
        break;
      case EYamlRecordType.NS:
        records.push(yaml_parse_ns_record(record));
        break;
      case EYamlRecordType.PTR:
        record.push(yaml_parse_ptr_record(record));
        break;
      case EYamlRecordType.CNAME:
        record.push(yaml_parse_cname_record(record));
        break;
    }
  });

  // Returns the records.
  return records;
}

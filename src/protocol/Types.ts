export const UINT8_SIZE: number = 1;
export const UINT16_SIZE: number = 2;
export const UINT32_SIZE: number = 4;
export const UINT64_SIZE: number = 8;

///////////////////////////
// DNS Resource Record
///////////////////////////

export enum Type {
  A = 1,
  AAAA = 28,
  NS = 2,
  CNAME = 5,
  SOA = 6,
  NULL = 10,
  WKS = 11,
  PTR = 12,
  HINFO = 13,
  MX = 15,
  TXT = 16,
}

export enum QType {
  AXFR = 252
}

export function class_to_string(cls: DNSClass) {
  switch (cls) {
    case DNSClass.CH:
      return 'CH';
    case DNSClass.IN:
      return 'IN';
    case DNSClass.CS:
      return 'CS';
    case DNSClass.HS:
      return 'HS';
    default:
      throw new Error(`Invalid dns class: '${cls}'`);
  }
}

export function type_to_string(type: Type) {
  switch (type) {
    case Type.A: return 'A';
    case Type.CNAME: return 'CNAME';
    case Type.SOA: return 'SOA';
    case Type.NULL: return 'NULL';
    case Type.WKS: return 'WKS';
    case Type.PTR: return 'PTR';
    case Type.HINFO: return 'HINFO';
    case Type.MX: return 'MX';
    case Type.TXT: return 'TXT';
    case Type.AAAA: return 'AAAA';
    default:
      throw new Error(`Invalid type: '${type}'`);
  }
}

///////////////////////////
// DNS Class / QClass
///////////////////////////

export enum DNSClass {
    IN = 1,
    CS = 2,
    CH = 3,
    HS = 4
}

export enum DNSQClass {};

///////////////////////////
// DNS Header
///////////////////////////

export enum MessageHeaderFlags {
  QR = 1 << 15,
  AA = 1 << 10,
  TC = 1 << 9,
  RD = 1 << 8,
  RA = 1 << 7,
}

export const MSG_HEADER_OPCODE_OFFSET: number = 10;
export enum MessageHeaderOpcode {
  QUERY = 0,
  IQUERY = 1,
  STATUS = 3,
}

export const MSG_HEADER_RESPONSE_CODE_OFFSET: number = 0;
export enum MessageHeaderResponseCode {
  NoError = 0,
  FormatError = 1,
  ServerFailure = 2,
  NameError = 3,
  NotImplemented = 4,
  Refused = 5,
}

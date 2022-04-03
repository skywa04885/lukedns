export const UINT8_SIZE: number = 1;
export const UINT16_SIZE: number = 2;
export const UINT32_SIZE: number = 4;
export const UINT64_SIZE: number = 8;

///////////////////////////
// DNS Resource Record
///////////////////////////

export enum RRType {
  A = 1,
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

export function rr_type_to_string(rrtype: RRType) {
  switch (rrtype) {
    case RRType.A: return 'A';
    case RRType.CNAME: return 'CNAME';
    case RRType.SOA: return 'SOA';
    case RRType.NULL: return 'NULL';
    case RRType.WKS: return 'WKS';
    case RRType.PTR: return 'PTR';
    case RRType.HINFO: return 'HINFO';
    case RRType.MX: return 'MX';
    case RRType.TXT: return 'TXT';
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

import {LookupTableRecord} from "./LookupTableRecord";
import {IPv6Address} from "llibipaddress";
import {DNSClass, Type} from "../protocol/Types";
import {AAAA_ResourceRecordData, ResourceRecordData} from "../protocol/ResourceRecordData";
import {LabelSequence} from "../protocol/datatypes/LabelSequence";

export class LookupTableAAAARecord extends LookupTableRecord {
    public constructor(
        cls: DNSClass,
        labels: LabelSequence,
        ttl_s: number,
        public address: IPv6Address
    ) {
        super(Type.AAAA, cls, labels, ttl_s);
    }

    public get rdata(): ResourceRecordData{
        return new AAAA_ResourceRecordData(this.address);
    }
}

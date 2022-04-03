import {LookupTableRecord} from "./LookupTableRecord";
import {DNSClass, RRType} from "../proto/Types";
import {NS_ResourceRecordData, ResourceRecordData} from "../proto/ResourceRecordData";
import {LabelSequence} from "../proto/datatypes/LabelSequence";

export class LookupTableNSRecord extends LookupTableRecord {
    public constructor(
        labels: LabelSequence,
        ttl_s: number,
        public ns: LabelSequence
    ) {
        super(RRType.NS, DNSClass.IN, labels, ttl_s);
    }

    public get rdata(): ResourceRecordData{
        return new NS_ResourceRecordData(this.ns);
    }
}

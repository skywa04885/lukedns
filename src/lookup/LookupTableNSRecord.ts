import {LookupTableRecord} from "./LookupTableRecord";
import {DNSClass, Type} from "../protocol/Types";
import {NS_ResourceRecordData, ResourceRecordData} from "../protocol/ResourceRecordData";
import {LabelSequence} from "../protocol/datatypes/LabelSequence";

export class LookupTableNSRecord extends LookupTableRecord {
    public constructor(
        labels: LabelSequence,
        ttl_s: number,
        public ns: LabelSequence
    ) {
        super(Type.NS, DNSClass.IN, labels, ttl_s);
    }

    public get rdata(): ResourceRecordData{
        return new NS_ResourceRecordData(this.ns);
    }
}

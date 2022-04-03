import {LookupTableRecord} from "./LookupTableRecord";
import {DNSClass, RRType} from "../proto/Types";
import {CNAME_ResourceRecordData, ResourceRecordData} from "../proto/ResourceRecordData";
import {LabelSequence} from "../proto/datatypes/LabelSequence";

export class LookupTableCNAMERecord extends LookupTableRecord {
    public constructor(
        labels: LabelSequence,
        ttl_s: number,
        public cname: LabelSequence
    ) {
        super(RRType.CNAME, DNSClass.IN, labels, ttl_s);
    }

    public get rdata(): ResourceRecordData{
        return new CNAME_ResourceRecordData(this.cname);
    }
}

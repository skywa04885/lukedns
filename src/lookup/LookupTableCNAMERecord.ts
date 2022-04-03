import {LookupTableRecord} from "./LookupTableRecord";
import {DNSClass, Type} from "../protocol/Types";
import {CNAME_ResourceRecordData, ResourceRecordData} from "../protocol/ResourceRecordData";
import {LabelSequence} from "../protocol/datatypes/LabelSequence";

export class LookupTableCNAMERecord extends LookupTableRecord {
    public constructor(
        labels: LabelSequence,
        ttl_s: number,
        public cname: LabelSequence
    ) {
        super(Type.CNAME, DNSClass.IN, labels, ttl_s);
    }

    public get rdata(): ResourceRecordData{
        return new CNAME_ResourceRecordData(this.cname);
    }
}

import {LookupTableRecord} from "./LookupTableRecord";
import {DNSClass, RRType} from "../proto/Types";
import {PTR_ResourceRecordData, ResourceRecordData} from "../proto/ResourceRecordData";
import {LabelSequence} from "../proto/datatypes/LabelSequence";

export class LookupTablePTRRecord extends LookupTableRecord {
    public constructor(
        labels: LabelSequence,
        ttl_s: number,
        public ptr: LabelSequence
    ) {
        super(RRType.PTR, DNSClass.IN, labels, ttl_s);
    }

    public get rdata(): ResourceRecordData{
        return new PTR_ResourceRecordData(this.ptr);
    }
}
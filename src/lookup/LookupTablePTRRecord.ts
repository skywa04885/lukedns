import {LookupTableRecord} from "./LookupTableRecord";
import {DNSClass, Type} from "../protocol/Types";
import {PTR_ResourceRecordData, ResourceRecordData} from "../protocol/ResourceRecordData";
import {LabelSequence} from "../protocol/datatypes/LabelSequence";

export class LookupTablePTRRecord extends LookupTableRecord {
    public constructor(
        labels: LabelSequence,
        ttl_s: number,
        public ptr: LabelSequence
    ) {
        super(Type.PTR, DNSClass.IN, labels, ttl_s);
    }

    public get rdata(): ResourceRecordData{
        return new PTR_ResourceRecordData(this.ptr);
    }
}
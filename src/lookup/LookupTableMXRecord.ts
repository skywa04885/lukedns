import {LookupTableRecord} from "./LookupTableRecord";
import {DNSClass, Type} from "../protocol/Types";
import {MX_ResourceRecordData, ResourceRecordData} from "../protocol/ResourceRecordData";
import {LabelSequence} from "../protocol/datatypes/LabelSequence";

export class LookupTableMXRecord extends LookupTableRecord {
    public constructor(
        labels: LabelSequence,
        ttl_s: number,
        public exchange: LabelSequence,
        public preference: number
    ) {
        super(Type.MX, DNSClass.IN, labels, ttl_s);
    }

    public get rdata(): ResourceRecordData{
        return new MX_ResourceRecordData(this.preference, this.exchange);
    }
}

import {LookupTableRecord} from "./LookupTableRecord";
import {DNSClass, RRType} from "../proto/Types";
import {MX_ResourceRecordData, ResourceRecordData} from "../proto/ResourceRecordData";
import {LabelSequence} from "../proto/datatypes/LabelSequence";

export class LookupTableMXRecord extends LookupTableRecord {
    public constructor(
        labels: LabelSequence,
        ttl_s: number,
        public exchange: LabelSequence,
        public preference: number
    ) {
        super(RRType.MX, DNSClass.IN, labels, ttl_s);
    }

    public get rdata(): ResourceRecordData{
        return new MX_ResourceRecordData(this.preference, this.exchange);
    }
}

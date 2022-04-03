import {DNSClass, rr_type_to_string, RRType} from "../proto/Types";
import {ResourceRecordData} from "../proto/ResourceRecordData";
import {RR} from "../proto/ResourceRecord";
import {LabelSequence} from "../proto/datatypes/LabelSequence";

export class LookupTableRecord {
    public constructor(public type: RRType, public cls: DNSClass, public labels: LabelSequence, public ttl_s: number) {
    }

    public get rdata(): ResourceRecordData{
        throw new Error("Not implemented!");
    }

    public get rr(): RR {
        return new RR(
            this.labels,
            this.type,
            this.cls,
            this.ttl_s,
            this.rdata.encode()
        );
    }
}
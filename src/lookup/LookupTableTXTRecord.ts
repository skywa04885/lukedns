import {LookupTableRecord} from "./LookupTableRecord";
import {DNSClass, RRType} from "../proto/Types";
import {ResourceRecordData, TXT_ResourceRecordData} from "../proto/ResourceRecordData";
import {CharacterString} from "../proto/datatypes/CharacterString";
import {LabelSequence} from "../proto/datatypes/LabelSequence";

export class LookupTableTXTRecord extends LookupTableRecord {
    /**
     * Creates a new TXT Record.
     * @param labels the labels for the record.
     * @param ttl_s the time to live.
     * @param txt_s the txt data.
     */
    public constructor(labels: LabelSequence, ttl_s: number, public txt_s: CharacterString[]) {
        super(RRType.TXT, DNSClass.IN, labels, ttl_s);
    }

    public get rdata(): ResourceRecordData{
        return new TXT_ResourceRecordData(this.txt_s);
    }
}
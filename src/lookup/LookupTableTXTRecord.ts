import {LookupTableRecord} from "./LookupTableRecord";
import {DNSClass, Type} from "../protocol/Types";
import {ResourceRecordData, TXT_ResourceRecordData} from "../protocol/ResourceRecordData";
import {CharacterString} from "../protocol/datatypes/CharacterString";
import {LabelSequence} from "../protocol/datatypes/LabelSequence";

export class LookupTableTXTRecord extends LookupTableRecord {
    /**
     * Creates a new TXT Record.
     * @param labels the labels for the record.
     * @param ttl_s the time to live.
     * @param txt_s the txt data.
     */
    public constructor(labels: LabelSequence, ttl_s: number, public txt_s: CharacterString[]) {
        super(Type.TXT, DNSClass.IN, labels, ttl_s);
    }

    public get rdata(): ResourceRecordData{
        return new TXT_ResourceRecordData(this.txt_s);
    }
}
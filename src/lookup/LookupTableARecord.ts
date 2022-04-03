import {LookupTableRecord} from "./LookupTableRecord";
import {IPv4Address} from "llibipaddress";
import {DNSClass, RRType} from "../proto/Types";
import {A_ResourceRecordData, ResourceRecordData} from "../proto/ResourceRecordData";
import {LabelSequence} from "../proto/datatypes/LabelSequence";

export class LookupTableARecord extends LookupTableRecord {
    public address: IPv4Address;

    public constructor(
        labels: LabelSequence,
        ttl_s: number,
        address: IPv4Address
    ) {
        super(RRType.A, DNSClass.IN, labels, ttl_s);

        this.address = address;
    }

    public get rdata(): ResourceRecordData{
        return new A_ResourceRecordData(this.address);
    }
}

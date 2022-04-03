import {LookupTableRecord} from "./LookupTableRecord";
import {DNSClass, Type} from "../protocol/Types";
import {HINFO_ResourceRecordData, ResourceRecordData} from "../protocol/ResourceRecordData";
import os from "os";
import {CharacterString} from "../protocol/datatypes/CharacterString";
import {LabelSequence} from "../protocol/datatypes/LabelSequence";

export class LookupTableHINFORecord extends LookupTableRecord {
    protected _cpu: CharacterString;
    protected _os: CharacterString;

    public constructor(labels: LabelSequence, ttl_s: number) {
        super(Type.HINFO, DNSClass.IN, labels, ttl_s);

        // Processes the CPU's.
        let processed_cpus: { [key: string]: number } = {};
        os.cpus().forEach((cpu: os.CpuInfo): void => {
            if (!processed_cpus[cpu.model]) {
                processed_cpus[cpu.model] = 1;
            } else {
                ++processed_cpus[cpu.model];
            }
        });

        // Creates the CPU string.
        let cpu_strings: string[] = [];
        for (const [cpu, count] of Object.entries(processed_cpus)) {
            cpu_strings.push(`${count}x (${cpu})`);
        }

        // Gets the operating system.
        const operating_system: string = `${os.arch()}, ${os.platform()}, ${os.version()}`;

        // Creates the final character strings.
        this._cpu = CharacterString.fromString(cpu_strings.join(', '));
        this._os = CharacterString.fromString(operating_system);
    }

    public get rdata(): ResourceRecordData{
        return new HINFO_ResourceRecordData(
            this._cpu,
            this._os
        );
    }
}

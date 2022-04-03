import {LookupTable} from "../lookup/LookupTable";
import {LookupTableZone} from "../lookup/LookupTableZone";
import {LabelSequence} from "../proto/datatypes/LabelSequence";
import {LookupTableHINFORecord} from "../lookup/LookupTableHINFORecord";
import {Server} from "../Server";
import {App} from "../web/App";
import {LookupTableARecord} from "../lookup/LookupTableARecord";
import {IPv4Address} from "llibipaddress";

const seq = LabelSequence.from('fannst.nl');
LookupTable.instance.insert_zone(seq, new LookupTableZone(seq, [
    new LookupTableHINFORecord(seq, 60),
  new LookupTableARecord(seq, 60, IPv4Address.decode('182.113.12.3'))
]));

// Creates the DNS server, and the App... However, if they're called earlier
//  they still would've been initialized.
Server.instance;
App.instance;
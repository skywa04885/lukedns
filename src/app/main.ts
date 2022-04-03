import {LookupTable} from "../lookup/LookupTable";
import {Server} from "../Server";
import {App} from "../web/App";
import {Config} from "../config/Config";

// Inserts all the zones from the config into the lookup table.
LookupTable.instance.insert_zones(Config.instance.get_zones());

// Creates the DNS server, and the App... However, if they're called earlier
//  they still would've been initialized.
Server.instance;
App.instance;
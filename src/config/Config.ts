import yaml from 'js-yaml';
import path from "path";
import * as fs from "fs";
import {LookupTableZone} from "../lookup/LookupTableZone";
import {ConfigZone} from "./ConfigZone";

export interface IConfigServer {
  udp_port: number;
  udp_host: string;
  tcp_port: number;
  tcp_host: string;
  tcp_backlog: number;
  api_port: number;
  api_host: string;
  api_backlog: number;
}

export interface IConfigRoot {
  server: IConfigServer;
  zones: string[];
}

export class Config {
  protected static _instance?: Config;
  public readonly server: IConfigServer;
  public readonly zones: string[]

  protected constructor(config_file?: string) {
    if (!config_file) {
      config_file = path.join(__dirname, '../', '../', 'locals', 'config.yaml');
    }

    const config_file_contents: string = fs.readFileSync(config_file, {
      encoding: 'utf-8'
    });

    const yaml_contents: IConfigRoot = yaml.load(config_file_contents) as IConfigRoot;

    this.server = yaml_contents.server;
    this.zones = yaml_contents.zones.map((zone: string): string => {
      return path.join(path.dirname(config_file!), zone);
    });
  }

  public static get instance(): Config {
    if (!this._instance) {
      this._instance = new Config();
    }

    return this._instance;
  }

  public get_zones(): LookupTableZone[] {
    return this.zones.map((zone: string): LookupTableZone => {
      return new ConfigZone(path.join(zone)).parse_zone();
    });
  }
}
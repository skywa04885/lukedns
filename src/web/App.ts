import express from "express";
import path from "path";
import { Statistics } from "../Statistics";
import { LookupTable } from "../lookup/LookupTable";
import { class_to_string, type_to_string } from "../protocol/Types";
import { Config } from "../config/Config";
import express_basic_auth from "express-basic-auth";
import fs from "fs";
import * as util from "util";
import * as readline from "readline";
import {log} from "util";

export class App {
  protected static _instance?: App;

  protected _application: express.Application;

  protected constructor() {
    this._application = express();

    this._application.set("view engine", "pug");
    this._application.set(
      "views",
      path.join(__dirname, "../", "../", "templates")
    );

    this._application.use(
      "/static",
      express.static(path.join(__dirname, "../", "../", "static"))
    );

    this._application.use(
      "/auth/*",
      express_basic_auth({
        users: Config.instance.server.api_auth,
        challenge: true,
      })
    );

    const logs_dir: string = path.join(__dirname, "../", "../", "logs");
    this._application.get("/auth/log/:log", async (req, res, next) => {
      // Gets the max number of entries requested by the client.
      let max_entries: number = 1024;
      if (req.query.max && (typeof req.query.max === "string")) {
        max_entries = parseInt(req.query.max);
      }

      let entries: any[] = [];

      const log_file_name: string = path.basename(req.params.log);
      const log_file: string = path.join(
        logs_dir,
        log_file_name
      );

      // Gets the stats of the file.
      const stats: fs.Stats = await util.promisify(fs.stat)(log_file);

      // Creates the line reader.
      const reader = readline.createInterface({
        input: fs.createReadStream(log_file),
      });


      reader.on("line", (line: string) => {
        entries.push(JSON.parse(line));

        // If the number of entries exceeds the desired count, close.
        if (entries.length >= max_entries) {
          reader.close();
        }
      });
      reader.on("close", () => {
        res.render("auth/log.pug", {
          entries,
          stats,
          log_file_name,
          max_entries
        });
      });
    });
    this._application.get("/auth/download-log/:log", (req, res, next) => {
      const log_file_name: string = path.basename(req.params.log);
      const log_file: string = path.join(
        logs_dir,
        log_file_name
      );


      res.sendFile(log_file);
    });
    this._application.get("/auth/logs", async (req, res, next) => {
      const names: string[] = (await util.promisify(fs.readdir)(logs_dir)).filter((file: string) => !file.startsWith("."));
      const files: {name: string, stat: fs.Stats}[] = [];

      for (const name of names) {
        files.push({
          name,
          stat: await util.promisify(fs.stat)(path.join(logs_dir, name))
        })
      }

      return res.render("auth/logs.pug", {
        files,
      });
    });

    this._application.get("/", (req, res, next): void => {
      return res.render("index.pug", {
        statistics: Statistics.instance,
        lookup_table: LookupTable.instance,
        config: Config.instance,
        type_to_string,
        class_to_string,
        uptime: process.uptime()
      });
    });

    this._application.listen(
      Config.instance.server.api_port,
      Config.instance.server.api_host,
      Config.instance.server.api_backlog
    );
  }

  public static get instance() {
    if (!this._instance) {
      this._instance = new App();
    }

    return this._instance;
  }
}

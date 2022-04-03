import express from 'express';
import path from "path";
import {Statistics} from "../Statistics";
import {LookupTable} from "../lookup/LookupTable";
import {rr_type_to_string} from "../proto/Types";

export class App {
    protected static _instance?: App;

    protected _application: express.Application;

    protected constructor() {
        this._application = express();

        this._application.set('view engine', 'pug');
        this._application.set('views', path.join(__dirname, '../', '../', 'templates'));

        this._application.use('/static', express.static(path.join(__dirname, '../', '../', 'static')));

        this._application.get('/', (req, res, next): void => {
            return res.render('index.pug', {
                statistics: Statistics.instance,
                lookup_table: LookupTable.instance,
                rr_type_to_string: rr_type_to_string
            });
        })

        this._application.listen(8040);
    }

    public static get instance() {
        if (!this._instance) {
            this._instance = new App();
        }

        return this._instance;
    }
}
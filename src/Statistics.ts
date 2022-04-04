export class Statistics {
    protected static _instance?: Statistics;

    protected _tcp_query_count: number = 0;
    protected _udp_query_count: number = 0;
    protected _axfr_query_count: number = 0;

    public get tcp_query_count(): number {
        return this._tcp_query_count;
    }

    public get udp_query_count(): number {
        return this._udp_query_count;
    }

    public get axfr_query_count(): number {
        return this._axfr_query_count;
    }

    public increment_tcp_query_count(): void {
        ++this._tcp_query_count;
    }

    public increment_udp_query_count(): void {
        ++this._udp_query_count;
    }

    public increment_axfr_query_count(): void {
        ++this._axfr_query_count;
    }

    protected constructor() {
    }

    public static get instance() {
        if (!this._instance) {
            this._instance = new Statistics();
        }

        return this._instance;
    }
}
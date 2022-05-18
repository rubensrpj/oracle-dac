declare namespace Odac {
    const odacNUMBER: number;
    const odacSTRING: number;
    const odacDATE: number;
    const odacBIND_IN: number;
    const odacBIND_INOUT: number;
    const odacBIND_OUT: number;
    type OdacConnectParams = {
        user: string;
        password: string;
        connectString: string;
    };
    type OdacBindParameters = Record<string, {
        dir: number;
        type: number | string | undefined;
        val: any;
    }>;
    type OdacQueryParams = {
        command: string;
        bindParameters: OdacBindParameters | OdacBindParameters[];
    };
    type OdacExecuteParams = {
        command: string;
        bindParameters: OdacBindParameters | OdacBindParameters[];
        autoCommit: boolean | true;
    };
    class OdacConnection {
        private odacConnectParams;
        private connection;
        static open(odacConnectParams: OdacConnectParams): Promise<OdacConnection>;
        protected build(odacConnectParams: OdacConnectParams): Promise<OdacConnection>;
        close(): Promise<void>;
        private getConnection;
        getNewQuery(): IOdacQuery;
    }
    interface IOdacQuery {
        sql<T>(odacQueryParams: OdacQueryParams): Promise<T[] | undefined>;
        execute(odacExecuteParams: OdacExecuteParams): Promise<number>;
        executeMany(odacExecuteParams: OdacExecuteParams): Promise<number>;
        nextVal(sequenceName: string): Promise<number>;
    }
}
export = Odac;

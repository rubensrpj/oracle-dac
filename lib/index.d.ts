declare namespace Odac {
    const odacNUMBER: number;
    const odacSTRING: number;
    const odacDATE: number;
    type OdacConnectParams = {
        user: string;
        password: string;
        connectString: string;
    };
    type OdacQueryParams = {
        command: string;
        bindParameters: OdacBindParameters;
    };
    type OdacExecuteParams = {
        command: string;
        bindParameters: OdacBindParameters | OdacBindParameters[];
        autoCommit: boolean;
    };
    type OdacBindParameters = Record<string, {
        type: number | string | undefined;
        val: any;
    }>;
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
    }
}
export = Odac;

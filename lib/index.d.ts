import OracleDB from 'oracledb';
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
    interface OdacBindParameter extends OracleDB.BindParameter {
        dir?: number | undefined;
        maxArraySize?: number | undefined;
        maxSize?: number | undefined;
        type?: number | string | undefined;
        val?: any;
    }
    type OdacBindParameters = Record<string, OdacBindParameter | number | string | Date | null | undefined>;
    type OdacQueryParams = {
        command: string;
        bindParameters: OdacBindParameters;
    };
    type OdacExecuteParams = {
        command: string;
        bindParameters: OdacBindParameters;
        autoCommit: boolean | true;
    };
    class OdacConnection {
        private odacConnectParams;
        private connection;
        protected build(odacConnectParams: OdacConnectParams): Promise<OdacConnection>;
        static open(odacConnectParams: OdacConnectParams): Promise<OdacConnection>;
        close(): Promise<void>;
        private getConnection;
        getNewQuery(): IOdacQuery;
    }
    interface IOdacQuery {
        sql<T>(odacQueryParams: OdacQueryParams): Promise<T[]>;
        sqlFirst<T>(odacQueryParams: OdacQueryParams): Promise<T | undefined>;
        execute(odacExecuteParams: OdacExecuteParams): Promise<number>;
        executeMany(odacExecuteParams: OdacExecuteParams): Promise<number>;
        nextVal(sequenceName: string): Promise<number>;
    }
}
export = Odac;

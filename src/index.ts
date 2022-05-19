import OracleDB, { BindParameters, Connection } from 'oracledb';

namespace Odac {

    /**
     * Types for parameters
     */
    export const odacNUMBER = OracleDB.NUMBER;
    export const odacSTRING = OracleDB.STRING;
    export const odacDATE = OracleDB.DATE;
    export const odacBIND_IN = OracleDB.BIND_IN;
    export const odacBIND_INOUT = OracleDB.BIND_INOUT;
    export const odacBIND_OUT = OracleDB.BIND_OUT;

    /**
    * Params for the ODAC connection
    */
    export type OdacConnectParams = { user: string, password: string, connectString: string };

    /**
     * Bind Params for commands
     */
    export interface OdacBindParameter extends OracleDB.BindParameter {
        dir?: number | undefined;
        maxArraySize?: number | undefined;
        maxSize?: number | undefined;
        type?: number | string | undefined;
        val?: any;
    };

    /**
     * Bind Params for commands
     */
    export type OdacBindParameters = Record<string, OdacBindParameter | number | string | Date | null | undefined>;

    /**
    * Params for Query
    */
    export type OdacQueryParams = { command: string, bindParameters: OdacBindParameters };

    /**
    * Params for Execute
    */
    export type OdacExecuteParams = { command: string, bindParameters: OdacBindParameters, autoCommit: boolean | true };

    /**
    * Class for working with Oracle Database
    */
    export class OdacConnection {

        private odacConnectParams: OdacConnectParams | undefined;
        private connection: Connection | undefined;

        public static async open(odacConnectParams: OdacConnectParams): Promise<OdacConnection> {
            return await (new OdacConnection()).build(odacConnectParams);
        }

        protected async build(odacConnectParams: OdacConnectParams): Promise<OdacConnection> {
            this.odacConnectParams = odacConnectParams;
            this.connection = await OracleDB
                .getConnection({
                    user: this.odacConnectParams.user,
                    password: this.odacConnectParams.password,
                    connectString: this.odacConnectParams.connectString,
                })
                .then((connection) => {
                    return connection;
                })
                .catch((error) => {
                    console.error(['open', error]);
                    throw new Error(error);
                });
            return this
        }

        public async close(): Promise<void> {
            if (this.connection !== undefined) {
                try {
                    await this.connection.close();
                } catch (error) {
                    console.log(['close', error]);
                    throw new Error((error as Error).message);
                }
            }
        }

        private getConnection(): OracleDB.Connection {
            if (this.connection === undefined)
                throw new Error('Not connected !!');
            return this.connection;
        }

        public getNewQuery(): IOdacQuery {
            return new OdacQuery(this.getConnection())
        }
    }

    export interface IOdacQuery {
        sql<T>(odacQueryParams: OdacQueryParams): Promise<T[] | undefined>;
        execute(odacExecuteParams: OdacExecuteParams): Promise<number>;
        executeMany(odacExecuteParams: OdacExecuteParams): Promise<number>;
        nextVal(sequenceName: string): Promise<number>;
    }
    class OdacQuery implements IOdacQuery {

        private connection: OracleDB.Connection;

        constructor(connection: OracleDB.Connection) {
            this.connection = connection;
        }

        public async nextVal(sequenceName: string): Promise<number> {
            return await this.connection
                .execute(`SELECT ${sequenceName}.NEXTVAL AS SEQUENCE FROM DUAL`, [], {
                    outFormat: OracleDB.OUT_FORMAT_OBJECT,
                }).then((resul) => {
                    if (resul.rows) return Number(resul.rows[0]);
                    else return 0
                })
                .catch((error) => {
                    console.error(['nextVal', error, sequenceName]);
                    throw new Error(error);
                });
        }

        public async sql<T>(odacQueryParams: OdacQueryParams): Promise<T[] | undefined> {
            return await this.connection
                .execute<T>(odacQueryParams.command.toUpperCase(), odacQueryParams.bindParameters, {
                    outFormat: OracleDB.OUT_FORMAT_OBJECT,
                }).then((resul) => {
                    return resul.rows
                })
                .catch((error) => {
                    console.error(['query<T>', odacQueryParams.command.toUpperCase(), odacQueryParams.bindParameters, error,]);
                    throw new Error(error);
                });
        }


        public async execute(odacExecuteParams: OdacExecuteParams): Promise<number> {
            return await this.connection
                .execute(odacExecuteParams.command.toUpperCase(), (odacExecuteParams.bindParameters as OracleDB.BindParameters), { autoCommit: odacExecuteParams.autoCommit })
                .then((resultado) => {
                    if (resultado.rowsAffected === undefined) return 0;
                    else return Promise.resolve(resultado.rowsAffected);
                })
                .catch((error) => {
                    console.error(['execute', odacExecuteParams.command.toUpperCase(), odacExecuteParams.bindParameters, error]);
                    throw new Error(error);
                });
        }

        public async executeMany(odacExecuteParams: OdacExecuteParams): Promise<number> {
            return await this.connection
                .executeMany(odacExecuteParams.command.toUpperCase(), (odacExecuteParams.bindParameters as OracleDB.BindParameters) as BindParameters[], { autoCommit: odacExecuteParams.autoCommit })
                .then((resultado) => {
                    if (resultado.rowsAffected === undefined) return 0;
                    else return Promise.resolve(resultado.rowsAffected);
                })
                .catch((error) => {
                    console.error(['executeMany', odacExecuteParams.command.toUpperCase(), odacExecuteParams.bindParameters, error]);
                    throw new Error(error);
                });
        }

    }
}

export = Odac;
import OracleDB, { BindParameters, Connection } from 'oracledb';

namespace Odac {

    /**
     * Types for parameters
     */
    export const odacNUMBER = OracleDB.NUMBER;
    export const odacSTRING = OracleDB.STRING;
    export const odacDATE = OracleDB.DATE;

    /**
    * Params for the ODAC connection
    */
    export type OdacConnectParams = { user: string, password: string, connectString: string };

    /**
    * Params for Query
    */
    export type OdacQueryParams = { command: string, bindParameters: OdacBindParameters };

    /**
    * Params for Execute
    */
    export type OdacExecuteParams = { command: string, bindParameters: OdacBindParameters | OdacBindParameters[], autoCommit: boolean };

    /**
     * Bind Params for commands
     */
    export type OdacBindParameters = Record<string, { type: number | string | undefined, val: any }>;

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
    }
    class OdacQuery implements IOdacQuery {

        private connection: OracleDB.Connection;

        constructor(connection: OracleDB.Connection) {
            this.connection = connection;
        }

        public async sql<T>(odacQueryParams: OdacQueryParams): Promise<T[] | undefined> {
            return await this.connection
                .execute<T>(odacQueryParams.command.toUpperCase(), odacQueryParams.bindParameters, {
                    outFormat: OracleDB.OUT_FORMAT_OBJECT,
                }).then((resul) => {
                    return resul.rows
                })
                .catch((error) => {
                    console.error(['query<T>', error, odacQueryParams.command.toUpperCase(), odacQueryParams.bindParameters]);
                    throw new Error(error);
                });
        }


        public async execute(odacExecuteParams: OdacExecuteParams): Promise<number> {
            return await this.connection
                .execute(odacExecuteParams.command.toUpperCase(), odacExecuteParams.bindParameters, { autoCommit: odacExecuteParams.autoCommit })
                .then((resultado) => {
                    if (resultado.rowsAffected === undefined) return 0;
                    else return Promise.resolve(resultado.rowsAffected);
                })
                .catch((error) => {
                    console.error(['execute', error, odacExecuteParams.command.toUpperCase(), odacExecuteParams.bindParameters]);
                    throw new Error(error);
                });
        }

        public async executeMany(odacExecuteParams: OdacExecuteParams): Promise<number> {
            return await this.connection
                .executeMany(odacExecuteParams.command.toUpperCase(), odacExecuteParams.bindParameters as BindParameters[], { autoCommit: odacExecuteParams.autoCommit })
                .then((resultado) => {
                    if (resultado.rowsAffected === undefined) return 0;
                    else return Promise.resolve(resultado.rowsAffected);
                })
                .catch((error) => {
                    console.error(['executeMany', error, odacExecuteParams.command.toUpperCase(), odacExecuteParams.bindParameters]);
                    throw new Error(error);
                });
        }

    }
}

export default Odac;
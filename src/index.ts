import OracleDB, { BindParameters, Connection } from 'oracledb';

namespace Odac {
    /**
    * Params for the ODAC connection
    */
    export type OdacConnectParams = { user: string, password: string, connectString: string };

    /**
    * Params for Query
    */
    export type OdacQueryParams = { connection: Connection, command: string, bindParameters: OdacBindParameters };

    /**
    * Params for Execute
    */
    export type OdacExecuteParams = { connection: Connection, command: string, bindParameters: OdacBindParameters | OdacBindParameters[], autoCommit: boolean };

    /**
     * Bind Params for commands
     */
    export type OdacBindParameters = Record<string, { type: number | string | undefined, val: any }>;

    /**
    * Class for working with Oracle Database
    */
    export class OdacConnection {

        private odacConnectParams: OdacConnectParams;

        public readonly oraNUMBER = OracleDB.NUMBER;
        public readonly oraSTRING = OracleDB.STRING;
        public readonly oraDATE = OracleDB.DATE;

        constructor(odacConnectParams: OdacConnectParams) {
            this.odacConnectParams = odacConnectParams;
        }

        /**
         * Open connection with Oracle
         * @param connectParams Parameters to connect with oracle
         * @returns Instance of Connection
         */
        public async open(): Promise<OracleDB.Connection> {
            return await OracleDB
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
        }

        /**
         * Close connection with Oracle
         * @param connection Instance of Oracle Conection
         */
        public async close(connection: Connection): Promise<void> {
            if (connection) {
                try {
                    await connection.close();
                } catch (error) {
                    console.log(['close', error]);
                    throw new Error((error as Error).message);
                }
            }
        }

        public async query<T>(odacQueryParams: OdacQueryParams): Promise<T[] | undefined> {
            return await odacQueryParams.connection
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
            return await odacExecuteParams.connection
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
            return await odacExecuteParams.connection
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
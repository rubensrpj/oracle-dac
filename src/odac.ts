import oracledb, { BindParameters, Connection, Result } from 'oracledb';

/**
 * Params for the ODAC connection
 */
type odacConnectParams = { user: string, password: string, connectString: string };

/**
* Params for Query
*/
type odacQueryParams = { connection: Connection, command: string, bindParameters: odacBindParameters };

/**
* Params for Execute
*/
type odacExecuteParams = { connection: Connection, command: string, bindParameters: odacBindParameters | odacBindParameters[], autoCommit: boolean };

/**
 * Bind Params for commands
 */
type odacBindParameters = Record<string, { type: number | string | undefined, val: any }>;


/**
 * Class for working with Oracle Database
 */
export default class Odac {

    private connectParams: odacConnectParams;

    public oraNUMBER = oracledb.NUMBER;
    public oraSTRING = oracledb.STRING;
    public oraDATE = oracledb.DATE;

    constructor(connectParams: odacConnectParams) {
        this.connectParams = connectParams;
    }

    /**
     * Open connection with Oracle
     * @param connectParams Parameters to connect with oracle
     * @returns Instance of Connection
     */
    public async open(): Promise<oracledb.Connection> {
        return await oracledb
            .getConnection({
                user: this.connectParams.user,
                password: this.connectParams.password,
                connectString: this.connectParams.connectString,
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

    public async query<T>(queryParams: odacQueryParams): Promise<T[] | undefined> {
        return await queryParams.connection
            .execute<T>(queryParams.command.toUpperCase(), queryParams.bindParameters, {
                outFormat: oracledb.OUT_FORMAT_OBJECT,
            }).then((resul) => {
                return resul.rows
            })
            .catch((error) => {
                console.error(['query<T>', error, queryParams.command.toUpperCase(), queryParams.bindParameters]);
                throw new Error(error);
            });
    }


    public async execute(executeParams: odacExecuteParams): Promise<number> {
        return await executeParams.connection
            .execute(executeParams.command.toUpperCase(), executeParams.bindParameters, { autoCommit: executeParams.autoCommit })
            .then((resultado) => {
                if (resultado.rowsAffected === undefined) return 0;
                else return Promise.resolve(resultado.rowsAffected);
            })
            .catch((error) => {
                console.error(['execute', error, executeParams.command.toUpperCase(), executeParams.bindParameters]);
                throw new Error(error);
            });
    }

    public async executeMany(executeParams: odacExecuteParams): Promise<number> {
        return await executeParams.connection
            .executeMany(executeParams.command.toUpperCase(), executeParams.bindParameters as BindParameters[], { autoCommit: executeParams.autoCommit })
            .then((resultado) => {
                if (resultado.rowsAffected === undefined) return 0;
                else return Promise.resolve(resultado.rowsAffected);
            })
            .catch((error) => {
                console.error(['executeMany', error, executeParams.command.toUpperCase(), executeParams.bindParameters]);
                throw new Error(error);
            });
    }

}

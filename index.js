"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _oracledb = _interopRequireDefault(require("oracledb"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let Odac;

(function (_Odac) {
  const odacNUMBER = _Odac.odacNUMBER = _oracledb.default.NUMBER;
  const odacSTRING = _Odac.odacSTRING = _oracledb.default.STRING;
  const odacDATE = _Odac.odacDATE = _oracledb.default.DATE;

  class OdacConnection {
    static async open(odacConnectParams) {
      return await new OdacConnection().build(odacConnectParams);
    }

    async build(odacConnectParams) {
      this.odacConnectParams = odacConnectParams;
      this.connection = await _oracledb.default.getConnection({
        user: this.odacConnectParams.user,
        password: this.odacConnectParams.password,
        connectString: this.odacConnectParams.connectString
      }).then(connection => {
        return connection;
      }).catch(error => {
        console.error(['open', error]);
        throw new Error(error);
      });
      return this;
    }

    async close() {
      if (this.connection !== undefined) {
        try {
          await this.connection.close();
        } catch (error) {
          console.log(['close', error]);
          throw new Error(error.message);
        }
      }
    }

    getConnection() {
      if (this.connection === undefined) throw new Error('Not connected !!');
      return this.connection;
    }

    getNewQuery() {
      return new OdacQuery(this.getConnection());
    }

  }

  _Odac.OdacConnection = OdacConnection;

  class OdacQuery {
    constructor(connection) {
      this.connection = connection;
    }

    async sql(odacQueryParams) {
      return await this.connection.execute(odacQueryParams.command.toUpperCase(), odacQueryParams.bindParameters, {
        outFormat: _oracledb.default.OUT_FORMAT_OBJECT
      }).then(resul => {
        return resul.rows;
      }).catch(error => {
        console.error(['query<T>', error, odacQueryParams.command.toUpperCase(), odacQueryParams.bindParameters]);
        throw new Error(error);
      });
    }

    async execute(odacExecuteParams) {
      return await this.connection.execute(odacExecuteParams.command.toUpperCase(), odacExecuteParams.bindParameters, {
        autoCommit: odacExecuteParams.autoCommit
      }).then(resultado => {
        if (resultado.rowsAffected === undefined) return 0;else return Promise.resolve(resultado.rowsAffected);
      }).catch(error => {
        console.error(['execute', error, odacExecuteParams.command.toUpperCase(), odacExecuteParams.bindParameters]);
        throw new Error(error);
      });
    }

    async executeMany(odacExecuteParams) {
      return await this.connection.executeMany(odacExecuteParams.command.toUpperCase(), odacExecuteParams.bindParameters, {
        autoCommit: odacExecuteParams.autoCommit
      }).then(resultado => {
        if (resultado.rowsAffected === undefined) return 0;else return Promise.resolve(resultado.rowsAffected);
      }).catch(error => {
        console.error(['executeMany', error, odacExecuteParams.command.toUpperCase(), odacExecuteParams.bindParameters]);
        throw new Error(error);
      });
    }

  }
})(Odac || (Odac = {}));

var _default = Odac;
exports.default = _default;
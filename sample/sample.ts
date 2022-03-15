import { OdacConnection } from '..';

const teste = async () => {
    const odac = new OdacConnection({ user: 'XXX', password: 'XXX', connectString: '10.0.1.10/WINT' });
    const connection = await odac.open();
    const result = await odac.query<{ QTDEREG: Number }>({ connection, command: 'SELECT 1 FROM DUAL', bindParameters: {} });
    result === undefined ? console.log('no data found') : result.forEach(element => { console.log(element.QTDEREG) });
    await odac.close(connection);
}

teste();

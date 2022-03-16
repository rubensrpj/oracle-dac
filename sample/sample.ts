import { OdacConnection,  } from '../lib';

const teste = async () => {
    const odac = await OdacConnection.open({ user: 'xxx', password: 'xxx', connectString: '10.0.1.10/WINT' });
    let result = await odac.getNewQuery().sql({ command: 'SELECT CODPROD FROM PCPRODUT WHERE ROWNUM < 50', bindParameters: {} });
    result === undefined ? console.log('no data found') : result.forEach(element => { console.log(element) });
    result = await odac.getNewQuery().sql({ command: 'SELECT CODCLI FROM PCCLIENT WHERE ROWNUM < 50', bindParameters: {} });
    result === undefined ? console.log('no data found') : result.forEach(element => { console.log(element) });
    await odac.close();
}

teste();

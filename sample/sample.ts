import { OdacConnection } from '../lib';

const sql = async () => {
    const odac = await OdacConnection.open({ user: 'x', password: 'x', connectString: '10.0.1.10/WINT' });
    let result = await odac.getNewQuery().sql({ command: 'SELECT CODPROD FROM PCPRODUT WHERE ROWNUM < :LINHAS AND CODPROD = :CODPROD ', bindParameters: { "LINHAS": 50, "CODPROD" : 0} });
    result === undefined ? console.log('no data found') : result.forEach(element => { console.log(element) });
    await odac.close();
}

const nextval = async () => {
    const odac = await OdacConnection.open({ user: 'x', password: 'x', connectString: '10.0.1.10/WINT' });
    let result = await odac.getNewQuery().nextVal('USUARIOPORTAL_SEQ');
    console.log(result)
    await odac.close();
}

//sql();
nextval();

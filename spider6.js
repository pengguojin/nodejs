const request = require('./libs/request');
const fs = require('fs');
const Mysql = require('mysql-pro');
const JSDOM = require('jsdom').JSDOM;

let db = new Mysql({
    mysql:{
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '',
        database: 'shouji'
    }
});

async function query(sql) {
    await db.startTransaction();
    let data = db.executeTransaction(sql);
    await db.stopTransaction();

    return data;
}

function html2$(html){
    let document=new JSDOM(html).window.document;
    
    return document.querySelectorAll.bind(document);
}

function indexParser(buffer){    
    let $=html2$(html2$(buffer.toString())('textarea.f1')[0].value);
    
    Array.from($('li')).map(li=>{
        let oA=li.getElementsByClassName('mod-g-photo')[0];
        console.log(oA.href);
        
    });
}

function updateData(){

}

(async()=> {
    let { body, headers }=await request('https://shouji.tmall.com/');
    let json = indexParser(body);
    // fs.writeFile('tmp/tmall_shouji.html', body.toString(), err=>{});
    updateData(json);
})();
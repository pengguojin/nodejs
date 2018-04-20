const http = require('http');
const fs = require('fs');
const pathlib = require('path');
const urllib = require('url');

let req = http.request('http://www.taobao.com', res=>{
    let arr=[];
    if(res.statusCode>=200 && res.statusCode<300 || res.statusCode==304){
        res.on('data', data=>{
            arr.push(data);
        });
    
        res.on('end', ()=>{
            let buffer = Buffer.concat(arr);
            fs.writeFile(pathlib.resolve('www', 'baidu.html'), buffer, err=>{
                if(err){
                    console.log('写入失败');
                } else {
                    console.log('成功');
                }
            });
        });
    } else if(res.statusCode==302 || res.statusCode==301) {
        console.log('出错', res.statusCode);
        let u = urllib.parse(res.headers.location);
        console.log(u.protocol);
        console.log(u.host);
        console.log(u.path);
    }
});

req.on('error', err=>{
    console.log('错了', err);
});

req.write('');
req.end();
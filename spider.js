const http = require('http');
const fs = require('fs');
const pathlib = require('path');

let req = http.request('http://www.baidu.com', res=>{
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
    } else {
        console.log('出错', res.statusCode);
        
    }
    
});

req.on('error', err=>{
    console.log('错了', err);
});

req.write('');
req.end();
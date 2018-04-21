const http = require('http');
const https = require('https');
const fs = require('fs');
const pathlib = require('path');
const urllib = require('url');
const assert = require('assert');

function requestUrl(url, headers){
    let urlObj = urllib.parse(url);
    let httpMod = null;
    if(urlObj.protocol == 'http:'){
        httpMod=http;
    } else if(urlObj.protocol == 'https:'){
        httpMod=https;
    } else {
        throw new Error('无法解析请求');
    }
    
    return new Promise((resolve, reject)=>{
        let req = httpMod.request({
            host: urlObj.host,
            path: urlObj.path,
            headers
        }, res=>{
            let arr=[];
            console.log(res.statusCode);
            
            if(res.statusCode>=200 && res.statusCode<300 || res.statusCode==304){
                res.on('data', data=>{
                    arr.push(data);
                });
                res.on('end', ()=>{
                    let buffer = Buffer.concat(arr);
                    resolve({
                        status: 200,
                        body: buffer,
                        headers: res.headers
                    });
                });
            } else if(res.statusCode==302 || res.statusCode==301) {
                resolve({
                    status: res.statusCode,
                    body: null,
                    headers: res.headers
                });
            } else {
                reject({
                    status: res.statusCode,
                    body: null,
                    headers: res.headers
                });
            }
        });
        
        req.on('error', err=>{
            console.log('请求出错');
        });
        
        req.write('');
        req.end();
    });

}

module.exports=async function request(url, reqHeaders){
    try {
        while(1){
            let {status, body, headers}=await requestUrl(url, reqHeaders);
            if(status==200){
                return { body, headers }
            } else {
                assert(status==301 || status==302);
                assert(headers.location);
                url = headers.location;
            }
        }        
    } catch (e) {
        console.log(e);
    }
}



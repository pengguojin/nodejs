const request = require('./libs/request');
const fs = require('fs');

(async()=> {
    let { body, headers }=await request('http://www.zhihu.com');
    
    fs.writeFile('tmp/zhihu.html', body, err=>{
        if(err){
            console.log('出错');
        }
    });
})();
# 原生node和jsdom实现爬虫

#### 项目介绍
使用node原生模块+jsdom模块，实现http和https通用的爬虫工具

#### 软件架构      
原生node模块：
- 1、http模块
- 2、https模块
- 3、fs模块
- 4、path模块       

第三方模块
- 5、jsdom模块-解析dom结构


#### 安装教程
npm i安装模块

#### 使用说明
node xxx.js文件

## 最简单的爬虫
- 1、引入http模块   
```
const http=require('http');
```       
- 2、通过http模块的request方法，请求网络地址     
```javascript
let req=http.request('http://www.baidu.com', res=>{});
```
其中res=>{}是请求成功后的回调函数，req用于错误处理和输出，如下  
```javascript
req.on('error', err=>{
    console.log('出错');
});
req.write('');
req.end();
```
> 注意：write必须是string或者buffer

- 3、http.request有一个回调函数，跟createServer方法接受post数据一样，通过监听data和end事件，接收数据，
```javascript
//通过数组，获取所有的内容
let arr=[];
res=>{
    res.on('data', data=>{
        arr.push(data);
    });
    res.on('end', ()=>{
        //data就是接收的所有数据
    };
}
```

- 4、在接收数据之前必须判断一下，请求码是否接收成功，通过```res.statusCode```获取请求码，如下
```javascript
if(res.statusCode>=200 && res.statusCode<300 || res.statusCode==304){
    //请求成功，继续第三步的操作
} else {
    //请求失败，或者请求被转发了
}
```
- 5、如果请求码是301或者302，表示请求被转发，需要获取被转发的URL，再一次请求被转发的URL，如此循环，直到请求成功为止     
修改上面的代码，如下：
```javascript
if(res.statusCode>=200 && res.statusCode<300 || res.statusCode==304){
    //请求成功，继续第三步的操作
} else if(res.statusCode==301 || res.statusCode==302) {
    //请求失败，或者请求被转发了
    //通过res.headers.location获取被转发后的地址，然后再次请求
}
```

- 6、完整代码如下
```javascript
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
            //通过fs模块写入到文件中
            let buffer = Buffer.concat(arr);
            fs.writeFile(pathlib.resolve('www', 'baidu.html'), buffer, err=>{
                if(err){
                    console.log('写入失败');
                } else {
                    console.log('成功');
                }
            });
        });
    } else if(res.statusCode==301 || res.statusCode==302) {
        //请求失败，或者请求被转发了
        //通过res.headers.location获取被转发后的地址，然后再次请求
    }else {
        console.log('出错', res.statusCode);
    }
    
});
req.on('error', err=>{
    console.log('错了', err);
});
req.write('');
req.end();
```

但上面的代码很多问题        
1. 不清楚URL被转发了多少次，如果被转发5次，那不是要套5层，回调地狱，很恐怖
2. 如果是https，怎么办？
3. 如果网页要登录才能爬，怎么办？

## 复杂一点的爬虫
为了解决上面的问题，我们先想好办法
1. 为了解决被转发多次的问题，我们使用ES7的async和await，同步处理请求，同时使用循环，直到请求成功
2. 如果是https，那么引入https模块呗
3. 需要登录的话，我们需要模拟登录，也就是获取登录后的请求头，请求的时候把头信息丢进去就是了       
有了解决办法，就一步步来        

- 1、先引入https模块，然后通过判断请求的url判断使用http还是https
```javascript
const http=require('http');
const https=require('https');
const urllib=require('url');
let httpMod=null;
// 很简单，不解析
var url = 'http://www.baidu.com';
// 通过url模块，解析url地址
let urlObj = urllib.parse(url);
if (urlObj.protocol == 'http:') {
    httpMod = http;
}else if (urlObj.protocol=='https:') {
    httpMod = https;
} else {
    throw new Error(`协议无法识别: ${urlObj.protocol}`);
}
```     

- 2、在http的request方法，有一个参数是可以传入请求头信息的，改写下，如下：
```javascript
// 请求头信息，获取的方法，下面解析
var resHeader = {
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-CN,zh;q=0.9",
    "Connection": "keep-alive",
}

let req=httpMod.request({
    //urlObj对应上面解析的
      host: urlObj.host, // host表示url地址
      path: urlObj.path, //path表示请求的路径
      headers: resHeader    // 请求头信息
    }, res=>{
        // 请求内容
    });
```

- 3、把原本普通的方法改成ES7的同步方法    
    1. 既然使用了async，那个把上面的代码放进Promise里面使用  
    ```javascript
    /*需要两个参数，URL地址和请求头信息*/
    function requestUrl(url, headers){
        let urlObj=urllib.parse(url);
        let httpMod=null;
        /*判断是http还是https请求*/
        if(urlObj.protocol=='http:'){
            httpMod=http;
        }else if(urlObj.protocol=='https:'){
            httpMod=https;
        }else{
            throw new Error(`协议无法识别: ${urlObj.protocol}`);
        }
        /*返回一个Promise函数*/
        return new Promise((resolve, reject)=>{
            let req=httpMod.request({
                host: urlObj.host,
                path: urlObj.path,
                headers
            }, res=>{
                if(res.statusCode>=200 && res.statusCode<300 || res.statusCode==304){
                    let arr=[];
                    res.on('data', data=>{
                    arr.push(data);
                    });
                    res.on('end', ()=>{
                        let buffer=Buffer.concat(arr);
                        /*通过resolve把请求头、请求内容和请求码返回*/
                        resolve({
                            status: 200,
                            body:   buffer,
                            headers:res.headers
                        });
                    });
                }else if(res.statusCode==301 || res.statusCode==302){
                    /*请求被转发了*/
                    resolve({
                        status: res.statusCode,
                        body:   null,
                        headers:res.headers
                    });
                }else{
                    /*请求失败*/
                    reject({
                        status: res.statusCode,
                        body:   null,
                        headers:res.headers
                    });
                }
            });
            req.on('error', err=>{
                console.log('错了', err);
            });
            req.write('');  /*发送POST数据*/            
            req.end();   /*正式开始请求*/       
        });
    }
    ```
    2. 那么接着定义一个async函数  
    ```javascript
    async function fn(url, header){
        /*调用第一步的代码*/
    }
    ```     
    3. 然后通过while写一个死循环，没错死循环，循环直到请求失败才跳出来
    ```javascript
    /*这里与一个小技巧，使用assert断言，然后请求被转发或者地址为空，修改url为被转发的地址，继续请求，
        直到请求失败跳出循环为止*/
    const assert=require('assert');
    async function fn(url, reqHeaders){
        try{
            while(1){
                /*接收上一步resolve的返回值*/
                let {status, body, headers}=await requestUrl(url, reqHeaders);
                if(status==200){
                    return {body, headers};
                }else{
                    /*如果请求被转发，或者请求地址为空，修改url地址*/
                    assert(status==301 || status==302);
                    assert(headers.location);
                    url=headers.location;
                }
            }
        }catch(err){
            console.log(e);
        }
    }
    ```

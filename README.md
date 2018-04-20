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
- 引入http模块       
- 通过http模块的request方法，请求网络地址     

```javascript
let req=http.request('http://www.baidu.com', res=>{});
```
- 请求的方法有一个返回request，通过这个request，处理错误和输出     
```javascript
req.on('error', err=>{
    console.log('出错');
});
req.write('');
req.end();
```
> 注意：write必须是string或者buffer

- http.request有一个回调函数，跟createServer方法接受post数据一样，通过监听data和end事件，接收数据，

```javascript
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
- 请求有请求码，通过请求码```res.statusCode```，判断请求是成功还是失败

```javascript
if(res.statusCode>=200 && res.statusCode<300 || res.statusCode==304){
    //请求成功
} else {
    //请求失败，或者请求被转发了
}
```

- 完整代码如下

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
    } else {
        console.log('出错', res.statusCode);
    }
    
});
req.on('error', err=>{
    console.log('错了', err);
});
req.write('');
req.end();
```

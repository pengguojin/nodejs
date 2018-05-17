const request = require("../libs/request");
const fs = require("fs");
var cheerio = require("cheerio");
const Mysql=require('mysql-pro');

////// 爬取动画网站信息，保存到数据库

// mysql配置信息
let db=new Mysql({
    mysql: {
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'animation'
    }
});

// 数据库通用方法
async function query(sql, query){
    await db.startTransaction();
    let data=await db.executeTransaction(sql, query);
    await db.stopTransaction();
    return data;
}

// 请求头
var resHeader = {
    "Accept": "application/json, text/javascript, */*; q=0.01",
    "Accept-Encoding": "gzip, deflate",
    "Accept-Language": "zh-CN,zh;q=0.9",
    "Connection": "keep-alive",
    "Cookie": `PHPSESSID=3gmhheeiuoivfl2j06ooektutr; Hm_lvt_f7e11dc1b0380e5d8749d8de321384e9=1525580182,1526006974,1526040768,1526521165; __forward__=%2Fplay%2F1286; Hm_lpvt_f7e11dc1b0380e5d8749d8de321384e9=1526522774`,
    "Host": "www.ipoi.cc",
    "Referer": "http://www.ipoi.cc/play/1286",
    "User-Agent": `Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/63.0.3239.26 Safari/537.36 Core/1.63.5221.400 QQBrowser/10.0.1125.400`,
    "X-Requested-With": "XMLHttpRequest"
}

// 请求地址，获取所有动画列表信息
async function indexSpider() {
    try {
      let { body, headers } = await request("http://www.ipoi.cc/bangumi.html");
      let datas = indexParser(body);
    } catch (e) {
      console.log("index, 请求失败");
      console.log(e);
    }
}

// 通过循环动画列表ID值，获取每个动画的详细信息
async function indexParser(datas) {
    console.log("正在获取视频的列表信息");
    var $ = cheerio.load(datas.toString());
    let ids = [];
    $('.bangumi-list').children('li').each(function(item){
        let oA = $(this).find('a');
        let id = oA.attr('href').replace(/\D/g,""); // 获取视频的唯一ID
        ids.push(id);
    });

    // 整理sql
    let sql = `insert into t_list (id,title,is_new,is_limit,url,line) values `;
    let sql_line = `insert into t_lines (id,title,url,status,list_id) values `;
    let sql_episode = `insert into t_episode (id,episode,title,anime_id,is_sp,sort,create_time,ctime,source,sign,vid,play,vurl,page) values `;

    console.log("正在批量获取动画明细信息");
    
    // 请求数据，整理成插入语句
    let query_list = [];
    let query_line = [];
    let query_episode = [];
    for(var i=0; i<ids.length; i++){
        let { body } = await request(`http://www.ipoi.cc/index/episode/getEpisodeList?season_id=${ids[i]}`, resHeader);
        let json = JSON.parse(body.toString());
        sql += `(?,?,?,?,?,?),`;
        query_list.push(json.id,json.title,json.is_new,json.is_limit,json.url,json.line);
        let id = json.id;
        json.lines.forEach(item => {
            sql_line += `(?,?,?,?,?),`;
            query_line.push(item.id,item.title,item.url,item.status,id);
        });
        json.episode.forEach(item => {
            sql_episode += '(?,?,?,?,?,?,?,?,?,?,?,?,?,?),';
            query_episode.push(item.id,item.episode,item.title,id,item.is_sp,item.sort,item.create_time,item.ctime,item.source,item.sign,item.vid,item.play,item.vurl,item.page)
        });
        // if(i==1){
        //     break;
        // }
    }

    console.log("获取动画明细信息完成，开始插入数据库");
    await query(sql.substring(0, sql.length - 1), query_list);
    await query(sql_line.substring(0, sql_line.length - 1), query_line);
    await query(sql_episode.substring(0, sql_episode.length - 1), query_episode);

    console.log("插入成功");
}

function AnalysisLines(lines, id, query_line, sql_line){
    lines.forEach(item => {
        sql_line += `(?,?,?,?,?),`;
        query_line.push(item.id,item.title,item.url,item.status,id);
    });
    return {sql_line, query_line}
}

function AnalysisEpisode(episode, id, query_episode, sql_episode){
    episode.forEach(item => {
        sql_episode += '(?,?,?,?,?,?,?,?,?,?,?,?,?,?),';
        query_episode.push(item.id,item.episode,item.title,id,item.is_sp,item.sort,item.create_time,item.ctime,item.source,item.sign,item.vid,item.play,item.vurl,item.page)
    });
    return {query_episode, sql_episode};
}

// 处理特殊字符
function ProString(){

}

// 入口
(async () => {
    await indexSpider();
})();
  
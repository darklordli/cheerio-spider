/**
 * [nodejs爬虫]
 * @author coolli2@163.com
 * @date 2017.6.12
 **/

const http = require('http');
const path = require('path');
const fs = require('fs');
const cheerio = require('cheerio');
const axios = require('axios');
const mkdirp = require('mkdirp');


//爬虫配置--地址等...
const spyderconfig={
  url:'http://www.roobo.com',
  ajax: axios.create({
      baseURL: 'https://www.easy-mock.com/mock/59003ddc739ac1685205d8de/new-res',
      timeout: 30000
  })
}

//定时任务配置
const scheduleconfig={
  url : 'http://www.roobo.com',
}


 //定义爬
let spiderfun = async () => {
  let thisreturn =await axios.get(spyderconfig.url);
  console.log('开始分析页面数据',spyderconfig.url);
  const $ = cheerio.load(thisreturn.data);
  //定义结果json
  let resultjson = [];
  console.log($("#pro ul li").length);
  // resultjson = $("#pro ul li").map((i,val)=>{
  //   return {
  //     id:i,
  //     pic:$(val).find('img').attr("src"),
  //     detaillink:$(val).find('a').attr("href"),
  //     name:$(val).find('a').find("h3").text(),
  //     title:$(val).find("h3").text()
  //   }
  // });
  //
  //
  $("#pro ul li").each((i,val)=>{
    resultjson[i]={
      id:i,
      pic:'http://www.roobo.com/'+$(val).find('img').attr("src"),
      detaillink:$(val).children('a').attr("href"),
      name:$(val).find('.text-content').find("h3").text(),
      title:$(val).find('.text-content').find("span").text()
    }
  });
  console.log('页面分析完成，开始写入文件');
  // 建立目录
  let newdir = path.join(__dirname,'dist')
  let direxists= fs.exists(newdir);
  if (direxists)
  {
    console.log('目录已经存在,开始写入文件')
  }
  else{
    mkdirp(newdir+ '/json');
    mkdirp(newdir+ '/pic');
    console.log('目录建立完成,开始写入文件')
  }

  //写入之前需要专程字符串，不然写入的全是[object]
  fs.writeFile(newdir+'/json/'+'cate.json',
              JSON.stringify(resultjson),
              'utf-8',
              function(err) {
      if (err) {
          console.log(err)
      }
      console.log('JSON写入成功');
      console.log("------------------------------");
  });


  //保存图片
    resultjson.forEach(async (val,index,array)=>{
      console.log(val.pic);
      let picdir = newdir+ '/pic';
      let picname = path.parse(val.pic).base;

      console.log(picname);
      let pic = await axios.get(val.pic);

      let ws = fs.createWriteStream(picdir+'/'+picname,{
            defaultEncoding:'utf8',
            fd: null,
            mode: 0o666,
            autoClose: true
        });

      ws.write(pic.data);
      ws.end();
      console.log('图片下载成功')
    })
      console.log('图片保存成功');
      console.log("------------------------------");
}


// 开始爬
spiderfun();

// //时间配置
// let rule = new schedule.RecurrenceRule();
// rule.second = 10;
//
// // 定时爬
// // let spiderGojob = schedule.scheduleJob(rule,spiderfun())
//
// let spiderGojob  = schedule.scheduleJob('0 * * * * *',spiderfun());

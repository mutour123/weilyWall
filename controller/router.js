//微信发送过来的图文，都以post方式发到根目录下'/',在这里处理通过微信公众号发来的图文
//接受xml并解析
const fs = require('fs')


const getRawBody = require('raw-body')
const utl = require('../utl/utl')
const weixin = require('../weixin/weixin')
const config = require('../config')
const io = require('../io')

/**
 * 处理微信post过来的信息
 * @param ctx
 * @returns {Promise<void>}
 */
exports.root = async (ctx) => {
    let xmlData = await getRawBody(ctx.req)//的到二进制数据
    let content =await  utl.parseXMLAsync(xmlData)//xml2js是异步的，返回promise对象，可以通过await的到真实的值
    let message = utl.formatMessage(content.xml)
    //console.log(message)//得到xml格式的字符串
    let MsgType = message.MsgType
    let date = Date.now()

    ctx.type = 'xml';

    if (MsgType === 'text') {//上墙只能发文字
        if (message.Content === '关闭微力墙') {
            config.modeIndex = 2
            ctx.body = `<xml>
                        <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
                        <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
                        <CreateTime>${date}</CreateTime>
                        <MsgType><![CDATA[text]]></MsgType>
                        <Content><![CDATA[已经关闭上墙模式]]></Content>
                      </xml>`
            return false
        }
        if (message.Content === '开启微力墙') {
            config.modeIndex = 1
            ctx.body = `<xml>
                        <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
                        <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
                        <CreateTime>${date}</CreateTime>
                        <MsgType><![CDATA[text]]></MsgType>
                        <Content><![CDATA[开启上墙模式，请开始你的表演]]></Content>
                      </xml>`
            return false
        }

        if (config.modeIndex === 1) {//微力墙模式
            console.log(1234567)
            let openID = message.FromUserName
            let userMsg =await weixin.getOpenID(openID)//获得微信OpenID相关信息
            userMsg=userMsg.data
            //广播到客户端
            io.broadcast('message', {
                user: userMsg,
                content: message.Content
            })

            //保存到本地。先从本地读取出来，push进去，在保存到本地
            fs.readFile('./static/wall.json', function (err,data) {
                if (err){
                    console.log(err)
                    return false
                }
                let wallData = JSON.parse(data)
                wallData.push({
                    name: userMsg.nickname,
                    headimg: userMsg.headimgurl,
                    content:  message.Content
                })
                wallData = JSON.stringify(wallData)
                fs.writeFile('./static/wall.json', wallData, (err) => {
                    if (err) throw err;
                });
            })

            //告诉微信上墙成功
            ctx.body = `<xml>
                        <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
                        <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
                        <CreateTime>${date}</CreateTime>
                        <MsgType><![CDATA[text]]></MsgType>
                        <Content><![CDATA[上墙成功]]></Content>
                      </xml>`

        }else{//不是上墙模式
            ctx.body = `<xml>
                        <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
                        <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
                        <CreateTime>${date}</CreateTime>
                        <MsgType><![CDATA[text]]></MsgType>
                        <Content><![CDATA[还未开启上墙模式]]></Content>
                      </xml>`
        }



    }else {//发送的不是文字
        ctx.body = `<xml>
                        <ToUserName><![CDATA[${message.FromUserName}]]></ToUserName>
                        <FromUserName><![CDATA[${message.ToUserName}]]></FromUserName>
                        <CreateTime>${date}</CreateTime>
                        <MsgType><![CDATA[text]]></MsgType>
                        <Content><![CDATA[发送的不是文字]]></Content>
                      </xml>`
    }
}

/**
 * 打开微信墙
 * @param ctx
 * @returns {Promise<void>}
 */

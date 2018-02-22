//这里是写关于微信操作的代码
/*
* 1. 验证服务器
* 2. 获取access_token, 并保存
* 3. 验证access_token的有效性
* */
const fs = require('fs')
const axios = require('axios')

/**
 * 得到access_token
 * 传入config配置，得到access_token并保存到token.json文件中
 * @param config
 */
exports.getAccessToken = (config) =>{
    let accessTokenApi = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${config.wechat.appID}&secret=${config.wechat.appSecret}`
    axios.get(accessTokenApi)
        .then(function (response) {
            console.log("成功");
            console.log(response.data);
            let accessToken = response.data.access_token
            let expires_in = response.data.expires_in
            let dateTime = new Date().getTime()
            let token = {
                token: accessToken,
                expires_in: expires_in,
                date_time: dateTime
            }
            let a = JSON.stringify(token)
            console.log(a)
            fs.writeFile('./token.json', a, (err) => {
                if (err) throw err;
                console.log('The file has been saved!');
            });

        })
        .catch(function (error) {
            console.log("失败");
            console.log(error);
        });
}

/**
 * 得到从本地的token.json中获取access_token
 * @returns {any}
 */
getLocToken = () =>{
    let data = fs.readFileSync('./token.json','utf8');
    let tokenObject = JSON.parse(data)
    return tokenObject
}
exports.getLocToken = getLocToken

/**
 * 检查access_token是否有效
 * @returns {boolean}
 */
exports.checkValide = () => {
    let tokenObject = getLocToken()
    // console.log(tokenObject)
    //获取时间判断是否有效
    let nowTime = new Date().getTime()
    if (nowTime - tokenObject.date_time > 7000000) {
        return false
    } else {
        return true
    }
}


//////////////////////////////////////////////////////////////////////

// 写微信的相关业务逻辑，需要用到access_token
/**
 * 设置菜单
 */
exports.setMenu = () => {
    /*
    * 创建的时候是一个post请求，post是一个对象，在对象里配置每一个菜单的类型
    * */
    //菜单对象
    let menu = {
        "button":[
            {
                "name":"实验室",
                "sub_button":[
                    {
                        "type":"click",
                        "name":"历届成员",
                        "key":"member"
                    },
                    {
                        "type":"click",
                        "name":"关于我们",
                        "key":"about_us"
                    },
                    {
                        "type":"click",
                        "name":"学习资源",
                        "key":"study_source"
                    },
                    {
                        "type":"click",
                        "name":"加入我们",
                        "key":"join_us"
                    }]
            },
            {
                "name": "学习支持",
                "sub_button": [
                    {
                        "type":"click",
                        "name":"微力墙",
                        "key":"weily_wall"
                    },
                    {
                        "type":"view",
                        "name":"课程表",
                        "url":"http://19917230vj.51mypc.cn/class_login"
                    }
                ]
            }
        ]
    }
    let tokenObject = getLocToken()
    let api = ` https://api.weixin.qq.com/cgi-bin/menu/create?access_token=${tokenObject.token}`
    axios.post(api,menu).then(function (res) {
        console.log("成功")
        console.log(res.data)
    }).catch(function (err) {
        console.log("失败")
        console.log(err)
    })
}

/**
 * 获取菜单配置
 */
exports.getMenu = () => {
    let tokenObject = getLocToken()
    let api = ` https://api.weixin.qq.com/cgi-bin/get_current_selfmenu_info?access_token=${tokenObject.token}`
    axios.get(api).then(function (res) {
        console.log(res.data)
        // console.log(Object.prototype.toString.apply(res.data))
    }).catch(function (err) {
        console.log(err)
    })
}

/**
 * 删除菜单
 */
exports.delMunu = () => {
    let tokenObject = getLocToken()
    let api = `https://api.weixin.qq.com/cgi-bin/menu/delete?access_token=${tokenObject.token}`
    axios.get(api).then(function (res) {
        console.log(res.data)
        // console.log(Object.prototype.toString.apply(res.data))
    }).catch(function (err) {
        console.log(err)
    })
}

/**
 * 得到用户的相关信息
 * @param openID
 * @returns {Promise<any>}
 */
exports.getOpenID = (openID) => {
    return new Promise((resolve, reject) => {
        let tokenObject = getLocToken()
        let api = `https://api.weixin.qq.com/cgi-bin/user/info?access_token=${tokenObject.token}&openid=${openID}&lang=zh_CN`
        axios.get(api).then(function (res) {
            resolve(res)
        }).catch(function (err) {
            reject(err)
        })
    })
}










const config = require('../weixin/config')
const weixin = require('../weixin/weixin')

exports.checkToken = async(ctx, next) => {
    //获取access_token，查看是否有效
    if (!weixin.checkValide()){
        //获取access_token,并保存到token.json中
        weixin.getAccessToken(config)
    }
    //这里是有有效access_token的过程
    await next()
}
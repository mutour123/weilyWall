//工具类代码：处理xml，json

const xml2js = require('xml2js')

/**
 * 传入xml字符串，得到xml对应的json的promise对象
 * @param xml
 * @returns {Promise<any>}
 */
exports.parseXMLAsync = (xml) => {
    return new Promise((resolve,reject)=>{
        xml2js.parseString(xml,{trim:true},function (err,content) {
            if(err)reject(err)
            else resolve(content)
        })
    })
}

/**
 * 传入经过parseXMLAsync处理得到的json对象（不是我们想要的格式），得到扁平的json对象
 * @param result
 * @returns {{}}
 */
exports.formatMessage = (result) => {
    let message = {}
    if (typeof result === 'object'){
        const keys = Object.keys(result)
        for (let  i=0;i<keys.length;i++){
            let item = result[keys[i]]//都得键值
            let key = keys[i]//键名
            if (!(item instanceof Array) ||item.length ===0) { //如果不是数组或者数组长度为0
                continue//跳过继续循环
            }
            //是数组且长度为1
            if (item.length === 1){
                let val = item[0]
                if (typeof val === 'object'){
                    message[key] = formatMessage(val)
                }else{
                    message[key] = (val||'').trim()
                }
            }else {
                message[key] = []
                for (let j =0 ;j < item.length; j++){
                    message[key].push(formatMessage(item[j]))
                }
            }
        }
    }
    return message
}

var mode = false;//1表示不是全屏，2表示全屏
var jingru = false;
var topjinru = false;
var isHave = false;
var orignObject;

$(function () {
    //初始化墙
    initWall()
    //升级为socket连接
    toBeSocket()
    //设置全屏模式
    quanping()
})

/**
 *定义一个函数产生随机颜色
 */
function getRandomColor() {
    //三原色，0-255.随机产生三个0-255之间的值，然后生成颜色
    var color = [];
    for (var i = 0; i<3; i++){
        color.push(~~(Math.random()*255))
    }
    return "rgb("+color[0]+','+color[1]+','+color[2]+")";
}

/**
 * 设置全屏
 */
function quanping() {
    //全屏模式
    $('#quanping').click(function () {
        if (!mode) {
            $('#quanping').text('退出全屏')
            mode = !mode
            $('body').css('paddingTop', '0px')
            $('header').css('opacity', '0')
        } else {
            $('#quanping').text('全屏模式')
            mode = !mode
            $('body').css('paddingTop', '60px')
            $('header').css('opacity', '1')
        }
    })

    $('#quanping').on('mouseenter', function () {
        jingru = !jingru //进入了 true
        $('header').css('opacity','1')
    })

    //显示header
    $('header').on('mouseenter', function () {
        if (mode === false) return
        $('body').css('paddingTop','0px')
        $('header').css('opacity','1')
    })
    $('header').on('mouseout', function () {

        if (jingru === true) {//从quanping  out  return false
            jingru = !jingru
            return false
        }
        if (mode === false) return
        $('header').css('opacity','0')
    })
}

/**
 * 初始化墙
 */
function initWall() {
    $.get("http://19917230vj.51mypc.cn/wall.json", function (result) {
        result.forEach(function (data) {
            initSection(data)
        })
    });
}

/**
 * 升级为socket并处理相关事宜
 */
function toBeSocket() {
    var socket = io();
    socket.emit('login', '一个连接进入')
    socket.on('message', function (data) {
        let newData = {
            name: data.user.nickname,
            content: data.content,
            headimg: data.user.headimgurl
        }
        initSection(newData)
        //获取最后一个元素
        toTheView('main section:last-child')
    })
}

/**
 * 初始化section
 * @param data
 */
function initSection(data) {
    var sec = $('<section>'),
        name = $('<a href="#">'),
        image = $('<img class="headimg" >'),
        toTop = $('<span class="to-top">'),
        content = $('<p>');
    name.text(data.name);
    content.text(data.content);
    toTop.text('置顶');
    let headImg = data.headimg || "http://thirdwx.qlogo.cn/mmopen/QRTaLgM6bICTcsLP2zoKrecQTY4OGzunvzr5DV3qo9A4aytwqZqsneYr6e4JcULuLMicKlN6ZBQR9iaMjZtISedFIHibD5ddHkB/132"
    image.attr('src', headImg);
    sec.css('backgroundColor', getRandomColor())
    sec.append(image);
    sec.append(toTop);
    sec.append(name);
    sec.append(content);
    $('main').append(sec);
    toTop[0].onclick= toTopFun;
}

/**
 * 让某个元素 出现在可视区域
 * @param select
 */
function toTheView(select) {
    $(select)[0].scrollIntoView();
}

/**
 * 点击置顶
 */
function toTopFun() {
    if (!isHave) {
        isHave = true
        toTopObj(this);
    }else{
        var objSection = $('header').find('section');
        objSection.remove()
        //让原本的置顶回到原处
        orignObject.css('display', 'block');
        toTopObj(this);
    }
}

/**
 * 设置置顶的对象
 * @param that
 */
function toTopObj(that) {
    if (!topjinru && mode) topjinru = true;
    if (mode) {//如果header没有显示，则设置为显示
        mode = false;
        $('header').css('opacity', '1');
    }
    var obj = $(that).parent();
    orignObject = obj;
    var thatObj = obj[0].cloneNode(true)
    $(thatObj).find('.to-top').text('取消');
    thatObj.onclick = function () {
        $(this).remove();
        if (topjinru) mode = true
        //并且设置为全屏
        $('header').css('minHeight', '60px');
        obj.css('display', 'block');
    }
    obj.css('display', 'none');
    $(thatObj).css({
        'position': 'absolute',
        'display': 'block',
        'top': 0,
        'bottom': 0,
        'left': 0,
        'right': 0
    })
    $('header').css('minHeight', '120px');
    $('header').append(thatObj)
}

/**
 * 获得需要遍历的类别
 */
function getType(obj){
    //tostring会返回对应不同的标签的构造函数
    var toString = Object.prototype.toString;
    var map = {
        '[object Boolean]'  : 'boolean',
        '[object Number]'   : 'number',
        '[object String]'   : 'string',
        '[object Function]' : 'function',
        '[object Array]'    : 'array',
        '[object Date]'     : 'date',
        '[object RegExp]'   : 'regExp',
        '[object Undefined]': 'undefined',
        '[object Null]'     : 'null',
        '[object Object]'   : 'object'
    };
    if(obj instanceof Element) {
        return 'element';
    }
    return map[toString.call(obj)];
}

/**
 *深拷贝
 */
function deepClone(data){
    var type = getType(data);
    var obj;
    if(type === 'array'){
        obj = [];
    } else if(type === 'object'){
        obj = {};
    } else {
        //不再具有下一层次
        return data;
    }
    if(type === 'array'){
        for(var i = 0, len = data.length; i < len; i++){
            obj.push(deepClone(data[i]));
        }
    } else if(type === 'object'){
        for(var key in data){
            obj[key] = deepClone(data[key]);
        }
    }
    return obj;
}
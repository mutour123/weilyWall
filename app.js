const path = require('path');

const router = require('koa-router')()
const serve = require('koa-static')
const bodyParser = require('koa-bodyparser')

const rt = require('./controller/router')
const log = require('./utl/log')
const checkToken = require('./utl/checkAccessToken')
const app = require('./koa')
const io = require('./io')
io.attach( app )





app.use( serve(path.join(__dirname+ "/static")));
app.use(bodyParser())
app.use(log.log)//打印日志
app.use(checkToken.checkToken)//验证access_token
app.use(router.routes());

router.post('/', rt.root);



io.on( 'login', ( ctx, data ) => {
    console.log(data)
})

app.listen(80, function () {
    console.log('server is running at port 80 ....')
})

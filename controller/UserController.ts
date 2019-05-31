import { Context } from "koa";
import { readFile, readFileSync, createReadStream, createWriteStream, statSync, fstat, unlink, promises } from "fs";
import path from 'path';
import { User, findUser, createUser, updateUser } from '../module/User';
import sequelize from '../db';
import Artical from "../module/Artical";
import { Comment } from "../module/Comment";
import { CommentPraise } from "../module/CommentPraise";
import { ArticalPraise } from "../module/ArticalPraise";
import { Collect } from "../module/Collect";
import { getUserByidForUser, setUserHeadimg } from "../module/service/UserService";
import { logger } from "../utils/logger";
import { uploadfilepath } from "../config";
import { isfollower } from "../module/Follower";
import { sendIdentityCodeUtil, Intrandom, verifyVariable } from "../utils/utils";
import { setTimeout } from "timers";



//return favicon.ico TODO:BUG 
var favicon = async (ctx: Context, next: Function) => {
    var path = '/../static/img/favicon.ico';
    var maxAge;
    var cacheControl;
    let icon;
    await readFile(__dirname + '/../config.json', 'utf8', (err: NodeJS.ErrnoException, data: string) => {
        if (err) {
            logger.error(err);
            return;
        }
        let config = JSON.parse(data);
        maxAge = config.maxAge == null ? 86400000 : Math.min(Math.max(0, config.maxAge), 31556926000);
        cacheControl = `public, max-age=${maxAge / 1000 | 0}`;
        icon = readFileSync(__dirname + path);
        ctx.set('Cache-Control', cacheControl);
        ctx.type = 'image/x-icon';
        ctx.body = icon;
    });
}

var GETregist = async (ctx: Context, next: Function) => {
    ctx.response.type = 'html';
    ctx.response.body = createReadStream('./static/html/regist.htm');
    await next();
}

var POSTregist = async (ctx: Context, next: Function) => {
    var uname = ctx.request.body.username;
    var upassword = ctx.request.body.password;
    var ugender = ctx.request.body.gender || '';
    var phonenumber = ctx.request.body.phonenumber || '';
    var identifycode = ctx.request.body.identifycode;

    //TODO: more judgements
    if (!upassword || !/^1(3|4|5|7|8|9)\d{9}$/.test(phonenumber)) {
        ctx.response.body = { msg: 'please insure your phonenumber and password are alright' };
        ctx.type = 'json';
        await next();
        return;
    }
    if(uname == undefined){
        uname = phonenumber + '';
    }
    if(!PhonenumberExistAndDelete(phonenumber, parseInt(identifycode), true)){
        ctx.response.body = { msg: 'error: identifycode error or exceed the time' };
        ctx.type = 'json';
        return;
    }

    var newUserConfig = { username: uname, password: upassword, gender: ugender, phonenumber:phonenumber };

    if (!(await User.findOne({ where: { phonenumber: phonenumber } }))) {
        var newuser:any = await createUser(newUserConfig);
        Collect.create({UserId:newuser.id, title:"默认文集"});
        logger.info("create a User " + newuser.id + " " + newuser.username + " " + newuser.gender);
        ctx.cookies.set('userid', newuser.id);
        ctx.cookies.set('username', newUserConfig.username);
        if (ctx.request.body.android) {
            ctx.response.type = 'json';
            ctx.response.body = { msg: 'regist success' };
        } else
            ctx.redirect('/login');
    } else {
        logger.error("create a phonenumber " + phonenumber + " phonenumber has already exists");
        ctx.response.type = 'json'
        ctx.response.body = { msg: 'phonenumber has already exists' };
    }
    await next();
}

var GETlogin = async (ctx: Context, next: Function) => {
    ctx.response.type = 'html';
    ctx.response.body = createReadStream('./static/html/login.htm');
    await next();
}
var POSTlogin = async (ctx: Context, next: Function) => {
    var uname = ctx.request.body.username;
    var upassword = ctx.request.body.password;
    var phonenumber = ctx.request.body.phonenumber;
    //TODO: more judgements
    if (!verifyVariable(upassword, phonenumber)) {
        ctx.response.type = 'json';
        ctx.response.body = { msg: 'error: phonenumber or password cannot be null' };
        await next();
        return;
    }
    if (ctx.session.username) {
        if(ctx.request.body.android){
            ctx.myerr = "error: you have already login";
            await next();
            return;
        }
        ctx.body = `${ctx.session.username} 已经登录, 请勿重复登录`;
        await next();
        return;
    }

    var a:any = await findUser({ phonenumber: phonenumber, password: upassword });
    if (a) {
        ctx.session.username = a.username;
        ctx.session.userid = a.id;
        ctx.cookies.set('username', a.username, {
            httpOnly: false,
        });
        ctx.cookies.set('userid', a.id, {
            httpOnly: false,
        });

        logger.info(`${a.username} was login!`);
        if (ctx.request.body.android)//如果是安卓app则总是以json返回, 具体还要自己实现;
        {
            var aa = a.toJSON();
            delete aa.password;
            aa.collectCount = await a.countCollects();
            aa.articleCount = await a.countArticals();
            ctx.type = 'json';
            ctx.response.body = { msg: 'login success', data:aa};
        } else
            ctx.redirect('/welcome');
    } else {
        ctx.response.type = 'json';
        ctx.response.body = { msg: 'wrong password or username', data:{}};
    }
    await next();
}
var Welcome = async (ctx: Context, next: Function) => {
    if (ctx.session.username == null) {
        ctx.redirect('/login')
        return;
    }

    ctx.response.type = 'html';
    ctx.response.body = createReadStream('./static/html/success.htm');
    await next();
}


var sync = async (ctx: Context, next: Function) => {
    await sequelize.sync().then(async () => {
        await Comment.findAll();
        await CommentPraise.findAll();
        await User.findAll();
        await Artical.findAll();
        await ArticalPraise.findAll();
        await Collect.findAll();
    })
    ctx.response.type = 'html';
    ctx.response.body = 'sync success';
}

var logoff = async (ctx: Context, next: Function) => {
    ctx.session.username = null;
    ctx.session.userid = null;
    ctx.response.type = 'json';
    ctx.body = { msg: 'ok' };
}
interface IphoneIcode{
    phonenumber:number;
    phoneIcode:number;
    createdAt:number;
}

var phoneIcode:Array<IphoneIcode> = [];
var PhonenumberExistAndDelete = function(phonenumber:number, Icode:number, shouldDelete:boolean){
    for(var n of phoneIcode){
        if(n.createdAt + 30 * 60 * 1000 < Date.now()){//过期就删
            phoneIcode.splice(phoneIcode.indexOf(n), 1);
        }
        if(n.phonenumber == phonenumber && Icode == n.phoneIcode){
            if(n.createdAt + 30 * 60 * 1000 < Date.now()){
                return false;
            }
            if(shouldDelete){
                phoneIcode.splice(phoneIcode.indexOf(n), 1);
            }
            return true;
        }

    }
    return false;
}

var sendIdentifyCode = async(ctx:Context, next:Function)=>{
    var phonenumber = ctx.request.body.phonenumber;
    var randomnum = Intrandom(4);
    
    if(phonenumber == null || phonenumber == undefined || phonenumber.length != 11 || !/^1(3|4|5|7|8|9)\d{9}$/.test(phonenumber)){
        ctx.type = 'json';
        ctx.body = {msg:'错误的手机号格式'};
        return;
    }
    var isreturn;
    phoneIcode.forEach(function(value, index){
        if(value.phonenumber == parseInt(phonenumber) && value.createdAt + 30 * 1000 > Date.now() ){
            ctx.type = 'json';
            ctx.body = {msg:'发送过于频繁, 请30s后重试'};
            isreturn = true;
        }
    })
    if(isreturn == true){
        await next();
        return;
    }

    var user = await User.findOne({where:{phonenumber:phonenumber}});
    if(user){
        ctx.myerr = "手机号已存在";
        await next();
        return;
    }
    var okFlag = false;
    
    sendIdentityCodeUtil(phonenumber, "e1bc64cf7635d3a7b34814037097d1ec", parseInt(randomnum), function(err:any, res:any, resData:any){
        if(err){
            logger.error(JSON.stringify(err));
        }else{
            if(resData.errmsg == 'OK'){
                var isPhoneExist = false;
                phoneIcode.forEach(function(value, index){
                    if(value.phonenumber == parseInt(phonenumber)){
                        value.createdAt = Date.now();
                        value.phoneIcode = parseInt(randomnum);
                        isPhoneExist = true;
                    }
                });
                if(!isPhoneExist){
                    phoneIcode.push({phonenumber:phonenumber, phoneIcode:parseInt(randomnum), createdAt:Date.now()});
                }
                ctx.type = 'json';
                ctx.body = {msg:'ok'};
                logger.info("send identify code successfully");
            }else{
                ctx.myerr = "发送失败" + resData.errmsg;
                logger.info("send identify code error");
            }
        }
        okFlag = true;
    });
    while(!okFlag){
        await delay(1);
    }
    await next();
}
async function delay(time:number){
    return new Promise(function(resolve, reject){
        setTimeout(function(){
            resolve();
        },time);
    })
}
var updateUserConfig = async(ctx:Context, next:Function)=>{
    var tmpUser = JSON.parse(ctx.request.body.user);
    var uid = ctx.session.userid;

    if(tmpUser.id == null || tmpUser.id == undefined){
        ctx.myerr = "uid not found";
        return;
    }
    var user = await User.findOne({where:{id:uid}});
    if(user){
        try{
            await updateUser(tmpUser, user);
        }catch(err){
            ctx.myerr = 'error:' + err;
            return;
        }
        ctx.type = 'json';
        ctx.body = {msg:'ok', data:tmpUser};
    }else{
        ctx.myerr = "user not found";
        return;
    }

}

module.exports = {
    'GET /favicon.ico': favicon,
    'GET /login': GETlogin,
    'GET /signOn': GETregist,
    'POST /signOn': POSTregist,
    'POST /login': POSTlogin,
    'GET /welcome': Welcome,
    'GET /sync': sync,
    'POST /logoff': logoff,
    'GET /logoff': logoff,
    'POST /imsg': sendIdentifyCode,
    'POST /updateUser':updateUserConfig,
    'POST /getuser': async (ctx: Context, next: Function) => {
        var id;
        var huser: any = { msg: "error" }
        try {
            id = ctx.request.body.id;
        } catch (err) {
            ctx.type = 'json';
            ctx.body = huser;
            logger.error("getuser userid not undefined " + err);
        }
        try {
            huser = await getUserByidForUser(id);
            huser.isfollower = await isfollower(huser.id, ctx.session.userid);
            ctx.type = 'json';
            ctx.body = huser;
            logger.info("send data" + huser.username);
        } catch (error) {
            logger.error(error);
            ctx.myerr="cannot find user";
        }
    },
    'POST /uploadfile': async (ctx: any, next: Function) => {
        const file: any = ctx.request.files.file;

        return ctx.body = '上传成功';
    },
    'POST /uploadfiles': async (ctx: Context, next: Function) => {
        const files: any = ctx.request.files;
        for (let file of files) {
            const reader = createReadStream(file.path);
            let filepath = path.join(uploadfilepath + `/${file.name}`);
            const upStream = createWriteStream(filepath);
            reader.pipe(upStream);
        }
        return ctx.body = '上传成功';
    },
    'POST /downloadfile': async (ctx: Context, next: Function) => {
        let filenp = ctx.request.body.filename;
        let filepath = uploadfilepath + filenp;
        var stats = statSync(filepath);

        ctx.set('Content-Type', 'application/octet-stream');
        ctx.set('Content-Disposition', 'attachement;filename=' + filenp);
        ctx.set('Content-Length', String(stats.size));
        return ctx.body = createReadStream(filepath);
    },
    'POST /uploadHeadimg': async (ctx: Context, next: Function) => {
        try {
            const userid = ctx.session.userid;
            var file:any = ctx.request.files
            if(file){
                file = file.file;
                if(file.name=='' || file.name == undefined || file.size == 0){
                    ctx.type = 'json';
                    ctx.body = {msg:'error no file upload!'};
                    unlink(file.name, function(err){
                        if(err){
                            logger.error(err);
                        }
                        logger.info('0 size文件删除成功');
                    });
                    return;
                }
            }
            const filename = file.name;
            if (!(filename.endWith('.jpg') || filename.endWith('.png'))) {
                ctx.body = { msg: 'error 上传的文件不是已.jpg | .png命名的' }
                ctx.type = 'json';
            } else {
                if (await setUserHeadimg(userid, filename)) {
                    ctx.body = { msg: 'ok', imgdir:filename };
                    ctx.type = 'json';
                } else {
                    ctx.body = { msg: 'error: 保存失败, 用户不存在, 请重新登陆' };
                    ctx.type = 'json';
                }
            }
        } catch (err) {
            logger.error(err);
        }
    }
};
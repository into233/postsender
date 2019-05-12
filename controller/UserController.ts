import { Context } from "koa";
import { readFile, readFileSync, createReadStream, createWriteStream, statSync, fstat, unlink } from "fs";
import path from 'path';
import { User, findUser, createUser } from '../module/User';
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
import { where } from "sequelize/types";



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
    var phonenumber = ctx.request.body.phonenumber || null;

    //TODO: more judgements
    if (!uname || !upassword) {
        ctx.response.body = { msg: 'input valide' };
        return;
    }
    var newUserConfig = { username: uname, password: upassword, gender: ugender, phonenumber:phonenumber };

    if (!(await User.findOne({ where: { username: uname } }))) {
        var newuser = await createUser(newUserConfig);
        Collect.create({UserId:newuser.id, title:"默认文集"});
        logger.info("create a User " + newuser.id + " " + newuser.username + " " + newuser.gender);
        ctx.cookies.set('username', newUserConfig.username);
        if (ctx.request.body.android) {
            ctx.response.type = 'json';
            ctx.response.body = { msg: 'regist success' };
        } else
            ctx.redirect('/login');
    } else {
        logger.error("create a Username " + uname + " username has already exists");
        ctx.response.type = 'json'
        ctx.response.body = { msg: 'username has already exists' };
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
    //TODO: more judgements
    if (!uname || !upassword) {
        ctx.response.type = 'json';
        ctx.response.body = { msg: 'input valide' };
        return;
    }
    if (ctx.session.user) {
        ctx.body = `${ctx.session.username} 已经登录, 请勿重复登录`;
        return;
    }

    var a = await findUser({ username: uname, password: upassword });
    if (a) {
        ctx.session.username = uname;
        ctx.session.userid = a.id;
        ctx.cookies.set('username', uname, {
            httpOnly: false,
        });

        logger.info(`${a.username} was login!`);
        if (ctx.request.body.android)//如果是安卓app则总是以json返回, 具体还要自己实现;
        {
            ctx.type = 'json';
            ctx.response.body = { msg: 'login success' };
        } else
            ctx.redirect('/welcome');
    } else {
        ctx.response.type = 'json';
        ctx.response.body = { msg: 'wrong password or username' };
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
import { Context } from "koa";
import { readFile, readFileSync, createReadStream, createWriteStream, statSync} from "fs";
import path from 'path';
import { User, findUser, createUser } from '../module/User';
import sequelize from '../db';
import Artical from "../module/Artical";
import { Comment } from "../module/Comment";
import { CommentPraise } from "../module/CommentPraise";
import { ArticalPraise } from "../module/ArticalPraise";
import { Collect } from "../module/Collect";
import { getUserByidForUser } from "../module/service/UserServiece";
import { logger } from "../utils/logger";
import { uploadfilepath } from "../config";




var addUser = async (ctx: Context, next: Function) => {
    var nuser = await createUser({
        username: 'tion',
        password: '123456',
        gender: 'male',
    });
    var narticle = await Artical.create({
        title: 'fjkdsa',
        content: 'jfkdsakclxv',
        imagedir: '/home/tion/node/static/image/ASDKFDLSOEIFLXLVIDOSOFOXSNFJDISO.jpg',
    })
    await nuser.addArtical(narticle);

    var article = await Artical.findOne({ where: { title: 'fjkdsa' } });
    if (article) {
        var au = await article.getUser();
        console.log(au.id);
    }

    console.log(nuser.id);
}
var cookietest = async (ctx: Context, next: Function) => {
    var lastVisit = ctx.cookies.get('lastvisit');
    ctx.cookies.set('lastvisit', new Date().toString(), { signed: false });
    if (!lastVisit) {
        ctx.response.set('header', ['Content-Type', 'text/plain']);
        ctx.body = 'Welcome, first time vistor!';
    } else {
        ctx.response.set('header', ['Content-Type', 'text/plain']);
        ctx.body = 'Welcome back! Nothing much changed since your last visit at ' + lastVisit + '.';
    }
}

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

    //TODO: more judgements
    if (!uname || !upassword) {
        ctx.response.body = { msg: 'input valide' };
        return;
    }


    var newUserConfig = { username: uname, password: upassword, gender: ugender };

    if (!(await User.findOne({ where: { username: uname } }))) {
        var newuser = await createUser(newUserConfig);
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

    var a = await findUser({ username: uname, password: upassword });
    if (a) {
        ctx.session.username = { uname };
        ctx.session.userid = { userid:a.id };
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
module.exports = {
    'GET /addUser': addUser,
    'GET /cookietest': cookietest,
    'GET /favicon.ico': favicon,
    'GET /login': GETlogin,
    'GET /signOn': GETregist,
    'POST /signOn': POSTregist,
    'POST /login': POSTlogin,
    'GET /welcome': Welcome,
    'GET /sync': sync,
    'GET /getuser/:id': async (ctx: Context, next: Function) => {
        var id = ctx.params.id;
        var huser: any = { msg: "error" }
        try {
            huser = await getUserByidForUser(id);
            ctx.type = 'json';
            ctx.body = huser;
            logger.info("send data" + huser.username);
        } catch (error) {
            logger.error(error);
        }
    }, 'POST /uploadfile': async (ctx: any, next: Function) => {
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
    }
};
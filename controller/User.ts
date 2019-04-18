import { Context } from "koa";
import { readFile, readFileSync, createReadStream } from "fs";
import {User} from '../module/User';
import sequelize from '../db';
import { createHash } from "crypto";
import Artical from "../module/Artical";


var addUser = async (ctx: Context, next: Function) => {
    var nuser = await User.create({
        name: 'tion',
        password: '123456',
        gender: 'male',
    });
    var narticle = await Artical.create({
        title:'fjkdsa',
        content:'jfkdsakclxv',
        imagedir:'/home/tion/node/static/image/ASDKFDLSOEIFLXLVIDOSOFOXSNFJDISO.jpg',
    })
    await nuser.addArtical(narticle);
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
            console.log(err);
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
        ctx.response.body = { message: 'input valide' };
        return;
    }
    var md5 = createHash('md5');
    upassword = md5.update(upassword).digest('hex');
    var newUserConfig = { name: uname, password: upassword, gender: ugender };

    if (!(await User.findOne({ where: { name: uname } }))) {
        var newuser = await User.create(newUserConfig);
        console.log("create a User " + newuser.id + " " + newuser.username + " " + newuser.gender);
        ctx.cookies.set('username', newUserConfig.name);

        ctx.redirect('/login');
    } else {
        ctx.response.body = 'username has already exists';
        console.log("create a User " + uname + " username has already exists");
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
        ctx.response.body = { message: 'input valide' };
        return;
    }
    var md5 = createHash('md5');

    upassword = md5.update(upassword).digest('hex');

    var a = await User.findOne({ where: { name: uname, password: upassword } });
    if (a) {
        ctx.session.username = { uname };
        ctx.cookies.set('username', uname);

        console.log(`${a.username} was login!`);
        ctx.redirect('/welcome');
    } else {
        ctx.response.type = 'json';
        ctx.response.body = 'wrong password or username';
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
    await sequelize.sync().then(() => {

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
};
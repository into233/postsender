import { Context } from "koa";
import * as db from "../db";
import { readFile, readFileSync, createReadStream } from "fs";

var MyUser = async (ctx: Context, next: Function) => {
    ctx.response.body = "hello world";
    console.log(ctx.request.header);

    await next;
}
var addUser = async (ctx: Context, next: Function) => {
    var nuser = await db.CMUser.create({
        name: 'tion',
        password: '123456',
        gender: 'male',
    });
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
var syncs = async (ctx: Context, next: Function) => {

    var bd = await db.fc();
    ctx.body = bd;
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
    var ugender = ctx.request.body.gender;

    //TODO: more judgements
    if (!uname || !upassword || !ugender) {
        ctx.response.body = { message: 'input valide' };
        return;
    }
    var newUserConfig = { name: uname, password: upassword, gender: ugender };

    if (!(await db.CMUser.findOne({ where: {name:uname} }))) {
        var newuser = await db.CMUser.create(newUserConfig);
        console.log("create a User " + newuser.id + " " + newuser.name + " " + newuser.gender);
        ctx.redirect('/signIn');
    } else {
        ctx.response.body = 'username has already exists';
        console.log("create a User " + uname + " username has already exists");
    }
    await next();
}

var GETsignIn = async (ctx: Context, next: Function) => {
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
    var a = await db.CMUser.findOne({ where: { name: uname, password: upassword } });
    if(a){
        console.log(`${a.name} was login!`);
        ctx.redirect('/welcome');
    }else{
        ctx.response.type='json';
        ctx.response.body = 'wrong password or username';
    }
    await next();

}
var Welcome = async (ctx: Context, next: Function) => {
    ctx.response.type = 'html';

    ctx.response.body = createReadStream('./static/html/success.htm');
    await next();
}
module.exports = {
    'GET /User': MyUser,
    'GET /addUser': addUser,
    'GET /sync': syncs,
    'GET /cookietest': cookietest,
    'GET /favicon.ico': favicon,
    'GET /signIn': GETsignIn,
    'GET /signOn': GETregist,
    'POST /signOn': POSTregist,
    'POST /signIn': POSTlogin,
    'GET /welcome': Welcome,
};
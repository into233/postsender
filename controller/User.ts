import { Context } from "koa";
import * as db from "../db"

var MyUser = async(ctx:Context, next:Function)=>{
    ctx.response.body = "hello world";
    console.log(ctx.request.header);
    
    await next;
}
var addUser = async(ctx:Context, next:Function)=>{
    var nuser = await db.CMUser.create({name:'tion',
    password:'123456',
    gender:'male',});
    console.log(nuser.id);
}
var cookietest = async(ctx:Context, next:Function)=>{
    var lastVisit = ctx.cookies.get('lastvisit');
    ctx.cookies.set('lastvisit', new Date().toString(), {signed:false});
    if(!lastVisit){
        ctx.response.set('header', ['Content-Type','text/plain']);
        ctx.body = 'Welcome, first time vistor!';
    }else{
        ctx.response.set('header', ['Content-Type','text/plain']);
        ctx.body = 'Welcome back! Nothing much changed since your last visit at ' + lastVisit + '.';
    }
}
var syncs = async(ctx:Context, next:Function)=>{
       
    var bd = await db.fc();
    ctx.body = bd;
}
module.exports = {
    'GET /User':MyUser,
    'GET /addUser':addUser,
    'GET /sync':syncs,
    'GET /cookietest':cookietest
};
import { Context } from "koa";
import * as db from "../db"

var MyUser = async(ctx:Context, next:Function)=>{
    ctx.response.body = "hello world";
    await next;
}
var addUser = async(ctx:Context, next:Function)=>{
    var nuser = await ctx.db.MDUser.create({name:'tion',
    password:'123456',
    gender:'male',});
    console.log(nuser.id);
}
var syncs = async(ctx:Context, next:Function)=>{
       
    var bd = await db.fc();
    ctx.body = bd;
    
}
module.exports = {
    'GET /User':MyUser,
    'GET /addUser':addUser,
    'GET /sync':syncs,
};
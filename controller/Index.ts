var Index = async(ctx:any, next:any)=>{
    ctx.response.body = "This is index";
    await next;
}

module.exports = {
    'GET /index':Index,
    'GET /':Index,
    'GET /index.html':Index,
};
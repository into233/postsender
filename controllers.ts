import { Router } from "express";
import { logger } from "./utils/logger";

//add all controllers to route
const fs = require('fs');

function addMapping(router:Router, filepath:string){
    var Mappings = require(filepath);
    for(let url in Mappings){
        if(url.startsWith('GET')){
            let path = url.substring(4);
            router.get(path, Mappings[url]);
            logger.info(`add GET maping: ${path}`)
        }else if(url.startsWith('POST')){
            let path = url.substring(5);
            router.post(path, Mappings[url]);
            logger.info(`add POST maping: ${path}`)
        }else if(url.startsWith('DELETE')){
            let path = url.substring(7);
            router.delete(path, Mappings[url]);
            logger.info(`add DELETE maping: ${path}`)
        }else{
            logger.error(`invalid URL:${url}`)
        }
    }
}


function addControllerss(router:Router, controller_dir:string){
    var dir = __dirname + controller_dir;
    var files = fs.readdirSync(dir);
    var jsfiles = files.filter((f:string)=>{
        return f.endsWith('.js');
    })
    for(var file of jsfiles){
        logger.info(`Process controller file ${file}`);
        addMapping(router, dir + "/"+ file );
    }
}

module.exports = function(dir:string){
    let controller_path = dir || '/controller';

    const router = require('koa-router')();
    addControllerss(router, controller_path);
    return router.routes();
}
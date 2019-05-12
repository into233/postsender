import Artical from "../Artical";
import { Op, or, CITEXT } from "sequelize";
import { logger } from "../../utils/logger";
import { User } from "../User";
import { isUserPraised } from "./ArticalParseService";
import { Collect } from "../Collect";

//推送文章根据服务器中存的有事先做好的日期大于今天的文章, 而且一天一篇一直到19年八月都可以实现 山寨版推送
var pushArticals = async (page: number | string, size: number | string, username: string | null) => {
    if (page == null) {
        page = 0;
    }
    if (size == null) {
        size = 10;
    }
    if (typeof page == 'string') {
        page = parseInt(page);
    }
    if (typeof size == 'string') {
        size = parseInt(size);
    }
    if (isNaN(size) || isNaN(page)) {
        throw new Error('NaN is not a number');
    }
    
    try {
        //返回时间小于当前时间的size条数据 以createAt的

        var articals: Artical[];
        var sendartical: any = [];
        //这里判断了userid 前台发过来的有username, 返回的数据中会带有isUserPraised即当前用户是否点过赞了
        
        articals = await Artical.findAll(
            {
                offset: page * size, limit: size,
                where:
                {
                    createdAt: {
                        [Op.lt]: new Date()
                    },
                },
                order: [['createdAt', 'DESC'],]
            });
        
        for (var artical in articals) {
            var counts = await articals[artical].countArticalPraises();
            sendartical[artical] = articals[artical].toJSON();
            sendartical[artical].articalpraise = counts;
            if (username && await isUserPraised(username, sendartical[artical].id)) {
                sendartical[artical].isUserPraised = true;
            } else {
                sendartical[artical].isUserPraised = false;
            }
        }
        logger.debug(articals);
        return sendartical;

    } catch (err) {
        logger.error('convert error or mysql error' + err);
        return null
    }
}

//只有本人和管理员有权删除
var deleteArtical = async(artical:Artical, user:User)=>{
    if(user.hasArtical(artical) || user.id < 10){
        await artical.destroy();
        return true;
    }else{
        return false;
    }
}

var getArticalfromCollect = async(collectid:number)=>{
    var collect = await Collect.findOne({where:{id:collectid}});
    if(collect){
        return await collect.getArticals().toJSON();
    }else{
        return false;
    }
}

var getArticalsByCollectId = async(collectid:number)=>{
    var collect = await Collect.findOne({where:{id:collectid}});
    if(collect){
        return await collect.getArticals().toJSON;
    }else{
        return false;
    }
}



export { pushArticals, deleteArtical, getArticalfromCollect, getArticalsByCollectId};
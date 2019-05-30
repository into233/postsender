import Artical from "../Artical";
import { Op, or, CITEXT } from "sequelize";
import { logger } from "../../utils/logger";
import { User } from "../User";
import { isUserPraised } from "./ArticalParseService";
import { Collect } from "../Collect";
import { Follower } from "../Follower";
import { Star } from "../Star";

//推送文章根据服务器中存的有事先做好的日期大于今天的文章, 而且一天一篇一直到19年八月都可以实现 山寨版推送
var pushArticals = async (page: number | string, size: number | string, userid: number | null) => {
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
            sendartical[artical] = await wrapArtical(articals[artical], userid);
        }
        logger.debug(articals);
        return sendartical;

    } catch (err) {
        logger.error('convert error or mysql error' + err);
        return null
    }
}

//只有本人和管理员有权删除
//如果是收藏的则删除收藏的记录
var deleteArtical = async (artical: Artical, user: User) => {
    if (user.hasArtical(artical) || user.id < 10) {
        await artical.destroy();
        return true;
    }
    else {
        var star = await Star.findOne({where:{ArticalId:artical.id, UserId:user.id}});
        if(star){
            star.destroy();
            return true;
        }
        return false;
    }
}

var getArticalfromCollect = async (collectid: number) => {
    var collect = await Collect.findOne({ where: { id: collectid } });
    if (collect) {
        return await collect.getArticals().toJSON();
    } else {
        return false;
    }
}

var getArticalsByCollectId = async (collectid: number, userid: number) => {
    var collect = await Collect.findOne({ where: { id: collectid } });
    if (collect) {
        var articals = await collect.getArticals();
        var articalJsonarr: Array<any> = [];

        for (var artical in articals) {
            articalJsonarr[artical] = await wrapArtical(articals[artical], userid);
        }
        return articalJsonarr;
    } else {
        return false;
    }
}

var wrapArtical = async (artical: Artical, userid: number | null) => {
    var counts = await artical.countArticalPraises();
    var articaljson: any = artical.toJSON();
    articaljson.articalpraise = counts;
    if (userid && await isUserPraised(userid, artical.id)) {
        articaljson.isUserPraised = true;
    } else {
        articaljson.isUserPraised = false;
    }
    //TODO:many other wrapper
    articaljson.starCount = await artical.countStars();
    articaljson.commentCount = await artical.countComments();
    return articaljson;
}

var pushPusherArtical = async (page: number, size: number, userid: number) => {
    if (page == null || size == undefined) {
        page = 0;
    }
    if (size == null || size == undefined) {
        size = 10;
    }

    try {
        //返回时间小于当前时间的size条数据 以createAt的

        var articals: Artical[];
        var sendartical: any = [];
        var fan = await User.findOne({ where: { id: userid } });
        if (fan) {
            var UsersId: Array<any> = [];
            (await Follower.findAll({ attributes: ['UserId'], where: { FanId: userid } })).forEach(function (Follower) {
                UsersId.push(Follower.getDataValue('UserId'));
            });
            articals = await Artical.findAll(
                {
                    offset: page * size, limit: size,
                    where:
                    {
                        createdAt: {
                            [Op.lt]: new Date()
                        },
                        UserId: {
                            [Op.eq]: UsersId
                        }
                    },
                    order: [['createdAt', 'DESC'],]
                });

            for (var artical in articals) {
                sendartical[artical] = await wrapArtical(articals[artical], fan.id);
            }
            logger.debug('pushPusherArtical' + articals);
            return sendartical;
        } else {
            throw new Error("fan not found in pushPusherArtical");
        }
    } catch (err) {
        logger.error('convert error or mysql error' + err);
        return null
    }
}

export { pushArticals, deleteArtical, getArticalfromCollect, getArticalsByCollectId, pushPusherArtical, wrapArtical};
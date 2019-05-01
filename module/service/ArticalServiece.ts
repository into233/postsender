import Artical from "../Artical";
import { Op, or, CITEXT } from "sequelize";
import { logger } from "../../utils/logger";
import { User } from "../User";
import { isUserPraised } from "./ArticalParse";

//推送文章根据服务器中存的有事先做好的日期大于今天的文章, 而且一天一篇一直到19年八月都可以实现 山寨版推送
var pushArticals = async (page: number | string, size: number | string, username: string | null) => {
    var userid:number|null = -1;
    if (page == null) {
        page = 1;
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
        throw new Error('NaN nan is not a number');
    }
    if (username) {
        var user = await User.findOne({ where: { username: username } });
        if(user){
            userid = user.id;
        }
    }
    try {
        //返回时间小于当前时间的size条数据 以createAt的

        var articals: Artical[];
        var sendartical: any = [];
        //这里判断了userid 前台发过来的有username, 返回的数据就会有限制
        if (userid && userid > 10) {
            articals = await Artical.findAll(
                {
                    offset: page * size, limit: size,
                    where:
                    {
                        createdAt: {
                            [Op.lt]: new Date()
                        },
                        UserId: { [Op.eq]: userid },
                    },
                    order: [['createdAt', 'DESC'],]
                });
        } else {
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
        }
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

export { pushArticals };
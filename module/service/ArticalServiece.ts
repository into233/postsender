import Artical from "../Artical";
import { Op, or, CITEXT } from "sequelize";
import { logger } from "../../utils/logger";

//推送文章根据服务器中存的有事先做好的日期大于今天的文章, 而且一天一篇一直到19年八月都可以实现 山寨版推送
var pushArticals = async (page: number | string, size: number | string) => {
    try {
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
        //返回时间小于当前时间的size条数据 以createAt的
        var articals: any = await Artical.findAll(
            {
                offset: page * size, limit: size,
                where:
                {
                    createdAt: {
                        [Op.lt]: new Date()
                    }
                },
                order: [['createdAt', 'DESC'],]
            });
        for (var artical in articals) {
            articals[artical] = articals[artical].toJSON();
        }
        logger.debug(articals);
        return articals;

    } catch (err) {
        logger.error('convert error or mysql error' + err);
        return null
    }
}

export { pushArticals };
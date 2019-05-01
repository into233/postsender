import { createArticalPraise, ArticalPraise } from "../ArticalPraise";
import { User } from "../User";
import { logger } from "../../utils/logger";
import { error } from "util";


var parseArtical = async (username: string, articalid: number) => {
    try {
        var user = await User.findOne({ where: { username: username } });
        if (user) {
            var userid: number = user.id;
            createArticalPraise(articalid, userid);
            return 1;
        } else {
            throw Error('cannot find user');
        }
    } catch (err) {
        logger.error(err);
    }
}
var isUserPraised = async (username: string, articalid: number) => {
    try {
        var user = await User.findOne({ where: { username: username } });
        if (user) {
            var userid: number = user.id;
            if (await ArticalPraise.findOne({ where: { UserId: userid, ArticalId: articalid } })) {
                return true;
            } else {
                return false;
            }

        } else {
            throw Error('cannot find user');
        }
    } catch (err) {
        logger.error(err);
    }
}
var unPraiseArtical = async (username: string, articalid: number) => {
    try {
        var user = await User.findOne({ where: { username: username } });
        if (user) {
            var userid: number = user.id;
            var ap = await ArticalPraise.findOne({ where: { UserId: userid, ArticalId: articalid } });
            if(ap){
                ap.destroy();
            }
        } else {
            throw Error('cannot find user');
        }
    } catch (err) {
        logger.error(err);
    }
}
export { parseArtical, isUserPraised, unPraiseArtical };
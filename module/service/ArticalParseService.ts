import { createArticalPraise, ArticalPraise } from "../ArticalPraise";
import { User } from "../User";
import { logger } from "../../utils/logger";
import { error } from "util";


var parseArtical = async (userid: number, articalid: number) => {
    try {
        var user = await User.findOne({ where: { id: userid } });
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
var isUserPraised = async (userid: number, articalid: number) => {
    try {
        var user = await User.findOne({ where: { id: userid } });
        if (user) {
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
var unPraiseArtical = async (userid: number, articalid: number) => {
    try {
        var user = await User.findOne({ where: { id: userid } });
        if (user) {
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
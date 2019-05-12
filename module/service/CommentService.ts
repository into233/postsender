import Artical from "../Artical";
import { Comment } from "../Comment";
import { Op } from "sequelize";
import { User } from "../User";
import { isUserPraiseComment } from "./CommentPraiseService";


var pushAllUsergetComments = async (userid: number) => {
    var userid = userid;
    var user: any = null;
    if (userid) {
        user = await User.findOne({ where: { id: userid } });
    }
    if (userid != undefined && userid != null && user != null) {
        var articalsid: Array<any> = [];
        (await Artical.findAll({ attributes: ['id'], where: { UserId: userid } })).forEach(function (artical) {
            articalsid.push(artical.getDataValue('id'));
        })
        var comments = await Comment.findAll(
            {
                where:
                {
                    ArticalId: articalsid,
                    createdAt: {
                        [Op.lt]: new Date()
                    },
                },
                order: [['createdAt', 'DESC'],],
            });
        var commentsJson: Array<any> = [];

        for (var comment in comments) {
            commentsJson[comment] = await wrapComment(comments[comment], user);
        }
        return commentsJson;
    } else {
        return false;
    }
}
var wrapComment = async(comment: Comment, user:User)=>{
    var commentJson: any = comment.toJSON();
    commentJson.username = user.username;
    commentJson.isUserPraise = await isUserPraiseComment(user.id, comment.id);
    commentJson.commentPraise = await comment.countCommentPraises();
    commentJson.img = user.headimage;
    return commentJson;
}

export { pushAllUsergetComments };
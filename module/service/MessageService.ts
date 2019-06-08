import { Message, MessageType } from "../Message";
import { User } from "../User";
import { Comment } from "../Comment";
import { ArticalPraise } from "../ArticalPraise";
import { Follower } from "../Follower";


var getMessages = async (userid: number) => {
    var messages = await Message.findAll({ where: { UserId: userid }, order:[['createdAt','DESC']] });
    var messageArrJson: Array<any> = [];
    if (messages.length > 0) {
        for (var message of messages) {
            messageArrJson.push(await wrapMessage(message));
        }
    }
    return messageArrJson;
}
var wrapMessage = async (message: Message) => {
    var messageJson: any = {};
    messageJson = message.toJSON();
    if (message.type == MessageType.addArticalPraise) {
        var articalpraise = await ArticalPraise.findOne({ where: { id: message.ArticalPraiseId } });
        if (articalpraise) {
            var wuser = await User.findOne({ where: { id: articalpraise.UserId } });
            if (wuser) {
                messageJson.username = wuser.username;
                messageJson.headimage = wuser.headimage;
                messageJson.ArticalId = articalpraise.ArticalId;
            }
        }
    } else if (message.type == MessageType.addComment) {
        var comment = await Comment.findOne({ where: { id: message.CommentId } });
        if (comment) {
            var wuser = await User.findOne({ where: { id: comment.UserId } });
            if (wuser) {
                messageJson.username = wuser.username;
                messageJson.headimage = wuser.headimage;
                messageJson.ArticalId = comment.ArticalId;
            }
        }
    } else if (message.type == MessageType.addFollower) {
        var follower = await Follower.findOne({ where: { id: message.FollowerId } });
        if (follower) {
            var wuser = await User.findOne({ where: { id: follower.FanId } });
            if (wuser) {
                messageJson.username = wuser.username;
                messageJson.headimage = wuser.headimage;
            }
        }
    }
    
    return messageJson;
}

export { getMessages, wrapMessage };
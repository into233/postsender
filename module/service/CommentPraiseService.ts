import { CommentPraise } from "../CommentPraise";

var isUserPraiseComment = async (userid:number, commentpraiseid:number)=>{
    var comment = await CommentPraise.findOne({where:{UserId:userid, CommentId:commentpraiseid}});
    if(comment){
        return true;
    }else{
        return false;
    }
}
export {isUserPraiseComment};
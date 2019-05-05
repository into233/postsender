import test from 'ava';
import sequelize from '../db';
import { createUser, User } from '../module/User';
import Artical from '../module/Artical';
import { createComment, Comment } from '../module/Comment';
import { createCommentPraise } from '../module/CommentPraise';

async function sync() {
    await sequelize.sync().then();
}
var user:User;
var artical:Artical;
var comment:Comment;
async function fakedata(){
    user = await createUser({username:'hao1233', password:'1314441', gender:'male'});
    artical = await Artical.create({content:'36000000000fdsjalvoxczviivi'});
    comment = await createComment({content:'hoho'});
}


test("comentpraise test", async t=>{
    await sync();
    await fakedata();
    t.true(user != null);
    t.true(artical != null);
    t.true(comment != null);
    if(artical && comment && user){
        await artical.addComment(comment);
        
        var commentPraise =await createCommentPraise(comment, user);
        t.is(commentPraise.UserId, user.id);
        var counts = await artical.getComments();
        var count = await counts[0].countCommentPraises();
        t.is(1, count);
        await commentPraise.destroy();
    }
    await user.destroy();
    await artical.destroy();
    await comment.destroy();
})
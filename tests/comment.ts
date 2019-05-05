import test from 'ava';
import { User, findUser } from '../module/User';
import Artical from '../module/Artical';
import sequelize from '../db';
import { createComment, Comment } from '../module/Comment';

async function sync() {
    await sequelize.sync().then();
}

// async function deleteData(data: any[]) {
//     if (data.length == 0) return;
//     const compose = data.map(async (i) => {
//         await i.destroy();
//     })
//     await Promise.all(compose);
// }


// async function distoryall() {
//     let users = await User.findAll();
//     let article = await Artical.findAll();

//     await Promise.all([deleteData(users), deleteData(article)]);
//     console.log('already delete all data');
// }
function randomfix() {
    return Math.random().toString(32).substring(2);
}

async function fakerdata() {
    var user = null;
    user = await findUser({ username: 'uzi', password: 'wdtt' });
    if (!(user))
        user = await User.create({
            username: 'uzi'+randomfix(),
            password: 'wdtt'+randomfix(),
            gender: 'female',
            headimage: 'fjdkafsfj/fdajk/fdsalfkda/'+randomfix(),
            phonenumber: 1259420802
        });
    var article = await Artical.create(
        {
            title: 'wxz'+randomfix(),
            content: 'wacrg'+randomfix(),
            imagedir: '/home/tion/node/static/image/+'+randomfix()+'.jpg',
        }
    );
    var comment1 = await createComment({ content: 'wocaozhentamajingcai' });

    if (user && article) {
        await user.addArtical(article);
        await user.addComment(comment1);
        await article.addComment(comment1);


        console.log('uzi data finished!');
    }
    return { user: user, artical: article, comment: comment1 };

}


test("comment test", async t => {
    await sync();
    // await destroyalldata();
    // await distoryall();
    var data = await fakerdata();
    var cm1 = await Comment.findOne({ where: { ArticalId: data.artical.id } });
    t.is(cm1 != null, true);
    t.is(data.artical != null, true);
    t.true(data.comment != null);
    if (cm1 && data.artical && data.user) {
        var cma = await cm1.getArtical();
        var cmu = await cm1.getUser();

        t.is(cm1.content, 'wocaozhentamajingcai');
        console.log('测试cmid 与 articalid');
        t.is(cma.id, data.artical.id);
        console.log('测试cmid 与 id');
        t.is(cmu.id, data.user.id);
        console.log('测试article.getcomments');
        var article_comments = await data.artical.getComments();
        t.true(article_comments != null);
        t.true(article_comments.length > 0);


        data.artical.destroy();
        data.comment.destroy();
        data.user.destroy();
    }
});
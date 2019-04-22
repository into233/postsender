import test from 'ava';
import { User, createUser } from '../module/User';
import Artical from '../module/Artical';
import sequelize from '../db';
import { createHash } from 'crypto';

//如果数据库为空则sequelize会根据model的属性, 同步该数据库, 否则不会
async function sync() {
    await sequelize.sync().then();
}
function randomfix() {
    return Math.random().toString(32).substring(2);
}
var usernamefak: string;
var articalcontentfak: string;
async function fakerdata() {
    usernamefak = 'faker' + randomfix();
    articalcontentfak = 'jfkdsakclxv' + randomfix();
    let user = await createUser({
        username: usernamefak,
        password: 'fakermd5',
        gender: 'male',
        headimage: 'fjdkafsfj',
        phonenumber: 13525912315
    });
    var article = await Artical.create({
        title: 'fjkdsa' + randomfix(),
        content: articalcontentfak,
        imagedir: '/home/tion/node/static/image/' + randomfix(),
    });
    await user.addArtical(article);

    console.log('fake data finished!');
}
function md5(str: string): string {
    let mdg = createHash('md5');
    return mdg.update(str).digest('hex');
}

test('test find method', async t => {
    await sync();
    // await distoryall();
    await fakerdata();
    t.true((await User.findAll()).length > 0);
    t.true((await Artical.findAll()).length > 0);

    let user = await User.findOne({ where: { username: usernamefak } });
    let article = await Artical.findOne({ where: { content: articalcontentfak } });
    if ((article) != null && user != null) {
        var auser = await article.getUser();
        t.is(auser.username, user.username);
    }

    t.not(user, null);
    if (user){
        t.is(user.password, md5("fakermd5"));
        t.is(user.username, usernamefak);
        user.destroy();
    }

    t.not(article, null);
    if (article) {
        // t.is(article.userid, user.id);//这里article返回的没有id
        article.destroy();
    }
})

test('test user create articals', async t => {
    let user = await createUser({
        username: 'faker' + randomfix(),
        password: 'fake5' + randomfix(),
        gender: 'male',
        headimage: randomfix(),
        phonenumber: 13525912315
    });
    let articalh = await user.createArtical({ content: 'here is a test user create articals' }).then(artical => {
        console.log(artical.id);
        console.log("user create artical success");
        t.true(artical != null);
        artical.destroy();

    }).catch(e => {
        console.log(e);
        console.log("user create artical failed");
    });
    user.destroy();
    // t.true(articalh != null);
    

})

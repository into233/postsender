import test from 'ava';
import { User, createUser, findUser } from '../module/User';
import Artical from '../module/Artical';
import sequelize from '../db';
import { createHash } from 'crypto';



// test('foo',t=>{
//     t.pass();
// })

// test('bar', async t => {
//     const bar = Promise.resolve('bar');
//     t.is(await bar, 'bar');
// })

// const hasLength = (t:ExecutionContext, input:string, expect:number)=>{
//     console.log('env is in ' + process.env.NODE_ENV);
//     t.is(input.length, expect);
// }
// test('bar has length 3', hasLength, 'bar', 3);

async function deleteData(data: any[]) {
    if (data.length == 0) return;
    const compose = data.map(async (i) => {
        await i.destroy();
    })
    await Promise.all(compose);
}


async function distoryall() {
    let users = await User.findAll();
    let article = await Artical.findAll();

    await Promise.all([deleteData(users), deleteData(article)]);
    console.log('already delete all data');
}


//如果数据库为空则sequelize会根据model的属性, 同步该数据库, 否则不会
async function sync() {
    await sequelize.sync().then();
}

async function fakerdata() {
    let user = await createUser({
        username: 'faker',
        password: 'fakermd5',
        gender: 'male',
        headimage: 'fjdkafsfj',
        phonenumber: 13525912315
    });
    var article = await Artical.create({
        title: 'fjkdsa',
        content: 'jfkdsakclxv',
        imagedir: '/home/tion/node/static/image/ASDKFDLSOEIFLXLVIDOSOFOXSNFJDISO.jpg',
    });
    await user.addArtical(article);

    console.log('fake data finished!');
}
function md5(str: string): string {
    let mdg = createHash('md5');
    return mdg.update(str).digest('hex');
}

test('test user create', async t => {
    await sync();
    await distoryall();
    await fakerdata();
    t.true((await User.findAll()).length > 0);
    t.true((await Artical.findAll()).length > 0);

})

test('test find method', async t => {
    let user = await User.findOne({ where: { username: 'faker' } });
    let article = await Artical.findOne({ where: { content: 'jfkdsakclxv' } });
    if ((article) != null && user != null) {
        var auser = await article.getUser();
        t.is(auser.username, user.username);
    }

    t.not(user, null);
    if (user)
        t.is(user.username, 'faker');

    t.not(article, null);
    if (article && user) {
        // t.is(article.userid, user.id);//这里article返回的没有id
        t.is(user.password, md5("fakermd5"));

    }
})


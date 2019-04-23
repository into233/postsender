import test from 'ava';
import { createUser } from '../module/User';
import Artical from '../module/Artical';
import { createComment } from '../module/Comment';
import { adddata, destroyalldata, sync } from '../utils/tests';
import { createArticalPraise } from '../module/ArticalPraise';

var datas: any = {};

async function fakedata() {
    adddata(datas, 'user', await createUser({ username: 'hao1231', password: '1314441', gender: 'male' }));
    adddata(datas, 'artical', await Artical.create({ content: '36000000000fdsjalvoxczviivi' }));
    adddata(datas, 'comment', await createComment({ content: 'hoho' }));
}


test("articalpraise test", async t => {
    await sync();
    await fakedata();

    adddata(datas, 'articalpraise', await createArticalPraise(datas.artical, datas.user));


    t.true(datas.user != null);
    t.true(datas.artical != null);
    t.true(datas.comment != null);
    t.true(datas.articalpraise!=null);
    if (datas.comment && datas.user &&datas.articalpraise) {
        t.is(datas.articalpraise.UserId, datas.user.id);
        await datas.articalpraise.destroy();
    }
    await destroyalldata(datas);
})
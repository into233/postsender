import test,{ExecutionContext} from 'ava';
import {User} from '../module/User';
import Artical from '../module/Artical';
import sequelize from '../db';
import {Hash, createHash} from 'crypto';



test('foo',t=>{
    t.pass();
})

test('bar', async t => {
    const bar = Promise.resolve('bar');
    t.is(await bar, 'bar');
})

const hasLength = (t:ExecutionContext, input:string, expect:number)=>{
    console.log(process.env.NODE_ENV);
    t.is(input.length, expect);
}
test('bar has length 3', hasLength, 'bar', 3);

async function deleteData(data:any[]){
    if(data.length==0)return;
    const compose = data.map(async(i)=>{
        console.log(i);
        await i.destroy();
    })
    await Promise.all(compose);
}


async function distoryall(){



    let users = await User.findAll();
    let article = await Artical.findAll();

    await Promise.all([deleteData(users), deleteData(article)]);
    console.log('already delete all data');
}


//如果数据库为空则根据model的属性, 同步该数据库
async function sync(){
    await sequelize.sync().then();
}

async function fakerdata(){
    let user = await User.create({
        name:'faker',
        password:'fakermd5',
        gender:'male',
        headimage:'fjdkafsfj',
        phonenumber:'13525912315'
    });
    var article = await Artical.create({
        title:'fjkdsa',
        content:'jfkdsakclxv',
        imagedir:'/home/tion/node/static/image/ASDKFDLSOEIFLXLVIDOSOFOXSNFJDISO.jpg',
    });
    await user.addArtical(article);

    console.log('fake data finished!');
}
function md5(str:string):string{
    let mdg = createHash('md5');
    return mdg.update(str).digest('hex');    

}
test('test user create', async t =>{
    await sync();
    await distoryall();
    await fakerdata();
    
    let user = await User.findOne({where:{name:'faker'}});
    let article = await Artical.findOne({where:{content:'jfkdsakclxv'}});
    t.not(user, null);
    if(user)
        t.is(user.username, 'faker');
    
    t.not(article, null);
    if(article && user){

        t.is(article.userid, user.id);
        t.is(user.password, md5("fakermd5"));
        
    }


    
})
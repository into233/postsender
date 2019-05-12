import test from "ava";
import { createFollower } from "../module/Follower";
import { sync } from "../utils/tests";
import { User } from "../module/User";
import { createStar } from "../module/Star";
import Artical from "../module/Artical";
import { Collect } from "../module/Collect";


test("follower test", async t=>{
    await sync();
    var user = await User.findOne({where:{id:1}});
    var fan = await User.findOne({where:{id:9}}) 

    t.true(user != null && fan != null);
    if(user && fan)
        await createFollower(user, fan);
})

test("star test", async t=>{

    var user = await User.findOne({where:{id:1}});
    var artical = await Artical.findOne({where:{id:127}});
    var collect = await Collect.findOne({where:{id:1}}); 
    t.true(user != null && artical != null && collect != null);
    if(user && artical && collect)
        createStar(user, artical, collect);
})
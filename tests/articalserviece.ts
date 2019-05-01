import test from "ava";
import { pushArticals } from "../module/service/ArticalServiece";

test('articalserviece test', async t=>{
    var pa:Array<any> = await pushArticals(0, 10, null);

    t.true(pa!=null);
    console.log(pa);
    if(pa){
        t.true(typeof pa.length == 'number');
    }
})
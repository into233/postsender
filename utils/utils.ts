import { createHash } from 'crypto';
import { request } from 'http';
import { stringify } from 'querystring';
import { logger } from './logger';
import { any } from 'bluebird';
var QcloudSms = require("qcloudsms_js");

var getJsonFromModelArr = async (modelarr: Array<any>, addfunc: Function) => {
    var Jsonarr: any = [];
    for (var index in modelarr) {
        Jsonarr[index] = modelarr[index].toJSON();
        await addfunc(modelarr[index], Jsonarr[index]);
    }
    return Jsonarr;
}

var verifyVariable = function (...args: any[]) {
    for (var i of args) {
        if (i == undefined || i == null) {
            return false;
        }
    }
    return true;
}

var Intrandom = function (n: number) {
    return parseInt((Math.random() * (10 ** 4)).toString());
}

var sha256 = function (value: any) {
    return createHash('SHA256').update(value.toString()).digest('hex');
}

var sendIdentityCodeUtil = async (phonenumber: string, AppKey: string, randomnum:number, sendcallback:Function) =>{

    // 短信应用 SDK AppID
    var appid = 1400202233;  // SDK AppID 以1400开头

    // 短信应用 SDK AppKey
    var appkey = AppKey;
    
    // 需要发送短信的手机号码
    var phoneNumbers = [phonenumber];

    // 短信模板 ID，需要在短信控制台中申请
    var templateId = '321375';  // NOTE: 这里的模板ID`7839`只是示例，真实的模板 ID 需要在短信控制台中申请

    // 签名
    var smsSign = "轻文学社区";  // NOTE: 签名参数使用的是`签名内容`，而不是`签名ID`。这里的签名"腾讯云"只是示例，真实的签名需要在短信控制台申请

    // 实例化 QcloudSms
    var qcloudsms = QcloudSms(appid, appkey);

    // 设置请求回调处理, 这里只是演示，用户需要自定义相应处理回调
    
    var ssender = qcloudsms.SmsSingleSender();
    await ssender.sendWithParam(86, phoneNumbers[0], templateId,
        [randomnum, 30], smsSign, "", "", sendcallback);

}

export { getJsonFromModelArr, verifyVariable, sha256, sendIdentityCodeUtil,Intrandom };
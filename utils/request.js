/*
 * @Author: your name
 * @Date: 2020-08-10 10:11:49
 * @LastEditTime: 2020-08-10 15:03:11
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: /smalltownstory/utils/request.js
 */
/*
 * 
 * 织梦版微信小程序
 * author: 鹏厄
 * 小镇故事66UI.com
 * 
 */
function wxPromisify(fn) {
    return function (obj = {}) {
        console.log('请求url :>> ', obj.url);
        return new Promise((resolve, reject) => {
            obj.success = function (res) {
                //成功
                resolve(res)
            }
            obj.fail = function (res) {
                //失败
                reject(res)
            }
            fn(obj)
        })
    }
}
//无论promise对象最后状态如何都会执行
Promise.prototype.finally = function (callback) {
    let P = this.constructor;
    return this.then(
        value => P.resolve(callback()).then(() => value),
        reason => P.resolve(callback()).then(() => { throw reason })
    );
};
/**
 * 微信请求get方法
 * url
 * data 以对象的格式传入
 */
function getRequest(url, data) {
    var getRequest = wxPromisify(wx.request)
    return getRequest({
        url: url,
        method: 'GET',
        data: data,
        header: {
            'Content-Type': 'application/json'
        }
    })
}

/**
 * 微信请求post方法封装
 * url
 * data 以对象的格式传入
 */
function postRequest(url, data) {
    var postRequest = wxPromisify(wx.request)
    return postRequest({
        url: url,
        method: 'POST',
        data: data,
        header: {
            "content-type": "application/json"
        },
    })
}

module.exports = {
    postRequest: postRequest,
    getRequest: getRequest
}
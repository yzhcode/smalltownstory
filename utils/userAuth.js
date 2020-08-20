/*
 * @Author: your name
 * @Date: 2020-08-17 17:36:01
 * @LastEditTime: 2020-08-20 11:27:08
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /smalltownstory/utils/userAuth.js
 */
var util = require('util.js');
var wxApi = require('wxApi.js')
var wxRequest = require('request.js')
var Api = require('api.js');
var Storage = require('storage.js');
var app = getApp();

module.exports = {
  userLogin: function () {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.checkLogin().then(res => {
        console.log(res);
        
        console.log("已登录，无需再登录: ",app.globalData.userLoginCode);
        if (!app.globalData.openid) {
          console.log("没有openid，准备获取openid: ", self);
          self.getOpenIdLocal(app.globalData.userLoginCode).then(res => {
            resolve(res);
          }).catch(error => {
            reject(error);
          });
          console.log("--------------");
        } else {
          resolve(res);
        }
      }).catch(err => {
        console.log(err);
        console.log("准备登录...");
        wx.login({
          success: function (res) {
            console.log("登录成功，code: ", res.code);
            if (res.code) {
              Storage.setGlobalData(app, 'userLoginCode',res.code);
              console.log("准备获取openid");
              self.getOpenIdLocal(res.code).then(res => {
                resolve(res);
              }).catch(error => {
                reject(error);
              });
            } else {
              console.log("code获取不成功");
              reject(res.code);
            }
          },
          fail: function (err) {
            console.log(err);
            reject(err);
          }
        });
      });
    })
  },

  getOpenIdLocal : function(userLoginCode) {
    return new Promise(function (resolve, reject) {
      let params = {
          appid:'wx6e378d204fde61b2',
          secret: '14ae9aed14a922bde7b878d59711ae42',
          js_code: userLoginCode,
          grant_type: 'authorization_code',
      }
      let url = 'https://api.weixin.qq.com/sns/jscode2session';
      var postOpenidRequest = wxRequest.getRequest(url, params);
      postOpenidRequest.then(response => {
        if (response.statusCode == 200) {
          Storage.setGlobalData(app, 'openid', response.data.openid);
          Storage.setGlobalData(app, 'sessionKey', response.data.session_key);
          console.log('openID: '+response.data.openid)
          console.log('session_key: '+response.data.session_key);  
          resolve(response);
        } else {
          console.log(response);
          reject(response);
        }
      }).catch(function (error) {
        console.log('error: ' + error);
        reject(error);
      })
    });
  },

  checkLogin: function() {
    return new Promise(function (resolve, reject) {
      wx.checkSession({
        success: function(){
          resolve("");
        },
        fail: function(){
          reject("");
        }
      });
    });
  },

  getUserWxInfo: function () {
    return new Promise(function (resolve, reject) {
      wx.getUserInfo({
        success: res => {
          console.log('getUserInfo :>> ', res);
          // 可以将 res 发送给后台解码出 unionId
          Storage.setGlobalData(app, 'userInfo', res.userInfo);
          // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
          // 所以此处加入 callback 以防止这种情况
          // Page里设置userInfoReadyCallback
          if (!app) {
            app = getApp();
          }
          if (app.userInfoReadyCallback) {
            app.userInfoReadyCallback(res)
          }

          resolve(res);
        },
        fail: error => {
          reject(error);
        }
      })
    });
  },

  getUserOtherInfo: function () {
    var url = Api.getOpenidUrl();   
    let args = {};     
    let userInfo = app.globalData.userInfo;
    args.avatarUrl = userInfo.avatarUrl;
    args.nickname = userInfo.nickName;
    args.gender = userInfo.gender;
    args.js_code = app.globalData.userLoginCode;
    var postOpenidRequest = wxRequest.postRequest(url, args);
    //获取openid
    return new Promise(function (resolve, reject) {
      postOpenidRequest.then(response => {
        if (response.data.status == '200') {
          console.log("获取角色: ", response.data)
          var userLevel={};
          if(response.data.userLevel) {
            userLevel=response.data.userLevel;
          } else {
            userLevel.level="0";
            userLevel.levelName="订阅者";
          }       
          Storage.setGlobalData(app, 'userLevel', userLevel);
          resolve(response);
        } else {
          console.log(response);
          reject(response);
        }
      }).catch(function (error) {
          console.log('error: ' + error);                        
          reject(error);
      })
    });
  },

  checkUserAuth: function () {
    return new Promise(function (resolve, reject) {
      wx.getSetting({
        success: res => {
          console.log(res.authSetting);
          var authSetting = res.authSetting;
          if (authSetting['scope.userInfo']) {
            resolve(res);
          } else if (!('scope.userInfo' in authSetting)) {
            console.log('未授权过');
            reject(1);
          } else {
            console.log('已授权过，被拒绝了');
            reject(2);
          }
        },
        fail: error => {
          console.log('获取授权配置失败: ', error);
          reject(error);
        }
      })
    });
  },

  userAuthorization: function () {
    var self = this;
    return new Promise(function (resolve, reject) {
      self.checkUserAuth().then(res => {
        self.getUserWxInfo().then(res => {
          resolve(res);
        }).catch(error => {
          reject(error);
        });
      }).catch(error => {
        if (error === 1) {
          reject(error);
        } else if (error === 2) {
          console.log('用户拒绝授权');
          reject(error);
        } else {
          reject(error);
        }
      });
    });
  },

  userAuthorizationFromPhoneSet: function () {
    return new Promise(function(resolve, reject) {  
      wx.showModal({
        title: '用户未授权',
        content: '如需正常使用评论、点赞、赞赏等功能需授权获取用户信息。是否在授权管理中选中“用户信息”?',
        showCancel: true,
        cancelColor: '#296fd0',
        confirmColor: '#296fd0',
        confirmText: '设置权限',
        success: function (res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.openSetting({
              success: function success(res) {
                console.log('打开设置', res.authSetting);
                var scopeUserInfo = res.authSetting["scope.userInfo"];
                if (scopeUserInfo) {
                  self.getUserWxInfo().then(res => {
                    resolve(res);
                  }).catch(error => {
                    reject(error);
                  });
                }
              }
            });
          }
        }
      });
    });
  },

  userLogout : function (appPage) {
    console.log('用户注销')
    Storage.removeGlobalData(app, 'userLoginCode');
    Storage.removeGlobalData(app, 'openid');
    Storage.removeGlobalData(app, 'userInfo');
    Storage.removeGlobalData(app, 'userLevel');
  }
}
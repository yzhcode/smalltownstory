/*
 * @Author: your name
 * @Date: 2020-08-14 14:36:01
 * @LastEditTime: 2020-08-14 16:53:49
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /smalltownstory/utils/wxUser.js
 */

let currentApp = null;
let wxUserCode = null;

function tryGetUserInfo() 
{
  if (!currentApp) {
    currentApp = getApp();
  }
  
  if (!currentApp.userInfoReadyCallback) {
    currentApp.userInfoReadyCallback = res => {
      setUserInfo(res.userInfo);
    }
  }

  if (!wxUserCode) {
    wx.login({
      success: res => {
        wxUserCode = res.code;
        // 发送 res.code 到后台换取 openId, sessionKey, unionId

        wx.getSetting({
          success: res => {
            if (res.authSetting['scope.userInfo']) {
              // 已经授权，可以直接调用 getUserInfo 获取头像昵称，不会弹框
              wx.getUserInfo({
                success: res => {
                  // 可以将 res 发送给后台解码出 unionId
                  setUserInfo(res.userInfo);
    
                  // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                  // 所以此处加入 callback 以防止这种情况
                  if (currentApp.userInfoReadyCallback) {
                    currentApp.userInfoReadyCallback(res)
                  }
                }
              })
            }
          }
        })
      }
    })
  }
}

function setUserInfo(userInfo, success) {
  currentApp.globalData.userInfo = userInfo;
  currentApp.globalData.userValid = YES;
  if (success) {
    success();
  }
}

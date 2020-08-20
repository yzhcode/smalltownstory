/*
 * @Author: your name
 * @Date: 2020-08-17 17:49:02
 * @LastEditTime: 2020-08-20 11:26:00
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /smalltownstory/utils/storage.js
 */

module.exports = {
  setGlobalData: function (app, key, value) {
    if (!app) {
      app = getApp();
    }
    console.log('app :>> ', app);
    if (key && value) {
      wx.setStorageSync(key, value);
      app.globalData[key] = value;
    }
  },

  removeGlobalData: function(app, key) {
    if (!app) {
      app = getApp();
    }
    wx.removeStorageSync(key);
    app.globalData[key] = undefined;
  },

  loadGlobalData: function() {
    
  }
}
/*
 * @Author: your name
 * @Date: 2020-08-10 08:35:54
 * @LastEditTime: 2020-08-10 15:11:34
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /smalltownstory/pages/index/index.js
 */
//index.js
//获取应用实例
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
// var WxParse = require('../../wxParse/wxParse.js');
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/request.js')
import config from '../../utils/config.js'
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    postsShowSwiperList: [],
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    var self = this;
    self.fetchTopFivePosts();



    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  getUserInfo: function (e) {
    console.log(e)
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
  fetchTopFivePosts: function () {
    var self = this;
    //获取滑动图片的文章
    var getPostsRequest = wxRequest.getRequest(Api.getSwiperPosts());
    getPostsRequest.then(response => {
      console.log('response.data :>> ', response.data);
      if (response.data.status == '200' && response.data.posts.length > 0) {
        
        self.setData({
          // postsShowSwiperList: response.data.posts,
          postsShowSwiperList: self.data.postsShowSwiperList.concat(response.data.posts.map(function (item) {
            if (item.post_medium_image == null || item.post_medium_image == '') {
              item.post_medium_image = "../../images/logo700.png";
            }
            return item;
          })),
          displaySwiper: "block"
        });
      } else {
        self.setData({
          displaySwiper: "none"
        });
      }

    }).catch(function (response) {
      console.log(response);
      self.setData({
        showerror: "block",
        floatDisplay: "none"
      });
    })
    .finally(function () {});
  },
  redictAppDetail: function (e) {
    // console.log('查看文章');
    console.log('e :>> ', e);
    var id = e.currentTarget.dataset.id;
    var redicttype = e.currentTarget.dataset.redicttype;
    var url = e.currentTarget.dataset.url == null ? '':e.currentTarget.dataset.url;
    var appid = e.currentTarget.dataset.appid == null ? '' : e.currentTarget.dataset.appid;
    
    if (redicttype == 'detailpage')//跳转到内容页
    {
        url = '../detail/detail?id=' + id;
        console.log('url :>> ', url);
        wx.navigateTo({
            url: url
        })
    }
    if (redicttype == 'apppage') {//跳转到小程序内部页面         
        wx.navigateTo({
            url: url
        })
    }
    else if (redicttype == 'webpage')//跳转到web-view内嵌的页面
    {
        url = '../webpage/webpage?url=' + url;
        wx.navigateTo({
            url: url
        })          
    }
    else if (redicttype == 'miniapp')//跳转到其他app
    {
        wx.navigateToMiniProgram({
            appId: appid,
            envVersion: 'release',
            path: url,
            success(res) {
                // 打开成功
            },
            fail: function (res) {
                console.log(res);
            }
        })
    }
},
})
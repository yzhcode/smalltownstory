/*
 * @Author: your name
 * @Date: 2020-08-13 16:53:01
 * @LastEditTime: 2020-08-19 17:30:58
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /smalltownstory/pages/person/person.js
 */
// pages/person/person.js

var UserAuth = require('../../utils/userAuth.js');
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
// var WxParse = require('../../wxParse/wxParse.js');
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/request.js')
import config from '../../utils/config.js'
import {
  userLogout
} from '../../utils/userAuth.js';
var pageCount = config.getPageCount;
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    hadAuth: false,
    userLevel: {},
    readLogs: [],
    topBarItems: [
      // id name selected 选中状态
      {
        id: '1',
        name: '浏览',
        selected: true
      },
      {
        id: '3',
        name: '点赞',
        selected: false
      },
      {
        id: '4',
        name: '收藏',
        selected: false
      },
      {
        id: '2',
        name: '评论',
        selected: false
      },
    ],
    tab: '1',
  },

  onLoad: function () {
    var self = this;
    UserAuth.userLogin().then(res => {
      self.userAuthorization().then(res => {
        
      }).catch(err => {
        hadAuth: false
      });
    }).catch(err => {
      hadAuth: false
    })

    wx.setNavigationBarTitle({
      title: '小镇故事 Life - 个人中心',
      success: function (res) {
        // success
      }
    });

    if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = res => {
        this.setData({
          userInfo: res.userInfo,
          hadAuth: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      self.getUserWxInfo();
    }
  },

  getUserWxInfo: function () {
    var self = this;
    UserAuth.getUserWxInfo().then(res => {
      self.setData({
        userInfo: app.globalData.userInfo,
        hadAuth: true
      })
    }).catch(err => {
      self.setData({
        hadAuth: false
      })
    });
  },

  getUserOtherInfo: function () {
    var self = this;
    UserAuth.getUserOtherInfo().then(res => {
      self.setData({
        userLevel: res
      })

      if (self.data.tab !== 0) {
        self.fetchPostsData(self.data.tab);
      } else {
        self.fetchPostsData("1");
      }
    }).catch(err => {

    });
  },

  userAuthorization: function () {
    let self = this;
    UserAuth.userAuthorization().then(res => {
      console.log('授权成功: ', res)
      self.setData({
        userInfo: app.globalData.userInfo,
        hadAuth: true
      })
      self.getUserOtherInfo();
    }).catch(error => {
      console.log('授权失败: ', error)
    });
  },

  updateUserInfo: function () {
    this.getUserWxInfo();
    this.getUserOtherInfo();
  },

  userLogout: function () {
    let self = this;
    UserAuth.userLogout();
    self.setData({
      userInfo: app.globalData.userInfo,
      hadAuth: false
    })
  },

  onTapTag: function (e) {
    var self = this;
    var tab = e.currentTarget.id;
    var topBarItems = self.data.topBarItems;
    // 切换topBarItem 
    for (var i = 0; i < topBarItems.length; i++) {
      if (tab == topBarItems[i].id) {
        topBarItems[i].selected = true;
      } else {
        topBarItems[i].selected = false;
      }
    }
    self.setData({
      topBarItems: topBarItems,
      tab: tab

    })
    if (tab !== 0) {
      this.fetchPostsData(tab);
    } else {
      this.fetchPostsData("1");
    }
  },

  redictDetail: function (e) {
    // console.log('查看文章');
    var id = e.currentTarget.id;
    var itemtype = e.currentTarget.dataset.itemtype;
    var url = "";
    if (itemtype == "1") {
      url = '../list/list?categoryID=' + id;
    } else {
      url = '../detail/detail?id=' + id;
    }

    wx.navigateTo({
      url: url
    })
  },

  fetchPostsData: function (tab) {
    var self = this;
    var count = 0;
    var openid = "";
    var userLevel = "";
    console.log('tab :>> ', tab);
    if (tab != '1') {
      if (UserAuth.checkLogin) {
        var openid = app.globalData.openid;
        var mid = self.data.userLevel['mid'];

        if (!(openid && mid)) {
          return
        }
      } else {
        return;
      }
    }

    if (tab == '1') {
      self.setData({
        readLogs: (wx.getStorageSync('readLogs') || []).map(function (log) {
          count++;
          return log;
        })
      });
    } else if (tab == '2') {
      self.setData({
        readLogs: []
      });
      var getMyCommentsPosts = wxRequest.getRequest(Api.getWeixinComment(mid));
      getMyCommentsPosts.then(response => {
        if (response.status == 200) {
          self.setData({
            readLogs: self.data.readLogs.concat(response.data.data.map(function (item) {
              count++;
              item[0] = item.id;
              item[1] = item.msg;
              return item;
            }))
          });
        }
      })
    } else if (tab == '3') {
      self.setData({
        readLogs: []
      });
      var getMylikePosts = wxRequest.getRequest(Api.getMyLikeUrl(mid));
      getMylikePosts.then(response => {
        if (response.status == 200) {
          self.setData({
            readLogs: self.data.readLogs.concat(response.data.data.map(function (item) {
              count++;
              item[0] = item.id;
              item[1] = item.title.rendered;
              item[2] = "0";
              return item;
            }))
          });
        }
      })

    } else if (tab == '4') {
      self.setData({
        readLogs: []
      });

      var getMyFavoritePosts = wxRequest.getRequest(Api.getMyFavorite(mid));
      getMyFavoritePosts.then(response => {
        console.log('response :>> ', response);
        if (response.statusCode == 200) {
          console.log('response.data.data :>> ', response.data.data);
          self.setData({
            readLogs: self.data.readLogs.concat(response.data.data.map(function (item) {
              count++;
              item[0] = item.id;
              item[1] = item.title.rendered;
              item[2] = "0";
              return item;
            }))
          });
        }
      })
    } else if (tab == '5') {
      self.setData({
        readLogs: []
      });
      var url = Api.getSubscription() + '?openid=' + openid;
      var getMysubPost = wxRequest.getRequest(url);
      getMysubPost.then(response => {
        if (response.status == 200) {
          var usermetaList = response.data.usermetaList;
          if (usermetaList) {
            self.setData({
              readLogs: self.data.readLogs.concat(usermetaList.map(function (item) {
                count++;
                item[0] = item.ID;
                item[1] = item.post_title;
                item[2] = "0";
                return item;
              }))
            });

          }
          if (count == 0) {
            self.setData({
              shownodata: 'block'
            });
          }
        } else {
          console.log(response);
          this.setData({
            showerror: 'block'
          });

        }
      })
    } else if (tab == '6') {
      self.setData({
        readLogs: []
      });
      var getNewComments = wxRequest.getRequest(Api.getNewComments());
      getNewComments.then(response => {
        if (response.statusCode == 200) {
          self.setData({
            readLogs: self.data.readLogs.concat(response.data.map(function (item) {
              count++;
              item[0] = item.post;
              item[1] = util.removeHTML(item.content.rendered + '(' + item.author_name + ')');
              item[2] = "0";
              return item;
            }))
          });
          if (count == 0) {
            self.setData({
              shownodata: 'block'
            });
          }

        } else {
          console.log(response);
          self.setData({
            showerror: 'block'
          });

        }
      }).catch(function () {
        console.log(response);
        self.setData({
          showerror: 'block'
        });

      })
    }
  }
})
/*
 * @Author: your name
 * @Date: 2020-08-10 08:35:54
 * @LastEditTime: 2020-08-11 16:52:48
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
var pageCount = config.getPageCount;
const app = getApp()

Page({
  data: {
    motto: 'Hello World',
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    postsShowSwiperList: [],
    topNav: [],
    postsList: [],

    page: 1,
    search: '',
    categories: 0,
    isLastPage: false
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
    self.fetchPostsData(self.data);
    self.setData({
      topNav: config.getIndexNav
    });


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
  onPullDownRefresh: function () {
    console.log('onPullDownRefresh');
    var self = this;
    self.setData({
      showerror: "none",
      showallDisplay: "block",
      displaySwiper: "none",
      floatDisplay: "none",
      isLastPage: false,
      page: 1,
      postsShowSwiperList: []
    });
    this.fetchTopFivePosts();
    this.fetchPostsData(self.data);
  },
  onReachBottom: function () {
    console.log('onReachBottom');
    var self = this;
    if (!self.data.isLastPage) {
      self.setData({
        page: self.data.page + 1
      });
      console.log('当前页' + self.data.page);
      this.fetchPostsData(self.data);
    } else {
      console.log('最后一页');
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
    var id = e.currentTarget.id;
    var redicttype = e.currentTarget.dataset.redicttype;
    var url = e.currentTarget.dataset.url == null ? '' : e.currentTarget.dataset.url;
    var appid = e.currentTarget.dataset.appid == null ? '' : e.currentTarget.dataset.appid;

    if (redicttype == 'detailpage') //跳转到内容页
    {
      url = '../detail/detail?id=' + id;
      console.log('url :>> ', url);
      wx.navigateTo({
        url: url
      })
    }
    if (redicttype == 'apppage') { //跳转到小程序内部页面         
      wx.navigateTo({
        url: url
      })
    } else if (redicttype == 'webpage') //跳转到web-view内嵌的页面
    {
      url = '../webpage/webpage?url=' + url;
      wx.navigateTo({
        url: url
      })
    } else if (redicttype == 'miniapp') //跳转到其他app
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
  formSubmit: function (e) {
    var url = '../list/list'
    var key = '';
    console.log('e :>> ', e);
    if (e.currentTarget.id == "search-input") {
      key = e.detail.value;
    } else {
      key = e.detail.value.input;
    }
    console.log('key :>>', key);
    if (key != '') {
      url = url + '?search=' + key;
      wx.navigateTo({
        url: url
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '请输入内容',
        showCancel: false,
      });
    }
  },
  fetchPostsData: function (data) {
    var self = this;
    if (!data) data = {};
    if (!data.page) data.page = 1;
    if (!data.categories) data.categories = 0;
    if (!data.search) data.search = '';
    if (data.page === 1) {
      self.setData({
        postsList: []
      });
    };
    wx.showLoading({
      title: '正在加载',
      mask: true
    });
    var getPostsRequest = wxRequest.getRequest(Api.getPosts(data));
    getPostsRequest.then(response => {
      if (response.statusCode === 200) {
        console.log('response.data.length: ', response.data.length, 'pageCount: ', pageCount);
        if (response.data.length) {
          if (response.data.length < pageCount) {
            self.setData({
              isLastPage: true
            });
          }

          self.setData({
            floatDisplay: "block",
            postsList: self.data.postsList.concat(response.data.map(function (item) {
              var strdate = item.date
              if (item.category_name != null) {
                item.categoryImage = "../../images/category.png";
              } else {
                item.categoryImage = "";
              }

              if (item.post_medium_image == null || item.post_medium_image == '') {
                item.post_medium_image = "../../images/logo700.png";
              }
              item.date = util.cutstr(strdate, 10, 1);
              return item;
            })),
          });
          console.log('self.data.postsList :>> ', self.data.postsList);
          setTimeout(function () {
            wx.hideLoading();
          }, 900);
        } else {
          console.log('response.data.code :>> ', response.data.code);
          if (response.data.code == "rest_post_invalid_page_number") {
            self.setData({
              isLastPage: true
            });
            wx.showToast({
              title: '没有更多内容',
              mask: false,
              duration: 1500
            });
          } else {
            wx.showToast({
              title: response.data.message,
              duration: 1500
            })
          }
        }
      }
    })
    .catch(function (response) {
      console.log('err response :>> ', response);
      if (data.page == 1) {
        self.setData({
          showerror: "block",
          floatDisplay: "none"
        });
      } else {
        wx.showModal({
          title: '加载失败',
          content: '加载数据失败,请重试.',
          showCancel: false,
        });
        self.setData({
          page: data.page - 1
        });
      }
    })
    .finally(function (response) {
      console.log('self.data.postsList2 :>> ', self.data.postsList);
      wx.hideLoading();
      wx.stopPullDownRefresh();
    });
  },
  // 跳转至查看文章详情
  redictDetail: function (e) {
    // console.log('查看文章');
    var id = e.currentTarget.id,
      url = '../detail/detail?id=' + id;
    wx.navigateTo({
      url: url
    })
  },
  //首页图标跳转
  onNavRedirect:function(e){      
      var redicttype = e.currentTarget.dataset.redicttype;
      var url = e.currentTarget.dataset.url == null ? '' : e.currentTarget.dataset.url;
      var appid = e.currentTarget.dataset.appid == null ? '' : e.currentTarget.dataset.appid;
      var extraData = e.currentTarget.dataset.extraData == null ? '' : e.currentTarget.dataset.extraData;
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
              extraData: extraData,
              success(res) {
                  // 打开成功
              },
              fail: function (res) {
                  console.log(res);
              }
          })
      }
      
  },
  redictUrl: function (e) {
    var id = e.currentTarget.id;
    var url = e.currentTarget.dataset.url;
    console.log('redictUrl url :>> ', url);
    if (!url.length) {
      return;
    }
    wx.navigateTo({
      url: url
    })
  },
})
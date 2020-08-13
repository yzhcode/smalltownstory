// pages/topic/topic.js

var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
// var WxParse = require('../../wxParse/wxParse.js');
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/request.js')
import config from '../../utils/config.js'
var pageCount = config.getPageCount;
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    postsList: [],
    isLastPage: false,
    page: 1,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    this.fetchPostsData();
    self.setData({
    });
    
    // wx.setNavigationBarTitle({
    //   title: '小镇故事 Life - 推荐',
    //   success: function (res) {
    //     // success
    //   }
    // });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var self = this;
    self.setData({
      isLastPage:false,
      page:1
    });
    this.fetchPostsData(self.data);
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  fetchPostsData: function (data) {
    var self = this;
    if (!data) data = {
      hidden: true
    };
    if (!data.page) data.page = 1;
    if (data.page === 1) {
      self.setData({
        postsList: []
      });
    }
    wx.showLoading({
      title: '正在加载',
      mask: true
    }); 
    var getPostsRequest = wxRequest.getRequest(Api.getPostsTopic(data));
    getPostsRequest
      .then(response => {
        if (response.statusCode === 200) {
          if (response.data.length < pageCount) {
            self.setData({
              isLastPage: true
            });
          }
          self.setData({
            floatDisplay: "block",
            postsList: self.data.postsList.concat(response.data.map(function (item) {
              var strdate = item.date
              var excerpt = item.excerpt.rendered
              item.excerpt.rendered = excerpt.replace(/\[&hellip;\]/ig, '......');
              item.excerpt.rendered = item.excerpt.rendered.replace(/&#8221;/g, '"');
              item.excerpt.rendered = item.excerpt.rendered.substring(0, 32) + "......"
              if (item.typename != null) {
                item.categoryImage = "../../images/category.png";
              }
              else {
                item.categoryImage = "";
              }
              if (item.post_thumbnail_image == null || item.post_thumbnail_image == '') {
                item.post_thumbnail_image = "../../images/logo700.png";
              }
              item.date = util.cutstr(strdate, 10, 1);
              return item;
            })),

          });
          console.log('postsList :>> ', self.data.postsList);
          setTimeout(function () {
            wx.hideLoading();
            self.setData({
              hidden: true,
              pageMain: false
            })
          }, 900);
        }
        else {
          if (response.data.code == "rest_post_invalid_page_number") {
            self.setData({
              isLastPage: true
            });
            wx.showToast({
              title: '没有更多内容',
              mask: false,
              duration: 1500
            });
          }
          else {
            wx.showToast({
              title: response.data.message,
              duration: 1500
            })
          }
        }
      })
      .catch(function (response) {
        if (data.page == 1) {

          self.setData({
            showerror: "block",
            floatDisplay: "none"
          });

        }
        else {
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
        wx.hideLoading();
        wx.stopPullDownRefresh();
      });
  },
  redictDetail: function (a) {
    var url = "../detail/detail?id=" + a.currentTarget.id;
    wx.navigateTo({
      url: url
    });
  },
})
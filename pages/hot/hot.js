/*
 * @Author: your name
 * @Date: 2020-08-11 16:57:25
 * @LastEditTime: 2020-08-13 15:25:42
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /smalltownstory/pages/hot/hot.js
 */
// pages/hot/hot.js
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
    title: '文章列表',
    postsList: {},

    categoriesList: {},

    isLastPage: false,
    page: 1,
    search: '',
    categories: 0,
    topBarItems: [
      // id name selected 选中状态
      { id: '1', name: '浏览数', selected: true },
      { id: '2', name: '点赞数', selected: false },        
    ],
    tab: '1',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    this.fetchPostsData("1");

    wx.setNavigationBarTitle({
      title: '小镇故事 Life - 排行榜单',
      success: function (res) {
        // success
      }
    });  
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  fetchPostsData: function (tab) {
    var self = this;  
    self.setData({
        postsList: []
    });
    
    wx.showLoading({
      title: '正在加载',
      mask:true
    });
    var getTopHotPostsRequest = wxRequest.getRequest(Api.getTopHotPosts(tab));
    getTopHotPostsRequest.then(response =>{
        if (response.statusCode === 200) {
            self.setData({
                showallDisplay: "block",
                floatDisplay: "block",
                postsList: self.data.postsList.concat(response.data.map(function (item) {
                    var strdate = item.post_date
                    if (item.post_thumbnail_image == null || item.post_thumbnail_image == '') {
                        item.post_thumbnail_image = '../../images/logo700.png';
                    }
                    item.post_date = util.cutstr(strdate, 10, 1);

                    item.date = item.post_date;
                    delete item.post_date
                    item.id = item.post_id;
                    delete item.post_id
                    item.typename = item.post_typename;
                    delete item.post_typename
                    item.title = {"rendered":item.post_title};
                    delete item.post_title
                    item.total_comments = item.comment_total;
                    delete item.comment_total
                    item.post_medium_image = item.post_thumbnail_image
                    delete item.post_thumbnail_image
                    return item;
                })),

            });
            console.log('postsList :>> ', this.data.postsList);
        } else if (response.statusCode === 404) { 

            // wx.showModal({
            //     title: '加载失败',
            //     content: '加载数据失败,可能缺少相应的数据',
            //     showCancel: false,
            // });

            console.log('加载数据失败,可能缺少相应的数据'); 
        }
    })
    .catch(function () {
        wx.hideLoading();
        if (data.page == 1) {

            self.setData({
                showerror: "block",
                floatDisplay: "block"
            });

        }
        else {
            // wx.showModal({
            //     title: '加载失败',
            //     content: '加载数据失败,请重试.',
            //     showCancel: false,
            // });
        }
    })
    .finally(function () {

        setTimeout(function () {
            wx.hideLoading();

        }, 1500);

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
  }
})
/*
 * @Author: your name
 * @Date: 2020-08-10 17:14:50
 * @LastEditTime: 2020-08-11 17:05:09
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /smalltownstory/pages/list/list.js
 */
// pages/list/list.js
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
    // title: '文章列表',
    postsList: {},
    // pagesList: {},
    // categoriesList: {},
    // postsShowSwiperList: {},
    isLastPage: false,
    page: 1,
    search: '',
    categories: 0,
    // categoriesName:'',
    // categoriesImage:"", 
    // showerror:"none",
    isCategoryPage:"none",
    isSearchPage:"none",
    // showallDisplay: "block",
    // displaySwiper: "block",
    // floatDisplay: "none",
    searchKey:"",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var self = this;
    if (options.categoryID && options.categoryID != 0) {
      self.setData({
        categories: options.categoryID,
        isCategoryPage:"block"
        
       
      });
      self.fetchCategoriesData(options.categoryID);
    }
    if (options.search && options.search != '') {
      wx.setNavigationBarTitle({
        title: "搜索关键字："+options.search,
        success: function (res) {
          // success
        }
      });
      self.setData({
        search: options.search,
        isSearchPage:"block",
        searchKey: options.search
      })

      this.fetchPostsData(self.data);
    }    
  },
  //获取文章列表数据
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
      mask:true
    });

    var getListRequest = wxRequest.getRequest(Api.getList(data));
    getListRequest.then(response =>{
        if (response.statusCode === 200) {
            if (response.data.length < pageCount) {
                self.setData({
                    isLastPage: true
                });
            };
            self.setData({
                floatDisplay: "block",
                showallDisplay: "block",
                postsList: self.data.postsList.concat(response.data.map(function (item) {
                    var strdate = item.date
                    if (item.category_name != null) {
                        item.categoryImage = "../../images/topic.png";
                    }
                    else {
                        item.categoryImage = "";
                    }
                    if (item.post_thumbnail_image == null || item.post_thumbnail_image == '') {
                        item.post_thumbnail_image = '../../images/logo700.png';
                    }
                    item.date = util.cutstr(strdate, 10, 1);
                    return item;
                })),

            });
            // setTimeout(function () {
            //     wx.hideLoading();
            // }, 1500);
        }
        else {
            if (response.data.code == "rest_post_invalid_page_number") {
                self.setData({
                    isLastPage: true
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
    .catch(function(){        
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
        .finally(function () {
            wx.hideLoading();
        })  
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

  //获取分类列表
  fetchCategoriesData: function (id) {
    var self = this;
    self.setData({
      categoriesList: []
    });
    var getCategoryRequest = wxRequest.getRequest(Api.getCategoryByID(id));
    getCategoryRequest.then(response =>{
        var catImage = "";
        if (typeof (response.data.category_thumbnail_image) == "undefined" || response.data.category_thumbnail_image == "") {
            catImage = "../../images/website.png";
        }
        else {
            catImage = response.data.category_thumbnail_image;
        }
        self.setData({
            categoriesList: response.data,
            categoriesImage: catImage,
            categoriesName: response.data.name
        });
        wx.setNavigationBarTitle({
            title: response.data.name,
            success: function (res) {
                // success
            }
        });
        self.fetchPostsData(self.data); 
    })
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
    var self = this;
      if (!self.data.isLastPage) {
          self.setData({
              page: self.data.page + 1
          });
          console.log('当前页' + self.data.page);
          this.fetchPostsData(self.data);
      }
      else {
          console.log('最后一页');
      }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})
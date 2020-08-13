/*
 * @Author: your name
 * @Date: 2020-08-10 09:17:45
 * @LastEditTime: 2020-08-12 09:53:51
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /smalltownstory/pages/category/category.js
 */
// pages/category/category.js
var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
// var WxParse = require('../../wxParse/wxParse.js');
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/request.js')
import config from '../../utils/config.js'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    categoriesList: {},
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.fetchCategoriesData();
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

  fetchCategoriesData: function () {
    wx.showLoading({
      title: '正在加载',
      mask: true,
    });
    var self = this;
    self.setData({
      categoriesList: []
    });
    //console.log(Api.getCategories());
    var getCategoriesRequest = wxRequest.getRequest(Api.getCategories());
    getCategoriesRequest.then(response => {
        if (response.statusCode === 200) {
          self.setData({
            floatDisplay: "block",
            categoriesList: self.data.categoriesList.concat(response.data.map(function (item) {
              if (typeof (item.category_thumbnail_image) == "undefined" || item.category_thumbnail_image == "") {
                item.category_thumbnail_image = "../../images/website.png";
              }
              item.subimg = "subscription.png";
              return item;
            })),
          });
        } else {
          console.log(response);
        }
      })
      .catch(function (response) {
        console.log(response);
      }).finally(function () {})
    wx.hideLoading();
  },
  //跳转至某分类下的文章列表
  redictIndex: function (e) {
    //console.log('查看某类别下的文章');  
    var id = e.currentTarget.dataset.id;
    var name = e.currentTarget.dataset.item;
    var url = '../list/list?categoryID=' + id;
    wx.navigateTo({
        url: url
    });
  },
})
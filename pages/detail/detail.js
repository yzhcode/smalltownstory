/*
 * @Author: your name
 * @Date: 2020-08-10 14:51:01
 * @LastEditTime: 2020-08-13 09:58:00
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /smalltownstory/pages/detail/detail.js
 */
// pages/detail/detail.js

var Api = require('../../utils/api.js');
var util = require('../../utils/util.js');
var WxParse = require('../../lib/wxParse/wxParse.js');
var wxApi = require('../../utils/wxApi.js')
var wxRequest = require('../../utils/request.js')
import config from '../../utils/config.js'
var pageCount = config.getPageCount;
const app = getApp()
let isFocusing = false

Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageid:0,
    title: '文章内容',
    detail: {},
    commentsList: [],
    ChildrenCommentsList: [],
    commentCount: '',
    commentValue: '',
    isLastPage: false,
    wxParseData: {},

    detailDate: '',
    total_comments:0,
    likeCount: 0,

    postList: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this;
    this.setData({
      pageid: options.id
    })

    self.fetchDetailData(options.id)
    
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
      console.log('当前页' + self.data.page);
      self.fetchCommentData();
      self.setData({
        page: self.data.page + 1,
      });
    } else {
      console.log('评论已经是最后一页了');
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  fetchDetailData: function(id) {
    var self = this;
    var getPostDetailRequest = wxRequest.getRequest(Api.getPostByID(id));
    var res;
    var _displayLike = 'block';
    getPostDetailRequest
      .then(response => {
        res = response;
        if (response.data.code && (response.data.data.status == "404")) {
          self.setData({
            showerror: 'block',
            display: 'none',
            errMessage: response.data.message
          });
          return false;
        }
        // wx.setNavigationBarTitle({
        //   title: res.data.title.rendered
        // });
        console.log('response.data :>> ', response.data);
        WxParse.wxParse('article', 'html', response.data.content.rendered, self, 5);
        if (response.data.total_comments != null && response.data.total_comments != '') {
          self.setData({
            commentCount: "有" + response.data.total_comments + "条评论"
          });
        };
        var _likeCount = response.data.like_count;
        if (response.data.like_count != '0') {
          _displayLike = "block"
        }
        self.setData({
          detail: response.data,
          likeCount: _likeCount,
          postID: id,
          link: response.data.link,
          detailDate: util.cutstr(response.data.date, 10, 1),
          //wxParseData: WxParse('md',response.data.content.rendered)
          //wxParseData: WxParse.wxParse('article', 'html', response.data.content.rendered, self, 5),
          display: 'block',
          displayLike: _displayLike,
          total_comments: response.data.total_comments,
          postImageUrl: response.data.postImageUrl
        });
        // 调用API从本地缓存中获取阅读记录并记录
        var logs = wx.getStorageSync('readLogs') || [];
        // 过滤重复值
        if (logs.length > 0) {
          logs = logs.filter(function(log) {
            return log[0] !== id;
          });
        }
        // 如果超过指定数量
        if (logs.length > 19) {
          logs.pop(); //去除最后一个
        }
        logs.unshift([id, response.data.title.rendered]);
        wx.setStorageSync('readLogs', logs);
        //end 
      })
      .then(response => {
      })
      .then(response => {
        var tags = [];
        tags = res.data.tags
        if (!tags) {
          return false;
        }
        if (tags != "") {
          var getPostTagsRequest = wxRequest.getRequest(Api.getPostsByTags(id, tags));
          getPostTagsRequest
            .then(response => {
              self.setData({
                postList: response.data
              });
            })
        }
      }).then(response => { //获取点赞记录
        self.showLikeImg();
      }).then(resonse => {
        if (self.data.openid) {
          Auth.checkSession(self, 'isLoginLater');
        }
      }).then(response => { //获取是否已经点赞
        if (self.data.openid) {
          self.getIslike();
        }
      })
      .catch(function(error) {
        console.log('error: ' + error);
      })
    //wx.hideLoading(); 
  },
  showLikeImg: function() {
    var self = this;
    var flag = false;
    var _likes = self.data.detail.avatarurls;
    if (!_likes) {
      return;
    }
    var likes = [];
    for (var i = 0; i < _likes.length; i++) {
      var avatarurl = "../../images/gravatar.png";
      if (_likes[i].avatarurl.indexOf('wx.qlogo.cn') != -1) {
        avatarurl = _likes[i].avatarurl;
      }
      likes[i] = avatarurl;
    }
    var temp = likes;
    self.setData({
      likeList: likes
    });
  },
  getIslike: function() { //判断当前用户是否点赞
    var self = this;
    if (self.data.openid) {
      var data = {
        openid: self.data.openid,
        postid: self.data.postID,
        userLevel: self.data.userLevel,
      };
      var url = Api.postIsLikeUrl();
      var postIsLikeRequest = wxRequest.postRequest(url, data);
      postIsLikeRequest
        .then(response => {
          if (response.data.status == '200') {
            self.setData({
              likeImag: "like-on.png"
            });
            console.log("已赞过");
          }
        })
    }
  },
  fetchCommentData: function() {
    var self = this;
    let args = {};
    args.postId = self.data.postID;
    args.limit = pageCount;
    args.page = self.data.page;
    self.setData({
      isLoading: true
    })
    var getCommentsRequest = wxRequest.getRequest(Api.getCommentsReplay(args));
    getCommentsRequest
      .then(response => {
        if (response.statusCode == 200) {
          if (response.data.data.length < pageCount) {
            self.setData({
              isLastPage: true
            });
          }
          if (response.data) {
            self.setData({
              commentsList: [].concat(self.data.commentsList, response.data.data)
            });
          }
        }
      })
      .catch(response => {
        console.log(response.data.message);

      }).finally(function() {

        self.setData({
          isLoading: false
        });
      });
  },
})
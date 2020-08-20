/*
 * @Author: your name
 * @Date: 2020-08-10 14:51:01
 * @LastEditTime: 2020-08-20 10:38:15
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
var UserAuth = require('../../utils/userAuth.js');
import config from '../../utils/config.js'
var pageCount = config.getPageCount;
const app = getApp()
let isFocusing = false
import Poster from '../../components/wxa-plugin-canvas-poster/poster/poster';
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
    likeImag: "like.png",
    postList: [],
    parentID: "0",
    userid: "",
    toFromId: "",
    commentdate: "",
    openid: "",
    userInfo: {},
    isShow:false,
    downloadFileDomain: config.getDownloadFileDomain,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let self = this;
    

    UserAuth.userLogin().then(res => {
      UserAuth.userAuthorization().then(res => {
        UserAuth.getUserOtherInfo().then(res => {
          console.log('获取信息完成 :>> ', app.globalData.userInfo);
          self.setData({
            openid: app.globalData.openid,
            userInfo: app.globalData.userInfo,
            userLevel: app.globalData.userLevel,
          });
          
        }).catch(err => {
          
        });
      }).catch(err => {
     
      });
    }).catch(err => {
   
    })

    self.fetchDetailData(options.id);
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
        console.log('11111111111 :>>');
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
        console.log('222222222222 :>>');
      })
      .then(response => {
        console.log('333333333333 :>>');
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
        console.log('44444444444 :>>');
        self.showLikeImg();
      }).then(resonse => {
        console.log('5555555555 :>>');
        if (self.data.openid) {
          // Auth.checkSession(self, 'isLoginLater');
        }
      }).then(response => { //获取是否已经点赞
        console.log('66666666666 :>>');
        if (self.data.openid) {
          self.getIslike();
        }
      })
      .catch(function(error) {
        console.log('77777777777 :>>');
        console.log('error: ' + error);
      })
    //wx.hideLoading(); 
  },
  showLikeImg: function() {
    var self = this;
    var flag = false;
    var _likes = self.data.detail.avatarurls;
    console.log('_likes :>> ', _likes);
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
        console.log("error :",response.data.message);

      }).finally(function() {

        self.setData({
          isLoading: false
        });
      });
  },
  goHome: function() {
    wx.switchTab({
      url: '../index/index'
    })
  },
  gotowebpage: function() {
    var self = this;
    self.ShowHideMenu();
    var minAppType = config.getMinAppType;
    var url = '';
    if (minAppType == "1") {
      var url = '../webpage/webpage';
      wx.navigateTo({
        url: url + '?url=' + self.data.link
      })
    } else {
      self.copyLink(self.data.link);
    }
  },
  copyLink: function(url) {
    //this.ShowHideMenu();
    wx.setClipboardData({
      data: url,
      success: function(res) {
        wx.getClipboardData({
          success: function(res) {
            wx.showToast({
              title: '链接已复制',
              image: '../../images/link.png',
              duration: 2000
            })
          }
        })
      }
    })
  },
  setFavorite: function() {
    var self = this;
    if (self.data.openid) {
      var data = {
        postid: self.data.postID,
        userLevel: self.data.userLevel,
      };
      var url = Api.setFavoriteUrl();
      var postsetFavoriteRequest = wxRequest.postRequest(url, data);
      postsetFavoriteRequest
        .then(response => {
          if (response.data.status == '200') {
            wx.showToast({
              title: '收藏成功',
              icon: 'success',
              duration: 900,
              success: function() {}
            })
          } else {
            wx.showToast({
              title: '谢谢，已经收藏',
              icon: 'success',
              duration: 900,
              success: function() {}
            })
          }
        })
    } else {
      // Auth.checkSession(self, 'isLoginNow');
    }
  },
  clickLike: function(e) {
    var id = e.target.id;
    var self = this;
    if (id == 'likebottom') {
      this.ShowHideMenu();
    }
    if (self.data.openid) {
      var data = {
        openid: self.data.openid,
        postid: self.data.postID,
        userLevel: self.data.userLevel,
        avatarUrl: self.data.userInfo['avatarUrl']
      };
      var url = Api.postLikeUrl();
      var postLikeRequest = wxRequest.postRequest(url, data);
      postLikeRequest
        .then(response => {
          if (response.data.status == '200') {
            var _likeList = []
            var _like = self.data.userInfo.avatarUrl;
            _likeList.push(_like);
            var tempLikeList = _likeList.concat(self.data.likeList);
            var _likeCount = parseInt(self.data.likeCount) + 1;
            self.setData({
              likeList: tempLikeList,
              likeCount: _likeCount,
              displayLike: 'block'
            });
            wx.showToast({
              title: '谢谢点赞',
              icon: 'success',
              duration: 900,
              success: function() {}
            })
          } else if (response.data.status == '501') {
            console.log("501 :",response.data.message);
            wx.showToast({
              title: '谢谢，已赞过',
              icon: 'success',
              duration: 900,
              success: function() {}
            })
          } else {
            console.log("error1 :",response.data.message);

          }
          self.setData({
            likeImag: "like.png"
          });
        })
    } else {
      // Auth.checkSession(self, 'isLoginNow');
      wx.showToast({
        title: '未登录',
        icon: 'fail',
        duration: 900,
        success: function() {}
      })
    }
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
        console.log('是否已赞 response :>> ', response);
        if (response.data.status == '200' || response.data.status == '501') {
          self.setData({
            likeImag: "like-on.png"
          });
          console.log("已赞过");
        }
      }).catch(error => {
        console.log('是否已赞 error :>> ', error);
      })
    }
  },
  praise: function() {
    this.ShowHideMenu();
    var self = this;
    var minAppType = config.getMinAppType;
    var system = self.data.system;
    if (minAppType == "0" && system == 'Android') {
      if (self.data.openid) {
        wx.navigateTo({
          url: '../pay/pay?flag=1&openid=' + self.data.openid + '&postid=' + self.data.postID
        })
      } else {
        // Auth.checkSession(self, 'isLoginNow');
      }
    } else {
      var src = config.getZanImageUrl;
      wx.previewImage({
        urls: [src],
      });
    }
  },

  //显示或隐藏功能菜单
  ShowHideMenu: function() {
    this.setData({
      isShow: !this.data.isShow
    })
  },
  formSubmit: function (e) {
    var self = this;
    var comment = e.detail.value.inputComment;
    var parent = self.data.parentID;
    var postID = e.detail.value.inputPostID;
    var posttitle = e.detail.value.inputPostTitle;
    var posttypeid = e.detail.value.inputPosttypeid;
    var formId = e.detail.formId;
    if (formId == "the formId is a mock one") {
      formId = "";

    }
    var userid = self.data.userid;
    var toFromId = self.data.toFromId;
    var commentdate = self.data.commentdate;
    if (comment.length === 0) {
      self.setData({
        'dialog.hidden': false,
        'dialog.title': '提示',
        'dialog.content': '没有填写评论内容。'

      });
    } else {
      if (self.data.openid) {
        var name = self.data.userInfo.nickName;
        var author_url = self.data.userInfo.avatarUrl;
        var email = self.data.openid + "@qq.com";
        var openid = self.data.openid;
        var userLevel = self.data.userLevel;
        var fromUser = self.data.userInfo.nickName;
        var data = {
          post: postID,
          posttitle: posttitle,
          posttypeid: posttypeid,
          author_name: name,
          author_email: email,
          content: comment,
          author_url: author_url,
          parent: parent,
          openid: openid,
          userid: userid,
          formId: formId,
          userLevel: userLevel
        };
        var url = Api.postWeixinComment();
        var postCommentRequest = wxRequest.postRequest(url, data);
        var postCommentMessage = "";
        postCommentRequest
          .then(res => {
            console.log(res)
            if (res.statusCode == 200) {
              if (res.data.status == '200') {
                self.setData({
                  content: '',
                  parentID: "0",
                  userid: 0,
                  placeholder: "评论...",
                  focus: false,
                  commentsList: []

                });
                postCommentMessage = res.data.message;
                if (parent != "0" && !util.getDateOut(commentdate) && toFromId != "") {
                  var useropenid = res.data.useropenid;
                  var data = {
                    openid: useropenid,
                    postid: postID,
                    template_id: self.data.replayTemplateId,
                    form_id: toFromId,
                    total_fee: comment,
                    fromUser: fromUser,
                    flag: 3,
                    parent: parent
                  };

                  url = Api.sendMessagesUrl();
                  var sendMessageRequest = wxRequest.postRequest(url, data);
                  sendMessageRequest.then(response => {
                    if (response.data.status == '200') {
                      //console.log(response.data.message);
                    } else {
                      console.log(response.data.message);
                    }
                  });
                }
                var commentCounts = parseInt(self.data.total_comments) + 1;
                self.setData({
                  total_comments: commentCounts,
                  commentCount: "有" + commentCounts + "条评论"
                });
              } else if (res.data.status == '500') {
                self.setData({
                  'dialog.hidden': false,
                  'dialog.title': '提示',
                  'dialog.content': '评论失败，请稍后重试。'
                });
              }
            } else {

              if (res.data.code == 'rest_comment_login_required') {
                self.setData({
                  'dialog.hidden': false,
                  'dialog.title': '提示',
                  'dialog.content': '需要开启在WordPress rest api 的匿名评论功能！'
                });
              } else if (res.data.code == 'rest_invalid_param' && res.data.message.indexOf('author_email') > 0) {
                self.setData({
                  'dialog.hidden': false,
                  'dialog.title': '提示',
                  'dialog.content': 'email填写错误！'
                });
              } else {
                console.log(res)
                self.setData({
                  'dialog.hidden': false,
                  'dialog.title': '提示',
                  'dialog.content': '评论失败,' + res.data.message
                });
              }
            }
          }).then(response => {
            //self.fetchCommentData(self.data); 
            self.setData({
              page: 1,
              commentsList: [],
              isLastPage: false
            })
            self.onReachBottom();
            //self.fetchCommentData();
            setTimeout(function () {
              wx.showToast({
                title: postCommentMessage,
                icon: 'none',
                duration: 900,
                success: function () {}
              })
            }, 900);
          }).catch(response => {
            console.log(response)
            self.setData({
              'dialog.hidden': false,
              'dialog.title': '提示',
              'dialog.content': '评论失败,' + response

            });
          })
      } else {
        UserAuth.userLogin();
      }

    }

  },
})
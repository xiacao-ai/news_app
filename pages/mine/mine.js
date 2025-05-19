Page({
  data: {
    userInfo: {}
  },
  onShow() {
    const user = wx.getStorageSync('userInfo');
    if (user) {
      this.setData({
        userInfo: {
          nickName: user.nickname,
          avatarUrl: user.avatar_url
        }
      });
    }
  },
  
  onLogin() {
    wx.navigateTo({
      url: '/pages/login-last/login-last'
    });
  },

  //前往设置中心
  goToSettings(){
    wx.navigateTo({
      url: '/pages/settings/settings',
    })
  }
});



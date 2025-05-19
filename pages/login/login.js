Page({
  data: {
    isChecked: false
  },

  onCheckboxChange(e) {
    this.setData({
      isChecked: e.detail.value.includes('agree')
    })
  },

  goToAgreement() {
    wx.navigateTo({ url: '/pages/agreement/agreement' });
  },

  goToPrivacy() {
    wx.navigateTo({ url: '/pages/privacy/privacy' });
  },

  handleLogin() {
    if (!this.data.isChecked) {
      wx.showToast({ title: '请先同意协议', icon: 'none' });
      return;
    }

    wx.login({
      success: (res) => {
        const code = res.code;
        wx.getUserProfile({
          desc: '用于完善个人资料',
          success: (profileRes) => {
            const { nickName, avatarUrl } = profileRes.userInfo;

            // 登录请求发送到你的服务器
            wx.request({
              url: 'http://localhost:3000/api/login',
              method: 'POST',
              data: { code, nickName, avatarUrl },
              success: (res) => {
                if (res.data.code === 0) {
                  wx.setStorageSync('userInfo', res.data.user);
                  wx.reLaunch({ url: '/pages/mine/mine' });
                } else {
                  wx.showToast({ title: '登录失败', icon: 'none' });
                }
              }
            });
          }
        });
      }
    });
  }
});

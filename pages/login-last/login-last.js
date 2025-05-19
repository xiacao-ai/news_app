Page({
  data: {
    isChecked: false,
    showPopup: false,
    avatarUrl: '',
    nickName: '',
    popupAnim: {} // 添加动画数据
  },

  onCheckboxChange(e) {
    this.setData({
      isChecked: e.detail.value.includes('agree')
    });
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
    this.showPopupAnim();
  },

  onChooseAvatar(e) {
    this.setData({ avatarUrl: e.detail.avatarUrl });
  },

  onInputNickName(e) {
    this.setData({ nickName: e.detail.value });
  },

  confirmLogin() {
    const { nickName, avatarUrl } = this.data;
    if (!nickName || !avatarUrl) {
      wx.showToast({ title: '请填写完整信息', icon: 'none' });
      return;
    }

    wx.login({
      success: (res) => {
        const code = res.code;
        wx.request({
          url: 'http://localhost:3000/api/login', // 你的服务器地址
          method: 'POST',
          data: { code, nickName, avatarUrl },
          success: (res) => {
            if (res.data.code === 0) {
              wx.setStorageSync('userInfo', res.data.user); // 缓存用户信息

              // ✅ 添加登录成功提示
            wx.showToast({
              title: '登录成功',
              icon: 'success',
              duration: 1500
            });

            // 跳转到“我的”页面，延迟一点让用户看到 toast
            setTimeout(() => {
              wx.reLaunch({ url: '/pages/mine/mine' });
            }, 1500);
            } else {
              wx.showToast({ title: '登录失败', icon: 'none' });
            }
          }
        });
      }
    });
  },

  cancelLogin() {
    if (this.data.showPopup) {
      this.hidePopupAnim();
    } else {
      wx.navigateBack();
    }
  },

  // 显示弹窗动画
  showPopupAnim() {
    this.setData({ showPopup: true }, () => {
      const animation = wx.createAnimation({
        duration: 300,
        timingFunction: 'ease'
      });
      animation.opacity(1).translateY(-50).step();
      this.setData({ popupAnim: animation.export() });
    });
  },

  // 隐藏弹窗动画
  hidePopupAnim() {
    const animation = wx.createAnimation({
      duration: 300,
      timingFunction: 'ease'
    });
    animation.opacity(0).translateY(100).step();
    this.setData({ popupAnim: animation.export() });

    setTimeout(() => {
      this.setData({ showPopup: false });
    }, 300);
  }
});

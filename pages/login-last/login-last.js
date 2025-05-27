const app = getApp()

Page({
  data: {
    isChecked: false,
    showPopup: false,
    avatarUrl: '',
    nickName: '',
    popupAnim: {}, // 添加动画数据
    statusBarHeight: 0
  },

  onLoad() {
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync()
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    })
    // 页面加载时隐藏TabBar
    wx.hideTabBar()
  },

  onUnload() {
    // 页面卸载时显示TabBar
    wx.showTabBar()
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

    wx.showLoading({
      title: '登录中...',
    });

    // 获取code
    wx.login({
      success: (res) => {
        if (res.code) {
          // 获取用户信息
          wx.getUserProfile({
            desc: '用于完善用户资料',
            success: (userRes) => {
              // 调用后端登录接口
              wx.request({
                url: `${app.globalData.baseUrl}/user/login`,
                method: 'POST',
                data: {
                  code: res.code,
                  nickName: userRes.userInfo.nickName,
                  avatarUrl: userRes.userInfo.avatarUrl
                },
                success: (loginRes) => {
                  if (loginRes.data.code === 0) {
                    // 保存用户信息到全局
                    app.globalData.userInfo = loginRes.data.user
                    wx.setStorageSync('userInfo', loginRes.data.user)

                    wx.showToast({
                      title: '登录成功',
                      icon: 'success',
                      duration: 1500,
                      success: () => {
                        // 延迟跳转，让用户看到提示
                        setTimeout(() => {
                          // 使用redirectTo返回个人中心页
                          wx.redirectTo({
                            url: '/pages/mine/mine',
                            success: () => {
                              // 显示tabBar
                              wx.showTabBar()
                            }
                          })
                        }, 1500)
                      }
                    })
                  } else {
                    wx.showToast({
                      title: loginRes.data.msg || '登录失败',
                      icon: 'none'
                    })
                  }
                },
                fail: () => {
                  wx.showToast({
                    title: '网络错误',
                    icon: 'none'
                  })
                },
                complete: () => {
                  wx.hideLoading()
                }
              })
            },
            fail: (err) => {
              wx.hideLoading()
              wx.showToast({
                title: '用户取消授权',
                icon: 'none'
              })
            }
          })
        }
      },
      fail: () => {
        wx.hideLoading()
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        })
      }
    });
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

              // 跳转到"我的"页面，延迟一点让用户看到 toast
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
  },

  // 返回上一页
  goBack() {
    wx.redirectTo({
      url: '/pages/mine/mine',
      success: () => {
        wx.showTabBar()
      }
    })
  }
});

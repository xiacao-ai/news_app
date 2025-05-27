const app = getApp()

Page({
  data: {
    isChecked: false,
    statusBarHeight: 0
  },

  onLoad() {
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync()
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    })
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

    wx.showLoading({
      title: '登录中...',
    })

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
                          wx.switchTab({
                            url: '/pages/mine/mine'
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
    })
  }
});

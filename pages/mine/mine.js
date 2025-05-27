const app = getApp()

Page({
  data: {
    userInfo: null,
    statusBarHeight: 0,
    isDarkMode: false,
    isNavigating: false
  },

  onLoad() {
    // 获取状态栏高度
    const systemInfo = wx.getSystemInfoSync()
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight
    })

    // 获取夜间模式状态
    const isDarkMode = wx.getStorageSync('isDarkMode') || false
    this.setData({ isDarkMode })

    // 确保导航栏状态正确
    if (isDarkMode) {
      app.updateTheme(isDarkMode)
    }
  },

  onShow() {
    // 每次显示页面时获取最新的用户信息和主题状态
    const userInfo = wx.getStorageSync('userInfo')
    const isDarkMode = wx.getStorageSync('isDarkMode') || false
    this.setData({
      userInfo,
      isDarkMode
    })

    // 确保在mine页面时显示TabBar
    wx.showTabBar({
      success: () => {
        // TabBar显示后再更新主题
        if (isDarkMode) {
          app.updateTheme(isDarkMode)
        }
      }
    })
  },

  goToLogin() {
    if (this.data.isNavigating) return;
    this.setData({ isNavigating: true });

    // 直接跳转，不处理TabBar
    wx.navigateTo({
      url: '/pages/login-last/login-last',
      animationType: 'slide-in-right', // 添加过渡动画
      animationDuration: 300,
      success: () => {
        this.setData({ isNavigating: false });
      },
      fail: (err) => {
        console.error('跳转失败：', err);
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'none'
        });
        this.setData({ isNavigating: false });
      }
    });
  },

  goToUserEdit() {
    wx.navigateTo({
      url: '/pages/user-edit/user-edit'
    })
  },

  goToHistory() {
    if (!this.checkLogin()) return
    wx.navigateTo({
      url: '/pages/history/history'
    })
  },

  goToStar() {
    if (!this.checkLogin()) return
    wx.navigateTo({
      url: '/pages/star/star'
    })
  },

  goToComment() {
    if (!this.checkLogin()) return
    wx.navigateTo({
      url: '/pages/comment/comment'
    })
  },

  goToSettings() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    })
  },

  goToFeedback() {
    if (!this.checkLogin()) return
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    })
  },

  goToAbout() {
    wx.navigateTo({
      url: '/pages/about/about'
    })
  },

  toggleDarkMode(e) {
    const isDarkMode = e.detail.value
    this.setData({ isDarkMode })
    wx.setStorageSync('isDarkMode', isDarkMode)

    // 使用全局方法更新主题
    app.updateTheme(isDarkMode)
    app.globalData.isDarkMode = isDarkMode

    // 显示切换提示
    wx.showToast({
      title: isDarkMode ? '已切换到夜间模式' : '已切换到日间模式',
      icon: 'none',
      duration: 1500
    })
  },

  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除用户信息
          wx.removeStorageSync('userInfo')
          app.globalData.userInfo = null
          this.setData({ userInfo: null })

          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
        }
      }
    })
  },

  checkLogin() {
    if (!this.data.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return false
    }
    return true
  }
})



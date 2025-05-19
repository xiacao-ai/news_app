Page({
  data: {
    userInfo: null,
  },

  onLoad() {
    const userInfo = wx.getStorageSync('userInfo')
    if (userInfo) {
      this.setData({ userInfo })
    }
  },

  onBack() {
    wx.navigateBack()
  },

  // 设置中心页面
onLogout() {
  wx.removeStorageSync('userInfo')
  wx.removeStorageSync('token')
  wx.showToast({ title: '已退出登录', icon: 'none' })

  wx.reLaunch({ url: '/pages/mine/mine' })
  // 回到“我的”页面时刷新
  // wx.switchTab({
  //   url: '/pages/mine/mine',
  //   success: () => {
  //     const page = getCurrentPages().pop()
  //     if (page && page.onLoad) page.onLoad() // 重新加载“我的”页面数据
  //   }
  // })
},


  onClearCache() {
    wx.clearStorage()
    wx.showToast({ title: '缓存已清除', icon: 'none' })
  },

  onFeedback() {
    wx.navigateTo({
      url: '/pages/feedback/feedback'
    })
  },

  onAbout() {
    wx.navigateTo({
      url: '/pages/about/about'
    })
  }
})

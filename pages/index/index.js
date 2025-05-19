Page({
  data: {
    ztitem: 0,
    scrollLeft: 0, // 用于控制 tab 滚动位置
    // 
    tabs: [
      { name: '头条', category: 'top' }, 
      { name: '国内', category: 'guonei' }, 
      { name: '国际', category: 'guoji' }, 
      { name: '娱乐', category: 'yule' }, 
      { name: '体育', category: 'tiyu' }, 
      { name: '军事', category: 'junshi' }, 
      { name: '科技', category: 'keji' }, 
      { name: '财经', category: 'caijing' }, 
      { name: '游戏', category: 'youxi' }, 
      { name: '健康', category: 'jiankang' } 
    ]
  },
  

  //前往搜索页
  goToSearch() {
    wx.navigateTo({
      url: '/pages/search/search'
    });
  },

  // 点击 tab 切换
  changezt(e) {
    const ztitem = e.currentTarget.dataset.ztitem
    this.setData({ ztitem })
    this.scrollToTab(ztitem)
  },

  // swiper 滑动切换
  contentchange(e) {
    const ztitem = e.detail.current
    this.setData({ ztitem })
    this.scrollToTab(ztitem)
  },

  // 控制 tab 滚动居中
  scrollToTab(index) {
    const query = wx.createSelectorQuery()
    query.select(`#tab${index}`).boundingClientRect()
    query.select('.tab').boundingClientRect()
    query.exec(res => {
      const tabItem = res[0]
      const tabContainer = res[1]
      if (tabItem && tabContainer) {
        const scrollLeft = tabItem.left - tabContainer.left + tabItem.width / 2 - tabContainer.width / 2
        this.setData({ scrollLeft })
      }
    })
  }


})


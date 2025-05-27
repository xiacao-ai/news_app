const app = getApp()

Page({
  data: {
    isDarkMode: false,
    newsList: [],
    isLoading: false,
    isRefreshing: false,
    currentPage: 1,
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
    ],
    pageReady: false
  },

  onLoad() {
    // 获取主题状态
    const isDarkMode = wx.getStorageSync('isDarkMode') || false;

    // 设置页面样式
    if (isDarkMode) {
      wx.setNavigationBarColor({
        frontColor: '#ffffff',
        backgroundColor: '#1f1f1f',
        animation: {
          duration: 0
        }
      });
    }

    // 使用Promise.all并行加载数据
    Promise.all([
      this.loadNewsList(),
      this.initTabPosition()
    ]).then(() => {
      this.setData({
        isDarkMode,
        pageReady: true
      });
    });
  },

  onShow() {
    if (this.data.pageReady) {
      const isDarkMode = wx.getStorageSync('isDarkMode') || false;
      if (this.data.isDarkMode !== isDarkMode) {
        this.setData({
          isDarkMode
        }, () => {
          // 更新页面样式
          wx.setNavigationBarColor({
            frontColor: isDarkMode ? '#ffffff' : '#000000',
            backgroundColor: isDarkMode ? '#1f1f1f' : '#87CEFA',
            animation: {
              duration: 0
            }
          });
        });
      }
    }
  },

  // 初始化tab位置
  initTabPosition() {
    return new Promise(resolve => {
      wx.nextTick(() => {
        this.scrollToTab(this.data.ztitem);
        resolve();
      });
    });
  },

  // 加载新闻列表
  loadNewsList() {
    if (this.data.isLoading) return Promise.resolve();

    this.setData({ isLoading: true });

    return new Promise(resolve => {
      setTimeout(() => {
        const newData = Array(5).fill(0).map((_, index) => ({
          id: this.data.newsList.length + index + 1,
          title: `新闻标题 ${this.data.newsList.length + index + 1}`,
          source: '新闻来源',
          publishTime: '2小时前',
          imageUrl: '/images/news-placeholder.png'
        }));

        this.setData({
          newsList: [...this.data.newsList, ...newData],
          isLoading: false,
          currentPage: this.data.currentPage + 1
        }, resolve);
      }, 100); // 减少加载时间
    });
  },

  // 下拉刷新
  onRefresh() {
    if (this.data.isRefreshing) return;

    this.setData({
      isRefreshing: true,
      currentPage: 1,
      newsList: []
    });

    this.loadNewsList().then(() => {
      this.setData({ isRefreshing: false });
    });
  },

  // 加载更多
  loadMore() {
    if (!this.data.isLoading) {
      this.loadNewsList();
    }
  },

  //前往搜索页
  goToSearch() {
    wx.navigateTo({
      url: '/pages/search/search',
      animationType: 'none'
    });
  },

  // 点击 tab 切换
  changezt(e) {
    const ztitem = e.currentTarget.dataset.ztitem;
    if (ztitem === this.data.ztitem) return;

    this.setData({
      ztitem,
      newsList: [],
      currentPage: 1
    }, () => {
      this.scrollToTab(ztitem);
      this.loadNewsList();
    });
  },

  // swiper 滑动切换
  contentchange(e) {
    const ztitem = e.detail.current;
    if (ztitem === this.data.ztitem) return;

    this.setData({
      ztitem,
      newsList: [],
      currentPage: 1
    }, () => {
      this.scrollToTab(ztitem);
      this.loadNewsList();
    });
  },

  // 控制 tab 滚动居中
  scrollToTab(index) {
    wx.nextTick(() => {
      const query = wx.createSelectorQuery();
      query.select(`#tab${index}`).boundingClientRect();
      query.select('.tab').boundingClientRect();
      query.exec(res => {
        const tabItem = res[0];
        const tabContainer = res[1];
        if (tabItem && tabContainer) {
          const scrollLeft = tabItem.left - tabContainer.left + tabItem.width / 2 - tabContainer.width / 2;
          this.setData({ scrollLeft });
        }
      });
    });
  },

  // 跳转到新闻详情
  goToDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/news-detail/news-detail?id=${id}`,
      animationType: 'none'
    });
  }
})


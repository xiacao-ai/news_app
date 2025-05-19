Page({

  data: {
    keyword: '',
    hotList: ['微信小程序', 'AI技术', '前端开发', 'Vue3', 'React Native', 'Node.js'], // 示例数据   
    recommendList: ['新闻', '科技', '体育', '音乐'],
    historyList: [],
    resultList: []
  },

  onTagTap(e) {
    const keyword = e.currentTarget.dataset.key;
    this.setData({ keyword });
    this.onSearch(); // 自动触发搜索
  },

  onInput(e) {
    this.setData({ keyword: e.detail.value });
  },

  onSearch() {
    const keyword = this.data.keyword.trim();
    if (!keyword) return;
    // 简单模拟搜索
    const result = [{
      id: 1,
      title: `关于「${keyword}」的搜索结果`,
      desc: '这里是描述信息'
    }];
    const newHistory = [keyword, ...this.data.historyList.filter(k => k !== keyword)];
    this.setData({
      resultList: result,
      historyList: newHistory.slice(0, 10) // 最多保留10条
    });
  },

  onTagTap(e) {
    const key = e.currentTarget.dataset.key;
    this.setData({ keyword: key }, this.onSearch);
  },

  clearHistory() {
    this.setData({ historyList: [] });
  },

  onCancel() {
    this.setData({ keyword: '' });
  },

  onBack() {
    wx.navigateBack();
  }
});

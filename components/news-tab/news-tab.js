// news-tab.js
Component({
  properties: {
    category: String
  },
  data: {
    newsList: [],
    swiperList: []
  },
  lifetimes: {
    attached() {
      this.loadNews()
    }
  },
  methods: {
    loadNews() {
      wx.request({
        url: `http://localhost:3000/api/news?category=${this.properties.category}`,
        method: 'GET',
        success: (res) => {
          const list = res.data || []
          this.setData({
            swiperList: list.slice(0, 3).map(item => ({
              id: item.uniquekey,
              title: item.title,
              image: item.thumbnail_pic_s
            })),
            newsList: list.slice(3).map(item => ({  // 跳过前3条
              id: item.uniquekey,
              title: item.title,
              image: item.thumbnail_pic_s,
              source: item.author_name,
              publishTime: item.date
            }))
          })
          
        },
        fail: () => {
          wx.showToast({
            title: '加载失败',
            icon: 'none'
          })
        }
      })
    },

    onCardTap(e) {
      const id = e.currentTarget.dataset.id
      wx.navigateTo({
        url: `/pages/news-detail/news-detail?uniquekey=${id}`
      })
    },
    
    onSwiperTap(e) {
      const id = e.currentTarget.dataset.id
      wx.navigateTo({
        url: `/pages/news-detail/news-detail?uniquekey=${id}`
      })
    }
    
  }
})



// // Page({
// //   data: {
// //     news: {
// //       title: '低空经济飞出“新花样” 带动产业链整体提速',
// //       source: '人民日报',
// //       publishTime: '2025年05月05日 10:39:03',
// //       content: [
// //         { type: 'text', value: '五一假期期间，全国多地迎来了旅游高峰，特色旅游项目和文化活动吸引了大量游客。' },
// //         { type: 'image', value: 'https://p4.img.cctvpic.com/photoworkspace/contentimg/2025/05/05/2025050511454710904.jpg' },
// //         { type: 'text', value: '从大数据来看，西安、长沙、成都等城市旅游订单量同比增长显著，热门景区接待游客数创下新高。' },
// //         { type: 'image', value: 'https://picsum.photos/800/400?random=2' },
// //         { type: 'text', value: '文旅融合发展成为趋势，多地推出“夜游+演艺”、“非遗+体验”等新玩法，增强游客参与感。' },
// //         { type: 'video', value: 'https://mp-video.qpic.cn/0bf5syaaaaacrbqadwb8tkzfbdea2myaaaea.f10002.mp4' },
// //         { type: 'text', value: '相关部门提醒游客在出行过程中注意安全，合理安排行程，遵守公共秩序，文明旅游。' }
// //       ]
// //     }
// //   }
// // })


// Page({
//   data: {
//     title: '',
//     image: '',
//     content: '',
//     source: '',
//     date: ''
//   },

//   onLoad(options) {
//     const uniquekey = options.uniquekey
//     if (uniquekey) {
//       this.loadNewsDetail(uniquekey)
//     }
//   },

//   loadNewsDetail(uniquekey) {
//     wx.request({
//       url: `http://localhost:3000/api/news?category=`, // 先获取基础信息
//       method: 'GET',
//       success: (res) => {
//         const baseInfo = res.data.find(item => item.uniquekey === uniquekey)
//         if (baseInfo) {
//           this.setData({
//             title: baseInfo.title,
//             image: baseInfo.thumbnail_pic_s,
//             source: baseInfo.author_name,
//             date: baseInfo.date
//           })
//         }
//       }
//     })

//     wx.request({
//       url: `http://localhost:3000/api/news/detail?uniquekey=${uniquekey}`, // 获取正文
//       method: 'GET',
//       success: (res) => {
//         this.setData({
//           content: res.data.content || '暂无内容'
//         })
//       }
//     })
//   }
// })

// pages/news-detail/news-detail.js
Page({
  data: {
    htmlContent: ''
  },
  onLoad(options) {
    const uniquekey = options.uniquekey
    wx.request({
      url: `http://localhost:3000/api/news/detail?uniquekey=${uniquekey}`,
      success: res => {
        this.setData({
          htmlContent: res.data.content
        })
      }
    })
  }
})

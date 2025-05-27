Component({
    properties: {
        selected: {
            type: Number,
            value: 0
        },
        isDarkMode: {
            type: Boolean,
            value: false
        }
    },

    data: {
        list: [
            {
                pagePath: "/pages/index/index",
                text: "首页",
                iconPath: "/images/home.png",
                selectedIconPath: "/images/home-active.png"
            },
            {
                pagePath: "/pages/mine/mine",
                text: "我的",
                iconPath: "/images/mine.png",
                selectedIconPath: "/images/mine-active.png"
            }
        ],
        isNavigating: false
    },

    methods: {
        switchTab(e) {
            const data = e.currentTarget.dataset;
            const url = data.path;

            // 防止重复点击
            if (this.data.isNavigating || this.properties.selected === data.index) {
                return;
            }

            this.setData({ isNavigating: true });

            // 先更新选中状态，提供即时反馈
            this.setData({ selected: data.index });

            // 使用switchTab实现无动画切换
            wx.switchTab({
                url,
                complete: () => {
                    setTimeout(() => {
                        this.setData({ isNavigating: false });
                    }, 50); // 减少延迟时间
                }
            });
        }
    }
}); 
// app.js
App({
    globalData: {
        userInfo: null,
        baseUrl: 'your_api_base_url',
        isDarkMode: false,
        isThemeChanging: false
    },

    onLaunch() {
        // 获取主题状态
        const isDarkMode = wx.getStorageSync('isDarkMode') || false;
        this.globalData.isDarkMode = isDarkMode;
        this.updateTheme(isDarkMode);
    },

    // 全局主题切换方法
    updateTheme(isDarkMode) {
        // 防止重复切换
        if (this.globalData.isThemeChanging) return;
        this.globalData.isThemeChanging = true;

        // 更新导航栏
        wx.setNavigationBarColor({
            frontColor: isDarkMode ? '#ffffff' : '#000000',
            backgroundColor: isDarkMode ? '#1f1f1f' : '#87CEFA',
            animation: {
                duration: 0  // 移除动画
            }
        });

        this.globalData.isThemeChanging = false;
    }
})

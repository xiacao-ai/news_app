const express = require('express');
const app = express();
const cors = require('cors');
require('dotenv').config(); // 加载 .env 文件

const userRoutes = require('./routes/user');
const newsRoutes = require('./routes/news'); // 引入新闻路由
const historyRoutes = require('./routes/history'); // 引入新闻历史路由
const favoriteRoutes = require('./routes/favorite');
const commentRoutes = require('./routes/comment');
const messageRoutes = require('./routes/message').router; // 引入消息路由

app.use(cors());
app.use(express.json());

// 注册路由
app.use('/api/user', userRoutes);     // 可选：统一用户接口前缀
app.use('/api/news', newsRoutes);     // ✅ 改为 /api/news，与前端请求一致
app.use('/api/history', historyRoutes);
app.use('/api/favorite', favoriteRoutes);
app.use('/api/comment', commentRoutes);
app.use('/api/message', messageRoutes); // 注册消息路由

app.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
}); 
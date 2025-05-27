// routes/comment.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const dayjs = require('dayjs');

// 我的评论列表
router.get('/user', async (req, res) => {
    const { user_id, page = 1, pageSize = 10 } = req.query;
    if (!user_id) return res.status(400).json({ code: 1, error: '缺少用户ID' });
    const offset = (page - 1) * pageSize;
    const [[{ total }]] = await db.query(
        'SELECT COUNT(*) AS total FROM comments WHERE user_id = ?',
        [user_id]
    );
    const [comments] = await db.query(
        `SELECT c.id, c.content, c.create_time, c.news_uniquekey, n.title, n.thumbnail_pic_s
     FROM comments c
     JOIN news_detail n ON c.news_uniquekey = n.uniquekey
     WHERE c.user_id = ?
     ORDER BY c.create_time DESC
     LIMIT ? OFFSET ?`,
        [user_id, parseInt(pageSize), parseInt(offset)]
    );
    // 格式化时间
    comments.forEach(item => {
        item.create_time = dayjs(item.create_time).format('YYYY-MM-DD HH:mm');
    });
    res.json({ code: 0, data: { total, comments } });
});

// routes/comment.js
router.post('/delete', async (req, res) => {
    const { comment_ids, user_id } = req.body;
    if (!comment_ids || !user_id) return res.status(400).json({ code: 1, error: '缺少参数' });
    // 只允许删除自己的评论
    await db.query(
        `DELETE FROM comments WHERE id IN (?) AND user_id = ?`,
        [comment_ids, user_id]
    );
    res.json({ code: 0, message: '删除成功' });
});


module.exports = router;
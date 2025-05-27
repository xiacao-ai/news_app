// routes/favorite.js
const express = require('express');
const router = express.Router();
const db = require('../db');

// 收藏列表
router.get('/list', async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) return res.json({ code: 1, msg: '缺少用户ID' });
    const sql = `
    SELECT f.id, f.news_uniquekey, f.create_time,
           n.title, n.thumbnail_pic_s, n.category, n.author_name
    FROM news_favorite f
    LEFT JOIN news_detail n ON f.news_uniquekey = n.uniquekey
    WHERE f.user_id = ?
    ORDER BY f.create_time DESC
    LIMIT 100
  `;
    const [list] = await db.query(sql, [user_id]);
    res.json({ code: 0, list });
});

// 添加收藏
router.post('/add', async (req, res) => {
    const { user_id, news_uniquekey } = req.body;
    if (!user_id || !news_uniquekey) return res.json({ code: 1, msg: '参数缺失' });
    try {
        await db.query(
            `INSERT INTO news_favorite (user_id, news_uniquekey, create_time) VALUES (?, ?, NOW())
       ON DUPLICATE KEY UPDATE create_time = NOW()`,
            [user_id, news_uniquekey]
        );
        res.json({ code: 0, msg: '收藏成功' });
    } catch (err) {
        res.json({ code: 1, msg: '收藏失败', error: err.message });
    }
});

// 取消收藏
router.post('/remove', async (req, res) => {
    const { user_id, news_uniquekey } = req.body;
    if (!user_id || !news_uniquekey) return res.json({ code: 1, msg: '参数缺失' });
    await db.query(
        `DELETE FROM news_favorite WHERE user_id = ? AND news_uniquekey = ?`,
        [user_id, news_uniquekey]
    );
    res.json({ code: 0, msg: '取消收藏成功' });
});

// 批量删除
router.post('/batchDelete', async (req, res) => {
    let { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) return res.json({ code: 1, msg: '参数错误' });
    ids = ids.map(id => Number(id)).filter(id => !isNaN(id));
    if (!ids.length) return res.json({ code: 1, msg: '参数错误' });
    await db.query(`DELETE FROM news_favorite WHERE id IN (${ids.map(() => '?').join(',')})`, ids);
    res.json({ code: 0, msg: '删除成功' });
});

// 判断是否已收藏（详情页用）
router.get('/is_favorite', async (req, res) => {
    const { user_id, news_uniquekey } = req.query;
    if (!user_id || !news_uniquekey) return res.json({ code: 1, msg: '参数缺失' });
    const [rows] = await db.query(
        `SELECT id FROM news_favorite WHERE user_id = ? AND news_uniquekey = ? LIMIT 1`,
        [user_id, news_uniquekey]
    );
    res.json({ code: 0, is_favorite: rows.length > 0 });
});

module.exports = router;
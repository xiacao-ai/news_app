const express = require('express');
const router = express.Router();
const db = require('../db');
const dayjs = require('dayjs');

// 获取历史记录（分页,按时间倒序,带新闻详情）
router.get('/list', async (req, res) => {
    const { user_id, page = 1, pageSize = 10 } = req.query;
    if (!user_id) return res.json({ code: 1, msg: '缺少用户ID' });

    try {
        // 获取总数
        const [countResult] = await db.query(
            'SELECT COUNT(*) as total FROM news_history WHERE user_id = ?',
            [user_id]
        );
        const total = countResult[0].total;

        // 计算偏移量
        const offset = (page - 1) * pageSize;

        // 获取分页数据
        const sql = `
            SELECT 
                h.id,
                h.news_uniquekey,
                h.view_time,
                n.title,
                n.thumbnail_pic_s,
                n.category,
                n.author_name,
                n.date
            FROM news_history h
            LEFT JOIN news_detail n ON h.news_uniquekey = n.uniquekey
            WHERE h.user_id = ?
            ORDER BY h.view_time DESC
            LIMIT ? OFFSET ?
        `;
        const [list] = await db.query(sql, [user_id, Number(pageSize), offset]);

        // 处理日期分组
        const now = dayjs();
        const groupedList = list.map(item => {
            const viewTime = dayjs(item.view_time);
            const diffDays = now.diff(viewTime, 'day');

            let dateGroup;
            if (diffDays === 0) {
                dateGroup = '今天';
            } else if (diffDays === 1) {
                dateGroup = '昨天';
            } else {
                dateGroup = viewTime.format('M月D日');
            }

            return {
                ...item,
                view_time: viewTime.format('HH:mm'),
                date_group: dateGroup
            };
        });

        // 按日期分组整理数据
        const groupedData = groupedList.reduce((acc, item) => {
            const group = acc.find(g => g.date === item.date_group);
            if (group) {
                group.items.push(item);
            } else {
                acc.push({
                    date: item.date_group,
                    items: [item]
                });
            }
            return acc;
        }, []);

        res.json({
            code: 0,
            data: {
                list: groupedData,
                total,
                page: Number(page),
                pageSize: Number(pageSize)
            }
        });
    } catch (err) {
        console.error('获取历史记录失败:', err);
        res.json({ code: 1, msg: '获取历史记录失败' });
    }
});

// 新增历史
router.post('/add', async (req, res) => {
    const { user_id, news_uniquekey } = req.body;
    if (!user_id || !news_uniquekey) return res.json({ code: 1, msg: '参数缺失' });

    try {
        await db.query(
            `INSERT INTO news_history (user_id, news_uniquekey, view_time) 
             VALUES (?, ?, NOW())
             ON DUPLICATE KEY UPDATE view_time = NOW()`,
            [user_id, news_uniquekey]
        );
        res.json({ code: 0, msg: '添加成功' });
    } catch (err) {
        console.error('添加历史记录失败:', err);
        res.json({ code: 1, msg: '添加历史记录失败' });
    }
});

// 删除单条历史
router.post('/delete', async (req, res) => {
    const { id, user_id } = req.body;
    if (!id || !user_id) return res.json({ code: 1, msg: '参数缺失' });

    try {
        await db.query(
            'DELETE FROM news_history WHERE id = ? AND user_id = ?',
            [id, user_id]
        );
        res.json({ code: 0, msg: '删除成功' });
    } catch (err) {
        console.error('删除历史记录失败:', err);
        res.json({ code: 1, msg: '删除历史记录失败' });
    }
});

// 批量删除
router.post('/batchDelete', async (req, res) => {
    const { ids, user_id } = req.body;
    if (!Array.isArray(ids) || !ids.length || !user_id) {
        return res.json({ code: 1, msg: '参数错误' });
    }

    try {
        const validIds = ids.map(id => Number(id)).filter(id => !isNaN(id));
        if (!validIds.length) return res.json({ code: 1, msg: '无效的ID列表' });

        await db.query(
            `DELETE FROM news_history 
             WHERE id IN (${validIds.map(() => '?').join(',')})
             AND user_id = ?`,
            [...validIds, user_id]
        );
        res.json({ code: 0, msg: '批量删除成功' });
    } catch (err) {
        console.error('批量删除历史记录失败:', err);
        res.json({ code: 1, msg: '批量删除历史记录失败' });
    }
});

// 清空历史
router.post('/clear', async (req, res) => {
    const { user_id } = req.body;
    if (!user_id) return res.json({ code: 1, msg: '缺少用户ID' });

    try {
        await db.query('DELETE FROM news_history WHERE user_id = ?', [user_id]);
        res.json({ code: 0, msg: '清空成功' });
    } catch (err) {
        console.error('清空历史记录失败:', err);
        res.json({ code: 1, msg: '清空历史记录失败' });
    }
});

module.exports = router;
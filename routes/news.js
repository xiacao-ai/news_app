// const express = require('express');
// const router = express.Router();
// const db = require('../db');
// const dayjs = require('dayjs');
// const { createCommentMessage } = require('./message');

// // 分类映射
// const categoryMap = {
//     top: '头条',
//     guonei: '国内',
//     guoji: '国际',
//     yule: '娱乐',
//     tiyu: '体育',
//     junshi: '军事',
//     keji: '科技',
//     caijing: '财经',
//     youxi: '游戏',
//     jiankang: '健康'
// };

// // 获取新闻列表
// router.get('/', async (req, res) => {
//     const queryCategory = req.query.category || 'top';
//     const page = parseInt(req.query.page) || 1;
//     const pageSize = parseInt(req.query.pageSize) || 10;
//     const category = categoryMap[queryCategory] || queryCategory;

//     try {
//         // 获取总数
//         const [[{ total }]] = await db.query(
//             'SELECT COUNT(*) as total FROM news_detail WHERE category = ?',
//             [category]
//         );

//         // 获取分页数据
//         const [rows] = await db.query(
//             `SELECT 
//                 uniquekey, 
//                 title, 
//                 author_name, 
//                 date, 
//                 thumbnail_pic_s,
//                 (SELECT COUNT(*) FROM comments WHERE news_uniquekey = news_detail.uniquekey) as comment_count,
//                 (SELECT COUNT(*) FROM news_like WHERE news_uniquekey = news_detail.uniquekey) as like_count
//              FROM news_detail 
//              WHERE category = ? 
//              ORDER BY date DESC 
//              LIMIT ? OFFSET ?`,
//             [category, pageSize, (page - 1) * pageSize]
//         );

//         const formattedRows = rows.map(row => ({
//             ...row,
//             date: dayjs(row.date).format('YYYY年MM月DD日 HH:mm:ss')
//         }));

//         res.json({
//             total,
//             page,
//             pageSize,
//             hasMore: total > page * pageSize,
//             list: formattedRows
//         });
//     } catch (err) {
//         console.error('查询新闻列表失败:', err);
//         res.status(500).json({ error: '服务器错误' });
//     }
// });

// // 获取点赞状态
// router.get('/like', async (req, res) => {
//     try {
//         const { user_id, uniquekey } = req.query;
//         if (!user_id || !uniquekey) {
//             return res.json({
//                 code: 0,
//                 data: {
//                     liked: false,
//                     likeCount: 0
//                 }
//             });
//         }

//         // 查询是否已点赞
//         const [likes] = await db.query(
//             'SELECT * FROM news_like WHERE user_id = ? AND news_uniquekey = ?',
//             [user_id, uniquekey]
//         );

//         // 获取总点赞数
//         const [[{ likeCount }]] = await db.query(
//             'SELECT COUNT(*) as likeCount FROM news_like WHERE news_uniquekey = ?',
//             [uniquekey]
//         );

//         res.json({
//             code: 0,
//             data: {
//                 liked: likes.length > 0,
//                 likeCount
//             }
//         });
//     } catch (error) {
//         console.error('获取点赞状态失败:', error);
//         res.json({
//             code: 0,
//             data: {
//                 liked: false,
//                 likeCount: 0
//             }
//         });
//     }
// });

// // 获取收藏状态
// router.get('/favorite', async (req, res) => {
//     try {
//         const { user_id, uniquekey } = req.query;
//         if (!user_id || !uniquekey) {
//             return res.json({
//                 code: 0,
//                 collected: false
//             });
//         }

//         // 查询是否已收藏
//         const [favorites] = await db.query(
//             'SELECT * FROM news_favorite WHERE user_id = ? AND news_uniquekey = ?',
//             [user_id, uniquekey]
//         );

//         res.json({
//             code: 0,
//             collected: favorites.length > 0
//         });
//     } catch (error) {
//         console.error('获取收藏状态失败:', error);
//         res.json({
//             code: 0,
//             collected: false
//         });
//     }
// });

// // 获取评论列表
// router.get('/comments', async (req, res) => {
//     try {
//         const { uniquekey, page = 1, pageSize = 10, user_id } = req.query;
//         const offset = (page - 1) * pageSize;

//         // 获取评论总数
//         const [[{ total }]] = await db.query(
//             'SELECT COUNT(*) as total FROM comments WHERE news_uniquekey = ? AND parent_id IS NULL',
//             [uniquekey]
//         );

//         // 获取一级评论
//         const [comments] = await db.query(`
//             SELECT 
//                 c.id, c.content, c.like_count, c.create_time,
//                 u.nickname, u.avatar_url,
//                 CASE WHEN cl.id IS NOT NULL THEN 1 ELSE 0 END as is_liked
//             FROM comments c
//             LEFT JOIN users u ON c.user_id = u.id
//             LEFT JOIN comment_like cl ON c.id = cl.comment_id AND cl.user_id = ?
//             WHERE c.news_uniquekey = ? AND c.parent_id IS NULL
//             ORDER BY c.create_time DESC
//             LIMIT ? OFFSET ?
//         `, [user_id || 0, uniquekey, parseInt(pageSize), offset]);

//         // 获取每条评论的回复
//         for (let comment of comments) {
//             const [replies] = await db.query(`
//                 SELECT 
//                     c.id, c.content, c.like_count, c.create_time,
//                     u.nickname, u.avatar_url,
//                     CASE WHEN cl.id IS NOT NULL THEN 1 ELSE 0 END as is_liked
//                 FROM comments c
//                 LEFT JOIN users u ON c.user_id = u.id
//                 LEFT JOIN comment_like cl ON c.id = cl.comment_id AND cl.user_id = ?
//                 WHERE c.parent_id = ?
//                 ORDER BY c.create_time ASC
//             `, [user_id || 0, comment.id]);

//             comment.replies = replies;
//             comment.create_time = dayjs(comment.create_time).format('YYYY-MM-DD HH:mm:ss');
//             replies.forEach(reply => {
//                 reply.create_time = dayjs(reply.create_time).format('YYYY-MM-DD HH:mm:ss');
//             });
//         }

//         res.json({
//             code: 0,
//             total,
//             page: Number(page),
//             pageSize: Number(pageSize),
//             comments
//         });
//     } catch (error) {
//         console.error('获取评论列表失败:', error);
//         res.json({
//             code: 500,
//             msg: '获取评论列表失败'
//         });
//     }
// }); 



// // routes/news.js
const express = require('express');
const router = express.Router();
const db = require('../db');
const dayjs = require('dayjs');
const { createCommentMessage } = require('./message');

// 分类映射
const categoryMap = {
    top: '头条',
    guonei: '国内',
    guoji: '国际',
    yule: '娱乐',
    tiyu: '体育',
    junshi: '军事',
    keji: '科技',
    caijing: '财经',
    youxi: '游戏',
    jiankang: '健康'
};

// 获取新闻列表
router.get('/', async (req, res) => {
    const queryCategory = req.query.category || 'top';
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const category = categoryMap[queryCategory] || queryCategory;

    try {
        // 获取总数
        const [[{ total }]] = await db.query(
            'SELECT COUNT(*) as total FROM news_detail WHERE category = ?',
            [category]
        );

        // 获取分页数据
        const [rows] = await db.query(
            `SELECT 
                uniquekey, 
                title, 
                author_name, 
                date, 
                thumbnail_pic_s,
                (SELECT COUNT(*) FROM comments WHERE news_uniquekey = news_detail.uniquekey) as comment_count,
                (SELECT COUNT(*) FROM news_like WHERE news_uniquekey = news_detail.uniquekey) as like_count
             FROM news_detail 
             WHERE category = ? 
             ORDER BY date DESC 
             LIMIT ? OFFSET ?`,
            [category, pageSize, (page - 1) * pageSize]
        );

        const formattedRows = rows.map(row => ({
            ...row,
            date: dayjs(row.date).format('YYYY年MM月DD日 HH:mm:ss')
        }));

        res.json({
            total,
            page,
            pageSize,
            hasMore: total > page * pageSize,
            list: formattedRows
        });
    } catch (err) {
        console.error('查询新闻列表失败:', err);
        res.status(500).json({ error: '服务器错误' });
    }
});



// 获取新闻详情
router.get('/detail', async (req, res) => {
    const uniquekey = req.query.uniquekey;
    if (!uniquekey) {
        return res.status(400).json({ error: '缺少 uniquekey 参数' });
    }

    try {
        const [[newsDetail]] = await db.query(
            `SELECT d.title, d.author_name, d.date, c.content
             FROM news_detail d
             JOIN news_content c ON d.uniquekey = c.uniquekey
             WHERE d.uniquekey = ?`,
            [uniquekey]
        );

        if (!newsDetail) {
            return res.status(404).json({ error: '未找到该新闻内容' });
        }

        const { title, author_name, date, content } = newsDetail;
        const source = author_name || '未知';
        const datetime = dayjs(date).format('YYYY-MM-DD HH:mm');

        // 解析正文内容为有序的内容块（段落/图片混合）
        const blocks = [];
        const regex = /<p[^>]*>.*?<\/p>|<img[^>]*src=['"]([^'"]+)['"][^>]*>/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
            if (match[0].startsWith('<p')) {
                const text = match[0].replace(/<[^>]+>/g, '').trim();
                if (text) blocks.push({ type: 'text', value: text });
            } else if (match[0].startsWith('<img')) {
                const srcMatch = match[0].match(/src=['"]([^'"]+)['"]/)
                if (srcMatch) blocks.push({ type: 'image', value: srcMatch[1] });
            }
        }

        res.json({
            title,
            source,
            datetime,
            contentList: blocks
        });
    } catch (err) {
        console.error('查询新闻详情失败:', err);
        res.status(500).json({ error: '服务器错误' });
    }
});

// 获取评论总数
router.get('/comments/count', async (req, res) => {
    const { uniquekey } = req.query;
    const [[{ total }]] = await db.query(
        'SELECT COUNT(*) AS total FROM comments WHERE news_uniquekey = ?',
        [uniquekey]
    );
    res.json({ total });
});

// 获取评论列表
router.get('/comments', async (req, res) => {
    const { uniquekey, page = 1, pageSize = 10, user_id } = req.query;
    const offset = (page - 1) * pageSize;

    try {
        // 获取一级评论
        const [comments] = await db.query(`
            SELECT 
                c.id, c.content, c.like_count, c.create_time,
                u.nickname, u.avatar_url,
                CASE WHEN cl.id IS NOT NULL THEN 1 ELSE 0 END as is_liked
            FROM comments c
            LEFT JOIN users u ON c.user_id = u.id
            LEFT JOIN comment_like cl ON c.id = cl.comment_id AND cl.user_id = ?
            WHERE c.news_uniquekey = ? AND c.parent_id IS NULL
            ORDER BY c.create_time DESC
            LIMIT ? OFFSET ?
        `, [user_id || 0, uniquekey, parseInt(pageSize), offset]);

        // 获取每条评论的回复
        for (let comment of comments) {
            const [replies] = await db.query(`
                SELECT 
                    c.id, c.content, c.like_count, c.create_time,
                    u.nickname, u.avatar_url,
                    CASE WHEN cl.id IS NOT NULL THEN 1 ELSE 0 END as is_liked
                FROM comments c
                LEFT JOIN users u ON c.user_id = u.id
                LEFT JOIN comment_like cl ON c.id = cl.comment_id AND cl.user_id = ?
                WHERE c.parent_id = ?
                ORDER BY c.create_time ASC
            `, [user_id || 0, comment.id]);

            comment.replies = replies;
            comment.create_time = dayjs(comment.create_time).format('YYYY-MM-DD HH:mm:ss');
            replies.forEach(reply => {
                reply.create_time = dayjs(reply.create_time).format('YYYY-MM-DD HH:mm:ss');
            });
        }

        // 获取评论总数
        const [[{ total }]] = await db.query(
            'SELECT COUNT(*) as total FROM comments WHERE news_uniquekey = ? AND parent_id IS NULL',
            [uniquekey]
        );

        res.json({
            total,
            page: Number(page),
            pageSize: Number(pageSize),
            comments
        });
    } catch (error) {
        console.error('获取评论列表失败:', error);
        res.status(500).json({ error: '获取评论列表失败' });
    }
});

// 新增评论/回复
router.post('/comment', async (req, res) => {
    try {
        const { uniquekey, user_id, content, parent_id = null } = req.body;
        if (!uniquekey || !user_id || !content) {
            return res.status(400).json({ error: '缺少必要参数' });
        }

        // 获取新闻信息
        const [[news]] = await db.query(
            'SELECT title FROM news_detail WHERE uniquekey = ?',
            [uniquekey]
        );

        if (!news) {
            return res.status(404).json({ error: '新闻不存在' });
        }

        // 插入评论
        const [result] = await db.query(
            'INSERT INTO comments (news_uniquekey, user_id, content, parent_id) VALUES (?, ?, ?, ?)',
            [uniquekey, user_id, content, parent_id]
        );

        // 如果是回复评论，创建回复消息
        if (parent_id) {
            const [[parentComment]] = await db.query(
                'SELECT user_id FROM comments WHERE id = ?',
                [parent_id]
            );

            if (parentComment && parentComment.user_id !== user_id) {
                await createCommentMessage(
                    'COMMENT_REPLY',
                    parentComment.user_id,
                    uniquekey,
                    result.insertId,
                    '有人回复了你的评论',
                    `你在《${news.title}》下的评论收到了新回复`
                );
            }
        }

        res.json({
            code: 0,
            msg: '评论成功',
            data: {
                id: result.insertId
            }
        });
    } catch (error) {
        console.error('发表评论失败:', error);
        res.json({
            code: 500,
            msg: '发表评论失败'
        });
    }
});

// 评论点赞/取消
router.post('/comment/like', async (req, res) => {
    try {
        const { comment_id, user_id } = req.body;
        if (!comment_id || !user_id) return res.status(400).json({ error: '缺少参数' });

        // 获取评论信息
        const [[comment]] = await db.query(
            'SELECT c.*, n.uniquekey, n.title FROM comments c LEFT JOIN news_detail n ON c.news_uniquekey = n.uniquekey WHERE c.id = ?',
            [comment_id]
        );

        if (!comment) {
            return res.status(404).json({ error: '评论不存在' });
        }

        // 查询是否已点赞
        const [rows] = await db.query(
            'SELECT * FROM comment_like WHERE comment_id=? AND user_id=?',
            [comment_id, user_id]
        );

        if (rows.length > 0) {
            // 已点赞，取消
            await db.query(
                'DELETE FROM comment_like WHERE comment_id=? AND user_id=?',
                [comment_id, user_id]
            );
            await db.query(
                'UPDATE comments SET like_count = GREATEST(like_count-1,0) WHERE id=?',
                [comment_id]
            );
        } else {
            // 未点赞，点赞
            await db.query(
                'INSERT INTO comment_like (comment_id, user_id) VALUES (?, ?)',
                [comment_id, user_id]
            );
            await db.query(
                'UPDATE comments SET like_count = like_count+1 WHERE id=?',
                [comment_id]
            );

            // 创建点赞消息
            if (comment.user_id !== user_id) {
                await createCommentMessage(
                    'COMMENT_LIKE',
                    comment.user_id,
                    comment.uniquekey,
                    comment_id,
                    '有人点赞了你的评论',
                    `你在《${comment.title}》下的评论获得了一个点赞`
                );
            }
        }

        // 查询最新点赞数
        const [[{ like_count }]] = await db.query(
            'SELECT like_count FROM comments WHERE id=?',
            [comment_id]
        );

        res.json({
            code: 0,
            data: {
                liked: rows.length === 0,
                likeCount: like_count
            }
        });
    } catch (error) {
        console.error('操作点赞失败:', error);
        res.json({
            code: 500,
            msg: '操作点赞失败'
        });
    }
});

// 新闻收藏/取消
router.post('/favorite', async (req, res) => {
    try {
        const { user_id, uniquekey } = req.body;
        if (!user_id || !uniquekey) return res.status(400).json({ error: '缺少参数' });

        const [rows] = await db.query(
            'SELECT * FROM news_favorite WHERE user_id=? AND news_uniquekey=?',
            [user_id, uniquekey]
        );

        if (rows.length > 0) {
            await db.query(
                'DELETE FROM news_favorite WHERE user_id=? AND news_uniquekey=?',
                [user_id, uniquekey]
            );
            res.json({ code: 0, msg: '已取消收藏', collected: false });
        } else {
            await db.query(
                'INSERT INTO news_favorite (user_id, news_uniquekey) VALUES (?, ?)',
                [user_id, uniquekey]
            );
            res.json({ code: 0, msg: '已收藏', collected: true });
        }
    } catch (error) {
        console.error('操作收藏失败:', error);
        res.json({ code: 500, msg: '操作失败' });
    }
});

// 新闻点赞/取消
router.post('/like', async (req, res) => {
    try {
        const { user_id, uniquekey } = req.body;
        if (!user_id || !uniquekey) return res.status(400).json({ error: '缺少参数' });

        const [rows] = await db.query(
            'SELECT * FROM news_like WHERE user_id=? AND news_uniquekey=?',
            [user_id, uniquekey]
        );

        if (rows.length > 0) {
            await db.query(
                'DELETE FROM news_like WHERE user_id=? AND news_uniquekey=?',
                [user_id, uniquekey]
            );
        } else {
            await db.query(
                'INSERT INTO news_like (user_id, news_uniquekey) VALUES (?, ?)',
                [user_id, uniquekey]
            );
        }

        // 获取最新点赞数
        const [[{ like_count }]] = await db.query(
            'SELECT COUNT(*) as like_count FROM news_like WHERE news_uniquekey=?',
            [uniquekey]
        );

        res.json({
            code: 0,
            data: {
                liked: rows.length === 0,
                likeCount: like_count
            }
        });
    } catch (error) {
        console.error('操作点赞失败:', error);
        res.json({ code: 500, msg: '操作失败' });
    }
});

// 搜索新闻
router.get('/search', async (req, res) => {
    try {
        const { keyword } = req.query;
        if (!keyword) return res.json([]);

        const [rows] = await db.query(`
            SELECT
                n.uniquekey,
                n.title,
                n.thumbnail_pic_s,
                n.author_name,
                n.date,
                IFNULL(c.comment_count, 0) AS comment_count,
                IFNULL(l.like_count, 0) AS like_count
            FROM news_detail n
            LEFT JOIN (
                SELECT news_uniquekey, COUNT(*) AS comment_count
                FROM comments
                GROUP BY news_uniquekey
            ) c ON n.uniquekey = c.news_uniquekey
            LEFT JOIN (
                SELECT news_uniquekey, COUNT(*) AS like_count
                FROM news_like
                GROUP BY news_uniquekey
            ) l ON n.uniquekey = l.news_uniquekey
            WHERE n.title LIKE ? OR n.author_name LIKE ?
            ORDER BY n.date DESC
            LIMIT 30
        `, [`%${keyword}%`, `%${keyword}%`]);

        rows.forEach(item => {
            item.date = dayjs(item.date).format('YYYY-MM-DD HH:mm:ss');
        });

        res.json(rows);
    } catch (error) {
        console.error('搜索新闻失败:', error);
        res.status(500).json({ error: '搜索失败' });
    }
});

// 获取热门新闻
router.get('/hotlist', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT
                n.uniquekey,
                n.title,
                n.thumbnail_pic_s,
                n.author_name,
                n.date,
                IFNULL(c.comment_count, 0) AS comment_count,
                IFNULL(l.like_count, 0) AS like_count
            FROM news_detail n
            LEFT JOIN (
                SELECT news_uniquekey, COUNT(*) AS comment_count
                FROM comments
                GROUP BY news_uniquekey
            ) c ON n.uniquekey = c.news_uniquekey
            LEFT JOIN (
                SELECT news_uniquekey, COUNT(*) AS like_count
                FROM news_like
                GROUP BY news_uniquekey
            ) l ON n.uniquekey = l.news_uniquekey
            ORDER BY (IFNULL(c.comment_count,0) + IFNULL(l.like_count,0)) DESC, n.date DESC
            LIMIT 6
        `);

        rows.forEach(item => {
            item.date = dayjs(item.date).format('YYYY-MM-DD HH:mm:ss');
        });

        res.json(rows);
    } catch (error) {
        console.error('获取热门新闻失败:', error);
        res.status(500).json({ error: '获取失败' });
    }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../db');
const dayjs = require('dayjs');

// 创建消息
async function createMessage(type_code, receiver_id, sender_id = null, title, content, news_uniquekey = null, comment_id = null) {
    try {
        // 获取消息类型ID
        const [types] = await db.query(
            'SELECT id FROM message_types WHERE type_code = ?',
            [type_code]
        );
        if (types.length === 0) {
            throw new Error('Invalid message type');
        }

        // 检查用户的消息设置
        const [settings] = await db.query(
            'SELECT is_enabled FROM message_settings WHERE user_id = ? AND type_id = ?',
            [receiver_id, types[0].id]
        );

        // 如果用户关闭了该类型的消息，则不创建
        if (settings.length > 0 && !settings[0].is_enabled) {
            return;
        }

        // 创建消息
        await db.query(
            `INSERT INTO messages (
                type_id, receiver_id, sender_id, title, content, 
                news_uniquekey, comment_id
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [types[0].id, receiver_id, sender_id, title, content, news_uniquekey, comment_id]
        );
    } catch (error) {
        // console.error('创建消息失败:', error);
        throw error;
    }
}

// 创建评论相关消息的便捷方法
async function createCommentMessage(type_code, receiver_id, news_uniquekey, comment_id, title, content) {
    try {
        // 获取评论信息
        const [comments] = await db.query(
            'SELECT user_id FROM comments WHERE id = ?',
            [comment_id]
        );

        if (comments.length > 0) {
            await createMessage(
                type_code,
                receiver_id,
                comments[0].user_id,
                title,
                content,
                news_uniquekey,
                comment_id
            );
        }
    } catch (error) {
        // console.error('创建评论消息失败:', error);
        throw error;
    }
}

// 获取消息列表
router.get('/list', async (req, res) => {
    try {
        const user_id = parseInt(req.query.user_id);
        const page = parseInt(req.query.page) || 1;
        const pageSize = parseInt(req.query.pageSize) || 10;
        const type_id = req.query.type_id ? parseInt(req.query.type_id) : null;

        console.log('接收到的参数:', { user_id, page, pageSize, type_id });

        if (!user_id) {
            return res.json({
                code: 400,
                msg: '用户ID不能为空'
            });
        }

        const offset = (page - 1) * pageSize;

        // 构建查询条件
        let whereClause = 'WHERE m.receiver_id = ?';
        let params = [user_id];
        if (type_id) {
            whereClause += ' AND m.type_id = ?';
            params.push(type_id);
        }

        // 先检查用户是否存在
        const [users] = await db.query('SELECT id FROM users WHERE id = ?', [user_id]);
        if (users.length === 0) {
            return res.json({
                code: 400,
                msg: '用户不存在'
            });
        }

        console.log('构建的SQL参数:', {
            whereClause,
            params,
            pageSize,
            offset
        });

        // 获取消息列表
        const [messages] = await db.query(`
            SELECT 
                m.*,
                mt.type_code,
                mt.type_name,
                mt.type_icon,
                u.nickname as sender_nickname,
                u.avatar_url as sender_avatar,
                nd.title as news_title,
                nd.thumbnail_pic_s as news_cover,
                CASE 
                    WHEN m.comment_id IS NOT NULL THEN (
                        SELECT JSON_OBJECT(
                            'id', c.id,
                            'content', c.content,
                            'create_time', c.create_time
                        )
                        FROM comments c
                        WHERE c.id = m.comment_id
                    )
                    ELSE NULL
                END as comment_info
            FROM messages m
            LEFT JOIN message_types mt ON m.type_id = mt.id
            LEFT JOIN users u ON m.sender_id = u.id
            LEFT JOIN news_detail nd ON m.news_uniquekey = nd.uniquekey
            ${whereClause}
            ORDER BY m.create_time DESC
            LIMIT ? OFFSET ?
        `, [...params, pageSize, offset]);

        // console.log('查询到的消息数量:', messages.length);

        // 格式化时间
        messages.forEach(msg => {
            msg.create_time = dayjs(msg.create_time).format('YYYY-MM-DD HH:mm:ss');
            if (msg.comment_info) {
                // comment_info 已经是对象，不需要再次解析
                if (msg.comment_info.create_time) {
                    msg.comment_info.create_time = dayjs(msg.comment_info.create_time).format('YYYY-MM-DD HH:mm:ss');
                }
            }
        });

        // 获取消息类型列表
        const [types] = await db.query(`
            SELECT 
                mt.*,
                COUNT(CASE WHEN m.is_read = 0 AND m.receiver_id = ? THEN 1 END) as unread_count
            FROM message_types mt
            LEFT JOIN messages m ON mt.id = m.type_id
            GROUP BY mt.id
        `, [user_id]);

        // console.log('查询到的消息类型:', types);

        // 获取未读消息统计
        const [unread] = await db.query(`
            SELECT 
                (SELECT COUNT(*) FROM messages WHERE receiver_id = ? AND is_read = 0) as total,
                JSON_OBJECTAGG(COALESCE(type_id, 'null'), unread_count) as by_type
            FROM (
                SELECT 
                    type_id,
                    COUNT(*) as unread_count
                FROM messages 
                WHERE receiver_id = ? AND is_read = 0
                GROUP BY type_id
            ) t
        `, [user_id, user_id]);

        const response = {
            code: 0,
            data: {
                messages,
                types,
                unread: {
                    total: unread[0]?.total || 0,
                    byType: unread[0]?.by_type || {}  // 移除 JSON.parse
                }
            }
        };

        console.log('响应数据结构:', {
            messagesCount: messages.length,
            typesCount: types.length,
            unreadTotal: response.data.unread.total
        });

        res.json(response);
    } catch (error) {
        res.json({
            code: 500,
            msg: `获取消息列表失败: ${error.message}`
        });
    }
});

// 标记消息已读
router.post('/read', async (req, res) => {
    try {
        const { user_id, message_ids } = req.body;
        if (!Array.isArray(message_ids) || message_ids.length === 0) {
            return res.json({
                code: 400,
                msg: '参数错误'
            });
        }

        await db.query(
            'UPDATE messages SET is_read = 1 WHERE receiver_id = ? AND id IN (?)',
            [user_id, message_ids]
        );

        res.json({
            code: 0,
            msg: '标记已读成功'
        });
    } catch (error) {
        res.json({
            code: 500,
            msg: '标记已读失败'
        });
    }
});

// 删除消息
router.post('/delete', async (req, res) => {
    try {
        const { user_id, message_ids } = req.body;
        if (!Array.isArray(message_ids) || message_ids.length === 0) {
            return res.json({
                code: 400,
                msg: '参数错误'
            });
        }

        await db.query(
            'DELETE FROM messages WHERE receiver_id = ? AND id IN (?)',
            [user_id, message_ids]
        );

        res.json({
            code: 0,
            msg: '删除成功'
        });
    } catch (error) {
        res.json({
            code: 500,
            msg: '删除失败'
        });
    }
});

// 获取消息设置
router.get('/settings', async (req, res) => {
    try {
        const { user_id } = req.query;

        const [settings] = await db.query(`
            SELECT 
                mt.id as type_id,
                mt.type_name,
                mt.type_icon,
                COALESCE(ms.is_enabled, 1) as is_enabled
            FROM message_types mt
            LEFT JOIN message_settings ms ON mt.id = ms.type_id AND ms.user_id = ?
        `, [user_id]);

        res.json({
            code: 0,
            data: settings
        });
    } catch (error) {
        // console.error('获取消息设置失败:', error);
        res.json({
            code: 500,
            msg: '获取消息设置失败'
        });
    }
});

// 更新消息设置
router.post('/settings/update', async (req, res) => {
    try {
        const { user_id, settings } = req.body;
        if (!Array.isArray(settings)) {
            return res.json({
                code: 400,
                msg: '参数错误'
            });
        }

        // 使用事务确保原子性
        const connection = await db.getConnection();
        await connection.beginTransaction();

        try {
            for (const setting of settings) {
                const { type_id, is_enabled } = setting;
                await connection.query(`
                    INSERT INTO message_settings (user_id, type_id, is_enabled)
                    VALUES (?, ?, ?)
                    ON DUPLICATE KEY UPDATE is_enabled = ?
                `, [user_id, type_id, is_enabled, is_enabled]);
            }

            await connection.commit();
            res.json({
                code: 0,
                msg: '更新成功'
            });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.json({
            code: 500,
            msg: '更新失败'
        });
    }
});

module.exports = {
    router,
    createMessage,
    createCommentMessage
}; 
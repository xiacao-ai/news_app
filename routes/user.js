

// const express = require('express');
// const router = express.Router();
// const db = require('../db');
// const axios = require('axios');
// require('dotenv').config(); // 加在最上面


// // 小程序配置
// const APPID = process.env.APPID;
// const SECRET = process.env.SECRET;


// router.post('/login', async (req, res) => {
//     const { code, nickName, avatarUrl } = req.body;
//     if (!code) return res.json({ code: 1, msg: 'code不能为空' });

//     try {
//         // 通过 code 获取 openid
//         const wxRes = await axios.get(`https://api.weixin.qq.com/sns/jscode2session`, {
//             params: {
//                 appid: APPID,
//                 secret: SECRET,
//                 js_code: code,
//                 grant_type: 'authorization_code'
//             }
//         });

//         const { openid } = wxRes.data;
//         if (!openid) return res.json({ code: 2, msg: '获取openid失败' });

//         // 查询用户是否存在
//         const [rows] = await db.query('SELECT * FROM users WHERE openid = ?', [openid]);

//         let user;
//         if (rows.length === 0) {
//             // 新用户，插入数据库
//             const [result] = await db.query(
//                 'INSERT INTO users (openid, nickname, avatar_url) VALUES (?, ?, ?)',
//                 [openid, nickName, avatarUrl]
//             );
//             user = { id: result.insertId, openid, nickname: nickName, avatar_url: avatarUrl };
//         } else {
//             // 老用户，更新信息
//             await db.query(
//                 'UPDATE users SET nickname = ?, avatar_url = ? WHERE openid = ?',
//                 [nickName, avatarUrl, openid]
//             );
//             user = rows[0];
//         }

//         res.json({ code: 0, msg: '登录成功', user });

//     } catch (err) {
//         console.error(err);
//         res.json({ code: 500, msg: '服务器错误' });
//     }
// });

// // 更新用户信息
// router.post('/update', async (req, res) => {
//     const { id, nickname, avatar_url, signature, gender } = req.body;
//     if (!id) return res.json({ code: 1, msg: '用户id不能为空' });

//     try {
//         await db.query(
//             'UPDATE users SET nickname=?, avatar_url=?, signature=?, gender=? WHERE id=?',
//             [nickname, avatar_url, signature, gender, id]
//         );
//         // 返回最新用户信息
//         const [rows] = await db.query('SELECT id, openid, nickname, avatar_url, signature, gender, DATE_FORMAT(create_time, "%Y-%m-%d %H:%i:%s") as create_time FROM users WHERE id=?', [id]);
//         res.json({ code: 0, msg: '更新成功', user: rows[0] });
//     } catch (err) {
//         console.error(err);
//         res.json({ code: 500, msg: '服务器错误' });
//     }
// });

// module.exports = router;



const express = require('express');
const router = express.Router();
const db = require('../db');
const axios = require('axios');
require('dotenv').config();

const APPID = process.env.APPID;
const SECRET = process.env.SECRET;

// 格式化用户信息
function formatUserInfo(user) {
    return {
        id: user.id,
        openid: user.openid,
        nickName: user.nickname,  // 统一使用nickName
        avatarUrl: user.avatar_url,  // 统一使用avatarUrl
        signature: user.signature,
        gender: user.gender,
        createTime: user.create_time
    };
}

router.post('/login', async (req, res) => {
    const { code, nickName, avatarUrl } = req.body;
    if (!code) return res.json({ code: 1, msg: 'code不能为空' });

    try {
        // 通过 code 获取 openid
        const wxRes = await axios.get(`https://api.weixin.qq.com/sns/jscode2session`, {
            params: {
                appid: APPID,
                secret: SECRET,
                js_code: code,
                grant_type: 'authorization_code'
            }
        });

        const { openid } = wxRes.data;
        if (!openid) return res.json({ code: 2, msg: '获取openid失败' });

        // 查询用户是否存在
        const [rows] = await db.query('SELECT * FROM users WHERE openid = ?', [openid]);

        let user;
        if (rows.length === 0) {
            // 新用户，插入数据库
            const [result] = await db.query(
                'INSERT INTO users (openid, nickname, avatar_url) VALUES (?, ?, ?)',
                [openid, nickName, avatarUrl]
            );
            const [newUser] = await db.query('SELECT * FROM users WHERE id = ?', [result.insertId]);
            user = formatUserInfo(newUser[0]);
        } else {
            // 老用户，更新信息
            await db.query(
                'UPDATE users SET nickname = ?, avatar_url = ? WHERE openid = ?',
                [nickName, avatarUrl, openid]
            );
            const [updatedUser] = await db.query('SELECT * FROM users WHERE openid = ?', [openid]);
            user = formatUserInfo(updatedUser[0]);
        }

        res.json({ code: 0, msg: '登录成功', user });

    } catch (err) {
        console.error(err);
        res.json({ code: 500, msg: '服务器错误' });
    }
});

// 更新用户信息
router.post('/update', async (req, res) => {
    const { id, nickName, avatarUrl, signature, gender } = req.body;
    if (!id) return res.json({ code: 1, msg: '用户id不能为空' });

    try {
        await db.query(
            'UPDATE users SET nickname=?, avatar_url=?, signature=?, gender=? WHERE id=?',
            [nickName, avatarUrl, signature, gender, id]
        );
        // 返回最新用户信息
        const [rows] = await db.query('SELECT * FROM users WHERE id=?', [id]);
        res.json({ code: 0, msg: '更新成功', user: formatUserInfo(rows[0]) });
    } catch (err) {
        console.error(err);
        res.json({ code: 500, msg: '服务器错误' });
    }
});

module.exports = router; 
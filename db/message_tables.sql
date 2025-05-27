-- 消息类型表
CREATE TABLE message_types (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '类型ID',
  type_code VARCHAR(50) NOT NULL UNIQUE COMMENT '类型代码',
  type_name VARCHAR(50) NOT NULL COMMENT '类型名称',
  type_icon VARCHAR(255) DEFAULT NULL COMMENT '类型图标',
  is_system TINYINT DEFAULT 0 COMMENT '是否系统消息 0否 1是',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) COMMENT='消息类型表';

-- 插入默认的消息类型
INSERT INTO message_types (type_code, type_name, type_icon, is_system) VALUES
('COMMENT_REPLY', '评论回复', '/images/reply.png', 0),
('COMMENT_LIKE', '评论点赞', '/images/like.png', 0),
('SYSTEM_NOTICE', '系统通知', '/images/notice.png', 1);

-- 消息表
CREATE TABLE messages (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '消息ID',
  type_id INT NOT NULL COMMENT '消息类型ID',
  receiver_id INT NOT NULL COMMENT '接收者用户ID',
  sender_id INT DEFAULT NULL COMMENT '发送者用户ID',
  title VARCHAR(100) NOT NULL COMMENT '消息标题',
  content TEXT NOT NULL COMMENT '消息内容',
  is_read TINYINT DEFAULT 0 COMMENT '是否已读 0未读 1已读',
  news_uniquekey VARCHAR(50) DEFAULT NULL COMMENT '相关新闻ID',
  comment_id INT DEFAULT NULL COMMENT '相关评论ID',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  FOREIGN KEY (type_id) REFERENCES message_types(id),
  FOREIGN KEY (receiver_id) REFERENCES users(id),
  FOREIGN KEY (sender_id) REFERENCES users(id),
  FOREIGN KEY (news_uniquekey) REFERENCES news_detail(uniquekey),
  FOREIGN KEY (comment_id) REFERENCES comments(id)
) COMMENT='消息表';

-- 消息设置表
CREATE TABLE message_settings (
  id INT PRIMARY KEY AUTO_INCREMENT COMMENT '设置ID',
  user_id INT NOT NULL COMMENT '用户ID',
  type_id INT NOT NULL COMMENT '消息类型ID',
  is_enabled TINYINT DEFAULT 1 COMMENT '是否启用 0关闭 1启用',
  create_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE KEY `unique_user_type` (user_id, type_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (type_id) REFERENCES message_types(id)
) COMMENT='消息设置表'; 
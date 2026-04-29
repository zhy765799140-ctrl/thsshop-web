-- Supabase 数据库初始化脚本
-- 请在 Supabase 控制台的 SQL Editor 中执行此脚本

-- 1. 用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  phone VARCHAR(11) UNIQUE NOT NULL,
  name VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 启用 RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- 3. 允许所有人读取用户（用于登录验证）
CREATE POLICY "Allow public read users" ON users
  FOR SELECT USING (true);

-- 4. 允许插入新用户
CREATE POLICY "Allow insert users" ON users
  FOR INSERT WITH CHECK (true);

-- 5. 创建索引加速手机号查询
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

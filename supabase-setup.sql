-- ============================================================
-- 通知公告系统 Supabase 初始化 SQL
-- 在 Supabase Dashboard → SQL Editor 中执行此文件
-- ============================================================

-- 1. 通知表
CREATE TABLE notices (
  id         uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title      text NOT NULL,
  content    text NOT NULL DEFAULT '',
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. 附件表
CREATE TABLE attachments (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  notice_id   uuid NOT NULL REFERENCES notices(id) ON DELETE CASCADE,
  filename    text NOT NULL,       -- 原始文件名（下载时显示）
  stored_name text NOT NULL,       -- Storage 中的路径（uuid.ext）
  file_size   bigint NOT NULL DEFAULT 0,
  uploaded_at timestamptz NOT NULL DEFAULT now()
);

-- 3. 索引
CREATE INDEX idx_notices_created ON notices(created_at DESC);
CREATE INDEX idx_notices_deleted ON notices(is_deleted);
CREATE INDEX idx_attachments_notice ON attachments(notice_id);

-- 4. 自动更新 updated_at 触发器
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER notices_updated_at
  BEFORE UPDATE ON notices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- 5. 开启行级安全
ALTER TABLE notices ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- 6. RLS 策略 — notices
-- 匿名用户：只能读取未删除的通知
CREATE POLICY "anon_read_active_notices"
  ON notices FOR SELECT TO anon
  USING (is_deleted = false);

-- 管理员（已登录）：完全权限（可读包括已删除）
CREATE POLICY "auth_full_notices"
  ON notices FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 7. RLS 策略 — attachments
-- 匿名用户：可读（用于下载链接）
CREATE POLICY "anon_read_attachments"
  ON attachments FOR SELECT TO anon
  USING (true);

-- 管理员：完全权限
CREATE POLICY "auth_full_attachments"
  ON attachments FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- 8. Storage 桶策略（附件存储）
-- 需先在 Dashboard → Storage 中创建名为 attachments 的桶，并勾选 Public
-- 然后执行以下 Storage 策略：

INSERT INTO storage.buckets (id, name, public)
  VALUES ('attachments', 'attachments', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public_read_attachments_storage"
  ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'attachments');

CREATE POLICY "auth_upload_attachments_storage"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'attachments');

CREATE POLICY "auth_delete_attachments_storage"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'attachments');

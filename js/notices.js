// ── 公开 ────────────────────────────────────────────────────

async function getPublicNotices(page = 1) {
  const from = (page - 1) * PER_PAGE;
  const to = from + PER_PAGE - 1;
  const { data, error, count } = await sb
    .from('notices')
    .select('id, title, created_at', { count: 'exact' })
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .range(from, to);
  return { data, error, count };
}

async function getPublicNotice(id) {
  const { data, error } = await sb
    .from('notices')
    .select('*')
    .eq('id', id)
    .eq('is_deleted', false)
    .single();
  return { data, error };
}

// ── 管理员 ──────────────────────────────────────────────────

async function getAllNoticesAdmin() {
  const { data, error } = await sb
    .from('notices')
    .select('*')
    .order('created_at', { ascending: false });
  return { data, error };
}

async function getNoticeAdmin(id) {
  const { data, error } = await sb
    .from('notices')
    .select('*')
    .eq('id', id)
    .single();
  return { data, error };
}

async function createNotice(title, content) {
  const { data, error } = await sb
    .from('notices')
    .insert({ title, content })
    .select()
    .single();
  return { data, error };
}

async function updateNotice(id, title, content) {
  const { data, error } = await sb
    .from('notices')
    .update({ title, content })
    .eq('id', id)
    .select()
    .single();
  return { data, error };
}

async function softDeleteNotice(id) {
  const { error } = await sb
    .from('notices')
    .update({ is_deleted: true })
    .eq('id', id);
  return { error };
}

async function restoreNotice(id) {
  const { error } = await sb
    .from('notices')
    .update({ is_deleted: false })
    .eq('id', id);
  return { error };
}

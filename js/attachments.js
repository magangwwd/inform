async function getAttachments(noticeId) {
  const { data, error } = await sb
    .from('attachments')
    .select('*')
    .eq('notice_id', noticeId)
    .order('uploaded_at', { ascending: true });
  return { data, error };
}

// 上传文件列表并写入数据库，返回错误列表
async function uploadAttachments(files, noticeId) {
  const errors = [];
  for (const file of files) {
    const ext = file.name.includes('.') ? '.' + file.name.split('.').pop() : '';
    const storedName = crypto.randomUUID() + ext;

    const { error: upErr } = await sb.storage
      .from('attachments')
      .upload(storedName, file, { upsert: false });

    if (upErr) { errors.push(`${file.name}: ${upErr.message}`); continue; }

    const { error: dbErr } = await sb
      .from('attachments')
      .insert({ notice_id: noticeId, filename: file.name, stored_name: storedName, file_size: file.size });

    if (dbErr) errors.push(`${file.name}: ${dbErr.message}`);
  }
  return errors;
}

// 删除单个附件（Storage + DB）
async function deleteAttachment(attachmentId, storedName) {
  await sb.storage.from('attachments').remove([storedName]);
  const { error } = await sb.from('attachments').delete().eq('id', attachmentId);
  return { error };
}

// 获取公开下载 URL
function getPublicUrl(storedName) {
  const { data } = sb.storage.from('attachments').getPublicUrl(storedName);
  return data.publicUrl;
}

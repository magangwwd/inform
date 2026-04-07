// 要求已登录；未登录时跳转到 login.html（与调用页同目录）
async function requireAuth() {
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    window.location.href = 'login.html';
    return null;
  }
  return session;
}

// 登录（只需密码，邮箱从 config.js 取）
async function signIn(password) {
  const { data, error } = await sb.auth.signInWithPassword({
    email: ADMIN_EMAIL,
    password
  });
  return { data, error };
}

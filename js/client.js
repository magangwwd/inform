// Supabase 客户端（全局单例）
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── 工具函数 ────────────────────────────────────────────────

function formatSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

function formatDate(iso) {
  if (!iso) return '';
  return iso.slice(0, 16).replace('T', ' ');
}

function getParam(key) {
  return new URLSearchParams(window.location.search).get(key);
}

// 显示提示消息（4秒后自动消失）
function showMsg(msg, type = 'success') {
  const container = document.getElementById('flash-container');
  if (!container) return;
  const div = document.createElement('div');
  div.className = 'flash ' + type;
  div.innerHTML = `<span>${msg}</span><button class="flash-close" onclick="this.parentElement.remove()">×</button>`;
  container.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

// 根据登录状态更新 Header 导航链接
async function updateHeaderNav(loginHref, dashboardHref) {
  const { data: { session } } = await sb.auth.getSession();
  const navEl = document.getElementById('nav-admin');
  if (!navEl) return;
  if (session) {
    navEl.innerHTML = `<a href="${dashboardHref}">管理后台</a><a href="#" onclick="doLogout(event)">退出</a>`;
  } else {
    navEl.innerHTML = `<a href="${loginHref}">管理员登录</a>`;
  }
}

async function doLogout(e) {
  e && e.preventDefault();
  await sb.auth.signOut();
  window.location.href = '/';
}

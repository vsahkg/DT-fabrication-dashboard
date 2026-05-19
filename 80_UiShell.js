/* =========================
   UI RENDERING — v2 (role-aware, spec-compliant)
   ========================= */

function renderPage_(page, boot) {
  var u = boot.currentUser;
  var role = u.role || 'guest';
  var isAdmin = u.isAdmin;
  var isSystemAdmin = role === 'admin';
  var isTeacherBetaUser = role === 'teacher' || role === 'admin';
  var userChip = u.email
    ? '<div class="user-chip"><span class="user-avatar">' + escapeHtml_((u.name || u.email).charAt(0).toUpperCase()) + '</span><span class="user-info"><span class="user-name">' + escapeHtml_(u.name || u.email.split('@')[0]) + '</span><span class="user-role role-' + escapeHtml_(role) + '">' + escapeHtml_(role) + '</span></span></div>'
    : '<div class="user-chip"><span class="user-name muted-chip">Not signed in</span></div>';

  function navLink_(target, label, options) {
    options = options || {};
    var isActive = page === target;
    var id = options.id || target;
    var icon = options.icon || String(label || '').slice(0, 2).toUpperCase();
    var title = options.title || label;
    return '<a href="?page=' + escapeHtml_(target) + '" id="nav-' + escapeHtml_(id) + '" class="tab-btn' + (options.special ? ' tab-btn--special' : '') + (isActive ? ' active' : '') + '" title="' + escapeHtml_(title) + '"' + (isActive ? ' aria-current="page"' : '') + ' onclick="switchPage(&#39;' + escapeHtml_(target) + '&#39;); return false;"><span class="tab-icon" aria-hidden="true">' + escapeHtml_(icon) + '</span><span class="tab-label">' + escapeHtml_(label) + '</span></a>';
  }

  /* Role-adaptive nav */
  var navItems = '';
  if (role === 'student' || role === 'guest') {
    navItems = [
      navLink_('submit', 'Submit', { icon: '📄', title: 'DT Submit' }),
      navLink_('status', 'Lookup', { icon: '🔍', title: 'Status Lookup' }),
      navLink_('queue', 'Queue', { icon: '📈', title: 'Queue Status' }),
      navLink_('machines', 'Machines', { icon: '🛠', title: 'Machines Guide' }),
      navLink_('other', 'Special', { icon: '⭐', title: 'Special Request', special: true }),
      navLink_('help', 'Help', { icon: '?', title: 'Help' })
    ].join('');
  } else if (role === 'teacher') {
    navItems = [
      navLink_('submit', 'Submit', { icon: '📄', title: 'DT Submit' }),
      navLink_('status', 'Lookup', { icon: '🔍', title: 'Student Status Lookup' }),
      navLink_('teacherbeta', 'Class', { icon: '📋', id: 'teacherbeta', title: 'Class' }),
      navLink_('queue', 'Queue', { icon: '📈', title: 'Queue Status' }),
      navLink_('admin', 'Students', { icon: '👥', title: 'My Students' }),
      navLink_('machines', 'Machines', { icon: '🛠' }),
      navLink_('other', 'Special', { icon: '⭐', title: 'Special Request', special: true }),
      navLink_('help', 'Help', { icon: '?', title: 'Help' })
    ].join('');
  } else if (role === 'technician') {
    navItems = [
      navLink_('admin', 'Queue', { icon: '📥', title: 'Workshop Queue' }),
      navLink_('other', 'Special', { icon: '⭐', title: 'Special Request', special: true }),
      navLink_('queue', 'Queue Status', { icon: '📈' }),
      navLink_('status', 'Lookup', { icon: '🔍' }),
      navLink_('submit', 'Submit', { icon: '📄' }),
      navLink_('machines', 'Machines', { icon: '🛠' }),
      navLink_('help', 'Help', { icon: '?', title: 'Help' })
    ].join('');
  } else {
    /* admin — full nav */
    navItems = [
      navLink_('admin', 'Dashboard', { icon: '🧭' }),
      navLink_('submit', 'Submit', { icon: '📄' }),
      navLink_('other', 'Special', { icon: '⭐', title: 'Special Request', special: true }),
      navLink_('queue', 'Queue', { icon: '📈', title: 'Queue Status' }),
      navLink_('status', 'Lookup', { icon: '🔍' }),
      navLink_('teacherbeta', 'Class', { icon: '📋', id: 'teacherbeta', title: 'Class' }),
      navLink_('rules', 'Rules', { icon: '⚙' }),
      navLink_('users', 'Users', { icon: '👥' }),
      navLink_('audit', 'Audit', { icon: '🧾' }),
      navLink_('machines', 'Machines', { icon: '🛠' }),
      navLink_('help', 'Help', { icon: '?', title: 'Help' })
    ].join('');
  }

  /* System-admin pages rendered empty for teacher/technician/student roles. */
  var rulesPageHtml = isSystemAdmin ? renderRulesPage_(boot) : '';
  var usersPageHtml = isSystemAdmin ? renderUsersPage_() : '';
  var auditPageHtml = isSystemAdmin ? renderAuditPage_() : '';

  return `
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml_(boot.appName)}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --navy: #1a1f36;
      --navy-lt: #2d3452;
      --maroon: #9b2c3f;
      --maroon-lt: #c2415a;
      --rose: #e8566d;
      --blue: #3b82f6;
      --blue-lt: #60a5fa;
      --mint: #10b981;
      --amber: #f59e0b;
      --orange: #f97316;
      --red: #ef4444;
      --green: #22c55e;
      --lavender: #8b8fc7;
      --slate: #475569;
      --slate-lt: #94a3b8;
      --muted: #94a3b8;
      --bg: #f1f5f9;
      --card: #ffffff;
      --card-border: #e2e8f0;
      --radius: 12px;
      --radius-sm: 8px;
      --shadow: 0 1px 3px rgba(0,0,0,.06), 0 1px 2px rgba(0,0,0,.04);
      --shadow-lg: 0 4px 12px rgba(0,0,0,.08);
      --transition: .2s ease;
    }
    html { font-family: 'Manrope', system-ui, sans-serif; background: var(--bg); color: var(--navy); font-size: 14px; line-height: 1.6; }
    a { color: var(--blue); text-decoration: none; }
    a:hover { text-decoration: underline; }

    /* ---------- SHELL ---------- */
    .skip-link { position: fixed; left: 12px; top: 12px; transform: translateY(-140%); background: #fff; color: var(--navy); border: 2px solid var(--blue); border-radius: 8px; padding: 8px 12px; font-weight: 800; z-index: 1000; box-shadow: var(--shadow-lg); }
    .skip-link:focus { transform: translateY(0); outline: none; }
    .shell { max-width: 1280px; margin: 0 auto; padding: 0 16px 40px; }
    .header { background: var(--navy); color: #fff; padding: 0 16px; position: sticky; top: 0; z-index: 100; }
    .header-inner { max-width: 1280px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; height: 56px; gap: 16px; }
    .logo { font-weight: 800; font-size: 16px; letter-spacing: -.3px; white-space: nowrap; display: flex; align-items: center; gap: 8px; }
    .logo-icon { width: 28px; height: 28px; border-radius: 8px; background: rgba(255,255,255,.1); display: inline-flex; align-items: center; justify-content: center; font-size: 12px; letter-spacing: 0; }
    .user-chip { display: flex; align-items: center; gap: 8px; font-size: 12px; }
    .user-avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--maroon); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
    .user-info { display: flex; flex-direction: column; line-height: 1.3; }
    .user-name { font-weight: 600; }
    .user-role { font-size: 10px; text-transform: uppercase; letter-spacing: .5px; opacity: .7; }
    .muted-chip { opacity: .5; font-size: 12px; }

    /* ---------- NAV ---------- */
    .tab-bar { display: flex; flex-wrap: nowrap; justify-content: flex-start; align-items: center; gap: 6px; padding: 8px 16px; background: var(--navy); overflow-x: visible; width: max-content; min-width: 100%; max-width: 1280px; margin: 0 auto; scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.2) transparent; }
    .tab-bar::-webkit-scrollbar { height: 6px; }
    .tab-bar::-webkit-scrollbar-thumb { background: rgba(255,255,255,.18); border-radius: 999px; }
    .tab-btn { color: rgba(255,255,255,.74); font-size: 12px; line-height: 1.2; font-weight: 800; padding: 8px 11px; border: 1px solid rgba(255,255,255,.08); border-radius: 10px; transition: var(--transition); white-space: nowrap; text-decoration: none; display: inline-flex; align-items: center; gap: 7px; min-height: 38px; flex: 0 0 auto; }
    .tab-btn:hover { color: #fff; text-decoration: none; background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.14); }
    .tab-btn.active { color: #fff; background: rgba(255,255,255,.1); border-color: rgba(232,86,109,.72); box-shadow: inset 0 -2px 0 var(--rose); }
    .tab-btn--special { color: #fcd34d; }
    .tab-btn--special:hover { color: #fde68a; background: rgba(251,191,36,.12); }
    .tab-btn--special.active { color: #fde68a; border-color: rgba(245,158,11,.7); box-shadow: inset 0 -2px 0 #f59e0b; }
    .tab-icon { min-width: 22px; height: 22px; flex: 0 0 22px; border-radius: 7px; background: rgba(255,255,255,.08); display: inline-flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 900; letter-spacing: 0; line-height: 1; }
    .tab-btn.active .tab-icon { background: rgba(255,255,255,.16); }
    .tab-label { display: inline-block; }
    .tab-bar-wrap { position: sticky; top: 56px; z-index: 95; background: var(--navy); overflow-x: auto; overflow-y: hidden; border-top: 1px solid rgba(255,255,255,.06); box-shadow: 0 6px 14px rgba(15,23,42,.12); scrollbar-width: thin; scrollbar-color: rgba(255,255,255,.22) transparent; }
    .tab-bar-wrap::-webkit-scrollbar { height: 5px; }
    .tab-bar-wrap::-webkit-scrollbar-thumb { background: rgba(255,255,255,.2); border-radius: 999px; }
    .tab-bar-wrap::before, .tab-bar-wrap::after { content: ''; position: absolute; top: 0; bottom: 0; width: 28px; z-index: 2; pointer-events: none; transition: opacity .2s; opacity: 0; }
    .tab-bar-wrap::before { left: 0; background: linear-gradient(90deg, var(--navy) 30%, transparent); }
    .tab-bar-wrap::after { right: 0; background: linear-gradient(-90deg, var(--navy) 30%, transparent); }
    .tab-bar-wrap.scroll-right::after { opacity: 1; }
    .tab-bar-wrap.scroll-left::before { opacity: 1; }

    /* ---------- CARDS ---------- */
    .card { background: var(--card); border: 1px solid var(--card-border); border-radius: var(--radius); padding: 24px; margin-top: 20px; box-shadow: var(--shadow); }
    .card + .card { margin-top: 16px; }
    .section-title { font-size: 20px; font-weight: 800; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; }
    .section-sub { color: var(--slate-lt); font-size: 13px; margin-bottom: 16px; line-height: 1.5; }
    .section-divider { border: 0; border-top: 1px solid var(--card-border); margin: 20px 0; }

    /* ---------- FORM ---------- */
    .form-section { margin-bottom: 20px; }
    .form-section-title { font-weight: 700; font-size: 15px; margin-bottom: 12px; color: var(--navy); padding-bottom: 6px; border-bottom: 2px solid var(--bg); }
    .grid { display: grid; gap: 14px; }
    .g2 { grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
    .g3 { grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); }
    .field { display: flex; flex-direction: column; gap: 4px; }
    .field label { font-weight: 600; font-size: 12px; color: var(--slate); }
    .field .helper { font-size: 11px; color: var(--slate-lt); line-height: 1.4; }
    .req { color: var(--red); }
    input:not([type=checkbox]):not([type=radio]), select, textarea {
      border: 1.5px solid var(--card-border); border-radius: var(--radius-sm);
      padding: 9px 12px; font-size: 13px; font-family: inherit; color: var(--navy);
      transition: border-color var(--transition);
      width: 100%;
    }
    input:not([type=checkbox]):not([type=radio]):focus, select:focus, textarea:focus { outline: none; border-color: var(--blue); box-shadow: 0 0 0 3px rgba(59,130,246,.12); }
    input[type=checkbox], input[type=radio] { width: auto; margin: 0; cursor: pointer; }
    textarea { resize: vertical; min-height: 60px; }
    .field-error input, .field-error select { border-color: var(--red); }
    .field-hint { font-size: 11px; color: var(--red); margin-top: 2px; }

    /* ---------- BUTTONS ---------- */
    .btn { display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-family: inherit; font-weight: 700; font-size: 13px; padding: 9px 18px; border-radius: var(--radius-sm); border: 1.5px solid transparent; cursor: pointer; transition: var(--transition); white-space: nowrap; }
    .btn-primary { background: var(--maroon); color: #fff; border-color: var(--maroon); }
    .btn-primary:hover { background: var(--maroon-lt); border-color: var(--maroon-lt); }
    .btn-ghost { background: transparent; color: var(--navy); border-color: var(--card-border); }
    .btn-ghost:hover { background: var(--bg); border-color: var(--slate-lt); }
    .btn-sm { padding: 6px 12px; font-size: 12px; }
    .btn-danger { background: var(--red); color: #fff; border-color: var(--red); }
    .btn:disabled { opacity: .5; cursor: not-allowed; }
    .btn-group { display: flex; gap: 8px; flex-wrap: wrap; }
    .inline-msg { font-size: 12px; min-height: 18px; }
    .tc-muted { color: var(--slate-lt); }
    .tc-success { color: var(--green); }
    .tc-error { color: var(--red); }

    /* ---------- ALERTS ---------- */
    .alert { display: flex; gap: 10px; padding: 12px 16px; border-radius: var(--radius-sm); font-size: 13px; line-height: 1.5; align-items: flex-start; }
    .alert-icon { font-size: 16px; flex-shrink: 0; margin-top: 1px; }
    .alert-info { background: #eff6ff; color: #1e40af; border: 1px solid #bfdbfe; }
    .alert-warning { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }
    .alert-error { background: #fef2f2; color: #991b1b; border: 1px solid #fecaca; }
    .alert-success { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
    .alert-neutral { background: var(--bg); color: var(--slate); border: 1px solid var(--card-border); }
    .submission-deadline-notice { border-left-width: 4px; align-items: stretch; }
    .submission-deadline-body { display: grid; gap: 4px; min-width: 0; }
    .submission-deadline-title { font-size: 13px; font-weight: 800; color: inherit; }
    .submission-deadline-message { font-size: 13px; line-height: 1.45; }
    .submission-deadline-meta { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 2px; }
    .submission-deadline-pill { display: inline-flex; align-items: center; border-radius: 999px; padding: 3px 8px; font-size: 11px; font-weight: 800; background: rgba(255,255,255,.58); border: 1px solid rgba(15,23,42,.1); color: inherit; }

    /* ---------- TURNAROUND DISCLAIMER ---------- */
    .disclaimer-box { background: #fefce8; border: 1px solid #fde68a; border-left: 4px solid var(--amber); border-radius: var(--radius-sm); padding: 14px 16px; margin-bottom: 20px; font-size: 13px; line-height: 1.6; color: #78350f; }
    .disclaimer-box strong { color: #92400e; }
    .disclaimer-box ul { margin: 6px 0 0 18px; padding: 0; }
    .disclaimer-box ul li { margin-bottom: 2px; }
    .disclaimer-box .disclaimer-title { font-weight: 700; font-size: 14px; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
    .disclaimer-compact { font-size: 12px; color: var(--slate); line-height: 1.5; padding: 8px 12px; background: var(--bg); border-radius: var(--radius-sm); border: 1px solid var(--card-border); margin-top: 12px; }
    .disclaimer-box--warning { background: #fefce8; border-color: #fde68a; border-left-color: var(--amber); color: #78350f; }
    .disclaimer-box--warning strong { color: #92400e; }
    .disclaimer-box--info { background: #eff6ff; border-color: #bfdbfe; border-left-color: var(--blue); color: #1e40af; }
    .disclaimer-box--info strong { color: #1e3a8a; }

    /* ---------- STATUS PILLS ---------- */
    .pill { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px; }
    .pill-submitted { background: #dbeafe; color: #1d4ed8; }
    .pill-needs_fix { background: #fef3c7; color: #92400e; }
    .pill-approved { background: #d1fae5; color: #065f46; }
    .pill-in_queue { background: #e8e5f5; color: #5b21b6; }
    .pill-in_production { background: #ffedd5; color: #c2410c; }
    .pill-completed { background: #dcfce7; color: #15803d; }
    .pill-rejected { background: #ffe4e6; color: #be123c; }

    /* ---------- PROGRESS ---------- */
    .progress-strip { height: 6px; border-radius: 3px; background: var(--bg); overflow: hidden; }
    .progress-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--blue), var(--mint)); transition: width .6s ease; }
    .progress-meta { display: flex; justify-content: space-between; font-size: 11px; color: var(--slate-lt); margin-top: 4px; }

    /* ---------- GUIDE / CHECKLIST ---------- */
    .guide-card { background: #fafbff; border: 1px solid #e0e7ff; border-radius: var(--radius-sm); padding: 16px; margin-bottom: 20px; }
    .guide-title { font-weight: 700; font-size: 14px; margin-bottom: 10px; color: var(--navy); }
    .guide-list { list-style: none; display: flex; flex-direction: column; gap: 8px; }
    .guide-list li { display: flex; gap: 8px; align-items: flex-start; font-size: 13px; }
    .guide-check { width: 20px; height: 20px; border-radius: 50%; border: 2px solid var(--card-border); display: flex; align-items: center; justify-content: center; font-size: 11px; flex-shrink: 0; transition: var(--transition); }
    .guide-list li[data-done="1"] .guide-check { background: var(--mint); color: #fff; border-color: var(--mint); }
    .guide-progress { margin-top: 12px; }
    .hint { font-size: 12px; color: var(--slate-lt); margin-top: 6px; }

    /* ---------- DRAFT AUTOSAVE ---------- */
    .draft-bar { background: #f8fafc; border: 1px solid #dbe3ef; border-radius: 10px; padding: 12px 14px; margin: 12px 0 16px; display: grid; gap: 10px; }
    .draft-bar--restore { background: #fffbeb; border-color: #fde68a; }
    .draft-bar--saved { background: #f0fdf4; border-color: #bbf7d0; }
    .draft-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
    .draft-copy { font-size: 12px; line-height: 1.5; color: var(--slate); min-width: 220px; flex: 1 1 280px; }
    .draft-copy strong { color: var(--navy); font-weight: 800; }
    .draft-actions { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .draft-progress { display: grid; grid-template-columns: minmax(0, 1fr) auto; align-items: center; gap: 10px; }
    .draft-progress-track { height: 6px; border-radius: 999px; background: #e5e7eb; overflow: hidden; }
    .draft-progress-fill { height: 100%; width: 0%; border-radius: 999px; background: linear-gradient(90deg, var(--blue), var(--green)); transition: width .25s ease; }
    .draft-progress-text { color: var(--slate-lt); font-size: 11px; font-weight: 700; white-space: nowrap; }

    /* ---------- SUBMIT CONVENIENCE PANEL ---------- */
    .submit-workspace { display: grid; grid-template-columns: minmax(0, 1fr) 300px; gap: 18px; align-items: start; }
    .submit-main-column { min-width: 0; }
    .submit-helper-rail { position: sticky; top: 124px; background: #fff; border: 1px solid var(--card-border); border-radius: 12px; padding: 16px; box-shadow: var(--shadow); display: grid; gap: 14px; }
    .submit-helper-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; }
    .submit-helper-title { font-size: 15px; font-weight: 800; color: var(--navy); line-height: 1.25; }
    .submit-helper-copy { font-size: 12px; color: var(--slate); line-height: 1.55; margin-top: 4px; }
    .submit-rail-pill { flex: 0 0 auto; border-radius: 999px; padding: 4px 9px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .38px; background: #f1f5f9; color: var(--slate); border: 1px solid var(--card-border); white-space: nowrap; }
    .submit-rail-pill.is-ready { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
    .submit-rail-pill.is-blocked { background: #fef3c7; color: #92400e; border-color: #fde68a; }
    .submit-rail-progress { display: grid; gap: 6px; }
    .submit-rail-progress-track { height: 7px; border-radius: 999px; background: #e2e8f0; overflow: hidden; }
    .submit-rail-progress-fill { display: block; height: 100%; width: 0; border-radius: inherit; background: linear-gradient(90deg, var(--blue), var(--mint)); transition: width .25s ease; }
    .submit-rail-progress-text { font-size: 11px; font-weight: 800; color: var(--slate); }
    .submit-rail-next { border-radius: 10px; border: 1px solid #bfdbfe; background: #eff6ff; color: #1e40af; padding: 10px 12px; font-size: 12px; line-height: 1.5; }
    .submit-rail-next strong { display: block; color: #1e3a8a; margin-bottom: 2px; }
    .submit-rail-next span { display: block; }
    .submit-rail-list { display: grid; gap: 8px; }
    .submit-rail-item { display: grid; grid-template-columns: 24px minmax(0, 1fr); gap: 8px; align-items: start; border-radius: 10px; border: 1px solid var(--card-border); background: #f8fafc; padding: 10px; }
    .submit-rail-item.is-done { background: #f0fdf4; border-color: #bbf7d0; }
    .submit-rail-item.is-warning { background: #fffbeb; border-color: #fde68a; }
    .submit-rail-icon { width: 22px; height: 22px; border-radius: 999px; border: 1px solid #cbd5e1; display: inline-flex; align-items: center; justify-content: center; color: var(--slate-lt); font-size: 11px; font-weight: 800; background: #fff; }
    .submit-rail-item.is-done .submit-rail-icon { background: var(--mint); border-color: var(--mint); color: #fff; }
    .submit-rail-item.is-warning .submit-rail-icon { background: #fef3c7; border-color: #fcd34d; color: #92400e; }
    .submit-rail-item-title { display: block; font-size: 12px; font-weight: 800; color: var(--navy); line-height: 1.3; }
    .submit-rail-item-note { display: block; font-size: 11px; color: var(--slate); line-height: 1.45; margin-top: 2px; }
    .submit-rail-actions { display: grid; gap: 8px; }
    .submit-rail-actions .btn { width: 100%; }
    .submit-stepper { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin: 10px 0 12px; }
    .submit-stepper-item { border: 1px solid var(--card-border); border-radius: 10px; background: #fff; padding: 9px; display: flex; align-items: flex-start; gap: 8px; min-width: 0; }
    .submit-stepper-num { flex: 0 0 auto; width: 22px; height: 22px; border-radius: 999px; background: #e2e8f0; color: var(--slate); display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; }
    .submit-stepper-item strong { display: block; font-size: 11px; color: var(--navy); line-height: 1.25; }
    .submit-stepper-item small { display: block; font-size: 10px; color: var(--slate-lt); line-height: 1.25; margin-top: 2px; }
    .submit-stepper-item.is-active { border-color: #93c5fd; background: #eff6ff; box-shadow: 0 0 0 3px rgba(59,130,246,.06); }
    .submit-stepper-item.is-active .submit-stepper-num { background: var(--blue); color: #fff; }
    .submit-stepper-item.is-done { border-color: #bbf7d0; background: #f0fdf4; }
    .submit-stepper-item.is-done .submit-stepper-num { background: var(--mint); color: #fff; }

    /* ---------- FILE ZONES ---------- */
    .file-zone { border: 2px dashed var(--card-border); border-radius: var(--radius-sm); padding: 20px; text-align: center; cursor: pointer; transition: var(--transition); position: relative; }
    .file-zone:hover, .file-zone.drag-over { border-color: var(--blue); background: #f8faff; }
    .file-zone input[type=file] { position: absolute; opacity: 0; width: 100%; height: 100%; top: 0; left: 0; cursor: pointer; }
    .file-zone-icon { font-size: 28px; margin-bottom: 4px; }
    .file-zone-label { font-weight: 600; font-size: 13px; }
    .file-zone-sub { font-size: 11px; color: var(--slate-lt); margin-top: 2px; }
    .file-chosen { font-size: 12px; color: var(--green); margin-top: 6px; font-weight: 600; }
    .file-feedback { display: flex; flex-wrap: wrap; justify-content: center; gap: 5px; min-height: 0; margin-top: 7px; font-size: 10px; line-height: 1.2; }
    .file-feedback:empty { display: none; }
    .file-badge { display: inline-flex; align-items: center; border-radius: 999px; border: 1px solid var(--card-border); background: #f8fafc; color: var(--slate); padding: 3px 7px; font-weight: 800; }
    .file-badge--ok { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
    .file-badge--warn { background: #fef3c7; color: #92400e; border-color: #fde68a; }
    .file-badge--bad { background: #fee2e2; color: #991b1b; border-color: #fecaca; }

    /* ---------- PATH SELECTOR ---------- */
    .path-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .path-selector--compact { margin: 4px 0 18px; }
    .path-card { border: 2px solid var(--card-border); border-radius: var(--radius); padding: 24px 20px; cursor: pointer; transition: var(--transition); text-align: center; position: relative; background: #fff; font: inherit; color: inherit; }
    .path-card:hover { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(59,130,246,.08); }
    .path-card:focus-visible { outline: 3px solid rgba(59,130,246,.24); outline-offset: 2px; }
    .path-card--primary { border-color: var(--maroon); background: linear-gradient(135deg, #fef2f2 0%, #fff 100%); }
    .path-card--primary .path-badge { background: var(--maroon); color: #fff; }
    .path-card--secondary { background: linear-gradient(135deg, #eef2ff 0%, #fff 100%); }
    .path-card--secondary .path-badge { background: var(--navy-lt); color: #fff; }
    .path-card-icon { width: 44px; height: 44px; border-radius: 12px; margin-bottom: 8px; line-height: 1; display: inline-flex; align-items: center; justify-content: center; background: rgba(59,130,246,.1); color: var(--blue); font-size: 26px; font-weight: 900; letter-spacing: 0; }
    .path-badge { display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; padding: 3px 10px; border-radius: 10px; margin-bottom: 8px; }
    .path-card-title { display: block; font-size: 15px; font-weight: 800; margin: 0 0 6px; color: var(--navy); line-height: 1.25; }
    .path-card-copy { display: block; font-size: 12px; color: var(--slate); line-height: 1.5; }
    .path-card h3 { font-size: 16px; font-weight: 800; margin: 0 0 6px; color: var(--navy); }
    .path-card p { font-size: 12px; color: var(--slate); margin: 0; line-height: 1.5; }
    .path-note { font-size: 12px; color: var(--slate-lt); text-align: center; margin-bottom: 20px; line-height: 1.5; }
    @media (max-width: 520px) { .path-selector { grid-template-columns: 1fr; } }

    /* ---------- MACHINE INFO CARDS ---------- */
    .machine-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin: 20px 0; }
    .machine-card { background: var(--card); border: 1px solid var(--card-border); border-radius: var(--radius); padding: 24px; }
    .machine-card--laser { border-left: 4px solid var(--blue); }
    .machine-card--3d { border-left: 4px solid var(--amber); }
    .machine-card h4 { font-size: 16px; font-weight: 700; margin: 0 0 4px; display: flex; align-items: center; gap: 6px; }
    .machine-card .machine-type { font-size: 12px; font-weight: 600; color: var(--slate-lt); text-transform: uppercase; letter-spacing: .3px; margin-bottom: 12px; }
    .machine-card p, .machine-card li { font-size: 14px; color: var(--slate); line-height: 1.7; }
    .machine-card ul { padding-left: 18px; margin: 8px 0 0; }
    .machine-page-hero { background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 55%, #0f766e 100%); color: #fff; border-radius: var(--radius); padding: 32px 28px; margin-top: 20px; box-shadow: var(--shadow-lg); }
    .machine-page-hero h3 { font-size: 26px; font-weight: 800; margin-bottom: 10px; }
    .machine-page-hero p { font-size: 15px; line-height: 1.7; opacity: .92; max-width: 900px; }
    .machine-hero-pills { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
    .machine-hero-pill { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.18); border-radius: 999px; padding: 8px 16px; font-size: 13px; font-weight: 700; }
    .machine-page-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px; }
    .machine-panel { background: var(--card); border: 1px solid var(--card-border); border-radius: var(--radius); padding: 28px; box-shadow: var(--shadow); }
    .machine-panel h3 { font-size: 20px; font-weight: 800; margin-bottom: 10px; color: var(--navy); }
    .machine-panel p { font-size: 14px; color: var(--slate); line-height: 1.8; }
    .machine-stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin-top: 18px; }
    .machine-stat { background: var(--bg); border: 1px solid var(--card-border); border-radius: var(--radius-sm); padding: 16px; }
    .machine-stat .label { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px; color: var(--slate-lt); }
    .machine-stat .value { font-size: 15px; font-weight: 800; color: var(--navy); margin-top: 6px; line-height: 1.5; }
    .machine-process { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; margin-top: 18px; }
    .machine-process-step { background: var(--bg); border-radius: var(--radius-sm); border: 1px solid var(--card-border); padding: 18px; }
    .machine-process-step .num { width: 28px; height: 28px; border-radius: 50%; background: var(--navy); color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; margin-bottom: 10px; }
    .machine-process-step h4 { font-size: 14px; font-weight: 700; margin-bottom: 6px; color: var(--navy); }
    .machine-process-step p { font-size: 13px; color: var(--slate); line-height: 1.65; }
    .machine-report-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 16px; margin-top: 18px; }
    .machine-report-card { background: var(--bg); border: 1px solid var(--card-border); border-radius: var(--radius-sm); padding: 20px; }
    .machine-report-card h4 { font-size: 14px; font-weight: 800; margin-bottom: 8px; color: var(--navy); }
    .machine-report-card ul { padding-left: 18px; margin: 0; }
    .machine-report-card li { font-size: 13px; color: var(--slate); line-height: 1.75; }
    .machine-search-list { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 14px; }
    .machine-search-chip { display: inline-block; background: #eef2ff; color: #3730a3; border: 1px solid #c7d2fe; border-radius: 999px; padding: 8px 16px; font-size: 13px; font-weight: 700; }
    .machine-anchor-nav { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
    .machine-anchor-btn { display: inline-flex; align-items: center; gap: 6px; background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.22); color: #fff; border-radius: var(--radius-sm); padding: 9px 16px; font-size: 13px; font-weight: 700; cursor: pointer; transition: var(--transition); text-decoration: none; }
    .machine-anchor-btn:hover { background: rgba(255,255,255,.25); text-decoration: none; color: #fff; }
    .machine-subsection { margin-top: 14px; }
    .machine-subsection h5 { font-size: 13px; font-weight: 700; color: var(--navy); margin: 14px 0 6px; text-transform: uppercase; letter-spacing: .3px; }
    .machine-subsection p, .machine-subsection li { font-size: 13px; color: var(--slate); line-height: 1.7; }
    .machine-subsection ul { padding-left: 18px; margin: 0 0 8px; }
    .machine-spec-highlight { display: flex; align-items: center; gap: 10px; background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%); border: 1px solid #bfdbfe; border-radius: var(--radius-sm); padding: 12px 16px; margin: 14px 0 10px; }
    .machine-spec-highlight .spec-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--slate-lt); white-space: nowrap; }
    .machine-spec-highlight .spec-value { font-size: 16px; font-weight: 800; color: var(--navy); }
    .machine-spec-highlight .spec-extra { font-size: 12px; font-weight: 600; color: var(--slate-lt); margin-left: 2px; }
    .machine-spec-table { width: 100%; border-collapse: collapse; margin: 10px 0 6px; font-size: 13px; }
    .machine-spec-table td { padding: 5px 8px; border-bottom: 1px solid var(--card-border); color: var(--slate); line-height: 1.5; }
    .machine-spec-table td:first-child { font-weight: 700; color: var(--navy); white-space: nowrap; width: 40%; }
    .machine-spec-badge { display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .4px; border-radius: 999px; padding: 2px 8px; margin-left: 6px; vertical-align: middle; }
    .machine-spec-badge--confirmed { background: #dcfce7; color: #166534; }
    .machine-spec-badge--guidance { background: #e0e7ff; color: #3730a3; }
    .machine-card-section { margin-top: 16px; padding-top: 14px; border-top: 1px dashed var(--card-border); }
    .machine-card-section h5 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--slate-lt); margin: 0 0 8px; }
    .machine-card-section p, .machine-card-section li { font-size: 13px; color: var(--slate); line-height: 1.7; }
    .machine-card-section ul { padding-left: 18px; margin: 0; }
    .machine-school-box { background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-sm); padding: 10px 14px; margin-top: 10px; font-size: 12px; color: #92400e; line-height: 1.6; }
    .machine-school-box strong { color: #78350f; }
    .machine-source-note { font-size: 11px; color: var(--slate-lt); margin-top: 12px; line-height: 1.6; font-style: italic; }
    .machine-spec-link { display: inline-flex; align-items: center; gap: 6px; margin-top: 10px; font-size: 13px; font-weight: 700; color: var(--blue); text-decoration: none; }
    .machine-spec-link:hover { text-decoration: underline; }
    @media (max-width: 700px) { .machine-page-grid { grid-template-columns: 1fr; } }

    /* ---------- MACHINES GUIDE CALLOUT ---------- */
    .machines-guide-callout { background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%); border: 1px solid #bfdbfe; border-left: 4px solid var(--blue); border-radius: var(--radius-sm); padding: 14px 16px; margin-bottom: 18px; display: flex; align-items: flex-start; gap: 12px; }
    .machines-guide-callout .mgc-icon { font-size: 22px; flex-shrink: 0; line-height: 1; margin-top: 2px; }
    .machines-guide-callout .mgc-body { flex: 1; }
    .machines-guide-callout .mgc-body strong { font-size: 13px; display: block; margin-bottom: 4px; color: var(--navy); }
    .machines-guide-callout .mgc-body p { font-size: 12px; color: var(--slate); line-height: 1.55; margin: 0 0 8px; }
    .machines-guide-callout .mgc-btn { display: inline-flex; align-items: center; gap: 5px; background: var(--blue); color: #fff; border: none; border-radius: var(--radius-sm); padding: 6px 14px; font-size: 12px; font-weight: 700; cursor: pointer; transition: var(--transition); text-decoration: none; }
    .machines-guide-callout .mgc-btn:hover { background: var(--blue-lt); text-decoration: none; color: #fff; }

    /* ---------- MACHINE-SPECIFIC REMINDER ---------- */
    .machine-reminder { border-radius: var(--radius-sm); padding: 12px 14px; margin: 10px 0 14px; font-size: 12px; line-height: 1.6; }
    .machine-reminder--laser { background: #fff7ed; border: 1px solid #fed7aa; border-left: 3px solid var(--orange); color: #7c2d12; }
    .machine-reminder--3d { background: #fffbeb; border: 1px solid #fde68a; border-left: 3px solid var(--amber); color: #78350f; }
    .machine-reminder strong { display: block; font-size: 12px; margin-bottom: 4px; }
    .machine-reminder ul { padding-left: 16px; margin: 4px 0 6px; }
    .machine-reminder li { margin-bottom: 2px; }
    .machine-reminder a { font-weight: 700; text-decoration: underline; }

    /* ---------- ORIENTATION CARD ---------- */
    .orientation-card { background: var(--bg); border: 1px solid var(--card-border); border-radius: var(--radius-sm); padding: 16px; margin-bottom: 18px; }
    .orientation-card .oc-title { font-size: 14px; font-weight: 800; margin-bottom: 10px; color: var(--navy); display: flex; align-items: center; gap: 6px; }
    .orientation-rows { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; }
    .orientation-row { background: var(--card); border: 1px solid var(--card-border); border-radius: var(--radius-sm); padding: 10px 12px; font-size: 12px; line-height: 1.5; }
    .orientation-row strong { color: var(--navy); display: block; margin-bottom: 2px; }
    .orientation-row span { color: var(--slate); }

    /* ---------- CONFIRM CHECKBOX ---------- */
    .confirm-row { display: flex; align-items: flex-start; gap: 8px; padding: 10px 14px; background: var(--bg); border-radius: var(--radius-sm); margin-bottom: 8px; font-size: 13px; line-height: 1.5; }
    .confirm-row input[type=checkbox] { margin-top: 3px; flex-shrink: 0; }

    /* ---------- RULE BOX ---------- */
    .rule-box { background: #fefce8; border: 1px solid #fde68a; border-radius: var(--radius-sm); padding: 14px 16px; margin-bottom: 16px; }
    .rule-box:empty { display: none; }
    .rule-row { display: flex; gap: 8px; align-items: center; margin-top: 6px; font-size: 13px; }
    .rule-icon { font-size: 14px; flex-shrink: 0; }
    .rule-chip { display: inline-block; background: var(--bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 2px 10px; font-size: 11px; font-weight: 600; margin: 2px; }

    /* ---------- SUCCESS STATE ---------- */
    .submit-success { padding: 0; }
    .success-hero { text-align: center; padding: 32px 24px 24px; }
    .success-hero-icon { font-size: 48px; margin-bottom: 8px; line-height: 1; }
    .success-hero h3 { font-size: 21px; font-weight: 800; margin: 0 0 4px; }
    .success-hero p { color: var(--slate-lt); font-size: 13px; margin: 0; line-height: 1.5; }
    .success-id-block { max-width: 440px; margin: 0 auto; padding: 0 24px; }
    .success-id-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--slate); margin-bottom: 6px; }
    .id-box { font-family: 'SF Mono', SFMono-Regular, Consolas, 'Liberation Mono', Menlo, monospace; font-size: 13px; background: var(--bg); border: 1px solid var(--card-border); border-radius: var(--radius-sm); padding: 10px 14px; word-break: break-all; cursor: pointer; display: flex; align-items: center; justify-content: space-between; gap: 10px; transition: border-color var(--transition), box-shadow var(--transition); position: relative; }
    .id-box:hover { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(59,130,246,.08); }
    .id-box-text { flex: 1; min-width: 0; }
    .id-box-icon { flex-shrink: 0; font-size: 14px; color: var(--slate-lt); transition: color var(--transition); }
    .id-box:hover .id-box-icon { color: var(--blue); }
    .id-box-hint { font-size: 11px; color: var(--slate-lt); margin-top: 6px; text-align: center; }
    .success-body { padding: 0 24px 24px; }
    .success-next { background: var(--bg); border: 1px solid var(--card-border); border-radius: var(--radius-sm); padding: 18px 20px; margin-top: 20px; }
    .success-next-title { font-weight: 700; font-size: 14px; margin-bottom: 10px; display: flex; align-items: center; gap: 6px; color: var(--navy); }
    .success-next p { font-size: 13px; color: var(--slate); line-height: 1.6; margin: 0 0 10px; }
    .success-steps { list-style: none; margin: 0 0 14px; padding: 0; display: flex; flex-direction: column; gap: 0; }
    .success-step { display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; font-size: 13px; line-height: 1.5; color: var(--slate); }
    .success-step + .success-step { border-top: 1px solid var(--card-border); }
    .success-step-num { flex-shrink: 0; width: 22px; height: 22px; border-radius: 50%; background: var(--navy); color: #fff; font-size: 11px; font-weight: 700; display: flex; align-items: center; justify-content: center; margin-top: 1px; }
    .success-step strong { color: var(--navy); }
    .success-warning { display: flex; align-items: flex-start; gap: 8px; background: #fefce8; border: 1px solid #fde68a; border-radius: var(--radius-sm); padding: 10px 14px; font-size: 12px; line-height: 1.5; color: #92400e; }
    .success-warning-icon { flex-shrink: 0; font-size: 14px; margin-top: 1px; }
    .success-actions { display: flex; gap: 10px; justify-content: center; padding: 0 24px 28px; }
    @media (max-width: 480px) {
      .admin-insight-grid { grid-template-columns: 1fr; }
      .success-hero { padding: 24px 16px 18px; }
      .success-id-block { padding: 0 16px; }
      .success-body { padding: 0 16px 20px; }
      .success-actions { padding: 0 16px 24px; flex-direction: column; }
      .success-actions .btn { width: 100%; }
    }

    /* ---------- STATUS CARDS ---------- */
    .sub-card { background: var(--card); border: 1px solid var(--card-border); border-radius: var(--radius); padding: 20px; margin-bottom: 14px; box-shadow: var(--shadow); }
    .sub-card-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 12px; flex-wrap: wrap; }
    .sub-card-title { font-weight: 700; font-size: 15px; }
    .sub-card-meta { font-size: 12px; color: var(--slate-lt); margin-top: 2px; }
    .sub-card-body { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; margin-top: 12px; font-size: 13px; }
    .sub-card-field label { font-size: 11px; color: var(--slate-lt); font-weight: 600; text-transform: uppercase; letter-spacing: .3px; }
    .sub-card-field .val { font-weight: 500; margin-top: 2px; }
    .sub-card-msg { margin-top: 12px; padding: 10px 14px; border-radius: var(--radius-sm); font-size: 13px; line-height: 1.5; }
    .status-queue-panel { background: #f8fafc; border: 1px solid #dbe3ef; border-radius: 12px; padding: 14px; margin: 14px 0 18px; }
    .status-queue-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin-bottom: 10px; }
    .status-queue-title { font-size: 13px; font-weight: 800; color: var(--navy); }
    .status-queue-note { font-size: 12px; color: var(--slate); line-height: 1.55; max-width: 760px; }
    .status-queue-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 9px; }
    .status-queue-metric { background: #fff; border: 1px solid var(--card-border); border-radius: 10px; padding: 10px 11px; }
    .status-queue-metric .num { font-size: 20px; font-weight: 800; color: var(--navy); line-height: 1; }
    .status-queue-metric .lbl { font-size: 10px; font-weight: 800; color: var(--slate-lt); text-transform: uppercase; letter-spacing: .35px; margin-top: 5px; }
    .status-position-panel { margin-top: 12px; background: #f8fbff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 13px 14px; }
    .status-position-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; flex-wrap: wrap; }
    .status-position-label { font-size: 10px; font-weight: 800; color: #1d4ed8; text-transform: uppercase; letter-spacing: .35px; }
    .status-position-main { margin-top: 3px; display: flex; align-items: baseline; gap: 7px; color: var(--navy); }
    .status-position-main strong { font-size: 22px; line-height: 1; }
    .status-position-main span { font-size: 12px; font-weight: 800; color: var(--slate); }
    .status-position-note { margin-top: 7px; color: var(--slate); font-size: 12px; line-height: 1.45; max-width: 820px; }
    .status-position-chip { flex: 0 0 auto; border-radius: 999px; padding: 5px 9px; background: #dbeafe; color: #1d4ed8; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .35px; }
    .status-position-meter { position: relative; height: 9px; margin-top: 11px; border-radius: 999px; background: #dbeafe; box-shadow: inset 0 0 0 1px rgba(15,23,42,.06); }
    .status-position-meter::after { content: ''; position: absolute; top: 50%; left: var(--position-pct, 0%); width: 18px; height: 18px; border-radius: 999px; background: #fff; border: 3px solid #1d4ed8; transform: translate(-50%, -50%); box-shadow: 0 2px 8px rgba(15,23,42,.16); }
    .status-position-scale { display: flex; justify-content: space-between; margin-top: 5px; color: var(--slate-lt); font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .3px; }
    .status-pickup-estimate { margin-top: 11px; border-top: 1px solid #dbeafe; padding-top: 11px; display: grid; grid-template-columns: minmax(0, .8fr) minmax(0, 1.4fr); gap: 10px; align-items: start; }
    .status-pickup-label { font-size: 10px; font-weight: 800; color: #1d4ed8; text-transform: uppercase; letter-spacing: .35px; }
    .status-pickup-window { margin-top: 3px; font-size: 14px; font-weight: 800; color: var(--navy); line-height: 1.35; }
    .status-pickup-days { display: inline-flex; align-items: center; margin-top: 5px; border-radius: 999px; padding: 4px 8px; background: #e0f2fe; color: #075985; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .25px; }
    .status-pickup-note { color: var(--slate); font-size: 12px; line-height: 1.45; }
    @media (max-width: 640px) { .status-pickup-estimate { grid-template-columns: 1fr; } }
    .status-position-panel--paused { background: #fffbeb; border-color: #fde68a; }
    .status-position-panel--paused .status-position-label, .status-position-panel--paused .status-position-chip { color: #92400e; }
    .status-position-panel--paused .status-position-chip { background: #fef3c7; }
    .status-position-panel--closed { background: #f8fafc; border-color: #dbe3ef; }
    .status-position-panel--closed .status-position-label, .status-position-panel--closed .status-position-chip { color: var(--slate); }
    .status-position-panel--closed .status-position-chip { background: #e2e8f0; }
    .status-workload-card { margin-top: 10px; }
    .status-workload-layout { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; align-items: start; }
    .status-health-panel, .status-trend-panel { min-width: 0; background: #fff; border: 1px solid var(--card-border); border-radius: 12px; padding: 12px; }
    .status-workload-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 10px; }
    .status-workload-kicker { font-size: 10px; font-weight: 800; color: var(--slate-lt); text-transform: uppercase; letter-spacing: .35px; }
    .status-workload-title { margin-top: 2px; font-size: 13px; font-weight: 800; color: var(--navy); }
    .status-workload-count { margin-top: 7px; display: inline-flex; align-items: baseline; gap: 6px; border: 1px solid #fecaca; background: #fef2f2; color: #7f1d1d; border-radius: 10px; padding: 6px 9px; font-size: 11px; font-weight: 800; line-height: 1; }
    .status-workload-count strong { font-size: 16px; color: #991b1b; }
    .status-workload-count span { color: #7f1d1d; }
    .status-workload-state { flex: 0 0 auto; border-radius: 999px; padding: 4px 9px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .35px; background: #dbeafe; color: #1d4ed8; }
    .status-workload-state--calm { background: #dcfce7; color: #166534; }
    .status-workload-state--active { background: #dbeafe; color: #1d4ed8; }
    .status-workload-state--busy { background: #fef3c7; color: #92400e; }
    .status-workload-state--heavy { background: #fee2e2; color: #991b1b; }
    .status-workload-bar { height: 12px; border-radius: 999px; background: #e5e7eb; overflow: hidden; box-shadow: inset 0 0 0 1px rgba(15,23,42,.05); }
    .status-workload-fill { height: 100%; border-radius: inherit; background: linear-gradient(90deg, #3b82f6, #0f766e); transition: width .25s ease; }
    .status-workload-fill--busy { background: linear-gradient(90deg, #f59e0b, #ea580c); }
    .status-workload-fill--heavy { background: linear-gradient(90deg, #f97316, #dc2626); }
    .status-workload-scale { display: flex; justify-content: space-between; gap: 8px; margin-top: 6px; color: var(--slate-lt); font-size: 10px; font-weight: 700; }
    .status-workload-lanes { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 8px; margin-top: 11px; }
    .status-workload-lane { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 9px; min-width: 0; }
    .status-workload-lane-label { font-size: 11px; font-weight: 800; color: var(--navy); line-height: 1.25; }
    .status-workload-lane-note { margin-top: 3px; font-size: 10px; color: var(--slate-lt); line-height: 1.25; }
    .status-workload-lane-bar { height: 7px; margin-top: 8px; border-radius: 999px; background: #e5e7eb; overflow: hidden; }
    .status-workload-lane-fill { height: 100%; border-radius: inherit; background: #3b82f6; }
    .status-workload-lane-fill--review { background: #3b82f6; }
    .status-workload-lane-fill--ready { background: #8b5cf6; }
    .status-workload-lane-fill--production { background: #f97316; }
    .status-workload-lane-fill--revision { background: #eab308; }
    .status-workload-machine { margin-top: 11px; padding-top: 10px; border-top: 1px solid #e2e8f0; }
    .status-machine-head { display: flex; justify-content: space-between; align-items: center; gap: 8px; color: var(--slate); font-size: 11px; font-weight: 800; }
    .status-machine-mix { display: flex; height: 9px; margin-top: 7px; border-radius: 999px; overflow: hidden; background: #e5e7eb; }
    .status-machine-laser { background: #2563eb; }
    .status-machine-print { background: #0f766e; }
    .status-machine-legend { display: flex; gap: 12px; margin-top: 6px; color: var(--slate-lt); font-size: 10px; font-weight: 700; flex-wrap: wrap; }
    .status-machine-dot { display: inline-block; width: 8px; height: 8px; border-radius: 999px; margin-right: 5px; vertical-align: -1px; background: #2563eb; }
    .status-machine-dot--print { background: #0f766e; }
    .status-workload-foot { margin-top: 9px; color: var(--slate-lt); font-size: 11px; line-height: 1.4; }
    .status-workload-alert { margin-top: 11px; border: 1px solid #fed7aa; background: #fff7ed; color: #7c2d12; border-radius: 10px; padding: 9px 10px; font-size: 11px; line-height: 1.45; }
    .status-workload-alert strong { color: #9a3412; }
    .status-queue-panel--standalone { margin: 0; }
    .queue-student-grid { display: grid; grid-template-columns: minmax(0, .82fr) minmax(0, 1fr); gap: 14px; margin-top: 14px; }
    .queue-student-card { margin-bottom: 0; }
    .queue-machine-status { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
    .status-trend-panel { margin-top: 0; padding: 12px; }
    .status-trend-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 6px; }
    .status-trend-title { font-size: 12px; font-weight: 800; color: var(--navy); line-height: 1.25; }
    .status-trend-note { margin-top: 1px; font-size: 10px; color: var(--slate-lt); line-height: 1.25; }
    .status-trend-pill { flex: 0 0 auto; border-radius: 999px; background: #f1f5f9; color: var(--slate); border: 1px solid var(--card-border); padding: 4px 8px; font-size: 10px; font-weight: 800; white-space: nowrap; }
    .status-trend-chart { width: 100%; height: 156px; display: block; border: 1px solid #e2e8f0; border-radius: 9px; background: linear-gradient(180deg, #fff 0%, #f8fafc 100%); overflow: hidden; }
    .status-trend-axis { stroke: #cbd5e1; stroke-width: 1; }
    .status-trend-grid { stroke: #e2e8f0; stroke-width: 1; stroke-dasharray: 3 5; }
    .status-trend-line { fill: none; stroke: #2563eb; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round; }
    .status-trend-area { fill: rgba(59,130,246,.07); }
    .status-trend-dot { fill: #fff; stroke: #2563eb; stroke-width: 1.8; }
    .status-trend-label { fill: #64748b; font-size: 9px; font-weight: 700; }
    .status-trend-summary { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 6px; color: var(--slate-lt); font-size: 10px; line-height: 1.25; }
    .status-trend-summary span { display: inline-flex; gap: 4px; align-items: center; border: 1px solid var(--card-border); background: #fff; border-radius: 999px; padding: 3px 7px; }
    .status-trend-summary strong { color: var(--navy); }
    .rules-throughput-panel { border: 1px solid #d7e0ec; border-radius: 12px; background: #fff; padding: 14px; }
    .rules-throughput-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 10px; }
    .rules-throughput-title { font-size: 14px; font-weight: 800; color: var(--navy); }
    .rules-throughput-note { font-size: 12px; color: var(--slate-lt); line-height: 1.4; margin-top: 2px; }
    .rules-throughput-legend { display: flex; gap: 8px; flex-wrap: wrap; justify-content: flex-end; }
    .rules-throughput-legend span { display: inline-flex; align-items: center; gap: 6px; border-radius: 999px; padding: 4px 8px; border: 1px solid var(--card-border); font-size: 11px; font-weight: 800; color: var(--slate); background: #fff; }
    .rules-throughput-key { width: 9px; height: 9px; border-radius: 999px; display: inline-block; background: #2563eb; }
    .rules-throughput-key--finished { background: #16a34a; }
    .rules-throughput-chart { width: 100%; height: 280px; display: block; border: 1px solid #e2e8f0; border-radius: 10px; background: linear-gradient(180deg, #fff 0%, #f8fafc 100%); }
    .rules-throughput-grid { stroke: #e2e8f0; stroke-width: 1; stroke-dasharray: 4 5; }
    .rules-throughput-axis { stroke: #cbd5e1; stroke-width: 1; }
    .rules-throughput-line-submitted { fill: none; stroke: #2563eb; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; }
    .rules-throughput-line-finished { fill: none; stroke: #16a34a; stroke-width: 2.6; stroke-linecap: round; stroke-linejoin: round; }
    .rules-throughput-dot-submitted { fill: #fff; stroke: #2563eb; stroke-width: 1.8; }
    .rules-throughput-dot-finished { fill: #fff; stroke: #16a34a; stroke-width: 1.8; }
    .rules-throughput-label { fill: #64748b; font-size: 9px; font-weight: 800; }
    .rules-throughput-submitted-label { fill: #1d4ed8; font-size: 10px; font-weight: 900; paint-order: stroke; stroke: #fff; stroke-width: 3px; stroke-linejoin: round; }
    .rules-throughput-finished-label { fill: #166534; font-size: 10px; font-weight: 900; paint-order: stroke; stroke: #fff; stroke-width: 3px; stroke-linejoin: round; }
    .rules-throughput-summary { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px; font-size: 12px; color: var(--slate); }
    .rules-throughput-summary span { display: inline-flex; align-items: center; gap: 5px; border-radius: 999px; border: 1px solid var(--card-border); background: #fff; padding: 5px 9px; }
    .rules-throughput-summary strong { color: var(--navy); }
    @media (max-width: 880px) {
      .status-workload-layout { grid-template-columns: 1fr; }
      .queue-student-grid { grid-template-columns: 1fr; }
      .queue-machine-status { grid-template-columns: 1fr; }
    }
    .status-stage { margin-top: 12px; background: #f8fafc; border: 1px solid var(--card-border); border-radius: 10px; padding: 10px 12px; font-size: 12px; color: var(--slate); line-height: 1.5; }
    .status-stage strong { color: var(--navy); }
    .status-next-grid { margin-top: 12px; display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 8px; }
    .status-next-card { background: #fff; border: 1px solid var(--card-border); border-radius: 10px; padding: 10px 11px; min-width: 0; }
    .status-next-label { font-size: 10px; font-weight: 800; letter-spacing: .35px; text-transform: uppercase; color: var(--slate-lt); }
    .status-next-value { margin-top: 3px; font-size: 13px; font-weight: 800; color: var(--navy); line-height: 1.3; }
    .status-next-note { margin-top: 3px; font-size: 11px; line-height: 1.35; color: var(--slate); }
    .status-action-panel { margin-top: 12px; border: 1px solid #dbeafe; background: #eff6ff; border-radius: 10px; padding: 11px 12px; }
    .status-action-panel--revise { border-color: #fde68a; background: #fffbeb; }
    .status-action-title { font-size: 12px; font-weight: 800; color: var(--navy); display: flex; align-items: center; gap: 6px; }
    .status-action-list { margin: 8px 0 0 17px; color: var(--slate); font-size: 12px; line-height: 1.55; }
    .status-action-list li + li { margin-top: 2px; }
    .status-file-title { margin-top: 12px; font-size: 12px; font-weight: 800; color: var(--navy); }
    .status-file-actions { margin-top: 12px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .status-id-actions { margin-top: 10px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
    .status-file-note { font-size: 11px; color: var(--slate-lt); line-height: 1.45; flex: 1 1 220px; }
    .msg-submitted { background: #eff6ff; color: #1e40af; }
    .msg-needs_fix { background: #fffbeb; color: #92400e; }
    .msg-approved { background: #f0fdf4; color: #166534; }
    .msg-in_queue { background: #f5f3ff; color: #5b21b6; }
    .msg-in_production { background: #fff7ed; color: #c2410c; }
    .msg-completed { background: #f0fdf4; color: #166534; }
    .msg-rejected { background: #fef2f2; color: #991b1b; }

    /* ---------- TIMELINE ---------- */
    .status-timeline { display: flex; align-items: center; gap: 0; margin-top: 12px; flex-wrap: wrap; }
    .tl-step { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 600; color: var(--slate-lt); white-space: nowrap; padding: 4px 0; }
    .tl-dot { width: 10px; height: 10px; border-radius: 50%; border: 2px solid var(--slate-lt); flex-shrink: 0; }
    .tl-conn { width: 20px; height: 2px; background: var(--card-border); flex-shrink: 0; }
    .tl-step.done { color: var(--mint); }
    .tl-step.done .tl-dot { background: var(--mint); border-color: var(--mint); }
    .tl-conn.done { background: var(--mint); }
    .tl-step.curr { color: var(--blue); }
    .tl-step.curr .tl-dot { background: var(--blue); border-color: var(--blue); box-shadow: 0 0 0 3px rgba(59,130,246,.2); }
    .tl-step.warn { color: var(--amber); }
    .tl-step.warn .tl-dot { background: var(--amber); border-color: var(--amber); }

    /* ---------- STATUS SUMMARY ---------- */
    .status-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 10px; margin-bottom: 16px; }
    .summary-card { background: var(--bg); border-radius: var(--radius-sm); padding: 12px; text-align: center; }
    .summary-card .num { font-size: 22px; font-weight: 800; }
    .summary-card .lbl { font-size: 11px; color: var(--slate-lt); font-weight: 600; text-transform: uppercase; }

    /* ---------- ADMIN WORKBOARD ---------- */
    .admin-hero { background: #111827; color: #fff; border-radius: var(--radius); padding: 24px; margin-top: 20px; box-shadow: var(--shadow-lg); display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 18px; align-items: start; overflow: hidden; position: relative; }
    .admin-hero::after { content: ''; position: absolute; inset: auto 0 0 0; height: 3px; background: linear-gradient(90deg, var(--rose), var(--amber), var(--mint), var(--blue)); }
    .admin-hero-kicker { font-size: 11px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; color: #93c5fd; margin-bottom: 5px; }
    .admin-hero-title { font-size: 24px; font-weight: 800; line-height: 1.15; margin: 0 0 8px; }
    .admin-hero-sub { color: #cbd5e1; font-size: 13px; line-height: 1.6; max-width: 760px; }
    .admin-hero-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
    .admin-hero .btn-ghost { color: #fff; border-color: rgba(255,255,255,.24); background: rgba(255,255,255,.06); }
    .admin-hero .btn-ghost:hover { background: rgba(255,255,255,.14); border-color: rgba(255,255,255,.34); }
    .teacher-beta-hero { background: #0f172a; color: #fff; border-radius: var(--radius); padding: 28px; margin-top: 20px; box-shadow: var(--shadow-lg); display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 20px; align-items: start; }
    .teacher-beta-kicker { font-size: 12px; font-weight: 800; letter-spacing: .8px; text-transform: uppercase; color: #86efac; margin-bottom: 6px; }
    .teacher-beta-title { font-size: 30px; font-weight: 800; line-height: 1.12; margin: 0 0 10px; }
    .teacher-beta-copy { color: #d1d5db; font-size: 15px; line-height: 1.62; max-width: 860px; }
    .teacher-beta-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
    .teacher-beta-actions .btn { min-height: 42px; font-size: 14px; padding: 10px 16px; }
    .teacher-beta-hero .btn-ghost { color: #fff; border-color: rgba(255,255,255,.24); background: rgba(255,255,255,.06); }
    .teacher-beta-toolbar { display: grid; grid-template-columns: 190px 220px minmax(260px, 1fr) auto auto; gap: 14px; align-items: end; }
    .teacher-beta-search-field { min-width: 0; }
    .teacher-beta-toolbar .field label { font-size: 13px; color: var(--slate); }
    .teacher-beta-toolbar input, .teacher-beta-toolbar select { min-height: 44px; padding: 11px 14px; font-size: 14px; }
    .teacher-beta-check { display: inline-flex; align-items: center; gap: 8px; padding: 10px 0; font-size: 14px; font-weight: 700; color: var(--slate); white-space: nowrap; }
    .teacher-beta-summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(118px, 1fr)); gap: 10px; margin-top: 16px; }
    .teacher-beta-stat { border: 1px solid var(--card-border); background: #f8fafc; border-radius: 12px; padding: 13px 12px; min-height: 74px; }
    .teacher-beta-stat strong { display: block; color: var(--navy); font-size: 26px; line-height: 1; }
    .teacher-beta-stat span { display: block; margin-top: 7px; color: var(--slate-lt); font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .3px; }
    .teacher-beta-results { margin-top: 16px; }
    .teacher-beta-class { border: 1px solid var(--card-border); border-radius: 12px; background: #fff; margin-top: 16px; overflow: hidden; }
    .teacher-beta-class-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; flex-wrap: wrap; padding: 18px 20px; background: #f8fafc; border-bottom: 1px solid var(--card-border); }
    .teacher-beta-class-title { font-size: 17px; font-weight: 800; color: var(--navy); }
    .teacher-beta-class-sub { margin-top: 3px; color: var(--slate-lt); font-size: 13px; }
    .teacher-beta-progress { width: 220px; max-width: 100%; display: grid; gap: 7px; }
    .teacher-beta-progress-track { height: 10px; border-radius: 999px; background: #e5e7eb; overflow: hidden; }
    .teacher-beta-progress-fill { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--blue), var(--green)); }
    .teacher-beta-progress-text { font-size: 12px; color: var(--slate); font-weight: 800; text-align: right; }
    .teacher-beta-mini { color: var(--slate-lt); font-size: 12px; margin-top: 6px; }
    .teacher-beta-mini span { display: inline-flex; border: 1px solid var(--card-border); border-radius: 999px; padding: 4px 9px; margin: 4px 5px 0 0; color: var(--slate); background: #fff; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .22px; }
    .teacher-beta-table { width: 100%; border-collapse: collapse; font-size: 14px; }
    .teacher-beta-table th { text-align: left; color: var(--slate-lt); font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: .35px; padding: 12px 14px; background: #fbfdff; border-bottom: 1px solid var(--card-border); }
    .teacher-beta-table td { padding: 14px; border-bottom: 1px solid var(--card-border); vertical-align: top; }
    .teacher-beta-table tr:last-child td { border-bottom: 0; }
    .teacher-beta-row--missing td { background: #fff8f8; }
    .teacher-beta-row--needs_fix td { background: #fffbeb; }
    .teacher-beta-row--completed td { background: #f7fef9; }
    .teacher-beta-row--class-mismatch td:first-child { box-shadow: inset 4px 0 0 #f59e0b; }
    .teacher-beta-student { font-size: 15px; font-weight: 800; color: var(--navy); line-height: 1.28; }
    .teacher-beta-email { margin-top: 4px; color: var(--slate-lt); font-size: 12px; line-height: 1.35; word-break: break-word; }
    .teacher-beta-case { display: inline-flex; align-items: center; border-radius: 999px; border: 1px solid #bfdbfe; background: #eff6ff; color: #1d4ed8; padding: 4px 9px; font-size: 12px; font-weight: 800; }
    .teacher-beta-action { color: var(--slate); line-height: 1.45; font-size: 13px; }
    .teacher-beta-empty { padding: 16px; }
    .teacher-beta-extra { margin: 12px 16px 16px; }
    .pill-missing { background: #fee2e2; color: #991b1b; }
    .admin-role-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(185px, 1fr)); gap: 8px; margin-top: 10px; }
    .admin-role-step { background: #fff; border: 1px solid var(--card-border); border-radius: var(--radius-sm); padding: 10px 12px; display: flex; align-items: flex-start; gap: 9px; min-width: 0; box-shadow: var(--shadow); }
    .admin-role-step-num { flex: 0 0 auto; width: 22px; height: 22px; border-radius: 999px; background: var(--navy); color: #fff; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; }
    .admin-role-step-title { font-size: 12px; font-weight: 800; color: var(--navy); line-height: 1.25; }
    .admin-role-step-copy { margin-top: 2px; font-size: 11px; color: var(--slate); line-height: 1.35; }
    .admin-workboard { display: grid; grid-template-columns: minmax(0, 1fr) 290px; gap: 14px; margin-top: 16px; align-items: stretch; }
    .admin-workboard-main, .admin-health-panel { min-width: 0; }
    .admin-section-label { font-size: 11px; font-weight: 800; letter-spacing: .45px; text-transform: uppercase; color: var(--slate-lt); margin-bottom: 8px; }
    .admin-insight-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-top: 12px; }
    .admin-insight { background: #fff; border: 1px solid var(--card-border); border-radius: var(--radius-sm); padding: 13px 14px; min-height: 92px; display: flex; flex-direction: column; justify-content: space-between; gap: 8px; }
    .admin-insight-top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .admin-insight-label { font-size: 10px; font-weight: 800; color: var(--slate-lt); text-transform: uppercase; letter-spacing: .4px; }
    .admin-insight-icon { width: 26px; height: 26px; border-radius: 8px; display: inline-flex; align-items: center; justify-content: center; background: var(--bg); color: var(--navy); font-size: 14px; }
    .admin-insight-value { font-size: 25px; line-height: 1; font-weight: 800; color: var(--navy); }
    .admin-insight-note { font-size: 11px; line-height: 1.35; color: var(--slate); min-height: 15px; }
    .admin-insight--attention { border-color: #fed7aa; background: #fff7ed; }
    .admin-insight--attention .admin-insight-icon { background: #ffedd5; color: #c2410c; }
    .admin-insight--ok { border-color: #bbf7d0; background: #f0fdf4; }
    .admin-insight--ok .admin-insight-icon { background: #dcfce7; color: #15803d; }
    .admin-health-panel { background: #fff; border: 1px solid var(--card-border); border-radius: var(--radius-sm); padding: 14px; display: flex; flex-direction: column; gap: 12px; }
    .admin-health-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
    .admin-health-title { font-size: 13px; font-weight: 800; color: var(--navy); }
    .admin-health-pill { font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .4px; border-radius: 999px; padding: 4px 8px; background: #f1f5f9; color: var(--slate); white-space: nowrap; }
    .admin-health-meter { height: 8px; border-radius: 999px; background: var(--bg); overflow: hidden; }
    .admin-health-fill { display: block; height: 100%; width: 0; border-radius: inherit; background: linear-gradient(90deg, var(--mint), var(--amber), var(--rose)); transition: width .35s ease; }
    .admin-health-copy { font-size: 12px; color: var(--slate); line-height: 1.55; }
    .admin-health-list { display: grid; gap: 7px; }
    .admin-health-row { display: flex; justify-content: space-between; gap: 12px; font-size: 12px; color: var(--slate); border-top: 1px solid var(--card-border); padding-top: 7px; }
    .admin-health-row strong { color: var(--navy); }

    /* ---------- STATS BAR ---------- */
    .stats-bar { display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 8px; margin-top: 16px; overflow: visible; }
    .stat-card { background: var(--bg); border-radius: var(--radius-sm); padding: 12px 8px; text-align: center; cursor: pointer; transition: var(--transition); border: 2px solid transparent; min-width: 0; }
    .stat-card:hover { border-color: var(--blue); }
    .stat-card.active { background: #fff; border-color: var(--maroon); box-shadow: 0 0 0 3px rgba(155,44,63,.08); }
    .stat-num { font-size: 20px; font-weight: 800; overflow: hidden; text-overflow: ellipsis; }
    .stat-label { font-size: 10px; color: var(--slate-lt); font-weight: 600; text-transform: uppercase; letter-spacing: .3px; margin-top: 2px; }

    /* ---------- FILTER BAR ---------- */
    .filter-bar { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; margin-top: 16px; padding: 14px; background: var(--bg); border-radius: var(--radius-sm); }
    .filter-bar .field { flex: 1 1 140px; min-width: 120px; }
    .filter-bar .field.filter-wide { flex: 2 1 240px; }
    .filter-bar .field.filter-source { flex: .9 1 128px; }
    .filter-bar .field.filter-sort { flex: 1.2 1 176px; }
    .filter-bar .field label { font-size: 11px; }
    .filter-bar input, .filter-bar select { font-size: 12px; padding: 7px 10px; }
    .filter-check-field { flex: 1 1 150px; }
    .filter-check { position: relative; width: 100%; }
    .filter-check summary { list-style: none; appearance: none; -webkit-appearance: none; min-height: 34px; border: 2px solid var(--card-border); border-radius: var(--radius-sm); background: #fff; padding: 7px 28px 7px 10px; font-size: 12px; font-weight: 700; color: var(--navy); cursor: pointer; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; position: relative; }
    .filter-check summary::marker { content: ""; }
    .filter-check summary::-webkit-details-marker { display: none; }
    .filter-check summary::after { content: ""; position: absolute; right: 10px; top: 50%; width: 7px; height: 7px; border-right: 2px solid var(--slate); border-bottom: 2px solid var(--slate); transform: translateY(-60%) rotate(45deg); }
    .filter-check[open] summary { border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(59,130,246,.08); }
    .filter-check-menu { position: absolute; z-index: 220; left: 0; right: 0; top: calc(100% + 4px); max-height: 236px; overflow: auto; background: #fff; border: 1px solid var(--card-border); border-radius: var(--radius-sm); box-shadow: var(--shadow-lg); padding: 6px; }
    .filter-check-option { display: flex; align-items: center; gap: 7px; padding: 7px 8px; border-radius: 7px; font-size: 12px; color: var(--navy); cursor: pointer; line-height: 1.2; }
    .filter-check-option:hover { background: #f8fafc; }
    .filter-check-option input { width: 14px; height: 14px; margin: 0; flex: 0 0 auto; }
    .filter-check-empty { padding: 8px; font-size: 12px; color: var(--slate-lt); }
    .filter-meta { flex: 0 0 100%; display: flex; gap: 10px; align-items: center; justify-content: flex-end; flex-wrap: wrap; padding-top: 4px; border-top: 1px solid var(--card-border); margin-top: 4px; }
    .teacher-toggle { font-size: 12px; display: flex; align-items: center; gap: 5px; cursor: pointer; white-space: nowrap; margin-right: auto; }
    .queue-lane-bar { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
    .lane-btn { border: 1px solid var(--card-border); background: #fff; color: var(--navy); border-radius: var(--radius-sm); padding: 8px 11px; font-family: inherit; font-size: 12px; font-weight: 800; cursor: pointer; transition: var(--transition); display: inline-flex; align-items: center; gap: 6px; }
    .lane-btn:hover { border-color: var(--blue); color: #1d4ed8; box-shadow: 0 0 0 3px rgba(59,130,246,.08); }
    .lane-btn.active { background: #eff6ff; border-color: #93c5fd; color: #1d4ed8; }
    .queue-toolbar { display: flex; justify-content: space-between; gap: 12px; align-items: flex-end; margin-top: 16px; flex-wrap: wrap; }
    .queue-toolbar-title { font-size: 14px; font-weight: 800; color: var(--navy); }
    .queue-toolbar-sub { font-size: 12px; color: var(--slate-lt); line-height: 1.4; margin-top: 2px; }
    .queue-toolbar-actions { display: flex; align-items: flex-end; justify-content: flex-end; gap: 10px; flex-wrap: wrap; margin-left: auto; }
    .queue-case-search { display: grid; gap: 4px; min-width: 150px; }
    .queue-case-search span { font-size: 10px; font-weight: 800; color: var(--slate-lt); text-transform: uppercase; letter-spacing: .35px; }
    .queue-case-search input { height: 34px; border: 2px solid var(--card-border); border-radius: var(--radius-sm); padding: 7px 10px; font: 800 12px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; color: var(--navy); background: #fff; letter-spacing: 0; }
    .queue-case-search input:focus { outline: none; border-color: #93c5fd; box-shadow: 0 0 0 3px rgba(59,130,246,.08); }

    /* ---------- TABLE ---------- */
    .tbl-wrap { overflow-x: auto; margin-top: 14px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    thead th { background: var(--bg); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .3px; padding: 10px 12px; text-align: left; color: var(--slate); border-bottom: 2px solid var(--card-border); white-space: nowrap; }
    tbody td { padding: 10px 12px; border-bottom: 1px solid var(--card-border); vertical-align: top; }
    tbody tr:hover { background: #f8fafc; }
    .cell-student { min-width: 160px; }
    .sub { font-size: 11px; color: var(--slate-lt); margin-top: 2px; }
    .sub-strong { font-size: 11px; color: var(--navy); margin-top: 4px; font-weight: 700; }
    .pill-source-dt { background: #dbeafe; color: #1e40af; font-size: 10px; }
    .pill-source-special { background: #fef3c7; color: #92400e; font-size: 10px; }
    .pill-prototype-low { background: #dcfce7; color: #166534; font-size: 10px; }
    .pill-prototype-hi { background: #fee2e2; color: #991b1b; font-size: 10px; }
    .pill-prototype-final { background: #e0f2fe; color: #075985; font-size: 10px; }
    .pill-prototype-na { background: #e2e8f0; color: #475569; font-size: 10px; }
    .pill-repeat { background: #fef3c7; color: #92400e; font-size: 10px; }
    .pill-repeat-strong { background: #fee2e2; color: #991b1b; font-size: 10px; }
    .status-activity-banner { margin: 0 0 14px; }
    .review-summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; }
    .review-flag { border-radius: var(--radius-sm); padding: 10px 12px; font-size: 12px; line-height: 1.5; margin-top: 10px; }
    .review-flag--warn { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
    .review-flag--info { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; }
    .drawer-list { margin: 6px 0 0; padding-left: 18px; }
    .drawer-list li { font-size: 12px; color: var(--slate); line-height: 1.6; }
    .queue-table { width: 100%; border-collapse: separate; border-spacing: 0 6px; margin-top: 2px; }
    .queue-table thead th { background: transparent; border-bottom: 0; color: var(--slate-lt); padding: 0 8px 1px; font-size: 10px; }
    .queue-table tbody td { padding: 11px 11px; border-top: 1px solid var(--card-border); border-bottom: 1px solid var(--card-border); background: #fff; vertical-align: middle; }
    .queue-table tbody td:first-child { border-left: 1px solid var(--card-border); border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
    .queue-table tbody td:last-child { border-right: 1px solid var(--card-border); border-top-right-radius: 12px; border-bottom-right-radius: 12px; }
    .queue-row { transition: border-color .18s ease, box-shadow .18s ease, opacity .18s ease; }
    .queue-row:hover td { box-shadow: 0 8px 18px rgba(15,23,42,.045); border-top-color: #cbd5e1; border-bottom-color: #cbd5e1; }
    .queue-row--active td:first-child { box-shadow: inset 3px 0 0 var(--navy-lt); }
    .queue-row--other td:first-child { box-shadow: inset 3px 0 0 #d97706; }
    .queue-row--submitted td { background: #f8fbff; border-color: #bfdbfe; }
    .queue-row--submitted td:first-child { box-shadow: inset 4px 0 0 #3b82f6; }
    .queue-row--needs-fix td, .queue-row--attention.queue-row--needs-fix td { background: #fffbeb; border-color: #fcd34d; }
    .queue-row--needs-fix td:first-child { box-shadow: inset 4px 0 0 #f59e0b; }
    .queue-row--approved td { background: #f5f3ff; border-color: #ddd6fe; }
    .queue-row--approved td:first-child { box-shadow: inset 4px 0 0 #8b5cf6; }
    .queue-row--in-queue td { background: #faf5ff; border-color: #e9d5ff; }
    .queue-row--in-queue td:first-child { box-shadow: inset 4px 0 0 #7c3aed; }
    .queue-row--in-production td { background: #fff7ed; border-color: #fed7aa; }
    .queue-row--in-production td:first-child { box-shadow: inset 4px 0 0 #f97316; }
    .queue-row--completed td { background: #ecfdf5; border-color: #86efac; }
    .queue-row--completed td:first-child { box-shadow: inset 4px 0 0 #16a34a; }
    .queue-row--completed .queue-mini-progress span { background: linear-gradient(90deg, #22c55e, #16a34a); }
    .queue-row--completed .queue-name, .queue-row--completed .queue-next-owner, .queue-row--completed .queue-context-main { color: #14532d; }
    .queue-row--completed .queue-status-note, .queue-row--completed .queue-meta, .queue-row--completed .queue-meta-aux, .queue-row--completed .queue-context-sub, .queue-row--completed .queue-risk-note, .queue-row--completed .queue-status-aux { color: #166534; }
    .queue-row--rejected td { background: #fff1f2; border-color: #fecdd3; }
    .queue-row--rejected td:first-child { box-shadow: inset 4px 0 0 #e11d48; }
    .queue-row--rejected .queue-name, .queue-row--rejected .queue-status-note, .queue-row--rejected .queue-next-owner, .queue-row--rejected .queue-context-main { color: #7f1d1d; }
    .queue-row--rejected .queue-meta, .queue-row--rejected .queue-meta-aux, .queue-row--rejected .queue-context-sub, .queue-row--rejected .queue-risk-note, .queue-row--rejected .queue-status-aux { color: #9f1239; }
    .queue-row--attention:not(.queue-row--needs-fix):not(.queue-row--completed):not(.queue-row--rejected) td { background: #fffdf7; }
    .queue-cell-requester { min-width: 238px; }
    .case-badge { display: inline-flex; align-items: center; justify-content: center; min-width: 52px; border: 1px solid #bfdbfe; background: #eff6ff; color: #1e3a8a; border-radius: 999px; padding: 3px 8px; font: 800 11px/1 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace; letter-spacing: 0; white-space: nowrap; }
    .queue-case-line { display: flex; align-items: center; gap: 6px; margin-bottom: 6px; }
    .queue-cell-context { min-width: 190px; }
    .queue-cell-status { min-width: 212px; }
    .queue-cell-meta { min-width: 132px; }
    .queue-cell-action { width: 98px; text-align: right; }
    .queue-action-stack { display: grid; gap: 6px; justify-items: end; }
    .queue-name { font-size: 15px; font-weight: 800; color: var(--navy); line-height: 1.18; }
    .queue-meta { font-size: 11px; color: var(--slate); margin-top: 3px; line-height: 1.32; }
    .queue-meta-aux { font-size: 10px; color: var(--slate-lt); margin-top: 2px; line-height: 1.32; }
    .queue-context { display: flex; flex-direction: column; gap: 4px; }
    .queue-context-top { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; margin-bottom: 1px; }
    .queue-context-main { font-size: 13px; font-weight: 700; color: var(--navy); line-height: 1.24; }
    .queue-context-sub { font-size: 10px; color: var(--slate-lt); line-height: 1.28; }
    .queue-status-block { display: flex; flex-direction: column; gap: 4px; }
    .queue-status-block .pill { align-self: flex-start; }
    .queue-mini-progress { width: 100%; max-width: 146px; height: 4px; border-radius: 999px; background: #e2e8f0; overflow: hidden; margin-top: 1px; }
    .queue-mini-progress span { display: block; height: 100%; border-radius: inherit; background: linear-gradient(90deg, var(--blue), var(--mint)); }
    .queue-next-owner { font-size: 11px; font-weight: 800; color: var(--navy); text-transform: uppercase; letter-spacing: .32px; }
    .queue-status-note { font-size: 11px; color: var(--slate); line-height: 1.28; }
    .queue-status-aux { font-size: 10px; color: var(--slate-lt); line-height: 1.28; }
    .queue-meta-block { display: flex; flex-direction: column; gap: 6px; }
    .queue-time-main { font-size: 11px; font-weight: 700; color: var(--navy); line-height: 1.24; }
    .queue-time-sub { font-size: 10px; color: var(--slate-lt); line-height: 1.28; }
    .queue-risk-stack { display: flex; flex-direction: column; gap: 4px; }
    .queue-risk-pill { display: inline-flex; align-items: center; align-self: flex-start; border-radius: 999px; padding: 3px 8px; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: .42px; border: 1px solid transparent; }
    .queue-risk-pill--ok { background: #f8fafc; color: #475569; border-color: #cbd5e1; }
    .queue-risk-pill--soft { background: #fff7ed; color: #9a3412; border-color: #fdba74; }
    .queue-risk-pill--warn { background: #fef3c7; color: #92400e; border-color: #fcd34d; }
    .queue-risk-pill--high { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }
    .queue-risk-note { font-size: 10px; color: var(--slate-lt); line-height: 1.25; }
    .queue-review-btn { width: 88px; min-width: 88px; justify-content: center; font-weight: 700; box-shadow: 0 5px 12px rgba(127,29,29,.09); }
    .queue-review-btn--strong { box-shadow: 0 7px 16px rgba(127,29,29,.13); }
    .queue-review-btn--quiet { box-shadow: none; opacity: .88; }
    .queue-row--completed .queue-review-btn { color: #166534; border-color: #86efac; background: #f0fdf4; }
    .queue-row--rejected .queue-review-btn { color: #9f1239; border-color: #fecdd3; background: #fff1f2; }
    .queue-label-btn { width: 88px; min-width: 88px; justify-content: center; box-shadow: none; }
    .queue-empty { margin-top: 12px; }
    .queue-load-more { display: flex; align-items: center; justify-content: space-between; gap: 12px; flex-wrap: wrap; margin: 12px 0 2px; padding: 12px 14px; background: #f8fafc; border: 1px solid var(--card-border); border-radius: 10px; }
    .queue-load-more-text { font-size: 12px; color: var(--slate); line-height: 1.4; }
    .queue-skeleton { min-height: 120px; border-radius: 12px; background: linear-gradient(90deg, #f8fafc 0%, #eef2f7 45%, #f8fafc 90%); background-size: 200% 100%; animation: skeletonPulse 1.2s ease-in-out infinite; margin-top: 14px; border: 1px solid var(--card-border); }
    @keyframes skeletonPulse { 0% { background-position: 0 0; } 100% { background-position: -200% 0; } }

    @media (max-width: 1340px) {
      .queue-cell-requester { min-width: 224px; }
      .queue-cell-context { min-width: 178px; }
      .queue-cell-status { min-width: 198px; }
      .queue-cell-meta { min-width: 124px; }
      .queue-table tbody td { padding: 10px 10px; }
    }

    @media (max-width: 1180px) {
      .queue-cell-requester { min-width: 196px; }
      .queue-cell-context { min-width: 166px; }
      .queue-cell-status { min-width: 184px; }
      .queue-cell-meta { min-width: 118px; }
      .queue-cell-action { width: 92px; }
      .queue-table tbody td { padding: 10px 9px; }
    }

    /* ---------- REVIEW DRAWER ---------- */
    .drawer-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,.3); z-index: 200; display: none; }
    .drawer-overlay.show { display: block; }
    .drawer { position: fixed; top: 0; right: 0; width: 460px; max-width: 90vw; height: 100%; background: var(--card); z-index: 201; overflow-y: auto; box-shadow: -4px 0 20px rgba(0,0,0,.12); transform: translateX(100%); transition: transform .3s ease; }
    .drawer-overlay.show .drawer { transform: translateX(0); }
    .drawer-head { position: sticky; top: 0; background: var(--navy); color: #fff; padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; z-index: 1; }
    .drawer-head h3 { font-size: 16px; font-weight: 700; }
    .drawer-close { background: none; border: none; color: #fff; font-size: 22px; cursor: pointer; padding: 4px 8px; opacity: .7; }
    .drawer-close:hover { opacity: 1; }
    .drawer-body { padding: 20px; }
    .drawer-section { margin-bottom: 20px; }
    .drawer-section-title { font-weight: 700; font-size: 13px; text-transform: uppercase; letter-spacing: .4px; color: var(--slate-lt); margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid var(--card-border); }
    .drawer-field { margin-bottom: 10px; }
    .drawer-field label { font-size: 11px; font-weight: 600; color: var(--slate); display: block; margin-bottom: 3px; }
    .drawer-field .val { font-size: 13px; }
    .drawer-actions { position: sticky; bottom: 0; background: var(--card); border-top: 1px solid var(--card-border); padding: 14px 20px; display: flex; gap: 8px; flex-wrap: wrap; }

    /* ---------- OVERLAY / MODAL ---------- */
    .overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,.4); z-index: 300; display: flex; align-items: center; justify-content: center; }
    .modal { background: var(--card); border-radius: var(--radius); padding: 0; width: 560px; max-width: 92vw; max-height: 85vh; overflow-y: auto; box-shadow: var(--shadow-lg); }
    .modal-head { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--card-border); }
    .modal-head h3 { font-size: 16px; font-weight: 700; }
    .modal-close { background: none; border: none; font-size: 22px; cursor: pointer; color: var(--slate); padding: 4px; }
    .laser-capacity-modal { max-width: 620px; }
    .laser-capacity-body { padding: 18px 20px 20px; display: grid; gap: 14px; }
	    .laser-capacity-alert { border-radius: 12px; border: 1px solid #fed7aa; background: #fff7ed; color: #7c2d12; padding: 13px 14px; font-size: 13px; line-height: 1.55; }
	    .laser-capacity-alert strong { display: block; color: #9a3412; margin-bottom: 3px; }
	    .deadline-summary-panel { border-radius: 12px; border: 1px solid #bfdbfe; background: #eff6ff; color: #1e3a8a; padding: 13px 14px; font-size: 13px; line-height: 1.5; }
	    .deadline-summary-panel strong { display: block; color: #1e40af; margin-bottom: 6px; }
	    .deadline-summary-list { display: grid; gap: 6px; margin-top: 2px; }
	    .deadline-summary-item { display: flex; align-items: center; justify-content: space-between; gap: 10px; border-radius: 10px; padding: 8px 10px; background: rgba(255,255,255,.72); border: 1px solid rgba(59,130,246,.16); }
	    .deadline-summary-item span:first-child { font-weight: 800; }
	    .deadline-summary-item span:last-child { font-weight: 800; color: #1d4ed8; white-space: nowrap; }
	    .deadline-summary-note { display: block; margin-top: 7px; font-size: 12px; color: #475569; }
	    .laser-capacity-scale { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .laser-capacity-scale-item { border: 1px solid var(--card-border); border-radius: 10px; padding: 11px 12px; background: #f8fafc; }
    .laser-capacity-scale-item strong { display: block; font-size: 13px; color: var(--navy); }
    .laser-capacity-scale-item span { display: block; margin-top: 3px; font-size: 11px; color: var(--slate-lt); line-height: 1.4; }
    .laser-capacity-actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 8px; border-top: 1px solid var(--card-border); padding-top: 14px; }
    .email-meta { padding: 14px 20px; background: var(--bg); font-size: 13px; display: grid; gap: 10px; }
    .email-meta .field { margin: 0; }
    .email-meta input { font-size: 13px; }
    .email-preview { padding: 16px 20px; }
    .email-preview-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 8px; flex-wrap: wrap; }
    .email-preview h4 { font-size: 13px; font-weight: 700; margin: 0; }
    .email-preview-note { font-size: 11px; color: var(--slate-lt); line-height: 1.4; max-width: 360px; }
    .email-body { font-size: 13px; line-height: 1.6; border: 1px solid var(--card-border); border-radius: 10px; padding: 12px; min-height: 180px; background: #fff; }
    .email-body:focus { outline: 3px solid rgba(59,130,246,.18); outline-offset: 2px; border-color: #93c5fd; }
    .email-action-bar { padding: 14px 20px; border-top: 1px solid var(--card-border); display: flex; gap: 8px; flex-wrap: wrap; }

    /* ---------- TOAST ---------- */
    .toast-container { position: fixed; top: 70px; right: 16px; z-index: 400; display: flex; flex-direction: column; gap: 8px; }
    .toast { padding: 10px 18px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 600; box-shadow: var(--shadow-lg); animation: toastIn .3s ease; }
    .toast-success { background: #166534; color: #fff; }
    .toast-error { background: #991b1b; color: #fff; }
    @keyframes toastIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

    /* ---------- ADMIN TABLES (config) ---------- */
    .config-table { width: 100%; border-collapse: collapse; font-size: 12px; }
    .config-table th { background: var(--bg); padding: 8px 10px; text-align: left; font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--slate); }
    .config-table td { padding: 8px 10px; border-bottom: 1px solid var(--card-border); }
    .config-table input, .config-table select { font-size: 12px; padding: 5px 8px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: 700; text-transform: uppercase; }
    .badge-active { background: #dcfce7; color: #15803d; }
    .badge-inactive { background: #f1f5f9; color: #94a3b8; }

    .divider { border: 0; border-top: 1px solid var(--card-border); margin: 20px 0; }
    .wrap { flex-wrap: wrap; }
    .review-panel { display: flex; flex-direction: column; gap: 8px; min-width: 200px; }
    .review-actions { display: flex; gap: 6px; }
    .tech-focus { border-color: var(--amber); }

    /* ---------- HELP PAGE ---------- */
    .help-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: 16px; }
    .help-card { background: var(--card); border: 1px solid var(--card-border); border-radius: var(--radius-sm); padding: 20px; }
    .help-card h4 { font-size: 14px; margin-bottom: 8px; display: flex; align-items: center; gap: 6px; }
    .help-card p, .help-card li { font-size: 13px; color: var(--slate); line-height: 1.6; }
    .help-card ul { padding-left: 18px; margin-top: 6px; }
    .help-toc { background: var(--bg); border-radius: var(--radius-sm); padding: 16px 20px; margin-top: 14px; }
    .help-toc-title { font-weight: 700; font-size: 13px; margin-bottom: 8px; color: var(--navy); text-transform: uppercase; letter-spacing: .3px; }
    .help-toc ol { padding-left: 22px; margin: 0; }
    .help-toc li { font-size: 13px; line-height: 1.8; }
    .help-toc a { color: var(--blue); text-decoration: none; font-weight: 600; }
    .help-toc a:hover { text-decoration: underline; }
    .help-section { background: var(--card); border: 1px solid var(--card-border); border-radius: var(--radius); padding: 24px; margin-top: 16px; scroll-margin-top: 72px; }
    .help-section-title { font-size: 16px; font-weight: 800; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; color: var(--navy); }
    .help-section p, .help-section li { font-size: 13px; color: var(--slate); line-height: 1.7; }
    .help-section ul, .help-section ol { padding-left: 20px; margin: 8px 0; }
    .help-section h4 { font-size: 14px; font-weight: 700; margin: 16px 0 6px; color: var(--navy); }
    .help-section .do-list li { color: var(--green); } .help-section .do-list li span { color: var(--slate); }
    .help-section .dont-list li { color: var(--red); } .help-section .dont-list li span { color: var(--slate); }
    .help-checklist { background: var(--bg); border-radius: var(--radius-sm); padding: 14px 18px; margin: 12px 0; }
    .help-checklist-title { font-weight: 700; font-size: 13px; margin-bottom: 6px; }
    .help-checklist label { display: flex; align-items: flex-start; gap: 6px; font-size: 13px; line-height: 1.6; cursor: pointer; padding: 2px 0; }
    .help-checklist input[type=checkbox] { margin-top: 3px; flex-shrink: 0; }
    .help-badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
    .help-badge-ok { background: #dcfce7; color: #166534; } .help-badge-no { background: #fee2e2; color: #991b1b; } .help-badge-warn { background: #fef3c7; color: #92400e; }
    .help-size-table { width: 100%; border-collapse: collapse; font-size: 13px; margin: 10px 0; }
    .help-size-table th { background: var(--bg); font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .3px; padding: 8px 10px; text-align: left; border-bottom: 2px solid var(--card-border); }
    .help-size-table td { padding: 8px 10px; border-bottom: 1px solid var(--card-border); }
    .help-status-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 10px; margin: 10px 0; }
    .help-status-item { background: var(--bg); border-radius: var(--radius-sm); padding: 10px 14px; }
    .help-status-item strong { font-size: 13px; }
    .help-status-item p { font-size: 12px; margin: 4px 0 0; color: var(--slate-lt); }
    .help-quick-ref { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: #fff; border-radius: var(--radius); padding: 24px; margin-top: 16px; scroll-margin-top: 72px; }
    .help-quick-ref h3 { font-size: 16px; margin-bottom: 12px; }
    .help-quick-ref ol { padding-left: 20px; }
    .help-quick-ref li { font-size: 14px; line-height: 1.8; font-weight: 600; }

    /* ---------- SCROLL TO TOP ---------- */
    .scroll-top-btn { position: fixed; bottom: 24px; right: 24px; z-index: 150; width: 42px; height: 42px; border-radius: 50%; background: var(--navy); color: #fff; border: none; font-size: 20px; cursor: pointer; box-shadow: var(--shadow-lg); opacity: 0; visibility: hidden; transition: opacity .3s, visibility .3s, transform .3s; transform: translateY(10px); display: flex; align-items: center; justify-content: center; }
    .scroll-top-btn.show { opacity: 1; visibility: visible; transform: translateY(0); }
    .scroll-top-btn:hover { background: var(--maroon); }

    /* ---------- ROLE-BASED VISUAL CUES ---------- */
    /* Admin header accent */
    body.role-admin .header { border-bottom: 2px solid #7f1d1d; }
    body.role-technician .header { border-bottom: 2px solid #1d4ed8; }
    body.role-teacher .header { border-bottom: 2px solid #15803d; }
    body.role-student .header, body.role-guest .header { border-bottom: 2px solid #6b7280; }

    /* Role badge in nav area */
    .role-badge { display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; padding: 2px 8px; border-radius: 10px; margin-left: 8px; vertical-align: middle; }
    .role-badge-admin { background: #fef2f2; color: #7f1d1d; border: 1px solid #fca5a5; }
    .role-badge-technician { background: #eff6ff; color: #1d4ed8; border: 1px solid #93c5fd; }
    .role-badge-teacher { background: #f0fdf4; color: #15803d; border: 1px solid #86efac; }
    .role-badge-student { background: #f9fafb; color: #6b7280; border: 1px solid #d1d5db; }
    .role-badge-guest { background: #f9fafb; color: #9ca3af; border: 1px solid #e5e7eb; }

    /* Hide admin-only elements for student/guest via CSS */
    body.role-student .admin-only, body.role-guest .admin-only { display: none !important; }

    /* ---------- HELP ACCORDION ---------- */
    .help-section { transition: box-shadow .2s; }
    .help-section-title { cursor: pointer; user-select: none; position: relative; padding-right: 32px; }
    .help-section-title::after { content: '\\25B8'; position: absolute; right: 0; top: 50%; transform: translateY(-50%); font-size: 16px; color: var(--slate-lt); transition: transform .25s ease; }
    .help-section.help-expanded .help-section-title::after { transform: translateY(-50%) rotate(90deg); color: var(--blue); }
    .help-section:not(.help-expanded) > *:not(.help-section-title) { display: none; }
    .help-section:hover { box-shadow: 0 0 0 2px rgba(59,130,246,.1); }
    .help-section-title .help-badge-cat { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 10px; margin-left: 8px; vertical-align: middle; letter-spacing: .3px; text-transform: uppercase; }
    .help-badge-everyone { background: #dbeafe; color: #1e40af; }
    .help-badge-dt { background: #fef2f2; color: #9b2c3f; }
    .help-badge-nondt { background: #ecfdf5; color: #065f46; }

    /* ---------- QUICK-START HERO ---------- */
    .qs-hero { background: linear-gradient(135deg, #1e293b 0%, #334155 100%); color: #fff; border-radius: var(--radius); padding: 28px 24px; margin-top: 16px; }
    .qs-hero h3 { font-size: 18px; font-weight: 800; margin-bottom: 4px; }
    .qs-hero .qs-sub { font-size: 13px; opacity: .75; margin-bottom: 20px; line-height: 1.5; }
    .qs-steps { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 14px; }
    .qs-step { background: rgba(255,255,255,.07); border: 1px solid rgba(255,255,255,.12); border-radius: var(--radius-sm); padding: 16px; text-align: center; transition: var(--transition); }
    .qs-step:hover { background: rgba(255,255,255,.12); }
    .qs-step-num { width: 30px; height: 30px; border-radius: 50%; background: var(--rose); color: #fff; font-weight: 800; font-size: 14px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 8px; }
    .qs-step-icon { font-size: 28px; margin-bottom: 6px; line-height: 1; }
    .qs-step h4 { font-size: 13px; font-weight: 700; margin: 0 0 4px; }
    .qs-step p { font-size: 12px; opacity: .7; margin: 0; line-height: 1.4; }
    .qs-audience { display: flex; gap: 12px; margin-top: 18px; flex-wrap: wrap; }
    .qs-audience-card { flex: 1; min-width: 200px; background: rgba(255,255,255,.05); border: 1px solid rgba(255,255,255,.1); border-radius: var(--radius-sm); padding: 14px; }
    .qs-audience-card h4 { font-size: 13px; font-weight: 700; margin: 0 0 6px; display: flex; align-items: center; gap: 6px; }
    .qs-audience-card ul { margin: 0; padding-left: 16px; font-size: 12px; opacity: .8; line-height: 1.6; }
    .qs-divider { height: 1px; background: rgba(255,255,255,.1); margin: 18px 0; }

    /* ---------- WELCOME BANNER ---------- */
    .welcome-banner { background: linear-gradient(135deg, #f0f4ff 0%, #fefce8 100%); border: 1px solid #e0e7ff; border-radius: var(--radius); padding: 20px 24px; margin-bottom: 16px; }
    .welcome-banner h3 { font-size: 16px; font-weight: 800; margin: 0 0 4px; color: var(--navy); }
    .welcome-banner p { font-size: 13px; color: var(--slate); margin: 0; line-height: 1.6; }
    .welcome-pills { display: flex; gap: 8px; margin-top: 10px; flex-wrap: wrap; }
    .welcome-pill { display: inline-flex; align-items: center; gap: 5px; font-size: 12px; font-weight: 600; padding: 5px 12px; border-radius: 16px; background: #fff; border: 1px solid var(--card-border); color: var(--slate); }

    /* ---------- NEWCOMER INFO-STRIP ---------- */
    .newcomer-strip { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin: 16px 0; }
    .newcomer-card { background: var(--card); border: 1px solid var(--card-border); border-radius: var(--radius-sm); padding: 16px; text-align: center; }
    .newcomer-card .nc-icon { font-size: 28px; margin-bottom: 6px; line-height: 1; }
    .newcomer-card h4 { font-size: 13px; font-weight: 700; margin: 0 0 4px; color: var(--navy); }
    .newcomer-card p { font-size: 12px; color: var(--slate-lt); margin: 0; line-height: 1.5; }

    /* ---------- BEFORE YOU START BLOCK ---------- */
    .bys-block { background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); border: 1px solid #fde68a; border-radius: var(--radius); padding: 20px 24px; margin: 16px 0 20px; }
    .bys-title { font-size: 15px; font-weight: 800; color: #92400e; margin: 0 0 12px; }
    .bys-who { display: flex; align-items: flex-start; gap: 10px; font-size: 13px; color: var(--slate); line-height: 1.6; margin-bottom: 14px; padding: 10px 14px; background: rgba(255,255,255,.6); border-radius: var(--radius-sm); border: 1px solid rgba(251,191,36,.2); }
    .bys-who-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
    .bys-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; margin-bottom: 14px; }
    .bys-item { display: flex; align-items: flex-start; gap: 6px; font-size: 12px; color: var(--slate); line-height: 1.5; }
    .bys-check { color: #16a34a; font-size: 14px; flex-shrink: 0; margin-top: 1px; }
    .bys-notices { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
    .bys-notice { font-size: 11px; color: #92400e; line-height: 1.5; }
    .bys-footer { font-size: 12px; color: var(--slate-lt); line-height: 1.5; display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }

    /* ---------- FOOTER ---------- */
    .site-footer { max-width: 1200px; margin: 40px auto 0; padding: 20px 16px; border-top: 1px solid var(--card-border); text-align: center; font-size: 11px; color: var(--slate-lt); line-height: 1.6; }
    .site-footer strong { color: var(--slate); font-weight: 700; }

    /* ---------- INLINE HELP TIP ---------- */
    .field-tip { display: inline-flex; align-items: center; justify-content: center; width: 16px; height: 16px; border-radius: 50%; background: var(--bg); border: 1px solid var(--card-border); font-size: 10px; font-weight: 700; color: var(--slate-lt); cursor: help; margin-left: 4px; vertical-align: middle; text-decoration: none; }
    .field-tip:hover { background: var(--blue); color: #fff; border-color: var(--blue); text-decoration: none; }

    /* ---------- UI POLISH LAYER ---------- */
    html { scroll-behavior: smooth; }
    body { min-width: 0; overflow-x: hidden; background: #eef2f7; }
    body.modal-open { overflow: hidden; }
    .content { padding-top: 6px; }
    .header { background: #111827; box-shadow: 0 1px 0 rgba(255,255,255,.08) inset, 0 8px 24px rgba(15,23,42,.14); }
    .header-inner { height: 60px; max-width: 1440px; }
    .logo { letter-spacing: 0; }
    .logo-icon { width: 28px; height: 28px; border-radius: 8px; background: rgba(255,255,255,.1); display: inline-flex; align-items: center; justify-content: center; }
    .user-chip { max-width: 280px; min-width: 0; }
    .user-name { max-width: 190px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .tab-bar-wrap { position: sticky; top: 60px; z-index: 95; box-shadow: 0 6px 18px rgba(15,23,42,.08); }
    .tab-bar { scrollbar-width: none; }
    .tab-bar::-webkit-scrollbar { display: none; }
    .tab-btn { outline: none; }
    .tab-btn:focus-visible, .btn:focus-visible, .lane-btn:focus-visible, .file-zone:focus-visible, .field-tip:focus-visible { outline: 3px solid rgba(59,130,246,.24); outline-offset: 2px; }
    .card { border-color: #dbe3ef; box-shadow: 0 10px 28px rgba(15,23,42,.055); border-radius: 10px; }
    .section-title { letter-spacing: 0; }
    .section-sub { color: var(--slate); }
    .btn { min-height: 38px; }
    .btn:hover:not(:disabled) { transform: translateY(-1px); }
    .btn-primary { box-shadow: 0 8px 16px rgba(155,44,63,.14); }
    .btn-primary:hover { box-shadow: 0 10px 20px rgba(155,44,63,.18); }
    .btn-ghost { background: #fff; }
    input:not([type=checkbox]):not([type=radio]), select, textarea { background: #fff; min-height: 38px; }
    select { cursor: pointer; }

    .home-hero { display: grid; grid-template-columns: minmax(0, 1.1fr) 340px; gap: 18px; align-items: stretch; background: #111827; color: #fff; border-radius: 12px; padding: 24px; margin: 20px 0 16px; box-shadow: var(--shadow-lg); overflow: hidden; position: relative; }
    .home-hero::after { content: ''; position: absolute; inset: auto 0 0 0; height: 3px; background: linear-gradient(90deg, var(--rose), var(--amber), var(--mint), var(--blue)); }
    .home-hero-kicker { font-size: 11px; font-weight: 800; color: #93c5fd; letter-spacing: .6px; text-transform: uppercase; margin-bottom: 6px; }
    .home-hero h1 { font-size: 28px; line-height: 1.12; margin: 0 0 8px; letter-spacing: 0; }
    .home-hero p { color: #cbd5e1; font-size: 13px; line-height: 1.65; max-width: 720px; margin: 0; }
    .home-hero-actions { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 18px; }
    .home-hero .btn-ghost { color: #fff; background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.22); }
    .home-hero .btn-ghost:hover { background: rgba(255,255,255,.13); border-color: rgba(255,255,255,.34); }
    .home-panel { background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.12); border-radius: 10px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .home-panel-title { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .45px; color: #bfdbfe; }
    .home-panel-row { display: flex; gap: 10px; align-items: flex-start; color: #e5e7eb; font-size: 12px; line-height: 1.45; }
    .home-panel-icon { width: 24px; height: 24px; border-radius: 8px; background: rgba(255,255,255,.1); display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 14px; font-weight: 900; letter-spacing: 0; }
    .workflow-strip { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; margin-bottom: 16px; }
    .workflow-step { background: #fff; border: 1px solid var(--card-border); border-radius: 10px; padding: 13px 14px; display: flex; gap: 10px; align-items: flex-start; min-width: 0; box-shadow: var(--shadow); }
    .workflow-num { width: 24px; height: 24px; border-radius: 999px; background: #eff6ff; color: #1d4ed8; display: inline-flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; flex-shrink: 0; }
    .workflow-step strong { display: block; font-size: 12px; color: var(--navy); line-height: 1.25; }
    .workflow-step span:last-child { font-size: 11px; color: var(--slate); line-height: 1.4; }
    .page-hero { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 18px; align-items: center; background: #111827; color: #fff; border-radius: 12px; padding: 24px; margin: 20px 0 16px; box-shadow: var(--shadow-lg); position: relative; overflow: hidden; }
    .page-hero::after { content: ''; position: absolute; inset: auto 0 0 0; height: 3px; background: linear-gradient(90deg, var(--rose), var(--amber), var(--mint), var(--blue)); }
    .page-hero-kicker { font-size: 11px; font-weight: 800; color: #bfdbfe; letter-spacing: .6px; text-transform: uppercase; margin-bottom: 6px; }
    .page-hero h1 { font-size: 26px; line-height: 1.15; margin: 0 0 8px; letter-spacing: 0; }
    .page-hero p { color: #cbd5e1; font-size: 13px; line-height: 1.65; max-width: 760px; margin: 0; }
    .page-hero-actions { display: flex; flex-wrap: wrap; gap: 10px; justify-content: flex-end; min-width: 260px; }
    .page-hero .btn-ghost { color: #fff; background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.22); }
    .page-hero .btn-ghost:hover { background: rgba(255,255,255,.13); border-color: rgba(255,255,255,.34); }
    .status-search-panel { background: #fbfdff; border: 1px solid var(--card-border); border-radius: 12px; padding: 16px; margin: 14px 0 12px; }
    .status-search-row { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 10px; align-items: stretch; }
    .status-search-hint { display: flex; align-items: flex-start; gap: 8px; color: var(--slate); font-size: 12px; line-height: 1.5; margin-top: 10px; }
    .status-help-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; max-width: 720px; margin: 18px auto 0; }
    .status-help-card { background: #fff; border: 1px solid var(--card-border); border-radius: 10px; padding: 14px; text-align: center; min-width: 0; }
    .status-help-icon { font-size: 22px; line-height: 1; margin-bottom: 6px; }
    .status-help-title { font-size: 12px; font-weight: 800; color: var(--navy); line-height: 1.3; }
    .status-help-copy { font-size: 11px; color: var(--slate-lt); line-height: 1.4; margin-top: 3px; }
    .status-empty-state { text-align: center; padding: 30px 16px; color: var(--muted); }
    .status-empty-icon { font-size: 36px; line-height: 1; margin-bottom: 12px; }
    .status-empty-title { margin: 0 0 6px; font-weight: 700; color: var(--slate); }
    .status-empty-copy { margin: 0; font-size: 13px; line-height: 1.55; color: var(--slate-lt); }
    .request-note-strip { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-bottom: 16px; }
    .request-note { background: #fff; border: 1px solid var(--card-border); border-radius: 10px; padding: 13px 14px; display: flex; gap: 10px; align-items: flex-start; min-width: 0; box-shadow: var(--shadow); }
    .request-note-icon { width: 26px; height: 26px; border-radius: 9px; background: #eff6ff; color: #1d4ed8; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .request-note strong { display: block; font-size: 12px; color: var(--navy); line-height: 1.25; }
    .request-note span:last-child { font-size: 11px; color: var(--slate); line-height: 1.4; }
    #submitForm, #otherForm, #statusQuery, .form-section, .card, .help-section, .help-quick-ref, #machines-laser, #machines-3d, #machines-limits, #machines-workflow, #machines-report { scroll-margin-top: 124px; }

    .form-section { border: 1px solid var(--card-border); border-radius: 10px; padding: 16px; background: #fbfdff; }
    .form-section-title { display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--card-border); padding-bottom: 8px; }
    .form-section-title::before { content: ''; width: 4px; height: 18px; border-radius: 999px; background: var(--maroon); display: inline-block; }
    .guide-card, .rule-box, .disclaimer-box, .disclaimer-compact { border-radius: 10px; }
    .file-zone { background: #fff; min-height: 148px; display: flex; flex-direction: column; justify-content: center; }
    .file-zone-icon { width: 44px; height: 44px; border-radius: 12px; background: #eff6ff; color: #1d4ed8; display: inline-flex; align-items: center; justify-content: center; margin: 0 auto 8px; }
    .file-zone:hover { transform: translateY(-1px); box-shadow: 0 8px 18px rgba(15,23,42,.055); }
    .file-zone--filled { border-color: #86efac; background: #f0fdf4; }
    .file-zone--filled .file-zone-icon { background: #dcfce7; color: #166534; }
    .file-chosen { word-break: break-word; }
    .admin-hero { border-radius: 12px; }
    .stat-card[role=button] { cursor: pointer; }
    .stat-card[role=button]:focus-visible { outline: 3px solid rgba(59,130,246,.24); outline-offset: 2px; }
    .filter-bar { border: 1px solid var(--card-border); }
    .queue-lane-bar { padding-bottom: 2px; }
    .queue-table tbody td { transition: border-color .18s ease, background .18s ease, box-shadow .18s ease; }
    .drawer { max-width: min(92vw, 520px); }
    .drawer-close, .modal-close { min-width: 38px; min-height: 38px; border-radius: 8px; }
    .drawer-close:hover, .modal-close:hover { background: rgba(255,255,255,.12); }
    .modal-close:hover { background: var(--bg); }
    .overlay { padding: 16px; }
    .modal-head { position: sticky; top: 0; background: var(--card); z-index: 2; }
    .modal:focus { outline: none; }
    .help-section-title:focus-visible { outline: 3px solid rgba(59,130,246,.24); outline-offset: 4px; border-radius: 8px; }

    @media (max-width: 640px) {
      .header-inner { height: 48px; gap: 8px; min-width: 0; }
      .tab-bar-wrap { top: 48px; }
      .shell { padding-left: 10px; padding-right: 10px; }
      .logo { font-size: 14px; min-width: 0; overflow: hidden; text-overflow: ellipsis; }
      .user-chip { flex-shrink: 0; min-width: 0; }
      .user-info { display: none; }
      .user-avatar { width: 28px; height: 28px; }
      .tab-bar { flex-wrap: nowrap; justify-content: flex-start; overflow-x: auto; padding: 6px 10px; }
      .tab-bar-wrap::before, .tab-bar-wrap::after { display: block; }
      .tab-btn { padding: 8px 10px; font-size: 12px; }
      .tab-btn--special { text-shadow: none; }
      .card { padding: 16px; }
      .home-hero { grid-template-columns: 1fr; padding: 20px 16px; margin-top: 14px; }
      .home-hero h1 { font-size: 23px; }
      .home-hero-actions .btn { flex: 1 1 100%; }
      .page-hero { grid-template-columns: 1fr; padding: 20px 16px; margin-top: 14px; }
      .page-hero h1 { font-size: 22px; }
      .page-hero-actions { justify-content: stretch; min-width: 0; }
      .page-hero-actions .btn { flex: 1 1 100%; }
      .workflow-strip { grid-template-columns: 1fr; }
      .request-note-strip { grid-template-columns: 1fr; }
      .status-search-row { grid-template-columns: 1fr; }
      .status-help-grid { grid-template-columns: 1fr; }
      .draft-row, .draft-actions { align-items: stretch; }
      .draft-actions .btn { flex: 1 1 100%; }
      .draft-progress { grid-template-columns: 1fr; }
      .draft-progress-text { white-space: normal; }
      .submit-workspace { grid-template-columns: 1fr; }
      .submit-helper-rail { position: static; }
      .submit-helper-head { flex-direction: column; }
      .submit-rail-actions { grid-template-columns: 1fr; }
      .submit-stepper { grid-template-columns: 1fr; }
      .form-section { padding: 14px; }
      .file-zone { min-height: 128px; }
      .admin-hero { grid-template-columns: 1fr; padding: 20px 16px; }
      .admin-hero-title { font-size: 20px; }
      .admin-hero-actions { justify-content: stretch; }
      .admin-hero-actions .btn { flex: 1 1 100%; }
      .teacher-beta-table, .teacher-beta-table thead, .teacher-beta-table tbody, .teacher-beta-table tr, .teacher-beta-table th, .teacher-beta-table td { display: block; width: 100%; }
      .teacher-beta-table thead { display: none; }
      .teacher-beta-table tbody { display: grid; gap: 10px; }
      .teacher-beta-table tr { border: 1px solid var(--card-border); border-radius: 12px; padding: 8px 10px; background: #fff; }
      .teacher-beta-table td { border-bottom: 0; padding: 7px 0; }
      .teacher-beta-table td::before { content: attr(data-label); display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .35px; color: var(--slate-lt); margin-bottom: 2px; }
      .admin-workboard { grid-template-columns: 1fr; }
      .admin-insight-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .admin-insight { min-height: 86px; padding: 12px; }
      .queue-toolbar { align-items: stretch; }
      .queue-lane-bar { overflow-x: auto; flex-wrap: nowrap; padding-bottom: 2px; }
      .lane-btn { flex: 0 0 auto; }
      .drawer { width: 100vw; }
      .overlay { align-items: flex-end; padding: 10px; }
	      .modal { width: 100%; max-width: 100%; max-height: 92vh; border-radius: 12px 12px 0 0; }
	      .laser-capacity-scale { grid-template-columns: 1fr; }
	      .deadline-summary-item { align-items: flex-start; flex-direction: column; gap: 2px; }
	      .deadline-summary-item span:last-child { white-space: normal; }
	      .laser-capacity-actions .btn { width: 100%; }
      .qs-hero { padding: 20px 16px; }
      .qs-steps { grid-template-columns: 1fr; }
      .qs-audience { flex-direction: column; }
      .newcomer-strip { grid-template-columns: 1fr; gap: 8px; }
      .machines-guide-callout { flex-direction: column; text-align: center; }
      .bys-block { padding: 16px; }
      .bys-grid { grid-template-columns: 1fr; }
      .bys-who { flex-direction: column; gap: 6px; }
      .filter-bar { padding: 12px; }
      .filter-meta { justify-content: stretch; }
      .teacher-toggle { width: 100%; margin-right: 0; }
      .tbl-wrap { overflow: visible; }
      .queue-table, .queue-table thead, .queue-table tbody, .queue-table tr, .queue-table th, .queue-table td { display: block; width: 100%; }
      .queue-table thead { display: none; }
      .queue-table tbody { display: flex; flex-direction: column; gap: 12px; }
      .queue-table tbody td { border: 1px solid var(--card-border); border-radius: 12px; padding: 11px 12px; margin: 0; box-shadow: none; }
      .queue-table tbody td:first-child, .queue-table tbody td:last-child { border-radius: 12px; }
      .queue-row { display: grid; gap: 8px; }
      .queue-row td::before { content: attr(data-label); display: block; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: .45px; color: var(--slate-lt); margin-bottom: 6px; }
      .queue-row--active td:first-child, .queue-row--other td:first-child { box-shadow: none; }
      .queue-cell-action { width: auto; display: flex !important; align-items: center; justify-content: space-between; gap: 12px; text-align: left; }
      .queue-cell-action::before { margin-bottom: 0; }
      .queue-action-stack { grid-template-columns: 1fr 1fr; justify-items: stretch; width: 100%; }
      .queue-meta-block { gap: 8px; }
      .queue-review-btn, .queue-label-btn { width: 100%; min-width: 0; min-height: 40px; }
      .drawer-body { padding: 16px; }
      .drawer-actions { padding: 12px 16px; }
      .drawer-actions .btn { flex: 1 1 100%; }
      .review-summary-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 980px) {
      .admin-hero { grid-template-columns: 1fr; }
      .admin-hero-actions { justify-content: flex-start; }
      .teacher-beta-hero { grid-template-columns: 1fr; }
      .teacher-beta-actions { justify-content: flex-start; }
      .teacher-beta-toolbar { grid-template-columns: 1fr; align-items: stretch; }
      .admin-workboard { grid-template-columns: 1fr; }
      .admin-insight-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .submit-workspace { grid-template-columns: 1fr; }
      .submit-helper-rail { position: static; }
    }
    @media (max-width: 480px) { .admin-insight-grid { grid-template-columns: 1fr; } }
    @media (max-width: 860px) { .machine-page-grid { grid-template-columns: 1fr; } }

    /* ---------- FIGMA-STYLE SYSTEM REFINEMENT PASS ---------- */
    .shell, .header-inner, .tab-bar, .site-footer { max-width: 1280px; }
    .logo-icon, .tab-icon, .home-panel-icon, .status-help-icon, .admin-insight-icon, .request-note-icon {
      font-family: "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", system-ui, sans-serif;
    }
    .logo-icon { font-size: 15px; box-shadow: inset 0 0 0 1px rgba(255,255,255,.08); }
    .tab-bar { gap: 7px; padding: 8px 18px; }
    .tab-btn { min-height: 40px; border-radius: 11px; background: rgba(255,255,255,.035); }
    .tab-icon { background: rgba(255,255,255,.1); box-shadow: inset 0 0 0 1px rgba(255,255,255,.04); }
    .tab-btn.active .tab-icon { background: rgba(255,255,255,.2); }
    .tab-btn--special .tab-icon { background: rgba(245,158,11,.16); }
    .tab-btn:active, .btn:active, .lane-btn:active, .path-card:active { transform: translateY(0); }

    .card, .teacher-beta-class, .status-health-panel, .status-trend-panel, .status-search-panel,
    .form-section, .submit-helper-rail, .admin-health-panel, .status-help-card, .request-note {
      border-color: #d7e0ec;
    }
    .card { background: rgba(255,255,255,.98); }
    .section-title { line-height: 1.25; }
    .section-sub { max-width: 960px; }
    .btn { border-radius: 9px; font-weight: 800; }
    .btn-ghost:hover { color: var(--navy); }
    .btn-primary:focus-visible { box-shadow: 0 0 0 4px rgba(155,44,63,.16), 0 8px 16px rgba(155,44,63,.14); }
    input:not([type=checkbox]):not([type=radio]):hover, select:hover, textarea:hover {
      border-color: #cbd5e1;
    }
    input:not([type=checkbox]):not([type=radio])::placeholder, textarea::placeholder { color: #9aa8ba; }
    select { appearance: auto; -webkit-appearance: menulist; -moz-appearance: auto; background-color: #fff; background-image: none; padding-right: 12px; }

    .home-hero, .page-hero, .admin-hero, .teacher-beta-hero {
      border: 1px solid rgba(255,255,255,.08);
    }
    .home-hero p, .page-hero p, .admin-hero-sub, .teacher-beta-copy { color: #d6dee9; }
    .home-hero-actions .btn, .page-hero-actions .btn, .teacher-beta-actions .btn, .admin-hero-actions .btn {
      min-height: 42px;
    }
    .workflow-step, .request-note, .admin-role-step, .newcomer-card {
      transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease;
    }
    .workflow-step:hover, .request-note:hover, .admin-role-step:hover, .newcomer-card:hover {
      transform: translateY(-1px);
      box-shadow: 0 10px 22px rgba(15,23,42,.06);
      border-color: #cbd5e1;
    }

    .teacher-beta-toolbar, .filter-bar {
      background: #f8fafc;
      border: 1px solid #dbe3ef;
      border-radius: 12px;
    }
    .teacher-beta-toolbar { padding: 14px; }
    .teacher-beta-check input { width: 16px; height: 16px; }
    .teacher-beta-stat, .summary-card, .stat-card, .status-queue-metric {
      background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
    }
    .teacher-beta-table th, thead th, .config-table th {
      position: sticky;
      top: 0;
      z-index: 1;
      background: #f8fafc;
      box-shadow: 0 1px 0 var(--card-border);
    }
    .teacher-beta-table tbody tr, .config-table tbody tr, tbody tr {
      transition: background .16s ease, box-shadow .16s ease;
    }
    .teacher-beta-table tbody tr:hover td, .config-table tbody tr:hover td {
      background-color: #f8fbff;
    }
    .teacher-beta-row--completed:hover td { background-color: #ecfdf5; }
    .teacher-beta-row--missing:hover td { background-color: #fff1f2; }
    .teacher-beta-row--needs_fix:hover td { background-color: #fef3c7; }
    .teacher-beta-email, .queue-meta-aux, .sub { color: #718096; }

    .filter-check summary:focus-visible, .filter-check-option:focus-within {
      outline: 3px solid rgba(59,130,246,.18);
      outline-offset: 2px;
    }
    .filter-check-menu {
      border-color: #cbd5e1;
      box-shadow: 0 18px 38px rgba(15,23,42,.16);
    }
    .filter-check-option { min-height: 34px; }
    .filter-check-option input { accent-color: var(--maroon); }
    .filter-check-option span { overflow: hidden; text-overflow: ellipsis; }

    .queue-table tbody td { box-shadow: 0 1px 0 rgba(15,23,42,.02); }
    .queue-name, .teacher-beta-student { letter-spacing: 0; }
    .queue-case-line { align-items: center; }
    .queue-review-btn, .queue-label-btn { min-height: 36px; }
    .case-badge, .teacher-beta-case { box-shadow: inset 0 0 0 1px rgba(255,255,255,.45); }

    .drawer { width: min(520px, 92vw); box-shadow: -18px 0 40px rgba(15,23,42,.22); }
    .drawer-body { display: grid; gap: 12px; background: #f8fafc; }
    .drawer-section { background: #fff; border: 1px solid var(--card-border); border-radius: 12px; padding: 14px; margin-bottom: 0; }
    .drawer-section-title { border-bottom-color: #edf2f7; }
    .drawer-field .val { line-height: 1.45; word-break: break-word; }
    .drawer-actions { box-shadow: 0 -10px 20px rgba(15,23,42,.06); }
    .modal { box-shadow: 0 24px 60px rgba(15,23,42,.24); }

    .status-workload-layout { align-items: stretch; }
    .status-health-panel, .status-trend-panel { box-shadow: 0 8px 22px rgba(15,23,42,.04); }
    .status-trend-chart { height: 168px; }
    .status-position-panel { box-shadow: 0 8px 18px rgba(59,130,246,.06); }
    .status-help-card { transition: transform .18s ease, box-shadow .18s ease, border-color .18s ease; }
    .status-help-card:hover { transform: translateY(-1px); border-color: #cbd5e1; box-shadow: 0 10px 22px rgba(15,23,42,.055); }

    .config-table { border-collapse: separate; border-spacing: 0; }
    .config-table th:first-child { border-top-left-radius: 10px; }
    .config-table th:last-child { border-top-right-radius: 10px; }
    .config-table td { background: #fff; }

    @media (max-width: 1180px) {
      .tab-bar { padding-left: 12px; padding-right: 12px; }
      .tab-btn { padding-left: 9px; padding-right: 9px; font-size: 11.5px; gap: 6px; }
      .tab-icon { min-width: 21px; height: 21px; flex-basis: 21px; font-size: 13px; }
      .tab-label { max-width: 92px; overflow: hidden; text-overflow: ellipsis; }
    }
    @media (max-width: 1080px) {
      .tab-bar { gap: 5px; padding: 7px 10px; }
      .tab-btn { min-height: 36px; padding: 7px 6px; font-size: 10.5px; gap: 4px; border-radius: 9px; }
      .tab-icon { min-width: 18px; height: 18px; flex-basis: 18px; font-size: 12px; border-radius: 6px; }
      .tab-label { max-width: 54px; }
    }
    @media (max-width: 760px) {
      .tab-label { max-width: none; }
      .teacher-beta-toolbar, .filter-bar { padding: 12px; }
      .status-trend-chart { height: 150px; }
    }

    /* ---------- FIGMA READABILITY SCALE PASS ---------- */
    html { font-size: 15px; }
    body { color: #172033; }
    .shell, .header-inner, .tab-bar, .site-footer { max-width: 1280px; }
    .shell { padding-left: 16px; padding-right: 16px; }
    .header-inner { height: 62px; }
    .logo { font-size: 18px; }
    .logo-icon { width: 32px; height: 32px; font-size: 17px; }
    .user-chip { font-size: 13px; }
    .user-avatar { width: 34px; height: 34px; font-size: 14px; }
    .user-role { font-size: 11px; }

    .tab-bar { gap: 8px; padding: 10px 20px; justify-content: center; }
    .tab-btn { min-height: 44px; padding: 10px 13px; font-size: 13px; border-radius: 12px; gap: 8px; }
    .tab-icon { min-width: 25px; height: 25px; flex-basis: 25px; font-size: 15px; border-radius: 8px; }
    .tab-label { line-height: 1.2; }

    .card { padding: 28px; margin-top: 22px; }
    .section-title { font-size: 22px; }
    .section-sub { font-size: 15px; color: #64748b; line-height: 1.55; }
    .form-section-title { font-size: 17px; }
    .field label, .filter-bar .field label, .teacher-beta-toolbar .field label { font-size: 13px; font-weight: 800; }
    .field .helper, .hint { font-size: 12.5px; color: #64748b; }
    input:not([type=checkbox]):not([type=radio]), select, textarea { min-height: 44px; font-size: 15px; padding: 11px 14px; }
    .btn { min-height: 42px; font-size: 14px; padding: 10px 18px; }
    .btn-sm { min-height: 36px; font-size: 13px; padding: 7px 13px; }
    .alert, .disclaimer-box { font-size: 14px; line-height: 1.55; }

    .home-hero, .page-hero, .admin-hero, .teacher-beta-hero { padding: 30px; }
    .home-hero h1 { font-size: 34px; }
    .page-hero h1, .admin-hero-title { font-size: 32px; }
    .teacher-beta-title { font-size: 34px; }
    .home-hero p, .page-hero p, .admin-hero-sub, .teacher-beta-copy { font-size: 16px; line-height: 1.62; max-width: 940px; }
    .home-panel-title, .workflow-step strong { font-size: 14px; }
    .workflow-step span:last-child { font-size: 13px; }

    .status-search-panel { padding: 18px; }
    .status-search-panel input { font-size: 15px; }
    .status-empty-copy, .status-help-copy { font-size: 14px; }
    .status-workload-title, .status-queue-title { font-size: 15px; }
    .status-workload-kicker { font-size: 11px; }
    .status-workload-count { font-size: 12px; }
    .status-workload-count strong { font-size: 18px; }
    .status-workload-state, .status-trend-pill { font-size: 11px; }
    .status-workload-scale, .status-trend-summary { font-size: 11.5px; }
    .status-queue-note, .status-workload-foot, .status-workload-alert, .status-position-note, .status-pickup-note { font-size: 13px; }
	    .status-trend-title { font-size: 14px; }
	    .status-trend-note { font-size: 11.5px; }
	    .status-trend-chart { height: 188px; }
	    .rules-throughput-chart { height: 250px; }
	    .status-trend-label { font-size: 10px; }
    .status-workload-lane-label { font-size: 12.5px; }
    .status-workload-lane-note { font-size: 11.5px; }
    .status-next-value { font-size: 14.5px; }
    .status-next-note, .status-action-list, .status-stage { font-size: 13px; }

    .teacher-beta-stat strong, .summary-card .num, .stat-num { font-size: 28px; }
    .teacher-beta-stat span, .summary-card .lbl, .stat-label { font-size: 11.5px; }
    .teacher-beta-class-title { font-size: 20px; }
    .teacher-beta-class-sub, .teacher-beta-action { font-size: 14px; }
    .teacher-beta-table, table { font-size: 15px; }
    .teacher-beta-table th, thead th { font-size: 12px; }
    .teacher-beta-student { font-size: 16px; }
    .teacher-beta-email { font-size: 13px; }

    .admin-role-step-title, .admin-health-title, .queue-toolbar-title { font-size: 15px; }
    .admin-role-step-copy, .admin-health-copy, .admin-health-row, .queue-toolbar-sub { font-size: 13px; }
    .admin-section-label, .admin-insight-label { font-size: 12px; }
    .admin-insight-value { font-size: 30px; }
    .admin-insight-note { font-size: 12.5px; }

    .filter-bar { gap: 12px; padding: 16px; border-radius: 14px; }
    .filter-bar input, .filter-bar select, .filter-check summary { min-height: 40px; font-size: 13.5px; padding-top: 9px; padding-bottom: 9px; }
    .filter-bar input, .filter-bar select, .filter-check summary, .teacher-beta-toolbar input, .teacher-beta-toolbar select {
      border-width: 1.5px;
      background-color: #fff;
      box-shadow: inset 0 1px 0 rgba(15,23,42,.025);
    }
    .filter-bar select, .teacher-beta-toolbar select {
      appearance: none !important;
      -webkit-appearance: none !important;
      -moz-appearance: none !important;
      background-image: linear-gradient(45deg, transparent 50%, #64748b 50%), linear-gradient(135deg, #64748b 50%, transparent 50%) !important;
      background-position: calc(100% - 16px) 50%, calc(100% - 11px) 50% !important;
      background-repeat: no-repeat !important;
      background-size: 5px 5px, 5px 5px !important;
      padding-right: 34px;
    }
    .filter-check summary:hover, .filter-bar select:hover, .teacher-beta-toolbar select:hover { border-color: #b8c5d8; }
    .filter-check summary::after { transition: transform .16s ease, border-color .16s ease; }
    .filter-check[open] summary::after { transform: translateY(-35%) rotate(225deg); }
    .filter-check-option { font-size: 13px; min-height: 38px; }
    tbody td { padding: 12px 14px; }
    .queue-table { border-spacing: 0 8px; }
    .queue-table thead th { font-size: 11.5px; padding-bottom: 6px; }
    .queue-table tbody td { padding: 14px 13px; }
    .queue-name { font-size: 16px; line-height: 1.25; }
    .queue-meta, .queue-next-owner, .queue-status-note, .queue-time-main { font-size: 12.5px; }
    .queue-meta-aux, .queue-context-sub, .queue-status-aux, .queue-time-sub, .queue-risk-note { font-size: 11.5px; }
    .queue-context-main { font-size: 14px; }
    .case-badge { min-width: 58px; font-size: 12px; padding: 4px 9px; }
    .pill, .queue-risk-pill { font-size: 11px; padding: 4px 9px; }
    .stat-card { min-height: 86px; padding: 15px 10px; display: flex; flex-direction: column; justify-content: center; gap: 5px; }
    .stat-card .stat-num, .stat-card .stat-num.pill {
      display: block !important;
      min-width: 0 !important;
      padding: 0 !important;
      border-radius: 0 !important;
      background: transparent !important;
      font-size: 36px !important;
      line-height: .95 !important;
      font-weight: 900 !important;
      letter-spacing: 0 !important;
      text-transform: none !important;
      overflow: visible !important;
      text-overflow: clip !important;
    }
    .stat-card .stat-num.pill-submitted { color: #1d4ed8; }
    .stat-card .stat-num.pill-needs_fix { color: #92400e; }
    .stat-card .stat-num.pill-approved { color: #065f46; }
    .stat-card .stat-num.pill-in_queue { color: #5b21b6; }
    .stat-card .stat-num.pill-in_production { color: #c2410c; }
    .stat-card .stat-num.pill-completed { color: #15803d; }
    .stat-card .stat-num.pill-rejected { color: #be123c; }
    .stat-card .stat-label { font-size: 12px; font-weight: 800; }
    .admin-insight { min-height: 108px; }
    .admin-insight-value { font-size: 38px; font-weight: 900; }
    .admin-insight-note { font-size: 13px; }
    .queue-review-btn, .queue-label-btn { width: 96px; min-width: 96px; min-height: 40px; }

    .drawer { width: min(580px, 94vw); }
    .drawer-head h3, .modal-head h3 { font-size: 18px; }
    .drawer-section-title { font-size: 13px; }
    .drawer-field label { font-size: 12px; }
    .drawer-field .val, .email-body, .email-meta input { font-size: 14px; }
    .drawer-list li { font-size: 13px; }
    .help-card h4, .help-section-title { font-size: 17px; }
    .help-card p, .help-card li, .help-section p, .help-section li { font-size: 14px; }

    @media (max-width: 1180px) {
      .shell { padding-left: 16px; padding-right: 16px; }
      .tab-btn { min-height: 40px; font-size: 12px; padding: 8px 9px; gap: 6px; }
      .tab-icon { min-width: 22px; height: 22px; flex-basis: 22px; font-size: 14px; }
      .tab-label { max-width: none; }
      .home-hero h1 { font-size: 30px; }
      .page-hero h1, .admin-hero-title, .teacher-beta-title { font-size: 28px; }
    }
    @media (max-width: 1080px) {
      .tab-bar { gap: 6px; padding: 8px 10px; justify-content: center; }
      .tab-btn { min-height: 38px; padding: 8px 7px; font-size: 11.5px; gap: 5px; }
      .tab-icon { min-width: 20px; height: 20px; flex-basis: 20px; font-size: 13px; border-radius: 7px; }
      .tab-label { max-width: none; }
      .card { padding: 22px; }
    }
    @media (max-width: 760px) {
      html { font-size: 14px; }
      .shell { padding-left: 12px; padding-right: 12px; }
      .home-hero, .page-hero, .admin-hero, .teacher-beta-hero { padding: 20px 16px; }
      .home-hero h1, .page-hero h1, .admin-hero-title, .teacher-beta-title { font-size: 24px; }
      .home-hero p, .page-hero p, .admin-hero-sub, .teacher-beta-copy { font-size: 14px; }
      .card { padding: 18px; }
      .status-trend-chart { height: 160px; }
    }
  </style>
</head>
<body class="role-${escapeHtml_(role)}">
  <a class="skip-link" href="#mainContent">Skip to main content</a>
  <div class="toast-container" id="toastContainer"></div>
  <button class="scroll-top-btn" id="scrollTopBtn" onclick="window.scrollTo({top:0,behavior:'smooth'})" title="Back to top">&#8593;</button>

  <header class="header">
    <div class="header-inner">
      <div class="logo"><span class="logo-icon" aria-hidden="true">🛠</span> ${escapeHtml_(boot.appName)}` + (isAdmin ? `<span class="role-badge role-badge-${escapeHtml_(role)}">${escapeHtml_(role)}</span>` : '') + `</div>
      ` + userChip + `
    </div>
  </header>
  <nav class="tab-bar-wrap" id="tabBarWrap" aria-label="Main navigation"><div class="tab-bar">` + navItems + `</div></nav>

  <main class="shell" id="mainContent" tabindex="-1">
    <div class="content">
      <div id="page-submit" style="display:${page === 'submit' ? 'block' : 'none'}">${renderSubmitPage_()}</div>
      <div id="page-other"  style="display:${page === 'other'  ? 'block' : 'none'}">${renderOtherRequestPage_(boot)}</div>
      <div id="page-status" style="display:${page === 'status' ? 'block' : 'none'}">${renderStatusPage_(boot.currentUser)}</div>
      <div id="page-queue" style="display:${page === 'queue' ? 'block' : 'none'}">${renderStudentQueuePage_()}</div>
      <div id="page-teacherbeta" style="display:${page === 'teacherbeta' ? 'block' : 'none'}">${isTeacherBetaUser ? renderTeacherBetaPage_(boot.currentUser) : '<div class="card"><div class="section-title">&#128274; Access Restricted</div><p>Class is available to teacher accounts only.</p></div>'}</div>
      ` + (isAdmin ? `<div id="page-admin"  style="display:${page === 'admin'  ? 'block' : 'none'}">${renderAdminPage_(boot.currentUser, boot)}</div>` : `<div id="page-admin" style="display:none"><div class="card"><div class="section-title">&#128274; Access Restricted</div><p>You do not have permission to view this page.</p></div></div>`) + `
      <div id="page-machines" style="display:${page === 'machines' ? 'block' : 'none'}">${renderMachinesPage_()}</div>
      <div id="page-help"   style="display:${page === 'help'   ? 'block' : 'none'}">${renderHelpPage_()}</div>
      ` + (isSystemAdmin ? `<div id="page-rules"  style="display:${page === 'rules'  ? 'block' : 'none'}">` + rulesPageHtml + `</div>
      <div id="page-users"  style="display:${page === 'users'  ? 'block' : 'none'}">` + usersPageHtml + `</div>
      <div id="page-audit"  style="display:${page === 'audit'  ? 'block' : 'none'}">` + auditPageHtml + `</div>` : '') + `
    </div>
  </main>

  <footer class="site-footer">
    <strong>Design Fabrication Dashboard</strong> &mdash; VSA Design &amp; Technology Department<br>
    Laser Cutting &bull; 3D Printing &bull; Prototyping &bull; Creative Making<br>
    Need machine details? Visit the <a href="javascript:void(0)" onclick="switchPage('machines')" style="color:var(--blue);text-decoration:underline;">Machines Guide</a> or the <a href="javascript:void(0)" onclick="switchPage('help')" style="color:var(--blue);text-decoration:underline;">Help &amp; Guidelines</a> page.
  </footer>

  ` + (isAdmin ? `<div class="drawer-overlay" id="reviewDrawer">
    <div class="drawer" role="dialog" aria-modal="true" aria-labelledby="drawerTitle">
      <div class="drawer-head"><h3 id="drawerTitle">Review Submission</h3><button class="drawer-close" onclick="closeDrawer()" aria-label="Close review panel">&times;</button></div>
      <div class="drawer-body" id="drawerBody"></div>
      <div class="drawer-actions" id="drawerActions"></div>
    </div>
  </div>` : '') + `

  <script>
    var BOOT = ${JSON.stringify(boot)};
    var CLIENT_BUILD = (BOOT.build && BOOT.build.version) || '2026-04-25-test-dev-ready';
    console.log('Design Fabrication Dashboard build:', CLIENT_BUILD);
    var MACHINE_LABELS = { laser: 'Laser Cut', '3d': '3D Print' };
    var STATUS_ORDER = ['submitted','approved','in_queue','in_production','completed'];
    var STATUS_LABELS = {
      submitted: 'Submitted', needs_fix: 'Needs Fix', approved: 'Approved',
      in_queue: 'In Queue', in_production: 'In Production', completed: 'Completed', rejected: 'Rejected'
    };
    var STATUS_MSG = (BOOT.uiText && BOOT.uiText.statusMessages) ? BOOT.uiText.statusMessages : {
      submitted:     'Your file has been received and is waiting for technician review.',
      needs_fix:     'Your file needs changes before it can proceed.',
      approved:      'Your submission has passed review and is ready for scheduling.',
      in_queue:      'Your job is approved and waiting in the production queue.',
      in_production: 'Your job is currently being fabricated.',
      completed:     'Your job is complete! Please collect it from the workshop.',
      rejected:      'This submission cannot proceed in its current form.'
    };
    var STATUS_PROGRESS = { submitted: 20, needs_fix: 25, approved: 40, in_queue: 60, in_production: 80, completed: 100, rejected: 100 };
    var STATUS_OWNER = {
      submitted: 'Technician Review', needs_fix: 'Student Revision', approved: 'Technician Queue',
      in_queue: 'Technician Queue', in_production: 'Technician Production', completed: 'Student Collection', rejected: 'Teacher + Student Follow-up'
    };
    var STATUS_ACTION_HINT = {
      submitted: 'Awaiting technician review.',
      needs_fix: 'Waiting for requester resubmission.',
      approved: 'Ready for queueing.',
      in_queue: 'Waiting for machine slot.',
      in_production: 'In production.',
      completed: 'Ready for collection.',
      rejected: 'Follow up with teacher or requester.'
    };
    var QUEUE_POLICY = BOOT.queuePolicy || {};
    var QUEUE_BUSY_THRESHOLD = Math.max(1, Number(QUEUE_POLICY.activeBusyThreshold || 20));
    var QUEUE_HEAVY_THRESHOLD = Math.max(QUEUE_BUSY_THRESHOLD + 1, Number(QUEUE_POLICY.activeHeavyThreshold || 30));
    var LASER_CAPACITY_NOTICE = QUEUE_POLICY.laserCapacityNotice || {};

    function currentUserEmail_() {
      return String((BOOT.currentUser && BOOT.currentUser.email) || '').trim();
    }
    function isApprovedSchoolEmail_(email) {
      return /^[^\\s@]+@(student\\.)?example\\.edu$/i.test(String(email || '').trim());
    }

    function queueLoadState_(load) {
      load = Math.max(0, Number(load || 0));
      if (load > QUEUE_HEAVY_THRESHOLD) return { key: 'heavy', label: 'Heavy', fill: 'status-workload-fill--heavy' };
      if (load >= QUEUE_BUSY_THRESHOLD) return { key: 'busy', label: 'Busy', fill: 'status-workload-fill--busy' };
      if (load >= 8) return { key: 'active', label: 'Active', fill: '' };
      return { key: 'calm', label: 'Calm', fill: '' };
    }

    function queueLoadPct_(load) {
      load = Math.max(0, Number(load || 0));
      if (!load) return 0;
      return Math.max(8, Math.min(100, Math.round((load / QUEUE_HEAVY_THRESHOLD) * 100)));
    }

	    function statusProgress(status) { return Number(STATUS_PROGRESS[String(status||'').trim()]||0); }
	    function statusOwner(status) { return STATUS_OWNER[String(status||'').trim()]||'Workflow Team'; }
	    function statusActionHint(status) { return STATUS_ACTION_HINT[String(status||'').trim()]||'Check the latest remarks for next steps.'; }
	    function statusPill(status) { var s = String(status||''); return '<span class="pill pill-' + s + '">' + esc((STATUS_LABELS[s]||s).toUpperCase()) + '</span>'; }
	    function parseDisplayDateMs_(value) {
	      var raw = String(value || '').trim();
	      if (!raw) return NaN;
	      var direct = new Date(raw).getTime();
	      if (!isNaN(direct)) return direct;
	      var normalized = raw.replace(' ', 'T');
	      var normalizedMs = new Date(normalized).getTime();
	      if (!isNaN(normalizedMs)) return normalizedMs;
	      var m = raw.match(/^(\\d{4})-(\\d{2})-(\\d{2})[ T](\\d{2}):(\\d{2})(?::(\\d{2}))?/);
	      if (!m) return NaN;
	      return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]), Number(m[4]), Number(m[5]), Number(m[6] || 0)).getTime();
	    }
	    function formatDisplayTs(value) {
	      if (!value) return '\u2014';
	      var dt = new Date(value);
      if (isNaN(dt.getTime())) {
        var text = String(value || '');
        return text ? text.replace('T', ' ').substring(0, 16) : '\u2014';
      }
      try {
        var parts = new Intl.DateTimeFormat('en-CA', {
          timeZone: BOOT.appTimeZone || 'UTC',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false
        }).formatToParts(dt);
        var map = {};
        parts.forEach(function(part) {
          if (part.type !== 'literal') map[part.type] = part.value;
        });
        return (map.year || '0000') + '-' + (map.month || '00') + '-' + (map.day || '00') + ' ' + (map.hour || '00') + ':' + (map.minute || '00');
      } catch (err) {
        return dt.toISOString().replace('T', ' ').substring(0, 16);
      }
    }
    function formatPrototypeFidelityLabel_(value) {
      var normalized = String(value || '').trim().toLowerCase();
      if (normalized === 'low' || normalized === 'lo-fi') return 'Lo fi Prototype';
      if (normalized === 'hi' || normalized === 'hi-fi') return 'Hi fi Prototype';
      if (normalized === 'final' || normalized === 'final-product' || normalized === 'final_product') return 'Final Product';
      if (normalized === 'na') return 'N/A';
      return '';
    }
    function sourcePill(source) {
      return source === 'other'
        ? '<span class="pill pill-source-special" title="Special Request">SPECIAL REQUEST</span>'
        : '<span class="pill pill-source-dt" title="DT Student Project">DT PROJECT</span>';
    }
    function prototypePill(value) {
      var normalized = String(value || '').trim().toLowerCase();
      if (normalized === 'low' || normalized === 'lo-fi') {
        return '<span class="pill pill-prototype-low" title="Prototype Type">LO FI</span>';
      }
      if (normalized === 'hi' || normalized === 'hi-fi') {
        return '<span class="pill pill-prototype-hi" title="Prototype Type">HI FI</span>';
      }
      if (normalized === 'final' || normalized === 'final-product' || normalized === 'final_product') {
        return '<span class="pill pill-prototype-final" title="Prototype Type">FINAL</span>';
      }
      if (normalized === 'na') {
        return '<span class="pill pill-prototype-na" title="Prototype Type">N/A</span>';
      }
      return '';
    }
    function normalizeClassNoClient_(value) {
      return String(value || '').trim().toLowerCase().replace(/\s+/g, '');
    }
	    function compareSubmissionControlsClient_(a, b) {
	      var aActive = String(a.active || '').toLowerCase() === 'false' ? 0 : 1;
	      var bActive = String(b.active || '').toLowerCase() === 'false' ? 0 : 1;
      if (bActive !== aActive) return bActive - aActive;
      var aSpecific = normalizeClassNoClient_(a.class_no) ? 1 : 0;
      var bSpecific = normalizeClassNoClient_(b.class_no) ? 1 : 0;
	      if (bSpecific !== aSpecific) return bSpecific - aSpecific;
	      return new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime();
	    }
	    function getStudentDeadlineSummaryItems_() {
	      var seen = {};
	      return (BOOT.submissionControls || [])
	        .filter(function(row) {
	          return String(row.active || '').toLowerCase() !== 'false' && row.deadline_at && String(row.is_closed || '').toLowerCase() !== 'true';
	        })
	        .sort(function(a, b) {
	          var at = parseDisplayDateMs_(a.deadline_at);
	          var bt = parseDisplayDateMs_(b.deadline_at);
	          if (!isNaN(at) && !isNaN(bt) && at !== bt) return at - bt;
	          return compareSubmissionControlsClient_(a, b);
	        })
	        .filter(function(row) {
	          var key = String(row.year_group || '').trim().toUpperCase() + '|' + normalizeClassNoClient_(row.class_no);
	          if (!key || key === '|') return false;
	          if (seen[key]) return false;
	          seen[key] = true;
	          return true;
	        })
	        .slice(0, 6)
	        .map(function(row) {
	          var cls = String(row.class_no || '').trim();
	          return {
	            scope: String(row.year_group || '').trim().toUpperCase() + (cls ? ' Class ' + cls : ' all classes'),
	            deadline: formatDisplayTs(row.deadline_at),
	            passed: parseDisplayDateMs_(row.deadline_at) < Date.now()
	          };
	        });
	    }
	    function renderStudentDeadlineSummaryHtml_(title) {
	      var items = getStudentDeadlineSummaryItems_();
	      if (!items.length) return '';
	      return '<div class="deadline-summary-panel"><strong>' + esc(title || 'Current DT submission deadlines') + '</strong>' +
	        '<div class="deadline-summary-list">' +
	          items.map(function(item) {
	            return '<div class="deadline-summary-item"><span>' + esc(item.scope) + '</span><span>' + esc(item.deadline) + (item.passed ? ' passed' : '') + '</span></div>';
	          }).join('') +
	        '</div><span class="deadline-summary-note">These deadlines apply to DT submissions, including Laser Cut and 3D Print. Check your selected Year Group and Class before submitting.</span></div>';
	    }
	    function renderSubmitDeadlineSummary_() {
	      var el = document.getElementById('submissionDeadlineSummary');
	      if (!el) return;
	      var html = renderStudentDeadlineSummaryHtml_('Important DT submission deadlines');
	      el.innerHTML = html;
	      el.style.display = html ? 'block' : 'none';
	    }
	    function getSubmissionControlDecisionClient_(yearGroup, classNo) {
      var targetYear = String(yearGroup || '').trim().toUpperCase();
      var requestedClass = String(classNo || '').trim();
	      var targetClass = normalizeClassNoClient_(requestedClass);
	      if (!targetYear) return { blocked: false, status: 'open', message: '', scope_label: '', deadline_text: '' };

      var controls = (BOOT.submissionControls || []).filter(function(row) {
        if (String(row.active || '').toLowerCase() === 'false') return false;
        if (String(row.year_group || '').trim().toUpperCase() !== targetYear) return false;
        var controlClass = normalizeClassNoClient_(row.class_no);
        return !controlClass || controlClass === targetClass;
      }).sort(compareSubmissionControlsClient_);

	      var fallbackScope = targetYear + (requestedClass ? ' Class ' + requestedClass : '');
	      if (!controls.length) return { blocked: false, status: 'open', message: '', scope_label: fallbackScope, deadline_text: '' };

      var matched = controls[0];
      var matchedClass = String(matched.class_no || '').trim();
      var scopeLabel = String(matched.year_group || '').trim().toUpperCase() + (matchedClass ? ' Class ' + matchedClass : '');
      var deadlineText = matched.deadline_at ? formatDisplayTs(matched.deadline_at) : '';
      var customMessage = String(matched.message || '').trim();

      if (String(matched.is_closed || '').toLowerCase() === 'true') {
        return {
          blocked: true,
          status: 'closed',
	          message: customMessage || ('Submissions for ' + scopeLabel + ' are currently closed. Please speak to your teacher or the technician team.'),
	          scope_label: scopeLabel,
	          deadline_at: matched.deadline_at || '',
	          deadline_text: deadlineText
	        };
	      }

	      var deadlineMs = matched.deadline_at ? parseDisplayDateMs_(matched.deadline_at) : NaN;
	      if (!isNaN(deadlineMs) && deadlineMs < Date.now()) {
	        return {
	          blocked: true,
	          status: 'deadline_passed',
	          message: customMessage || ('The submission deadline for ' + scopeLabel + ' passed on ' + deadlineText + '. Please speak to your teacher if you need an exception.'),
	          scope_label: scopeLabel,
	          deadline_at: matched.deadline_at || '',
	          deadline_text: deadlineText
	        };
	      }

      return {
	        blocked: false,
	        status: matched.deadline_at ? 'deadline_set' : 'open',
	        message: customMessage || (deadlineText ? ('Submission deadline for ' + scopeLabel + ': ' + deadlineText + '.') : ''),
	        scope_label: scopeLabel,
	        deadline_at: matched.deadline_at || '',
	        deadline_text: deadlineText
	      };
	    }
	    function renderSubmissionControlNotice_(el, decision) {
	      if (!el) return;
	      if (!decision || (!decision.message && !decision.blocked)) {
	        el.style.display = 'none';
	        el.innerHTML = '';
	        el.setAttribute('role', 'status');
	        el.setAttribute('aria-live', 'polite');
	        return;
	      }
	      var isDeadlinePassed = decision.status === 'deadline_passed';
	      var isClosed = decision.status === 'closed';
	      var icon = decision.blocked ? '&#128274;' : '&#9200;';
	      var cls = decision.blocked ? 'alert alert-error submission-deadline-notice' : 'alert alert-info submission-deadline-notice';
	      var title = isClosed
	        ? 'Submissions closed for this class'
	        : (isDeadlinePassed ? 'Submission deadline has passed' : 'Submission deadline');
	      var scope = decision.scope_label ? '<span class="submission-deadline-pill">' + esc(decision.scope_label) + '</span>' : '';
	      var deadline = decision.deadline_text ? '<span class="submission-deadline-pill">Deadline: ' + esc(decision.deadline_text) + '</span>' : '';
	      el.className = cls;
	      el.setAttribute('role', decision.blocked ? 'alert' : 'status');
	      el.setAttribute('aria-live', decision.blocked ? 'assertive' : 'polite');
	      el.innerHTML = '<span class="alert-icon">' + icon + '</span><span class="submission-deadline-body"><span class="submission-deadline-title">' + esc(title) + '</span><span class="submission-deadline-message">' + esc(decision.message) + '</span><span class="submission-deadline-meta">' + scope + deadline + '</span></span>';
	      el.style.display = 'flex';
	    }
	    function syncSubmissionControls_(controls) {
	      BOOT.submissionControls = controls || [];
	      renderSubmitDeadlineSummary_();
	    }
    function activityPill(activity) {
      activity = activity || {};
      var counts = activity.counts || {};
      var total = Number(counts.total || 0);
      var last24 = Number(activity.last24_count || 0);
      if (total >= 3) return '<span class="pill pill-repeat-strong">' + total + ' TODAY</span><div class="sub">' + last24 + ' in last 24h</div>';
      if (total === 2) return '<span class="pill pill-repeat">2 TODAY</span><div class="sub">' + last24 + ' in last 24h</div>';
      if (last24 > 1) return '<span class="sub">1 today</span><div class="sub">' + last24 + ' in last 24h</div>';
      return '<span class="sub">No repeat flag</span>';
    }
    function renderRecentActivity(activity) {
      activity = activity || {};
      if (!activity.recent || !activity.recent.length) return '';
      return '<ul class="drawer-list">' + activity.recent.map(function(item) {
        return '<li><strong>' + esc(item.label || (item.source === 'other' ? 'Special Request' : 'DT Student Project')) + '</strong> &mdash; ' + esc(formatDisplayTs(item.created_at)) + '</li>';
      }).join('') + '</ul>';
    }
    function queueTimeMeta(value) {
      if (!value) return '';
      var ts = new Date(value);
      if (isNaN(ts.getTime())) return '';
      var diffMins = Math.max(0, Math.round((Date.now() - ts.getTime()) / 60000));
      if (diffMins < 1) return 'just now';
      if (diffMins < 60) return diffMins + 'm ago';
      var diffHours = Math.round(diffMins / 60);
      if (diffHours < 24) return diffHours + 'h ago';
      var diffDays = Math.round(diffHours / 24);
      return diffDays + 'd ago';
    }
    function queueRowStateClass(status) {
      var s = String(status || '');
      if (s === 'completed') return 'queue-row--completed';
      if (s === 'rejected') return 'queue-row--rejected';
      if (s === 'needs_fix') return 'queue-row--active queue-row--needs-fix';
      if (s === 'submitted') return 'queue-row--active queue-row--submitted';
      if (s === 'approved') return 'queue-row--active queue-row--approved';
      if (s === 'in_queue') return 'queue-row--active queue-row--in-queue';
      if (s === 'in_production') return 'queue-row--active queue-row--in-production';
      return 'queue-row--active';
    }
    function queueSourceClass(source) {
      return source === 'other' ? 'queue-row--other' : 'queue-row--dt';
    }
    function queueAttentionClass(row) {
      var activity = row && row._activity ? row._activity : {};
      var total = Number((activity.counts || {}).total || 0);
      if (row && (row.status === 'submitted' || row.status === 'needs_fix' || total >= 3)) return 'queue-row--attention';
      return '';
    }
    function queueStatusNote(row) {
      if (!row) return '';
      if (row.status === 'submitted') return 'Awaiting first review';
      if (row.status === 'needs_fix') return 'Check latest correction';
      if (row.status === 'completed') return 'Collection / handover';
      if (row.status === 'rejected') return 'Review remarks if needed';
      return '';
    }
    function queueRiskBlock(activity) {
      activity = activity || {};
      var counts = activity.counts || {};
      var total = Number(counts.total || 0);
      var last24 = Number(activity.last24_count || 0);
      if (total >= 3) {
        return '<div class="queue-risk-stack"><span class="queue-risk-pill queue-risk-pill--high" title="Multiple same-day submissions">Burst today</span><span class="queue-risk-note">' + total + ' today · ' + last24 + ' in 24h</span></div>';
      }
      if (total === 2) {
        return '<div class="queue-risk-stack"><span class="queue-risk-pill queue-risk-pill--warn">Repeated today</span><span class="queue-risk-note">2 today · ' + last24 + ' in 24h</span></div>';
      }
      if (last24 > 1) {
        return '<div class="queue-risk-stack"><span class="queue-risk-pill queue-risk-pill--soft">Recent activity</span><span class="queue-risk-note">' + last24 + ' in last 24h</span></div>';
      }
      return '<div class="queue-risk-stack"><span class="queue-risk-pill queue-risk-pill--ok">Single submission</span></div>';
    }
    function queueReviewButtonClass(row) {
      if (!row) return 'btn btn-primary btn-sm';
      if (row.status === 'completed' || row.status === 'rejected') return 'btn btn-ghost btn-sm queue-review-btn queue-review-btn--quiet';
      if (row.status === 'submitted' || row.status === 'needs_fix') return 'btn btn-primary btn-sm queue-review-btn queue-review-btn--strong';
      return 'btn btn-primary btn-sm queue-review-btn';
    }

    var _activeQueueLane = '';
    function setText_(id, text) {
      var el = document.getElementById(id);
      if (el) el.textContent = text;
    }
    function setInsightTone_(id, tone) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.remove('admin-insight--attention', 'admin-insight--ok');
      if (tone) el.classList.add(tone);
    }
    function isActiveStatus_(status) {
      return ['completed','rejected'].indexOf(String(status || '')) === -1;
    }
    function isReviewStatus_(status) {
      return ['submitted','needs_fix'].indexOf(String(status || '')) !== -1;
    }
    function isQueueWorkloadStatus_(status) {
      return ['submitted','approved','in_queue','in_production'].indexOf(String(status || '')) !== -1;
    }
    function isProductionStatus_(status) {
      return ['approved','in_queue','in_production'].indexOf(String(status || '')) !== -1;
    }
    function countRows_(rows, predicate) {
      var count = 0;
      (rows || []).forEach(function(row) { if (predicate(row)) count++; });
      return count;
    }
    function statusPriority_(status) {
      var order = { submitted: 0, needs_fix: 1, approved: 2, in_queue: 3, in_production: 4, completed: 5, rejected: 6 };
      return Object.prototype.hasOwnProperty.call(order, status) ? order[status] : 9;
    }
    function rowTime_(row, field) {
      var dt = new Date((row || {})[field] || '');
      return isNaN(dt.getTime()) ? 0 : dt.getTime();
    }
    function rowSheetOrder_(row) {
      return Number((row || {})._row_number || 0);
    }
    function requestCasePrefix_(row) {
      row = row || {};
      var source = String(row._source || '').trim().toLowerCase();
      if (source === 'other' || source === 'special' || source === 'special_request') return 'A';
      if (row.request_id || row.requester_email || row.requester_name || row.project_name || row.request_type) return 'A';
      return 'M';
    }
    function requestCaseNumber_(row) {
      row = row || {};
      var prefix = requestCasePrefix_(row);
      var existing = String(row.case_number || row._case_number || '').trim();
      if (/^[AM]\d{3,}$/i.test(existing)) {
        var normalized = existing.toUpperCase();
        var digits = normalized.replace(/\D/g, '');
        return normalized.charAt(0) === prefix ? normalized : prefix + digits.padStart(3, '0');
      }
      var n = Number(row._row_number || 0);
      if (n > 1) n = n - 1;
      if (!n || !isFinite(n)) return prefix + '---';
      return prefix + String(Math.max(1, Math.floor(n))).padStart(3, '0');
    }
    function compareLatestRows_(a, b) {
      var ta = rowTime_(a, 'created_at');
      var tb = rowTime_(b, 'created_at');
      if (ta !== tb) return tb - ta;
      var sa = rowSheetOrder_(a);
      var sb = rowSheetOrder_(b);
      if (sa !== sb) return sb - sa;
      return String(b.submission_id || b.request_id || '').localeCompare(String(a.submission_id || a.request_id || ''));
    }
    function compareNewestTime_(a, b) {
      var ta = rowTime_(a, 'created_at');
      var tb = rowTime_(b, 'created_at');
      if (ta !== tb) return tb - ta;
      return rowSheetOrder_(b) - rowSheetOrder_(a);
    }
    function requesterName_(row) {
      return String(row.requester_name || row.student_name || row.project_name || row.student_email || '').toLowerCase();
    }
    function rowSearchText_(row) {
      var values = [
        requestCaseNumber_(row), row.submission_id, row.request_id, row.student_name, row.student_email, row.requester_name, row.requester_email,
        row.design_teacher, row.teacher_in_charge, row.department_or_subject, row.design_class_no, row['class'],
        row.year_group, row.machine, MACHINE_LABELS[row.machine], row.material, row.project_name, row.project_purpose,
        row.request_type, row.status, STATUS_LABELS[row.status], row.admin_remarks, row.issue_label
      ];
      return values.map(function(v) { return String(v || '').toLowerCase(); }).join(' ');
    }
    function rowMatchesQuick_(row, query) {
      var text = rowSearchText_(row);
      return String(query || '').toLowerCase().split(/\s+/).filter(Boolean).every(function(token) {
        return text.indexOf(token) !== -1;
      });
    }
    function rowMatchesLane_(row, lane) {
      if (!lane) return true;
      if (lane === 'review') return row.status === 'submitted';
      if (lane === 'waiting_student') return row.status === 'needs_fix';
      if (lane === 'ready') return row.status === 'approved' || row.status === 'in_queue';
      if (lane === 'inprod') return row.status === 'in_production';
      if (lane === 'production') return isProductionStatus_(row.status);
      if (lane === 'done') return !isActiveStatus_(row.status);
      if (lane === 'special') return row._source === 'other';
      if (lane === 'laser') return row.machine === 'laser';
      if (lane === '3d') return row.machine === '3d';
      return true;
    }
    function sortQueueRows_(rows, mode) {
      var list = (rows || []).slice();
      mode = mode || 'newest';
      list.sort(function(a, b) {
        if (mode === 'name') return requesterName_(a).localeCompare(requesterName_(b));
        if (mode === 'oldest') return (rowTime_(a, 'created_at') - rowTime_(b, 'created_at')) || (rowSheetOrder_(a) - rowSheetOrder_(b));
        if (mode === 'updated') return rowTime_(b, 'updated_at') - rowTime_(a, 'updated_at');
        if (mode === 'newest') return compareLatestRows_(a, b);
        if (mode === 'time_newest') return compareNewestTime_(a, b);
        var pa = statusPriority_(a.status), pb = statusPriority_(b.status);
        if (pa !== pb) return pa - pb;
        return compareLatestRows_(a, b);
      });
      return list;
    }
    function formatOldestAge_(row) {
      if (!row) return '\u2014';
      var created = rowTime_(row, 'created_at');
      if (!created) return '\u2014';
      return queueTimeMeta(row.created_at) || '\u2014';
    }
    function refreshAdminInsights_(rows, totalLoaded) {
      rows = rows || [];
      var active = countRows_(rows, function(r) { return isActiveStatus_(r.status); });
      var review = countRows_(rows, function(r) { return r.status === 'submitted'; });
      var production = countRows_(rows, function(r) { return isProductionStatus_(r.status); });
      var queueWorkload = countRows_(rows, function(r) { return isQueueWorkloadStatus_(r.status); });
      var waitingStudent = countRows_(rows, function(r) { return r.status === 'needs_fix'; });
      var special = countRows_(rows, function(r) { return r._source === 'other'; });
      var laser = countRows_(rows, function(r) { return r.machine === 'laser'; });
      var print3d = countRows_(rows, function(r) { return r.machine === '3d'; });
      var repeat = countRows_(rows, function(r) {
        var a = r._activity || {};
        var total = Number((a.counts || {}).total || 0);
        return total >= 2 || Number(a.last24_count || 0) >= 2;
      });
      var activeRows = rows.filter(function(r) { return isActiveStatus_(r.status); }).sort(function(a, b) {
        return rowTime_(a, 'created_at') - rowTime_(b, 'created_at');
      });
      var oldest = activeRows[0] || null;

      setText_('insightActive', String(active));
      setText_('insightReview', String(review));
      setText_('insightProduction', String(production));
      setText_('insightOldest', formatOldestAge_(oldest));
      setText_('insightSpecial', String(special));
      setText_('insightLaser', String(laser));
      setText_('insight3d', String(print3d));
      setText_('insightRepeat', String(repeat));
      setText_('insightActiveNote', totalLoaded && totalLoaded !== rows.length ? rows.length + ' visible from ' + totalLoaded + ' loaded' : 'Visible active workload');
      setText_('insightReviewNote', review ? 'Start here before production' : 'No immediate review blockers');
      setText_('insightProductionNote', production ? 'Ready for machine scheduling' : 'No approved production work visible');
      setText_('insightOldestNote', oldest ? ((oldest.student_name || oldest.requester_name || oldest.project_name || 'Active job') + ' - ' + (STATUS_LABELS[oldest.status] || oldest.status)) : 'No active items visible');
      setText_('insightSpecialNote', special ? 'Check sponsor and deadline context' : 'No visible special requests');
      setText_('insightLaserNote', laser ? 'Sheet fabrication workload' : 'No visible laser jobs');
      setText_('insight3dNote', print3d ? 'Print queue workload' : 'No visible 3D print jobs');
      setText_('insightRepeatNote', repeat ? 'Review for duplicates or resubmits' : 'No repeat activity visible');

      setInsightTone_('insightCardReview', review ? 'admin-insight--attention' : 'admin-insight--ok');
      setInsightTone_('insightCardRepeat', repeat ? 'admin-insight--attention' : 'admin-insight--ok');
      setInsightTone_('insightCardOldest', active ? '' : 'admin-insight--ok');

      var queueState = queueLoadState_(queueWorkload);
      var fill = queueLoadPct_(queueWorkload);
      var pill = queueState.label;
      var text = queueWorkload > QUEUE_HEAVY_THRESHOLD
        ? 'Heavy queue. More than ' + QUEUE_HEAVY_THRESHOLD + ' active jobs are waiting across review, approved, queue, and production states.'
        : queueWorkload >= QUEUE_BUSY_THRESHOLD
          ? 'Busy queue. Active workload is at or above ' + QUEUE_BUSY_THRESHOLD + ' jobs; use lanes to separate review, production-ready, and waiting-on-student items.'
          : 'Queue pressure is below the busy threshold. Submitted and approved jobs are still counted as active queue workload.';
      setText_('adminHealthPill', pill);
      setText_('adminHealthText', text);
      setText_('healthReview', String(queueWorkload));
      setText_('healthProduction', String(production));
      setText_('healthStudentWait', String(waitingStudent));
      setText_('healthRepeat', String(repeat));
      var healthFill = document.getElementById('adminHealthFill');
      if (healthFill) healthFill.style.width = fill + '%';
    }
    function updateQueueSummary_(rows, totalLoaded, filters) {
      var parts = [];
      var laneLabels = {
        review: 'Review Now',
        waiting_student: 'Waiting on Student',
        ready: 'Ready for Production',
        inprod: 'In Production',
        production: 'Production',
        special: 'Special Requests',
        laser: 'Laser',
        '3d': '3D Print',
        done: 'Done / Rejected'
      };
      parts.push(rows.length + ' visible');
      if (totalLoaded !== rows.length) parts.push(totalLoaded + ' loaded before client filters');
      if (_activeQueueLane) parts.push('lane: ' + (laneLabels[_activeQueueLane] || _activeQueueLane));
      if (filters.year_groups && filters.year_groups.length) parts.push('year: ' + filters.year_groups.join(', '));
      if (filters.machines && filters.machines.length) parts.push('machine: ' + filters.machines.map(function(m) { return MACHINE_LABELS[m] || m; }).join(', '));
      if (filters.materials && filters.materials.length) parts.push('material: ' + filters.materials.join(', '));
      if (filters.statuses && filters.statuses.length) parts.push('status: ' + filters.statuses.map(function(s) { return STATUS_LABELS[s] || s; }).join(', '));
      if (filters.case_query) parts.push('case: ' + filters.case_query);
      if (filters.teacher_query) parts.push('teacher: ' + filters.teacher_query);
      if (filters.class_no) parts.push('class: ' + filters.class_no);
      if (filters.quick) parts.push('search: "' + filters.quick + '"');
      setText_('queueSummaryLine', parts.join(' | '));
    }
    function getCheckboxFilterValues_(id) {
      return Array.prototype.slice.call(document.querySelectorAll('[data-filter-group="' + id + '"] input[type=checkbox]:checked'))
        .map(function(input) { return String(input.value || '').trim(); })
        .filter(Boolean);
    }
    function setCheckboxFilterValues_(id, values) {
      values = values || [];
      var selected = {};
      values.forEach(function(v) { selected[String(v)] = true; });
      document.querySelectorAll('[data-filter-group="' + id + '"] input[type=checkbox]').forEach(function(input) {
        input.checked = !!selected[String(input.value || '')];
      });
      updateCheckboxFilterSummary_(id);
    }
    function updateCheckboxFilterSummary_(id) {
      var summary = document.getElementById(id + 'Summary');
      if (!summary) return;
      var checked = Array.prototype.slice.call(document.querySelectorAll('[data-filter-group="' + id + '"] input[type=checkbox]:checked'));
      if (!checked.length) {
        summary.textContent = 'All';
      } else if (checked.length <= 2) {
        summary.textContent = checked.map(function(input) {
          var label = input.closest('label');
          return label ? String(label.textContent || '').trim() : String(input.value || '');
        }).join(', ');
      } else {
        summary.textContent = checked.length + ' selected';
      }
    }
    function closeCheckboxFilter_(id) {
      var panel = document.getElementById(id + 'Panel');
      if (panel) panel.open = false;
    }
    function closeAllCheckboxFilters_() {
      document.querySelectorAll('.filter-check[open]').forEach(function(panel) {
        panel.open = false;
      });
    }
    function closeOtherCheckboxFilters_(id) {
      document.querySelectorAll('.filter-check[id$="Panel"]').forEach(function(panel) {
        if (panel.id !== id + 'Panel') panel.open = false;
      });
    }
    function initCheckboxFilter_(id) {
      updateCheckboxFilterSummary_(id);
      var panel = document.getElementById(id + 'Panel');
      if (panel && panel.dataset.filterPanelInit !== 'true') {
        panel.dataset.filterPanelInit = 'true';
        panel.addEventListener('toggle', function() {
          if (panel.open) closeOtherCheckboxFilters_(id);
        });
      }
      document.querySelectorAll('[data-filter-group="' + id + '"] input[type=checkbox]').forEach(function(input) {
        if (input.dataset.filterInit === 'true') return;
        input.dataset.filterInit = 'true';
        input.addEventListener('change', function() {
          _activeQueueLane = '';
          updateCheckboxFilterSummary_(id);
          updateLaneActive_();
          updateStatActive_();
          loadAdminRows();
          window.setTimeout(function() { closeCheckboxFilter_(id); }, 80);
        });
      });
    }
    function rowTeacherValues_(row) {
      return [
        row.design_teacher,
        row.teacher_in_charge
      ].map(function(v) { return String(v || '').trim(); }).filter(Boolean);
    }
    function populateTeacherFilter_(rows, selected) {
      var sel = document.getElementById('filterTeacher');
      if (!sel) return;
      selected = String(selected || sel.value || '').trim();
      if (selected.indexOf('@') !== -1) selected = '';
      var map = {};
      (rows || []).forEach(function(row) {
        rowTeacherValues_(row).forEach(function(value) {
          var key = value.toLowerCase();
          if (key && !map[key]) map[key] = value;
        });
      });
      var options = Object.keys(map).sort(function(a, b) { return map[a].localeCompare(map[b]); })
        .map(function(key) { return '<option value="' + esc(map[key]) + '">' + esc(map[key]) + '</option>'; });
      if (selected && !map[selected.toLowerCase()]) options.unshift('<option value="' + esc(selected) + '">' + esc(selected) + '</option>');
      sel.innerHTML = '<option value="">All teachers</option>' + options.join('');
      sel.value = selected;
    }
    function populateMaterialFilter_(rows, selectedValues) {
      selectedValues = selectedValues || [];
      var menu = document.querySelector('[data-filter-group="filterMaterial"]');
      if (!menu) return;
      var map = {};
      (rows || []).forEach(function(row) {
        var material = String((row && row.material) || '').trim();
        if (!material || material === '\u2014') return;
        var key = material.toLowerCase();
        if (!map[key]) map[key] = material;
      });
      var selectedMap = {};
      selectedValues.forEach(function(value) {
        var material = String(value || '').trim();
        if (material) selectedMap[material.toLowerCase()] = material;
      });
      Object.keys(selectedMap).forEach(function(key) {
        if (!map[key]) map[key] = selectedMap[key];
      });
      var html = Object.keys(map).sort(function(a, b) { return map[a].localeCompare(map[b]); }).map(function(key) {
        var material = map[key];
        var checked = selectedMap[key] ? ' checked' : '';
        return '<label class="filter-check-option"><input type="checkbox" value="' + esc(material) + '"' + checked + '><span>' + esc(material) + '</span></label>';
      }).join('');
      menu.innerHTML = html || '<div class="filter-check-empty">No material data loaded</div>';
      initCheckboxFilter_('filterMaterial');
    }
    function arrayHas_(list, value) {
      return !list || !list.length || list.indexOf(String(value || '').trim()) !== -1;
    }
    function rowMatchesCaseQuery_(row, query) {
      query = String(query || '').trim().toUpperCase().replace(/\s+/g, '');
      if (!query) return true;
      var caseNo = requestCaseNumber_(row).toUpperCase();
      if (caseNo.indexOf(query) !== -1) return true;
      var prefixed = query.match(/^([AM])(\d+)$/);
      if (prefixed) return caseNo === (prefixed[1] + prefixed[2].padStart(3, '0'));
      var digits = query.replace(/\D/g, '');
      if (!digits) return false;
      var padded = requestCasePrefix_(row) + digits.padStart(3, '0');
      return caseNo === padded || caseNo.replace(/\D/g, '') === digits.padStart(3, '0');
    }
    function rowMatchesAdminFilters_(row, filters) {
      if (!rowMatchesCaseQuery_(row, filters.case_query)) return false;
      if (!arrayHas_(filters.year_groups, row.year_group)) return false;
      if (!arrayHas_(filters.machines, row.machine)) return false;
      if (!arrayHas_(filters.materials, row.material)) return false;
      if (!arrayHas_(filters.statuses, row.status)) return false;
      if (filters.teacher_query) {
        var targetTeacher = String(filters.teacher_query || '').trim().toLowerCase();
        var teacherMatch = rowTeacherValues_(row).some(function(value) {
          return value.toLowerCase() === targetTeacher;
        });
        if (!teacherMatch) return false;
      }
      if (filters.class_no) {
        var classQuery = String(filters.class_no || '').trim().toLowerCase();
        var classText = String(row.design_class_no || row['class'] || '').trim().toLowerCase();
        if (classText.indexOf(classQuery) === -1) return false;
      }
      if (filters.student_email) {
        var emailQuery = String(filters.student_email || '').trim().toLowerCase();
        var emailText = String(row.student_email || row.requester_email || '').trim().toLowerCase();
        if (emailText.indexOf(emailQuery) === -1) return false;
      }
      return true;
    }
    function updateStatActive_() {
      var statuses = getCheckboxFilterValues_('filterStatus');
      document.querySelectorAll('.stat-card[data-status]').forEach(function(card) {
        var status = String(card.getAttribute('data-status') || '');
        card.classList.toggle('active', status ? statuses.indexOf(status) !== -1 : !statuses.length);
      });
    }
    function updateLaneActive_() {
      document.querySelectorAll('.lane-btn[data-lane]').forEach(function(btn) {
        btn.classList.toggle('active', String(btn.getAttribute('data-lane') || '') === _activeQueueLane);
      });
    }
    function setQueueLane(lane) {
      _activeQueueLane = lane || '';
      var source = document.getElementById('filterSource');
      if (source) source.value = _activeQueueLane === 'special' ? 'other' : '';
      setCheckboxFilterValues_('filterMachine', _activeQueueLane === 'laser' ? ['laser'] : (_activeQueueLane === '3d' ? ['3d'] : []));
      if (_activeQueueLane === 'review') setCheckboxFilterValues_('filterStatus', ['submitted']);
      else if (_activeQueueLane === 'waiting_student') setCheckboxFilterValues_('filterStatus', ['needs_fix']);
      else if (_activeQueueLane === 'ready') setCheckboxFilterValues_('filterStatus', ['approved', 'in_queue']);
      else if (_activeQueueLane === 'inprod') setCheckboxFilterValues_('filterStatus', ['in_production']);
      else if (_activeQueueLane === 'done') setCheckboxFilterValues_('filterStatus', ['completed', 'rejected']);
      else setCheckboxFilterValues_('filterStatus', []);
      updateLaneActive_();
      updateStatActive_();
      loadAdminRows();
    }
    function clearAdminFilters_() {
      _activeQueueLane = '';
      document.querySelectorAll('.filter-bar select').forEach(function(el) { el.value = ''; });
      document.querySelectorAll('.filter-bar input[type=text]').forEach(function(el) { el.value = ''; });
      var caseEl = document.getElementById('filterCaseNo');
      if (caseEl) caseEl.value = '';
      ['filterYear','filterMachine','filterMaterial','filterStatus'].forEach(function(id) { setCheckboxFilterValues_(id, []); });
      var sort = document.getElementById('filterSort');
      if (sort) sort.value = 'newest';
      var mine = document.getElementById('filterMineOnly');
      if (mine) mine.checked = BOOT.currentUser.role === 'teacher';
      updateLaneActive_();
      updateStatActive_();
      loadAdminRows();
    }

    /* ---------- NAV ---------- */
    var _pages = ['submit','other','status','queue','teacherbeta','admin','machines','help','rules','users','audit'];
    var _adminPages = ['admin','rules','users','audit'];
    var _systemAdminPages = ['rules','users','audit'];
    var _teacherBetaPages = ['teacherbeta'];
    var _init = {};
    function refreshOverlayLock_() {
      var emailOverlay = document.getElementById('emailOverlay');
      var laserOverlay = document.getElementById('laserCapacityOverlay');
      var drawerOverlay = document.getElementById('reviewDrawer');
      var drawerOpen = drawerOverlay && drawerOverlay.classList.contains('show');
      document.body.classList.toggle('modal-open', !!emailOverlay || !!laserOverlay || !!drawerOpen);
    }
    function closeTransientPanels_() {
      var emailOverlay = document.getElementById('emailOverlay');
      if (emailOverlay) emailOverlay.remove();
      var laserOverlay = document.getElementById('laserCapacityOverlay');
      if (laserOverlay) laserOverlay.remove();
      var drawerOverlay = document.getElementById('reviewDrawer');
      if (drawerOverlay) drawerOverlay.classList.remove('show');
      refreshOverlayLock_();
    }
    function focusActiveNav_(p) {
      var nav = document.getElementById('nav-' + p);
      if (nav && nav.scrollIntoView) {
        try { nav.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' }); } catch(e) {}
      }
    }
    function enhanceClickableCards_() {
      document.querySelectorAll('.stat-card[onclick]').forEach(function(card) {
        if (card.dataset.keyboardBound === '1') return;
        card.dataset.keyboardBound = '1';
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            card.click();
          }
        });
      });
    }
    function switchPage(p) {
      if (_systemAdminPages.indexOf(p) !== -1 && BOOT.currentUser.role !== 'admin') {
        showToast('Only system admins can use that page.','error');
        p = BOOT.currentUser.isAdmin ? 'admin' : 'submit';
      }
      if (_teacherBetaPages.indexOf(p) !== -1 && BOOT.currentUser.role !== 'teacher' && BOOT.currentUser.role !== 'admin') {
        showToast('Class is available to teacher accounts only.','error');
        p = BOOT.currentUser.isAdmin ? 'admin' : 'submit';
      }
      /* Role guard: block students/guests from admin-only pages */
      if (!BOOT.currentUser.isAdmin && _adminPages.indexOf(p) !== -1) {
        showToast('You do not have permission to view that page.','error');
        return;
      }
      closeTransientPanels_();
      _pages.forEach(function(n) {
        var el = document.getElementById('page-' + n);
        var nav = document.getElementById('nav-' + n);
        if (el) el.style.display = (n === p ? 'block' : 'none');
        if (nav) nav.classList.toggle('active', n === p);
      });
      if (!_init[p]) { _init[p] = true; initPage(p); }
      try { if (history && history.replaceState) history.replaceState({}, '', '?page=' + p); } catch(e) {}
      focusActiveNav_(p);
      if (window.scrollY > 12) window.scrollTo({ top: 0, behavior: 'smooth' });
      enhanceClickableCards_();
    }
    function initPage(p) {
      if (p === 'submit') initSubmitPage();
      if (p === 'other')  initOtherPage();
      if (p === 'status') initStatusPage();
      if (p === 'queue')  initQueuePage();
      if (p === 'teacherbeta') initTeacherBetaPage();
      if (p === 'admin')  initAdminPage();
      if (p === 'rules')  initRulesPage();
      if (p === 'users')  initUsersPage();
      if (p === 'audit')  initAuditPage();
    }
    function init() {
      _pages.forEach(function(n) {
        var nav = document.getElementById('nav-' + n);
        if (!nav) return;
        nav.addEventListener('click', function(e) { e.preventDefault(); switchPage(n); });
      });
      _init[BOOT.page] = true;
      initPage(BOOT.page);
      focusActiveNav_(BOOT.page);
      enhanceClickableCards_();
      setTimeout(showStudentLaserCapacityNotice_, 300);
    }

    /* ---------- TOAST ---------- */
    function showToast(msg, type) {
      var c = document.getElementById('toastContainer');
      var t = document.createElement('div');
      t.className = 'toast toast-' + (type || 'success');
      t.textContent = msg;
      c.appendChild(t);
      setTimeout(function() { t.remove(); }, 3500);
    }

    function scrollToId_(id) {
      var el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    /* ---------- HELPERS ---------- */
    function setMsg(id, text, cls) {
      var el = document.getElementById(id);
      if (!el) return;
      el.className = 'inline-msg tc-' + (cls||'muted');
      el.textContent = text || '';
    }
    function copySuccessId_(box) {
      var text = box.querySelector('.id-box-text').textContent;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function() {
          showToast('Case number copied!', 'success');
        });
      }
    }
    function resetSubmitForm_() {
      document.getElementById('submitSuccess').style.display = 'none';
      document.getElementById('submitFormWrap').style.display = 'block';
      clearDraftAutosave_('submit');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function esc(str) {
      return String(str||'')
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    }

    /* ---------- CLASS SUBMISSION ---------- */
    var _teacherBetaData = null;
    function initTeacherBetaPage() {
      var classSel = document.getElementById('teacherBetaClass');
      if (!classSel) return;
      var teacherSel = document.getElementById('teacherBetaTeacher');
      if (classSel.dataset.bound !== '1') {
        classSel.dataset.bound = '1';
        classSel.addEventListener('change', function() { loadTeacherBetaStatus_(true); });
        var search = document.getElementById('teacherBetaSearch');
        if (search) search.addEventListener('input', function() { debounce_('teacherBetaSearch', renderTeacherBetaStatus_, 180); });
        var missingOnly = document.getElementById('teacherBetaMissingOnly');
        if (missingOnly) missingOnly.addEventListener('change', renderTeacherBetaStatus_);
      }
      if (teacherSel && teacherSel.dataset.bound !== '1') {
        teacherSel.dataset.bound = '1';
        teacherSel.addEventListener('change', function() {
          updateTeacherBetaClassOptions_();
          loadTeacherBetaStatus_(true);
        });
      }
      updateTeacherBetaClassOptions_();
      if (!_teacherBetaData) loadTeacherBetaStatus_(false);
      else renderTeacherBetaStatus_();
    }

    function loadTeacherBetaStatus_(force) {
      var results = document.getElementById('teacherBetaResults');
      if (!results) return;
      var classNo = ((document.getElementById('teacherBetaClass') || {}).value || '').trim();
      var teacherKey = teacherBetaSelectedTeacher_();
      setTeacherBetaDownloadReady_(false);
      setMsg('teacherBetaMsg', force ? 'Refreshing from spreadsheet...' : 'Loading class submission status...', 'muted');
      results.innerHTML = '<div class="queue-skeleton" aria-label="Loading class submission data"></div>';
      var requestDone = false;
      var timeoutId = setTimeout(function() {
        if (requestDone) return;
        results.innerHTML = '<div class="queue-empty alert alert-warning"><span class="alert-icon">&#9888;</span><span>Class data is taking longer than usual. Try Refresh, or narrow the teacher/class filter and try again.</span></div>';
        setMsg('teacherBetaMsg', 'Still waiting for class status.', 'muted');
      }, 15000);
      google.script.run
        .withSuccessHandler(function(data) {
          requestDone = true;
          clearTimeout(timeoutId);
          _teacherBetaData = data || { classes: [] };
          renderTeacherBetaStatus_();
          var stamp = _teacherBetaData.generated_at ? formatDisplayTs(_teacherBetaData.generated_at) : 'now';
          setMsg('teacherBetaMsg', 'Checked ' + stamp + '.', 'muted');
        })
        .withFailureHandler(function(err) {
          requestDone = true;
          clearTimeout(timeoutId);
          _teacherBetaData = null;
          setTeacherBetaDownloadReady_(false);
          results.innerHTML = '<div class="queue-empty alert alert-error"><span class="alert-icon">&#9888;</span><span>' + esc((err && err.message) || err || 'Could not load class submission data.') + '</span></div>';
          setMsg('teacherBetaMsg', 'Could not load class status.', 'error');
        })
        .getTeacherBetaClassStatus({ class_no: classNo, teacher_key: teacherKey });
    }

    function setTeacherBetaDownloadReady_(ready) {
      var btn = document.getElementById('teacherBetaDownloadBtn');
      if (btn) btn.disabled = false;
    }

    function teacherBetaSelectedTeacher_() {
      return String(((document.getElementById('teacherBetaTeacher') || {}).value || '')).trim().toLowerCase();
    }

    function updateTeacherBetaClassOptions_() {
      var teacherKey = teacherBetaSelectedTeacher_();
      var classSel = document.getElementById('teacherBetaClass');
      if (!classSel) return;
      var selectedIsVisible = !classSel.value;
      Array.prototype.forEach.call(classSel.options || [], function(option, index) {
        if (index === 0) {
          option.hidden = false;
          option.disabled = false;
          return;
        }
        var optionTeacher = String(option.getAttribute('data-teacher-key') || '').trim().toLowerCase();
        var visible = !teacherKey || optionTeacher === teacherKey;
        option.hidden = !visible;
        option.disabled = !visible;
        if (visible && option.value === classSel.value) selectedIsVisible = true;
      });
      if (!selectedIsVisible) classSel.value = '';
    }

    function teacherBetaSearchQuery_() {
      return String(((document.getElementById('teacherBetaSearch') || {}).value || '')).trim().toLowerCase();
    }

    function teacherBetaMissingOnly_() {
      var el = document.getElementById('teacherBetaMissingOnly');
      return !!(el && el.checked);
    }

    function teacherBetaStudentMatches_(student, query, missingOnly) {
      if (missingOnly && student.submitted) return false;
      if (!query) return true;
      var latest = student.latest || {};
      var hay = [
        student.name, student.email, student.homeroom, student.student_no,
        student.action, latest.case_number, latest.status, latest.status_label,
        latest.machine, MACHINE_LABELS[latest.machine] || latest.machine,
        latest.material, latest.prototype_label, latest.design_class_no,
        latest.roster_class_no, latest.class_mismatch ? 'class typo class mismatch' : ''
      ].join(' ').toLowerCase();
      return hay.indexOf(query) !== -1;
    }

    function teacherBetaExtraMatches_(extra, query, missingOnly) {
      if (missingOnly) return false;
      if (!query) return true;
      var hay = [
        extra.student_name, extra.student_email, extra.case_number,
        extra.status, extra.status_label, extra.material
      ].join(' ').toLowerCase();
      return hay.indexOf(query) !== -1;
    }

    function getTeacherBetaVisibleReport_() {
      var query = teacherBetaSearchQuery_();
      var missingOnly = teacherBetaMissingOnly_();
      var visibleClasses = [];
      var totals = { classes: 0, expected: 0, submitted: 0, missing: 0, needs_fix: 0, completed: 0, class_mismatches: 0, extras: 0 };
      (_teacherBetaData.classes || []).forEach(function(cls) {
        var students = (cls.students || []).filter(function(student) {
          return teacherBetaStudentMatches_(student, query, missingOnly);
        });
        var extras = (cls.extra_submissions || []).filter(function(extra) {
          return teacherBetaExtraMatches_(extra, query, missingOnly);
        });
        if (students.length || extras.length || (!query && !missingOnly)) {
          visibleClasses.push({ cls: cls, students: students, extras: extras });
          totals.classes += 1;
          totals.expected += students.length;
          students.forEach(function(student) {
            if (student.submitted) totals.submitted += 1;
            else totals.missing += 1;
            if (student.latest && student.latest.status === 'needs_fix') totals.needs_fix += 1;
            if (student.latest && student.latest.status === 'completed') totals.completed += 1;
            if (student.latest && student.latest.class_mismatch) totals.class_mismatches += 1;
          });
          totals.extras += extras.length;
        }
      });
      return { query: query, missingOnly: missingOnly, visibleClasses: visibleClasses, totals: totals };
    }

    function renderTeacherBetaStatus_() {
      var summaryEl = document.getElementById('teacherBetaSummary');
      var resultsEl = document.getElementById('teacherBetaResults');
      if (!summaryEl || !resultsEl || !_teacherBetaData) return;
      var report = getTeacherBetaVisibleReport_();
      var visibleClasses = report.visibleClasses;
      var totals = report.totals;
      var query = report.query;
      var missingOnly = report.missingOnly;

      summaryEl.innerHTML =
        '<div class="teacher-beta-summary">' +
          teacherBetaStatHtml_(totals.classes, 'Visible classes') +
          teacherBetaStatHtml_(totals.expected, missingOnly || query ? 'Visible students' : 'Roster students') +
          teacherBetaStatHtml_(totals.submitted, 'Submitted') +
          teacherBetaStatHtml_(totals.missing, 'Missing') +
          teacherBetaStatHtml_(totals.needs_fix, 'Needs fix') +
          teacherBetaStatHtml_(totals.completed, 'Completed') +
          teacherBetaStatHtml_(totals.class_mismatches, 'Class typos') +
          teacherBetaStatHtml_(totals.extras, 'Extra records') +
        '</div>';

      if (!visibleClasses.length) {
        setTeacherBetaDownloadReady_(false);
        resultsEl.innerHTML = '<div class="queue-empty alert alert-neutral"><span class="alert-icon">&#128269;</span><span>No students match the current class filters.</span></div>';
        return;
      }
      setTeacherBetaDownloadReady_(true);
      resultsEl.innerHTML = visibleClasses.map(function(item) {
        return renderTeacherBetaClass_(item.cls, item.students, item.extras);
      }).join('');
    }

    function teacherBetaStatHtml_(value, label) {
      return '<div class="teacher-beta-stat"><strong>' + esc(teacherBetaNum_(value)) + '</strong><span>' + esc(label) + '</span></div>';
    }

    function teacherBetaNum_(value) {
      var num = Number(value || 0);
      if (isFinite(num)) return String(num);
      return String(value || '0');
    }

    function renderTeacherBetaClass_(cls, students, extras) {
      var summary = cls.summary || {};
      var pct = Number(summary.percent_submitted || 0);
      var tableHtml = students.length
        ? '<div class="tbl-wrap"><table class="teacher-beta-table"><thead><tr><th>Student</th><th>Homeroom</th><th>Status</th><th>Latest case</th><th>Details</th><th>Teacher action</th></tr></thead><tbody>' +
          students.map(renderTeacherBetaStudentRow_).join('') +
          '</tbody></table></div>'
        : '<div class="teacher-beta-empty alert alert-neutral"><span class="alert-icon">&#128269;</span><span>No roster students match the current filter for this class.</span></div>';
      var extraHtml = extras.length ? renderTeacherBetaExtras_(extras) : '';
      return '<section class="teacher-beta-class">' +
        '<div class="teacher-beta-class-head">' +
          '<div>' +
            '<div class="teacher-beta-class-title">' + esc(cls.label || ('Class ' + (cls.class_no || ''))) + '</div>' +
            '<div class="teacher-beta-class-sub">' + esc(cls.teacher || 'Teacher') + ' - ' + esc(cls.year_group || '') + ' design class</div>' +
            '<div class="teacher-beta-mini">' +
              '<span>' + esc(teacherBetaNum_(summary.expected)) + ' expected</span>' +
              '<span>' + esc(teacherBetaNum_(summary.submitted)) + ' submitted</span>' +
              '<span>' + esc(teacherBetaNum_(summary.missing)) + ' missing</span>' +
              '<span>' + esc(teacherBetaNum_(summary.needs_fix)) + ' needs fix</span>' +
              '<span>' + esc(teacherBetaNum_(summary.completed)) + ' completed</span>' +
              (Number(summary.class_mismatches || 0) ? '<span>' + esc(teacherBetaNum_(summary.class_mismatches)) + ' class typo</span>' : '') +
            '</div>' +
          '</div>' +
          '<div class="teacher-beta-progress" aria-label="Class submitted percentage">' +
            '<div class="teacher-beta-progress-track"><span class="teacher-beta-progress-fill" style="width:' + Math.max(0, Math.min(100, pct)) + '%"></span></div>' +
            '<div class="teacher-beta-progress-text">' + esc(pct) + '% submitted</div>' +
          '</div>' +
        '</div>' +
        tableHtml + extraHtml +
      '</section>';
    }

    function renderTeacherBetaStudentRow_(student) {
      var latest = student.latest || {};
      var statusHtml = student.submitted ? statusPill(latest.status) : '<span class="pill pill-missing">MISSING</span>';
      var rowClass = student.submitted ? ('teacher-beta-row teacher-beta-row--' + esc(latest.status || 'submitted') + (latest.class_mismatch ? ' teacher-beta-row--class-mismatch' : '')) : 'teacher-beta-row teacher-beta-row--missing';
      var caseHtml = student.submitted && latest.case_number ? '<span class="teacher-beta-case">' + esc(latest.case_number) + '</span>' : '<span class="tc-muted">Not submitted</span>';
      var details = [];
      if (latest.created_at) details.push('Submitted ' + formatDisplayTs(latest.created_at));
      if (latest.machine) details.push(MACHINE_LABELS[latest.machine] || latest.machine);
      if (latest.material) details.push(latest.material);
      if (latest.prototype_label) details.push(latest.prototype_label);
      if (Number(latest.submitted_count || 0) > 1) details.push(latest.submitted_count + ' attempts');
      if (latest.class_mismatch) details.push('Entered class ' + (latest.design_class_no || '?') + '; roster is class ' + (latest.roster_class_no || '?'));
      if (!details.length) details.push('No dashboard submission matched this roster email.');
      return '<tr class="' + rowClass + '">' +
        '<td data-label="Student"><div class="teacher-beta-student">' + esc(student.name || '') + '</div><div class="teacher-beta-email">' + esc(student.email || '') + '</div></td>' +
        '<td data-label="Homeroom">' + esc(student.homeroom || '') + (student.student_no ? '<div class="teacher-beta-email">No. ' + esc(student.student_no) + '</div>' : '') + '</td>' +
        '<td data-label="Status">' + statusHtml + '</td>' +
        '<td data-label="Latest case">' + caseHtml + '</td>' +
        '<td data-label="Details"><div class="teacher-beta-action">' + esc(details.join(' - ')) + '</div></td>' +
        '<td data-label="Teacher action"><div class="teacher-beta-action">' + esc(student.action || '') + '</div></td>' +
      '</tr>';
    }

    function renderTeacherBetaExtras_(extras) {
      var rows = extras.map(function(extra) {
        return '<tr>' +
          '<td data-label="Student"><div class="teacher-beta-student">' + esc(extra.student_name || 'Unnamed submission') + '</div><div class="teacher-beta-email">' + esc(extra.student_email || '') + '</div></td>' +
          '<td data-label="Status">' + statusPill(extra.status) + '</td>' +
          '<td data-label="Case"><span class="teacher-beta-case">' + esc(extra.case_number || '') + '</span></td>' +
          '<td data-label="Details">' + esc([extra.material, extra.created_at ? formatDisplayTs(extra.created_at) : ''].filter(Boolean).join(' - ')) + '</td>' +
        '</tr>';
      }).join('');
      return '<div class="teacher-beta-extra">' +
        '<div class="alert alert-warning" style="margin-bottom:10px;"><span class="alert-icon">&#9888;</span><span><strong>Extra class records:</strong> these submissions use this design class number but the email is not in the uploaded beta roster. Check spelling, school account, or class entry.</span></div>' +
        '<div class="tbl-wrap"><table class="teacher-beta-table"><thead><tr><th>Student</th><th>Status</th><th>Case</th><th>Details</th></tr></thead><tbody>' + rows + '</tbody></table></div>' +
      '</div>';
    }

    function teacherBetaCsvCell_(value) {
      value = value == null ? '' : String(value);
      return '"' + value.replace(/"/g, '""') + '"';
    }

    function teacherBetaDownloadName_() {
      var teacher = ((document.getElementById('teacherBetaTeacher') || {}).selectedOptions || [])[0];
      var cls = ((document.getElementById('teacherBetaClass') || {}).value || '').trim();
      var bits = ['class-submission-status'];
      if (teacher && teacher.value) bits.push(String(teacher.textContent || 'teacher'));
      if (cls) bits.push('class-' + cls);
      bits.push(new Date().toISOString().slice(0, 10));
      return bits.join('-').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') + '.csv';
    }

    function downloadTeacherBetaSpreadsheet_() {
      if (!_teacherBetaData) {
        var baseUrl = String((BOOT && BOOT.baseUrl) || '').trim();
        if (baseUrl) {
          var params = ['action=teacher_class_csv'];
          var teacherKey = teacherBetaSelectedTeacher_();
          var classNo = ((document.getElementById('teacherBetaClass') || {}).value || '').trim();
          if (teacherKey) params.push('teacher_key=' + encodeURIComponent(teacherKey));
          if (classNo) params.push('class_no=' + encodeURIComponent(classNo));
          window.open(baseUrl + '?' + params.join('&'), '_blank');
          showToast('Opening class spreadsheet export.');
          return;
        }
        showToast('Load class submission data first, then download.', 'error');
        return;
      }
      var report = getTeacherBetaVisibleReport_();
      var rows = [[
        'Record Type', 'Teacher', 'Design Class', 'Year Group', 'Student Name', 'Student Email',
        'Homeroom', 'Student No.', 'Submitted', 'Status', 'Case Number', 'Machine', 'Material',
        'Prototype Type', 'Submitted At', 'Updated At', 'Attempts', 'Class Issue', 'Teacher Action'
      ]];
      report.visibleClasses.forEach(function(item) {
        var cls = item.cls || {};
        (item.students || []).forEach(function(student) {
          var latest = student.latest || {};
          rows.push([
            'Roster student',
            cls.teacher || '',
            cls.class_no || '',
            cls.year_group || '',
            student.name || '',
            student.email || '',
            student.homeroom || '',
            student.student_no || '',
            student.submitted ? 'Yes' : 'No',
            student.submitted ? (latest.status_label || latest.status || '') : 'Missing',
            latest.case_number || '',
            latest.machine ? (MACHINE_LABELS[latest.machine] || latest.machine) : '',
            latest.material || '',
            latest.prototype_label || '',
            latest.created_at ? formatDisplayTs(latest.created_at) : '',
            latest.updated_at ? formatDisplayTs(latest.updated_at) : '',
            latest.submitted_count || '',
            latest.class_mismatch ? ('Entered class ' + (latest.design_class_no || '?') + '; roster is class ' + (latest.roster_class_no || '?')) : '',
            student.action || ''
          ]);
        });
        (item.extras || []).forEach(function(extra) {
          rows.push([
            'Extra class record',
            cls.teacher || '',
            cls.class_no || '',
            cls.year_group || '',
            extra.student_name || '',
            extra.student_email || '',
            '', '',
            'Yes',
            extra.status_label || extra.status || '',
            extra.case_number || '',
            '',
            extra.material || '',
            '',
            extra.created_at ? formatDisplayTs(extra.created_at) : '',
            extra.updated_at ? formatDisplayTs(extra.updated_at) : '',
            '',
            'Email not found in this uploaded class roster',
            'Check spelling, school account, or class entry'
          ]);
        });
      });
      if (rows.length <= 1) {
        showToast('No class rows match the current filters.', 'error');
        return;
      }
      var csv = rows.map(function(row) { return row.map(teacherBetaCsvCell_).join(','); }).join('\\r\\n');
      var filename = teacherBetaDownloadName_();
      var blob = new Blob(['\\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
        URL.revokeObjectURL(url);
        a.remove();
      }, 0);
      showToast((rows.length - 1) + ' class status row' + (rows.length === 2 ? '' : 's') + ' downloaded.');
    }

    function copyTeacherBetaMissing_() {
      if (!_teacherBetaData) {
        showToast('Load class submission data first.', 'error');
        return;
      }
      var query = teacherBetaSearchQuery_();
      var emails = [];
      (_teacherBetaData.classes || []).forEach(function(cls) {
        (cls.students || []).forEach(function(student) {
          if (!student.submitted && teacherBetaStudentMatches_(student, query, true) && student.email) emails.push(student.email);
        });
      });
      emails = emails.filter(function(email, idx) { return emails.indexOf(email) === idx; });
      if (!emails.length) {
        showToast('No missing student emails in the current view.', 'error');
        return;
      }
      writeClipboard_(emails.join('; '), emails.length + ' missing student email' + (emails.length === 1 ? '' : 's') + ' copied.');
    }

    function laserCapacitySeenKey_() {
      return 'laserCapacityNoticeSeen:' + String(LASER_CAPACITY_NOTICE.version || 'current');
    }

    function shouldShowStudentLaserCapacityNotice_(force) {
      var role = String((BOOT.currentUser && BOOT.currentUser.role) || 'guest');
      if (!force && role !== 'student' && role !== 'guest') return false;
      if (!LASER_CAPACITY_NOTICE || LASER_CAPACITY_NOTICE.active === false) return false;
      if (!force) {
        try {
          if (sessionStorage.getItem(laserCapacitySeenKey_()) === '1') return false;
        } catch(e) {}
      }
      return true;
    }

    function closeLaserCapacityNotice_(remember) {
      var overlay = document.getElementById('laserCapacityOverlay');
      if (overlay) overlay.remove();
      if (remember !== false) {
        try { sessionStorage.setItem(laserCapacitySeenKey_(), '1'); } catch(e) {}
      }
      refreshOverlayLock_();
    }

    function showStudentLaserCapacityNotice_(force) {
      if (!shouldShowStudentLaserCapacityNotice_(force)) {
        if (force) showToast('No active student popup is configured right now.', 'error');
        return;
      }
      if (document.getElementById('laserCapacityOverlay')) return;
	      var summary = LASER_CAPACITY_NOTICE.summary || 'One laser cutter is currently offline. Only one laser cutter is running, so laser jobs may move more slowly than usual.';
	      var detail = LASER_CAPACITY_NOTICE.detail || 'Please avoid duplicate submissions and check Status for updates.';
	      var scale = LASER_CAPACITY_NOTICE.scaleLabel || ('Busy starts at ' + QUEUE_BUSY_THRESHOLD + ' active queue items. Heavy starts above ' + QUEUE_HEAVY_THRESHOLD + ' active queue items.');
	      var deadlineHtml = renderStudentDeadlineSummaryHtml_('Submission deadlines');
	      var overlay = document.createElement('div');
	      overlay.id = 'laserCapacityOverlay';
      overlay.className = 'overlay';
      overlay.innerHTML =
        '<div class="modal laser-capacity-modal" role="dialog" aria-modal="true" aria-labelledby="laserCapacityTitle" tabindex="-1">' +
          '<div class="modal-head"><h3 id="laserCapacityTitle">&#128293; ' + esc(LASER_CAPACITY_NOTICE.title || 'Laser queue update') + '</h3><button class="modal-close" onclick="closeLaserCapacityNotice_()" aria-label="Close laser queue update">&times;</button></div>' +
	          '<div class="laser-capacity-body">' +
	            '<div class="laser-capacity-alert"><strong>Reduced laser capacity</strong>' + esc(summary) + '</div>' +
	            deadlineHtml +
	            '<div class="laser-capacity-scale" aria-label="Current queue scale">' +
              '<div class="laser-capacity-scale-item"><strong>Busy</strong><span>' + QUEUE_BUSY_THRESHOLD + '-' + QUEUE_HEAVY_THRESHOLD + ' active queue items.</span></div>' +
              '<div class="laser-capacity-scale-item"><strong>Heavy</strong><span>More than ' + QUEUE_HEAVY_THRESHOLD + ' active queue items.</span></div>' +
            '</div>' +
            '<div class="laser-capacity-alert"><strong>What students should do</strong>' + esc(detail) + '<br>' + esc(scale) + '</div>' +
            '<div class="laser-capacity-actions">' +
              '<button class="btn btn-ghost btn-sm" onclick="closeLaserCapacityNotice_()">Close</button>' +
              '<button class="btn btn-ghost btn-sm" onclick="closeLaserCapacityNotice_(); switchPage(\\'status\\')">&#128270; Check Status</button>' +
              '<button class="btn btn-primary btn-sm" onclick="closeLaserCapacityNotice_(); switchPage(\\'help\\'); setTimeout(function(){ helpJump_(\\'help-laser\\'); }, 250);">&#128221; Laser Checklist</button>' +
            '</div>' +
          '</div>' +
        '</div>';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', function(e){ if (e.target === overlay) closeLaserCapacityNotice_(); });
      refreshOverlayLock_();
      setTimeout(function() {
        var closeBtn = overlay.querySelector('.modal-close');
        if (closeBtn) closeBtn.focus();
      }, 0);
    }

    /* ---------- DEBOUNCE ---------- */
    var _debounceTimers = {};
    function debounce_(key, fn, delay) {
      if (_debounceTimers[key]) clearTimeout(_debounceTimers[key]);
      _debounceTimers[key] = setTimeout(fn, delay || 400);
    }

    /* ---------- MACHINE REMINDER HELPER ---------- */
    function renderMachineReminder_(machine, isOther) {
      var extra = '';
      if (isOther) {
        extra = '<li style="margin-top:4px;"><strong>Non-DT / special requests</strong> must be suitable for the selected machine and meet workshop approval rules. <a href="javascript:void(0)" onclick="switchPage(\\x27machines\\x27)" style="font-weight:700;text-decoration:underline;">Check the Machines Guide</a> before submitting.</li>';
      }
      if (machine === 'laser') {
        return '<div class="machine-reminder machine-reminder--laser">' +
          '<strong>\\ud83d\\udd25 Laser Cutting Reminder</strong>' +
          '<ul>' +
          '<li>Your working file must be an <strong>editable vector file</strong> (not a screenshot, PNG, or JPG).</li>' +
          '<li>Image-based files cannot be used as the main cutting file &mdash; the laser follows vector paths only.</li>' +
          '<li>Unsure about file preparation? <a href="javascript:void(0)" onclick="switchPage(\\x27machines\\x27);setTimeout(function(){var el=document.getElementById(\\x27machines-laser\\x27);if(el)el.scrollIntoView({behavior:\\x27smooth\\x27,block:\\x27start\\x27})},200)">Review the Spirit LS Pro &amp; Mercury III specs on the Machines page</a>.</li>' +
          extra +
          '</ul></div>';
      }
      if (machine === '3d') {
        return '<div class="machine-reminder machine-reminder--3d">' +
          '<strong>\\u2699\\ufe0f 3D Printing Reminder</strong>' +
          '<ul>' +
          '<li>Your STL must be a <strong>printable 3D model</strong>, not just a visual shape &mdash; check wall thickness and overhangs.</li>' +
          '<li>Include a <strong>dimension screenshot</strong> showing width, height, and depth of your model.</li>' +
          '<li>Unsure about printability? <a href="javascript:void(0)" onclick="switchPage(\\x27machines\\x27);setTimeout(function(){var el=document.getElementById(\\x27machines-3d\\x27);if(el)el.scrollIntoView({behavior:\\x27smooth\\x27,block:\\x27start\\x27})},200)">Review the K2 Plus &amp; Guider IIs specs on the Machines page</a>.</li>' +
          extra +
          '</ul></div>';
      }
      return '';
    }

    /* ---------- SUBMISSION ACTIVITY HELPER ---------- */
    function loadSubmissionActivity(email, msgId) {
      var el = document.getElementById(msgId);
      if (!el) return;
      var e = String(email || '').trim();
      if (!e) { el.style.display = 'none'; el.innerHTML = ''; toggleRepeatReminder_(msgId, false); return; }
      google.script.run
        .withSuccessHandler(function(res) {
          if (!res || !res.counts) { el.style.display = 'none'; toggleRepeatReminder_(msgId, false); return; }
          var c = res.counts;
          var parts = [];
          if (c.dt) parts.push(c.dt + ' DT submission' + (c.dt > 1 ? 's' : ''));
          if (c.special) parts.push(c.special + ' Special Request' + (c.special > 1 ? 's' : ''));
          if (parts.length === 0) { el.style.display = 'none'; el.innerHTML = ''; toggleRepeatReminder_(msgId, false); return; }
          var html = '\\ud83d\\udcca Today: ' + parts.join(', ') + '.';
          if (res.last24_count > c.total) html += '<br>\\u23f1 Last 24h: ' + res.last24_count + ' total request' + (res.last24_count > 1 ? 's' : '') + '.';
          if (res.warning) html += '<br><strong style="color:var(--clr-warn,#b45309);">\\u26a0\\ufe0f ' + esc(res.warning) + '</strong>';
          el.innerHTML = html;
          el.style.display = 'block';
          toggleRepeatReminder_(msgId, c.total >= 2);
        })
        .withFailureHandler(function() { el.style.display = 'none'; toggleRepeatReminder_(msgId, false); })
        .getSubmissionActivity(e);
    }
    function toggleRepeatReminder_(msgId, show) {
      var rId = msgId === 'dtSubmitActivity' ? 'dtRepeatReminder' : (msgId === 'otherSubmitActivity' ? 'otherRepeatReminder' : null);
      var rem = rId ? document.getElementById(rId) : null;
      if (rem) rem.style.display = show ? 'block' : 'none';
    }

    /* ---------- DRAFT AUTOSAVE ---------- */
    var _draftAutosave = {};
    function draftStore_() {
      try { return window.localStorage; } catch(e) { return null; }
    }
    function draftKey_(name) {
      var user = String((BOOT.currentUser && BOOT.currentUser.email) || 'guest').toLowerCase();
      return 'dfd:v3:' + user + ':' + name;
    }
    function draftControlKey_(el) {
      return el && (el.name || (el.id ? '#' + el.id : ''));
    }
    function draftControls_(form) {
      return Array.prototype.slice.call(form.querySelectorAll('input,select,textarea')).filter(function(el) {
        if (!draftControlKey_(el)) return false;
        if ((el.type || '').toLowerCase() === 'file') return false;
        return true;
      });
    }
    function isFormControlVisible_(el) {
      var node = el;
      while (node && node !== document.body) {
        var style = window.getComputedStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
        node = node.parentElement;
      }
      return true;
    }
    function readDraftData_(form) {
      var data = {};
      draftControls_(form).forEach(function(el) {
        var key = draftControlKey_(el);
        var type = (el.type || '').toLowerCase();
        if (type === 'radio') {
          if (el.checked) data[key] = el.value;
          else if (!(key in data)) data[key] = '';
        } else if (type === 'checkbox') {
          data[key] = !!el.checked;
        } else {
          data[key] = el.value || '';
        }
      });
      return data;
    }
    function draftHasMeaning_(data) {
      return Object.keys(data || {}).some(function(key) {
        var val = data[key];
        if (val === true) return true;
        return String(val || '').trim() !== '';
      });
    }
    function applyDraftData_(form, data) {
      function applyOnce() {
        draftControls_(form).forEach(function(el) {
          var key = draftControlKey_(el);
          if (!(key in data)) return;
          var type = (el.type || '').toLowerCase();
          if (type === 'radio') el.checked = String(el.value) === String(data[key]);
          else if (type === 'checkbox') el.checked = !!data[key];
          else el.value = data[key];
        });
        form.querySelectorAll('input,select,textarea').forEach(function(el) {
          try { el.dispatchEvent(new Event('change', { bubbles: true })); } catch(e) {}
          try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch(e) {}
        });
      }
      applyOnce();
      setTimeout(applyOnce, 0);
    }
    function draftTimeLabel_(ts) {
      try {
        var d = new Date(ts);
        if (isNaN(d.getTime())) return 'earlier';
        return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      } catch(e) { return 'earlier'; }
    }
    function ensureDraftBar_(form, name, label) {
      var id = name + 'DraftBar';
      var bar = document.getElementById(id);
      if (bar) return bar;
      bar = document.createElement('div');
      bar.id = id;
      bar.className = 'draft-bar';
      bar.setAttribute('aria-live', 'polite');
      bar.innerHTML =
        '<div class="draft-row">' +
          '<div class="draft-copy"><strong>' + esc(label || 'Draft autosave') + '</strong><br><span class="draft-status-text"></span></div>' +
          '<div class="draft-actions"></div>' +
        '</div>' +
        '<div class="draft-progress">' +
          '<div class="draft-progress-track"><div class="draft-progress-fill"></div></div>' +
          '<div class="draft-progress-text">0 required fields complete</div>' +
        '</div>';
      form.parentNode.insertBefore(bar, form);
      return bar;
    }
    function setDraftBar_(bar, state, text, actionsHtml) {
      bar.classList.remove('draft-bar--restore', 'draft-bar--saved');
      if (state) bar.classList.add('draft-bar--' + state);
      var status = bar.querySelector('.draft-status-text');
      var actions = bar.querySelector('.draft-actions');
      if (status) status.textContent = text || '';
      if (actions) actions.innerHTML = actionsHtml || '';
    }
    function updateDraftProgress_(form, bar) {
      var required = draftControls_(form).filter(function(el) {
        return (el.required || el.dataset.progressRequired === '1') && isFormControlVisible_(el);
      });
      var done = required.filter(function(el) {
        var type = (el.type || '').toLowerCase();
        if (type === 'checkbox' || type === 'radio') return !!el.checked;
        return String(el.value || '').trim() !== '';
      }).length;
      var total = required.length;
      var pct = total ? Math.round((done / total) * 100) : 100;
      var fill = bar.querySelector('.draft-progress-fill');
      var text = bar.querySelector('.draft-progress-text');
      if (fill) fill.style.width = pct + '%';
      if (text) text.textContent = total ? (done + '/' + total + ' required fields complete') : 'No required fields visible';
    }
    function setupDraftAutosave_(form, name, opts) {
      opts = opts || {};
      var store = draftStore_();
      if (!store || !form || _draftAutosave[name]) return;
      _draftAutosave[name] = true;
      var key = draftKey_(name);
      var bar = ensureDraftBar_(form, name, opts.label || 'Draft autosave');
      function showReady_() {
        setDraftBar_(bar, '', 'Autosave is on for form text, choices, and checkboxes. Files are never saved by the browser, so reattach uploads before submitting.', '');
        updateDraftProgress_(form, bar);
      }
      function saveNow_() {
        var data = readDraftData_(form);
        if (!draftHasMeaning_(data)) {
          store.removeItem(key);
          showReady_();
          return;
        }
        var savedAt = new Date().toISOString();
        store.setItem(key, JSON.stringify({ savedAt: savedAt, data: data }));
        setDraftBar_(bar, 'saved', 'Draft saved ' + draftTimeLabel_(savedAt) + '. Upload files again before submitting.', '<button type="button" class="btn btn-ghost btn-sm draft-discard-btn">Discard Draft</button>');
        updateDraftProgress_(form, bar);
        var discard = bar.querySelector('.draft-discard-btn');
        if (discard) discard.onclick = function() { store.removeItem(key); showReady_(); };
      }
      function saveSoon_() {
        setDraftBar_(bar, '', 'Saving draft...', '');
        debounce_('draft_' + name, saveNow_, 500);
        updateDraftProgress_(form, bar);
      }
      try {
        var raw = store.getItem(key);
        var saved = raw ? JSON.parse(raw) : null;
        if (saved && saved.data && typeof opts.sanitizeDraftData === 'function') {
          saved.data = opts.sanitizeDraftData(saved.data) || {};
        }
        if (saved && saved.data && draftHasMeaning_(saved.data)) {
          setDraftBar_(bar, 'restore', 'Saved draft found from ' + draftTimeLabel_(saved.savedAt) + '. Restoring will fill text and choices only; files must be reattached.', '<button type="button" class="btn btn-primary btn-sm draft-restore-btn">Restore Draft</button><button type="button" class="btn btn-ghost btn-sm draft-discard-btn">Discard</button>');
          var restore = bar.querySelector('.draft-restore-btn');
          var discard = bar.querySelector('.draft-discard-btn');
          if (restore) restore.onclick = function() {
            applyDraftData_(form, saved.data);
            setDraftBar_(bar, 'saved', 'Draft restored. Reattach files, then review before submitting.', '<button type="button" class="btn btn-ghost btn-sm draft-discard-btn">Discard Draft</button>');
            var d = bar.querySelector('.draft-discard-btn');
            if (d) d.onclick = function() { store.removeItem(key); showReady_(); };
            updateDraftProgress_(form, bar);
          };
          if (discard) discard.onclick = function() { store.removeItem(key); showReady_(); };
        } else {
          showReady_();
        }
      } catch(e) {
        showReady_();
      }
      form.querySelectorAll('input,select,textarea').forEach(function(el) {
        el.addEventListener('input', saveSoon_);
        el.addEventListener('change', saveSoon_);
      });
      updateDraftProgress_(form, bar);
    }
    function clearDraftAutosave_(name) {
      var store = draftStore_();
      if (store) store.removeItem(draftKey_(name));
      var bar = document.getElementById(name + 'DraftBar');
      if (bar) setDraftBar_(bar, '', 'Draft cleared. Autosave will continue as you type.', '');
    }

    /* ================================================
       SUBMIT PAGE
    ================================================ */
    function initSubmitPage() {
      var yearSel = document.getElementById('year_group');
      var machineSel = document.getElementById('machine');
      var materialSel = document.getElementById('material');
      var ruleBox = document.getElementById('ruleBox');
      var submissionControlNotice = document.getElementById('submissionControlNotice');
      var unitsInput = document.getElementById('units');
      var form = document.getElementById('submitForm');
      var submitBtn = document.getElementById('submitBtn');
      var classNoInput = form.querySelector('[name="design_class_no"]');
      var widthInput = form.querySelector('[name="width"]');
      var heightInput = form.querySelector('[name="height"]');
      var depthInput = form.querySelector('[name="depth"]');
      var depthField = document.getElementById('depthField');
      var workingInput = document.getElementById('workingFile');
      var previewInput = document.getElementById('previewFile');
      var guideBar = document.getElementById('submitGuideBar');
      var guideHint = document.getElementById('submitGuideHint');
      var steps = [document.getElementById('guideStep1'), document.getElementById('guideStep2'), document.getElementById('guideStep3'), document.getElementById('guideStep4'), document.getElementById('guideStep5')];

      var years = [];
      BOOT.rules.forEach(function(r) { if (years.indexOf(r.year_group) === -1) years.push(r.year_group); });
      years.sort(function(a, b) {
        var ay = /^Y(\d+)$/i.exec(String(a || ''));
        var by = /^Y(\d+)$/i.exec(String(b || ''));
        if (ay && by) return Number(ay[1]) - Number(by[1]);
        if (ay) return -1;
        if (by) return 1;
        return String(a || '').localeCompare(String(b || ''));
      });
      yearSel.innerHTML = '<option value="">\\u2014 Select year \\u2014</option>' + years.map(function(y) { return '<option value="' + esc(y) + '">' + esc(y) + '</option>'; }).join('');

      /* Pre-fill submitter email only for signed-in approved school accounts. */
      var emailInput = form.querySelector('[name="student_email"]');
      var signedInEmail = currentUserEmail_();
      if (emailInput && signedInEmail && isApprovedSchoolEmail_(signedInEmail) && !emailInput.value) {
        emailInput.value = signedInEmail;
      }
      setupDraftAutosave_(form, 'submit', {
        label: 'DT submission draft',
        sanitizeDraftData: function(data) {
          var clean = {};
          Object.keys(data || {}).forEach(function(key) { clean[key] = data[key]; });
          if (clean.student_email && !isApprovedSchoolEmail_(clean.student_email)) clean.student_email = '';
          return clean;
        }
      });

      /* Wire activity lookup on email */
	      if (emailInput) {
	        emailInput.addEventListener('blur', function() { loadSubmissionActivity(emailInput.value, 'dtSubmitActivity'); });
	        emailInput.addEventListener('change', function() { loadSubmissionActivity(emailInput.value, 'dtSubmitActivity'); });
	        if (emailInput.value) loadSubmissionActivity(emailInput.value, 'dtSubmitActivity');
	      }
	      renderSubmitDeadlineSummary_();

	      function setStep(idx, done) {
        var el = steps[idx]; if (!el) return;
        el.setAttribute('data-done', done ? '1' : '0');
        var m = el.querySelector('.guide-check');
        if (m) m.textContent = done ? '\\u2713' : '\\u25cb';
      }

      function updateSubmitStepper_(states) {
        states = states || [];
        var firstOpen = states.findIndex(function(done) { return !done; });
        if (firstOpen === -1) firstOpen = states.length - 1;
        states.forEach(function(done, idx) {
          var el = document.getElementById('submitStepper' + (idx + 1));
          if (!el) return;
          el.classList.toggle('is-done', !!done);
          el.classList.toggle('is-active', !done && idx === firstOpen);
          el.setAttribute('aria-current', !done && idx === firstOpen ? 'step' : 'false');
        });
      }

      function applySubmissionAvailability_() {
        var decision = getSubmissionControlDecisionClient_(yearSel.value, classNoInput ? classNoInput.value : '');
        renderSubmissionControlNotice_(submissionControlNotice, decision);
        if (submitBtn && submitBtn.dataset.busy !== '1') {
          submitBtn.disabled = !!decision.blocked;
          submitBtn.textContent = decision.blocked ? 'Submissions Closed' : 'Submit';
        }
        return decision;
      }

      function setSubmitRailItem_(itemId, iconId, done, note, warning) {
        var item = document.getElementById(itemId);
        var icon = document.getElementById(iconId);
        if (!item) return;
        item.classList.remove('is-done', 'is-warning');
        if (done) item.classList.add('is-done');
        else if (warning) item.classList.add('is-warning');
        if (icon) icon.textContent = done ? '\u2713' : (warning ? '!' : '\u25cb');
        var noteEl = document.getElementById(itemId.replace('Item', 'Note'));
        if (noteEl && note) noteEl.textContent = note;
      }

      function updateSubmitConvenienceRail_(state) {
        state = state || {};
        var fill = document.getElementById('submitRailProgressFill');
        var text = document.getElementById('submitRailProgressText');
        var pill = document.getElementById('submitRailReadyPill');
        var next = document.getElementById('submitRailNextAction');
        var pct = Number(state.pct || 0);
        if (fill) fill.style.width = pct + '%';
        if (text) text.textContent = (state.done || 0) + '/5 sections ready';
        if (pill) {
          pill.className = 'submit-rail-pill' + (state.blocked ? ' is-blocked' : (pct === 100 ? ' is-ready' : ''));
          pill.textContent = state.blocked ? 'Closed' : (pct === 100 ? 'Ready' : 'In progress');
        }
        if (next) {
          var label = 'Next step';
          var body = 'Start with your student details.';
          if (state.blocked) {
            label = 'Submissions closed';
            body = state.blockedMessage || 'This class or year group is not accepting submissions right now.';
          } else if (!state.s1) {
            body = 'Complete student details exactly as school records.';
          } else if (!state.s2) {
            body = 'Select year group, machine, and material so the correct rule loads.';
          } else if (!state.s3) {
            body = state.is3d ? 'Enter width, height, and depth for the 3D print.' : 'Enter width and height for the laser job.';
          } else if (!state.s4) {
            body = state.previewReq ? 'Attach the working file and required preview image.' : 'Attach one editable working file.';
          } else {
            label = 'Ready to submit';
            body = 'Double-check the selected files, then submit to technician review.';
          }
          next.innerHTML = '<strong>' + esc(label) + '</strong><span>' + esc(body) + '</span>';
        }

        setSubmitRailItem_(
          'submitRailDraftItem',
          'submitRailDraftIcon',
          !!state.draftReady,
          state.draftReady
            ? 'Autosave is active for text and choices. Reattach files before submitting.'
            : 'Autosave starts when you type. Files are never saved by the browser.',
          false
        );
        setSubmitRailItem_(
          'submitRailRulesItem',
          'submitRailRulesIcon',
          !!state.s2,
          state.s2
            ? 'Rules loaded: materials, units, dimensions, and preview requirement are visible.'
            : 'Choose year group and machine to load materials, units, dimensions, and preview rules.',
          false
        );
        setSubmitRailItem_(
          'submitRailFilesItem',
          'submitRailFilesIcon',
          !!state.s4,
          state.s4
            ? 'Required file checks are complete for this selected rule.'
            : (state.previewReq ? 'Attach one working file and one preview image.' : 'Attach one editable working file.'),
          state.s2 && !state.s4
        );
        setSubmitRailItem_('submitRailQueueItem', 'submitRailQueueIcon', true, 'Submitting sends the file to human technician review first. It is not same-day production.', false);
        setSubmitRailItem_('submitRailCtaItem', 'submitRailCtaIcon', true, 'Use the buttons below for real actions: resume the form, check status, or open the machine guide.', false);
      }

      function setSubmitRailSubmitted_(caseNumber) {
        var pill = document.getElementById('submitRailReadyPill');
        var next = document.getElementById('submitRailNextAction');
        var fill = document.getElementById('submitRailProgressFill');
        var text = document.getElementById('submitRailProgressText');
        if (fill) fill.style.width = '100%';
        if (text) text.textContent = 'Submitted to technician review';
        if (pill) {
          pill.className = 'submit-rail-pill is-ready';
          pill.textContent = 'Submitted';
        }
        if (next) {
          next.innerHTML = '<strong>Submission received</strong><span>' + esc('Track status using case number ' + (caseNumber || 'shown on the receipt') + '.') + '</span>';
        }
        setSubmitRailItem_('submitRailDraftItem', 'submitRailDraftIcon', true, 'Draft cleared after successful submission.', false);
        setSubmitRailItem_('submitRailRulesItem', 'submitRailRulesIcon', true, 'The selected rule was used for this submission.', false);
        setSubmitRailItem_('submitRailFilesItem', 'submitRailFilesIcon', true, 'The submitted file set was received by the dashboard.', false);
        setSubmitRailItem_('submitRailQueueItem', 'submitRailQueueIcon', true, 'The file is now waiting for human technician review.', false);
        setSubmitRailItem_('submitRailCtaItem', 'submitRailCtaIcon', true, 'Use Track Status or Submit Another from the receipt.', false);
      }

      function updateGuide() {
        var rule = BOOT.rules.find(function(r) { return r.year_group === yearSel.value && r.machine === machineSel.value; });
        var previewReq = !!(rule && String(rule.preview_required).toLowerCase() === 'true');
        var is3d = machineSel.value === '3d';

        var s1 = ['student_email','student_name','design_class_no','design_teacher','prototype_fidelity'].every(function(n) {
          var i = form.querySelector('[name="' + n + '"]'); return i && String(i.value||'').trim();
        });
        var s2 = !!(yearSel.value && machineSel.value && materialSel.value && rule);
        var s3 = !!(Number(widthInput.value||0)>0 && Number(heightInput.value||0)>0 && (!is3d || Number(depthInput.value||0)>0));
        var s4 = !!(workingInput && workingInput.files && workingInput.files.length) && (!previewReq || (previewInput && previewInput.files && previewInput.files.length));

        setStep(0, s1); setStep(1, s2); setStep(2, s3); setStep(3, s4); setStep(4, true);
        updateSubmitStepper_([s1, s2, s3, s4]);
        var done = [s1,s2,s3,s4,true].filter(Boolean).length;
        var pct = Math.round((done/5)*100);
        if (guideBar) guideBar.style.width = pct + '%';
        if (guideHint) guideHint.textContent = pct === 100 ? 'Ready to submit! Please double-check filenames.' : done + '/5 sections complete. Finish all items before submitting.';
        var decision = getSubmissionControlDecisionClient_(yearSel.value, classNoInput ? classNoInput.value : '');
        var draftBar = document.getElementById('submitDraftBar');
        var draftReady = !!(draftBar || draftHasMeaning_(readDraftData_(form)));
        updateSubmitConvenienceRail_({
          s1: s1,
          s2: s2,
          s3: s3,
          s4: s4,
          done: done,
          pct: pct,
          is3d: is3d,
          previewReq: previewReq,
          draftReady: draftReady,
          blocked: !!(decision && decision.blocked),
          blockedMessage: decision && decision.message
        });
      }

      function applyRules() {
        var year = yearSel.value, machine = machineSel.value;
        var rule = BOOT.rules.find(function(r) { return r.year_group === year && r.machine === machine; });
        if (depthField) depthField.style.display = machine === '3d' ? 'flex' : 'none';
        var dtRem = document.getElementById('dtMachineReminder');
        if (dtRem) dtRem.innerHTML = renderMachineReminder_(machine);
        if (!rule) {
          materialSel.innerHTML = '<option value="">Choose year + machine first</option>';
          materialSel.disabled = true;
          ruleBox.innerHTML = '';
          unitsInput.value = '';
          var reqMark = document.getElementById('previewReqMark');
          var previewHint = document.getElementById('previewFileHint');
          if (reqMark) reqMark.style.display = 'none';
          if (previewHint) previewHint.textContent = 'PNG, JPG, or JPEG accepted. Required only when the selected rule asks for it.';
          applySubmissionAvailability_();
          updateGuide(); return;
        }
        var mats = String(rule.materials||'').split(',').map(function(s){ return s.trim(); }).filter(Boolean);
        materialSel.disabled = false;
        materialSel.innerHTML = mats.length ? mats.map(function(m){ return '<option value="' + esc(m) + '">' + esc(m) + '</option>'; }).join('') : '<option value="">No configured material</option>';
        unitsInput.value = rule.units || '';
        var previewReq = String(rule.preview_required).toLowerCase() === 'true';
        var previewReqMark = document.getElementById('previewReqMark');
        var previewFileHint = document.getElementById('previewFileHint');
        if (previewReqMark) previewReqMark.style.display = previewReq ? 'inline' : 'none';
        if (previewFileHint) previewFileHint.textContent = previewReq ? 'PNG, JPG, or JPEG preview required for this selected rule.' : 'PNG, JPG, or JPEG accepted. Optional for this selected rule.';
        var dims = [rule.max_width, rule.max_height, rule.max_depth].filter(function(v){ return String(v)!=='0' && v!==''; });
        var ext = String(rule.accepted_extensions||'').split(',').map(function(s){
          var clean = s.trim().toLowerCase();
          if (clean.charAt(0) === '.') clean = clean.slice(1);
          return clean ? '.' + clean : '';
        }).filter(Boolean);
        var chips = [];
        if (dims.length) chips.push('\\ud83d\\udccf Max: ' + dims.join(' \\u00d7 ') + ' ' + esc(rule.units||''));
        if (ext.length) chips.push('\\ud83d\\udcc4 ' + ext.join(', '));
        if (previewReq) chips.push('\\ud83d\\uddbc\\ufe0f Preview required');
        ruleBox.innerHTML = '<strong>' + esc(year) + ' \\u2013 ' + esc(MACHINE_LABELS[machine]||machine) + ' Requirements</strong>' + '<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;">' + chips.map(function(c){ return '<span class="rule-chip">' + c + '</span>'; }).join('') + '</div>' + (rule.notes ? '<div class="rule-row" style="margin-top:8px;"><span class="rule-icon">\\u2139\\ufe0f</span><span>' + esc(rule.notes) + '</span></div>' : '');
        applySubmissionAvailability_();
        updateGuide();
      }

      yearSel.addEventListener('change', applyRules);
      machineSel.addEventListener('change', applyRules);
      if (classNoInput) {
        classNoInput.addEventListener('input', applySubmissionAvailability_);
        classNoInput.addEventListener('change', applySubmissionAvailability_);
      }
      applyRules();

      ['width','height','depth'].forEach(function(dim) {
        var inp = form.querySelector('[name="' + dim + '"]');
        if (inp) inp.addEventListener('input', function() { validateDim_(dim, yearSel, machineSel, form); updateGuide(); });
      });
      ['workingFile','previewFile'].forEach(function(id) { setupFileZone_(id, updateGuide); });
      form.querySelectorAll('input,select,textarea').forEach(function(el) {
        el.addEventListener('change', updateGuide);
        el.addEventListener('input', updateGuide);
      });
      updateGuide();

      form.addEventListener('submit', async function(ev) {
        ev.preventDefault();
        var btn = submitBtn;
        var availability = applySubmissionAvailability_();
        if (availability.blocked) {
          setMsg('submitMsg', availability.message || 'Submissions are currently closed for this class or year group.', 'error');
          return;
        }
        var activeRule = BOOT.rules.find(function(r) { return r.year_group === yearSel.value && r.machine === machineSel.value; });
        var previewRequired = !!(activeRule && String(activeRule.preview_required).toLowerCase() === 'true');
        if (machineSel.value === '3d' && !(Number(depthInput.value || 0) > 0)) {
          setMsg('submitMsg', 'Depth is required for 3D printing. Enter width, height, and depth before submitting.', 'error');
          if (depthInput) depthInput.focus();
          return;
        }
        if (!workingInput || !workingInput.files || !workingInput.files.length) {
          setMsg('submitMsg', 'Please attach the editable working file before submitting.', 'error');
          var workingZone = document.getElementById('zone_workingFile');
          if (workingZone) workingZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        var selectedWorkingFile = workingInput.files[0];
        var selectedRawExtMatch = /\.([^.]+)$/.exec(String((selectedWorkingFile && selectedWorkingFile.name) || ''));
        var selectedRawExt = selectedRawExtMatch ? selectedRawExtMatch[1] : '';
        var selectedExt = selectedRawExt.toLowerCase();
        var allowedExts = String((activeRule && activeRule.accepted_extensions) || '').split(',').map(function(x) {
          var clean = String(x || '').trim().toLowerCase();
          return clean.charAt(0) === '.' ? clean.slice(1) : clean;
        }).filter(Boolean);
        if ((selectedExt === 'af' || selectedExt === 'afdesign') && selectedRawExt !== selectedExt) {
          setMsg('submitMsg', 'Affinity Designer files must use lowercase .af or .afdesign. Rename the file and upload again.', 'error');
          var affinityCaseZone = document.getElementById('zone_workingFile');
          if (affinityCaseZone) affinityCaseZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        if (allowedExts.length && allowedExts.indexOf(selectedExt) === -1) {
          setMsg('submitMsg', 'This working file type is not allowed for the selected year and machine. Please choose the correct working file and upload again.', 'error');
          var wrongZone = document.getElementById('zone_workingFile');
          if (wrongZone) wrongZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        if (previewRequired && (!previewInput || !previewInput.files || !previewInput.files.length)) {
          setMsg('submitMsg', 'A preview image is required for this year and machine. Attach the preview before submitting.', 'error');
          var previewZone = document.getElementById('zone_previewFile');
          if (previewZone) previewZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        btn.dataset.busy = '1';
        btn.disabled = true;
        btn.innerHTML = '\\u23f3 Uploading\\u2026';
        setMsg('submitMsg', 'Uploading files to Drive\\u2026', 'muted');
        document.getElementById('submitSuccess').style.display = 'none';
        document.getElementById('submitFormWrap').style.display = 'block';
        try {
          var fd = new FormData(form);
          var payload = Object.fromEntries(fd.entries());
          payload.working_file = await uploadFileInput_('workingFile', payload.year_group, payload.machine);
          payload.preview_file = await uploadFileInput_('previewFile', payload.year_group, 'preview');
          google.script.run
            .withSuccessHandler(function(res) {
              document.getElementById('submitFormWrap').style.display = 'none';
              var suc = document.getElementById('submitSuccess');
              suc.style.display = 'block';
              suc.querySelector('.id-box-text').textContent = res.case_number || res.submission_id;
              /* Populate submission activity in success state */
              var saEl = document.getElementById('successSubmittedAt');
              if (saEl && res.submitted_at) {
                var parts = [];
                parts.push('\\ud83d\\uddd3\\ufe0f Submitted: ' + formatDisplayTs(res.submitted_at));
                if (res.case_number) parts.push('Case number: ' + esc(res.case_number));
                if (res.submissions_today) parts.push('\\ud83d\\udcca Today: ' + res.submissions_today + ' total (' + (res.dt_submissions_today||0) + ' DT, ' + (res.special_submissions_today||0) + ' Special)');
                if (res.last_24h_submissions > res.submissions_today) parts.push('\\u23f1 Last 24h: ' + res.last_24h_submissions + ' total requests');
                saEl.innerHTML = parts.join('<br>');
                saEl.style.display = 'block';
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
              form.reset();
              materialSel.disabled = true; ruleBox.innerHTML = ''; unitsInput.value = '';
              document.querySelectorAll('.file-chosen').forEach(function(el){ el.textContent = ''; });
              document.querySelectorAll('.file-feedback').forEach(function(el){ el.innerHTML = ''; });
              document.querySelectorAll('.file-zone').forEach(function(el){ el.classList.remove('file-zone--filled'); });
              clearDraftAutosave_('submit');
              updateGuide();
              setSubmitRailSubmitted_(res.case_number);
              btn.dataset.busy = '';
              applySubmissionAvailability_();
              showToast('Submission received!', 'success');
            })
            .withFailureHandler(function(err) { setMsg('submitMsg', err.message||String(err), 'error'); btn.dataset.busy = ''; applySubmissionAvailability_(); })
            .submitSubmission(payload);
        } catch(err) { setMsg('submitMsg', err.message||String(err), 'error'); btn.dataset.busy = ''; applySubmissionAvailability_(); }
      });
    }

    function validateDim_(dim, yearSel, machineSel, form) {
      var inp = form.querySelector('[name="' + dim + '"]');
      var rule = BOOT.rules.find(function(r){ return r.year_group === yearSel.value && r.machine === machineSel.value; });
      var c = inp.closest('.field');
      var h = c.querySelector('.field-hint');
      if (h) h.remove();
      c.classList.remove('field-error');
      if (!rule || !inp.value) return;
      var max = Number(rule['max_' + dim]||0);
      var val = Number(inp.value||0);
      if (max && val > max) {
        c.classList.add('field-error');
        var m = document.createElement('div');
        m.className = 'field-hint';
        m.textContent = 'Exceeds limit (' + max + ' ' + (rule.units||'') + '). Please resize before submitting.';
        c.appendChild(m);
      }
    }

    function setupFileZone_(inputId, cb) {
      var zone = document.getElementById('zone_' + inputId);
      var inp = document.getElementById(inputId);
      var chosen = document.getElementById('chosen_' + inputId);
      var feedback = document.getElementById('feedback_' + inputId);
      if (!zone || !inp || !chosen) return;

      function fileSizeLabel_(size) {
        if (!size && size !== 0) return '';
        if (size < 1024 * 1024) return Math.max(1, Math.round(size / 1024)) + ' KB';
        return (size / 1024 / 1024).toFixed(size > 10 * 1024 * 1024 ? 0 : 1) + ' MB';
      }

      function rawFileExt_(name) {
        var m = /\.([^.]+)$/.exec(String(name || ''));
        return m ? m[1] : '';
      }
      function fileExt_(name) {
        return rawFileExt_(name).toLowerCase();
      }
      function affinityExtensionCaseBad_(name) {
        var raw = rawFileExt_(name);
        var ext = raw.toLowerCase();
        return (ext === 'af' || ext === 'afdesign') && raw !== ext;
      }
      function normalizeExtToken_(value) {
        var clean = String(value || '').trim().toLowerCase();
        return clean.charAt(0) === '.' ? clean.slice(1) : clean;
      }

      function acceptedExts_() {
        var accept = String(inp.getAttribute('accept') || '');
        if (inputId === 'workingFile') {
          var year = (document.getElementById('year_group') || {}).value || '';
          var machine = (document.getElementById('machine') || {}).value || '';
          var rule = (BOOT.rules || []).find(function(r) { return r.year_group === year && r.machine === machine; });
          if (rule && rule.accepted_extensions) accept = String(rule.accepted_extensions || '');
        } else if (inputId === 'otherWorkingFile') {
          var otherMachine = (document.getElementById('otherMachine') || {}).value || '';
          accept = otherMachine === '3d' ? 'stl' : 'af,afdesign,svg,dxf';
        }
        return accept.split(',').map(function(part) {
          return normalizeExtToken_(part);
        }).filter(function(part) { return part && part !== 'image/*'; });
      }

      function renderFileFeedback_(file) {
        if (!feedback) return;
        if (!file) { feedback.innerHTML = ''; return; }
        var rawExt = rawFileExt_(file.name);
        var ext = rawExt.toLowerCase();
        var affinityCaseBad = affinityExtensionCaseBad_(file.name);
        var isPreview = inputId === 'previewFile' || inputId === 'otherPreviewFile';
        var accepted = acceptedExts_();
        var extOk = isPreview ? String(file.type || '').indexOf('image/') === 0 : ((!accepted.length || accepted.indexOf(ext) !== -1) && !affinityCaseBad);
        var badges = [];
        if (isPreview) {
          badges.push('<span class="file-badge ' + (extOk ? 'file-badge--ok' : 'file-badge--bad') + '">' + (extOk ? 'Preview ready' : 'Use PNG/JPG preview') + '</span>');
        } else {
          var machine = inputId === 'otherWorkingFile'
            ? ((document.getElementById('otherMachine') || {}).value || '')
            : ((document.getElementById('machine') || {}).value || '');
          if (affinityCaseBad) {
            badges.push('<span class="file-badge file-badge--bad">Rename to lowercase .af or .afdesign</span>');
          } else if (extOk) {
            badges.push('<span class="file-badge file-badge--ok">Ready to submit</span>');
          } else {
            badges.push('<span class="file-badge file-badge--bad">' + esc(machine === '3d' ? 'Use an STL file' : 'Use an editable vector file') + '</span>');
          }
        }
        badges.push('<span class="file-badge">' + esc(fileSizeLabel_(file.size || 0)) + '</span>');
        feedback.innerHTML = badges.join('');
      }

      function updateChosen_(file) {
        if (!file) {
          chosen.textContent = '';
          if (feedback) feedback.innerHTML = '';
          zone.classList.remove('file-zone--filled');
          return;
        }
        chosen.textContent = '\u2713 ' + file.name + (file.size ? ' (' + fileSizeLabel_(file.size) + ')' : '');
        renderFileFeedback_(file);
        zone.classList.add('file-zone--filled');
      }

      zone.addEventListener('click', function(e){ if (e.target === inp) return; inp.click(); });
      zone.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp.click(); } });
      zone.addEventListener('dragover', function(e){ e.preventDefault(); zone.classList.add('drag-over'); });
      zone.addEventListener('dragleave', function(){ zone.classList.remove('drag-over'); });
      zone.addEventListener('drop', function(e) {
        e.preventDefault(); zone.classList.remove('drag-over');
        if (e.dataTransfer.files.length) {
          var dt = new DataTransfer(); dt.items.add(e.dataTransfer.files[0]); inp.files = dt.files;
          updateChosen_(e.dataTransfer.files[0]);
          if (cb) cb();
        }
      });
      inp.addEventListener('change', function(){ updateChosen_(inp.files && inp.files.length ? inp.files[0] : null); if (cb) cb(); });
    }

    /* ================================================
       OTHER REQUESTS PAGE
    ================================================ */
    function initOtherPage() {
      var form = document.getElementById('otherForm');
      if (!form) return;
      var roleSel = document.getElementById('otherRole');
      var typeSel = document.getElementById('otherRequestType');
      var machineSel = document.getElementById('otherMachine');
      var materialSel = document.getElementById('otherMaterial');
      var depthField = document.getElementById('otherDepthField');
      var teacherSel = document.getElementById('otherTeacher');
      var teacherEmailInput = document.getElementById('otherTeacherEmail');
      var teacherCustomField = document.getElementById('otherTeacherCustomField');
      var competitionField = document.getElementById('otherCompetitionField');
      var yearGroupField = document.getElementById('otherYearGroupField');
      var classField = document.getElementById('otherClassField');
      var deptSel = document.getElementById('otherDepartment');
      var deptOtherField = document.getElementById('otherDeptOtherField');
      var purposeSel = document.getElementById('otherPurpose');
      var otherWorkingInput = document.getElementById('otherWorkingFile');
      var otherDepthInput = form.querySelector('[name="depth"]');
      var chkApproval = document.getElementById('otherConfirmApproval');
      var chkTimeline = document.getElementById('otherConfirmTimeline');
      if (chkApproval) chkApproval.dataset.progressRequired = '1';
      if (chkTimeline) chkTimeline.dataset.progressRequired = '1';
      setupDraftAutosave_(form, 'other', { label: 'Special request draft' });

      /* Populate role dropdown from BOOT */
      if (roleSel && BOOT.uiText.otherRequestRoles) {
        roleSel.innerHTML = '<option value="">\\u2014 Select role \\u2014</option>' +
          BOOT.uiText.otherRequestRoles.map(function(r) { return '<option value="' + esc(r.value) + '">' + esc(r.label) + '</option>'; }).join('');
      }
      /* Populate request type dropdown from BOOT */
      if (typeSel && BOOT.uiText.otherRequestTypes) {
        typeSel.innerHTML = '<option value="">\\u2014 Select type \\u2014</option>' +
          BOOT.uiText.otherRequestTypes.map(function(r) { return '<option value="' + esc(r.value) + '">' + esc(r.label) + '</option>'; }).join('');
      }
      /* Populate department dropdown from BOOT */
      if (deptSel && BOOT.uiText.otherRequestDepartments) {
        deptSel.innerHTML = '<option value="">\\u2014 Select \\u2014</option>' +
          BOOT.uiText.otherRequestDepartments.map(function(d) { return '<option value="' + esc(d.value) + '">' + esc(d.label) + '</option>'; }).join('');
      }
      /* Populate purpose dropdown from BOOT */
      if (purposeSel && BOOT.uiText.otherRequestPurposes) {
        purposeSel.innerHTML = '<option value="">\\u2014 Select purpose \\u2014</option>' +
          BOOT.uiText.otherRequestPurposes.map(function(p) { return '<option value="' + esc(p.value) + '">' + esc(p.label) + '</option>'; }).join('');
      }

      /* Role change -> show/hide year_group + class for students */
      if (roleSel) roleSel.addEventListener('change', function() {
        var isStudent = roleSel.value === 'student';
        if (yearGroupField) yearGroupField.style.display = isStudent ? 'block' : 'none';
        if (classField) classField.style.display = isStudent ? 'block' : 'none';
      });

      /* Department change -> show/hide "Other" text input */
      if (deptSel) deptSel.addEventListener('change', function() {
        if (deptOtherField) deptOtherField.style.display = deptSel.value === 'Other' ? 'block' : 'none';
      });

      /* Show/hide competition name field (triggered by type OR purpose) */
      function updateCompetitionField_() {
        var show = (typeSel && typeSel.value === 'competition') || (purposeSel && purposeSel.value === 'competition');
        if (competitionField) competitionField.style.display = show ? 'block' : 'none';
      }
      if (typeSel) typeSel.addEventListener('change', updateCompetitionField_);
      if (purposeSel) purposeSel.addEventListener('change', updateCompetitionField_);

      /* Teacher dropdown -> auto-fill teacher email */
      var teacherEmails = {` + Object.keys(APP.teacherEmails).map(function(k) {
        return "'" + k.replace(/'/g, "\\'") + "':'" + APP.teacherEmails[k].replace(/'/g, "\\'") + "'";
      }).join(',') + `};
      if (teacherSel) teacherSel.addEventListener('change', function() {
        if (teacherSel.value === '__other__') {
          if (teacherCustomField) teacherCustomField.style.display = 'block';
          if (teacherEmailInput) teacherEmailInput.value = '';
        } else {
          if (teacherCustomField) teacherCustomField.style.display = 'none';
          if (teacherEmailInput && teacherEmails[teacherSel.value]) teacherEmailInput.value = teacherEmails[teacherSel.value];
          else if (teacherEmailInput) teacherEmailInput.value = '';
        }
      });

      /* Machine change -> populate material + toggle depth */
      if (machineSel) machineSel.addEventListener('change', function() {
        var machine = machineSel.value;
        if (depthField) depthField.style.display = machine === '3d' ? 'flex' : 'none';
        var otherRem = document.getElementById('otherMachineReminder');
        if (otherRem) otherRem.innerHTML = renderMachineReminder_(machine, true);
        /* Build material list from all rules for that machine */
        var mats = {};
        (BOOT.rules || []).forEach(function(r) {
          if (r.machine !== machine) return;
          String(r.materials || '').split(',').forEach(function(m) { m = m.trim(); if (m) mats[m] = true; });
        });
        var matList = Object.keys(mats);
        if (matList.length) {
          materialSel.disabled = false;
          materialSel.innerHTML = matList.map(function(m) { return '<option value="' + esc(m) + '">' + esc(m) + '</option>'; }).join('');
        } else {
          materialSel.disabled = false;
          materialSel.innerHTML = '<option value="">Type material below</option>';
        }
      });

      /* Pre-fill requester email if logged in */
      var emailInput = form.querySelector('[name="requester_email"]');
      if (emailInput && BOOT.currentUser.email && !emailInput.value) emailInput.value = BOOT.currentUser.email;

      /* Wire activity lookup on email */
      if (emailInput) {
        emailInput.addEventListener('blur', function() { loadSubmissionActivity(emailInput.value, 'otherSubmitActivity'); });
        emailInput.addEventListener('change', function() { loadSubmissionActivity(emailInput.value, 'otherSubmitActivity'); });
        if (emailInput.value) loadSubmissionActivity(emailInput.value, 'otherSubmitActivity');
      }

      /* File zones */
      setupFileZone_('otherWorkingFile', function(){});
      setupFileZone_('otherPreviewFile', function(){});

      /* Submit handler */
      form.addEventListener('submit', async function(ev) {
        ev.preventDefault();
        /* Validate confirmation checkboxes */
        if (chkApproval && !chkApproval.checked) { setMsg('otherSubmitMsg', 'Please confirm that teacher/supervisor approval has been obtained.', 'error'); return; }
        if (chkTimeline && !chkTimeline.checked) { setMsg('otherSubmitMsg', 'Please confirm that you understand the review and production timeline.', 'error'); return; }
        if (teacherSel && teacherSel.value === '__other__') {
          var teacherCustom = (document.getElementById('otherTeacherCustom') || {}).value || '';
          if (!teacherCustom.trim()) { setMsg('otherSubmitMsg', 'Please enter the responsible teacher name.', 'error'); return; }
        }
        if (deptSel && deptSel.value === 'Other') {
          var deptCustom = (document.getElementById('otherDeptOtherInput') || {}).value || '';
          if (!deptCustom.trim()) { setMsg('otherSubmitMsg', 'Please specify the department or subject.', 'error'); return; }
        }
        if (((typeSel && typeSel.value === 'competition') || (purposeSel && purposeSel.value === 'competition'))) {
          var competitionName = (form.querySelector('[name="competition_name"]') || {}).value || '';
          if (!competitionName.trim()) { setMsg('otherSubmitMsg', 'Please enter the competition name for this request.', 'error'); return; }
        }
        if (machineSel && machineSel.value === '3d' && !(Number((otherDepthInput && otherDepthInput.value) || 0) > 0)) {
          setMsg('otherSubmitMsg', 'Depth is required for 3D printing. Enter width, height, and depth before submitting.', 'error');
          if (otherDepthInput) otherDepthInput.focus();
          return;
        }
        if (!otherWorkingInput || !otherWorkingInput.files || !otherWorkingInput.files.length) {
          setMsg('otherSubmitMsg', 'Please attach the editable working file before submitting this request.', 'error');
          var otherWorkingZone = document.getElementById('zone_otherWorkingFile');
          if (otherWorkingZone) otherWorkingZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        var otherFile = otherWorkingInput.files[0];
        var otherRawExtMatch = /\.([^.]+)$/.exec(String((otherFile && otherFile.name) || ''));
        var otherRawExt = otherRawExtMatch ? otherRawExtMatch[1] : '';
        var otherExt = otherRawExt.toLowerCase();
        var otherAllowed = machineSel && machineSel.value === '3d' ? ['stl'] : ['af','afdesign','svg','dxf'];
        if ((otherExt === 'af' || otherExt === 'afdesign') && otherRawExt !== otherExt) {
          setMsg('otherSubmitMsg', 'Affinity Designer files must use lowercase .af or .afdesign. Rename the file and upload again.', 'error');
          var otherAffinityCaseZone = document.getElementById('zone_otherWorkingFile');
          if (otherAffinityCaseZone) otherAffinityCaseZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        if (otherAllowed.indexOf(otherExt) === -1) {
          setMsg('otherSubmitMsg', 'This working file type does not match the selected machine. ' + (machineSel && machineSel.value === '3d' ? '3D print requests need .stl.' : 'Laser requests need .af, .afdesign, .svg, or .dxf.'), 'error');
          var otherWrongZone = document.getElementById('zone_otherWorkingFile');
          if (otherWrongZone) otherWrongZone.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
        var btn = document.getElementById('otherSubmitBtn');
        btn.disabled = true;
        btn.innerHTML = '\\u23f3 Uploading\\u2026';
        setMsg('otherSubmitMsg', 'Uploading files to Drive\\u2026', 'muted');
        document.getElementById('otherSuccess').style.display = 'none';
        document.getElementById('otherFormWrap').style.display = 'block';
        try {
          var fd = new FormData(form);
          var payload = Object.fromEntries(fd.entries());
          /* Handle custom teacher name */
          if (payload.teacher_in_charge === '__other__') {
            var custom = (document.getElementById('otherTeacherCustom') || {}).value || '';
            payload.teacher_in_charge = custom.trim();
          }
          /* Handle department "Other" */
          if (payload.department_or_subject === 'Other') {
            var deptCustom = (document.getElementById('otherDeptOtherInput') || {}).value || '';
            payload.department_or_subject = deptCustom.trim() || 'Other';
          }
          payload.working_file = await uploadFileInput_('otherWorkingFile', 'OtherReq', payload.machine || 'other');
          payload.preview_file = await uploadFileInput_('otherPreviewFile', 'OtherReq', 'preview');
          google.script.run
            .withSuccessHandler(function(res) {
              document.getElementById('otherFormWrap').style.display = 'none';
              var suc = document.getElementById('otherSuccess');
              suc.style.display = 'block';
              suc.querySelector('.id-box-text').textContent = res.case_number || res.request_id;
              /* Populate submission activity in success state */
              var saEl = document.getElementById('otherSuccessSubmittedAt');
              if (saEl && res.submitted_at) {
                var parts = [];
                parts.push('\\ud83d\\uddd3\\ufe0f Submitted: ' + formatDisplayTs(res.submitted_at));
                if (res.case_number) parts.push('Case number: ' + esc(res.case_number));
                if (res.submissions_today) parts.push('\\ud83d\\udcca Today: ' + res.submissions_today + ' total (' + (res.dt_submissions_today||0) + ' DT, ' + (res.special_submissions_today||0) + ' Special)');
                if (res.last_24h_submissions > res.submissions_today) parts.push('\\u23f1 Last 24h: ' + res.last_24h_submissions + ' total requests');
                saEl.innerHTML = parts.join('<br>');
                saEl.style.display = 'block';
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
              form.reset();
              materialSel.innerHTML = '<option value="">\\u2014 Select machine first \\u2014</option>';
              document.querySelectorAll('#page-other .file-chosen').forEach(function(el){ el.textContent = ''; });
              document.querySelectorAll('#page-other .file-feedback').forEach(function(el){ el.innerHTML = ''; });
              document.querySelectorAll('#page-other .file-zone').forEach(function(el){ el.classList.remove('file-zone--filled'); });
              clearDraftAutosave_('other');
              btn.disabled = false; btn.innerHTML = 'Submit Request';
              showToast('Request submitted!', 'success');
            })
            .withFailureHandler(function(err) { setMsg('otherSubmitMsg', err.message||String(err), 'error'); btn.disabled = false; btn.innerHTML = 'Submit Request'; })
            .submitOtherRequest(payload);
        } catch(err) { setMsg('otherSubmitMsg', err.message||String(err), 'error'); btn.disabled = false; btn.innerHTML = 'Submit Request'; }
      });
    }

    function resetOtherForm_() {
      document.getElementById('otherSuccess').style.display = 'none';
      document.getElementById('otherFormWrap').style.display = 'block';
      var form = document.getElementById('otherForm');
      if (form) form.reset();
      clearDraftAutosave_('other');
      document.querySelectorAll('#page-other .file-chosen').forEach(function(el) { el.textContent = ''; });
      document.querySelectorAll('#page-other .file-feedback').forEach(function(el) { el.innerHTML = ''; });
      document.querySelectorAll('#page-other .file-zone').forEach(function(el) { el.classList.remove('file-zone--filled'); });
      /* Reset conditional fields */
      var hide = ['otherYearGroupField','otherClassField','otherDeptOtherField','otherCompetitionField'];
      hide.forEach(function(id) { var el = document.getElementById(id); if (el) el.style.display = 'none'; });
      /* Reset checkboxes */
      var chk1 = document.getElementById('otherConfirmApproval'); if (chk1) chk1.checked = false;
      var chk2 = document.getElementById('otherConfirmTimeline'); if (chk2) chk2.checked = false;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /* ================================================
       STATUS PAGE
    ================================================ */
    function initStatusPage() {
      var inp = document.getElementById('statusQuery');
      if (inp) {
        inp.addEventListener('keydown', function(e){ if (e.key === 'Enter') loadStatuses(); });
        if (BOOT.currentUser.email && !inp.value) { inp.value = BOOT.currentUser.email; }
      }
      /* Auto-load for students: show their own submissions immediately */
      if (!BOOT.currentUser.isAdmin && BOOT.currentUser.email && inp && inp.value) {
        loadStatuses();
      }
    }

    function initQueuePage() {
      loadStatusQueueSnapshot_();
    }

    function buildTimeline(status) {
      var steps = [{key:'submitted',label:'Submitted'},{key:'approved',label:'Approved'},{key:'in_queue',label:'In Queue'},{key:'in_production',label:'In Production'},{key:'completed',label:'Completed'}];
      if (status === 'rejected') return '<div class="status-timeline"><span class="tl-step warn"><span class="tl-dot"></span>Rejected</span></div>';
      if (status === 'needs_fix') return '<div class="status-timeline"><span class="tl-step done"><span class="tl-dot"></span>Submitted</span><span class="tl-conn"></span><span class="tl-step warn"><span class="tl-dot"></span>Needs Fix</span></div>';
      var idx = steps.findIndex(function(s){ return s.key === status; });
      return '<div class="status-timeline">' + steps.map(function(s,i) {
        var cls = i < idx ? 'done' : (i === idx ? 'curr' : '');
        var conn = i < steps.length-1 ? '<span class="tl-conn' + (i < idx ? ' done' : '') + '"></span>' : '';
        return '<span class="tl-step ' + cls + '"><span class="tl-dot"></span>' + s.label + '</span>' + conn;
      }).join('') + '</div>';
    }

    function summarizeStatusRows_(rows) {
      var c = { total:0, queue:0, review:0, approved_ready:0, in_queue:0, in_production:0, needs_fix:0, completed:0, rejected:0 };
      (rows || []).forEach(function(r) {
        var s = String(r.status || '');
        c.total++;
        if (['submitted','approved','in_queue','in_production'].indexOf(s) !== -1) c.queue++;
        if (s === 'submitted') c.review++;
        if (s === 'approved') c.approved_ready++;
        if (s === 'in_queue') c.in_queue++;
        if (s === 'in_production') c.in_production++;
        if (s === 'needs_fix') c.needs_fix++;
        if (s === 'completed') c.completed++;
        if (s === 'rejected') c.rejected++;
      });
      return c;
    }

    function statusQueueMeaning_(status) {
      var s = String(status || '');
      if (s === 'submitted') return 'This counts as active queue workload. It is waiting for first human review before production scheduling.';
      if (s === 'approved') return 'This counts as active queue workload. It passed review and is waiting to be placed into a machine slot.';
      if (s === 'in_queue') return 'This is in the production queue and waiting for an available machine slot.';
      if (s === 'in_production') return 'This is active queue workload and is currently being fabricated or prepared on the machine.';
      if (s === 'needs_fix') return 'This is waiting on student revision. It will not move forward in the production queue until a corrected file is submitted.';
      if (s === 'completed') return 'This is complete and no longer part of active queue workload.';
      if (s === 'rejected') return 'This is not active in the queue. Read the remarks and speak with your teacher if needed.';
      return 'Check the latest status and remarks for next steps.';
    }

    function renderStatusQueuePosition_(r) {
      var status = String((r && r.status) || '');
      var activeStatuses = ['submitted','approved','in_queue','in_production'];
      var active = activeStatuses.indexOf(status) !== -1 || r.queue_active === true;
      var position = Number(r.queue_position || 0);
      var total = Number(r.queue_total_active || 0);
      var note = r.queue_position_note || 'This is a planning guide only, not an exact promise of turnaround.';
      function pickupEstimateHtml_() {
        if (!r.pickup_estimate_window) return '';
        return '<div class="status-pickup-estimate">' +
          '<div><div class="status-pickup-label">' + esc(r.pickup_estimate_label || 'Estimated pickup') + '</div><div class="status-pickup-window">' + esc(r.pickup_estimate_window) + '</div>' +
          (r.pickup_estimate_school_days ? '<div class="status-pickup-days">' + esc(r.pickup_estimate_school_days) + '</div>' : '') + '</div>' +
          '<div class="status-pickup-note">' + esc(r.pickup_estimate_note || 'Planning estimate only. Wait for the completed status or technician message before collecting.') + '</div>' +
        '</div>';
      }
      if (active && position > 0 && total > 0) {
        var ahead = Math.max(0, position - 1);
        var pct = total > 1 ? Math.round(((position - 1) / (total - 1)) * 100) : 0;
        pct = Math.max(0, Math.min(100, pct));
        var aheadText = ahead
          ? 'About ' + ahead + ' active job' + (ahead === 1 ? '' : 's') + ' are ahead of this case or already being made. '
          : 'This case is at the front of the active workshop list. ';
        return '<div class="status-position-panel" aria-label="Approximate active-workshop position ' + esc(String(position)) + ' of ' + esc(String(total)) + '">' +
          '<div class="status-position-head"><div><div class="status-position-label">Approx. active-workshop position</div><div class="status-position-main"><strong>' + esc(String(position)) + '</strong><span>of ' + esc(String(total)) + ' active jobs</span></div></div><span class="status-position-chip">Guide only</span></div>' +
          '<div class="status-position-meter" style="--position-pct:' + pct + '%;" aria-hidden="true"></div>' +
          '<div class="status-position-scale" aria-hidden="true"><span>Front</span><span>Later</span></div>' +
          '<div class="status-position-note">' + esc(aheadText + note) + '</div>' +
          pickupEstimateHtml_() +
        '</div>';
      }
      if (status === 'needs_fix') {
        return '<div class="status-position-panel status-position-panel--paused">' +
          '<div class="status-position-head"><div><div class="status-position-label">Queue position</div><div class="status-position-main"><strong>Paused</strong><span>waiting for revision</span></div></div><span class="status-position-chip">Action needed</span></div>' +
          '<div class="status-position-note">' + esc(note) + '</div>' +
          pickupEstimateHtml_() +
        '</div>';
      }
      if (status === 'completed' || status === 'rejected') {
        return '<div class="status-position-panel status-position-panel--closed">' +
          '<div class="status-position-head"><div><div class="status-position-label">Queue position</div><div class="status-position-main"><strong>Closed</strong><span>not in active queue</span></div></div><span class="status-position-chip">No active wait</span></div>' +
          '<div class="status-position-note">' + esc(note) + '</div>' +
          pickupEstimateHtml_() +
        '</div>';
      }
      return '';
    }

    function statusStageLabel_(status) {
      var s = String(status || '');
      if (s === 'submitted') return 'Waiting for human review';
      if (s === 'needs_fix') return 'Paused for revision';
      if (s === 'approved') return 'Approved for scheduling';
      if (s === 'in_queue') return 'Waiting for machine slot';
      if (s === 'in_production') return 'Being fabricated';
      if (s === 'completed') return 'Ready to collect';
      if (s === 'rejected') return 'Follow-up needed';
      return 'Status being checked';
    }

    function statusStudentAction_(r) {
      var s = String((r && r.status) || '');
      if (s === 'submitted') return 'Wait for technician review. Do not submit duplicates unless the original file is wrong.';
      if (s === 'needs_fix') return 'Open your submitted file, fix the feedback, then submit a revised file.';
      if (s === 'approved') return 'No action needed. Keep checking here for queue movement.';
      if (s === 'in_queue') return 'No action needed. The job is waiting for a machine slot.';
      if (s === 'in_production') return 'No action needed. The workshop is making or preparing the job.';
      if (s === 'completed') return 'Collect your work when your teacher or technician says it is ready.';
      if (s === 'rejected') return 'Speak with your teacher before submitting a replacement.';
      return 'Read the latest remarks and ask your teacher if anything is unclear.';
    }

    function statusNextCheckpoint_(r) {
      var s = String((r && r.status) || '');
      if (s === 'submitted') return 'Technician review decides whether the file needs revision or can enter scheduling.';
      if (s === 'needs_fix') return 'After you resubmit, the corrected file goes back for human review.';
      if (s === 'approved') return 'A technician places it into the machine queue when capacity is available.';
      if (s === 'in_queue') return 'The next update should be In Production when the machine slot starts.';
      if (s === 'in_production') return 'The next update should be Completed after fabrication and checks.';
      if (s === 'completed') return 'Check the final piece and tell your teacher if there is a problem.';
      if (s === 'rejected') return 'Your teacher or technician can explain whether a new request is appropriate.';
      return 'The workflow will update as the request is reviewed.';
    }

    function statusMachineChecklist_(r) {
      var machine = String((r && r.machine) || '').toLowerCase();
      var status = String((r && r.status) || '');
      if (status === 'completed') {
        return ['Bring your student ID if collection requires it.', 'Check the finished part before leaving the workshop.', 'Tell your teacher if the result does not match the approved design.'];
      }
      if (status === 'rejected') {
        return ['Read the remarks carefully.', 'Discuss the design goal with your teacher.', 'Submit a new file only when you know what needs to change.'];
      }
      if (machine === '3d') {
        if (status === 'needs_fix') return ['Check that the STL is manifold and closed.', 'Confirm scale and units before exporting.', 'Look for thin walls, unsupported overhangs, and floating parts.'];
        return ['Keep the STL and original CAD file available.', 'Avoid duplicate submissions while waiting.', 'Use the Machines guide if you need to check material or print limits.'];
      }
      if (status === 'needs_fix') return ['Check scale and units in the working file.', 'Use correct line colours for cut, score, and engrave.', 'Remove double lines and convert text to paths if needed.'];
      return ['Keep the working file and preview available.', 'Avoid duplicate submissions while waiting.', 'Use the Machines guide if you need to check material, thickness, or bed size.'];
    }

    function renderStatusNextPanel_(r) {
      var updated = formatDisplayTs(r.updated_at || r.created_at);
      var source = r._source === 'other' ? 'Special request' : 'DT project';
      return '<div class="status-next-grid">' +
        '<div class="status-next-card"><div class="status-next-label">Current step</div><div class="status-next-value">' + esc(statusStageLabel_(r.status)) + '</div><div class="status-next-note">' + esc(source) + ' in the workshop workflow.</div></div>' +
        '<div class="status-next-card"><div class="status-next-label">Your next action</div><div class="status-next-value">' + esc(statusStudentAction_(r)) + '</div></div>' +
        '<div class="status-next-card"><div class="status-next-label">Next checkpoint</div><div class="status-next-value">' + esc(statusNextCheckpoint_(r)) + '</div></div>' +
        '<div class="status-next-card"><div class="status-next-label">Last update</div><div class="status-next-value">' + esc(updated) + '</div><div class="status-next-note">Use this to check whether you are looking at the latest record.</div></div>' +
      '</div>';
    }

    function renderStatusActionPanel_(r) {
      var list = statusMachineChecklist_(r).map(function(item) { return '<li>' + esc(item) + '</li>'; }).join('');
      var revise = String((r && r.status) || '') === 'needs_fix';
      var title = revise ? 'Revision checklist' : 'Useful checks while you wait';
      return '<div class="status-action-panel ' + (revise ? 'status-action-panel--revise' : '') + '">' +
        '<div class="status-action-title">' + (revise ? '&#9888;' : '&#128161;') + ' ' + title + '</div>' +
        '<ul class="status-action-list">' + list + '</ul>' +
      '</div>';
    }

    function renderStatusFileActions_(r) {
      if (r.lookup_limited) {
        return '<div class="status-file-actions"><span class="status-file-note">' + esc(r.lookup_limited_reason || 'Sign in with the matching school account to view submitted file links.') + '</span></div>';
      }
      var links = [];
      if (r.working_file_url) links.push('<a class="btn btn-ghost btn-sm" href="' + esc(r.working_file_url) + '" target="_blank" rel="noopener">&#128196; Open Working File</a>');
      if (r.preview_file_url) links.push('<a class="btn btn-ghost btn-sm" href="' + esc(r.preview_file_url) + '" target="_blank" rel="noopener">&#128444; Open Preview</a>');
      if (r.status === 'needs_fix') {
        links.push('<button type="button" class="btn btn-primary btn-sm" onclick="switchPage(&#39;' + (r._source === 'other' ? 'other' : 'submit') + '&#39;)">&#8635; Submit Revised File</button>');
      }
      if (!links.length) return '<div class="status-file-actions"><span class="status-file-note">File links are not available for this record. This can happen for older imported rows or if the upload was not stored with a link.</span></div>';
      return '<div class="status-file-actions">' + links.join('') + '<span class="status-file-note">Drive may ask you to sign in with your school account. These links reopen the files stored with the original submission.</span></div>';
    }

    function copyStatusId_(id) {
      id = String(id || '').trim();
      if (!id) {
        showToast('No ID available to copy.', 'error');
        return;
      }
      writeClipboard_(id, 'Reference copied.');
    }

    function renderStatusIdActions_(r) {
      var caseNo = requestCaseNumber_(r);
      if (/^[AM]---$/i.test(caseNo)) caseNo = '';
      if (!caseNo) return '';
      return '<div class="status-id-actions">' +
        '<button type="button" class="btn btn-primary btn-sm" data-copy-id="' + esc(caseNo) + '" onclick="copyStatusId_(this.dataset.copyId)">&#128203; Copy Case Number</button>' +
        '<span class="status-file-note">Quote the case number when asking a teacher or technician about this job.</span></div>';
    }

    function statusLoadState_(load) {
      return queueLoadState_(load);
    }

    function statusPct_(value, total) {
      value = Math.max(0, Number(value || 0));
      total = Math.max(0, Number(total || 0));
      if (!total || !value) return 0;
      return Math.max(7, Math.min(100, Math.round((value / total) * 100)));
    }

    function statusLaneHtml_(label, note, value, total, cls) {
      var pct = statusPct_(value, total);
      return '<div class="status-workload-lane">' +
        '<div class="status-workload-lane-label">' + esc(label) + '</div>' +
        '<div class="status-workload-lane-note">' + esc(note) + '</div>' +
        '<div class="status-workload-lane-bar" aria-hidden="true"><div class="status-workload-lane-fill ' + cls + '" style="width:' + pct + '%;"></div></div>' +
      '</div>';
    }

    function renderStatusRequestTrend_(timeline) {
      var days = timeline && timeline.days ? timeline.days : [];
      if (!days.length) return '';
      var windowDays = Math.max(7, Math.min(14, Number((timeline && timeline.range_days) || 14)));
      days = days.slice(-windowDays);
      var w = 420;
      var h = 156;
      var left = 12;
      var right = 12;
      var top = 12;
      var bottom = 26;
      var chartW = w - left - right;
      var chartH = h - top - bottom;
      var max = Math.max(1, Number(timeline.max_total || 0));
      days.forEach(function(day) { max = Math.max(max, Number(day.total || 0)); });
      var points = days.map(function(day, idx) {
        var x = left + (days.length === 1 ? chartW : (idx / (days.length - 1)) * chartW);
        var y = top + chartH - (Number(day.total || 0) / max) * chartH;
        return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, day: day };
      });
      var pointText = points.map(function(p) { return p.x + ',' + p.y; }).join(' ');
      var areaText = left + ',' + (top + chartH) + ' ' + pointText + ' ' + (left + chartW) + ',' + (top + chartH);
      var labelIndexes = days.map(function(_, idx) { return idx; }).filter(function(idx) {
        return days.length <= 8 || idx === 0 || idx === days.length - 1 || idx % 2 === 0;
      });
      var dotHtml = points.map(function(p) {
        var count = Number(p.day.total || 0);
        return '<g><title>' + esc(p.day.label + ': ' + count + ' request' + (count === 1 ? '' : 's') + ' (' + Number(p.day.dt || 0) + ' DT, ' + Number(p.day.special || 0) + ' Special)') + '</title><circle class="status-trend-dot" cx="' + p.x + '" cy="' + p.y + '" r="3.3"></circle></g>';
      }).join('');
      var labelHtml = labelIndexes.map(function(idx) {
        var p = points[idx];
        return '<text class="status-trend-label" x="' + p.x + '" y="' + (h - 9) + '" text-anchor="middle">' + esc(p.day.label) + '</text>';
      }).join('');
      var latest = days[days.length - 1] || {};
      var peak = days.reduce(function(best, day) {
        return Number(day.total || 0) > Number((best && best.total) || 0) ? day : best;
      }, days[0] || {});
      var windowTotal = days.reduce(function(sum, day) { return sum + Number(day.total || 0); }, 0);
      var summaryHtml = '<div class="status-trend-summary" aria-label="Request trend summary">' +
        '<span title="' + esc((latest.label || 'Latest day') + ': ' + Number(latest.total || 0) + ' request(s)') + '"><strong>Latest</strong>' + esc(latest.label || 'Today') + '</span>' +
        '<span title="' + esc((peak.label || 'Peak day') + ': ' + Number(peak.total || 0) + ' request(s)') + '"><strong>Peak</strong>' + esc(peak.label || '') + '</span>' +
        '<span title="' + esc(windowDays + '-day total: ' + windowTotal + ' request(s)') + '"><strong>Window</strong>' + windowDays + ' days</span>' +
      '</div>';
      return '<div class="status-trend-panel">' +
        '<div class="status-trend-head"><div><div class="status-trend-title">Request activity</div><div class="status-trend-note">Daily volume only. No names or files.</div></div><span class="status-trend-pill">' + windowDays + ' days</span></div>' +
        '<svg class="status-trend-chart" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + windowDays + '-day daily request volume line graph. Latest day ' + esc(latest.label || '') + ' has ' + esc(String(latest.total || 0)) + ' request(s).">' +
          '<line class="status-trend-grid" x1="' + left + '" y1="' + top + '" x2="' + (left + chartW) + '" y2="' + top + '"></line>' +
          '<line class="status-trend-grid" x1="' + left + '" y1="' + (top + chartH / 2) + '" x2="' + (left + chartW) + '" y2="' + (top + chartH / 2) + '"></line>' +
          '<line class="status-trend-axis" x1="' + left + '" y1="' + (top + chartH) + '" x2="' + (left + chartW) + '" y2="' + (top + chartH) + '"></line>' +
          '<polygon class="status-trend-area" points="' + areaText + '"></polygon>' +
          '<polyline class="status-trend-line" points="' + pointText + '"></polyline>' +
          dotHtml +
          labelHtml +
        '</svg>' +
        summaryHtml +
      '</div>';
    }

    function renderRulesThroughputTimeline_(timeline) {
      var days = timeline && timeline.days ? timeline.days.slice(-30) : [];
      if (!days.length) return '<div class="alert alert-neutral"><span class="alert-icon">&#128200;</span><span>No throughput data available yet.</span></div>';
      var windowDays = Math.max(7, Math.min(30, Number((timeline && timeline.range_days) || 30)));
      var w = 760;
      var h = 280;
      var left = 38;
      var right = 18;
      var top = 26;
      var bottom = 38;
      var chartW = w - left - right;
      var chartH = h - top - bottom;
      var max = Math.max(1, Number(timeline.max_total || 0));
      days.forEach(function(day) { max = Math.max(max, Number(day.submitted || 0), Number(day.finished || 0)); });
      var yFor = function(value) {
        return Math.round((top + chartH - (Number(value || 0) / max) * chartH) * 10) / 10;
      };
      var points = days.map(function(day, idx) {
        var x = left + (days.length === 1 ? chartW : (idx / (days.length - 1)) * chartW);
        return {
          x: Math.round(x * 10) / 10,
          submittedY: yFor(day.submitted),
          finishedY: yFor(day.finished),
          day: day
        };
      });
      var submittedLine = points.map(function(p) { return p.x + ',' + p.submittedY; }).join(' ');
      var finishedLine = points.map(function(p) { return p.x + ',' + p.finishedY; }).join(' ');
      var gridValues = [max, Math.round(max / 2), 0].filter(function(v, idx, arr) { return idx === arr.indexOf(v); });
      var gridHtml = gridValues.map(function(value) {
        var y = yFor(value);
        return '<g><line class="rules-throughput-grid" x1="' + left + '" y1="' + y + '" x2="' + (left + chartW) + '" y2="' + y + '"></line><text class="rules-throughput-label" x="' + (left - 10) + '" y="' + (y + 3) + '" text-anchor="end">' + esc(String(value)) + '</text></g>';
      }).join('');
      var labelIndexes = days.map(function(_, idx) { return idx; }).filter(function(idx) {
        return idx === 0 || idx === days.length - 1 || idx % 3 === 0;
      });
      var labelHtml = labelIndexes.map(function(idx) {
        var p = points[idx];
        return '<text class="rules-throughput-label" x="' + p.x + '" y="' + (h - 12) + '" text-anchor="middle">' + esc(p.day.label) + '</text>';
      }).join('');
      var dotHtml = points.map(function(p) {
        var d = p.day;
        var submitted = Number(d.submitted || 0);
        var finished = Number(d.finished || 0);
        var title = d.label + ': ' + submitted + ' submitted (' + Number(d.submitted_dt || 0) + ' DT, ' + Number(d.submitted_special || 0) + ' Special); ' + finished + ' finished (' + Number(d.finished_dt || 0) + ' DT, ' + Number(d.finished_special || 0) + ' Special)';
        return '<g><title>' + esc(title) + '</title>' +
          '<circle class="rules-throughput-dot-submitted" cx="' + p.x + '" cy="' + p.submittedY + '" r="3.3"></circle>' +
          '<circle class="rules-throughput-dot-finished" cx="' + p.x + '" cy="' + p.finishedY + '" r="3.3"></circle>' +
          (submitted > 0 ? '<text class="rules-throughput-submitted-label" x="' + p.x + '" y="' + Math.max(11, p.submittedY - 8) + '" text-anchor="middle">' + esc(String(submitted)) + '</text>' : '') +
          (finished > 0 ? '<text class="rules-throughput-finished-label" x="' + p.x + '" y="' + Math.min(h - bottom - 2, p.finishedY + 15) + '" text-anchor="middle">' + esc(String(finished)) + '</text>' : '') +
        '</g>';
      }).join('');
      var latest = days[days.length - 1] || {};
      var peakSubmitted = days.reduce(function(best, day) {
        return Number(day.submitted || 0) > Number((best && best.submitted) || 0) ? day : best;
      }, days[0] || {});
      var peakFinished = days.reduce(function(best, day) {
        return Number(day.finished || 0) > Number((best && best.finished) || 0) ? day : best;
      }, days[0] || {});
      var totalSubmitted = days.reduce(function(sum, day) { return sum + Number(day.submitted || 0); }, 0);
      var totalFinished = days.reduce(function(sum, day) { return sum + Number(day.finished || 0); }, 0);
      var summaryHtml = '<div class="rules-throughput-summary" aria-label="30-day queue throughput summary">' +
        '<span><strong>Latest</strong>' + esc(latest.label || 'Today') + ': ' + Number(latest.submitted || 0) + ' submitted, ' + Number(latest.finished || 0) + ' finished</span>' +
        '<span><strong>Peak submitted</strong>' + esc(peakSubmitted.label || '') + ': ' + Number(peakSubmitted.submitted || 0) + '</span>' +
        '<span><strong>Peak finished</strong>' + esc(peakFinished.label || '') + ': ' + Number(peakFinished.finished || 0) + '</span>' +
        '<span><strong>30-day total</strong>' + totalSubmitted + ' submitted, ' + totalFinished + ' finished</span>' +
      '</div>';
      return '<div class="rules-throughput-panel">' +
        '<div class="rules-throughput-head"><div><div class="rules-throughput-title">30-day queue throughput</div><div class="rules-throughput-note">Blue shows tasks submitted that day. Green shows tasks finished that day. Numbers label each daily count.</div></div>' +
        '<div class="rules-throughput-legend"><span><i class="rules-throughput-key"></i>Submitted</span><span><i class="rules-throughput-key rules-throughput-key--finished"></i>Finished</span></div></div>' +
        '<svg class="rules-throughput-chart" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="Admin 30-day queue throughput graph showing submitted and finished tasks per day.">' +
          gridHtml +
          '<line class="rules-throughput-axis" x1="' + left + '" y1="' + (top + chartH) + '" x2="' + (left + chartW) + '" y2="' + (top + chartH) + '"></line>' +
          '<polyline class="rules-throughput-line-submitted" points="' + submittedLine + '"></polyline>' +
          '<polyline class="rules-throughput-line-finished" points="' + finishedLine + '"></polyline>' +
          dotHtml +
          labelHtml +
        '</svg>' +
        summaryHtml +
      '</div>';
    }

    function updateStatusQueuePanel_(snapshot) {
      var target = document.getElementById('statusQueueGlobal');
      var pill = document.getElementById('statusQueueHealthPill');
      if (!target || !snapshot || !snapshot.counts) return;
      var c = snapshot.counts;
      var load = Number(c.active_queue || 0);
      var state = statusLoadState_(load);
      var revealThreshold = Number((snapshot.thresholds || {}).student_count_reveal || 50);
      var revealQueueCount = load > revealThreshold;
      var waitingReview = Number(c.waiting_review || 0);
      var readyWait = Number(c.approved_ready || 0) + Number(c.in_queue || 0);
      var inProduction = Number(c.in_production || 0);
      var waitingStudent = Number(c.waiting_student || 0);
      var laneTotal = Math.max(1, waitingReview + readyWait + inProduction + waitingStudent);
      var laserActive = Number(c.laser_active || 0);
      var printActive = Number(c.print3d_active || 0);
      var machineTotal = laserActive + printActive;
      var laserPct = machineTotal ? Math.round((laserActive / machineTotal) * 100) : 0;
      var printPct = machineTotal ? 100 - laserPct : 0;
      if (laserActive && laserPct < 8) laserPct = 8;
      if (printActive && printPct < 8) printPct = 8;
      var loadPct = queueLoadPct_(load);
      var notice = (snapshot.laser_capacity_notice || LASER_CAPACITY_NOTICE || {});
      var capacityHtml = notice && notice.active !== false
        ? '<div class="status-workload-alert"><strong>Laser capacity update:</strong> ' + esc(notice.summary || 'One laser cutter is currently offline. Only one laser cutter is running.') + '</div>'
        : '';
      var machineCards = document.getElementById('queueMachineStatusCards');
      if (machineCards) {
        var laserCopy = notice && notice.active !== false
          ? (notice.summary || 'One laser cutter is currently offline. Laser jobs may move more slowly than usual.')
          : 'Laser cutting is running under normal workshop capacity. Technician review and queue order still apply.';
        var printCopy = load > QUEUE_HEAVY_THRESHOLD
          ? '3D printing is part of a heavy workshop workload. Print time, model size, and technician checks affect scheduling.'
          : '3D printing is running. Jobs are scheduled after file review, printability checks, and available machine time.';
        machineCards.innerHTML =
          '<div class="status-help-card"><div class="status-help-icon">&#128293;</div><div class="status-help-title">Laser cutting</div><div class="status-help-copy">' + esc(laserCopy) + '</div></div>' +
          '<div class="status-help-card"><div class="status-help-icon">&#9881;</div><div class="status-help-title">3D printing</div><div class="status-help-copy">' + esc(printCopy) + '</div></div>';
      }
      var trendHtml = renderStatusRequestTrend_(snapshot.daily_request_timeline);
      if (pill) {
        pill.textContent = state.label.toUpperCase();
        pill.className = 'pill pill-submitted';
      }
      target.setAttribute('aria-label', 'Whole-workshop workload is ' + state.label.toLowerCase() + (revealQueueCount ? ', with ' + load + ' active queue items.' : '.') + ' This is workload context, not a turnaround promise.');
      var queueCountHtml = revealQueueCount
        ? '<div class="status-workload-count" aria-label="Current active queue count"><strong>' + esc(String(load)) + '</strong><span>active queue items</span></div>'
        : '';
      var healthHtml = '<div class="status-health-panel"><div class="status-workload-head">' +
          '<div><div class="status-workload-kicker">Whole-workshop workload</div><div class="status-workload-title">Current queue pressure for planning</div>' + queueCountHtml + '</div>' +
          '<span class="status-workload-state status-workload-state--' + state.key + '">' + esc(state.label) + '</span>' +
        '</div>' +
        '<div class="status-workload-bar" aria-hidden="true"><div class="status-workload-fill ' + state.fill + '" style="width:' + loadPct + '%;"></div></div>' +
        '<div class="status-workload-scale" aria-hidden="true"><span>Light</span><span>Steady</span><span>Busy from ' + QUEUE_BUSY_THRESHOLD + '</span><span>Heavy &gt; ' + QUEUE_HEAVY_THRESHOLD + '</span></div>' +
        '<div class="status-workload-lanes" aria-hidden="true">' +
          statusLaneHtml_('First review', 'Waiting for human review', waitingReview, laneTotal, 'status-workload-lane-fill--review') +
          statusLaneHtml_('Ready / queued', 'Approved or waiting for a slot', readyWait, laneTotal, 'status-workload-lane-fill--ready') +
          statusLaneHtml_('In production', 'Being fabricated or prepared', inProduction, laneTotal, 'status-workload-lane-fill--production') +
          statusLaneHtml_('Revision pause', 'Waiting for student updates', waitingStudent, laneTotal, 'status-workload-lane-fill--revision') +
        '</div>' +
        '<div class="status-workload-machine" aria-hidden="true">' +
          '<div class="status-machine-head"><span>Machine mix</span><span>Laser and 3D workload</span></div>' +
          '<div class="status-machine-mix"><div class="status-machine-laser" style="flex-basis:' + laserPct + '%;"></div><div class="status-machine-print" style="flex-basis:' + printPct + '%;"></div></div>' +
          '<div class="status-machine-legend"><span><i class="status-machine-dot"></i>Laser</span><span><i class="status-machine-dot status-machine-dot--print"></i>3D printing</span></div>' +
        '</div>' +
        capacityHtml +
        '<div class="status-workload-foot">Updated recently. This is workload context only, not an exact promise of turnaround.</div></div>';
      target.innerHTML = '<div class="status-workload-layout">' + healthHtml + trendHtml + '</div>';
    }

    function loadStatusQueueSnapshot_() {
      var target = document.getElementById('statusQueueGlobal');
      if (!target) return;
      google.script.run
        .withSuccessHandler(updateStatusQueuePanel_)
        .withFailureHandler(function() {
          target.textContent = 'Queue health is temporarily unavailable. Your individual status cards are still current.';
        })
        .getQueueHealthSnapshot();
    }

    function renderStatusSummary_(rows) {
      var c = summarizeStatusRows_(rows);
      return '<div class="status-summary"><div class="summary-card"><div class="num">' + c.total + '</div><div class="lbl">Total</div></div><div class="summary-card"><div class="num">' + c.queue + '</div><div class="lbl">Active Queue</div></div><div class="summary-card"><div class="num">' + c.review + '</div><div class="lbl">Review</div></div><div class="summary-card"><div class="num">' + (c.approved_ready + c.in_queue) + '</div><div class="lbl">Prod Wait</div></div><div class="summary-card"><div class="num">' + c.needs_fix + '</div><div class="lbl">Needs Fix</div></div><div class="summary-card"><div class="num">' + c.completed + '</div><div class="lbl">Done</div></div></div>';
    }

    function isStudentStatusView_() {
      return !!_studentPreviewActive || !((BOOT.currentUser || {}).isAdmin);
    }

    function statusEmptyStateHtml_() {
      var student = isStudentStatusView_();
      var copy = student
        ? 'Enter your school email to see all your submissions, or paste a case number such as M720 or A015 to look up one entry.'
        : 'Enter an email to see related submissions, or paste a case number, Submission ID, or Request ID to look up one entry.';
      var title = student ? 'Enter Email or Case Number' : 'Enter Email or ID';
      var help = student ? 'Use your school email or the case number from your receipt.' : 'Use an email, case number, Submission ID, or Request ID.';
      return '<div id="statusEmptyState" class="status-empty-state"><div class="status-empty-icon">&#128269;</div><p class="status-empty-title">No search yet</p><p class="status-empty-copy">' + copy + '</p><div class="status-help-grid"><div class="status-help-card"><div class="status-help-icon">&#128232;</div><div class="status-help-title">' + title + '</div><div class="status-help-copy">' + help + '</div></div><div class="status-help-card"><div class="status-help-icon">&#128270;</div><div class="status-help-title">Search Both Paths</div><div class="status-help-copy">DT submissions and special requests are checked together.</div></div><div class="status-help-card"><div class="status-help-icon">&#128200;</div><div class="status-help-title">Track Next Step</div><div class="status-help-copy">Read the timeline, remarks, and any revision request.</div></div></div></div>';
    }

    function focusStatusSearch_() {
      var inp = document.getElementById('statusQuery');
      if (inp) { inp.focus(); inp.select(); }
    }

    function clearStatusSearch_() {
      var inp = document.getElementById('statusQuery');
      if (inp) { inp.value = ''; inp.focus(); }
      setMsg('statusMsg', isStudentStatusView_() ? 'Search cleared. Enter your school email or case number.' : 'Search cleared. Enter an email, case number, or exact ID.', 'muted');
      var results = document.getElementById('statusResults');
      if (results) results.innerHTML = statusEmptyStateHtml_();
    }

    function loadStatuses() {
      var q = document.getElementById('statusQuery').value.trim();
      if (!q) { setMsg('statusMsg', isStudentStatusView_() ? 'Please enter your email or case number.' : 'Please enter an email, case number, or submission ID.', 'error'); return; }
      setMsg('statusMsg','Searching\\u2026','muted');
      var statusBtn = document.getElementById('statusSearchBtn') || document.querySelector('#page-status .status-search-panel .btn-primary');
      if (statusBtn) { statusBtn.disabled = true; statusBtn.innerHTML = '\\u23f3 Searching\\u2026'; }
      var dtRows = null, orRows = null, dtDone = false, orDone = false, hadError = false;
      function merge() {
        if (!dtDone || !orDone || hadError) return;
        setMsg('statusMsg','','');
        if (statusBtn) { statusBtn.disabled = false; statusBtn.innerHTML = '&#128270; Check Status'; }
        /* Tag each row with source type */
        (dtRows||[]).forEach(function(r){ r._source = 'dt'; });
        (orRows||[]).forEach(function(r){ r._source = 'other'; r.submission_id = r.submission_id || r.request_id; });
        var all = (dtRows||[]).concat(orRows||[]);
        all.sort(function(a,b){ return new Date(b.created_at) - new Date(a.created_at); });
        var el = document.getElementById('statusResults');
        if (!all.length) {
          el.innerHTML = isStudentStatusView_()
            ? '<div class="alert alert-warning"><span class="alert-icon">\\ud83d\\udd0d</span><span><strong>No submissions found.</strong> Try your full school email or the case number from the confirmation message. If you still cannot find it, ask your teacher or the technician team to confirm which email was used.</span></div>'
            : '<div class="alert alert-warning"><span class="alert-icon">\\ud83d\\udd0d</span><span><strong>No submissions found.</strong> Try the full email, case number, Submission ID, or Request ID exactly as shown in the record. If you still cannot find it, confirm which email was used.</span></div>';
          return;
        }
        function renderCard(r) {
          var caseNo = requestCaseNumber_(r);
          var caseBadge = '<span class="case-badge">' + esc(caseNo) + '</span>';
          var dims = [r.width,r.height,r.depth].filter(function(v){ return v && String(v)!=='0'; });
          var msg = STATUS_MSG[r.status] || '';
          var progress = statusProgress(r.status);
          var owner = statusOwner(r.status);
          var extra = '';
          if (r.status === 'needs_fix') {
            extra = '<div class="sub-card-msg msg-needs_fix"><strong>Action required:</strong> Review the feedback below, fix your file, and resubmit through the Dashboard.</div>';
            var daysWaiting = 0;
            var rawDate = new Date(r.updated_at || r.created_at || '');
            if (!isNaN(rawDate.getTime())) daysWaiting = Math.floor((Date.now() - rawDate.getTime()) / 86400000);
            if (daysWaiting >= 3) {
              extra += '<div class="alert alert-warning" style="margin-top:10px;"><span class="alert-icon">&#9888;</span><span><strong>Waiting for revision:</strong> ' + daysWaiting + ' day(s) since the last update.</span></div>';
            }
          }
          else if (msg) extra = '<div class="sub-card-msg msg-' + esc(r.status) + '">' + esc(msg) + '</div>';
          if (r.issue_label || r.admin_remarks) {
            extra += '<div class="sub-card-msg" style="white-space:normal;">' +
              '<strong>Technician feedback</strong>' +
              (r.issue_label ? '<div style="margin-top:6px;"><strong>Issue:</strong> ' + esc(r.issue_label) + '</div>' : '') +
              (r.admin_remarks ? '<div style="margin-top:6px;white-space:pre-wrap;"><strong>Remarks:</strong> ' + esc(r.admin_remarks) + '</div>' : '') +
            '</div>';
          }
          if (r.lookup_limited) {
            extra += '<div class="alert alert-info" style="margin-top:10px;"><span class="alert-icon">&#8505;</span><span>' + esc(r.lookup_limited_reason || 'For privacy, only limited status information is shown.') + '</span></div>';
          }
          var sourceTag = '<span style="margin-left:6px;">' + sourcePill(r._source) + '</span>';
          var titleLabel = r._source === 'other'
            ? esc(r.project_name||'Special Request') + ' \\u2013 ' + esc(MACHINE_LABELS[r.machine]||r.machine)
            : esc(MACHINE_LABELS[r.machine]||r.machine) + ' \\u2013 ' + esc(r.material||'\\u2014');
          var detailFields = '';
          if (r._source === 'other') {
            detailFields =
              '<div class="sub-card-field"><label>Case Number</label><div class="val">' + caseBadge + '</div></div>' +
              '<div class="sub-card-field"><label>Type</label><div class="val">' + esc(r.request_type||'\\u2014') + '</div></div>' +
              '<div class="sub-card-field"><label>Dept</label><div class="val">' + esc(r.department_or_subject||'\\u2014') + '</div></div>' +
              '<div class="sub-card-field"><label>Teacher</label><div class="val">' + esc(r.teacher_in_charge||'\\u2014') + '</div></div>' +
              (dims.length ? '<div class="sub-card-field"><label>Size</label><div class="val">' + dims.join('\\u00d7') + ' ' + esc(r.units||'') + '</div></div>' : '') +
              '<div class="sub-card-field"><label>Updated</label><div class="val">' + esc(formatDisplayTs(r.updated_at)) + '</div></div>';
          } else {
            detailFields =
              '<div class="sub-card-field"><label>Case Number</label><div class="val">' + caseBadge + '</div></div>' +
              '<div class="sub-card-field"><label>Year</label><div class="val">' + esc(r.year_group||'\\u2014') + '</div></div>' +
              '<div class="sub-card-field"><label>Class</label><div class="val">' + esc(r.design_class_no||'\\u2014') + '</div></div>' +
              '<div class="sub-card-field"><label>Teacher</label><div class="val">' + esc(r.design_teacher||'\\u2014') + '</div></div>' +
              '<div class="sub-card-field"><label>Prototype</label><div class="val">' + esc(formatPrototypeFidelityLabel_(r.prototype_fidelity) || '\u2014') + '</div></div>' +
              (dims.length ? '<div class="sub-card-field"><label>Size</label><div class="val">' + dims.join('\\u00d7') + ' ' + esc(r.units||'') + '</div></div>' : '') +
              '<div class="sub-card-field"><label>Updated</label><div class="val">' + esc(formatDisplayTs(r.updated_at)) + '</div></div>';
          }
          return '<div class="sub-card">' +
            '<div class="sub-card-head"><div><div class="sub-card-title">' + caseBadge + ' ' + titleLabel + sourceTag + '</div><div class="sub-card-meta">Submitted ' + esc(formatDisplayTs(r.created_at)) + '</div></div>' + statusPill(r.status) + '</div>' +
            '<div class="progress-strip"><div class="progress-fill" style="width:' + progress + '%"></div></div>' +
            '<div class="progress-meta"><span>Progress: ' + progress + '%</span><span>Owner: ' + esc(owner) + '</span></div>' +
            buildTimeline(r.status) +
            '<div class="status-stage"><strong>Queue meaning:</strong> ' + esc(statusQueueMeaning_(r.status)) + '</div>' +
            renderStatusQueuePosition_(r) +
            renderStatusNextPanel_(r) +
            renderStatusActionPanel_(r) +
            '<div class="sub-card-body">' + detailFields + '</div>' +
            renderStatusIdActions_(r) +
            '<div class="status-file-title">&#128193; Submitted files and evidence</div>' +
            renderStatusFileActions_(r) + extra + '</div>';
        }
        var statusHtml = renderStatusSummary_(all) +
          '<div class="alert alert-info status-activity-banner"><span class="alert-icon">&#128200;</span><span><strong>Need workshop workload context?</strong> Open <button type="button" class="btn btn-ghost btn-sm" onclick="switchPage(&#39;queue&#39;)" style="margin-left:6px;">Queue Status</button> for the queue graph and machine capacity view.</span></div>';
        var topActivity = all[0] && all[0]._activity ? all[0]._activity : null;
        if (topActivity && (Number(topActivity.counts.total || 0) >= 2 || Number(topActivity.last24_count || 0) >= 2)) {
          statusHtml += '<div class="alert alert-info status-activity-banner"><span class="alert-icon">&#128202;</span><span><strong>Recent activity for this requester:</strong> ' + Number(topActivity.counts.total || 0) + ' request(s) today and ' + Number(topActivity.last24_count || 0) + ' in the last 24 hours. Review the latest record carefully before resubmitting or chasing the queue.</span></div>';
        }
        statusHtml += all.map(renderCard).join('');
        el.innerHTML = statusHtml;
      }
      function onError(err) { if (!hadError) { hadError = true; setMsg('statusMsg', err.message||String(err), 'error'); if (statusBtn) { statusBtn.disabled = false; statusBtn.innerHTML = '&#128270; Check Status'; } } }
      google.script.run.withSuccessHandler(function(rows){ dtRows = rows; dtDone = true; merge(); }).withFailureHandler(onError).getStudentStatuses(q);
      google.script.run.withSuccessHandler(function(rows){ orRows = rows; orDone = true; merge(); }).withFailureHandler(onError).getOtherRequestStatuses(q);
    }

    /* ================================================
       ADMIN PAGE
    ================================================ */
    function initAdminPage() {
      if (!BOOT.currentUser.isAdmin) return;
      ['filterYear','filterMachine','filterMaterial','filterStatus'].forEach(initCheckboxFilter_);
      ['filterSource'].forEach(function(id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('change', function() {
          _activeQueueLane = '';
          updateLaneActive_();
          updateStatActive_();
          loadAdminRows();
        });
      });
      var sortEl = document.getElementById('filterSort');
      if (sortEl) sortEl.addEventListener('change', loadAdminRows);
      var teacherEl = document.getElementById('filterTeacher');
      if (teacherEl) teacherEl.addEventListener('change', loadAdminRows);
      var caseEl = document.getElementById('filterCaseNo');
      if (caseEl) caseEl.addEventListener('input', function() { debounce_('adminCaseFilter', loadAdminRows, 160); });
      var quickEl = document.getElementById('filterQuick');
      if (quickEl) quickEl.addEventListener('input', function() { debounce_('adminQuickFilter', loadAdminRows, 250); });
      updateLaneActive_();
      updateStatActive_();
      ['filterTeacher','filterClass','filterStudentEmail'].forEach(function(id) {
        var el = document.getElementById(id); if (el) el.addEventListener('input', function() { debounce_('adminFilter', loadAdminRows, 400); });
      });
      var mine = document.getElementById('filterMineOnly');
      if (mine) { mine.addEventListener('change', loadAdminRows); if (BOOT.currentUser.role === 'teacher') mine.checked = true; }
      loadAdminRows();
    }

    /* ---------- ADMIN TABLE ---------- */

    function getIssueOptionsForMachine(machine) {
      return (BOOT.issueTemplates||[]).filter(function(t){ return !t.applies_to || t.applies_to === machine; });
    }

    function setStatCard(status, count) { var el = document.getElementById('stat_' + status); if (el) el.textContent = count; }

    var _adminRows = [];
    var _adminRawRows = [];
    var _adminRawKey = null;
    var _adminRequestSeq = 0;
    var _adminRenderState = { rows: [], next: 0, chunk: 80 };

    function createClientActivity_() {
      return { counts: { total: 0, dt: 0, special: 0 }, last24_count: 0, recent: [] };
    }
    function rowRequesterEmail_(row) {
      return String((row && (row.student_email || row.requester_email)) || '').trim().toLowerCase();
    }
    function attachClientActivity_(rows) {
      rows = rows || [];
      var map = {};
      rows.forEach(function(row) {
        var email = rowRequesterEmail_(row);
        if (email && !map[email]) map[email] = createClientActivity_();
      });
      var today = formatDisplayTs(new Date()).substring(0, 10);
      var cutoff = Date.now() - 86400000;
      rows.forEach(function(row) {
        var email = rowRequesterEmail_(row);
        if (!email || !map[email]) return;
        var created = new Date(row.created_at || '');
        var createdMs = isNaN(created.getTime()) ? 0 : created.getTime();
        var createdLabel = formatDisplayTs(row.created_at);
        if (createdLabel.substring(0, 10) === today) {
          if (row._source === 'other') map[email].counts.special++;
          else map[email].counts.dt++;
        }
        if (createdMs && createdMs >= cutoff) map[email].last24_count++;
        map[email].recent.push({
          source: row._source || 'dt',
          id: row.submission_id || row.request_id || '',
          created_at: row.created_at || '',
          label: row._source === 'other'
            ? (row.project_name || row.request_type || 'Special Request')
            : ('DT Student Project - ' + (MACHINE_LABELS[row.machine] || row.machine || 'Fabrication')),
          sort_time: createdMs
        });
      });
      Object.keys(map).forEach(function(email) {
        var a = map[email];
        a.counts.total = a.counts.dt + a.counts.special;
        a.recent = a.recent.sort(function(x, y) { return y.sort_time - x.sort_time; }).slice(0, 3);
      });
      rows.forEach(function(row) {
        row._activity = map[rowRequesterEmail_(row)] || createClientActivity_();
      });
      return rows;
    }
    function adminRenderChunkSize_() {
      return window.innerWidth < 700 ? 35 : 80;
    }
    function currentUserCanOperateQueue_() {
      var role = (BOOT.currentUser || {}).role;
      return role === 'admin' || role === 'technician';
    }
    function renderQueueRowHtml_(r, idx) {
      var caseNo = requestCaseNumber_(r);
      var caseHtml = '<div class="queue-case-line"><span class="case-badge">' + esc(caseNo) + '</span></div>';
      var dims = [r.width,r.height,r.depth].filter(function(v){ return v && String(v)!=='0'; });
      var machineLabel = esc(MACHINE_LABELS[r.machine]||r.machine||'');
      var materialLabel = esc(r.material||'\u2014');
      var prototypeLabel = r._source === 'other' ? '' : formatPrototypeFidelityLabel_(r.prototype_fidelity);
      var dimsLabel = dims.length ? dims.join('\u00d7') + ' ' + esc(r.units||'') : '\u2014';
      var submittedMeta = queueTimeMeta(r.created_at);
      var updatedMeta = queueTimeMeta(r.updated_at);
      var statusNote = queueStatusNote(r);
      var progress = statusProgress(r.status);
      var requesterCell = r._source === 'other'
        ? '<td class="queue-cell-requester" data-label="Requester">' + caseHtml + '<div class="queue-name">' + esc(r.requester_name||'\u2014') + '</div><div class="queue-meta-aux">' + esc(r.requester_email||'') + '</div><div class="queue-meta">' + esc(r.project_name || 'Untitled Special Request') + '</div><div class="queue-meta-aux">Sponsor: ' + esc(r.teacher_in_charge || '\u2014') + (r.department_or_subject ? ' · ' + esc(r.department_or_subject) : '') + '</div></td>'
        : '<td class="queue-cell-requester" data-label="Requester">' + caseHtml + '<div class="queue-name">' + esc(r.student_name||'\u2014') + '</div><div class="queue-meta-aux">' + esc(r.student_email||'') + '</div><div class="queue-meta">Class ' + esc(r.design_class_no||'\u2014') + ' · ' + esc(r.year_group||'\u2014') + '</div><div class="queue-meta-aux">Teacher: ' + esc(r.design_teacher||'\u2014') + '</div></td>';
      var contextCell = '<td class="queue-cell-context" data-label="Job"><div class="queue-context"><div class="queue-context-top">' + sourcePill(r._source) + (prototypeLabel ? prototypePill(r.prototype_fidelity) : '') + '</div><div class="queue-context-main">' + machineLabel + '</div><div class="queue-context-sub">' + materialLabel + (dims.length ? ' · ' + dimsLabel : '') + '</div>' + (prototypeLabel ? '<div class="queue-context-sub">Prototype: ' + esc(prototypeLabel) + '</div>' : '') + (r._source === 'other' && r.project_purpose ? '<div class="queue-context-sub">' + esc(r.project_purpose) + '</div>' : '') + '</div></td>';
      var statusCell = '<td class="queue-cell-status" data-label="Status"><div class="queue-status-block">' + statusPill(r.status) + '<div class="queue-mini-progress" title="Workflow progress"><span style="width:' + progress + '%"></span></div><div class="queue-next-owner">' + esc(statusOwner(r.status)) + '</div><div class="queue-status-note">' + esc(statusActionHint(r.status)) + '</div>' + (statusNote ? '<div class="queue-status-aux">' + esc(statusNote) + '</div>' : '') + '</div></td>';
      var metaCell = '<td class="queue-cell-meta" data-label="Queue Context"><div class="queue-meta-block"><div><div class="queue-time-main">Submitted ' + esc(submittedMeta || 'recently') + '</div><div class="queue-time-sub">' + esc(formatDisplayTs(r.created_at)) + '</div>' + (updatedMeta && r.updated_at && r.updated_at !== r.created_at ? '<div class="queue-time-sub">Updated ' + esc(updatedMeta) + '</div>' : '') + '</div>' + queueRiskBlock(r._activity) + '</div></td>';
      var canOperate = currentUserCanOperateQueue_();
      var actionCell = '<td class="queue-cell-action" data-label="Action"><div class="queue-action-stack">' +
        '<button type="button" class="' + queueReviewButtonClass(r) + '" onclick="openDrawer(' + idx + ')">' + ((r.status === 'completed' || r.status === 'rejected') ? 'View' : 'Review') + '</button>' +
        (canOperate ? '<button type="button" class="btn btn-ghost btn-sm queue-label-btn" onclick="printQueueLabel_(' + idx + ')">&#128424; Label</button>' : '') +
        '</div></td>';
      var rowClass = ['queue-row', queueRowStateClass(r.status), queueSourceClass(r._source), queueAttentionClass(r)].join(' ').trim();
      return '<tr class="' + rowClass + '">' + requesterCell + contextCell + statusCell + metaCell + actionCell + '</tr>';
    }

    function queueLabelData_(r) {
      r = r || {};
      var isOther = r._source === 'other';
      var name = isOther ? (r.requester_name || r.student_name || '') : (r.student_name || '');
      var classText = isOther
        ? ([r.year_group, r['class'] || r.design_class_no].filter(Boolean).join(' ') || r.department_or_subject || '')
        : (r.design_class_no || r.year_group || '');
      var teacher = isOther ? (r.teacher_in_charge || r.design_teacher || '') : (r.design_teacher || '');
      var machine = MACHINE_LABELS[r.machine] || r.machine || '';
      var material = r.material || '';
      var id = r.submission_id || r.request_id || '';
      return {
        caseNo: requestCaseNumber_(r),
        name: name || 'Unnamed requester',
        classText: classText || 'No class',
        teacher: teacher || 'No teacher',
        material: material || 'No material',
        machine: machine || 'Machine',
        id: id || '',
        source: isOther ? 'Special Request' : 'DT Submission'
      };
    }

    function printLabelWindow_(data) {
      var w = window.open('', '_blank', 'width=520,height=320');
      if (!w) {
        showToast('Popup blocked. Allow popups, then press Label again.', 'error');
        return;
      }
      var doc = '<!doctype html><html><head><meta charset="utf-8">' +
        '<title>Print fabrication label</title>' +
        '<style>' +
          '@page{size:90mm 29mm;margin:0;}' +
          'html,body{margin:0;padding:0;}' +
          'body{font-family:Arial,Helvetica,sans-serif;color:#111;}' +
          '.label-sheet{box-sizing:border-box;width:90mm;height:29mm;padding:1.55mm 3mm;overflow:hidden;display:flex;align-items:center;}' +
          '.label{width:100%;min-width:0;}' +
          '.label-top{display:flex;align-items:center;justify-content:space-between;gap:2mm;}' +
          '.label-case{font-size:12pt;font-weight:900;line-height:1;letter-spacing:.2mm;font-family:Arial,Helvetica,sans-serif;white-space:nowrap;}' +
          '.label-name{margin-top:.8mm;font-size:11.5pt;font-weight:800;line-height:1.02;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
          '.label-machine{flex:0 0 auto;border:1px solid #111;border-radius:1mm;padding:.55mm 1.15mm;font-size:7.5pt;font-weight:800;line-height:1;text-transform:uppercase;white-space:nowrap;}' +
          '.label-row{margin-top:.9mm;display:flex;gap:2.3mm;font-size:7.9pt;font-weight:700;line-height:1.06;white-space:nowrap;overflow:hidden;}' +
          '.label-row span{min-width:0;overflow:hidden;text-overflow:ellipsis;}' +
          '.label-material{font-size:8.1pt;font-weight:800;}' +
          '.label-id{margin-top:.7mm;font-size:6.4pt;line-height:1;color:#333;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}' +
          '.print-toolbar{display:none;}' +
          '@media screen{body{width:auto;min-height:100vh;background:#f1f5f9;display:grid;place-items:start center;padding:16px;box-sizing:border-box;}.label-sheet{background:#fff;border:1px dashed #64748b;box-shadow:0 12px 30px rgba(15,23,42,.16);}.print-toolbar{display:flex;gap:8px;margin-top:14px;justify-content:center}.print-toolbar button{border:1px solid #cbd5e1;background:#fff;border-radius:8px;padding:8px 12px;font:700 12px Arial;cursor:pointer}.print-toolbar button.primary{background:#1d4ed8;color:#fff;border-color:#1d4ed8}}' +
          '@media print{.print-toolbar{display:none!important;}}' +
        '</style></head><body>' +
          '<div class="label-sheet" role="img" aria-label="Fabrication label">' +
            '<div class="label">' +
              '<div class="label-top"><div class="label-case">' + esc(data.caseNo || 'M---') + '</div><div class="label-machine">' + esc(data.machine) + '</div></div>' +
              '<div class="label-name">' + esc(data.name) + '</div>' +
              '<div class="label-row"><span>Class: ' + esc(data.classText) + '</span><span>Teacher: ' + esc(data.teacher) + '</span></div>' +
              '<div class="label-row label-material"><span>Material: ' + esc(data.material) + '</span></div>' +
              '<div class="label-id">' + esc(data.caseNo || 'M---') + ' · ' + esc(data.source) + (data.id ? ' · ' + esc(data.id) : '') + '</div>' +
            '</div>' +
          '</div>' +
          '<div class="print-toolbar"><button class="primary" onclick="window.print()">Print 90×29 mm label</button><button onclick="window.close()">Close</button></div>' +
        '</body></html>';
      w.document.open();
      w.document.write(doc);
      w.document.close();
      w.focus();
      setTimeout(function() {
        try { w.print(); } catch(e) {}
      }, 350);
    }

    function printQueueLabel_(idx) {
      var r = _adminRows[idx];
      if (!r) {
        showToast('Label data not found. Refresh the queue and try again.', 'error');
        return;
      }
      printLabelWindow_(queueLabelData_(r));
    }

    function printQueueLabelById_(id) {
      var targetId = String(id || '');
      var row = (_adminRows || []).filter(function(r) {
        return String(r.submission_id || r.request_id || '') === targetId;
      })[0];
      if (!row) {
        showToast('Label data not found. Reopen the request and try again.', 'error');
        return;
      }
      printLabelWindow_(queueLabelData_(row));
    }

    function updateAdminLoadMore_() {
      var bar = document.getElementById('queueLoadMoreBar');
      var text = document.getElementById('queueLoadMoreText');
      var btn = document.getElementById('queueLoadMoreBtn');
      if (!bar || !text || !btn) return;
      var total = _adminRenderState.rows.length;
      var shown = Math.min(_adminRenderState.next, total);
      if (shown >= total) {
        bar.style.display = total > adminRenderChunkSize_() ? 'flex' : 'none';
        text.textContent = total ? 'Showing all ' + total + ' visible record(s).' : '';
        btn.style.display = 'none';
        return;
      }
      bar.style.display = 'flex';
      btn.style.display = '';
      text.textContent = 'Showing ' + shown + ' of ' + total + ' visible record(s). More rows are kept offscreen so the page stays responsive.';
      btn.textContent = 'Load ' + Math.min(_adminRenderState.chunk, total - shown) + ' More';
    }
    function loadMoreAdminRows_() {
      var tbody = document.getElementById('adminQueueBody');
      if (!tbody) return;
      var rows = _adminRenderState.rows || [];
      var start = _adminRenderState.next;
      var end = Math.min(rows.length, start + _adminRenderState.chunk);
      if (end <= start) { updateAdminLoadMore_(); return; }
      tbody.insertAdjacentHTML('beforeend', rows.slice(start, end).map(function(r, offset) {
        return renderQueueRowHtml_(r, start + offset);
      }).join(''));
      _adminRenderState.next = end;
      updateAdminLoadMore_();
      setMsg('adminMsg', 'Showing ' + end + ' of ' + rows.length + ' visible records.', 'muted');
    }

    function adminDataKey_(source, filters) {
      return JSON.stringify({
        source: source || '',
        mine_only: filters.mine_only || 'false'
      });
    }

    function invalidateAdminRowsCache_() {
      _adminRawRows = [];
      _adminRawKey = null;
    }

    function normaliseAdminRows_(dtRows, orRows) {
      (dtRows||[]).forEach(function(r){ r._source = 'dt'; });
      (orRows||[]).forEach(function(r){
        r._source = 'other';
        r.student_name = r.requester_name || '';
        r.student_email = r.requester_email || '';
        r.design_class_no = r.department_or_subject || '';
        r.submission_id = r.submission_id || r.request_id;
      });
      var rawRows = (dtRows||[]).concat(orRows||[]);
      attachClientActivity_(rawRows);
      return rawRows;
    }

    function renderAdminRows_(rawRows, filters, fromCache) {
      rawRows = rawRows || [];
      populateTeacherFilter_(rawRows, filters.teacher_query);
      populateMaterialFilter_(rawRows, filters.materials);
      var rows = rawRows.filter(function(r) { return rowMatchesAdminFilters_(r, filters); });
      if (filters.lane) rows = rows.filter(function(r) { return rowMatchesLane_(r, filters.lane); });
      if (filters.quick) rows = rows.filter(function(r) { return rowMatchesQuick_(r, filters.quick); });
      rows = sortQueueRows_(rows, filters.sort);
      _adminRows = rows;
      var counts = {};
      rows.forEach(function(r){ counts[r.status] = (counts[r.status]||0)+1; });
      ['submitted','needs_fix','approved','in_queue','in_production','completed','rejected'].forEach(function(s){ setStatCard(s, counts[s]||0); });
      var totalEl = document.getElementById('statTotal');
      if (totalEl) totalEl.textContent = rows.length;
      refreshAdminInsights_(rows, rawRows.length);
      updateQueueSummary_(rows, rawRows.length, filters);
      updateLaneActive_();
      updateStatActive_();
      var el = document.getElementById('adminTable');
      if (!el) return;
      var filterBanner = filters.mine_only === 'true'
        ? '<div class="alert alert-info" style="margin:0 0 12px;"><span class="alert-icon">&#8505;</span><span><strong>Filtered view:</strong> showing DT submissions where you are the teacher, plus Special Requests where you are the responsible teacher or approver. Turn off <strong>My students only</strong> to see the wider queue.</span></div>'
        : '';
      if (!rows.length) {
        el.innerHTML = filterBanner + '<div class="queue-empty alert alert-neutral"><span class="alert-icon">\ud83d\udce5</span><span>' + (rawRows.length ? 'No visible records match the current lane, search, or sort filters.' : (filters.mine_only === 'true' ? 'No records are currently linked to your teacher / sponsor account under these filters.' : 'No submissions match the current filters.')) + '</span></div>';
        setMsg('adminMsg', (fromCache ? 'Filtered locally. ' : '') + rows.length + ' visible / ' + rawRows.length + ' loaded.', 'muted');
        return;
      }
      var chunk = adminRenderChunkSize_();
      var initial = Math.min(rows.length, chunk);
      _adminRenderState = { rows: rows, next: initial, chunk: chunk };
      el.innerHTML = filterBanner + '<div class="tbl-wrap"><table class="queue-table"><thead><tr><th>Requester</th><th>Job</th><th>Status</th><th>Queue Context</th><th>Action</th></tr></thead><tbody id="adminQueueBody">' +
        rows.slice(0, initial).map(function(r, idx) { return renderQueueRowHtml_(r, idx); }).join('') +
        '</tbody></table></div><div class="queue-load-more" id="queueLoadMoreBar"><span class="queue-load-more-text" id="queueLoadMoreText"></span><button type="button" class="btn btn-ghost btn-sm" id="queueLoadMoreBtn" onclick="loadMoreAdminRows_()">Load More</button></div>';
      updateAdminLoadMore_();
      setMsg('adminMsg', (fromCache ? 'Filtered locally. ' : '') + rows.length + ' visible / ' + rawRows.length + ' loaded. Showing ' + initial + ' now.', 'muted');
    }

    function refreshAdminRows_() {
      invalidateAdminRowsCache_();
      loadAdminRows(true);
    }

    function loadAdminRows(forceRefresh) {
      var source = (document.getElementById('filterSource')||{}).value||'';
      var filters = {
        year_groups: getCheckboxFilterValues_('filterYear'),
        machines: getCheckboxFilterValues_('filterMachine'),
        materials: getCheckboxFilterValues_('filterMaterial'),
        statuses: getCheckboxFilterValues_('filterStatus'),
        case_query: ((document.getElementById('filterCaseNo')||{}).value||'').trim(),
        teacher_query: (document.getElementById('filterTeacher')||{}).value||'',
        class_no: (document.getElementById('filterClass')||{}).value||'',
        student_email: (document.getElementById('filterStudentEmail')||{}).value||'',
        mine_only: (document.getElementById('filterMineOnly')||{}).checked ? 'true' : 'false',
        quick: ((document.getElementById('filterQuick')||{}).value||'').trim(),
        sort: (document.getElementById('filterSort')||{}).value||'newest',
        lane: _activeQueueLane || ''
      };
      var dataKey = adminDataKey_(source, filters);
      if (!forceRefresh && _adminRawKey === dataKey) {
        _adminRequestSeq++;
        renderAdminRows_(_adminRawRows, filters, true);
        return;
      }
      setMsg('adminMsg', forceRefresh ? 'Refreshing from spreadsheet\\u2026' : 'Loading\\u2026','muted');
      var loadingTable = document.getElementById('adminTable');
      if (loadingTable) loadingTable.innerHTML = '<div class="queue-skeleton" aria-label="Loading queue"></div>';
      var requestSeq = ++_adminRequestSeq;
      var dtRows = null, orRows = null, dtDone = false, orDone = false, hadError = false;
      var serverFilters = { mine_only: filters.mine_only };
      function renderAdmin() {
        if (!dtDone || !orDone || hadError) return;
        if (requestSeq !== _adminRequestSeq) return;
        var rawRows = normaliseAdminRows_(dtRows, orRows);
        _adminRawRows = rawRows;
        _adminRawKey = dataKey;
        renderAdminRows_(rawRows, filters, false);
      }
      function onError(err) { if (requestSeq !== _adminRequestSeq) return; if (!hadError) { hadError = true; setMsg('adminMsg', err.message||String(err), 'error'); } }
      if (source === 'other') {
        dtRows = []; dtDone = true;
        google.script.run.withSuccessHandler(function(rows){ orRows = rows; orDone = true; renderAdmin(); }).withFailureHandler(onError).getAdminOtherRequests(serverFilters);
      } else if (source === 'dt') {
        orRows = []; orDone = true;
        google.script.run.withSuccessHandler(function(rows){ dtRows = rows; dtDone = true; renderAdmin(); }).withFailureHandler(onError).getAdminRows(serverFilters);
      } else {
        google.script.run.withSuccessHandler(function(rows){ dtRows = rows; dtDone = true; renderAdmin(); }).withFailureHandler(onError).getAdminRows(serverFilters);
        google.script.run.withSuccessHandler(function(rows){ orRows = rows; orDone = true; renderAdmin(); }).withFailureHandler(onError).getAdminOtherRequests(serverFilters);
      }
    }

    function filterByStatus(status) {
      _activeQueueLane = '';
      if (!status) {
        setCheckboxFilterValues_('filterStatus', []);
      } else {
        var statuses = getCheckboxFilterValues_('filterStatus');
        var index = statuses.indexOf(status);
        if (index === -1) statuses.push(status);
        else statuses.splice(index, 1);
        setCheckboxFilterValues_('filterStatus', statuses);
      }
      updateLaneActive_();
      updateStatActive_();
      loadAdminRows();
    }

    /* ---------- REVIEW DRAWER ---------- */
    function openDrawer(idx) {
      var r = _adminRows[idx]; if (!r) return;
      var overlay = document.getElementById('reviewDrawer');
      var isOther = r._source === 'other';
      document.getElementById('drawerTitle').textContent = isOther ? 'Review Special Request: ' + (r.project_name || 'Untitled') : 'Review: ' + (r.student_name || 'Submission');
      var isTech = BOOT.currentUser.role === 'technician';
      var canOperate = currentUserCanOperateQueue_();
      var techStatuses = ['approved','in_queue','in_production','completed'];
      var visibleStatuses = canOperate ? (isTech ? techStatuses : BOOT.statuses) : [r.status];
      var issues = getIssueOptionsForMachine(r.machine);
      var dims = [r.width,r.height,r.depth].filter(function(v){ return v && String(v)!=='0'; });
      var activity = r._activity || {};
      var counts = activity.counts || {};
      var caseNo = requestCaseNumber_(r);
      var summarySection = '<div class="drawer-section"><div class="drawer-section-title">Operational Summary</div>' +
        '<div class="review-summary-grid">' +
          '<div class="drawer-field"><label>Case Number</label><div class="val"><span class="case-badge">' + esc(caseNo) + '</span></div></div>' +
          '<div class="drawer-field"><label>Source</label><div class="val">' + sourcePill(r._source) + '</div></div>' +
          '<div class="drawer-field"><label>Submitted</label><div class="val">' + esc(formatDisplayTs(r.created_at)) + '</div></div>' +
          '<div class="drawer-field"><label>Last Updated</label><div class="val">' + esc(formatDisplayTs(r.updated_at)) + '</div></div>' +
          '<div class="drawer-field"><label>Next Owner</label><div class="val">' + esc(statusOwner(r.status)) + '</div></div>' +
          '<div class="drawer-field"><label>Same-day Count</label><div class="val">' + esc(String(counts.total || 0)) + ' today</div></div>' +
          '<div class="drawer-field"><label>Last 24h</label><div class="val">' + esc(String(activity.last24_count || 0)) + ' total</div></div>' +
        '</div>' +
        '<div class="review-flag review-flag--info"><strong>Current workflow cue:</strong> ' + esc(statusActionHint(r.status)) + '</div>' +
        ((counts.total || 0) >= 2 ? '<div class="review-flag review-flag--warn"><strong>Repeat-submission warning:</strong> This requester has submitted ' + esc(String(counts.total)) + ' time(s) today. Check whether this is a corrected version, a deadline-driven request, or an accidental duplicate before processing.</div>' : '') +
        (activity.recent && activity.recent.length ? '<div class="drawer-field" style="margin-top:10px;"><label>Recent requester activity</label><div class="val">' + renderRecentActivity(activity) + '</div></div>' : '') +
      '</div>';

      var detailSection = '';
      if (isOther) {
        detailSection = '<div class="drawer-section"><div class="drawer-section-title">Requester Details</div>' +
          '<div class="drawer-field"><label>Name</label><div class="val">' + esc(r.requester_name) + '</div></div>' +
          '<div class="drawer-field"><label>Email</label><div class="val">' + esc(r.requester_email) + '</div></div>' +
          '<div class="drawer-field"><label>Role</label><div class="val">' + esc(r.requester_role||'\u2014') + '</div></div>' +
          (r.year_group ? '<div class="drawer-field"><label>Year Group</label><div class="val">' + esc(r.year_group) + '</div></div>' : '') +
          (r['class'] ? '<div class="drawer-field"><label>Class</label><div class="val">' + esc(r['class']) + '</div></div>' : '') +
          '<div class="drawer-field"><label>Department</label><div class="val">' + esc(r.department_or_subject||'\u2014') + '</div></div></div>' +
          '<div class="drawer-section"><div class="drawer-section-title">Request Details</div>' +
          '<div class="drawer-field"><label>Type</label><div class="val">' + esc(r.request_type||'\u2014') + '</div></div>' +
          '<div class="drawer-field"><label>Project</label><div class="val">' + esc(r.project_name||'\u2014') + '</div></div>' +
          '<div class="drawer-field"><label>Purpose</label><div class="val">' + esc(r.project_purpose||'\u2014') + '</div></div>' +
          (r.competition_name ? '<div class="drawer-field"><label>Competition</label><div class="val">' + esc(r.competition_name) + '</div></div>' : '') +
          (r.event_or_deadline ? '<div class="drawer-field"><label>Event / Exhibition</label><div class="val">' + esc(r.event_or_deadline) + '</div></div>' : '') +
          (r.needed_by_date ? '<div class="drawer-field"><label>Needed-by Date</label><div class="val">' + esc(r.needed_by_date) + '</div></div>' : '') +
          (r.request_description ? '<div class="drawer-field"><label>Job Description</label><div class="val" style="white-space:pre-wrap">' + esc(r.request_description) + '</div></div>' : '') +
          (r.priority_reason ? '<div class="drawer-field"><label>Priority Note</label><div class="val" style="white-space:pre-wrap">' + esc(r.priority_reason) + '</div></div>' : '') +
          '<div class="drawer-field"><label>Teacher In Charge</label><div class="val">' + esc(r.teacher_in_charge||'\u2014') + ' (' + esc(r.teacher_in_charge_email||'') + ')</div></div>' +
          '<div class="drawer-field"><label>Approved By</label><div class="val">' + esc(r.approved_by_email||'\u2014') + '</div></div></div>';
      } else {
        detailSection = '<div class="drawer-section"><div class="drawer-section-title">Student Details</div>' +
          '<div class="drawer-field"><label>Name</label><div class="val">' + esc(r.student_name) + '</div></div>' +
          '<div class="drawer-field"><label>Email</label><div class="val">' + esc(r.student_email) + '</div></div>' +
          '<div class="drawer-field"><label>Class</label><div class="val">' + esc(r.design_class_no) + '</div></div>' +
          '<div class="drawer-field"><label>Teacher</label><div class="val">' + esc(r.design_teacher) + '</div></div>' +
          '<div class="drawer-field"><label>Prototype</label><div class="val">' + esc(formatPrototypeFidelityLabel_(r.prototype_fidelity) || '—') + '</div></div></div>';
      }

      var actionSection = canOperate
        ? '<div class="drawer-section"><div class="drawer-section-title">Review Actions</div>' +
          '<div class="drawer-field"><label>Set Status</label><select id="drawer_status" onchange="syncDrawerActionCue_()">' + visibleStatuses.map(function(s){ return '<option value="' + s + '"' + (s===r.status?' selected':'') + '>' + (STATUS_LABELS[s]||s) + '</option>'; }).join('') + '</select></div>' +
          '<div class="review-flag review-flag--info" id="drawerActionCue"><strong>Next step:</strong> ' + esc(statusActionHint(r.status)) + '</div>' +
          (isTech ? '' : '<div class="drawer-field"><label>Issue (optional)</label><select id="drawer_issue"><option value="">\\u2014 No issue \\u2014</option>' + issues.map(function(t){ return '<option value="' + esc(t.issue_code) + '"' + (t.issue_code===r.issue_code?' selected':'') + '>' + esc(t.issue_label) + '</option>'; }).join('') + '</select></div>') +
          '<div class="drawer-field"><label>Remarks (student-visible)</label><textarea id="drawer_remarks" rows="3" placeholder="Notes visible to the requester\\u2026">' + esc(r.admin_remarks||'') + '</textarea></div></div>'
        : '<div class="drawer-section"><div class="drawer-section-title">Teacher View</div><div class="review-flag review-flag--info"><strong>Read-only:</strong> Teachers can review linked student evidence and learning context. Workshop approval, queue movement, production status, and labels remain technician/admin actions.</div></div>';

      var body = summarySection + detailSection +
        '<div class="drawer-section"><div class="drawer-section-title">Fabrication</div>' +
        '<div class="drawer-field"><label>Machine</label><div class="val">' + esc(MACHINE_LABELS[r.machine]||r.machine) + '</div></div>' +
        '<div class="drawer-field"><label>Material</label><div class="val">' + esc(r.material||'\\u2014') + '</div></div>' +
        (dims.length ? '<div class="drawer-field"><label>Dimensions</label><div class="val">' + dims.join('\\u00d7') + ' ' + esc(r.units||'') + '</div></div>' : '') +
        (isOther && r.quantity ? '<div class="drawer-field"><label>Quantity</label><div class="val">' + esc(String(r.quantity)) + '</div></div>' : '') +
        '<div class="drawer-field"><label>Current Status</label><div class="val">' + statusPill(r.status) + '</div></div>' +
        (r.working_file_url ? '<div class="drawer-field"><label>Working File</label><div class="val"><a href="' + esc(r.working_file_url) + '" target="_blank" rel="noopener">\\ud83d\\udcc4 ' + esc(r.working_file_name||'Download') + '</a></div></div>' : '') +
        (r.preview_file_url ? '<div class="drawer-field"><label>Preview</label><div class="val"><a href="' + esc(r.preview_file_url) + '" target="_blank" rel="noopener">\\ud83d\\uddbc\\ufe0f View Preview</a></div><img src="https://drive.google.com/thumbnail?id=' + esc(r.preview_file_id) + '&sz=w400" alt="Preview" style="margin-top:6px;max-width:100%;border-radius:6px;border:1px solid var(--card-border);" onerror="this.style.display=\\'none\\'"></div>' : '') +
        (isOther && r.additional_requirements ? '<div class="drawer-field"><label>Notes</label><div class="val">' + esc(r.additional_requirements) + '</div></div>' : '') +
        '<div class="drawer-field"><label>Submitted</label><div class="val">' + esc(formatDisplayTs(r.created_at)) + '</div></div>' +
        '<div class="drawer-field"><label>ID</label><div class="val" style="font-family:monospace;font-size:11px;word-break:break-all;">' + esc(r.submission_id || r.request_id) + '</div></div></div>' +
        actionSection;

      document.getElementById('drawerBody').innerHTML = body;
      var saveId = esc(r.submission_id || r.request_id);
      document.getElementById('drawerActions').innerHTML = (canOperate
        ? '<button class="btn btn-primary btn-sm" onclick="saveFromDrawer(\\'' + saveId + '\\')">Save Changes</button>' +
          '<button class="btn btn-ghost btn-sm" onclick="printQueueLabelById_(\\'' + saveId + '\\')">&#128424; Print Label</button>' +
          (isOther ? '' : '<button class="btn btn-ghost btn-sm" onclick="draftEmail(\\'' + saveId + '\\')">\\u2709 Draft Email</button>') +
          (isTech || BOOT.currentUser.role === 'admin' ? '<button class="btn btn-ghost btn-sm" onclick="reportTeacher(\\'' + saveId + '\\')">\\ud83d\\udce2 Notify Teacher</button>' : '')
        : '') +
        '<button class="btn btn-ghost btn-sm" onclick="closeDrawer()">Close</button>';

      overlay.classList.add('show');
      overlay.onclick = function(e) { if (e.target === overlay) closeDrawer(); };
      syncDrawerActionCue_();
      refreshOverlayLock_();
      setTimeout(function() {
        var closeBtn = overlay.querySelector('.drawer-close');
        if (closeBtn) closeBtn.focus();
      }, 0);
    }

    function closeDrawer() {
      var overlay = document.getElementById('reviewDrawer');
      if (overlay) overlay.classList.remove('show');
      refreshOverlayLock_();
    }

    function syncDrawerActionCue_() {
      var statusEl = document.getElementById('drawer_status');
      var cueEl = document.getElementById('drawerActionCue');
      if (!statusEl || !cueEl) return;
      cueEl.innerHTML = '<strong>Next step:</strong> ' + esc(statusActionHint(statusEl.value));
    }

    function saveFromDrawer(submissionId) {
      var status = (document.getElementById('drawer_status')||{}).value||'';
      var issueEl = document.getElementById('drawer_issue');
      var issue = issueEl ? issueEl.value : null;
      var remarks = (document.getElementById('drawer_remarks')||{}).value||'';
      var isOtherReq = String(submissionId).indexOf('OR-') === 0;
      var saveBtn = document.querySelector('#drawerActions .btn-primary');
      if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = '\\u23f3 Saving\\u2026'; }
      function onSuccess(result) {
        if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = 'Save Changes'; }
        var targetStatus = STATUS_LABELS[status] || status || 'updated';
        var msg = 'Saved successfully. Status is now ' + targetStatus + '.';
        if (result && result.emailsSent && result.emailsSent.length > 0) {
          msg += ' Email sent to: ' + result.emailsSent.join(', ') + '.';
          showToast(msg, 'success');
        } else if (result && result.emailError) {
          msg += ' Email FAILED: ' + result.emailError;
          showToast(msg, 'error');
        } else if (result && !result.statusChanged) {
          msg += ' (Status unchanged \u2014 no email sent.)';
          showToast(msg, 'success');
        } else {
          showToast(msg, 'success');
        }
        invalidateAdminRowsCache_();
        closeDrawer(); loadAdminRows();
      }
      function onFail(err) { if (saveBtn) { saveBtn.disabled = false; saveBtn.innerHTML = 'Save Changes'; } showToast(err.message||String(err),'error'); }
      if (isOtherReq) {
        google.script.run.withSuccessHandler(onSuccess).withFailureHandler(onFail)
          .updateOtherRequestStatus(submissionId, status, remarks);
      } else {
        google.script.run.withSuccessHandler(onSuccess).withFailureHandler(onFail)
          .updateSubmissionStatus(submissionId, status, issue, remarks);
      }
    }

    function draftEmail(submissionId) {
      var issue = (document.getElementById('drawer_issue')||{}).value||'';
      var remarks = (document.getElementById('drawer_remarks')||{}).value||'';
      setMsg('adminMsg','Generating email\\u2026','muted');
      google.script.run
        .withSuccessHandler(function(draft) { setMsg('adminMsg',''); showEmailModal_(draft); })
        .withFailureHandler(function(err) { setMsg('adminMsg', err.message||String(err), 'error'); })
        .generateEmailDraft(submissionId, issue, remarks);
    }

    function reportTeacher(submissionId) {
      var status = (document.getElementById('drawer_status')||{}).value||'';
      var issueEl = document.getElementById('drawer_issue');
      var issue = issueEl ? issueEl.value : '';
      var remarks = (document.getElementById('drawer_remarks')||{}).value||'';
      setMsg('adminMsg','Generating teacher report\\u2026','muted');
      google.script.run
        .withSuccessHandler(function(draft) {
          if (draft && draft.missing_to) setMsg('adminMsg','Teacher email not found. Add recipient manually.','error');
          else setMsg('adminMsg','Teacher report ready.','success');
          showEmailModal_(draft);
        })
        .withFailureHandler(function(err) { setMsg('adminMsg', err.message||String(err), 'error'); })
        .generateTeacherUpdateDraft(submissionId, status, issue, remarks);
    }

    function openMasterSheet() {
      google.script.run
        .withSuccessHandler(function(url){ window.open(url,'_blank'); })
        .withFailureHandler(function(err){ setMsg('adminMsg', err.message||String(err), 'error'); })
        .getSpreadsheetUrl();
    }

    /* ---------- PREVIEW STUDENT VIEW ---------- */
    var _studentPreviewActive = false;
    function previewStudentView() {
      if (_studentPreviewActive) {
        /* Exit preview */
        _studentPreviewActive = false;
        document.body.className = document.body.className.replace(/role-student/g, 'role-' + BOOT.currentUser.role);
        var previewBanner = document.getElementById('studentPreviewBanner');
        if (previewBanner) previewBanner.remove();
        /* Restore admin nav */
        var navBar = document.querySelector('.tab-bar');
        _pages.forEach(function(n) {
          var nav = document.getElementById('nav-' + n);
          if (nav) nav.style.display = '';
        });
        switchPage('admin');
        showToast('Exited student preview.','success');
        return;
      }
      _studentPreviewActive = true;
      /* Swap body class */
      document.body.className = document.body.className.replace(/role-\\w+/g, 'role-student');
      /* Show only student-visible pages */
        var studentPages = ['submit','status','queue','machines','other','help'];
      _pages.forEach(function(n) {
        var nav = document.getElementById('nav-' + n);
        if (!nav) return;
        nav.style.display = studentPages.indexOf(n) !== -1 ? '' : 'none';
      });
      /* Add preview banner */
      var banner = document.createElement('div');
      banner.id = 'studentPreviewBanner';
      banner.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:999;background:#fbbf24;color:#78350f;text-align:center;padding:6px 16px;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:center;gap:10px;';
      banner.innerHTML = '\\ud83d\\udc41 Student View Preview &mdash; This is what students see. <button onclick=\"showStudentLaserCapacityNotice_(true)\" style=\"background:#fff7ed;color:#7c2d12;border:1px solid rgba(120,53,15,.24);padding:4px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:700;\">Show Student Popup</button><button onclick=\"previewStudentView()\" style=\"background:#78350f;color:#fff;border:none;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;\">Exit Preview</button>';
      document.body.prepend(banner);
      switchPage('submit');
      setTimeout(function() { showStudentLaserCapacityNotice_(true); }, 350);
      showToast('Now viewing as student. Admin pages are hidden.','success');
    }

    /* ---------- EMAIL MODAL ---------- */
    function closeEmailModal_() {
      var overlay = document.getElementById('emailOverlay');
      if (overlay) overlay.remove();
      refreshOverlayLock_();
    }

    function showEmailModal_(draft) {
      var d = draft || {};
      window.__emailDraft = d;
      var existing = document.getElementById('emailOverlay');
      if (existing) existing.remove();
      var overlay = document.createElement('div');
      overlay.id = 'emailOverlay';
      overlay.className = 'overlay';
      var warn = d.missing_to ? '<div class="alert alert-warning" style="margin:10px 20px 0;"><span class="alert-icon">&#9888;</span><span>Recipient email missing. Copy this draft and add it manually.</span></div>' : '';
      overlay.innerHTML =
        '<div class="modal" role="dialog" aria-modal="true" aria-labelledby="emailModalTitle" tabindex="-1">' +
          '<div class="modal-head"><h3 id="emailModalTitle">&#9993; Email Draft</h3><button class="modal-close" onclick="closeEmailModal_()" aria-label="Close email draft">&times;</button></div>' +
          '<div class="email-meta">' +
            '<div class="field"><label>To</label><input id="emailTo" type="email" value="' + esc(d.to || '') + '" placeholder="recipient@student.example.edu or recipient@example.edu"></div>' +
            '<div class="field"><label>Subject</label><input id="emailSubject" type="text" value="' + esc(d.subject || '') + '"></div>' +
          '</div>' + warn +
          '<div class="email-preview"><div class="email-preview-head"><h4>Email Body</h4><div class="email-preview-note">You can edit this draft before copying or opening it in your mail app. Mail links use plain text; Copy Rich HTML keeps formatting where the browser allows it.</div></div><div class="email-body" id="emailBody" contenteditable="true" role="textbox" aria-label="Editable email body">' + (d.body_html||'') + '</div></div>' +
          '<div class="email-action-bar">' +
            '<button class="btn btn-primary btn-sm" onclick="copyEmailPackage_()">&#128203; Copy Subject + Body</button>' +
            '<button class="btn btn-ghost btn-sm" onclick="copyEmailHtml_()">Copy Rich HTML</button>' +
            '<button class="btn btn-ghost btn-sm" onclick="copyEmailPlainText_()">Copy Text</button>' +
            '<button class="btn btn-ghost btn-sm" onclick="openMailDraft_()">Open Mail</button>' +
            '<button class="btn btn-ghost btn-sm" onclick="openGmailDraft_()">Open Gmail</button>' +
            '<button class="btn btn-ghost btn-sm" onclick="closeEmailModal_()">Close</button>' +
          '</div></div>';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', function(e){ if (e.target === overlay) closeEmailModal_(); });
      refreshOverlayLock_();
      setTimeout(function() {
        var closeBtn = overlay.querySelector('.modal-close');
        if (closeBtn) closeBtn.focus();
      }, 0);
    }

    function emailHtmlToText_(html) {
      try {
        var tmp = document.createElement('div');
        tmp.innerHTML = String(html || '');
        return (tmp.innerText || tmp.textContent || '')
          .replace(/[ \\t]+/g, ' ')
          .replace(/\\n\\s+/g, '\\n')
          .replace(/\\n{3,}/g, '\\n\\n')
          .trim();
      } catch(e) { return ''; }
    }

    function getEmailDraftFromModal_() {
      var body = document.getElementById('emailBody');
      var fallback = window.__emailDraft || {};
      return {
        to: (document.getElementById('emailTo') || {}).value || fallback.to || '',
        subject: (document.getElementById('emailSubject') || {}).value || fallback.subject || '',
        body_html: body ? body.innerHTML : (fallback.body_html || ''),
        body_text: body ? emailHtmlToText_(body.innerHTML) : (fallback.body_text || '')
      };
    }

    function fallbackWriteClipboard_(text, successMsg) {
      var ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.focus();
      ta.select();
      var ok = false;
      try { ok = document.execCommand('copy'); } catch(e) { ok = false; }
      ta.remove();
      showToast(ok ? (successMsg || 'Copied.') : 'Copy failed. Select the draft text manually.', ok ? 'success' : 'error');
    }

    function writeClipboard_(text, successMsg) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(function(){
          showToast(successMsg || 'Copied.','success');
        }).catch(function(){
          fallbackWriteClipboard_(text, successMsg);
        });
      } else {
        fallbackWriteClipboard_(text, successMsg);
      }
    }

    function writeHtmlClipboard_(html, plain, successMsg) {
      if (navigator.clipboard && window.ClipboardItem && window.Blob) {
        var item = new ClipboardItem({
          'text/html': new Blob([html || ''], { type: 'text/html' }),
          'text/plain': new Blob([plain || emailHtmlToText_(html)], { type: 'text/plain' })
        });
        navigator.clipboard.write([item]).then(function(){
          showToast(successMsg || 'Rich email body copied.','success');
        }).catch(function(){
          writeClipboard_(plain || emailHtmlToText_(html), 'Email text copied.');
        });
      } else {
        writeClipboard_(plain || emailHtmlToText_(html), 'Email text copied.');
      }
    }

    function openMailDraft_() {
      var d = getEmailDraftFromModal_();
      var to = encodeURIComponent(String(d.to||''));
      var subject = encodeURIComponent(String(d.subject||''));
      var body = encodeURIComponent(String(d.body_text||''));
      window.open('mailto:' + to + '?subject=' + subject + (body ? '&body=' + body : ''), '_blank');
    }

    function openGmailDraft_() {
      var d = getEmailDraftFromModal_();
      var url = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(String(d.to||'')) +
        '&su=' + encodeURIComponent(String(d.subject||'')) +
        '&body=' + encodeURIComponent(String(d.body_text||''));
      window.open(url, '_blank');
    }

    function copyEmailHtml_() {
      var d = getEmailDraftFromModal_();
      writeHtmlClipboard_(d.body_html || '', d.body_text || '', 'Rich email body copied.');
    }

    function copyEmailPlainText_() {
      var d = getEmailDraftFromModal_();
      writeClipboard_(d.body_text || '', 'Email text copied.');
    }

    function copyEmailPackage_() {
      var d = getEmailDraftFromModal_();
      var text = 'To: ' + (d.to || '') + '\\nSubject: ' + (d.subject || '') + '\\n\\n' + (d.body_text || '');
      writeClipboard_(text, 'Email subject and body copied.');
    }

    /* ================================================
       RULES PAGE (admin only)
    ================================================ */
	    function initRulesPage() {
	      if (!BOOT.currentUser.isAdmin || BOOT.currentUser.role !== 'admin') return;
	      loadRulesQueueThroughput();
	      loadRulesTable();
	      loadSubmissionControlsTable();
	    }
	    function loadRulesQueueThroughput() {
	      var msg = document.getElementById('rulesQueueThroughputMsg');
	      var el = document.getElementById('rulesQueueThroughput');
	      if (!el) return;
	      if (msg) setMsg('rulesQueueThroughputMsg', 'Loading 30-day queue graph...', 'muted');
	      google.script.run
	        .withSuccessHandler(function(snapshot) {
	          if (msg) setMsg('rulesQueueThroughputMsg', snapshot && snapshot.updated_at ? 'Updated ' + formatDisplayTs(snapshot.updated_at) : '', 'muted');
	          el.innerHTML = renderRulesThroughputTimeline_(snapshot && snapshot.timeline);
	        })
	        .withFailureHandler(function(err) {
	          if (msg) setMsg('rulesQueueThroughputMsg', err.message || String(err), 'error');
	          el.innerHTML = '<div class="alert alert-error"><span class="alert-icon">&#9888;</span><span>Could not load queue throughput graph.</span></div>';
	        })
	        .getAdminRulesQueueThroughputSnapshot();
	    }
	    function loadRulesTable() {
      setMsg('rulesMsg','Loading\\u2026','muted');
      google.script.run
        .withSuccessHandler(function(rows) {
          setMsg('rulesMsg', rows.length + ' rule(s).', 'muted');
          var el = document.getElementById('rulesTable');
          el.innerHTML = '<table class="config-table"><thead><tr><th>Year</th><th>Machine</th><th>Max W</th><th>Max H</th><th>Max D</th><th>Units</th><th>Materials</th><th>Extensions</th><th>Preview</th><th>Active</th><th>Notes</th></tr></thead><tbody>' +
            rows.map(function(r, i) {
              return '<tr><td>' + esc(r.year_group) + '</td><td>' + esc(r.machine) + '</td><td>' + esc(r.max_width) + '</td><td>' + esc(r.max_height) + '</td><td>' + esc(r.max_depth) + '</td><td>' + esc(r.units) + '</td><td style="max-width:160px;word-break:break-word;">' + esc(r.materials) + '</td><td>' + esc(r.accepted_extensions) + '</td><td>' + esc(r.preview_required) + '</td><td><span class="badge ' + (String(r.active).toLowerCase()!=='false'?'badge-active':'badge-inactive') + '">' + esc(r.active) + '</span></td><td style="max-width:200px;">' + esc(r.notes) + '</td></tr>';
            }).join('') + '</tbody></table>';
        })
        .withFailureHandler(function(err) { setMsg('rulesMsg', err.message||String(err), 'error'); })
        .getAdminRulesRows();
    }
    function loadSubmissionControlsTable() {
      setMsg('submissionControlMsg','Loading\u2026','muted');
      google.script.run
        .withSuccessHandler(function(rows) {
          setMsg('submissionControlMsg', rows.length + ' control(s).', 'muted');
          var el = document.getElementById('submissionControlsTable');
          if (!el) return;
          if (!rows.length) {
            el.innerHTML = '<div class="alert alert-info" style="margin-top:12px;"><span class="alert-icon">&#128161;</span><span>No class or year-group deadlines are active yet.</span></div>';
            return;
          }
          el.innerHTML = '<table class="config-table"><thead><tr><th>Scope</th><th>Deadline</th><th>Status</th><th>Message</th><th>Updated</th></tr></thead><tbody>' +
            rows.map(function(r) {
              var isActive = String(r.active || '').toLowerCase() !== 'false';
              var isClosed = String(r.is_closed || '').toLowerCase() === 'true';
              var scope = esc(r.year_group || '') + (r.class_no ? ' · Class ' + esc(r.class_no) : ' · All classes');
              var status = !isActive
                ? '<span class="badge badge-inactive">Inactive</span>'
                : (isClosed
                  ? '<span class="badge badge-inactive">Closed</span>'
                  : (r.deadline_at ? '<span class="badge badge-active">Deadline</span>' : '<span class="badge badge-active">Open</span>'));
              return '<tr><td>' + scope + '</td><td style="white-space:nowrap;">' + esc(r.deadline_at ? formatDisplayTs(r.deadline_at) : '\u2014') + '</td><td>' + status + '</td><td style="max-width:260px;">' + esc(r.message || '\u2014') + '</td><td style="white-space:nowrap;">' + esc(r.updated_at ? formatDisplayTs(r.updated_at) : '\u2014') + '<br><span style="font-size:11px;color:var(--slate-lt);">' + esc(r.updated_by || '') + '</span></td></tr>';
            }).join('') + '</tbody></table>';
        })
        .withFailureHandler(function(err) { setMsg('submissionControlMsg', err.message||String(err), 'error'); })
        .getAdminSubmissionControlRows();
    }
    function resetSubmissionControlForm_() {
      var yearEl = document.getElementById('submissionControlYear');
      var classEl = document.getElementById('submissionControlClass');
      var deadlineEl = document.getElementById('submissionControlDeadline');
      var messageEl = document.getElementById('submissionControlMessage');
      if (yearEl) yearEl.value = '';
      if (classEl) classEl.value = '';
      if (deadlineEl) deadlineEl.value = '';
      if (messageEl) messageEl.value = '';
      setMsg('submissionControlMsg', '', 'muted');
    }
    function saveSubmissionControlAction(action) {
      var yearEl = document.getElementById('submissionControlYear');
      var classEl = document.getElementById('submissionControlClass');
      var deadlineEl = document.getElementById('submissionControlDeadline');
      var messageEl = document.getElementById('submissionControlMessage');
      var yearGroup = (yearEl && yearEl.value || '').trim();
      var classNo = (classEl && classEl.value || '').trim();
      var deadlineAt = (deadlineEl && deadlineEl.value || '').trim();
      var message = (messageEl && messageEl.value || '').trim();

      if (!yearGroup) {
        showToast('Choose a year group first.', 'error');
        return;
      }

      var payload = {
        year_group: yearGroup,
        class_no: classNo,
        deadline_at: deadlineAt,
        message: message,
        active: 'TRUE',
        is_closed: 'FALSE'
      };
      var successMsg = 'Submission control saved.';

      if (action === 'deadline') {
        if (!deadlineAt) {
          showToast('Set a deadline date and time first.', 'error');
          return;
        }
        successMsg = 'Deadline saved.';
      } else if (action === 'cutoff') {
        payload.deadline_at = '';
        payload.is_closed = 'TRUE';
        successMsg = 'Submissions cut off for this scope.';
      } else if (action === 'reopen') {
        payload.deadline_at = '';
        payload.is_closed = 'FALSE';
        payload.active = 'FALSE';
        successMsg = 'Submissions reopened for this scope.';
      }

      setMsg('submissionControlMsg', 'Saving\u2026', 'muted');
      google.script.run
        .withSuccessHandler(function(res) {
          syncSubmissionControls_(res && res.controls ? res.controls : []);
          loadSubmissionControlsTable();
          showToast(successMsg, 'success');
          if (action !== 'deadline') resetSubmissionControlForm_();
          else setMsg('submissionControlMsg', 'Saved.', 'muted');
        })
        .withFailureHandler(function(err) { setMsg('submissionControlMsg', err.message||String(err), 'error'); })
        .saveAdminSubmissionControl(payload);
    }

    /* ================================================
       USERS PAGE (admin only)
    ================================================ */
    function initUsersPage() {
      if (!BOOT.currentUser.isAdmin || BOOT.currentUser.role !== 'admin') return;
      loadUsersTable();
    }
    function loadUsersTable() {
      setMsg('usersMsg','Loading\\u2026','muted');
      google.script.run
        .withSuccessHandler(function(rows) {
          setMsg('usersMsg', rows.length + ' user(s).', 'muted');
          var el = document.getElementById('usersTable');
          el.innerHTML = '<table class="config-table"><thead><tr><th>Email</th><th>Name</th><th>Role</th><th>Active</th></tr></thead><tbody>' +
            rows.map(function(r) {
              var roleCls = r.role === 'admin' ? 'color:var(--maroon);font-weight:700;' : r.role === 'technician' ? 'color:var(--blue);font-weight:700;' : r.role === 'teacher' ? 'color:var(--green);font-weight:700;' : '';
              return '<tr><td>' + esc(r.email) + '</td><td>' + esc(r.name) + '</td><td style="' + roleCls + '">' + esc(r.role) + '</td><td><span class="badge ' + (String(r.active).toLowerCase()!=='false'?'badge-active':'badge-inactive') + '">' + esc(r.active) + '</span></td></tr>';
            }).join('') + '</tbody></table>';
        })
        .withFailureHandler(function(err) { setMsg('usersMsg', err.message||String(err), 'error'); })
        .getAdminUsersRows();
    }
    function showAddUserForm() {
      document.getElementById('addUserForm').style.display = document.getElementById('addUserForm').style.display === 'none' ? 'block' : 'none';
    }
    function addNewUser() {
      var email = document.getElementById('newUserEmail').value.trim();
      var name = document.getElementById('newUserName').value.trim();
      var role = document.getElementById('newUserRole').value;
      if (!email) { showToast('Email is required.','error'); return; }
      google.script.run
        .withSuccessHandler(function() { showToast('User added.','success'); loadUsersTable(); document.getElementById('addUserForm').style.display = 'none'; document.getElementById('newUserEmail').value = ''; document.getElementById('newUserName').value = ''; })
        .withFailureHandler(function(err) { showToast(err.message||String(err),'error'); })
        .addAdminUser({ email: email, name: name, role: role, active: 'TRUE' });
    }

    /* ================================================
       AUDIT LOG PAGE (admin only)
    ================================================ */
    function initAuditPage() {
      if (BOOT.currentUser.role !== 'admin') return;
      loadAuditLog();
    }
    function loadAuditLog() {
      setMsg('auditMsg','Loading\\u2026','muted');
      google.script.run
        .withSuccessHandler(function(rows) {
          setMsg('auditMsg', rows.length + ' entries.','muted');
          var el = document.getElementById('auditTable');
          el.innerHTML = '<table class="config-table"><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Submission</th><th>Status</th><th>Notes</th></tr></thead><tbody>' +
            rows.map(function(r) {
              return '<tr><td style="white-space:nowrap;">' + esc(formatDisplayTs(r.timestamp)) + '</td><td>' + esc(r.actor_email) + '</td><td>' + esc(r.action_type) + '</td><td style="font-family:monospace;font-size:11px;max-width:120px;word-break:break-all;">' + esc(r.submission_id) + '</td><td>' + (r.new_status ? statusPill(r.new_status) : esc(r.old_status + ' \\u2192 ' + r.new_status)) + '</td><td style="max-width:250px;">' + esc(r.notes) + '</td></tr>';
            }).join('') + '</tbody></table>';
        })
        .withFailureHandler(function(err) { setMsg('auditMsg', err.message||String(err),'error'); })
        .getAuditLogRows(200);
    }

    /* ================================================
       FILE UPLOAD
    ================================================ */
    function uploadFileInput_(inputId, yearGroup, bucket) {
      var inp = document.getElementById(inputId);
      var file = inp && inp.files[0];
      if (!file) return Promise.resolve(null);
      /* File size guard: 25 MB limit */
      var MAX_FILE_SIZE = 25 * 1024 * 1024;
      if (file.size > MAX_FILE_SIZE) {
        return Promise.reject(new Error('File "' + file.name + '" is too large (' + Math.round(file.size / 1024 / 1024) + ' MB). Maximum allowed size is 25 MB.'));
      }
      return new Promise(function(resolve, reject) {
        var reader = new FileReader();
        reader.onload = function() {
          var base64 = String(reader.result).split(',')[1];
          google.script.run.withSuccessHandler(resolve).withFailureHandler(reject)
            .uploadBase64File({ base64: base64, fileName: file.name, mimeType: file.type, yearGroup: yearGroup, bucket: bucket });
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    document.addEventListener('click', function(e) {
      if (e.target.closest && e.target.closest('.filter-check')) return;
      closeAllCheckboxFilters_();
    });

    document.addEventListener('keydown', function(e) {
      if (e.key !== 'Escape') return;
      var openFilters = document.querySelectorAll('.filter-check[open]');
      if (openFilters.length) {
        closeAllCheckboxFilters_();
        return;
      }
      var emailOverlay = document.getElementById('emailOverlay');
      if (emailOverlay) {
        closeEmailModal_();
        return;
      }
      var laserOverlay = document.getElementById('laserCapacityOverlay');
      if (laserOverlay) {
        closeLaserCapacityNotice_();
        return;
      }
      var drawerOverlay = document.getElementById('reviewDrawer');
      if (drawerOverlay && drawerOverlay.classList.contains('show')) {
        closeDrawer();
      }
    });

    /* ---------- SCROLL TO TOP ---------- */
    (function(){
      var btn = document.getElementById('scrollTopBtn');
      if (!btn) return;
      window.addEventListener('scroll', function() {
        btn.classList.toggle('show', window.scrollY > 400);
      }, { passive: true });
    })();

    /* ---------- HELP ACCORDION ---------- */
    (function(){
      document.querySelectorAll('.help-section-title').forEach(function(title) {
        title.setAttribute('role', 'button');
        title.setAttribute('tabindex', '0');
        title.setAttribute('aria-expanded', title.closest('.help-section').classList.contains('help-expanded') ? 'true' : 'false');
        function toggle() {
          var section = title.closest('.help-section');
          section.classList.toggle('help-expanded');
          title.setAttribute('aria-expanded', section.classList.contains('help-expanded') ? 'true' : 'false');
        }
        title.addEventListener('click', function() {
          toggle();
        });
        title.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        });
      });
    })();
    function helpJump_(id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.add('help-expanded');
      var title = el.querySelector('.help-section-title');
      if (title) title.setAttribute('aria-expanded', 'true');
      el.scrollIntoView({behavior:'smooth',block:'start'});
    }

    /* ---------- TAB BAR SCROLL FADES ---------- */
    (function(){
      var wrap = document.getElementById('tabBarWrap');
      if (!wrap) return;
      var bar = wrap.querySelector('.tab-bar');
      if (!bar) return;
      function update() {
        wrap.classList.toggle('scroll-left', bar.scrollLeft > 4);
        wrap.classList.toggle('scroll-right', bar.scrollLeft + bar.clientWidth < bar.scrollWidth - 4);
      }
      bar.addEventListener('scroll', update, { passive: true });
      window.addEventListener('resize', update);
      update();
    })();
  </script>
</body>
</html>
`;
}

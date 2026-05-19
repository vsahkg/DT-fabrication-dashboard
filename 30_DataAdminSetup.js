/* =========================
   STORAGE / REPOSITORY
   ========================= */

function getSpreadsheet_() {
  let id = APP.props.getProperty('MASTER_SPREADSHEET_ID');
  if (!id) {
    bootstrap();
    id = APP.props.getProperty('MASTER_SPREADSHEET_ID');
  }
  if (!id) throw new Error('MASTER_SPREADSHEET_ID not found. Run bootstrap() first.');
  return SpreadsheetApp.openById(id);
}

function getRootFolder_() {
  let id = APP.props.getProperty('ROOT_FOLDER_ID');
  if (!id) {
    bootstrap();
    id = APP.props.getProperty('ROOT_FOLDER_ID');
  }
  if (!id) throw new Error('ROOT_FOLDER_ID not found. Run bootstrap() first.');
  return DriveApp.getFolderById(id);
}

function getSheet_(name) {
  const ss = getSpreadsheet_();
  const sheetConfig = getSheetConfigByName_(name);
  if (sheetConfig) return ensureSheet_(ss, sheetConfig.name, sheetConfig.headers);
  const sheet = ss.getSheetByName(name);
  if (!sheet) throw new Error(`Sheet not found: ${name}`);
  return sheet;
}

function getSheetConfigByName_(name) {
  var target = String(name || '').trim();
  var keys = Object.keys(APP.sheets || {});
  for (var i = 0; i < keys.length; i++) {
    var cfg = APP.sheets[keys[i]];
    if (cfg && cfg.name === target && cfg.headers) return cfg;
  }
  return null;
}

function acquireWorkflowLock_() {
  var lock = null;

  try {
    lock = LockService.getDocumentLock();
  } catch (e) {}

  if (!lock) {
    lock = LockService.getScriptLock();
  }

  if (!lock) {
    throw new Error('Unable to acquire workflow lock.');
  }

  lock.waitLock(10000);
  return lock;
}

function getRowsAsObjects_(sheetName) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  const headers = values[0];
  return values.slice(1).map((row, index) => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i] || '');
    obj._row_number = index + 2;
    return obj;
  });
}

function appendObject_(sheetName, obj) {
  const sheet = getSheet_(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const row = headers.map(h => obj[h] ?? '');
  sheet.appendRow(row);
  return sheet.getLastRow();
}

function formatCaseNumber_(row) {
  row = row || {};
  var prefix = casePrefixForRow_(row);
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

function casePrefixForRow_(row) {
  row = row || {};
  var source = String(row._source || '').trim().toLowerCase();
  if (source === 'other' || source === 'special' || source === 'special_request') return 'A';
  if (row.request_id || row.requester_email || row.requester_name || row.project_name || row.request_type) return 'A';
  return 'M';
}

function caseNumberMatches_(row, query) {
  query = String(query || '').trim().toUpperCase().replace(/\s+/g, '');
  if (!query) return false;
  var caseNo = formatCaseNumber_(row).toUpperCase();
  if (caseNo === query) return true;
  var prefixed = query.match(/^([AM])(\d+)$/);
  if (prefixed) return caseNo === (prefixed[1] + prefixed[2].padStart(3, '0'));
  var digits = query.replace(/\D/g, '');
  if (!digits) return false;
  var prefix = casePrefixForRow_(row);
  return caseNo === (prefix + digits.padStart(3, '0')) || caseNo.replace(/\D/g, '') === digits.padStart(3, '0');
}

function writeCellByHeader_(sheet, headers, rowIndex, headerName, value) {
  var rowNumber = Number(rowIndex);
  if (!rowNumber || !isFinite(rowNumber) || Math.floor(rowNumber) !== rowNumber || rowNumber < 2) {
    throw new Error('Invalid row index.');
  }
  const col = headers.indexOf(headerName);
  if (col === -1) throw new Error(`Missing header: ${headerName}`);
  if (rowNumber > sheet.getMaxRows()) throw new Error('Row index is outside the sheet.');
  sheet.getRange(rowNumber, col + 1).setValue(value);
}

function rowArrayToObject_(headers, row, rowIndex) {
  var obj = {};
  (headers || []).forEach(function(header, i) {
    obj[header] = (row || [])[i] || '';
  });
  obj._row_number = rowIndex || '';
  return obj;
}

/* =========================
   AUTH
   ========================= */

function getTeacherListEntryByEmail_(email) {
  var target = String(email || '').trim().toLowerCase();
  if (!target) return null;

  var teacherNames = Object.keys(APP.teacherEmails || {});
  for (var i = 0; i < teacherNames.length; i++) {
    var teacherName = teacherNames[i];
    var teacherEmail = String(APP.teacherEmails[teacherName] || '').trim().toLowerCase();
    if (teacherEmail === target) {
      return {
        email: teacherEmail,
        name: teacherName,
        role: 'teacher',
        active: 'TRUE'
      };
    }
  }

  return null;
}

function getConfiguredUserOverride_(email) {
  var target = String(email || '').trim().toLowerCase();
  if (!target) return null;

  if ((APP.adminEmailOverrides || []).some(function(adminEmail) {
    return String(adminEmail || '').trim().toLowerCase() === target;
  })) {
    var teacherEntry = getTeacherListEntryByEmail_(target);
    return {
      email: target,
      name: teacherEntry ? teacherEntry.name : target.split('@')[0],
      role: 'admin',
      active: 'TRUE'
    };
  }

  return getTeacherListEntryByEmail_(target);
}

function getCurrentUser_() {
  let email = '';
  try { email = Session.getActiveUser().getEmail() || ''; } catch(e) {}

  if (!email) {
    return { email: '', name: '', role: 'student', isAdmin: false };
  }

  email = String(email).trim();
  var normalizedEmail = email.toLowerCase();

  let match = null;
  try {
    const users = getRowsAsObjects_(APP.sheets.users.name);
    match = users.find(u => String(u.email || '').trim().toLowerCase() === normalizedEmail && String(u.active).toLowerCase() !== 'false');
  } catch(e) {}

  var configuredOverride = getConfiguredUserOverride_(normalizedEmail);
  var resolvedUser = configuredOverride || match;

  return {
    email,
    name: resolvedUser ? resolvedUser.name : '',
    role: resolvedUser ? resolvedUser.role : 'student',
    isAdmin: !!(resolvedUser && APP.adminRoles.includes(resolvedUser.role))
  };
}

function requireAdmin_() {
  const user = getCurrentUser_();
  if (!user.isAdmin) throw new Error('Admin access required.');
  return user;
}

function requireSystemAdmin_() {
  const user = requireAdmin_();
  if (user.role !== 'admin') throw new Error('System admin access required.');
  return user;
}

function normalizeEmail_(value) {
  return String(value || '').trim().toLowerCase();
}

function assertAllowedEmailDomain_(email, label) {
  var value = normalizeEmail_(email);
  var allowed = normalizeEmailDomainList_(APP.allowedEmailDomains);
  if (!value || !allowed.length) return;
  var domain = value.split('@').pop();
  if (allowed.indexOf(domain) === -1) {
    throw new Error((label || 'Email') + ' must use an approved school domain: @student.example.edu or @example.edu.');
  }
}

function normalizeEmailDomainList_(domains) {
  return (domains || []).map(function(domain) {
    return String(domain || '').trim().toLowerCase().replace(/^@/, '');
  }).filter(Boolean);
}

function assertEmailDomainList_(email, domains, label, message) {
  var value = normalizeEmail_(email);
  var allowed = normalizeEmailDomainList_(domains);
  if (!value || !allowed.length) return;
  var domain = value.split('@').pop();
  if (allowed.indexOf(domain) === -1) {
    throw new Error(message || ((label || 'Email') + ' must use an approved school domain.'));
  }
}

function assertStudentEmailDomain_(email, label) {
  assertEmailDomainList_(
    email,
    APP.studentEmailDomains || ['student.example.edu'],
    label || 'Student email',
    (label || 'Student email') + ' must use the student school domain: @student.example.edu.'
  );
}

function assertStaffEmailDomain_(email, label) {
  assertEmailDomainList_(
    email,
    APP.staffEmailDomains || ['example.edu'],
    label || 'Staff email',
    (label || 'Staff email') + ' must use the staff school domain: @example.edu.'
  );
}

function isOperationsUser_(user) {
  user = user || getCurrentUser_();
  return !!(user && user.isAdmin);
}

function isQueueOperator_(user) {
  user = user || getCurrentUser_();
  return !!(user && (user.role === 'admin' || user.role === 'technician'));
}

function requireQueueOperator_(purpose) {
  var user = requireAdmin_();
  if (!isQueueOperator_(user)) {
    throw new Error('Teacher accounts can view linked learning records but cannot ' + (purpose || 'change workshop operations') + '.');
  }
  return user;
}

function assertTeacherCanAccessSubmission_(row, user) {
  user = user || getCurrentUser_();
  if (user.role === 'teacher' && !isTeacherRecordMatch_(row, user)) {
    throw new Error('This submission is not linked to your teacher account.');
  }
}

function assertTeacherCanAccessOtherRequest_(row, user) {
  user = user || getCurrentUser_();
  if (user.role !== 'teacher') return;
  var myEmail = normalizeEmail_(user.email);
  var linked = normalizeEmail_(row.teacher_in_charge_email) === myEmail ||
    normalizeEmail_(row.approved_by_email) === myEmail;
  if (!linked) throw new Error('This special request is not linked to your teacher account.');
}

function getRequestUserKey_() {
  try {
    return String(Session.getTemporaryActiveUserKey() || '').trim();
  } catch (e) {
    return '';
  }
}

function requireRequestIdentity_(purpose) {
  var user = getCurrentUser_();
  var userKey = getRequestUserKey_();
  if (!normalizeEmail_(user.email) && !userKey) {
    throw new Error('Please sign in with your school account to ' + (purpose || 'continue') + '.');
  }
  return { user: user, userKey: userKey };
}

function enforceRequesterEmailAccess_(email, label) {
  var user = getCurrentUser_();
  var activeEmail = normalizeEmail_(user.email);
  var requestedEmail = normalizeEmail_(email);
  if (!activeEmail || isOperationsUser_(user)) return;
  if (requestedEmail && requestedEmail !== activeEmail) {
    throw new Error((label || 'Email') + ' must match your signed-in school account.');
  }
}

function rowOwnedByLookupUser_(row, ownerFields, user, userKey) {
  row = row || {};
  user = user || getCurrentUser_();
  ownerFields = ownerFields || [];
  var activeEmail = normalizeEmail_(user.email);
  if (activeEmail) {
    for (var i = 0; i < ownerFields.length; i++) {
      if (normalizeEmail_(row[ownerFields[i]]) === activeEmail) return true;
    }
  }
  var rowKey = String(row.submitter_key || '').trim();
  if (rowKey && userKey && rowKey === userKey) return true;
  return false;
}

function redactStudentLookupRow_(row) {
  row = row || {};
  var redacted = {
    _source: row._source || '',
    _row_number: row._row_number || '',
    case_number: formatCaseNumber_(row),
    status: row.status || '',
    machine: row.machine || '',
    created_at: row.created_at || '',
    updated_at: row.updated_at || row.created_at || '',
    queue_active: row.queue_active === true,
    queue_position: row.queue_position || '',
    queue_total_active: row.queue_total_active || '',
    queue_position_scope: row.queue_position_scope || '',
    queue_position_updated_at: row.queue_position_updated_at || '',
    queue_position_note: row.queue_position_note || '',
    pickup_estimate_label: row.pickup_estimate_label || '',
    pickup_estimate_window: row.pickup_estimate_window || '',
    pickup_estimate_note: row.pickup_estimate_note || '',
    pickup_estimate_school_days: row.pickup_estimate_school_days || '',
    lookup_limited: true,
    lookup_limited_reason: 'For privacy, sign in with the matching school account to view class, teacher, remarks, and submitted file links.'
  };
  if (row._source === 'other' || row.request_id || row.requester_email) {
    redacted.project_name = 'Special Request';
    redacted.request_type = '';
    redacted.department_or_subject = '';
  } else {
    redacted.material = '';
    redacted.year_group = '';
    redacted.design_class_no = '';
    redacted.design_teacher = '';
    redacted.prototype_fidelity = '';
  }
  return redacted;
}

function stripStudentLookupInternalIds_(row) {
  var safe = {};
  Object.keys(row || {}).forEach(function(key) {
    safe[key] = row[key];
  });
  safe.case_number = formatCaseNumber_(row);
  delete safe.submission_id;
  delete safe.request_id;
  return safe;
}

function secureStudentLookupRows_(rows, ownerFields) {
  rows = rows || [];
  var user = getCurrentUser_();
  if (isOperationsUser_(user)) return rows;
  var userKey = getRequestUserKey_();
  var hasVerifiedOwnerSignal = !!normalizeEmail_(user.email) || !!userKey;
  return rows
    .filter(function(row) {
      if (rowOwnedByLookupUser_(row, ownerFields, user, userKey)) return true;
      if (!normalizeEmail_(user.email) && !String(row.submitter_key || '').trim()) return true;
      return !hasVerifiedOwnerSignal;
    })
    .map(function(row) {
      return rowOwnedByLookupUser_(row, ownerFields, user, userKey)
        ? stripStudentLookupInternalIds_(row)
        : redactStudentLookupRow_(row);
    });
}

function sanitizeUploadFileName_(fileName) {
  var name = String(fileName || '').split(/[\\/]/).pop().trim();
  name = name.replace(/[^\w.\- ()]/g, '_').replace(/_+/g, '_').slice(0, 140);
  if (!name || name === '.' || name === '..') throw new Error('Uploaded file name is invalid.');
  return name;
}

function sanitizeUploadMimeType_(mimeType) {
  var value = String(mimeType || 'application/octet-stream').trim().slice(0, 120);
  if (!/^[A-Za-z0-9!#$&^_.+-]+\/[A-Za-z0-9!#$&^_.+-]+$/.test(value)) return 'application/octet-stream';
  return value;
}

function sanitizeUploadYearGroup_(yearGroup) {
  var value = String(yearGroup || 'General').trim().toUpperCase();
  if (value === 'OTHERREQ') return 'OtherReq';
  if (value === 'GENERAL') return 'General';
  if (!/^Y\d{1,2}$/.test(value)) return 'General';
  return value;
}

function sanitizeUploadBucket_(bucket) {
  var value = String(bucket || 'misc').trim().toLowerCase();
  var allowed = { laser: true, '3d': true, preview: true, other: true, misc: true };
  return allowed[value] ? value : 'misc';
}

function sanitizeEmailTemplateHtml_(html) {
  var safe = String(html || '');
  safe = safe.replace(/<\s*(script|style|iframe|object|embed|form|input|button|meta|link)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '');
  safe = safe.replace(/<\s*(script|style|iframe|object|embed|form|input|button|meta|link)\b[^>]*\/?>/gi, '');
  safe = safe.replace(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  safe = safe.replace(/\s+(href|src)\s*=\s*("|')\s*javascript:[\s\S]*?\2/gi, ' $1="#"');
  safe = safe.replace(/\s+(href|src)\s*=\s*javascript:[^\s>]+/gi, ' $1="#"');
  return safe;
}

/* =========================
   DRIVE SETUP
   ========================= */

function getOrCreateRootFolder_() {
  const existingId = APP.props.getProperty('ROOT_FOLDER_ID');
  if (existingId) {
    try { return DriveApp.getFolderById(existingId); } catch (err) {}
  }
  const folder = DriveApp.createFolder(APP.name);
  APP.props.setProperty('ROOT_FOLDER_ID', folder.getId());
  return folder;
}

function getOrCreateMasterSpreadsheet_(rootFolder) {
  const existingId = APP.props.getProperty('MASTER_SPREADSHEET_ID');
  if (existingId) {
    try { return SpreadsheetApp.openById(existingId); } catch (err) {}
  }

  const ss = SpreadsheetApp.create(APP.name + ' - Master');
  DriveApp.getFileById(ss.getId()).moveTo(rootFolder);
  APP.props.setProperty('MASTER_SPREADSHEET_ID', ss.getId());
  return ss;
}

function createFolderTree_(rootFolder) {
  const submissions = getOrCreateFolder_(rootFolder, 'submissions');
  const previews = getOrCreateFolder_(rootFolder, 'previews');

  const machinesByYear = {};
  (APP.defaultRules || []).forEach(row => {
    const year = String(row[0] || '').trim().toUpperCase();
    const machine = String(row[1] || '').trim().toLowerCase();
    if (!year) return;
    if (!machinesByYear[year]) machinesByYear[year] = {};
    if (machine) machinesByYear[year][machine] = true;
  });
  Object.keys(machinesByYear).sort((a, b) => {
    const ay = /^Y(\d+)$/i.exec(a);
    const by = /^Y(\d+)$/i.exec(b);
    if (ay && by) return Number(ay[1]) - Number(by[1]);
    if (ay) return -1;
    if (by) return 1;
    return a.localeCompare(b);
  }).forEach(year => {
    const subYear = getOrCreateFolder_(submissions, year);
    Object.keys(machinesByYear[year]).forEach(machine => {
      getOrCreateFolder_(subYear, machine);
    });

    getOrCreateFolder_(previews, year);
  });
}

function getUploadFolder_(yearGroup, bucket) {
  const root = getRootFolder_();
  if (bucket === 'preview') {
    const previews = getOrCreateFolder_(root, 'previews');
    return getOrCreateFolder_(previews, yearGroup);
  }

  const submissions = getOrCreateFolder_(root, 'submissions');
  const yearFolder = getOrCreateFolder_(submissions, yearGroup);
  return getOrCreateFolder_(yearFolder, bucket);
}

function getOrCreateFolder_(parent, name) {
  const it = parent.getFoldersByName(name);
  return it.hasNext() ? it.next() : parent.createFolder(name);
}

/* =========================
   SHEET SETUP
   ========================= */

function ensureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getMaxColumns() < headers.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), headers.length - sheet.getMaxColumns());
  }

  const current = sheet.getRange(1, 1, 1, headers.length).getDisplayValues()[0];
  const empty = current.every(v => !v);

  if (empty) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
  } else {
    /* Migration: append any headers not yet present in the sheet */
    var existingSet = {};
    current.forEach(function(h) { if (h) existingSet[h] = true; });
    var missing = headers.filter(function(h) { return !existingSet[h]; });
    if (missing.length) {
      var startCol = sheet.getLastColumn() + 1;
      if (sheet.getMaxColumns() < startCol + missing.length - 1) {
        sheet.insertColumnsAfter(sheet.getMaxColumns(), missing.length);
      }
      sheet.getRange(1, startCol, 1, missing.length).setValues([missing]);
    }
  }

  return sheet;
}

function seedRules_(sheet) {
  if (sheet.getLastRow() > 1) return;
  sheet.getRange(2, 1, APP.sampleRules.length, APP.sampleRules[0].length).setValues(APP.sampleRules);
}

function seedIssueTemplates_(sheet) {
  if (sheet.getLastRow() > 1) return;
  sheet.getRange(2, 1, APP.sampleIssues.length, APP.sampleIssues[0].length).setValues(APP.sampleIssues);
}

/**
 * Run this manually to replace all issue templates with the latest set.
 * Safe to run multiple times — clears old rows first.
 */
function reseedIssueTemplates() {
  requireSystemAdmin_();
  const sheet = getSheet_(APP.sheets.issueTemplates.name);
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
  }
  sheet.getRange(2, 1, APP.sampleIssues.length, APP.sampleIssues[0].length).setValues(APP.sampleIssues);
  Logger.log('Issue templates reseeded: ' + APP.sampleIssues.length + ' rows.');
}

function seedUsers_(sheet) {
  if (sheet.getLastRow() > 1) return;

  const email = Session.getEffectiveUser().getEmail() || '';
  const name = email ? email.split('@')[0] : 'Owner';

  sheet.getRange(2, 1, 1, 4).setValues([
    [email, name, 'admin', 'TRUE']
  ]);
}

function assertAdminDataObject_(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    throw new Error('Invalid admin payload.');
  }
}

function sanitizeAdminRowIndex_(sheet, rowIndex) {
  var rowNumber = Number(rowIndex);
  if (!rowNumber || !isFinite(rowNumber) || Math.floor(rowNumber) !== rowNumber || rowNumber < 2) {
    throw new Error('Invalid row index.');
  }
  if (rowNumber > sheet.getLastRow()) throw new Error('Row index is outside existing data.');
  return rowNumber;
}

function rejectUnknownAdminFields_(data, allowedHeaders) {
  var allowed = {};
  (allowedHeaders || []).forEach(function(header) { allowed[header] = true; });
  Object.keys(data || {}).forEach(function(key) {
    if (!allowed[key] && key !== '_row_number') throw new Error('Unsupported field: ' + key);
  });
}

function cleanAdminText_(value, maxLen) {
  return String(value || '').trim().slice(0, maxLen || 500);
}

function normalizeAdminFlag_(value) {
  return isFalseValue_(value) ? 'FALSE' : 'TRUE';
}

function validateAdminEmail_(email, label) {
  var value = normalizeEmail_(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    throw new Error((label || 'Email') + ' format is invalid.');
  }
  assertAllowedEmailDomain_(value, label);
  return value;
}

function sanitizeAdminRole_(role) {
  var value = String(role || 'student').trim().toLowerCase();
  var allowed = { admin: true, teacher: true, technician: true, student: true };
  if (!allowed[value]) throw new Error('Invalid user role.');
  return value;
}

function sanitizeRuleExtensions_(value) {
  var items = String(value || '')
    .split(',')
    .map(function(item) { return item.trim().toLowerCase(); })
    .filter(Boolean)
    .map(function(item) {
      item = item.charAt(0) === '.' ? item : '.' + item;
      if (!/^\.[a-z0-9]+$/.test(item)) throw new Error('Rule extensions must be comma-separated file extensions.');
      return item;
    });
  return items.join(', ');
}

function sanitizeRuleNumber_(value, label) {
  var raw = String(value || '').trim();
  if (!raw) return '';
  var num = Number(raw);
  if (!isFinite(num) || num < 0 || num > 5000) throw new Error(label + ' must be a valid positive number.');
  return String(num);
}

function sanitizeAdminRuleRecord_(data) {
  assertAdminDataObject_(data);
  rejectUnknownAdminFields_(data, APP.sheets.rules.headers);
  var record = {};
  if (Object.prototype.hasOwnProperty.call(data, 'year_group')) {
    record.year_group = cleanAdminText_(data.year_group, 12).toUpperCase();
    if (record.year_group && !/^Y\d{1,2}$/.test(record.year_group)) throw new Error('Rule year group must look like Y6, Y7, Y8, etc.');
  }
  if (Object.prototype.hasOwnProperty.call(data, 'machine')) {
    record.machine = cleanAdminText_(data.machine, 20).toLowerCase();
    if (record.machine && ['laser', '3d'].indexOf(record.machine) === -1) throw new Error('Rule machine must be laser or 3d.');
  }
  if (Object.prototype.hasOwnProperty.call(data, 'max_width')) record.max_width = sanitizeRuleNumber_(data.max_width, 'Max width');
  if (Object.prototype.hasOwnProperty.call(data, 'max_height')) record.max_height = sanitizeRuleNumber_(data.max_height, 'Max height');
  if (Object.prototype.hasOwnProperty.call(data, 'max_depth')) record.max_depth = sanitizeRuleNumber_(data.max_depth, 'Max depth');
  if (Object.prototype.hasOwnProperty.call(data, 'units')) record.units = cleanAdminText_(data.units, 20);
  if (Object.prototype.hasOwnProperty.call(data, 'materials')) record.materials = cleanAdminText_(data.materials, 500);
  if (Object.prototype.hasOwnProperty.call(data, 'accepted_extensions')) record.accepted_extensions = sanitizeRuleExtensions_(data.accepted_extensions);
  if (Object.prototype.hasOwnProperty.call(data, 'preview_required')) record.preview_required = normalizeAdminFlag_(data.preview_required);
  if (Object.prototype.hasOwnProperty.call(data, 'notes')) record.notes = cleanAdminText_(data.notes, 1000);
  if (Object.prototype.hasOwnProperty.call(data, 'active')) record.active = normalizeAdminFlag_(data.active);
  if (!Object.keys(record).length) throw new Error('No rule fields were supplied.');
  return record;
}

function sanitizeAdminUserRecord_(data) {
  assertAdminDataObject_(data);
  rejectUnknownAdminFields_(data, APP.sheets.users.headers);
  var role = sanitizeAdminRole_(data.role);
  var email = validateAdminEmail_(data.email, 'User email');
  if (role !== 'student') assertStaffEmailDomain_(email, 'Staff user email');
  return {
    email: email,
    name: cleanAdminText_(data.name, 120) || email.split('@')[0],
    role: role,
    active: normalizeAdminFlag_(data.active)
  };
}

function assertUserChangeKeepsAdminAccess_(actingUser, pendingRowIndex, pendingRecord) {
  var actingEmail = normalizeEmail_(actingUser && actingUser.email);
  if (actingEmail && normalizeEmail_(pendingRecord.email) === actingEmail && (pendingRecord.role !== 'admin' || pendingRecord.active === 'FALSE')) {
    throw new Error('You cannot remove your own active admin access.');
  }

  var rows = getRowsAsObjects_(APP.sheets.users.name);
  var activeAdmins = (APP.adminEmailOverrides || []).filter(function(email) {
    return !!normalizeEmail_(email);
  }).length;
  rows.forEach(function(row) {
    var effective = Number(row._row_number) === Number(pendingRowIndex)
      ? Object.assign({}, row, pendingRecord)
      : row;
    if (normalizeEmail_(effective.email) && String(effective.role || '').trim().toLowerCase() === 'admin' && String(effective.active || '').trim().toLowerCase() !== 'false') {
      activeAdmins++;
    }
  });
  if (activeAdmins < 1) throw new Error('At least one active admin account must remain.');
}

/* =========================
   UI RENDERING
   ========================= */

/* =========================
   ADMIN CONFIG FUNCTIONS
   ========================= */

function getAdminRulesRows() {
  requireSystemAdmin_();
  return getRowsAsObjects_(APP.sheets.rules.name);
}

function getAdminSubmissionControlRows() {
  requireSystemAdmin_();
  return getMergedSubmissionControlRows_().sort(compareSubmissionControls_);
}

function getAdminRulesQueueThroughputSnapshot() {
  requireSystemAdmin_();
  var dtRows = getRowsAsObjects_(APP.sheets.submissions.name).map(function(row) {
    row._source = 'dt';
    return row;
  });
  var otherRows = getRowsAsObjects_(APP.sheets.otherRequests.name).map(function(row) {
    row._source = 'other';
    return row;
  });
  var rows = dtRows.concat(otherRows);
  return {
    ok: true,
    updated_at: formatHongKongTimestamp_(new Date()),
    timeline: buildQueueDailyThroughputTimeline_(rows, 30),
    note: 'Admin-only 30-day throughput. Submitted uses created date. Finished uses the latest updated date for records currently marked Completed.'
  };
}

function saveAdminSubmissionControl(data) {
  var user = requireAdmin_();
  if (user.role !== 'admin') throw new Error('Only admins can manage submission deadlines and cutoffs.');

  var yearGroup = String((data && data.year_group) || '').trim().toUpperCase();
  var classNo = String((data && data.class_no) || '').trim();
  var deadlineAt = String((data && data.deadline_at) || '').trim();
  var deadlineDate = deadlineAt ? parseAppDateTimeInput_(deadlineAt) : null;
  var message = String((data && data.message) || '').trim();
  var active = isFalseValue_(data && data.active) ? 'FALSE' : 'TRUE';
  var isClosed = isTrueValue_(data && data.is_closed) ? 'TRUE' : 'FALSE';

  if (!yearGroup) throw new Error('Year group is required.');
  if (deadlineAt && !deadlineDate) throw new Error('Deadline must be a valid date and time.');
  if (active !== 'FALSE' && isClosed !== 'TRUE' && !deadlineAt) {
    throw new Error('Set a deadline or use Cut Off Now.');
  }

  var sheet = getSubmissionControlsSheet_();
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  var rows = getSubmissionControlRows_();
  var targetClass = normalizeClassNo_(classNo);
  var existingIndex = rows.findIndex(function(row) {
    return String(row.year_group || '').trim().toUpperCase() === yearGroup && normalizeClassNo_(row.class_no) === targetClass;
  });
  var now = formatAppTimestamp_(new Date());
  var controlId = existingIndex === -1
    ? Utilities.getUuid()
    : String(rows[existingIndex].control_id || '').trim() || Utilities.getUuid();
  var record = {
    control_id: controlId,
    year_group: yearGroup,
    class_no: classNo,
    deadline_at: active === 'FALSE' ? '' : (deadlineDate ? formatAppTimestamp_(deadlineDate) : ''),
    is_closed: active === 'FALSE' ? 'FALSE' : isClosed,
    message: message,
    active: active,
    updated_at: now,
    updated_by: user.email || ''
  };

  if (existingIndex === -1) {
    appendObject_(APP.sheets.submissionControls.name, record);
  } else {
    var rowIndex = existingIndex + 2;
    Object.keys(record).forEach(function(key) {
      writeCellByHeader_(sheet, headers, rowIndex, key, record[key]);
    });
  }

  var scopeLabel = yearGroup + (classNo ? ' Class ' + classNo : '');
  var actionLabel = active === 'FALSE'
    ? 'reopen_submission_scope'
    : (isClosed === 'TRUE' ? 'close_submission_scope' : 'set_submission_deadline');
  appendObject_(APP.sheets.auditLog.name, {
    timestamp: getAuditTimestamp_(),
    submission_id: '',
    actor_email: user.email || '',
    action_type: actionLabel,
    old_status: '',
    new_status: '',
    notes: scopeLabel + (record.deadline_at ? ' deadline=' + record.deadline_at : '') + (record.message ? ' message=' + record.message : '')
  });

  return {
    ok: true,
    controls: getSubmissionControlsForClient(),
    rows: getAdminSubmissionControlRows()
  };
}

function saveAdminRule(rowIndex, data) {
  const user = requireAdmin_();
  if (user.role !== 'admin') throw new Error('Only admins can edit rules.');
  const sheet = getSheet_(APP.sheets.rules.name);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const safeRowIndex = sanitizeAdminRowIndex_(sheet, rowIndex);
  const record = sanitizeAdminRuleRecord_(data);
  Object.keys(record).forEach(function(key) {
    writeCellByHeader_(sheet, headers, safeRowIndex, key, record[key]);
  });
  appendObject_(APP.sheets.auditLog.name, {
    timestamp: getAuditTimestamp_(),
    submission_id: '',
    actor_email: user.email || '',
    action_type: 'edit_rule',
    old_status: '',
    new_status: '',
    notes: 'Rule row ' + safeRowIndex + ' updated'
  });
  return { ok: true };
}

function getAdminUsersRows() {
  requireSystemAdmin_();
  return getRowsAsObjects_(APP.sheets.users.name);
}

function saveAdminUser(rowIndex, data) {
  const user = requireAdmin_();
  if (user.role !== 'admin') throw new Error('Only admins can manage users.');
  const sheet = getSheet_(APP.sheets.users.name);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const safeRowIndex = sanitizeAdminRowIndex_(sheet, rowIndex);
  const current = rowArrayToObject_(headers, sheet.getRange(safeRowIndex, 1, 1, sheet.getLastColumn()).getDisplayValues()[0], safeRowIndex);
  const record = sanitizeAdminUserRecord_(Object.assign({}, current, data || {}));
  assertUserChangeKeepsAdminAccess_(user, safeRowIndex, record);
  APP.sheets.users.headers.forEach(function(key) {
    writeCellByHeader_(sheet, headers, safeRowIndex, key, record[key]);
  });
  appendObject_(APP.sheets.auditLog.name, {
    timestamp: getAuditTimestamp_(),
    submission_id: '',
    actor_email: user.email || '',
    action_type: 'edit_user',
    old_status: '',
    new_status: '',
    notes: 'User row ' + safeRowIndex + ': ' + record.email + ' role=' + record.role
  });
  return { ok: true };
}

function addAdminUser(data) {
  const user = requireAdmin_();
  if (user.role !== 'admin') throw new Error('Only admins can add users.');
  const record = sanitizeAdminUserRecord_(data || {});
  assertUserChangeKeepsAdminAccess_(user, null, record);
  appendObject_(APP.sheets.users.name, record);
  appendObject_(APP.sheets.auditLog.name, {
    timestamp: getAuditTimestamp_(),
    submission_id: '',
    actor_email: user.email || '',
    action_type: 'add_user',
    old_status: '',
    new_status: '',
    notes: 'Added user: ' + record.email + ' role=' + record.role
  });
  return { ok: true };
}

function getAuditLogRows(limit) {
  requireSystemAdmin_();
  var rows = getRowsAsObjects_(APP.sheets.auditLog.name);
  rows.sort(function(a, b) { return getSortableTime_(b.timestamp) - getSortableTime_(a.timestamp); });
  rows = rows.map(function(row) {
    row.timestamp = formatHongKongTimestamp_(row.timestamp) || row.timestamp;
    return row;
  });
  var max = Number(limit) || 200;
  return rows.slice(0, max);
}

function getAdminIssueRows() {
  requireSystemAdmin_();
  return getRowsAsObjects_(APP.sheets.issueTemplates.name);
}

/* =========================
   WEB APP
   ========================= */

function doGet(e) {
  const page = ((e && e.parameter && e.parameter.page) || 'submit').toLowerCase();
  const safePage = ['submit', 'status', 'queue', 'teacherbeta', 'admin', 'machines', 'help', 'rules', 'users', 'audit', 'other'].includes(page) ? page : 'submit';

  let webAppUrl = '';
  try {
    const u = ScriptApp.getService().getUrl();
    // Accept both /exec (production) and /dev (test) GAS endpoints
    if (u && u.includes('script.google.com') && (u.includes('/exec') || u.includes('/dev'))) webAppUrl = u;
  } catch(e) {}
  const user = getCurrentUser_();
  const action = String((e && e.parameter && e.parameter.action) || '').trim().toLowerCase();
  if (action === 'teacher_class_csv') {
    return ContentService
      .createTextOutput(getTeacherBetaClassStatusCsv_(user, e && e.parameter ? e.parameter : {}))
      .setMimeType(ContentService.MimeType.CSV);
  }
  const opsPages = ['admin', 'teacherbeta'];
  const systemAdminPages = ['rules', 'users', 'audit'];
  /* Server-side routing: students get the student app; teacher/technician stay in the operations queue. */
  let resolvedPage = safePage;
  if (opsPages.includes(safePage) && !user.isAdmin) resolvedPage = 'submit';
  if (safePage === 'teacherbeta' && user.role !== 'teacher' && user.role !== 'admin') resolvedPage = user.isAdmin ? 'admin' : 'submit';
  if (systemAdminPages.includes(safePage) && user.role !== 'admin') {
    resolvedPage = user.isAdmin ? 'admin' : 'submit';
  }

  const boot = {
    page: resolvedPage,
    baseUrl: webAppUrl,
    build: getClientBuildInfo_(),
    appTimeZone: getAppTimeZone_(),
    rules: getRulesForClient(),
    submissionControls: getSubmissionControlsForClient(),
    issueTemplates: isQueueOperator_(user) ? getIssueTemplatesForClient() : [],
    currentUser: user,
    statuses: isQueueOperator_(user) ? Object.values(APP.status) : [],
    appName: APP.props.getProperty('APP_NAME') || APP.name,
    queuePolicy: APP.queuePolicy || {},
    uiText: {
      statusMessages: APP.uiText.statusMessages,
      otherRequestTypes: APP.uiText.otherRequestTypes,
      otherRequestRoles: APP.uiText.otherRequestRoles,
      otherRequestDepartments: APP.uiText.otherRequestDepartments,
      otherRequestPurposes: APP.uiText.otherRequestPurposes
    }
  };

  return HtmlService.createHtmlOutput(renderPage_(resolvedPage, boot))
    .setTitle(APP.name)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.DEFAULT);
}

/* =========================
   PUBLIC SERVER FUNCTIONS
   ========================= */

function getRulesForClient() {
  return getRowsAsObjects_(APP.sheets.rules.name).filter(r => String(r.active).toLowerCase() !== 'false');
}

function isActiveQueueStatus_(status) {
  return {
    submitted: true,
    approved: true,
    in_queue: true,
    in_production: true
  }[String(status || '').trim()] === true;
}

function queuePositionSource_(row) {
  row = row || {};
  var source = String(row._source || '').trim().toLowerCase();
  if (source === 'other' || source === 'special' || source === 'special_request') return 'other';
  if (source === 'dt') return 'dt';
  return casePrefixForRow_(row) === 'A' ? 'other' : 'dt';
}

function queuePositionKey_(row) {
  row = row || {};
  var source = queuePositionSource_(row);
  var id = source === 'other' ? row.request_id : row.submission_id;
  id = String(id || '').trim();
  if (id) return source + ':id:' + id;
  return source + ':case:' + formatCaseNumber_(row);
}

function compareActiveQueueRows_(a, b) {
  var createdDiff = getSortableTime_(a.created_at) - getSortableTime_(b.created_at);
  if (createdDiff) return createdDiff;
  var updatedDiff = getSortableTime_(a.updated_at) - getSortableTime_(b.updated_at);
  if (updatedDiff) return updatedDiff;
  var sourceDiff = queuePositionSource_(a).localeCompare(queuePositionSource_(b));
  if (sourceDiff) return sourceDiff;
  return Number(a._row_number || 0) - Number(b._row_number || 0);
}

function getActiveQueuePositionIndex_() {
  var cache = CacheService.getScriptCache();
  var cacheKey = 'active_queue_position_index_v1';
  try {
    var cached = cache.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (cacheReadErr) {}

  var dtRows = getRowsAsObjects_(APP.sheets.submissions.name).map(function(row) {
    row._source = 'dt';
    return row;
  });
  var otherRows = getRowsAsObjects_(APP.sheets.otherRequests.name).map(function(row) {
    row._source = 'other';
    return row;
  });
  var activeRows = dtRows.concat(otherRows)
    .filter(function(row) { return isActiveQueueStatus_(row.status); })
    .sort(compareActiveQueueRows_);

  var index = {
    total: activeRows.length,
    updated_at: formatHongKongTimestamp_(new Date()),
    by_key: {}
  };
  activeRows.forEach(function(row, idx) {
    var key = queuePositionKey_(row);
    if (!key || index.by_key[key]) return;
    index.by_key[key] = {
      position: idx + 1,
      total: activeRows.length
    };
  });

  try { cache.put(cacheKey, JSON.stringify(index), 20); } catch (cacheWriteErr) {}
  return index;
}

function isSchoolDay_(date) {
  var parts = Utilities.formatDate(date, getAppTimeZone_(), 'yyyy-MM-dd').split('-');
  var day = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]), 12, 0, 0).getDay();
  return day >= 1 && day <= 5;
}

function normalizeSchoolDate_(value, allowToday) {
  var date = toDateObject_(value) || new Date();
  var result = new Date(date.getTime());
  if (!allowToday) result = new Date(result.getTime() + 24 * 60 * 60 * 1000);
  while (!isSchoolDay_(result)) {
    result = new Date(result.getTime() + 24 * 60 * 60 * 1000);
  }
  return result;
}

function addSchoolDays_(value, days) {
  var result = normalizeSchoolDate_(value, true);
  var remaining = Math.max(0, Number(days || 0));
  while (remaining > 0) {
    result = new Date(result.getTime() + 24 * 60 * 60 * 1000);
    if (isSchoolDay_(result)) remaining--;
  }
  return result;
}

function laterDate_(a, b) {
  var da = toDateObject_(a) || new Date();
  var db = toDateObject_(b) || new Date();
  return da.getTime() >= db.getTime() ? da : db;
}

function formatPickupDateLabel_(date, afterSchool) {
  var label = Utilities.formatDate(date, getAppTimeZone_(), 'EEE MMM d');
  return afterSchool ? label + ' after school' : label;
}

function buildPickupEstimateForRow_(row) {
  row = row || {};
  var status = String(row.status || '').trim();
  var active = isActiveQueueStatus_(status);
  var estimate = {
    pickup_estimate_label: '',
    pickup_estimate_window: '',
    pickup_estimate_note: '',
    pickup_estimate_school_days: ''
  };

  if (status === 'completed') {
    estimate.pickup_estimate_label = 'Ready to collect';
    estimate.pickup_estimate_window = 'Ready now';
    estimate.pickup_estimate_note = 'Collect from the workshop when your teacher or technician says it is ready.';
    return estimate;
  }
  if (status === 'needs_fix') {
    estimate.pickup_estimate_label = 'No pickup estimate yet';
    estimate.pickup_estimate_window = 'Paused until revision';
    estimate.pickup_estimate_note = 'A pickup estimate will be useful after the corrected file is submitted and reviewed.';
    return estimate;
  }
  if (status === 'rejected') {
    estimate.pickup_estimate_label = 'No pickup estimate';
    estimate.pickup_estimate_window = 'Not active';
    estimate.pickup_estimate_note = 'Speak with your teacher before submitting a replacement.';
    return estimate;
  }
  if (!active) return estimate;

  var policy = ((APP.queuePolicy || {}).pickupEstimate || {});
  var workStartDays = Math.max(1, Number(policy.workStartsAfterSchoolDays || policy.minSchoolDaysFromSubmission || 3));
  var pickupStartDays = Math.max(workStartDays + 1, Number(policy.pickupStartAfterSchoolDays || 4));
  var pickupEndDays = Math.max(pickupStartDays, Number(policy.pickupEndAfterSchoolDays || 5));
  var created = toDateObject_(row.created_at) || new Date();
  var start = addSchoolDays_(created, pickupStartDays);
  var end = addSchoolDays_(created, pickupEndDays);

  estimate.pickup_estimate_label = 'Estimated pickup window';
  estimate.pickup_estimate_window = formatPickupDateLabel_(start, true) + ' - ' + formatPickupDateLabel_(end, false);
  estimate.pickup_estimate_note = 'Planning estimate only. The workshop normally needs about ' + workStartDays + ' school days from submission before working through the request, so pickup is usually around school day ' + pickupStartDays + '-' + pickupEndDays + ' after submission. Queue pressure, machine capacity, material, file fixes, and technician judgement can move this later.';
  estimate.pickup_estimate_school_days = pickupStartDays + '-' + pickupEndDays + ' school days after submission';
  return estimate;
}

function attachActiveQueuePositions_(rows) {
  rows = rows || [];
  if (!rows.length) return rows;
  var index = getActiveQueuePositionIndex_();
  rows.forEach(function(row) {
    var status = String(row.status || '').trim();
    var active = isActiveQueueStatus_(status);
    row.queue_active = active;
    row.queue_total_active = Number(index.total || 0);
    row.queue_position_scope = 'whole_workshop_active';
    row.queue_position_updated_at = index.updated_at || '';
    if (active) {
      var hit = index.by_key[queuePositionKey_(row)];
      row.queue_position = hit ? Number(hit.position || 0) : '';
      row.queue_position_note = 'Approximate active-workshop order. Counts Submitted, Approved, In Queue, and In Production. Machine type, material, revision work, and technician judgement can change the final order.';
    } else if (status === 'needs_fix') {
      row.queue_position = '';
      row.queue_position_note = 'Paused for student revision. It will re-enter active workshop flow after a corrected file is submitted and reviewed.';
    } else if (status === 'completed') {
      row.queue_position = '';
      row.queue_position_note = 'Completed requests are no longer counted in the active queue.';
    } else if (status === 'rejected') {
      row.queue_position = '';
      row.queue_position_note = 'Rejected requests are not counted in the active queue.';
    } else {
      row.queue_position = '';
      row.queue_position_note = 'Queue position is available after the request enters the active workshop flow.';
    }
    var pickup = buildPickupEstimateForRow_(row);
    Object.keys(pickup).forEach(function(key) {
      row[key] = pickup[key];
    });
  });
  return rows;
}

function getQueueHealthSnapshot() {
  var cache = CacheService.getScriptCache();
  var cacheKey = 'queue_health_snapshot_v4';
  try {
    var cached = cache.get(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (cacheReadErr) {}

  var dtRows = getRowsAsObjects_(APP.sheets.submissions.name).map(function(row) {
    row._source = 'dt';
    return row;
  });
  var otherRows = getRowsAsObjects_(APP.sheets.otherRequests.name).map(function(row) {
    row._source = 'other';
    return row;
  });
  var rows = dtRows.concat(otherRows);
  var counts = {
    total_records: rows.length,
    active_queue: 0,
    waiting_review: 0,
    approved_ready: 0,
    in_queue: 0,
    in_production: 0,
    waiting_student: 0,
    completed: 0,
    rejected: 0,
    laser_active: 0,
    print3d_active: 0,
    dt_active: 0,
    special_active: 0
  };
  var oldestActive = null;

  rows.forEach(function(row) {
    var status = String(row.status || '').trim();
    var machine = String(row.machine || '').trim().toLowerCase();
    var active = isActiveQueueStatus_(status);
    if (active) {
      counts.active_queue++;
      if (machine === 'laser') counts.laser_active++;
      if (machine === '3d') counts.print3d_active++;
      if (row._source === 'other') counts.special_active++;
      else counts.dt_active++;
      if (!oldestActive || getSortableTime_(row.created_at) < getSortableTime_(oldestActive.created_at)) {
        oldestActive = row;
      }
    }
    if (status === 'submitted') counts.waiting_review++;
    if (status === 'approved') counts.approved_ready++;
    if (status === 'in_queue') counts.in_queue++;
    if (status === 'in_production') counts.in_production++;
    if (status === 'needs_fix') counts.waiting_student++;
    if (status === 'completed') counts.completed++;
    if (status === 'rejected') counts.rejected++;
  });

  var snapshot = {
    ok: true,
    updated_at: formatHongKongTimestamp_(new Date()),
    counts: counts,
    daily_request_timeline: buildQueueDailyRequestTimeline_(rows, 14),
    thresholds: {
      busy_active_queue: Number((APP.queuePolicy || {}).activeBusyThreshold || 20),
      heavy_active_queue: Number((APP.queuePolicy || {}).activeHeavyThreshold || 30),
      student_count_reveal: Number((APP.queuePolicy || {}).studentCountRevealThreshold || 50)
    },
    laser_capacity_notice: (APP.queuePolicy || {}).laserCapacityNotice || null,
    oldest_active_created_at: oldestActive ? oldestActive.created_at : '',
    note: 'Active queue includes Submitted, Approved, In Queue, and In Production. Needs Fix waits on student revision and is tracked separately.'
  };
  try { cache.put(cacheKey, JSON.stringify(snapshot), 20); } catch (cacheWriteErr) {}
  return snapshot;
}

function buildQueueDailyRequestTimeline_(rows, days) {
  days = Math.max(7, Math.min(30, Number(days || 14)));
  var timeZone = getAppTimeZone_();
  var now = new Date();
  var byDate = {};
  var series = [];

  for (var i = days - 1; i >= 0; i--) {
    var d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    var key = Utilities.formatDate(d, timeZone, 'yyyy-MM-dd');
    var item = {
      date: key,
      label: Utilities.formatDate(d, timeZone, 'MMM d'),
      total: 0,
      dt: 0,
      special: 0
    };
    byDate[key] = item;
    series.push(item);
  }

  (rows || []).forEach(function(row) {
    var created = toDateObject_(row.created_at);
    if (!created) return;
    var key = Utilities.formatDate(created, timeZone, 'yyyy-MM-dd');
    var item = byDate[key];
    if (!item) return;
    item.total++;
    if (row._source === 'other') item.special++;
    else item.dt++;
  });

  var maxTotal = series.reduce(function(max, item) {
    return Math.max(max, Number(item.total || 0));
  }, 0);

  return {
    range_days: days,
    timezone: timeZone,
    max_total: maxTotal,
    days: series
  };
}

function buildQueueDailyThroughputTimeline_(rows, days) {
  days = Math.max(7, Math.min(45, Number(days || 21)));
  var timeZone = getAppTimeZone_();
  var now = new Date();
  var byDate = {};
  var series = [];

  for (var i = days - 1; i >= 0; i--) {
    var d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    var key = Utilities.formatDate(d, timeZone, 'yyyy-MM-dd');
    var item = {
      date: key,
      label: Utilities.formatDate(d, timeZone, 'MMM d'),
      submitted: 0,
      submitted_dt: 0,
      submitted_special: 0,
      finished: 0,
      finished_dt: 0,
      finished_special: 0
    };
    byDate[key] = item;
    series.push(item);
  }

  (rows || []).forEach(function(row) {
    var created = toDateObject_(row.created_at);
    if (created) {
      var createdKey = Utilities.formatDate(created, timeZone, 'yyyy-MM-dd');
      var createdItem = byDate[createdKey];
      if (createdItem) {
        createdItem.submitted++;
        if (row._source === 'other') createdItem.submitted_special++;
        else createdItem.submitted_dt++;
      }
    }

    var status = String(row.status || '').trim().toLowerCase();
    if (status === 'completed') {
      var finished = toDateObject_(row.updated_at || row.created_at);
      if (finished) {
        var finishedKey = Utilities.formatDate(finished, timeZone, 'yyyy-MM-dd');
        var finishedItem = byDate[finishedKey];
        if (finishedItem) {
          finishedItem.finished++;
          if (row._source === 'other') finishedItem.finished_special++;
          else finishedItem.finished_dt++;
        }
      }
    }
  });

  var maxSubmitted = series.reduce(function(max, item) {
    return Math.max(max, Number(item.submitted || 0));
  }, 0);
  var maxFinished = series.reduce(function(max, item) {
    return Math.max(max, Number(item.finished || 0));
  }, 0);

  return {
    range_days: days,
    timezone: timeZone,
    max_submitted: maxSubmitted,
    max_finished: maxFinished,
    max_total: Math.max(maxSubmitted, maxFinished),
    days: series
  };
}

function getSubmissionControlsSheet_() {
  return ensureSheet_(getSpreadsheet_(), APP.sheets.submissionControls.name, APP.sheets.submissionControls.headers);
}

function getSubmissionControlRows_() {
  var sheet = getSubmissionControlsSheet_();
  var values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  var headers = values[0];
  return values.slice(1).map(function(row) {
    var obj = {};
    headers.forEach(function(h, i) { obj[h] = row[i] || ''; });
    return obj;
  });
}

function getDefaultSubmissionControlRows_() {
  return (APP.defaultSubmissionControls || []).map(function(row) {
    var copy = {};
    APP.sheets.submissionControls.headers.forEach(function(header) {
      copy[header] = row[header] || '';
    });
    return copy;
  });
}

function normalizeClassNo_(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, '');
}

function isTrueValue_(value) {
  return String(value || '').trim().toLowerCase() === 'true';
}

function isFalseValue_(value) {
  return String(value || '').trim().toLowerCase() === 'false';
}

function compareSubmissionControls_(a, b) {
  var aActive = isFalseValue_(a.active) ? 0 : 1;
  var bActive = isFalseValue_(b.active) ? 0 : 1;
  if (bActive !== aActive) return bActive - aActive;

  var aSpecific = normalizeClassNo_(a.class_no) ? 1 : 0;
  var bSpecific = normalizeClassNo_(b.class_no) ? 1 : 0;
  if (bSpecific !== aSpecific) return bSpecific - aSpecific;

  return getSortableTime_(b.updated_at) - getSortableTime_(a.updated_at);
}

function getSubmissionControlScopeKey_(row) {
  return String(row && row.year_group || '').trim().toUpperCase() + '|' + normalizeClassNo_(row && row.class_no);
}

function getMergedSubmissionControlRows_() {
  var configured = getSubmissionControlRows_();
  var configuredScopes = {};
  configured.forEach(function(row) {
    var key = getSubmissionControlScopeKey_(row);
    if (key !== '|') configuredScopes[key] = true;
  });

  var defaults = getDefaultSubmissionControlRows_().filter(function(row) {
    var key = getSubmissionControlScopeKey_(row);
    return key !== '|' && !configuredScopes[key];
  });

  return configured.concat(defaults);
}

function getSubmissionControlsForClient() {
  return getMergedSubmissionControlRows_()
    .filter(function(row) { return !isFalseValue_(row.active); })
    .sort(compareSubmissionControls_);
}

function getSubmissionControlDecision_(yearGroup, classNo) {
  var targetYear = String(yearGroup || '').trim().toUpperCase();
  var requestedClass = String(classNo || '').trim();
  var targetClass = normalizeClassNo_(requestedClass);

  if (!targetYear) {
    return {
      blocked: false,
      status: 'open',
      message: '',
      scope_label: ''
    };
  }

  var matched = getSubmissionControlsForClient()
    .filter(function(row) {
      if (String(row.year_group || '').trim().toUpperCase() !== targetYear) return false;
      var controlClass = normalizeClassNo_(row.class_no);
      return !controlClass || controlClass === targetClass;
    })
    .sort(compareSubmissionControls_)[0];

  var scopeLabel = targetYear + (requestedClass ? ' Class ' + requestedClass : '');
  if (!matched) {
    return {
      blocked: false,
      status: 'open',
      message: '',
      scope_label: scopeLabel
    };
  }

  var controlClassNo = String(matched.class_no || '').trim();
  var matchedScopeLabel = String(matched.year_group || '').trim().toUpperCase() + (controlClassNo ? ' Class ' + controlClassNo : '');
  var deadline = toDateObject_(matched.deadline_at);
  var customMessage = String(matched.message || '').trim();

  if (isTrueValue_(matched.is_closed)) {
    return {
      blocked: true,
      status: 'closed',
      message: customMessage || ('Submissions for ' + matchedScopeLabel + ' are currently closed. Please speak to your teacher or the technician team.'),
      scope_label: matchedScopeLabel,
      deadline_at: matched.deadline_at || '',
      control_id: matched.control_id || '',
      year_group: matched.year_group || '',
      class_no: matched.class_no || ''
    };
  }

  if (deadline && deadline.getTime() < Date.now()) {
    return {
      blocked: true,
      status: 'deadline_passed',
      message: customMessage || ('The submission deadline for ' + matchedScopeLabel + ' passed on ' + formatHongKongTimestamp_(deadline) + '. Please speak to your teacher if you need an exception.'),
      scope_label: matchedScopeLabel,
      deadline_at: matched.deadline_at || '',
      control_id: matched.control_id || '',
      year_group: matched.year_group || '',
      class_no: matched.class_no || ''
    };
  }

  return {
    blocked: false,
    status: deadline ? 'deadline_set' : 'open',
    message: customMessage || (deadline ? ('Submission deadline for ' + matchedScopeLabel + ': ' + formatHongKongTimestamp_(deadline) + '.') : ''),
    scope_label: matchedScopeLabel,
    deadline_at: matched.deadline_at || '',
    control_id: matched.control_id || '',
    year_group: matched.year_group || '',
    class_no: matched.class_no || ''
  };
}

function submitSubmission(payload) {
  const identity = requireRequestIdentity_('submit a fabrication request');
  validateSubmission_(payload);

  const now = new Date();
  const submissionId = Utilities.getUuid();
  const submitterKey = identity.userKey;

  const record = {
    submission_id: submissionId,
    created_at: formatAppTimestamp_(now),
    student_email: payload.student_email || '',
    student_name: payload.student_name || '',
    design_class_no: payload.design_class_no || '',
    design_teacher: payload.design_teacher || '',
    year_group: payload.year_group || '',
    machine: payload.machine || '',
    material: payload.material || '',
    width: payload.width || '',
    height: payload.height || '',
    depth: payload.depth || '',
    units: payload.units || '',
    working_file_id: payload.working_file ? payload.working_file.id : '',
    working_file_name: payload.working_file ? payload.working_file.name : '',
    working_file_url: payload.working_file ? payload.working_file.url : '',
    preview_file_id: payload.preview_file ? payload.preview_file.id : '',
    preview_file_name: payload.preview_file ? payload.preview_file.name : '',
    preview_file_url: payload.preview_file ? payload.preview_file.url : '',
    status: APP.status.SUBMITTED,
    issue_code: '',
    admin_remarks: payload.additional_notes || '',
    submitted_by: payload.student_email || '',
    submitter_key: submitterKey,
    updated_at: formatAppTimestamp_(now),
    updated_by: payload.student_email || '',
    prototype_fidelity: payload.prototype_fidelity || ''
  };

  record._row_number = appendObject_(APP.sheets.submissions.name, record);
  record.case_number = formatCaseNumber_(record);

  appendObject_(APP.sheets.auditLog.name, {
    timestamp: getAuditTimestamp_(),
    submission_id: submissionId,
    actor_email: payload.student_email || '',
    action_type: 'create_submission',
    old_status: '',
    new_status: APP.status.SUBMITTED,
    notes: 'Submission created'
  });

  /* Send confirmation email to student */
  try { sendSubmissionConfirmation_(record); } catch (e) { Logger.log('Confirmation email failed: ' + e); }

  var activity = getSubmissionActivityByEmail_(payload.student_email);
  return {
    ok: true,
    case_number: record.case_number,
    submission_id: submissionId,
    submitted_at: formatHongKongTimestamp_(now),
    submissions_today: activity.counts.total,
    dt_submissions_today: activity.counts.dt,
    special_submissions_today: activity.counts.special,
    last_24h_submissions: activity.last24_count,
    recent_submissions: activity.recent
  };
}

/* =========================
   OTHER / SPECIAL REQUESTS
   ========================= */

function submitOtherRequest(payload) {
  const identity = requireRequestIdentity_('submit a special request');
  validateOtherRequest_(payload);

  const now = new Date();
  const requestId = 'OR-' + Utilities.getUuid().substring(0, 8).toUpperCase();
  const submitterKey = identity.userKey;

  const record = {
    request_id: requestId,
    created_at: formatAppTimestamp_(now),
    requester_email: payload.requester_email || '',
    requester_name: payload.requester_name || '',
    requester_role: payload.requester_role || '',
    department_or_subject: payload.department_or_subject || '',
    request_type: payload.request_type || '',
    project_name: payload.project_name || '',
    project_purpose: payload.project_purpose || '',
    competition_name: payload.competition_name || '',
    event_or_deadline: payload.event_or_deadline || '',
    teacher_in_charge: payload.teacher_in_charge || '',
    teacher_in_charge_email: payload.teacher_in_charge_email || '',
    approved_by_email: payload.approved_by_email || '',
    approval_status: 'pending',
    machine: payload.machine || '',
    material: payload.material || '',
    width: payload.width || '',
    height: payload.height || '',
    depth: payload.depth || '',
    units: payload.units || '',
    quantity: payload.quantity || '1',
    working_file_id: payload.working_file ? payload.working_file.id : '',
    working_file_name: payload.working_file ? payload.working_file.name : '',
    working_file_url: payload.working_file ? payload.working_file.url : '',
    preview_file_id: payload.preview_file ? payload.preview_file.id : '',
    preview_file_name: payload.preview_file ? payload.preview_file.name : '',
    preview_file_url: payload.preview_file ? payload.preview_file.url : '',
    additional_requirements: payload.additional_requirements || '',
    year_group: payload.year_group || '',
    class: payload.class || '',
    needed_by_date: payload.needed_by_date || '',
    priority_reason: payload.priority_reason || '',
    request_description: payload.request_description || '',
    status: APP.status.SUBMITTED,
    issue_code: '',
    admin_remarks: '',
    submitted_by: payload.requester_email || '',
    submitter_key: submitterKey,
    updated_at: formatAppTimestamp_(now),
    updated_by: payload.requester_email || ''
  };

  record._row_number = appendObject_(APP.sheets.otherRequests.name, record);
  record.case_number = formatCaseNumber_(record);

  appendObject_(APP.sheets.auditLog.name, {
    timestamp: getAuditTimestamp_(),
    submission_id: requestId,
    actor_email: payload.requester_email || '',
    action_type: 'create_other_request',
    old_status: '',
    new_status: APP.status.SUBMITTED,
    notes: 'Other request created: ' + (payload.request_type || '') + ' / ' + (payload.project_name || '')
  });

  /* Send confirmation email to requester */
  try { sendOtherRequestConfirmation_(record); } catch (e) { Logger.log('Other Request confirmation email failed: ' + e); }

  var activity = getSubmissionActivityByEmail_(payload.requester_email);
  return {
    ok: true,
    case_number: record.case_number,
    request_id: requestId,
    submitted_at: formatHongKongTimestamp_(now),
    submissions_today: activity.counts.total,
    dt_submissions_today: activity.counts.dt,
    special_submissions_today: activity.counts.special,
    last_24h_submissions: activity.last24_count,
    recent_submissions: activity.recent
  };
}

function validateOtherRequest_(payload) {
  if (!payload || typeof payload !== 'object') throw new Error('Invalid request payload.');

  payload.requester_email = String(payload.requester_email || '').trim();
  payload.requester_name = String(payload.requester_name || '').trim();
  payload.requester_role = String(payload.requester_role || '').trim();
  payload.department_or_subject = String(payload.department_or_subject || '').trim();
  payload.request_type = String(payload.request_type || '').trim();
  payload.project_name = String(payload.project_name || '').trim();
  payload.project_purpose = String(payload.project_purpose || '').trim();
  payload.teacher_in_charge = String(payload.teacher_in_charge || '').trim();
  payload.teacher_in_charge_email = String(payload.teacher_in_charge_email || '').trim();
  payload.approved_by_email = String(payload.approved_by_email || '').trim();
  payload.machine = String(payload.machine || '').trim().toLowerCase();
  payload.material = String(payload.material || '').trim();
  payload.request_description = String(payload.request_description || '').trim();
  payload.needed_by_date = String(payload.needed_by_date || '').trim();
  payload.year_group = String(payload.year_group || '').trim();
  payload.class = String(payload.class || '').trim();
  payload.priority_reason = String(payload.priority_reason || '').trim();

  var required = {
    requester_email: 'Requester email',
    requester_name: 'Requester name',
    requester_role: 'Requester role',
    department_or_subject: 'Department / subject',
    request_type: 'Request type',
    project_name: 'Project name',
    project_purpose: 'Purpose / reason',
    teacher_in_charge: 'Teacher in charge',
    teacher_in_charge_email: 'Teacher in charge email',
    approved_by_email: 'Approval email',
    machine: 'Machine type',
    material: 'Material',
    request_description: 'Job description / fabrication notes'
  };
  Object.keys(required).forEach(function(key) {
    if (!payload[key]) throw new Error('Missing required field: ' + required[key]);
  });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.requester_email)) throw new Error('Requester email format is invalid.');
  assertAllowedEmailDomain_(payload.requester_email, 'Requester email');
  enforceRequesterEmailAccess_(payload.requester_email, 'Requester email');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.teacher_in_charge_email)) throw new Error('Teacher in charge email format is invalid.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.approved_by_email)) throw new Error('Approval email format is invalid.');
  assertStaffEmailDomain_(payload.teacher_in_charge_email, 'Teacher in charge email');
  assertStaffEmailDomain_(payload.approved_by_email, 'Approval email');
  if (!['laser', '3d'].includes(payload.machine)) throw new Error('Machine must be laser or 3d.');

  if (!payload.working_file || !payload.working_file.name) throw new Error('Working file is required.');
  assertAffinityExtensionCase_(payload.working_file.name);

  if (payload.request_type === 'competition' && !String(payload.competition_name || '').trim()) {
    throw new Error('Competition name is required for competition requests.');
  }

  var width = parseRequiredDimension_(payload.width, 'Width');
  var height = parseRequiredDimension_(payload.height, 'Height');
  var depth = payload.machine === '3d' ? parseRequiredDimension_(payload.depth, 'Depth') : parseOptionalDimension_(payload.depth, 'Depth');

  payload.width = width;
  payload.height = height;
  payload.depth = depth;
  payload.units = payload.units || 'cm';
}

function getOtherRequestStatuses(query) {
  var target = String(query || '').trim().toLowerCase();
  if (!target) return [];
  var canUseInternalId = isOperationsUser_(getCurrentUser_());
  var rows = attachActiveQueuePositions_(attachStudentFeedback_(attachSubmissionActivity_(getRowsAsObjects_(APP.sheets.otherRequests.name)
    .map(function(r) {
      r._source = 'other';
      return r;
    })
    .filter(function(r) {
      return String(r.requester_email || '').trim().toLowerCase() === target ||
             (canUseInternalId && String(r.request_id || '').trim().toLowerCase() === target) ||
             caseNumberMatches_(r, query);
    })
    .sort(function(a, b) { return new Date(b.created_at) - new Date(a.created_at); }), 'requester_email')));
  return secureStudentLookupRows_(rows, ['requester_email']);
}

function getAdminOtherRequests(filters) {
  var user = requireAdmin_();
  var rows = getRowsAsObjects_(APP.sheets.otherRequests.name);
  filters = filters || {};
  var yearGroup = String(filters.year_group || '').trim();
  var status = String(filters.status || '').trim();
  var reqType = String(filters.request_type || '').trim();
  var machine = String(filters.machine || '').trim();
  var classNo = String(filters.class_no || '').trim().toLowerCase();
  var teacherQuery = String(filters.teacher_query || '').trim().toLowerCase();
  var studentEmail = String(filters.student_email || '').trim().toLowerCase();
  var mineOnly = String(filters.mine_only || '').trim() === 'true';
  if (yearGroup) rows = rows.filter(function(r) { return String(r.year_group || '').trim() === yearGroup; });
  if (status) rows = rows.filter(function(r) { return r.status === status; });
  if (reqType) rows = rows.filter(function(r) { return r.request_type === reqType; });
  if (machine) rows = rows.filter(function(r) { return String(r.machine||'').trim().toLowerCase() === machine; });
  if (classNo) rows = rows.filter(function(r) { return String(r['class'] || '').trim().toLowerCase().indexOf(classNo) !== -1; });
  if (teacherQuery) rows = rows.filter(function(r) {
    return String(r.teacher_in_charge || '').trim().toLowerCase().indexOf(teacherQuery) !== -1 ||
           String(r.teacher_in_charge_email || '').trim().toLowerCase().indexOf(teacherQuery) !== -1 ||
           String(r.approved_by_email || '').trim().toLowerCase().indexOf(teacherQuery) !== -1;
  });
  if (studentEmail) rows = rows.filter(function(r) { return String(r.requester_email||'').trim().toLowerCase().indexOf(studentEmail) !== -1; });
  if (user.role === 'teacher' && user.email) {
    var teacherEmail = user.email.toLowerCase();
    rows = rows.filter(function(r) {
      return String(r.teacher_in_charge_email||'').trim().toLowerCase() === teacherEmail ||
             String(r.approved_by_email||'').trim().toLowerCase() === teacherEmail;
    });
  } else if (mineOnly && user.email) {
    var myEmail = user.email.toLowerCase();
    rows = rows.filter(function(r) {
      return String(r.teacher_in_charge_email||'').trim().toLowerCase() === myEmail ||
             String(r.approved_by_email||'').trim().toLowerCase() === myEmail;
    });
  }
  rows.sort(function(a, b) { return new Date(b.created_at) - new Date(a.created_at); });
  return rows;
}

function updateOtherRequestStatus(requestId, status, remarks) {
  var user = requireQueueOperator_('change special request status');
  var validStatuses = Object.values(APP.status);
  var nextStatus = String(status || '').trim();
  if (!requestId) throw new Error('requestId is required.');
  if (!validStatuses.includes(nextStatus)) throw new Error('Invalid status value.');

  /* Technician role: restrict to allowed statuses only */
  if (user.role === 'technician' && TECHNICIAN_ALLOWED_STATUSES.indexOf(nextStatus) === -1) {
    throw new Error('Technicians can only set status to: ' + TECHNICIAN_ALLOWED_STATUSES.join(', '));
  }

  var lock = acquireWorkflowLock_();
  try {

    var sheet = getSheet_(APP.sheets.otherRequests.name);
    var values = sheet.getDataRange().getDisplayValues();
    var headers = values[0];
    var idCol = headers.indexOf('request_id');
    if (idCol === -1) throw new Error('request_id column missing.');

    for (var r = 1; r < values.length; r++) {
      if (values[r][idCol] === requestId) {
        var rowIndex = r + 1;
        var currentRow = rowArrayToObject_(headers, values[r], rowIndex);
        assertTeacherCanAccessOtherRequest_(currentRow, user);
        var oldStatus = values[r][headers.indexOf('status')] || '';
        writeCellByHeader_(sheet, headers, rowIndex, 'status', nextStatus);
        writeCellByHeader_(sheet, headers, rowIndex, 'admin_remarks', String(remarks || '').trim());
        writeCellByHeader_(sheet, headers, rowIndex, 'updated_at', formatAppTimestamp_(new Date()));
        writeCellByHeader_(sheet, headers, rowIndex, 'updated_by', user.email || '');

        appendObject_(APP.sheets.auditLog.name, {
          timestamp: getAuditTimestamp_(),
          submission_id: requestId,
          actor_email: user.email || '',
          action_type: 'update_other_request_status',
          old_status: oldStatus,
          new_status: nextStatus,
          notes: String(remarks || '').trim()
        });

        /* ---- auto-send email when status actually changed ---- */
        var emailsSent = [];
        var emailError = '';
        if (oldStatus !== nextStatus) {
          try {
            emailsSent = sendOtherRequestNotification_(requestId, nextStatus, String(remarks || '').trim());
          } catch (emailErr) {
            emailError = String(emailErr.message || emailErr);
            Logger.log('Other Request email send failed: ' + emailError);
          }
        }
        return { ok: true, emailsSent: emailsSent, emailError: emailError, statusChanged: oldStatus !== nextStatus, oldStatus: oldStatus, newStatus: nextStatus };
      }
    }
    throw new Error('Request not found.');
  } finally {
    lock.releaseLock();
  }
}

function getStudentStatuses(query) {
  const target = String(query || '').trim().toLowerCase();
  if (!target) return [];
  const canUseInternalId = isOperationsUser_(getCurrentUser_());

  const rows = attachActiveQueuePositions_(attachStudentFeedback_(attachSubmissionActivity_(getRowsAsObjects_(APP.sheets.submissions.name)
    .map(function(r) {
      r._source = 'dt';
      return r;
    })
    .filter(r => {
      const emailMatch = String(r.student_email || '').trim().toLowerCase() === target;
      const idMatch = canUseInternalId && String(r.submission_id || '').trim().toLowerCase() === target;
      const caseMatch = caseNumberMatches_(r, query);
      return emailMatch || idMatch || caseMatch;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), 'student_email')));
  return secureStudentLookupRows_(rows, ['student_email']);
}

function getTeacherBetaVisibleClasses_(user) {
  user = user || getCurrentUser_();
  var classes = (APP.teacherBetaClasses || []).slice();
  if (user.role === 'admin') return classes;
  if (user.role !== 'teacher') throw new Error('Class is available to teacher accounts only.');
  var email = normalizeEmail_(user.email);
  var name = String(user.name || '').trim().toLowerCase();
  return classes.filter(function(cls) {
    return normalizeEmail_(cls.teacher_email) === email ||
      String(cls.teacher || '').trim().toLowerCase() === name;
  });
}

function normalizeTeacherBetaClassNo_(value) {
  return String(value || '').trim().toLowerCase().replace(/\s+/g, '');
}

function normalizeTeacherBetaTeacherKey_(value) {
  return String(value || '').trim().toLowerCase();
}

function getTeacherBetaTeacherKey_(cls) {
  return normalizeEmail_(cls.teacher_email) || normalizeTeacherBetaTeacherKey_(cls.teacher);
}

function getTeacherBetaTeachers_(classes) {
  var map = {};
  (classes || []).forEach(function(cls) {
    var key = getTeacherBetaTeacherKey_(cls);
    if (!key) return;
    if (!map[key]) {
      map[key] = {
        key: key,
        teacher: cls.teacher || cls.teacher_email || 'Teacher',
        teacher_email: normalizeEmail_(cls.teacher_email),
        classes: []
      };
    }
    if (cls.class_no && map[key].classes.indexOf(cls.class_no) === -1) map[key].classes.push(cls.class_no);
  });
  return Object.keys(map).map(function(key) {
    map[key].classes.sort(function(a, b) {
      return normalizeTeacherBetaClassNo_(a).localeCompare(normalizeTeacherBetaClassNo_(b), undefined, { numeric: true });
    });
    return map[key];
  }).sort(function(a, b) {
    return String(a.teacher || '').localeCompare(String(b.teacher || ''));
  });
}

function teacherBetaLatestSubmission_(rows) {
  rows = (rows || []).slice();
  rows.sort(function(a, b) {
    var createdDiff = getSortableTime_(b.created_at) - getSortableTime_(a.created_at);
    if (createdDiff) return createdDiff;
    return Number(b._row_number || 0) - Number(a._row_number || 0);
  });
  return rows[0] || null;
}

function teacherBetaSubmissionSummary_(row, count, rosterClassNo) {
  if (!row) return null;
  row._source = 'dt';
  var caseNo = formatCaseNumber_(row);
  var enteredClassNo = String(row.design_class_no || '').trim();
  var rosterClass = String(rosterClassNo || '').trim();
  var classMismatch = !!(enteredClassNo && rosterClass &&
    normalizeTeacherBetaClassNo_(enteredClassNo) !== normalizeTeacherBetaClassNo_(rosterClass));
  return {
    case_number: /^[AM]---$/i.test(caseNo) ? '' : caseNo,
    status: row.status || '',
    status_label: getStatusLabel_(row.status),
    design_class_no: enteredClassNo,
    roster_class_no: rosterClass,
    class_mismatch: classMismatch,
    machine: row.machine || '',
    material: row.material || '',
    prototype_fidelity: row.prototype_fidelity || '',
    prototype_label: formatPrototypeFidelityLabel_(row.prototype_fidelity),
    created_at: row.created_at || '',
    updated_at: row.updated_at || row.created_at || '',
    submitted_count: count || 0
  };
}

function teacherBetaStudentAction_(latest) {
  if (!latest) return 'Send reminder or check student email/class entry';
  var typoNote = latest.class_mismatch ? '; class entry typo noted' : '';
  var status = String(latest.status || '').trim();
  if (status === 'needs_fix') return 'Needs revision follow-up' + typoNote;
  if (status === 'submitted') return 'No action. Waiting for technician review' + typoNote;
  if (status === 'approved' || status === 'in_queue') return 'No action. Approved / waiting for production' + typoNote;
  if (status === 'in_production') return 'No action. In production' + typoNote;
  if (status === 'completed') return 'Complete' + typoNote;
  if (status === 'rejected') return 'Teacher follow-up needed' + typoNote;
  return 'Submitted' + typoNote;
}

function buildTeacherBetaClassStatus_(user, filters) {
  if (user.role !== 'teacher' && user.role !== 'admin') throw new Error('Class is available to teachers and admins only.');
  filters = filters || {};

  var visibleClasses = getTeacherBetaVisibleClasses_(user);
  var teacherOptions = getTeacherBetaTeachers_(visibleClasses);
  var classes = visibleClasses.slice();
  var requestedTeacher = normalizeEmail_(filters.teacher_email || filters.teacher_key || '') ||
    normalizeTeacherBetaTeacherKey_(filters.teacher || filters.teacher_key || '');
  if (requestedTeacher) {
    classes = classes.filter(function(cls) {
      return getTeacherBetaTeacherKey_(cls) === requestedTeacher ||
        normalizeEmail_(cls.teacher_email) === requestedTeacher ||
        normalizeTeacherBetaTeacherKey_(cls.teacher) === requestedTeacher;
    });
  }
  var requestedClass = normalizeTeacherBetaClassNo_(filters.class_no);
  if (requestedClass) {
    classes = classes.filter(function(cls) {
      return normalizeTeacherBetaClassNo_(cls.class_no) === requestedClass;
    });
  }

  var rows = getRowsAsObjects_(APP.sheets.submissions.name).map(function(row) {
    row._source = 'dt';
    return row;
  });
  var rowsByEmail = {};
  var rowsByClass = {};
  rows.forEach(function(row) {
    var rowEmail = normalizeEmail_(row.student_email);
    if (rowEmail) {
      if (!rowsByEmail[rowEmail]) rowsByEmail[rowEmail] = [];
      rowsByEmail[rowEmail].push(row);
    }
    var rowClass = normalizeTeacherBetaClassNo_(row.design_class_no);
    if (rowClass) {
      if (!rowsByClass[rowClass]) rowsByClass[rowClass] = [];
      rowsByClass[rowClass].push(row);
    }
  });
  var visibleRosterEmailMap = {};
  visibleClasses.forEach(function(cls) {
    (cls.roster || []).forEach(function(student) {
      var rosterEmail = normalizeEmail_(student.email);
      if (rosterEmail) visibleRosterEmailMap[rosterEmail] = true;
    });
  });
  var classReports = classes.map(function(cls) {
    var classKey = normalizeTeacherBetaClassNo_(cls.class_no);
    var roster = (cls.roster || []).slice();
    var rosterEmailMap = {};
    roster.forEach(function(student) {
      var email = normalizeEmail_(student.email);
      if (email) rosterEmailMap[email] = true;
    });

    var classRows = rowsByClass[classKey] || [];
    var students = roster.map(function(student) {
      var email = normalizeEmail_(student.email);
      var matches = rowsByEmail[email] || [];
      var latest = teacherBetaLatestSubmission_(matches);
      var latestSummary = teacherBetaSubmissionSummary_(latest, matches.length, cls.class_no);
      return {
        homeroom: student.homeroom || '',
        student_no: student.student_no || '',
        name: student.name || '',
        email: student.email || '',
        submitted: !!latest,
        latest: latestSummary,
        action: teacherBetaStudentAction_(latestSummary)
      };
    });

    var extraSubmissions = classRows
      .filter(function(row) {
        var rowEmail = normalizeEmail_(row.student_email);
        return !rosterEmailMap[rowEmail] && !visibleRosterEmailMap[rowEmail];
      })
      .map(function(row) {
        return {
          student_name: row.student_name || '',
          student_email: row.student_email || '',
          case_number: formatCaseNumber_(row),
          status: row.status || '',
          status_label: getStatusLabel_(row.status),
          created_at: row.created_at || '',
          updated_at: row.updated_at || row.created_at || '',
          material: row.material || ''
        };
      })
      .sort(function(a, b) { return getSortableTime_(b.created_at) - getSortableTime_(a.created_at); });

    var summary = {
      expected: roster.length,
      submitted: students.filter(function(s) { return s.submitted; }).length,
      missing: students.filter(function(s) { return !s.submitted; }).length,
      needs_fix: students.filter(function(s) { return s.latest && s.latest.status === 'needs_fix'; }).length,
      completed: students.filter(function(s) { return s.latest && s.latest.status === 'completed'; }).length,
      class_mismatches: students.filter(function(s) { return s.latest && s.latest.class_mismatch; }).length,
      extras: extraSubmissions.length
    };
    summary.percent_submitted = summary.expected ? Math.round((summary.submitted / summary.expected) * 100) : 0;

    return {
      teacher: cls.teacher || '',
      teacher_email: cls.teacher_email || '',
      year_group: cls.year_group || '',
      class_no: cls.class_no || '',
      label: cls.label || ('Class ' + (cls.class_no || '')),
      summary: summary,
      students: students,
      extra_submissions: extraSubmissions
    };
  });

  return {
    ok: true,
    generated_at: formatHongKongTimestamp_(new Date()),
    current_user_role: user.role,
    teachers: teacherOptions,
    classes: classReports
  };
}

function getTeacherBetaClassStatus(filters) {
  return buildTeacherBetaClassStatus_(getCurrentUser_(), filters || {});
}

function teacherBetaCsvCell_(value) {
  value = value == null ? '' : String(value);
  return '"' + value.replace(/"/g, '""') + '"';
}

function getTeacherBetaClassStatusCsv_(user, filters) {
  if (!user || (user.role !== 'teacher' && user.role !== 'admin')) {
    throw new Error('Class is available to teachers and admins only.');
  }
  var data = buildTeacherBetaClassStatus_(user, filters || {});
  var rows = [[
    'Record Type', 'Teacher', 'Design Class', 'Year Group', 'Student Name', 'Student Email',
    'Homeroom', 'Student No.', 'Submitted', 'Status', 'Case Number', 'Machine', 'Material',
    'Prototype Type', 'Submitted At', 'Updated At', 'Attempts', 'Class Issue', 'Teacher Action'
  ]];
  (data.classes || []).forEach(function(cls) {
    (cls.students || []).forEach(function(student) {
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
        latest.machine ? (latest.machine === '3d' ? '3D Print' : 'Laser Cut') : '',
        latest.material || '',
        latest.prototype_label || '',
        latest.created_at || '',
        latest.updated_at || '',
        latest.submitted_count || '',
        latest.class_mismatch ? ('Entered class ' + (latest.design_class_no || '?') + '; roster is class ' + (latest.roster_class_no || '?')) : '',
        student.action || ''
      ]);
    });
    (cls.extra_submissions || []).forEach(function(extra) {
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
        extra.created_at || '',
        extra.updated_at || '',
        '',
        'Email not found in this uploaded class roster',
        'Check spelling, school account, or class entry'
      ]);
    });
  });
  return '\ufeff' + rows.map(function(row) {
    return row.map(teacherBetaCsvCell_).join(',');
  }).join('\r\n');
}

function attachStudentFeedback_(rows) {
  rows = rows || [];
  if (!rows.length) return rows;

  var issueLabelMap = getIssueTemplateLabelMap_();
  rows.forEach(function(row) {
    var issueCodes = String(row.issue_code || '')
      .split(',')
      .map(function(code) { return String(code || '').trim(); })
      .filter(Boolean);

    row.admin_remarks = String(row.admin_remarks || '').trim();
    row.issue_labels = issueCodes.map(function(code) {
      return issueLabelMap[code] || code;
    });
    row.issue_label = row.issue_labels.join(', ');
  });

  return rows;
}

function getIssueTemplateLabelMap_() {
  return getIssueTemplates_().reduce(function(map, row) {
    var issueCode = String(row.issue_code || '').trim();
    if (!issueCode) return map;
    map[issueCode] = String(row.issue_label || issueCode).trim() || issueCode;
    return map;
  }, {});
}

function getIssueTemplates_() {
  return getRowsAsObjects_(APP.sheets.issueTemplates.name)
    .filter(r => String(r.active).toLowerCase() !== 'false')
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

function getIssueTemplatesForClient() {
  requireQueueOperator_('load issue templates');
  return getIssueTemplates_().map(function(row) {
    return {
      issue_code: row.issue_code || '',
      issue_label: row.issue_label || '',
      applies_to: row.applies_to || ''
    };
  });
}

function generateEmailDraft(submissionId, issueCodes, remarks) {
  requireQueueOperator_('draft student workflow emails');

  const submission = getSubmissionById_(submissionId);
  if (!submission) throw new Error('Submission not found.');

  const allTemplates = getIssueTemplates_();
  const codes = (issueCodes || '').split(',').map(s => s.trim()).filter(Boolean);
  const selectedTemplates = allTemplates.filter(t => codes.includes(t.issue_code));

  const machineName = submission.machine === '3d' ? '3D Print' : 'Laser Cut';
  const statusLabel = getStatusLabel_(submission.status);
  const caseNo = emailCaseNumber_(submission);
  const subjects = selectedTemplates.map(t => t.email_subject).filter(Boolean);
  const subject = subjects.length
    ? (caseNo ? caseNo + ' - ' : '') + subjects.join(' / ') + ' - ' + submission.student_name
    : 'Design Technology - ' + (caseNo ? caseNo + ' - ' : '') + 'Submission Update - ' + submission.student_name;

  const issueHtml = selectedTemplates.map(t =>
    '<li><strong>' + escapeHtml_(t.issue_label) + '</strong><br>' + sanitizeEmailTemplateHtml_(t.email_body_html || '') + '</li>'
  ).join('');

  const nextStep = selectedTemplates.length
    ? 'Please revise your file and submit the corrected version through the Dashboard. Your job will not move forward until the revised file is submitted.'
    : (submission.status === APP.status.APPROVED
      ? 'Your file has passed review and will move toward production scheduling.'
      : submission.status === APP.status.IN_QUEUE
        ? 'No action is needed right now. Your job is waiting for a production slot.'
        : submission.status === APP.status.IN_PRODUCTION
          ? 'No action is needed right now. Your job is currently in production.'
          : submission.status === APP.status.COMPLETED
            ? 'Please collect the finished work from the workshop when instructed.'
            : 'Please read the technician remarks and follow up with your teacher if you are unsure.');

  const fileLinks = [
    submission.working_file_url ? '<li><a href="' + escapeHtml_(submission.working_file_url) + '">Original working file</a></li>' : '',
    submission.preview_file_url ? '<li><a href="' + escapeHtml_(submission.preview_file_url) + '">Original preview image</a></li>' : ''
  ].filter(Boolean).join('');

  const body =
    '<p>Dear ' + escapeHtml_(submission.student_name) + ',</p>' +
    '<p>We reviewed your <strong>' + escapeHtml_(machineName) + '</strong> submission.</p>' +
    emailCaseReferenceHtml_(caseNo) +
    '<table style="border-collapse:collapse;width:100%;margin:12px 0;">' +
    emailCaseTableRowHtml_(caseNo) +
    '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Current Status</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(statusLabel) + '</td></tr>' +
    '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Year / Class</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(submission.year_group || '') + ' / Class ' + escapeHtml_(submission.design_class_no || '') + '</td></tr>' +
    '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Material</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(submission.material || '') + '</td></tr>' +
    '</table>' +
    (issueHtml ? '<p><strong>Issue(s) found:</strong></p><ul>' + issueHtml + '</ul>' : '<p><strong>Update:</strong> Please read the technician note below.</p>') +
    (remarks ? '<p><strong>Technician remarks:</strong><br>' + escapeHtml_(remarks).replace(/\n/g, '<br>') + '</p>' : '') +
    (fileLinks ? '<p><strong>Original uploaded file(s):</strong></p><ul>' + fileLinks + '</ul>' : '') +
    '<p><strong>Next step:</strong> ' + escapeHtml_(nextStep) + '</p>' +
    '<p>Before resubmitting, check:</p>' +
    '<ul>' +
    '<li>Upload the correct working file format</li>' +
    '<li>Ensure your design is within the allowed dimensions</li>' +
    '<li>Include a preview image if required</li>' +
    '</ul>' +
    '<p>If you have any questions, please speak with your teacher.</p>' +
    '<p>Best regards,<br>Design Technology Technician Team</p>';

  const bodyText =
    'Dear ' + (submission.student_name || 'Student') + ',\n\n' +
    'We reviewed your ' + machineName + ' submission.\n\n' +
    emailCaseReferenceText_(caseNo) +
    'Current Status: ' + statusLabel + '\n' +
    'Year / Class: ' + (submission.year_group || '') + ' / Class ' + (submission.design_class_no || '') + '\n' +
    'Material: ' + (submission.material || '') + '\n\n' +
    (selectedTemplates.length ? ('Issue(s):\n' + selectedTemplates.map(function(t) { return '- ' + (t.issue_label || t.issue_code || 'Issue selected'); }).join('\n') + '\n\n') : '') +
    (remarks ? 'Technician remarks:\n' + remarks + '\n\n' : '') +
    'Next step: ' + nextStep + '\n\n' +
    'Before resubmitting, check the working file format, dimensions, and preview image if required.\n\n' +
    'Best regards,\nDesign Technology Technician Team';

  return {
    to: submission.student_email || '',
    subject: subject,
    body_html: body,
    body_text: bodyText,
    missing_to: !submission.student_email,
    student_name: submission.student_name || '',
    case_number: caseNo,
    submission_id: submission.submission_id || ''
  };
}

function generateTeacherUpdateDraft(submissionId, statusOverride, issueCodeOverride, remarksOverride) {
  const actor = requireQueueOperator_('draft teacher workflow emails');
  const submission = getSubmissionById_(submissionId);
  if (!submission) throw new Error('Submission not found.');

  const status = String(statusOverride || submission.status || '').trim();
  const issueCode = String(issueCodeOverride || submission.issue_code || '').trim();
  const remarks = String(remarksOverride || submission.admin_remarks || '').trim();
  const teacherName = String(submission.design_teacher || '').trim();
  const teacherEmail = resolveTeacherEmail_(submission, teacherName);
  const statusLabel = getStatusLabel_(status);
  const machineName = submission.machine === '3d' ? '3D Print' : 'Laser Cut';
  const caseNo = emailCaseNumber_(submission);

  const actionLine = getTeacherActionLine_(status);
  const issueLine = issueCode
    ? '<p><strong>Issue Code:</strong> ' + escapeHtml_(issueCode) + '</p>'
    : '';

  const body =
    '<p>Dear ' + escapeHtml_(teacherName || 'Teacher') + ',</p>' +
    '<p>This is a fabrication workflow update for your student submission.</p>' +
    '<ul>' +
    (caseNo ? '<li><strong>Case Number:</strong> ' + escapeHtml_(caseNo) + '</li>' : '') +
    '<li><strong>Student:</strong> ' + escapeHtml_(submission.student_name || '') + '</li>' +
    '<li><strong>Class:</strong> ' + escapeHtml_(submission.design_class_no || '') + '</li>' +
    '<li><strong>Year:</strong> ' + escapeHtml_(submission.year_group || '') + '</li>' +
    '<li><strong>Machine:</strong> ' + escapeHtml_(machineName) + '</li>' +
    '<li><strong>Submission ID:</strong> ' + escapeHtml_(submission.submission_id || '') + '</li>' +
    '<li><strong>Current Status:</strong> ' + escapeHtml_(statusLabel) + '</li>' +
    '</ul>' +
    issueLine +
    (remarks ? '<p><strong>Technician/Admin Remarks:</strong> ' + escapeHtml_(remarks) + '</p>' : '') +
    '<p><strong>Suggested Teacher Follow-up:</strong> ' + escapeHtml_(actionLine) + '</p>' +
    '<p>Regards,<br>Design Technology Technician Team</p>';

  appendObject_(APP.sheets.auditLog.name, {
    timestamp: getAuditTimestamp_(),
    submission_id: submissionId,
    actor_email: actor.email || '',
    action_type: 'generate_teacher_update_draft',
    old_status: '',
    new_status: status,
    notes: [teacherEmail || 'no-teacher-email', issueCode, remarks].filter(Boolean).join(' | ')
  });

  const subject = 'Design Technology - ' + (caseNo ? caseNo + ' - ' : '') + 'Teacher Update - ' + (submission.student_name || 'Student') + ' - ' + statusLabel;
  const bodyText =
    'Dear ' + (teacherName || 'Teacher') + ',\n\n' +
    'This is a fabrication workflow update for your student submission.\n\n' +
    emailCaseReferenceText_(caseNo) +
    'Student: ' + (submission.student_name || '') + '\n' +
    'Class: ' + (submission.design_class_no || '') + '\n' +
    'Year: ' + (submission.year_group || '') + '\n' +
    'Machine: ' + machineName + '\n' +
    'Submission ID: ' + (submission.submission_id || '') + '\n' +
    'Current Status: ' + statusLabel + '\n\n' +
    (issueCode ? 'Issue Code: ' + issueCode + '\n\n' : '') +
    (remarks ? 'Technician/Admin Remarks:\n' + remarks + '\n\n' : '') +
    'Suggested Teacher Follow-up: ' + actionLine + '\n\n' +
    'Regards,\nDesign Technology Technician Team';

  return {
    to: teacherEmail || '',
    subject: subject,
    body_html: body,
    body_text: bodyText,
    missing_to: !teacherEmail,
    case_number: caseNo,
    teacher_name: teacherName
  };
}

function getSpreadsheetUrl() {
  requireSystemAdmin_();
  return getSpreadsheet_().getUrl();
}

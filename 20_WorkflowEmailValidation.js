function getAdminRows(filters) {
  const user = requireAdmin_();

  let rows = getRowsAsObjects_(APP.sheets.submissions.name);

  filters = filters || {};
  const year = String(filters.year_group || '').trim();
  const machine = String(filters.machine || '').trim();
  const status = String(filters.status || '').trim();
  const classNo = String(filters.class_no || '').trim().toLowerCase();
  const teacherQuery = String(filters.teacher_query || '').trim().toLowerCase();
  const studentEmail = String(filters.student_email || '').trim().toLowerCase();
  const mineOnly = String(filters.mine_only || '').toLowerCase() === 'true';

  if (year) rows = rows.filter(r => r.year_group === year);
  if (machine) rows = rows.filter(r => r.machine === machine);
  if (status) rows = rows.filter(r => r.status === status);
  if (classNo) rows = rows.filter(r => String(r.design_class_no || '').toLowerCase().includes(classNo));
  if (teacherQuery) rows = rows.filter(r => String(r.design_teacher || '').toLowerCase().includes(teacherQuery));
  if (studentEmail) rows = rows.filter(r => String(r.student_email || '').toLowerCase().includes(studentEmail));

  // Teacher view is always scoped server-side. Client filters cannot widen it.
  if (user.role === 'teacher') {
    rows = rows.filter(r => isTeacherRecordMatch_(r, user));
  } else if (mineOnly) {
    rows = rows.filter(r => isTeacherRecordMatch_(r, user));
  }

  rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return rows;
}

function updateSubmissionStatus(submissionId, status, issueCode, remarks) {
  const user = requireQueueOperator_('change submission status');
  const validStatuses = Object.values(APP.status);
  const nextStatus = String(status || '').trim();

  if (!submissionId) throw new Error('submissionId is required.');
  if (!validStatuses.includes(nextStatus)) throw new Error('Invalid status value.');
  if (user.role === 'technician' && TECHNICIAN_ALLOWED_STATUSES.indexOf(nextStatus) === -1) {
    throw new Error('Technician can only set approved, in_queue, in_production, or completed.');
  }

  var lock = acquireWorkflowLock_();
  try {

  const sheet = getSheet_(APP.sheets.submissions.name);
  const values = sheet.getDataRange().getDisplayValues();
  const headers = values[0];
  const idCol = headers.indexOf('submission_id');

  if (idCol === -1) throw new Error('submission_id column missing.');

  const statusCol = headers.indexOf('status');
  const issueCol = headers.indexOf('issue_code');
  const issueProvided = typeof issueCode !== 'undefined' && issueCode !== null;
  const nextIssueCode = issueProvided ? String(issueCode).trim() : null;
  const nextRemarks = typeof remarks === 'undefined' || remarks === null ? '' : String(remarks).trim();

  if (nextIssueCode) {
    const issueTemplates = getIssueTemplates_();
    const issueExists = issueTemplates.some(t => t.issue_code === nextIssueCode);
    if (!issueExists) throw new Error('Unknown issue code selected.');
  }

  for (let r = 1; r < values.length; r++) {
    if (values[r][idCol] === submissionId) {
      const rowIndex = r + 1;
      const currentRow = rowArrayToObject_(headers, values[r], rowIndex);
      assertTeacherCanAccessSubmission_(currentRow, user);
      const oldStatus = statusCol !== -1 ? values[r][statusCol] : '';
      const oldIssueCode = issueCol !== -1 ? values[r][issueCol] : '';
      const resolvedIssueCode = issueProvided ? nextIssueCode : oldIssueCode;

      writeCellByHeader_(sheet, headers, rowIndex, 'status', nextStatus);
      writeCellByHeader_(sheet, headers, rowIndex, 'issue_code', resolvedIssueCode || '');
      writeCellByHeader_(sheet, headers, rowIndex, 'admin_remarks', nextRemarks);
      writeCellByHeader_(sheet, headers, rowIndex, 'updated_at', formatAppTimestamp_(new Date()));
      writeCellByHeader_(sheet, headers, rowIndex, 'updated_by', user.email || '');

      appendObject_(APP.sheets.auditLog.name, {
        timestamp: getAuditTimestamp_(),
        submission_id: submissionId,
        actor_email: user.email || '',
        action_type: 'update_status',
        old_status: oldStatus,
        new_status: nextStatus,
        notes: [resolvedIssueCode, nextRemarks].filter(Boolean).join(' | ')
      });

      /* ---- auto-send email when status actually changed ---- */
      var emailsSent = [];
      var emailError = '';
      if (oldStatus !== nextStatus) {
        try {
          emailsSent = sendStatusNotification_(submissionId, nextStatus, resolvedIssueCode || '', nextRemarks);
        } catch (emailErr) {
          emailError = String(emailErr.message || emailErr);
          Logger.log('Email send failed: ' + emailError);
        }
      }

      return { ok: true, emailsSent: emailsSent, emailError: emailError, statusChanged: oldStatus !== nextStatus, oldStatus: oldStatus, newStatus: nextStatus };
    }
  }

  throw new Error('Submission not found.');
  } finally {
    lock.releaseLock();
  }
}

function uploadBase64File(payload) {
  requireRequestIdentity_('upload files');
  if (!payload || typeof payload !== 'object') throw new Error('Missing file payload.');
  const base64 = String(payload.base64 || '');
  const fileName = sanitizeUploadFileName_(payload.fileName);
  const mimeType = sanitizeUploadMimeType_(payload.mimeType || 'application/octet-stream');
  const yearGroup = sanitizeUploadYearGroup_(payload.yearGroup || 'General');
  const bucket = sanitizeUploadBucket_(payload.bucket || 'misc');

  if (!base64 || !fileName) throw new Error('Missing file payload.');
  if (base64.length > 36 * 1024 * 1024) {
    throw new Error('File exceeds upload size limit. Please reduce the file size and try again.');
  }

  let bytes;
  try {
    bytes = Utilities.base64Decode(base64);
  } catch (err) {
    throw new Error('Uploaded file data is invalid. Please try again.');
  }
  const MAX_FILE_SIZE = 25 * 1024 * 1024;
  if (bytes.length > MAX_FILE_SIZE) {
    throw new Error('File exceeds 25 MB limit. Please reduce the file size and try again.');
  }
  const blob = Utilities.newBlob(bytes, mimeType, fileName);
  const folder = getUploadFolder_(yearGroup, bucket);
  const file = folder.createFile(blob);

  return {
    id: file.getId(),
    name: file.getName(),
    url: file.getUrl()
  };
}

function getSubmissionById_(submissionId) {
  const target = String(submissionId || '').trim();
  if (!target) return null;
  const rows = getRowsAsObjects_(APP.sheets.submissions.name);
  return rows.find(r => String(r.submission_id || '').trim() === target) || null;
}

function getOtherRequestById_(requestId) {
  var target = String(requestId || '').trim();
  if (!target) return null;
  var rows = getRowsAsObjects_(APP.sheets.otherRequests.name);
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i].request_id || '').trim() === target) return rows[i];
  }
  return null;
}

function sendOtherRequestNotification_(requestId, newStatus, remarks) {
  var emailsSent = [];
  var req = getOtherRequestById_(requestId);
  if (!req) throw new Error('Other Request not found for email: ' + requestId);

  var requesterEmail = String(req.requester_email || '').trim();
  var statusLabel = getStatusLabel_(newStatus);
  var machineName = req.machine === '3d' ? '3D Print' : 'Laser Cut';
  var requesterName = escapeHtml_(req.requester_name || 'Requester');
  var projectName = escapeHtml_(req.project_name || 'your project');
  var caseNo = emailCaseNumber_(req);

  /* ---------- build requester email body ---------- */
  var subject = 'Design Fabrication - ' + (caseNo ? caseNo + ' - ' : '') + statusLabel + ' - ' + (req.project_name || 'Special Request');
  var body = '<p>Dear ' + requesterName + ',</p>' + emailCaseReferenceHtml_(caseNo);

  if (newStatus === APP.status.NEEDS_FIX) {
    body +=
      '<p>We reviewed your Special Request for <strong>' + projectName + '</strong> ' +
      '(' + escapeHtml_(machineName) + ') and found an issue that needs your attention.</p>' +
      '<div style="background:#fff3cd;border:1px solid #f59e0b;padding:10px 12px;border-radius:8px;margin:12px 0;font-size:13px;">' +
      '<strong>&#9888; Action required:</strong> Please make the requested changes and <strong>resubmit</strong> through the Dashboard. Your teacher / sponsor is copied for awareness, but the revised submission still needs to come from you.</div>' +
      (remarks ? '<p><strong>Remarks from the technician team:</strong></p><blockquote style="border-left:3px solid #d35400;padding:8px 12px;margin:8px 0;background:#fef9f5;">' + escapeHtml_(remarks) + '</blockquote>' : '') +
      '<p>Please read the remarks above carefully, make the required changes, and resubmit through the Design Fabrication Dashboard.</p>';
  } else if (newStatus === APP.status.APPROVED) {
    body +=
      '<p>Your Special Request for <strong>' + projectName + '</strong> has been <strong>approved</strong>.</p>' +
      '<p>It will be queued for production shortly. No action is needed from you at this time.</p>';
  } else if (newStatus === APP.status.IN_QUEUE) {
    body +=
      '<p>Your Special Request for <strong>' + projectName + '</strong> is now <strong>in the production queue</strong>.</p>' +
      '<p>You will be notified when production begins.</p>';
  } else if (newStatus === APP.status.IN_PRODUCTION) {
    body +=
      '<p>Your Special Request for <strong>' + projectName + '</strong> is currently <strong>in production</strong>.</p>' +
      '<p>You will be notified when it is completed.</p>';
  } else if (newStatus === APP.status.COMPLETED) {
    body +=
      '<p>Your Special Request for <strong>' + projectName + '</strong> has been <strong>completed</strong>!</p>' +
      '<p><strong>Please come to the Design Technology workshop to collect your finished work at your earliest convenience.</strong></p>' +
      '<p>If you are unable to collect it soon, please inform you teacher in charge.</p>';
  } else if (newStatus === APP.status.REJECTED) {
    body +=
      '<p>Your Special Request for <strong>' + projectName + '</strong> has been <strong>rejected</strong>.</p>' +
      (remarks ? '<p><strong>Reason:</strong> ' + escapeHtml_(remarks) + '</p>' : '') +
      '<p>Please speak with your teacher in charge for further guidance.</p>';
  } else {
    body +=
      '<p>Your Special Request for <strong>' + projectName + '</strong> has been updated to: <strong>' + escapeHtml_(statusLabel) + '</strong>.</p>';
  }
  body += '<p>Best regards,<br>Design Technology Technician Team</p>' + emailAutoFooterHtml_();

  /* ---------- resolve teacher + sender info ---------- */
  var teacherEmail = String(req.teacher_in_charge_email || '').trim();
  var senderEmail = Session.getActiveUser().getEmail() || '';

  /* ---------- NEEDS FIX: single threaded email (To: requester, CC: teacher + technician) ---------- */
  if (newStatus === APP.status.NEEDS_FIX && requesterEmail) {
    var ccList = [APP.technicianCcEmail];
    if (teacherEmail) ccList.push(teacherEmail);
    ccList = ccList.filter(function(e, i, a) { return e && a.indexOf(e) === i && e !== requesterEmail; });

    var combinedBody = body.replace(
      '<p>Best regards,<br>Design Technology Technician Team</p>',
      '<hr style="border:none;border-top:1px solid #ddd;margin:16px 0;">' +
      '<p style="color:#666;font-size:12px;"><strong>CC\'d on this email:</strong> ' + escapeHtml_(req.teacher_in_charge || 'Teacher in charge') +
      (APP.technicianCcEmail ? ', DT Technician' : '') + '<br>' +
      'All parties can <strong>Reply All</strong> to this email to follow up on this issue.</p>' +
      '<p>Best regards,<br>Design Technology Technician Team</p>'
    );

    var emailOpts = {
      to: requesterEmail,
      subject: subject,
      htmlBody: combinedBody
    };
    if (ccList.length) emailOpts.cc = ccList.join(',');
    if (senderEmail) emailOpts.replyTo = senderEmail;
    MailApp.sendEmail(emailOpts);
    emailsSent.push('requester (' + requesterEmail + ')');
    ccList.forEach(function(e) { emailsSent.push('cc (' + e + ')'); });

  } else {
    /* ---------- non-Needs-Fix: send to requester as usual ---------- */
    if (requesterEmail) {
      MailApp.sendEmail({ to: requesterEmail, subject: subject, htmlBody: body });
      emailsSent.push('requester (' + requesterEmail + ')');
    }
  }

  /* ---------- audit log ---------- */
  appendObject_(APP.sheets.auditLog.name, {
    timestamp: getAuditTimestamp_(),
    submission_id: requestId,
    actor_email: Session.getActiveUser().getEmail() || '',
    action_type: 'auto_email_sent',
    old_status: '',
    new_status: newStatus,
    notes: 'Notified: ' + emailsSent.join(', ')
  });
  return emailsSent;
}

function getStatusLabel_(status) {
  const map = {
    submitted: 'Submitted',
    needs_fix: 'Needs Fix',
    approved: 'Approved',
    in_queue: 'In Queue',
    in_production: 'In Production',
    completed: 'Completed',
    rejected: 'Rejected'
  };
  return map[String(status || '').trim()] || String(status || '').trim() || 'Unknown';
}

function emailCaseNumber_(record) {
  var caseNo = formatCaseNumber_(record);
  return caseNo && !/^[AM]---$/i.test(caseNo) ? caseNo : '';
}

function emailCaseReferenceHtml_(caseNo) {
  if (!caseNo) return '';
  return '<div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:10px 12px;margin:12px 0;">' +
    '<div style="font-size:12px;color:#1e40af;font-weight:700;text-transform:uppercase;letter-spacing:.3px;">Case number</div>' +
    '<div style="font-family:monospace;font-size:20px;font-weight:800;color:#1e3a8a;margin-top:2px;">' + escapeHtml_(caseNo) + '</div>' +
    '<div style="font-size:12px;color:#334155;margin-top:4px;">If you ask your teacher or the technician team about this job, please quote this case number.</div>' +
    '</div>';
}

function emailCaseTableRowHtml_(caseNo) {
  if (!caseNo) return '';
  return '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Case Number</strong></td><td style="padding:6px 12px;border:1px solid #ddd;font-family:monospace;font-weight:700;">' + escapeHtml_(caseNo) + '</td></tr>';
}

function emailCaseReferenceText_(caseNo) {
  return caseNo ? ('Case number: ' + caseNo + '\nPlease quote this case number if you ask your teacher or the technician team about this job.\n\n') : '';
}

function emailAutoFooterHtml_() {
  return '<hr style="border:none;border-top:1px solid #ddd;margin:16px 0;">' +
    '<p style="color:#64748b;font-size:12px;line-height:1.5;margin:0 0 8px;">' +
    '<strong>System auto email:</strong> This message was sent automatically by the Design Fabrication Dashboard. ' +
    'If you have questions, please ask your Design teacher or a DT technician. Please quote your case number when asking.' +
    '</p>';
}

/* =========================
   CONFIRMATION EMAILS
   ========================= */

/**
 * Sends a confirmation email to the student when a DT submission is first created.
 */
function sendSubmissionConfirmation_(record) {
  var email = String(record.student_email || '').trim();
  if (!email) return;
  var machineName = record.machine === '3d' ? '3D Print' : 'Laser Cut';
  var prototypeLabel = formatPrototypeFidelityLabel_(record.prototype_fidelity);
  var caseNo = emailCaseNumber_(record);
  var subject = 'Design Technology - ' + (caseNo ? caseNo + ' - ' : '') + 'Submission Received - ' + (record.student_name || 'Student');
  var body =
    '<p>Dear ' + escapeHtml_(record.student_name || 'Student') + ',</p>' +
    '<p>Your <strong>' + escapeHtml_(machineName) + '</strong> submission has been received and is now waiting for technician review.</p>' +
    emailCaseReferenceHtml_(caseNo) +
    '<table style="border-collapse:collapse;width:100%;margin:12px 0;">' +
    emailCaseTableRowHtml_(caseNo) +
    '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Machine</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(machineName) + '</td></tr>' +
    '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Prototype</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(prototypeLabel || '—') + '</td></tr>' +
    '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Material</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(record.material || '') + '</td></tr>' +
    '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Year / Class</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(record.year_group || '') + ' / Class ' + escapeHtml_(record.design_class_no || '') + '</td></tr>' +
    '</table>' +
    '<p><strong>What happens next:</strong></p>' +
    '<ol>' +
    '<li>A technician will review your file.</li>' +
    '<li>You will receive an email when the status changes.</li>' +
    '<li>Use the <strong>Lookup</strong> page for <strong>Status Lookup</strong> to check progress at any time, including the approx. active-workshop position and estimated pickup window.</li>' +
    '</ol>' +
    '<p>Save your <strong>case number</strong>. It is the quickest way for us to find your request when you ask for help.</p>' +
    '<p>Best regards,<br>Design Technology Technician Team</p>' +
    emailAutoFooterHtml_();
  MailApp.sendEmail({ to: email, subject: subject, htmlBody: body });
}

/**
 * Sends a confirmation email to the requester when an Other Request is first created.
 */
function sendOtherRequestConfirmation_(record) {
  var email = String(record.requester_email || '').trim();
  if (!email) return;
  var machineName = record.machine === '3d' ? '3D Print' : 'Laser Cut';
  var caseNo = emailCaseNumber_(record);
  var subject = 'Design Fabrication - ' + (caseNo ? caseNo + ' - ' : '') + 'Request Received - ' + (record.project_name || 'Special Request');
  var holdTitle = APP.uiText.otherRequestHoldTitle || 'Special Requests on hold';
  var holdText = APP.uiText.otherRequestHoldEmailText || 'Special Requests are currently on hold. You can still submit a request, but it may wait before scheduling or production.';
  var body =
    '<p>Dear ' + escapeHtml_(record.requester_name || 'Requester') + ',</p>' +
    '<p>Your Special Request has been received and is now waiting for review.</p>' +
    '<div style="border:1px solid #fecaca;background:#fef2f2;color:#7f1d1d;border-radius:10px;padding:12px 14px;margin:12px 0;line-height:1.5;">' +
    '<strong>' + escapeHtml_(holdTitle) + '</strong><br>' + escapeHtml_(holdText) +
    '</div>' +
    emailCaseReferenceHtml_(caseNo) +
    '<table style="border-collapse:collapse;width:100%;margin:12px 0;">' +
    emailCaseTableRowHtml_(caseNo) +
    '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Project</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(record.project_name || '') + '</td></tr>' +
    '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Type</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(record.request_type || '') + '</td></tr>' +
    '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Machine</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(machineName) + '</td></tr>' +
    '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Teacher In Charge</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(record.teacher_in_charge || '') + '</td></tr>' +
    '</table>' +
    '<p><strong>What happens next:</strong></p>' +
    '<ol>' +
    '<li>A technician will review your request and file.</li>' +
    '<li>You will receive an email when the status changes.</li>' +
    '<li>Use the <strong>Lookup</strong> page for <strong>Status Lookup</strong> to check progress at any time, including the approx. active-workshop position and estimated pickup window.</li>' +
    '</ol>' +
    '<p>Save your <strong>case number</strong>. It is the quickest way for us to find your request when you ask for help.</p>' +
    '<p>Best regards,<br>Design Technology Technician Team</p>' +
    emailAutoFooterHtml_();
  MailApp.sendEmail({ to: email, subject: subject, htmlBody: body });

  /* Also notify teacher in charge */
  var teacherEmail = String(record.teacher_in_charge_email || '').trim();
  if (teacherEmail && teacherEmail !== email) {
    var teacherSubject = 'Design Fabrication - ' + (caseNo ? caseNo + ' - ' : '') + 'New Request - ' + (record.project_name || 'Special Request') + ' (by ' + (record.requester_name || 'requester') + ')';
    var teacherBody =
      '<p>Dear ' + escapeHtml_(record.teacher_in_charge || 'Teacher') + ',</p>' +
      '<p>A new Special Request has been submitted where you are listed as teacher-in-charge:</p>' +
      '<table style="border-collapse:collapse;width:100%;margin:12px 0;">' +
      emailCaseTableRowHtml_(caseNo) +
      '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Requester</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(record.requester_name || '') + ' (' + escapeHtml_(record.requester_email || '') + ')</td></tr>' +
      '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Project</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(record.project_name || '') + '</td></tr>' +
      '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Type</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(record.request_type || '') + '</td></tr>' +
      '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Machine</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(machineName) + '</td></tr>' +
      '</table>' +
      '<p>You will be notified of any status changes.<br>Regards,<br>Design Technology Technician Team</p>' +
      emailAutoFooterHtml_();
    MailApp.sendEmail({ to: teacherEmail, subject: teacherSubject, htmlBody: teacherBody });
  }
}

function getTeacherActionLine_(status) {
  const key = String(status || '').trim();
  if (key === APP.status.NEEDS_FIX) return 'Please review feedback with the student and ask for resubmission.';
  if (key === APP.status.APPROVED) return 'Student work is approved and will be queued for production.';
  if (key === APP.status.IN_QUEUE) return 'No action needed now; job is waiting in production queue.';
  if (key === APP.status.IN_PRODUCTION) return 'No action needed now; job is actively being fabricated.';
  if (key === APP.status.COMPLETED) return 'Please inform the student to collect finished work.';
  if (key === APP.status.REJECTED) return 'Please discuss rejection reason with student before next attempt.';
  return 'Please review this status update with your student as needed.';
}

function resolveTeacherEmail_(submission, teacherName) {
  const rawTeacher = String(teacherName || submission.design_teacher || '').trim();
  const fromSubmission = String(submission.design_teacher || '').trim();

  // Allow direct email input in the teacher field.
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fromSubmission)) return fromSubmission;

  // Primary: look up from built-in teacher email map (exact match).
  if (APP.teacherEmails[rawTeacher]) return APP.teacherEmails[rawTeacher];
  if (APP.teacherEmails[fromSubmission]) return APP.teacherEmails[fromSubmission];

  // Secondary: case-insensitive match against the map.
  var lc = rawTeacher.toLowerCase();
  var mapKeys = Object.keys(APP.teacherEmails);
  for (var i = 0; i < mapKeys.length; i++) {
    if (mapKeys[i].toLowerCase() === lc) return APP.teacherEmails[mapKeys[i]];
  }

  // Tertiary: fall back to Users sheet.
  var users = getRowsAsObjects_(APP.sheets.users.name).filter(function(u) {
    return String(u.active || '').toLowerCase() !== 'false';
  });
  var exactByName = users.find(function(u) { return String(u.name || '').trim().toLowerCase() === lc; });
  if (exactByName && exactByName.email) return String(exactByName.email).trim();

  var containsByName = users.find(function(u) { return String(u.name || '').trim().toLowerCase().includes(lc); });
  if (containsByName && containsByName.email) return String(containsByName.email).trim();

  return '';
}

function isTeacherRecordMatch_(row, user) {
  const teacherText = String(row.design_teacher || '').trim().toLowerCase();
  const userEmail = String(user.email || '').trim().toLowerCase();
  const userName = String(user.name || '').trim().toLowerCase();
  const userLocal = userEmail ? userEmail.split('@')[0] : '';
  return [
    userEmail,
    userName,
    userLocal
  ].filter(Boolean).some(token => teacherText.includes(token) || teacherText === token);
}

/* =========================
   AUTO EMAIL NOTIFICATION
   ========================= */

/**
 * Sends automatic email notifications when admin/technician changes
 * a submission's status. Teachers are only included on Needs Fix emails
 * via CC; all other status updates go to the student only.
 * Returns an array of recipients notified.
 * Throws on error so the caller can surface it to the user.
 */
function sendStatusNotification_(submissionId, newStatus, issueCode, remarks) {
  var emailsSent = [];
  var submission = getSubmissionById_(submissionId);
  if (!submission) throw new Error('Submission not found for email: ' + submissionId);

  var studentEmail = String(submission.student_email || '').trim();
  var statusLabel = getStatusLabel_(newStatus);
  var machineName = submission.machine === '3d' ? '3D Print' : 'Laser Cut';
  var studentName = escapeHtml_(submission.student_name || 'Student');
  var yearGroup = escapeHtml_(submission.year_group || '');
  var classNo = escapeHtml_(submission.design_class_no || '');
  var caseNo = emailCaseNumber_(submission);

  /* ---------- build student email body ---------- */
  var studentSubject = 'Design Technology - ' + (caseNo ? caseNo + ' - ' : '') + 'Status Update - ' + statusLabel + ' - ' + (submission.student_name || 'Student');
  var studentBody = '<p>Dear ' + studentName + ',</p>' + emailCaseReferenceHtml_(caseNo);

  if (newStatus === APP.status.NEEDS_FIX) {
    var allTemplates = getIssueTemplates_();
    var codes = String(issueCode || '').split(',').map(function(s) { return s.trim(); }).filter(Boolean);
    var selTpls = allTemplates.filter(function(t) { return codes.indexOf(t.issue_code) !== -1; });
    var issueHtml = selTpls.map(function(t) {
      return '<li><strong>' + escapeHtml_(t.issue_label) + '</strong><br>' + sanitizeEmailTemplateHtml_(t.email_body_html || '') + '</li>';
    }).join('');
    studentBody +=
      '<p>We reviewed your ' + escapeHtml_(machineName) + ' submission ' +
      '(<strong>' + yearGroup + '</strong>, Class ' + classNo +
      ') and found the following issue(s). Please read the suggestions below carefully and follow the steps to fix each issue:</p>' +
      (issueHtml ? '<ul style="padding-left:18px;">' + issueHtml + '</ul>' : '') +
      '<div style="background:#fff3cd;border:1px solid #f59e0b;padding:10px 12px;border-radius:8px;margin:12px 0;font-size:13px;">' +
      '<strong>&#9888; Action required:</strong> You need to correct the file and <strong>resubmit it yourself</strong> through the Dashboard. Your teacher is copied for support, but the job will not move forward until the revised file is submitted.</div>' +
      (remarks ? '<p><strong>Additional remarks from technician:</strong> ' + escapeHtml_(remarks) + '</p>' : '') +
      '<p>Once you have made the corrections, please resubmit your file through the Design Technology Dashboard.</p>' +
      '<hr style="border:none;border-top:1px solid #ddd;margin:16px 0;">' +
      '<p><strong>Need more help?</strong></p>' +
      '<ul style="padding-left:18px;">' +
      '<li>Open the <strong>Design Technology Dashboard</strong> and go to the <strong>Help &amp; FAQ</strong> page for step-by-step guides and answers to common questions.</li>' +
      '<li>If you are still unsure, ask your <strong>Design Technology teacher</strong> during class for guidance.</li>' +
      '</ul>';
  } else if (newStatus === APP.status.APPROVED) {
    studentBody +=
      '<p>Your ' + escapeHtml_(machineName) + ' submission has been <strong>approved</strong>.</p>' +
      '<p>It will be queued for production shortly. No action is needed from you at this time.</p>';
  } else if (newStatus === APP.status.IN_QUEUE) {
    studentBody +=
      '<p>Your ' + escapeHtml_(machineName) + ' submission is now <strong>in the production queue</strong>.</p>' +
      '<p>You will be notified when production begins.</p>';
  } else if (newStatus === APP.status.IN_PRODUCTION) {
    studentBody +=
      '<p>Your ' + escapeHtml_(machineName) + ' submission is currently <strong>in production</strong>.</p>' +
      '<p>You will be notified when it is completed.</p>';
  } else if (newStatus === APP.status.COMPLETED) {
    studentBody +=
      '<p>Your ' + escapeHtml_(machineName) + ' submission has been <strong>completed</strong>!</p>' +
      '<p><strong>Please come to the Design Technology workshop to pick up your finished work at your earliest convenience.</strong></p>' +
      '<p>If you are unable to collect it soon, please let your teacher know.</p>';
  } else if (newStatus === APP.status.REJECTED) {
    studentBody +=
      '<p>Your ' + escapeHtml_(machineName) + ' submission has been <strong>rejected</strong>.</p>' +
      (remarks ? '<p><strong>Reason:</strong> ' + escapeHtml_(remarks) + '</p>' : '') +
      '<p>Please speak with your teacher for further guidance.</p>';
  } else {
    studentBody +=
      '<p>Your ' + escapeHtml_(machineName) + ' submission status has been updated to: <strong>' + escapeHtml_(statusLabel) + '</strong>.</p>';
  }
  studentBody += '<p>Best regards,<br>Design Technology Technician Team</p>' + emailAutoFooterHtml_();

  /* ---------- resolve teacher info ---------- */
  var teacherName = String(submission.design_teacher || '').trim();
  var teacherEmail = resolveTeacherEmail_(submission, teacherName);
  var senderEmail = Session.getActiveUser().getEmail() || '';

  /* ---------- NEEDS FIX: single threaded email (To: student, CC: teacher + technician) ---------- */
  if (newStatus === APP.status.NEEDS_FIX && studentEmail) {
    var ccList = [APP.technicianCcEmail];
    if (teacherEmail) ccList.push(teacherEmail);
    /* Deduplicate and remove sender (already gets a copy in Sent) */
    ccList = ccList.filter(function(e, i, a) { return e && a.indexOf(e) === i && e !== studentEmail; });

    /* Enrich the student email body with teacher-facing context so the thread has full picture */
    var combinedBody = studentBody.replace(
      '<p>Best regards,<br>Design Technology Technician Team</p>',
      '<hr style="border:none;border-top:1px solid #ddd;margin:16px 0;">' +
      '<p style="color:#666;font-size:12px;"><strong>CC\'d on this email:</strong> ' + escapeHtml_(teacherName || 'Teacher') +
      (APP.technicianCcEmail ? ', DT Technician' : '') + '<br>' +
      'All parties can <strong>Reply All</strong> to this email to follow up on this issue.</p>' +
      '<p>Best regards,<br>Design Technology Technician Team</p>'
    );

    var emailOpts = {
      to: studentEmail,
      subject: studentSubject,
      htmlBody: combinedBody
    };
    if (ccList.length) emailOpts.cc = ccList.join(',');
    if (senderEmail) emailOpts.replyTo = senderEmail;
    MailApp.sendEmail(emailOpts);
    emailsSent.push('student (' + studentEmail + ')');
    ccList.forEach(function(e) { emailsSent.push('cc (' + e + ')'); });

  } else {
    /* ---------- non-Needs-Fix: send to student as usual ---------- */
    if (studentEmail) {
      MailApp.sendEmail({ to: studentEmail, subject: studentSubject, htmlBody: studentBody });
      emailsSent.push('student (' + studentEmail + ')');
    }
  }

  /* ---------- audit log ---------- */
  appendObject_(APP.sheets.auditLog.name, {
    timestamp: getAuditTimestamp_(),
    submission_id: submissionId,
    actor_email: Session.getActiveUser().getEmail() || '',
    action_type: 'auto_email_sent',
    old_status: '',
    new_status: newStatus,
    notes: 'Notified: ' + emailsSent.join(', ')
  });
  return emailsSent;
}

/* =========================
   VALIDATION
   ========================= */

function normalizeRosterYearGroup_(value) {
  var raw = String(value || '').trim().toUpperCase().replace(/\s+/g, '');
  if (!raw) return '';
  var match = raw.match(/^Y?0?(\d{1,2})$/);
  return match ? ('Y' + Number(match[1])) : raw;
}

function inferYearGroupFromClassNo_(classNo) {
  var match = String(classNo || '').trim().match(/^0?(\d{1,2})(?:\D|$)/);
  return match ? ('Y' + Number(match[1])) : '';
}

function getRosterPlacementForStudentEmail_(email) {
  var target = normalizeEmail_(email);
  if (!target) return null;
  var classes = APP.teacherBetaClasses || [];
  for (var i = 0; i < classes.length; i++) {
    var cls = classes[i] || {};
    var roster = cls.roster || [];
    for (var j = 0; j < roster.length; j++) {
      var student = roster[j] || {};
      if (normalizeEmail_(student.email) === target) {
        return {
          student_name: student.name || '',
          email: target,
          year_group: normalizeRosterYearGroup_(cls.year_group),
          class_no: String(cls.class_no || '').trim(),
          teacher: cls.teacher || '',
          label: cls.label || ('Class ' + (cls.class_no || ''))
        };
      }
    }
  }
  return null;
}

function assertSubmissionClassPlacement_(payload) {
  var submittedYear = normalizeRosterYearGroup_(payload.year_group);
  var submittedClass = String(payload.design_class_no || '').trim();
  var submittedClassKey = normalizeClassNo_(submittedClass);
  var classYear = inferYearGroupFromClassNo_(submittedClass);
  if (submittedYear && classYear && submittedYear !== classYear) {
    throw new Error('The selected Year Group does not match the Design Class No. Please use your real class and year group.');
  }

  var rosterPlacement = getRosterPlacementForStudentEmail_(payload.student_email);
  if (!rosterPlacement) return;

  var rosterClassKey = normalizeClassNo_(rosterPlacement.class_no);
  if ((rosterPlacement.year_group && submittedYear !== rosterPlacement.year_group) ||
      (rosterClassKey && submittedClassKey !== rosterClassKey)) {
    throw new Error(
      'This student email is registered to ' + rosterPlacement.year_group + ' / ' + rosterPlacement.label +
      '. Please submit using your own year group and class. Deadline rules are checked against your registered class.'
    );
  }
}

function validateSubmission_(payload) {
  if (!payload || typeof payload !== 'object') {
    throw new Error('Invalid submission payload.');
  }

  payload.student_email = String(payload.student_email || '').trim();
  payload.student_name = String(payload.student_name || '').trim();
  payload.design_class_no = String(payload.design_class_no || '').trim();
  payload.design_teacher = String(payload.design_teacher || '').trim();
  payload.year_group = String(payload.year_group || '').trim();
  payload.prototype_fidelity = String(payload.prototype_fidelity || '').trim().toLowerCase();
  payload.machine = String(payload.machine || '').trim().toLowerCase();
  payload.material = String(payload.material || '').trim();

  const required = [
    'student_email',
    'student_name',
    'design_class_no',
    'design_teacher',
    'year_group',
    'prototype_fidelity',
    'machine',
    'material'
  ];
  required.forEach(key => {
    if (!String(payload[key] || '').trim()) {
      throw new Error(`Missing required field: ${key}`);
    }
  });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.student_email)) {
    throw new Error('Submitter email format is invalid.');
  }
  assertAllowedEmailDomain_(payload.student_email, 'Submitter email');
  enforceRequesterEmailAccess_(payload.student_email, 'Submitter email');

  if (!['laser', '3d'].includes(payload.machine)) {
    throw new Error('Machine must be laser or 3d.');
  }

  if (!['low', 'hi', 'final', 'final-product', 'final_product', 'na', 'lo-fi', 'hi-fi'].includes(payload.prototype_fidelity)) {
    throw new Error('Prototype type must be Low, Hi, Final Product, or N/A.');
  }

  if (payload.prototype_fidelity === 'lo-fi') payload.prototype_fidelity = 'low';
  if (payload.prototype_fidelity === 'hi-fi') payload.prototype_fidelity = 'hi';
  if (payload.prototype_fidelity === 'final-product' || payload.prototype_fidelity === 'final_product') payload.prototype_fidelity = 'final';

  assertSubmissionClassPlacement_(payload);

  var submissionControl = getSubmissionControlDecision_(payload.year_group, payload.design_class_no);
  if (submissionControl.blocked) {
    throw new Error(submissionControl.message || 'Submissions are currently closed for this class or year group.');
  }

  if (!payload.working_file || !payload.working_file.name) {
    throw new Error('Working file is required.');
  }

  const rule = getMatchingRule_(payload.year_group, payload.machine);
  if (!rule) {
    throw new Error('No matching rules found for this year / machine.');
  }

  const allowedExt = String(rule.accepted_extensions || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);

  const workingExt = getFileExtension_(payload.working_file.name);

  if (!workingExt) {
    throw new Error('Working file must include a valid extension.');
  }

  assertAffinityExtensionCase_(payload.working_file.name);

  if (allowedExt.length && !allowedExt.includes(workingExt)) {
    throw new Error(`Wrong working file format. Allowed: ${allowedExt.join(', ')}`);
  }

  const previewRequired = String(rule.preview_required).toLowerCase() === 'true';
  if (previewRequired && (!payload.preview_file || !payload.preview_file.name)) {
    throw new Error('Preview image is required.');
  }

  if (payload.preview_file && payload.preview_file.name) {
    const previewExt = getFileExtension_(payload.preview_file.name);
    if (!previewExt || PREVIEW_IMAGE_EXTENSIONS.indexOf(previewExt) === -1) {
      throw new Error(`Preview image format is invalid. Allowed: ${PREVIEW_IMAGE_EXTENSIONS.join(', ')}`);
    }
  }

  const width = parseRequiredDimension_(payload.width, 'Width');
  const height = parseRequiredDimension_(payload.height, 'Height');
  const depth = parseOptionalDimension_(payload.depth, 'Depth');

  if (Number(rule.max_depth || 0) > 0 && depth <= 0) {
    throw new Error('Depth is required for this machine type.');
  }

  if (Number(rule.max_width || 0) && width > Number(rule.max_width)) {
    throw new Error(`Width exceeds limit (${rule.max_width} ${rule.units}).`);
  }
  if (Number(rule.max_height || 0) && height > Number(rule.max_height)) {
    throw new Error(`Height exceeds limit (${rule.max_height} ${rule.units}).`);
  }
  if (Number(rule.max_depth || 0) && depth > Number(rule.max_depth)) {
    throw new Error(`Depth exceeds limit (${rule.max_depth} ${rule.units}).`);
  }

  payload.width = width;
  payload.height = height;
  payload.depth = depth;
  payload.units = rule.units || '';
}

function parseRequiredDimension_(value, label) {
  const num = Number(value);
  if (!isFinite(num) || num <= 0) {
    throw new Error(`${label} is required and must be greater than 0.`);
  }
  return num;
}

function parseOptionalDimension_(value, label) {
  const raw = String(value || '').trim();
  if (!raw) return 0;
  const num = Number(raw);
  if (!isFinite(num) || num < 0) {
    throw new Error(`${label} must be 0 or greater.`);
  }
  return num;
}

function getAuditTimestamp_() {
  return formatAppTimestamp_(new Date());
}

function getAppTimeZone_() {
  return APP.timeZone || 'UTC';
}

function formatAppTimestamp_(value) {
  const date = toDateObject_(value);
  if (!date) return '';
  const timeZone = getAppTimeZone_();
  const base = Utilities.formatDate(date, timeZone, "yyyy-MM-dd'T'HH:mm:ss");
  const offset = Utilities.formatDate(date, timeZone, 'Z');
  if (!offset || offset === 'Z') return base + 'Z';
  return base + offset.slice(0, 3) + ':' + offset.slice(3);
}

function formatHongKongTimestamp_(value) {
  return formatAppTimestamp_(value);
}

function formatPrototypeFidelityLabel_(value) {
  var normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'low') return 'Lo fi Prototype';
  if (normalized === 'hi') return 'Hi fi Prototype';
  if (normalized === 'final' || normalized === 'final-product' || normalized === 'final_product') return 'Final Product';
  if (normalized === 'na') return 'N/A';
  if (normalized === 'lo-fi') return 'Lo fi Prototype';
  if (normalized === 'hi-fi') return 'Hi fi Prototype';
  return '';
}

function parseTimeZoneOffsetMinutes_(offsetText) {
  var raw = String(offsetText || '').trim();
  if (!raw || raw === 'Z') return 0;
  var sign = raw.charAt(0) === '-' ? -1 : 1;
  var hours = Number(raw.slice(1, 3)) || 0;
  var minutes = Number(raw.slice(3, 5)) || 0;
  return sign * (hours * 60 + minutes);
}

function parseAppDateTimeInput_(value) {
  var raw = String(value || '').trim();
  if (!raw) return null;

  var match = raw.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/);
  if (!match) return toDateObject_(raw);

  var year = Number(match[1]);
  var month = Number(match[2]);
  var day = Number(match[3]);
  var hour = Number(match[4]);
  var minute = Number(match[5]);
  var utcMillis = Date.UTC(year, month - 1, day, hour, minute, 0);
  var guess = new Date(utcMillis);
  var offsetMinutes = parseTimeZoneOffsetMinutes_(Utilities.formatDate(guess, getAppTimeZone_(), 'Z'));
  var adjusted = new Date(utcMillis - offsetMinutes * 60000);
  var adjustedOffsetMinutes = parseTimeZoneOffsetMinutes_(Utilities.formatDate(adjusted, getAppTimeZone_(), 'Z'));
  if (adjustedOffsetMinutes !== offsetMinutes) {
    adjusted = new Date(utcMillis - adjustedOffsetMinutes * 60000);
  }
  return adjusted;
}

function toDateObject_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return value;
  }
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

function getSortableTime_(value) {
  const date = toDateObject_(value);
  return date ? date.getTime() : 0;
}

/**
 * Count today's submissions using the configured script timezone for a given email.
 * Returns { total, dt, special }.
 */
function getTodaySubmissionCountByEmail_(email) {
  var result = { total: 0, dt: 0, special: 0 };
  if (!email) return result;
  var e = String(email).trim().toLowerCase();
  var today = Utilities.formatDate(new Date(), getAppTimeZone_(), 'yyyy-MM-dd');
  var ss = getSpreadsheet_();
  // DT submissions
  var subSheet = ss.getSheetByName(APP.sheets.submissions.name);
  if (subSheet && subSheet.getLastRow() > 1) {
    var subData = subSheet.getRange(2, 1, subSheet.getLastRow() - 1, subSheet.getLastColumn()).getValues();
    for (var i = 0; i < subData.length; i++) {
      var row = subData[i];
      if (String(row[2] || '').trim().toLowerCase() === e) {
        var ts = formatAppTimestamp_(row[1]);
        if (ts && ts.substring(0, 10) === today) result.dt++;
      }
    }
  }
  // Special requests
  var otherSheet = ss.getSheetByName(APP.sheets.otherRequests.name);
  if (otherSheet && otherSheet.getLastRow() > 1) {
    var otherData = otherSheet.getRange(2, 1, otherSheet.getLastRow() - 1, otherSheet.getLastColumn()).getValues();
    for (var j = 0; j < otherData.length; j++) {
      var orow = otherData[j];
      if (String(orow[2] || '').trim().toLowerCase() === e) {
        var ots = formatAppTimestamp_(orow[1]);
        if (ots && ots.substring(0, 10) === today) result.special++;
      }
    }
  }
  result.total = result.dt + result.special;
  return result;
}

function createEmptySubmissionActivity_() {
  return {
    counts: { total: 0, dt: 0, special: 0 },
    last24_count: 0,
    recent: []
  };
}

function getSubmissionActivityMap_(emails) {
  var targets = {};
  (emails || []).forEach(function(email) {
    var normalized = String(email || '').trim().toLowerCase();
    if (normalized) targets[normalized] = true;
  });
  var targetList = Object.keys(targets);
  if (!targetList.length) return {};

  var activityMap = {};
  targetList.forEach(function(email) {
    activityMap[email] = createEmptySubmissionActivity_();
  });

  var today = Utilities.formatDate(new Date(), getAppTimeZone_(), 'yyyy-MM-dd');
  var last24Cutoff = Date.now() - (24 * 60 * 60 * 1000);
  var ss = getSpreadsheet_();

  function pushRecent_(email, item) {
    activityMap[email].recent.push(item);
  }

  function finalize_(email) {
    var activity = activityMap[email];
    activity.counts.total = activity.counts.dt + activity.counts.special;
    activity.recent = activity.recent
      .sort(function(a, b) { return b.sort_time - a.sort_time; })
      .slice(0, 3)
      .map(function(item) {
        return {
          source: item.source,
          id: item.id,
          created_at: item.created_at,
          label: item.label
        };
      });
  }

  var subSheet = ss.getSheetByName(APP.sheets.submissions.name);
  if (subSheet && subSheet.getLastRow() > 1) {
    var subData = subSheet.getRange(2, 1, subSheet.getLastRow() - 1, subSheet.getLastColumn()).getValues();
    for (var i = 0; i < subData.length; i++) {
      var row = subData[i];
      var subEmail = String(row[2] || '').trim().toLowerCase();
      if (!activityMap[subEmail]) continue;
      var subDate = toDateObject_(row[1]);
      if (!subDate) continue;
      var subTs = formatAppTimestamp_(subDate);
      if (subTs && subTs.substring(0, 10) === today) activityMap[subEmail].counts.dt++;
      if (subDate.getTime() >= last24Cutoff) activityMap[subEmail].last24_count++;
      pushRecent_(subEmail, {
        source: 'dt',
        id: String(row[0] || ''),
        created_at: subTs,
        label: String(row[7] || '').trim().toLowerCase() === '3d' ? 'DT Student Project - 3D Print' : 'DT Student Project - Laser Cut',
        sort_time: subDate.getTime()
      });
    }
  }

  var otherSheet = ss.getSheetByName(APP.sheets.otherRequests.name);
  if (otherSheet && otherSheet.getLastRow() > 1) {
    var otherData = otherSheet.getRange(2, 1, otherSheet.getLastRow() - 1, otherSheet.getLastColumn()).getValues();
    for (var j = 0; j < otherData.length; j++) {
      var orow = otherData[j];
      var otherEmail = String(orow[2] || '').trim().toLowerCase();
      if (!activityMap[otherEmail]) continue;
      var otherDate = toDateObject_(orow[1]);
      if (!otherDate) continue;
      var otherTs = formatAppTimestamp_(otherDate);
      if (otherTs && otherTs.substring(0, 10) === today) activityMap[otherEmail].counts.special++;
      if (otherDate.getTime() >= last24Cutoff) activityMap[otherEmail].last24_count++;
      pushRecent_(otherEmail, {
        source: 'other',
        id: String(orow[0] || ''),
        created_at: otherTs,
        label: String(orow[7] || orow[6] || 'Special Request'),
        sort_time: otherDate.getTime()
      });
    }
  }

  targetList.forEach(finalize_);
  return activityMap;
}

function getSubmissionActivityByEmail_(email) {
  var normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return createEmptySubmissionActivity_();
  var map = getSubmissionActivityMap_([normalized]);
  return map[normalized] || createEmptySubmissionActivity_();
}

function attachSubmissionActivity_(rows, emailField) {
  rows = rows || [];
  var activityMap = getSubmissionActivityMap_(rows.map(function(row) { return row[emailField]; }));
  rows.forEach(function(row) {
    var normalized = String(row[emailField] || '').trim().toLowerCase();
    row._activity = activityMap[normalized] || createEmptySubmissionActivity_();
  });
  return rows;
}

/**
 * Public endpoint: returns daily submission activity only for the signed-in owner.
 */
function getSubmissionActivity(email) {
  requireRequestIdentity_('check submission activity');
  var normalized = normalizeEmail_(email);
  var user = getCurrentUser_();
  if (!normalized || (!isOperationsUser_(user) && normalizeEmail_(user.email) !== normalized)) {
    return {
      counts: { total: 0, dt: 0, special: 0 },
      last24_count: 0,
      recent: [],
      warning: ''
    };
  }
  var activity = getSubmissionActivityByEmail_(normalized);
  var counts = activity.counts;
  var warn = '';
  if (counts.total >= 2) {
    warn = 'You have already submitted ' + counts.total + ' request' + (counts.total > 1 ? 's' : '') + ' today. Please avoid duplicate submissions.';
  }
  return {
    counts: counts,
    last24_count: activity.last24_count,
    recent: activity.recent,
    warning: warn
  };
}

function getRawFileExtension_(fileName) {
  const value = String(fileName || '').trim();
  if (!value.includes('.')) return '';
  return value.split('.').pop();
}

function getFileExtension_(fileName) {
  const raw = getRawFileExtension_(fileName);
  return raw ? raw.toLowerCase() : '';
}

function assertAffinityExtensionCase_(fileName) {
  const raw = getRawFileExtension_(fileName);
  const normalized = raw ? raw.toLowerCase() : '';
  if ((normalized === 'af' || normalized === 'afdesign') && raw !== normalized) {
    throw new Error('Affinity Designer working files must use lowercase .af or .afdesign. Rename the file and upload again.');
  }
}

function getMatchingRule_(yearGroup, machine) {
  const targetYear = String(yearGroup || '').trim().toUpperCase();
  const targetMachine = String(machine || '').trim().toLowerCase();
  const rules = getRulesForClient();
  return rules.find(r =>
    String(r.year_group || '').trim().toUpperCase() === targetYear &&
    String(r.machine || '').trim().toLowerCase() === targetMachine
  );
}

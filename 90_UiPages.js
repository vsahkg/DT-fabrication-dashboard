/* =========================
   DISCLAIMER HELPER RENDERERS
   ========================= */

function renderDisclaimerBox_(title, bodyHtml, variant) {
  var cls = 'disclaimer-box';
  if (variant === 'info') cls += ' disclaimer-box--info';
  else if (variant === 'warning') cls += ' disclaimer-box--warning';
  return '<div class="' + cls + '">' +
    (title ? '<div class="disclaimer-title">' + title + '</div>' : '') +
    bodyHtml +
    '</div>';
}

function renderCompactDisclaimer_(text) {
  return '<div class="disclaimer-compact">' + text + '</div>';
}

function renderSpecialRequestHoldNotice_() {
  return renderDisclaimerBox_(
    APP.uiText.otherRequestHoldTitle || 'Special Requests on hold',
    '<p>' + (APP.uiText.otherRequestHoldNotice || '') + '</p>',
    'warning'
  );
}

function renderWorkflowList_(steps) {
  return '<ol style="margin:0 0 10px 18px;padding:0;">' +
    steps.map(function(s) {
      return '<li><strong>' + s.title + '</strong> &mdash; ' + s.description + '</li>';
    }).join('') +
    '</ol>';
}

function renderBulletList_(items) {
  return '<ul>' + items.map(function(item) { return '<li>' + item + '</li>'; }).join('') + '</ul>';
}

function getRuleYearGroupsForUi_(boot) {
  var sourceRules = (boot && boot.rules && boot.rules.length) ? boot.rules : [];
  if (!sourceRules.length && typeof APP !== 'undefined' && APP.defaultRules) {
    sourceRules = APP.defaultRules.map(function(row) { return { year_group: row[0] }; });
  }
  var years = [];
  sourceRules.forEach(function(rule) {
    var year = String(rule.year_group || '').trim().toUpperCase();
    if (year && years.indexOf(year) === -1) years.push(year);
  });
  years.sort(function(a, b) {
    var ay = /^Y(\d+)$/i.exec(a);
    var by = /^Y(\d+)$/i.exec(b);
    if (ay && by) return Number(ay[1]) - Number(by[1]);
    if (ay) return -1;
    if (by) return 1;
    return a.localeCompare(b);
  });
  return years;
}

function renderRuleYearOptionsForUi_(boot, blankLabel) {
  var options = [];
  if (blankLabel !== null) options.push('<option value="">' + escapeHtml_(blankLabel || 'All') + '</option>');
  getRuleYearGroupsForUi_(boot).forEach(function(year) {
    options.push('<option value="' + escapeHtml_(year) + '">' + escapeHtml_(year) + '</option>');
  });
  return options.join('');
}

function renderDashboardCheckboxFilter_(id, label, options) {
  options = options || [];
  return '<div class="field filter-check-field"><label>' + escapeHtml_(label) + '</label>' +
    '<details class="filter-check" id="' + escapeHtml_(id) + 'Panel">' +
      '<summary><span id="' + escapeHtml_(id) + 'Summary">All</span></summary>' +
      '<div class="filter-check-menu" data-filter-group="' + escapeHtml_(id) + '">' +
        options.map(function(option) {
          return '<label class="filter-check-option"><input type="checkbox" value="' + escapeHtml_(option.value) + '"><span>' + escapeHtml_(option.label) + '</span></label>';
        }).join('') +
      '</div>' +
    '</details>' +
  '</div>';
}

function renderSubmitPage_() {
  return `
  <div class="home-hero">
    <div>
      <div class="home-hero-kicker">VSA Design &amp; Technology Workshop</div>
      <h1>Submit fabrication files with fewer mistakes.</h1>
      <p>Use this dashboard for DT coursework laser cutting and 3D printing. It checks the basic rules, sends the file to the workshop queue, and gives you a status trail after technician review.</p>
      <div class="home-hero-actions">
        <button type="button" class="btn btn-primary" onclick="scrollToId_('submitForm')">Start DT Submission</button>
        <button type="button" class="btn btn-ghost" onclick="switchPage('status')">Check Status</button>
        <button type="button" class="btn btn-ghost" onclick="switchPage('other')">Special Request</button>
      </div>
    </div>
    <div class="home-panel">
      <div class="home-panel-title">Before you upload</div>
      <div class="home-panel-row"><span class="home-panel-icon">🔥</span><span>Laser jobs need editable vector files, not screenshots or pixel images.</span></div>
      <div class="home-panel-row"><span class="home-panel-icon">⚙</span><span>3D print jobs need an STL and a dimension screenshot.</span></div>
      <div class="home-panel-row"><span class="home-panel-icon">⏱</span><span>Submission does not mean same-day production. Every job is reviewed first.</span></div>
    </div>
  </div>

  <div class="workflow-strip" aria-label="Fabrication workflow">
    <div class="workflow-step"><span class="workflow-num">1</span><span><strong>Prepare</strong><span>Check file type, size, and preview.</span></span></div>
    <div class="workflow-step"><span class="workflow-num">2</span><span><strong>Submit</strong><span>Upload one working file per request.</span></span></div>
    <div class="workflow-step"><span class="workflow-num">3</span><span><strong>Review</strong><span>Technician checks readiness and notes fixes.</span></span></div>
    <div class="workflow-step"><span class="workflow-num">4</span><span><strong>Track</strong><span>Use your case number or school email on Lookup.</span></span></div>
  </div>

  <div class="card">
    <div class="section-title">DT Coursework Submission</div>
    <div class="section-sub">Submit your Design &amp; Technology laser cutting or 3D printing working file for a lo-fi or hi-fi prototype. Fill in the form below.</div>

    <div class="path-selector path-selector--compact" aria-label="Choose fabrication pathway">
      <button type="button" class="path-card path-card--primary" onclick="scrollToId_('submitForm')" aria-label="Use DT coursework submission pathway">
        <span class="path-badge">DT coursework</span>
        <span class="path-card-icon">📄</span>
        <span class="path-card-title">Class project or prototype</span>
        <span class="path-card-copy">Use this for normal DT laser cutting or 3D printing work.</span>
      </button>
      <button type="button" class="path-card path-card--secondary" onclick="switchPage('other')" aria-label="Use special request pathway">
        <span class="path-badge">Special request</span>
        <span class="path-card-icon">⭐</span>
        <span class="path-card-title">Club, event, competition, or another subject</span>
        <span class="path-card-copy">Use this when a teacher or sponsor is approving work outside normal DT coursework.</span>
      </button>
    </div>

    ` + renderDisclaimerBox_('&#9200; ' + APP.uiText.turnaroundHeadline, APP.uiText.turnaroundShort + renderBulletList_(APP.uiText.turnaroundFactors)) + `

    <div class="submit-workspace">
      <div class="submit-main-column">
    <div class="guide-card">
      <div class="guide-title">Guided Submission Steps</div>
      <div class="submit-stepper" id="submitStepper" aria-label="Submission step progress">
        <div class="submit-stepper-item" id="submitStepper1"><span class="submit-stepper-num">1</span><span><strong>Who are you?</strong><small>Student details</small></span></div>
        <div class="submit-stepper-item" id="submitStepper2"><span class="submit-stepper-num">2</span><span><strong>What are you making?</strong><small>Year, machine, material</small></span></div>
        <div class="submit-stepper-item" id="submitStepper3"><span class="submit-stepper-num">3</span><span><strong>How big is it?</strong><small>Dimensions and limits</small></span></div>
        <div class="submit-stepper-item" id="submitStepper4"><span class="submit-stepper-num">4</span><span><strong>Upload and submit</strong><small>One working file</small></span></div>
      </div>
      <ul class="guide-list">
        <li id="guideStep1"><span class="guide-check">&#9675;</span><span>Fill in your student details exactly as school records.</span></li>
        <li id="guideStep2"><span class="guide-check">&#9675;</span><span>Select your year and machine to see the correct file rules.</span></li>
        <li id="guideStep3"><span class="guide-check">&#9675;</span><span>Enter your design dimensions. Check they are within limits.</span></li>
        <li id="guideStep4"><span class="guide-check">&#9675;</span><span>Upload the correct working file and preview image (if required).</span></li>
        <li id="guideStep5"><span class="guide-check">&#9675;</span><span>` + APP.uiText.turnaroundChecklistReminder + ` Only <strong>one working file</strong> is allowed per submission. For laser work, submit <strong>one page / one artboard only</strong>. If you need a second page or another working file, it must go into the queue as a <strong>new submission</strong>.</span></li>
      </ul>
      <div class="guide-progress">
        <div class="progress-strip"><div id="submitGuideBar" class="progress-fill" style="width:0%"></div></div>
        <div id="submitGuideHint" class="hint">0/5 sections complete. Finish all items before submitting.</div>
      </div>
    </div>

    <div id="submitFormWrap">
      <div id="ruleBox" class="rule-box"></div>
      <div id="submissionDeadlineSummary" style="display:none;margin:12px 0 0;"></div>

      <form id="submitForm" autocomplete="off">
        <div class="form-section">
          <div class="form-section-title">Student Details</div>
          <div class="grid g2">
            <div class="field">
              <label>Email <span class="req">*</span></label>
              <input type="email" name="student_email" placeholder="studentID@student.example.edu or teacher@example.edu" required>
              <div class="helper">Use a school email: students use @student.example.edu; teachers and staff use @example.edu.</div>
            </div>
            <div class="field">
              <label>Full Name <span class="req">*</span></label>
              <input type="text" name="student_name" placeholder="e.g. Chan Tai Man" required>
            </div>
          </div>
          <div id="dtSubmitActivity" class="disclaimer-compact" style="display:none;margin-top:4px;"></div>
          <div class="grid g3">
            <div class="field">
              <label>Design Class No. <span class="req">*</span></label>
              <input type="text" name="design_class_no" placeholder="e.g. 8.1" required>
            </div>
            <div class="field">
              <label>Teacher Name <span class="req">*</span></label>
              <select name="design_teacher" required>
                <option value="">&mdash; Select teacher &mdash;</option>
                <option value="DT Teacher 1">DT Teacher 1</option>
                <option value="DT Teacher 2">DT Teacher 2</option>
                <option value="DT Teacher 3">DT Teacher 3</option>
                <option value="DT Teacher 4">DT Teacher 4</option>
                <option value="DT Teacher 5">DT Teacher 5</option>
                <option value="DT Teacher 6">DT Teacher 6</option>
                <option value="DT Teacher 7">DT Teacher 7</option>
                <option value="DT Teacher 8">DT Teacher 8</option>
                <option value="DT Technician">DT Technician</option>
                <option value="System Admin">System Admin</option>
              </select>
            </div>
            <div class="field">
              <label>Year Group <span class="req">*</span></label>
              <select name="year_group" id="year_group" required>
                <option value="">&mdash; Select year &mdash;</option>
              </select>
            </div>
            <div class="field">
              <label>Prototype Type <span class="req">*</span></label>
              <select name="prototype_fidelity" required>
                <option value="">&mdash; Select prototype type &mdash;</option>
                <option value="low">Lo fi Prototype</option>
                <option value="hi">Hi fi Prototype</option>
                <option value="final">Final Product</option>
                <option value="na">N/A</option>
              </select>
              <div class="helper">Choose Lo fi Prototype, Hi fi Prototype, Final Product, or N/A if this does not apply.</div>
            </div>
          </div>
          <div id="submissionControlNotice" role="status" aria-live="polite" style="display:none;margin-top:12px;"></div>
        </div>

        <hr class="divider">

        <div class="form-section">
          <div class="form-section-title">Machine &amp; Material</div>
          <div class="grid g3">
            <div class="field">
              <label>Machine <span class="req">*</span> <a class="field-tip" href="javascript:void(0)" onclick="switchPage('machines')" title="View Machines Guide">?</a></label>
              <select name="machine" id="machine" required>
                <option value="">&mdash; Select &mdash;</option>
                <option value="laser">&#128293; Laser Cut</option>
                <option value="3d">&#9881; 3D Print</option>
              </select>
              <div class="helper">Laser = flat sheet cutting &bull; 3D = printed objects</div>
            </div>
            <div class="field">
              <label>Material <span class="req">*</span></label>
              <select name="material" id="material" required disabled>
                <option value="">Choose year + machine first</option>
              </select>
              <div class="helper">Available materials depend on your year and machine.</div>
            </div>
            <div class="field">
              <label>Units</label>
              <input type="text" name="units" id="units" readonly placeholder="auto-filled">
            </div>
          </div>
          <div id="dtMachineReminder"></div>
          <div class="grid g3">
            <div class="field">
              <label>Width <span class="req">*</span></label>
              <input type="number" name="width" step="0.1" min="0" placeholder="0" required>
            </div>
            <div class="field">
              <label>Height <span class="req">*</span></label>
              <input type="number" name="height" step="0.1" min="0" placeholder="0" required>
            </div>
            <div class="field" id="depthField" style="display:none;">
              <label>Depth <span class="req">*</span></label>
              <input type="number" name="depth" step="0.1" min="0" placeholder="0">
              <div class="helper">Required for 3D Print submissions.</div>
            </div>
          </div>
        </div>

        <hr class="divider">

        <div class="form-section">
          <div class="form-section-title">Files</div>
          <div class="alert alert-warning" style="margin-bottom:12px;">
            <span class="alert-icon">&#9888;</span>
            <div><strong>One submission = one working file.</strong> For laser cutting, that working file must contain <strong>one page / one artboard only</strong>. If you need to make a second page, upload it as a <strong>separate submission</strong> so it joins the queue separately.</div>
          </div>
          <div class="grid g2">
            <div class="field">
              <label>Working File <span class="req">*</span></label>
              <div class="file-zone" id="zone_workingFile" role="button" tabindex="0">
                <input type="file" id="workingFile" accept=".af,.afdesign,.svg,.dxf,.stl">
                <div class="file-zone-icon">&#128196;</div>
                <div class="file-zone-label">Click or drag &amp; drop</div>
                <div class="file-zone-sub">Affinity Designer (.af, .afdesign), SVG, DXF, or STL. One working file only per submission.</div>
                <div class="file-chosen" id="chosen_workingFile"></div>
                <div class="file-feedback" id="feedback_workingFile" aria-live="polite"></div>
              </div>
            </div>
            <div class="field">
              <label>Preview Image <span id="previewReqMark" class="req" style="display:none;">*</span></label>
              <div class="file-zone" id="zone_previewFile" role="button" tabindex="0">
                <input type="file" id="previewFile" accept="image/*">
                <div class="file-zone-icon">&#128444;&#65039;</div>
                <div class="file-zone-label">Click or drag &amp; drop</div>
                <div class="file-zone-sub" id="previewFileHint">PNG, JPG, or JPEG accepted. Required only when the selected rule asks for it.</div>
                <div class="file-chosen" id="chosen_previewFile"></div>
                <div class="file-feedback" id="feedback_previewFile" aria-live="polite"></div>
              </div>
            </div>
          </div>
        </div>

        <hr class="divider">

        <div class="field" style="margin-bottom:20px;">
          <label>Additional Notes</label>
          <textarea name="additional_notes" rows="3" placeholder="Add any information the technician should know, such as material choice, scale notes, or special instructions."></textarea>
        </div>

        ` + renderCompactDisclaimer_('&#128337; <strong>Reminder:</strong> ' + APP.uiText.turnaroundCompact) + `
        <div id="dtRepeatReminder" class="disclaimer-compact" style="display:none;margin-top:6px;">&#9888;&#65039; <strong>Duplicate?</strong> Please check your submission history before submitting again. Repeated identical submissions slow the review queue.</div>
        ` + renderCompactDisclaimer_('&#9200; <strong>Y9/Y10 deadline passed:</strong> Y9/Y10 DT submissions are now closed. The technician team is still working on submitted requests, so please keep using the <strong>Lookup</strong> page to track your request and pick up your work when it is ready.') + `
        ` + renderCompactDisclaimer_('&#128274; <strong>Class check:</strong> Use your real Design Class No. and Year Group. The system checks your student email against the class list, so choosing another year or class will not bypass deadline rules.') + `

        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-top:14px;">
          <button type="submit" id="submitBtn" class="btn btn-primary" style="min-width:140px;">Submit</button>
          <span id="submitMsg" class="inline-msg tc-muted"></span>
        </div>
      </form>
    </div>

    <div id="submitSuccess" class="submit-success" style="display:none;">
      <div class="success-hero">
        <div class="success-hero-icon">&#9989;</div>
        <h3>Submission Received</h3>
        <p>Your file has been submitted. Save your case number and quote it when asking for help.</p>
      </div>

      <div class="success-id-block">
        <div class="success-id-label">Case Number</div>
        <div class="id-box" id="successId" role="button" tabindex="0" onclick="copySuccessId_(this)">
          <span class="id-box-text"></span>
          <span class="id-box-icon" title="Copy to clipboard">&#128203;</span>
        </div>
        <div class="id-box-hint">Click to copy &mdash; this is the fastest reference for teachers and technicians.</div>
        <div id="successSubmittedAt" class="disclaimer-compact" style="display:none;margin-top:8px;"></div>
      </div>

      <div class="success-body">
        <div class="success-next">
          <div class="success-next-title">&#128197; What Happens Next?</div>
          <p>` + APP.uiText.turnaroundSuccessIntro + `</p>
          <ol class="success-steps">` +
            APP.uiText.turnaroundWorkflowSteps.map(function(s, i) {
              return '<li class="success-step"><span class="success-step-num">' + (i + 1) + '</span><span><strong>' + s.title + '</strong> &mdash; ' + s.description + '</span></li>';
            }).join('') + `
          </ol>
          <div class="success-warning">
            <span class="success-warning-icon">&#9888;&#65039;</span>
            <span>` + APP.uiText.turnaroundSuccessOutro + `</span>
          </div>
        </div>
      </div>

      <div class="success-actions">
        <button class="btn btn-primary" onclick="switchPage('status')">&#128270; Track Status</button>
        <button class="btn btn-ghost" onclick="resetSubmitForm_()">&#128221; Submit Another</button>
        <button class="btn btn-ghost" onclick="switchPage('machines')">&#128736; View Machines Guide</button>
      </div>
      <p style="text-align:center;font-size:12px;color:var(--slate-lt);padding:0 24px 20px;">Need help preparing your next file? The <a href="javascript:void(0)" onclick="switchPage('machines')" style="font-weight:700;">Machines Guide</a> explains file types, workflows, and report tips.</p>
    </div>
      </div>

      <aside class="submit-helper-rail" aria-label="DT submission convenience checklist">
        <div class="submit-helper-head">
          <div>
            <div class="submit-helper-title">Convenience checklist</div>
            <div class="submit-helper-copy">Live guidance for draft saving, file confidence, and queue wording while you complete the form.</div>
          </div>
          <span class="submit-rail-pill" id="submitRailReadyPill">Starting</span>
        </div>
        <div class="submit-rail-progress">
          <div class="submit-rail-progress-track"><span class="submit-rail-progress-fill" id="submitRailProgressFill"></span></div>
          <div class="submit-rail-progress-text" id="submitRailProgressText">0/5 sections ready</div>
        </div>
        <div class="submit-rail-next" id="submitRailNextAction">
          <strong>Next step</strong>
          Start with your student details.
        </div>
        <div class="submit-rail-list">
          <div class="submit-rail-item" id="submitRailDraftItem">
            <span class="submit-rail-icon" id="submitRailDraftIcon">&#9675;</span>
            <span><span class="submit-rail-item-title">Draft restored/saved</span><span class="submit-rail-item-note" id="submitRailDraftNote">Autosave starts when you type. Files are never saved by the browser.</span></span>
          </div>
          <div class="submit-rail-item" id="submitRailRulesItem">
            <span class="submit-rail-icon" id="submitRailRulesIcon">&#9675;</span>
            <span><span class="submit-rail-item-title">Rules selected</span><span class="submit-rail-item-note" id="submitRailRulesNote">Choose year group and machine to load materials, units, dimensions, and preview rules.</span></span>
          </div>
          <div class="submit-rail-item" id="submitRailFilesItem">
            <span class="submit-rail-icon" id="submitRailFilesIcon">&#9675;</span>
            <span><span class="submit-rail-item-title">File confidence</span><span class="submit-rail-item-note" id="submitRailFilesNote">Attach one editable working file; add a preview image when the selected rule asks for it.</span></span>
          </div>
          <div class="submit-rail-item is-done" id="submitRailQueueItem">
            <span class="submit-rail-icon" id="submitRailQueueIcon">&#10003;</span>
            <span><span class="submit-rail-item-title">Queue wording</span><span class="submit-rail-item-note" id="submitRailQueueNote">Submitting sends the file to human technician review first. It is not same-day production.</span></span>
          </div>
          <div class="submit-rail-item is-done" id="submitRailCtaItem">
            <span class="submit-rail-icon" id="submitRailCtaIcon">&#10003;</span>
            <span><span class="submit-rail-item-title">No ghost CTA</span><span class="submit-rail-item-note" id="submitRailCtaNote">Use the buttons below for real actions: resume the form, check status, or open the machine guide.</span></span>
          </div>
        </div>
        <div class="submit-rail-actions">
          <button type="button" class="btn btn-primary btn-sm" onclick="scrollToId_('submitForm')">&#128221; Resume Form</button>
          <button type="button" class="btn btn-ghost btn-sm" onclick="switchPage('status')">&#128270; Check Status</button>
          <button type="button" class="btn btn-ghost btn-sm" onclick="switchPage('machines')">&#128736; Machine Guide</button>
        </div>
      </aside>
    </div>
  </div>
  `;
}

function renderOtherRequestPage_(boot) {
  var teacherOptions = Object.keys(APP.teacherEmails).sort().map(function(t) {
    return '<option value="' + escapeHtml_(t) + '">' + escapeHtml_(t) + '</option>';
  }).join('');
  var yearOptions = renderRuleYearOptionsForUi_(boot, '— Select —');


  return `
  <div class="page-hero page-hero--special">
    <div>
      <div class="page-hero-kicker">Special fabrication pathway</div>
      <h1>${APP.uiText.otherRequestIntroHeadline}</h1>
      <p>${APP.uiText.otherRequestIntroBody} Use this route when the work is teacher-approved, outside the regular DT coursework queue, and ready for a technician to review.</p>
    </div>
    <div class="page-hero-actions">
      <button type="button" class="btn btn-primary" onclick="scrollToId_('otherForm')">&#128221; Start Request</button>
      <button type="button" class="btn btn-ghost" onclick="switchPage('machines')">&#128736; Machine Guide</button>
      <button type="button" class="btn btn-ghost" onclick="switchPage('status')">&#128270; Track Request</button>
    </div>
  </div>

  <div class="request-note-strip" aria-label="Special request workflow">
    <div class="request-note">
      <span class="request-note-icon">&#128274;</span>
      <span><strong>Teacher sponsor first</strong><span>Competition, club, event, or subject work needs a responsible staff contact.</span></span>
    </div>
    <div class="request-note">
      <span class="request-note-icon">&#128206;</span>
      <span><strong>Attach ready files</strong><span>Share the design file, key dimensions, materials, deadline, and purpose.</span></span>
    </div>
    <div class="request-note">
      <span class="request-note-icon">&#128736;</span>
      <span><strong>Human review</strong><span>Technicians decide feasibility and timing. The system only organises the request.</span></span>
    </div>
  </div>

  ` + renderSpecialRequestHoldNotice_() + `

  <div class="card">
    <div class="section-title">&#128301; Request Form</div>
    <div class="section-sub">Complete the details below so the workshop can judge feasibility, timing, and machine fit.</div>
    <div class="orientation-line" style="font-size:12px;color:var(--slate-lt);margin-bottom:8px;">This page is for competitions, clubs, other subjects, exhibitions, and non-DT fabrication requests.</div>
    <div class="bys-block">
      <div class="bys-title">&#128214; Before You Start</div>
      <div class="bys-who">
        <div class="bys-who-icon">&#127919;</div>
        <div><strong>Who is this for?</strong> Non-DT departments, competitions, clubs, exhibitions, events, and any fabrication need outside of regular DT coursework. Students using this pathway should normally be in <strong>Y6-Y12</strong> and have a responsible teacher or sponsor approving the request. DT students should use the <a href="javascript:void(0)" onclick="switchPage('submit')" style="font-weight:700;color:var(--blue);text-decoration:underline;">DT Submit</a> page instead.</div>
      </div>
      <div class="bys-grid">
        <div class="bys-item">
          <span class="bys-check">&#9745;</span>
          <span>A <strong>responsible teacher / sponsor</strong> has approved this request.</span>
        </div>
        <div class="bys-item">
          <span class="bys-check">&#9745;</span>
          <span>Your file is <strong>final or near-final</strong> quality &mdash; not a rough draft.</span>
        </div>
        <div class="bys-item">
          <span class="bys-check">&#9745;</span>
          <span>Dimensions are <strong>accurate</strong> and within machine limits.</span>
        </div>
        <div class="bys-item">
          <span class="bys-check">&#9745;</span>
          <span>Purpose, deadlines, and use case are <strong>clearly stated</strong>.</span>
        </div>
        <div class="bys-item">
          <span class="bys-check">&#9745;</span>
          <span>You understand that <strong>DT coursework may be prioritised</strong> ahead of this request.</span>
        </div>
      </div>
      <div class="bys-notices">
        <span class="bys-notice">&#9208;&#65039; ${APP.uiText.otherRequestHoldNotice}</span>
        <span class="bys-notice">&#9888;&#65039; ${APP.uiText.otherRequestPriorityNotice}</span>
        <span class="bys-notice">&#128274; ${APP.uiText.otherRequestApprovalNotice}</span>
        <span class="bys-notice">&#128337; ${APP.uiText.otherRequestNoGuarantee}</span>
      </div>
      <div class="bys-footer">
        <span>&#128736; <strong>New to the workshop?</strong></span>
        <a href="javascript:void(0)" onclick="switchPage('machines')" style="font-weight:700;text-decoration:underline;color:var(--blue);">View Machines Guide</a> for file requirements, size limits &amp; beginner tips.
      </div>
    </div>

    <div id="otherFormWrap">
      <form id="otherForm" autocomplete="off">

        <!-- Section A: Requester Details -->
        <div class="form-section">
          <div class="form-section-title">&#128100; A. Requester Details</div>
          <div class="grid g2">
            <div class="field">
              <label>Email <span class="req">*</span></label>
              <input type="email" name="requester_email" placeholder="your-email@student.example.edu or your-email@example.edu" required>
              <div class="helper">Students use @student.example.edu. Staff use @example.edu.</div>
            </div>
            <div class="field">
              <label>Full Name <span class="req">*</span></label>
              <input type="text" name="requester_name" placeholder="e.g. Chan Tai Man" required>
            </div>
          </div>
          <div id="otherSubmitActivity" class="disclaimer-compact" style="display:none;margin-top:4px;"></div>
          <div class="grid g2">
            <div class="field">
              <label>Role <span class="req">*</span></label>
              <select name="requester_role" id="otherRole" required>
                <option value="">&mdash; Select role &mdash;</option>
              </select>
            </div>
            <div class="field" id="otherYearGroupField" style="display:none;">
              <label>Year Group</label>
              <select name="year_group" id="otherYearGroup">
                ${yearOptions}
              </select>
            </div>
          </div>
          <div class="grid g2">
            <div class="field" id="otherClassField" style="display:none;">
              <label>Class <small>(optional)</small></label>
              <input type="text" name="class" id="otherClass" placeholder="e.g. 10A">
            </div>
            <div class="field">
              <label>Department / Subject <span class="req">*</span></label>
              <select name="department_or_subject" id="otherDepartment" required>
                <option value="">&mdash; Select &mdash;</option>
              </select>
            </div>
          </div>
          <div class="field" id="otherDeptOtherField" style="display:none;">
            <label>Specify Department <span class="req">*</span></label>
            <input type="text" id="otherDeptOtherInput" placeholder="Enter department or subject name">
          </div>
        </div>

        <hr class="divider">

        <!-- Section B: Request Details -->
        <div class="form-section">
          <div class="form-section-title">&#128203; B. Request Details</div>
          <div class="grid g2">
            <div class="field">
              <label>Request Type <span class="req">*</span></label>
              <select name="request_type" id="otherRequestType" required>
                <option value="">&mdash; Select type &mdash;</option>
              </select>
            </div>
            <div class="field">
              <label>Project Name <span class="req">*</span></label>
              <input type="text" name="project_name" placeholder="e.g. Science Fair Model, Art Sculpture" required>
            </div>
          </div>
          <div class="grid g2">
            <div class="field">
              <label>Purpose <span class="req">*</span></label>
              <select name="project_purpose" id="otherPurpose" required>
                <option value="">&mdash; Select purpose &mdash;</option>
              </select>
            </div>
            <div class="field" id="otherCompetitionField" style="display:none;">
              <label>Competition Name <span class="req">*</span></label>
              <input type="text" name="competition_name" placeholder="e.g. HKUST Science Fair">
            </div>
          </div>
          <div class="grid g2">
            <div class="field">
              <label>Event / Exhibition Name <small>(if applicable)</small></label>
              <input type="text" name="event_or_deadline" placeholder="e.g. Exhibition Week, Open Day">
            </div>
            <div class="field">
              <label>Needed-by Date <small>(if applicable)</small></label>
              <input type="date" name="needed_by_date" id="otherNeededBy">
              <div class="helper">Leave blank if no hard deadline.</div>
            </div>
          </div>
          <div class="field">
            <label>Job Description / Fabrication Notes <span class="req">*</span></label>
            <textarea name="request_description" rows="3" placeholder="Describe what you need fabricated, dimensions, materials, and any special requirements. The more detail you provide, the faster we can process your request." required></textarea>
          </div>
        </div>

        <hr class="divider">

        <!-- Section C: Approval Details -->
        <div class="form-section">
          <div class="form-section-title">&#128274; C. Teacher / Sponsor Approval</div>
          <div class="section-sub">All requests must have a responsible teacher or staff sponsor.</div>
          <div class="grid g2">
            <div class="field">
              <label>Responsible Teacher <span class="req">*</span></label>
              <select name="teacher_in_charge" id="otherTeacher" required>
                <option value="">&mdash; Select teacher &mdash;</option>
                ${teacherOptions}
                <option value="__other__">Other (type below)</option>
              </select>
            </div>
            <div class="field" id="otherTeacherCustomField" style="display:none;">
              <label>Teacher Name (other)</label>
              <input type="text" id="otherTeacherCustom" placeholder="Full name of teacher">
            </div>
          </div>
          <div class="grid g2">
            <div class="field">
              <label>Responsible Teacher Email <span class="req">*</span></label>
              <input type="email" name="teacher_in_charge_email" id="otherTeacherEmail" placeholder="teacher@example.edu" required>
            </div>
            <div class="field">
              <label>Approver Email <span class="req">*</span></label>
              <input type="email" name="approved_by_email" placeholder="approver@example.edu" required>
              <div class="helper">Email of the teacher or HOD who approved this request. Can be the same as above.</div>
            </div>
          </div>
        </div>

        <hr class="divider">

        <!-- Section D: Fabrication Details -->
        <div class="form-section">
          <div class="form-section-title">&#128296; D. Fabrication Details</div>
          <p style="font-size:13px;color:var(--slate-lt);margin:0 0 12px;">&#128293; <strong>Laser cutting</strong> cuts flat sheets (signs, plates, enclosures). &#9881; <strong>3D printing</strong> builds solid objects (models, parts, prototypes). Not sure? Just describe your need &mdash; our technicians will advise.</p>
          <div class="grid g3">
            <div class="field">
              <label>Machine <span class="req">*</span> <a class="field-tip" href="javascript:void(0)" onclick="switchPage('machines')" title="View Machines Guide">?</a></label>
              <select name="machine" id="otherMachine" required>
                <option value="">&mdash; Select &mdash;</option>
                <option value="laser">&#128293; Laser Cut</option>
                <option value="3d">&#9881; 3D Print</option>
              </select>
            </div>
            <div class="field">
              <label>Material <span class="req">*</span></label>
              <select name="material" id="otherMaterial" required>
                <option value="">&mdash; Select machine first &mdash;</option>
              </select>
            </div>
            <div class="field">
              <label>Quantity</label>
              <input type="number" name="quantity" min="1" value="1" style="max-width:80px;">
            </div>
          </div>
          <div class="grid g2">
            <div class="field">
              <label>Units</label>
              <select name="units" id="otherUnits">
                <option value="cm">cm</option>
                <option value="mm">mm</option>
              </select>
            </div>
          </div>
          <div id="otherMachineReminder"></div>
          <div class="disclaimer-compact" style="margin-bottom:10px;">
            &#128207; <strong>Dimensions are a request, not a guarantee.</strong> Final approval depends on machine suitability, material availability, and technician review. The workshop may ask you to adjust your design.
          </div>
          <div class="grid g3">
            <div class="field">
              <label>Width <span class="req">*</span></label>
              <input type="number" name="width" step="0.1" min="0" placeholder="0" required>
            </div>
            <div class="field">
              <label>Height <span class="req">*</span></label>
              <input type="number" name="height" step="0.1" min="0" placeholder="0" required>
            </div>
            <div class="field" id="otherDepthField" style="display:none;">
              <label>Depth <span class="req">*</span></label>
              <input type="number" name="depth" step="0.1" min="0" placeholder="0">
              <div class="helper">Required for 3D Print.</div>
            </div>
          </div>
        </div>

        <hr class="divider">

        <!-- Section E: Files -->
        <div class="form-section">
          <div class="form-section-title">&#128206; E. Files</div>
          <div class="grid g2">
            <div class="field">
              <label>Working File <span class="req">*</span></label>
              <div class="file-zone" id="zone_otherWorkingFile" role="button" tabindex="0">
                <input type="file" id="otherWorkingFile" accept=".af,.afdesign,.svg,.dxf,.stl">
                <div class="file-zone-icon">&#128196;</div>
                <div class="file-zone-label">Click or drag &amp; drop</div>
                <div class="file-zone-sub">Upload the fabrication file that should be processed</div>
                <div class="file-chosen" id="chosen_otherWorkingFile"></div>
                <div class="file-feedback" id="feedback_otherWorkingFile" aria-live="polite"></div>
              </div>
            </div>
            <div class="field">
              <label>Preview Image <small>(optional)</small></label>
              <div class="file-zone" id="zone_otherPreviewFile" role="button" tabindex="0">
                <input type="file" id="otherPreviewFile" accept="image/*">
                <div class="file-zone-icon">&#128444;&#65039;</div>
                <div class="file-zone-label">Click or drag &amp; drop</div>
                <div class="file-zone-sub">PNG, JPG, or JPEG screenshot showing the model or dimensions</div>
                <div class="file-chosen" id="chosen_otherPreviewFile"></div>
                <div class="file-feedback" id="feedback_otherPreviewFile" aria-live="polite"></div>
              </div>
            </div>
          </div>
        </div>

        <hr class="divider">

        <!-- Section F: Additional Info -->
        <div class="form-section">
          <div class="form-section-title">&#128221; F. Additional Information</div>
          <div class="field" style="margin-bottom:14px;">
            <label>Priority / Justification Note <small>(optional)</small></label>
            <textarea name="priority_reason" rows="2" placeholder="If this request is time-sensitive, explain why (e.g. competition deadline 20 Mar, Science Fair display needed by 15 Apr)."></textarea>
          </div>
          <div class="field" style="margin-bottom:0;">
            <label>Other Requirements / Notes <small>(optional)</small></label>
            <textarea name="additional_requirements" rows="2" placeholder="Any special instructions, material preferences, colour requirements, etc."></textarea>
          </div>
        </div>

        <hr class="divider">

        <!-- Section G: Confirmation -->
        <div class="form-section">
          <div class="form-section-title">&#9989; G. Confirmation</div>
          <div class="confirm-row">
            <input type="checkbox" id="otherConfirmApproval">
            <label for="otherConfirmApproval">I confirm that <strong>teacher / supervisor approval</strong> has been obtained for this request.</label>
          </div>
          <div class="confirm-row">
            <input type="checkbox" id="otherConfirmTimeline">
            <label for="otherConfirmTimeline">I understand that requests are subject to <strong>review, queueing, and production time</strong> &mdash; no guaranteed turnaround.</label>
          </div>
        </div>

        ` + renderCompactDisclaimer_('&#128337; <strong>Reminder:</strong> ' + APP.uiText.otherRequestNoGuarantee) + `
        <div id="otherRepeatReminder" class="disclaimer-compact" style="display:none;margin-top:6px;">&#9888;&#65039; <strong>Duplicate?</strong> Please check your submission history before submitting again. Repeated identical submissions slow the review queue.</div>

        <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;margin-top:14px;">
          <button type="submit" id="otherSubmitBtn" class="btn btn-primary" style="min-width:140px;">Submit Request</button>
          <span id="otherSubmitMsg" class="inline-msg tc-muted"></span>
        </div>
      </form>
    </div>

    <div id="otherSuccess" class="submit-success" style="display:none;">
      <div class="success-hero">
        <div class="success-hero-icon">&#9989;</div>
        <h3>Special Request Submitted for Review</h3>
        <p>${APP.uiText.otherRequestSuccessIntro}</p>
      </div>

      <div class="success-id-block">
        <div class="success-id-label">Case Number</div>
        <div class="id-box" id="otherSuccessId" role="button" tabindex="0" onclick="copySuccessId_(this)">
          <span class="id-box-text"></span>
          <span class="id-box-icon" title="Copy to clipboard">&#128203;</span>
        </div>
        <div class="id-box-hint">Click to copy &mdash; this is the fastest reference for teachers and technicians.</div>
        <div id="otherSuccessSubmittedAt" class="disclaimer-compact" style="display:none;margin-top:8px;"></div>
      </div>

      ` + renderSpecialRequestHoldNotice_() + `

      <div class="success-body">
        <div class="success-next">
          <div class="success-next-title">&#128197; What Happens Next?</div>
          <ol class="success-steps">` +
            APP.uiText.otherRequestWorkflowSteps.map(function(s, i) {
              return '<li class="success-step"><span class="success-step-num">' + (i + 1) + '</span><span><strong>' + s.title + '</strong> &mdash; ' + s.description + '</span></li>';
            }).join('') + `
          </ol>
          <div class="success-warning">
            <span class="success-warning-icon">&#9888;&#65039;</span>
            <span>${APP.uiText.otherRequestSuccessOutro}</span>
          </div>
        </div>
      </div>

      <div class="success-actions">
        <button class="btn btn-primary" onclick="switchPage('status')">&#128270; Track Status</button>
        <button class="btn btn-ghost" onclick="resetOtherForm_()">&#128221; Submit Another Special Request</button>
        <button class="btn btn-ghost" onclick="switchPage('machines')">&#128736; Machines Guide</button>
      </div>
    </div>
  </div>
  `;
}

function renderStatusPage_(user) {
  var isStudentView = !user || !user.isAdmin;
  var title = isStudentView ? 'My Submission Status' : 'Submission Lookup';
  var sub = isStudentView
    ? 'Enter your school email or case number to check progress, submitted files, feedback, queue position, and what to do next. Your results will load automatically.'
    : 'Look up any submission by student email, case number, Submission ID, or Request ID.';
  var lookupPlaceholder = isStudentView ? 'Email or case number, e.g. M720 or A015' : 'Email, case number, Submission ID, or Request ID';
  var lookupHint = isStudentView
    ? 'Students can search using their school email or the case number from the confirmation email. M numbers are DT submissions; A numbers are Special Requests.'
    : 'Students can use their school email or case number. Teachers, technicians, and admins can paste an exact ID when following up with a learner or sponsor.';
  var emptyCopy = isStudentView
    ? 'Enter your school email to see all your submissions, or paste a case number such as M720 or A015 to look up one entry.'
    : 'Enter your school email to see all your submissions, or paste a case number, Submission ID, or Request ID to look up one entry.';
  var emptyHelpTitle = isStudentView ? 'Enter Email or Case Number' : 'Enter Email or ID';
  var emptyHelpCopy = isStudentView ? 'Use your school email or the case number from your receipt.' : 'Use your school email, case number, Submission ID, or Request ID.';
  return `
  <div class="page-hero page-hero--status">
    <div>
      <div class="page-hero-kicker">Fabrication tracking</div>
      <h1>${title}</h1>
      <p>${sub} Status information shows where the request sits in the human review and workshop process.</p>
    </div>
	    <div class="page-hero-actions">
	      <button type="button" class="btn btn-primary" onclick="focusStatusSearch_()">Search Now</button>
	      <button type="button" class="btn btn-ghost" onclick="switchPage('queue')">Queue Status</button>
	      <button type="button" class="btn btn-ghost" onclick="switchPage('submit')">New DT Submission</button>
	      <button type="button" class="btn btn-ghost" onclick="switchPage('other')">Special Request</button>
    </div>
  </div>

  <div class="card">
    <div class="section-title">Status Lookup</div>
    <div class="section-sub">Search both DT submissions and special fabrication requests from one place. Each result shows the current stage, next action, file links, and any technician feedback.</div>

    ` + renderDisclaimerBox_('Turnaround Time Notice', APP.uiText.turnaroundStatusNotice) + `

    <div class="status-search-panel">
      <div class="status-search-row">
        <input id="statusQuery" type="text" placeholder="${lookupPlaceholder}" aria-label="${lookupPlaceholder}">
        <button id="statusSearchBtn" class="btn btn-primary" onclick="loadStatuses()" style="white-space:nowrap;">Check Status</button>
        <button class="btn btn-ghost" onclick="clearStatusSearch_()" style="white-space:nowrap;">Clear</button>
      </div>
      <div class="status-search-hint">
        <span>&#128161;</span>
        <span>${lookupHint}</span>
      </div>
    </div>
    <div id="statusMsg" class="inline-msg tc-muted" style="margin-bottom:12px;"></div>
    <div id="statusResults">
      <div id="statusEmptyState" class="status-empty-state">
        <div class="status-empty-icon">&#128269;</div>
        <p class="status-empty-title">No search yet</p>
        <p class="status-empty-copy">${emptyCopy}</p>
        <div class="status-help-grid">
          <div class="status-help-card">
            <div class="status-help-icon">&#128232;</div>
            <div class="status-help-title">${emptyHelpTitle}</div>
            <div class="status-help-copy">${emptyHelpCopy}</div>
          </div>
          <div class="status-help-card">
            <div class="status-help-icon">&#128270;</div>
            <div class="status-help-title">Search Both Paths</div>
            <div class="status-help-copy">DT submissions and special requests are checked together.</div>
          </div>
	          <div class="status-help-card">
	            <div class="status-help-icon">&#128200;</div>
	            <div class="status-help-title">Workshop Queue</div>
	            <div class="status-help-copy">Open Queue Status to see workload, machine capacity, and recent request activity.</div>
	          </div>
	        </div>
	      </div>
    </div>
  </div>
	  `;
	}

function renderStudentQueuePage_() {
  return `
  <div class="page-hero page-hero--status">
    <div>
      <div class="page-hero-kicker">Workshop visibility</div>
      <h1>Queue &amp; Machine Status</h1>
      <p>Use this page to understand the current workshop workload, recent request activity, and machine capacity before you submit or chase a job. This page shows aggregate demo-safe information only.</p>
    </div>
    <div class="page-hero-actions">
      <button type="button" class="btn btn-primary" onclick="loadStatusQueueSnapshot_()">Refresh Queue</button>
      <button type="button" class="btn btn-ghost" onclick="switchPage('status')">Check My Case</button>
      <button type="button" class="btn btn-ghost" onclick="switchPage('machines')">Machines Guide</button>
    </div>
  </div>

  <div class="card">
    <div class="status-queue-panel status-queue-panel--standalone" id="statusQueuePanel">
      <div class="status-queue-head">
        <div>
          <div class="status-queue-title">Whole-workshop queue</div>
          <div class="status-queue-note">Submitted, Approved, In Queue, and In Production all count as active workload. Needs Fix waits for student revision and is not a promise of turnaround time.</div>
        </div>
        <span class="pill pill-submitted" id="statusQueueHealthPill">LOADING</span>
      </div>
      <div class="status-workload-card" id="statusQueueGlobal" aria-live="polite">Loading workload view...</div>
    </div>
  </div>

  <div class="queue-student-grid">
    <div class="card queue-student-card">
      <div class="section-title">Machine status</div>
      <div class="section-sub">Machine status is shown as student-safe guidance, not a booking promise.</div>
      <div class="queue-machine-status" id="queueMachineStatusCards">
        <div class="status-help-card"><div class="status-help-icon">&#128293;</div><div class="status-help-title">Laser cutting</div><div class="status-help-copy">Loading current capacity notice...</div></div>
        <div class="status-help-card"><div class="status-help-icon">&#9881;</div><div class="status-help-title">3D printing</div><div class="status-help-copy">Loading current queue context...</div></div>
      </div>
    </div>

    <div class="card queue-student-card">
      <div class="section-title">What the stages mean</div>
      <div class="status-help-grid">
        <div class="status-help-card"><div class="status-help-icon">&#128229;</div><div class="status-help-title">Submitted</div><div class="status-help-copy">Your file is waiting for human technician review.</div></div>
        <div class="status-help-card"><div class="status-help-icon">&#9989;</div><div class="status-help-title">Approved / Queue</div><div class="status-help-copy">The file passed review and is waiting for a production slot.</div></div>
        <div class="status-help-card"><div class="status-help-icon">&#128295;</div><div class="status-help-title">In production</div><div class="status-help-copy">The workshop is fabricating or preparing the job.</div></div>
        <div class="status-help-card"><div class="status-help-icon">&#8635;</div><div class="status-help-title">Needs Fix</div><div class="status-help-copy">Read technician feedback, revise the file, and submit the corrected version.</div></div>
      </div>
    </div>
  </div>
  `;
}

function renderTeacherBetaPage_(user) {
  user = user || {};
  if (user.role !== 'teacher' && user.role !== 'admin') {
    return `
    <div class="card">
      <div class="section-title">Class</div>
      <div class="alert alert-error"><span class="alert-icon">&#128274;</span><span>Class is available to teacher accounts only.</span></div>
    </div>`;
  }
  var classes = (APP.teacherBetaClasses || []).filter(function(cls) {
    if (user.role === 'admin') return true;
    return normalizeEmail_(cls.teacher_email) === normalizeEmail_(user.email) ||
      String(cls.teacher || '').trim().toLowerCase() === String(user.name || '').trim().toLowerCase();
  });
  var teacherMap = {};
  classes.forEach(function(cls) {
    var key = normalizeEmail_(cls.teacher_email) || String(cls.teacher || '').trim().toLowerCase();
    if (!key || teacherMap[key]) return;
    teacherMap[key] = {
      key: key,
      teacher: cls.teacher || cls.teacher_email || 'Teacher',
      teacher_email: normalizeEmail_(cls.teacher_email)
    };
  });
  var teacherOptions = Object.keys(teacherMap).map(function(key) { return teacherMap[key]; }).sort(function(a, b) {
    return String(a.teacher || '').localeCompare(String(b.teacher || ''));
  }).map(function(teacher) {
    return '<option value="' + escapeHtml_(teacher.key || '') + '">' + escapeHtml_(teacher.teacher || 'Teacher') + '</option>';
  }).join('');
  var classOptions = classes.map(function(cls) {
    var teacherKey = normalizeEmail_(cls.teacher_email) || String(cls.teacher || '').trim().toLowerCase();
    return '<option value="' + escapeHtml_(cls.class_no || '') + '" data-teacher-key="' + escapeHtml_(teacherKey) + '">' + escapeHtml_(cls.label || ('Class ' + cls.class_no)) + '</option>';
  }).join('');
  return `
  <div class="teacher-beta-hero">
    <div>
      <div class="teacher-beta-kicker">Teacher tools</div>
      <h2 class="teacher-beta-title">Class Submission</h2>
      <p class="teacher-beta-copy">Track which students in a design class have submitted fabrication work, who still needs a reminder, and which cases need teacher follow-up. Filter by teacher first to narrow the class list, or choose a class directly.</p>
    </div>
    <div class="teacher-beta-actions">
      <button type="button" class="btn btn-primary btn-sm" onclick="loadTeacherBetaStatus_(true)">Refresh</button>
      <button type="button" class="btn btn-ghost btn-sm" id="teacherBetaDownloadBtn" onclick="downloadTeacherBetaSpreadsheet_()">Download Spreadsheet</button>
      <button type="button" class="btn btn-ghost btn-sm" onclick="copyTeacherBetaMissing_()">Copy Missing Emails</button>
    </div>
  </div>

  <div class="card">
    <div class="teacher-beta-toolbar">
      <div class="field">
        <label>Teacher</label>
        <select id="teacherBetaTeacher">
          <option value="">All teachers</option>
          ${teacherOptions}
        </select>
      </div>
      <div class="field">
        <label>Design Class</label>
        <select id="teacherBetaClass">
          <option value="">All tracked classes</option>
          ${classOptions}
        </select>
      </div>
      <div class="field teacher-beta-search-field">
        <label>Search student</label>
        <input type="search" id="teacherBetaSearch" placeholder="Name, email, case number, status">
      </div>
      <label class="teacher-beta-check"><input type="checkbox" id="teacherBetaMissingOnly"> Missing only</label>
      <div id="teacherBetaMsg" class="inline-msg tc-muted"></div>
    </div>
    <div id="teacherBetaSummary"></div>
    <div id="teacherBetaResults" class="teacher-beta-results">
      <div class="queue-empty alert alert-neutral"><span class="alert-icon">&#128269;</span><span>Loading class submission data...</span></div>
    </div>
  </div>
  `;
}

function renderAdminPage_(user, boot) {
  if (!user.isAdmin) {
    return `
    <div class="card">
      <div class="section-title">&#128274; Access Restricted</div>
      <div class="alert alert-error">
        <span class="alert-icon">&#128274;</span>
        <div>
          <strong>You do not have permission to view this page.</strong><br>
          Signed in as <strong>${escapeHtml_(user.email || 'unknown')}</strong> (${escapeHtml_(user.role || 'guest')}).
          Only admin, teacher, and technician roles can access this area.
        </div>
      </div>
    </div>
    `;
  }

  var roleLabel = user.role === 'technician' ? 'Production Queue' : user.role === 'teacher' ? 'My Students' : 'Submission Dashboard';
  var roleHint  = user.role === 'technician'
    ? '<strong>Process Jobs:</strong> Start with Review Now, inspect the file details, then move jobs through the queue when they are ready.'
    : user.role === 'teacher'
      ? '<strong>Monitor Students:</strong> "My students only" is on by default. Follow up on submitted and needs-fix work first.'
      : '<strong>Admin View:</strong> Use the queue lanes, filters, and review panel to manage submissions without opening the sheet.';
  var roleSteps = user.role === 'technician'
    ? [
        ['Review first', 'Open new and needs-fix jobs before moving anything into production.'],
        ['Inspect evidence', 'Use file links, machine type, notes, and issue templates from the review panel.'],
        ['Decide as human reviewer', 'Set approved, queued, production, or complete only after workshop checks.']
      ]
    : user.role === 'teacher'
      ? [
          ['Start with my students', 'The default view keeps your class list focused and avoids unrelated queue noise.'],
          ['Find learning follow-up', 'Check submitted and needs-fix rows for students who need design feedback.'],
          ['Keep judgement human', 'Use patterns as prompts for teaching, not as automatic grading.']
        ]
      : [
          ['Watch the load', 'Use Queue Health and lanes before changing deadlines or asking for bulk follow-up.'],
          ['Tune rules carefully', 'Manage year-group rules, users, and machines from the admin-only pages.'],
          ['Use audit trail', 'Review role changes and status actions when preparing handover or support.']
        ];
  var roleStepHtml = roleSteps.map(function(step, i) {
    return '<div class="admin-role-step"><span class="admin-role-step-num">' + (i + 1) + '</span><div><div class="admin-role-step-title">' + escapeHtml_(step[0]) + '</div><div class="admin-role-step-copy">' + escapeHtml_(step[1]) + '</div></div></div>';
  }).join('');
  var openSheetButton = user.role === 'admin'
    ? '<button class="btn btn-ghost btn-sm" onclick="openMasterSheet()">Open Sheet</button>'
    : '';
  var yearFilterControl = renderDashboardCheckboxFilter_('filterYear', 'Year', getRuleYearGroupsForUi_(boot).map(function(year) {
    return { value: year, label: year };
  }));
  var machineFilterControl = renderDashboardCheckboxFilter_('filterMachine', 'Machine', [
    { value: 'laser', label: 'Laser' },
    { value: '3d', label: '3D Print' }
  ]);
  var materialFilterControl = renderDashboardCheckboxFilter_('filterMaterial', 'Material', []);
  var statusFilterControl = renderDashboardCheckboxFilter_('filterStatus', 'Status', [
    { value: 'submitted', label: 'Submitted' },
    { value: 'needs_fix', label: 'Needs Fix' },
    { value: 'approved', label: 'Approved' },
    { value: 'in_queue', label: 'In Queue' },
    { value: 'in_production', label: 'In Production' },
    { value: 'completed', label: 'Done' },
    { value: 'rejected', label: 'Rejected' }
  ]);

  return `
  <div class="admin-hero">
    <div>
      <div class="admin-hero-kicker">Fabrication operations</div>
      <h2 class="admin-hero-title">${escapeHtml_(roleLabel)}</h2>
      <div class="admin-hero-sub">${roleHint} Queue pressure, review risk, machine mix, and repeat-submission signals are grouped here for day-to-day workshop decisions.</div>
    </div>
    <div class="admin-hero-actions">
      <button class="btn btn-ghost btn-sm" onclick="previewStudentView()">Student View</button>
      ${openSheetButton}
      <button class="btn btn-primary btn-sm" onclick="refreshAdminRows_()">Refresh</button>
    </div>
  </div>

  <div class="admin-role-steps">${roleStepHtml}</div>

  <div class="card">
    <div class="admin-workboard">
      <div class="admin-workboard-main">
        <div class="admin-section-label">Queue at a glance</div>
        <div class="stats-bar">
          <div class="stat-card" role="button" tabindex="0" onclick="filterByStatus('')" id="statCardAll" data-status="" aria-label="Show all queue records"><div class="stat-num" id="statTotal">&mdash;</div><div class="stat-label">Total</div></div>
          <div class="stat-card" role="button" tabindex="0" onclick="filterByStatus('submitted')" data-status="submitted" aria-label="Filter queue to submitted records"><div class="stat-num pill pill-submitted" id="stat_submitted">&mdash;</div><div class="stat-label">Submitted</div></div>
          <div class="stat-card" role="button" tabindex="0" onclick="filterByStatus('needs_fix')" data-status="needs_fix" aria-label="Filter queue to needs fix records"><div class="stat-num pill pill-needs_fix" id="stat_needs_fix">&mdash;</div><div class="stat-label">Needs Fix</div></div>
          <div class="stat-card" role="button" tabindex="0" onclick="filterByStatus('approved')" data-status="approved" aria-label="Filter queue to approved records"><div class="stat-num pill pill-approved" id="stat_approved">&mdash;</div><div class="stat-label">Approved</div></div>
          <div class="stat-card" role="button" tabindex="0" onclick="filterByStatus('in_queue')" data-status="in_queue" aria-label="Filter queue to in queue records"><div class="stat-num pill pill-in_queue" id="stat_in_queue">&mdash;</div><div class="stat-label">In Queue</div></div>
          <div class="stat-card" role="button" tabindex="0" onclick="filterByStatus('in_production')" data-status="in_production" aria-label="Filter queue to in production records"><div class="stat-num pill pill-in_production" id="stat_in_production">&mdash;</div><div class="stat-label">In Prod</div></div>
          <div class="stat-card" role="button" tabindex="0" onclick="filterByStatus('completed')" data-status="completed" aria-label="Filter queue to completed records"><div class="stat-num pill pill-completed" id="stat_completed">&mdash;</div><div class="stat-label">Done</div></div>
          <div class="stat-card" role="button" tabindex="0" onclick="filterByStatus('rejected')" data-status="rejected" aria-label="Filter queue to rejected records"><div class="stat-num pill pill-rejected" id="stat_rejected">&mdash;</div><div class="stat-label">Rejected</div></div>
        </div>

        <div class="admin-insight-grid">
          <div class="admin-insight" id="insightCardActive"><div class="admin-insight-top"><span class="admin-insight-label">Active Work</span></div><div><div class="admin-insight-value" id="insightActive">&mdash;</div><div class="admin-insight-note" id="insightActiveNote">Awaiting data</div></div></div>
          <div class="admin-insight" id="insightCardReview"><div class="admin-insight-top"><span class="admin-insight-label">Review Now</span></div><div><div class="admin-insight-value" id="insightReview">&mdash;</div><div class="admin-insight-note" id="insightReviewNote">New or needs-fix jobs</div></div></div>
          <div class="admin-insight" id="insightCardProduction"><div class="admin-insight-top"><span class="admin-insight-label">Production Lane</span></div><div><div class="admin-insight-value" id="insightProduction">&mdash;</div><div class="admin-insight-note" id="insightProductionNote">Approved, queued, or in production</div></div></div>
          <div class="admin-insight" id="insightCardOldest"><div class="admin-insight-top"><span class="admin-insight-label">Oldest Active</span></div><div><div class="admin-insight-value" id="insightOldest">&mdash;</div><div class="admin-insight-note" id="insightOldestNote">No active items yet</div></div></div>
          <div class="admin-insight"><div class="admin-insight-top"><span class="admin-insight-label">Special Requests</span></div><div><div class="admin-insight-value" id="insightSpecial">&mdash;</div><div class="admin-insight-note" id="insightSpecialNote">Outside DT coursework</div></div></div>
          <div class="admin-insight"><div class="admin-insight-top"><span class="admin-insight-label">Laser Jobs</span></div><div><div class="admin-insight-value" id="insightLaser">&mdash;</div><div class="admin-insight-note" id="insightLaserNote">Sheet fabrication</div></div></div>
          <div class="admin-insight"><div class="admin-insight-top"><span class="admin-insight-label">3D Print Jobs</span></div><div><div class="admin-insight-value" id="insight3d">&mdash;</div><div class="admin-insight-note" id="insight3dNote">Print queue</div></div></div>
          <div class="admin-insight" id="insightCardRepeat"><div class="admin-insight-top"><span class="admin-insight-label">Repeat Risk</span></div><div><div class="admin-insight-value" id="insightRepeat">&mdash;</div><div class="admin-insight-note" id="insightRepeatNote">Same-day repeat activity</div></div></div>
        </div>
      </div>

      <aside class="admin-health-panel">
        <div class="admin-health-head">
          <div class="admin-health-title">Queue Health</div>
          <span class="admin-health-pill" id="adminHealthPill">Loading</span>
        </div>
        <div class="admin-health-meter"><span class="admin-health-fill" id="adminHealthFill"></span></div>
        <div class="admin-health-copy" id="adminHealthText">Loading current queue pressure.</div>
        <div class="admin-health-list">
          <div class="admin-health-row"><span>Queue workload</span><strong id="healthReview">&mdash;</strong></div>
          <div class="admin-health-row"><span>Production-ready</span><strong id="healthProduction">&mdash;</strong></div>
          <div class="admin-health-row"><span>Waiting on student</span><strong id="healthStudentWait">&mdash;</strong></div>
          <div class="admin-health-row"><span>Repeat flags</span><strong id="healthRepeat">&mdash;</strong></div>
        </div>
      </aside>
    </div>
  </div>

  <div class="card">
    <div class="queue-toolbar">
      <div>
        <div class="queue-toolbar-title">Queue Records</div>
        <div class="queue-toolbar-sub" id="queueSummaryLine">Use focus lanes, filters, search, and sort to narrow the work queue.</div>
      </div>
      <div class="queue-toolbar-actions">
        <label class="queue-case-search"><span>Case search</span><input type="search" id="filterCaseNo" placeholder="M001, A001, or 001" autocomplete="off"></label>
        <div id="adminMsg" class="inline-msg tc-muted"></div>
      </div>
    </div>

    <div class="queue-lane-bar" id="queueLaneBar">
      <button class="lane-btn" type="button" data-lane="" onclick="setQueueLane('')">All Work</button>
      <button class="lane-btn" type="button" data-lane="review" onclick="setQueueLane('review')">Review Now</button>
      <button class="lane-btn" type="button" data-lane="waiting_student" onclick="setQueueLane('waiting_student')">Waiting on Student</button>
      <button class="lane-btn" type="button" data-lane="ready" onclick="setQueueLane('ready')">Ready for Production</button>
      <button class="lane-btn" type="button" data-lane="inprod" onclick="setQueueLane('inprod')">In Production</button>
      <button class="lane-btn" type="button" data-lane="special" onclick="setQueueLane('special')">Special</button>
      <button class="lane-btn" type="button" data-lane="laser" onclick="setQueueLane('laser')">Laser</button>
      <button class="lane-btn" type="button" data-lane="3d" onclick="setQueueLane('3d')">3D Print</button>
      <button class="lane-btn" type="button" data-lane="done" onclick="setQueueLane('done')">Done / Rejected</button>
    </div>

    <div class="filter-bar">
      <div class="field filter-wide"><label>Search Queue</label><input type="text" id="filterQuick" placeholder="Name, email, ID, teacher, material, project"></div>
      <div class="field filter-source"><label>Source</label><select id="filterSource"><option value="">All</option><option value="dt">DT Submissions</option><option value="other">Special Requests</option></select></div>
      ${yearFilterControl}
      ${machineFilterControl}
      ${materialFilterControl}
      ${statusFilterControl}
      <div class="field filter-sort"><label>Sort</label><select id="filterSort"><option value="newest">Newest first</option><option value="priority">Priority</option><option value="time_newest">Newest timestamp</option><option value="oldest">Oldest active</option><option value="updated">Recently updated</option><option value="name">Requester A-Z</option></select></div>
      <div class="field"><label>Teacher</label><select id="filterTeacher"><option value="">All teachers</option></select></div>
      <div class="field"><label>Class</label><input type="text" id="filterClass" placeholder="e.g. 8.1"></div>
      <div class="field"><label>Student</label><input type="text" id="filterStudentEmail" placeholder="Email"></div>
      <div class="filter-meta">
        <label class="teacher-toggle"><input type="checkbox" id="filterMineOnly"> My students only</label>
        <button class="btn btn-ghost btn-sm" onclick="clearAdminFilters_()">Clear</button>
        <button class="btn btn-primary btn-sm" onclick="refreshAdminRows_()">Refresh</button>
      </div>
    </div>
    <div id="adminTable"></div>
  </div>

  `;
}

function renderMachinesPage_() {
  return `
  <div class="machine-page-hero">
    <h3>&#128736; Workshop Machines Guide</h3>
    <p>Everything you need to know about the workshop machines &mdash; what they do, what files they need, and what size limits apply. Review this before your first submission.</p>
    <p style="font-size:12px;opacity:.78;margin-top:6px;">Machine specifications are based on verified manufacturer information. School submission limits and technician approval still apply &mdash; specs do not equal automatic job approval.</p>
    <div class="machine-hero-pills">
      <span class="machine-hero-pill">&#128293; Laser Cutting</span>
      <span class="machine-hero-pill">&#9881; 3D Printing</span>
      <span class="machine-hero-pill">&#128207; Submission Limits</span>
      <span class="machine-hero-pill">&#128221; Report &amp; Process Marks</span>
    </div>
    <div class="machine-anchor-nav">
      <a class="machine-anchor-btn" href="javascript:void(0)" onclick="document.getElementById('machines-laser').scrollIntoView({behavior:'smooth',block:'start'})">&#128293; Laser Cutting Overview</a>
      <a class="machine-anchor-btn" href="javascript:void(0)" onclick="document.getElementById('machines-3d').scrollIntoView({behavior:'smooth',block:'start'})">&#9881; 3D Printing Overview</a>
      <a class="machine-anchor-btn" href="javascript:void(0)" onclick="document.getElementById('machines-limits').scrollIntoView({behavior:'smooth',block:'start'})">&#128207; Size Limits</a>
      <a class="machine-anchor-btn" href="javascript:void(0)" onclick="document.getElementById('machines-workflow').scrollIntoView({behavior:'smooth',block:'start'})">&#128260; Process / Workflow</a>
      <a class="machine-anchor-btn" href="javascript:void(0)" onclick="document.getElementById('machines-report').scrollIntoView({behavior:'smooth',block:'start'})">&#128221; Report &amp; Process Marks</a>
    </div>
  </div>

  <div class="machine-page-grid" id="machines-laser">
    <div class="machine-panel">
      <h3>&#128293; Laser Cutting Machines</h3>
      <p>Laser cutting is a <strong>subtractive manufacturing process</strong>. The machine removes material from a flat sheet using a focused laser beam. In this dashboard, laser jobs must be prepared as <strong>vector-based 2D files</strong> and submitted at the final cutting size.</p>

      <div class="machine-grid">
        <div class="machine-card machine-card--laser">
          <h4>&#128293; GCC LaserPro Spirit LS Pro</h4>
          <div class="machine-type">CO&#8322; Laser Cutter / Engraver</div>
          <p>The primary machine for most laser cutting work. Uses a sealed CO&#8322; laser tube with closed-loop DC servo motors for precise, repeatable cuts on flat sheet materials.</p>

          <div class="machine-spec-highlight">
            <span class="spec-label">Max Working Area</span>
            <span class="spec-value">640 &times; 460 mm</span>
            <span class="spec-extra">(ext. to 740 &times; 460 mm via pass-through)</span>
          </div>

          <table class="machine-spec-table">
            <tr><td>Laser Source</td><td>CO&#8322; sealed tube &mdash; 30 W to 100 W</td></tr>
            <tr><td>Max Engraving Speed</td><td>Up to 3.04 m/s (120 in/s)</td></tr>
            <tr><td>Resolution</td><td>Up to 1 500 dpi</td></tr>
            <tr><td>Z-axis Travel</td><td>165 mm (6.5 in)</td></tr>
            <tr><td>Motor</td><td>Closed-loop DC servo</td></tr>
            <tr><td>Connectivity</td><td>10Base-T Ethernet / USB Type-A 2.0 / USB Type-B 2.0</td></tr>
          </table>

          <div class="machine-card-section">
            <h5>&#127919; Good For</h5>
            <p>Flat parts, packaging nets, models, signage, engraved plates, precision prototyping.</p>
          </div>

          <div class="machine-card-section">
            <h5>&#127979; School Workflow &amp; Approval</h5>
            <div class="machine-school-box">
              <strong>&#9888; School limits apply &mdash; not the machine maximum.</strong><br>
              Y8: 20&times;20 cm &bull; Y9: 60&times;40 cm &bull; Y10: 60&times;40 cm<br>
              File format: .af / .afdesign / .svg / .dxf (as allowed by year group).<br>
              All submissions require technician review before cutting.
            </div>
          </div>

          <div class="machine-card-section">
            <h5>&#128161; Beginner Advice</h5>
            <ul>
              <li>Convert all text to curves/outlines before exporting</li>
              <li>Design at 1:1 real cutting size &mdash; not scaled</li>
              <li>Remove image layers &mdash; the laser follows vector paths only</li>
              <li>Check dimensions against the <em>school year-group limit</em>, not the machine max</li>
            </ul>
          </div>

          <div class="machine-source-note">Source: GCC official brochure &amp; product page.</div>
          <a class="machine-spec-link" href="https://www.gccworld.com/product/laser-engraver/spirit-ls" target="_blank" rel="noopener">&#128279; View full specs on GCC website &rarr;</a>
        </div>

        <div class="machine-card machine-card--laser">
          <h4>&#128293; GCC LaserPro Mercury III</h4>
          <div class="machine-type">CO&#8322; Laser Cutter / Engraver</div>
          <p>A reliable CO&#8322; laser engraver with consistent, high-quality output. Same file-preparation workflow as the Spirit LS Pro. Suitable for batch cutting and general-purpose sheet work.</p>

          <div class="machine-spec-highlight">
            <span class="spec-label">Max Working Area</span>
            <span class="spec-value">635 &times; 458 mm (25 &times; 18 in)</span>
          </div>

          <table class="machine-spec-table">
            <tr><td>Laser Source</td><td>CO&#8322; sealed tube &mdash; 12 W / 30 W / 40 W / 60 W / 80 W</td></tr>
            <tr><td>Resolution</td><td>Up to 1 500 dpi</td></tr>
            <tr><td>Z-axis Travel</td><td>165 mm (6.5 in)</td></tr>
            <tr><td>Motor</td><td>Closed-loop DC servo</td></tr>
            <tr><td>Connectivity</td><td>10Base-T Ethernet / USB Type-A 2.0 / USB Type-B 2.0</td></tr>
          </table>

          <div class="machine-card-section">
            <h5>&#127919; Good For</h5>
            <p>Batch cutting, larger sheet projects, general-purpose sheet work, heavier workloads.</p>
          </div>

          <div class="machine-card-section">
            <h5>&#127979; School Workflow &amp; Approval</h5>
            <div class="machine-school-box">
              <strong>&#9888; School limits still apply.</strong><br>
              The larger bed does not mean any size is accepted &mdash; school year-group limits and technician review are required.<br>
              File format: .af / .afdesign / .svg / .dxf (as allowed by year group).
            </div>
          </div>

          <div class="machine-card-section">
            <h5>&#128161; Beginner Advice</h5>
            <ul>
              <li>Same file preparation as the Spirit LS Pro</li>
              <li>Large files with many paths take longer to cut and queue</li>
              <li>Keep your file clean and free of duplicate or hidden paths</li>
              <li>School size limits still apply even though the machine bed is large</li>
            </ul>
          </div>

          <div class="machine-source-note">Source: GCC official brochure &amp; product page.</div>
          <a class="machine-spec-link" href="https://www.gccworld.com/product/laser-engraver/mercury-iii" target="_blank" rel="noopener">&#128279; View full specs on GCC website &rarr;</a>
        </div>
      </div>

      <div class="machine-stat-grid">
        <div class="machine-stat"><div class="label">Current DT Limits</div><div class="value">Y8: 20 &times; 20 cm<br>Y9: 60 &times; 40 cm<br>Y10: 60 &times; 40 cm</div></div>
        <div class="machine-stat"><div class="label">Typical Materials</div><div class="value">3 mm hard cardboard, cardboard, acrylic</div></div>
        <div class="machine-stat"><div class="label">Accepted Working Files</div><div class="value">.af, .afdesign<br>.svg / .dxf where allowed</div></div>
      </div>
    </div>

    <div class="machine-panel" id="machines-3d">
      <h3>&#9881; 3D Printing Machines</h3>
      <p>3D printing is an <strong>additive manufacturing process</strong>. The machine builds the object layer by layer using filament. In this dashboard, 3D print jobs must be submitted as <strong>STL files</strong> with a screenshot that shows the model dimensions.</p>

      <div class="machine-grid">
        <div class="machine-card machine-card--3d">
          <h4>&#9881; Creality K2 Plus</h4>
          <div class="machine-type">FDM 3D Printer &mdash; Enclosed, Actively Heated Chamber</div>
          <p>High-speed CoreXY 3D printer with an actively heated chamber and dual AI cameras. Supports a wide range of filaments including engineering-grade materials.</p>

          <div class="machine-spec-highlight">
            <span class="spec-label">Max Build Volume</span>
            <span class="spec-value">350 &times; 350 &times; 350 mm</span>
          </div>

          <table class="machine-spec-table">
            <tr><td>Technology</td><td>FDM (Fused Deposition Modeling)</td></tr>
            <tr><td>Max Print Speed</td><td>&le; 600 mm/s</td></tr>
            <tr><td>Acceleration</td><td>&le; 30 000 mm/s&sup2;</td></tr>
            <tr><td>Layer Height</td><td>0.05 &ndash; 0.3 mm</td></tr>
            <tr><td>Nozzle</td><td>0.4 mm &mdash; max 350 &#8451;</td></tr>
            <tr><td>Heatbed</td><td>Max 120 &#8451;</td></tr>
            <tr><td>Chamber</td><td>Actively heated up to 60 &#8451;</td></tr>
            <tr><td>Supported Filaments</td><td>PLA / PETG / TPU / ASA / PET / ABS / PA / PC / CF / GF / PPA-CF / PPS / PPS-CF (1.75 mm)</td></tr>
            <tr><td>Connectivity</td><td>USB / Wi-Fi (dual-band) / Ethernet</td></tr>
          </table>

          <div class="machine-card-section">
            <h5>&#127919; Good For</h5>
            <p>Prototypes, display models, functional parts, mechanisms, multi-material projects.</p>
          </div>

          <div class="machine-card-section">
            <h5>&#127979; School Workflow &amp; Approval</h5>
            <div class="machine-school-box">
              <strong>&#9888; School limit: 30 &times; 30 &times; 30 cm &mdash; NOT the full 350 mm build volume.</strong><br>
              PLA is the standard school material. Other filaments require technician approval.<br>
              Submit: STL file + dimension screenshot showing W &times; H &times; D. Technician review required.
            </div>
          </div>

          <div class="machine-card-section">
            <h5>&#128161; Beginner Advice</h5>
            <ul>
              <li>Check wall thickness and overhangs &mdash; a model that looks correct on screen may not print well</li>
              <li>Include a dimension screenshot with your STL submission</li>
              <li>PLA is the standard school material; other filaments require approval</li>
              <li>Design to the school limit (30&times;30&times;30 cm), not the machine maximum</li>
            </ul>
          </div>

          <div class="machine-source-note">Source: Creality official product &amp; support page.</div>
          <a class="machine-spec-link" href="https://www.creality.com/products/creality-k2-plus-cfs-combo" target="_blank" rel="noopener">&#128279; View full specs on Creality website &rarr;</a>
        </div>

        <div class="machine-card machine-card--3d">
          <h4>&#9881; Flashforge Guider IIs</h4>
          <div class="machine-type">Enclosed FDM 3D Printer</div>
          <p>Enclosed FDM printer with a heated build chamber for reliable, consistent prints. Good for larger or longer-running jobs that benefit from a stable temperature environment. Same STL workflow as the K2 Plus.</p>

          <div class="machine-spec-highlight">
            <span class="spec-label">Max Build Volume</span>
            <span class="spec-value">280 &times; 250 &times; 300 mm</span>
          </div>

          <table class="machine-spec-table">
            <tr><td>Technology</td><td>FDM (Fused Deposition Modeling)</td></tr>
            <tr><td>Nozzle</td><td>0.4 mm</td></tr>
            <tr><td>Chamber</td><td>Enclosed build chamber</td></tr>
            <tr><td>Filament</td><td>PLA (school standard); ABS / PETG may be available <span class="machine-spec-badge machine-spec-badge--guidance">School Guidance</span></td></tr>
          </table>

          <div class="machine-card-section">
            <h5>&#127919; Good For</h5>
            <p>Larger or longer-running prints, stable-temperature jobs, enclosed reliability.</p>
          </div>

          <div class="machine-card-section">
            <h5>&#127979; School Workflow &amp; Approval</h5>
            <div class="machine-school-box">
              <strong>&#9888; School limit: 30 &times; 30 &times; 30 cm &mdash; NOT the full build volume.</strong><br>
              PLA is the standard school material. Machine assignment is decided by the technician based on queue and job requirements.<br>
              Submit: STL file + dimension screenshot showing W &times; H &times; D. Technician review required.
            </div>
          </div>

          <div class="machine-card-section">
            <h5>&#128161; Beginner Advice</h5>
            <ul>
              <li>Same STL workflow as the K2 Plus</li>
              <li>Larger prints take significantly longer &mdash; plan ahead</li>
              <li>Machine assignment is decided by the technician based on queue and job size</li>
              <li>PLA is the standard school material</li>
            </ul>
          </div>

          <div class="machine-source-note">Source: Flashforge official product page.</div>
          <a class="machine-spec-link" href="https://www.flashforge.com/product-detail/flashforge-guider-iis-3d-printer" target="_blank" rel="noopener">&#128279; View full specs on Flashforge website &rarr;</a>
        </div>
      </div>

      <div class="machine-stat-grid">
        <div class="machine-stat"><div class="label">Current DT Limit</div><div class="value">Y10: 30 &times; 30 &times; 30 cm</div></div>
        <div class="machine-stat"><div class="label">Required Submission Files</div><div class="value">STL + dimension screenshot</div></div>
        <div class="machine-stat"><div class="label">Key Design Checks</div><div class="value">wall thickness, overhangs, print time, orientation</div></div>
      </div>
    </div>
  </div>

  <div class="card" id="machines-limits" style="margin-top:20px;">
    <div class="section-title">&#128207; Current Submission Limits</div>
    <div class="section-sub">These are the school-configured limits students must design to when submitting coursework.</div>
    <table class="help-size-table">
      <thead>
        <tr><th>Year / Path</th><th>Machine</th><th>Current Limit</th><th>Material / File Notes</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>Y8 DT</strong></td><td>Laser Cut</td><td>20 &times; 20 cm</td><td>3 mm hard cardboard (white); .af / .afdesign</td></tr>
        <tr><td><strong>Y9 DT</strong></td><td>Laser Cut</td><td>60 &times; 40 cm</td><td>Cardboard or acrylic; .af / .afdesign / .svg / .dxf</td></tr>
        <tr><td><strong>Y10 DT</strong></td><td>Laser Cut</td><td>60 &times; 40 cm</td><td>Cardboard or acrylic; .af / .afdesign</td></tr>
        <tr><td><strong>Y10 DT</strong></td><td>3D Print</td><td>30 &times; 30 &times; 30 cm</td><td>PLA; STL + dimension screenshot</td></tr>
        <tr><td><strong>Special Request</strong></td><td>Laser / 3D</td><td>Case-by-case review</td><td>Still limited by machine capacity, materials, queue, and technician approval</td></tr>
      </tbody>
    </table>
    <div class="alert alert-warning" style="margin-top:12px;">
      <span class="alert-icon">&#9888;</span>
      <div>For reports, do not just write the machine name. Also include the <strong>current working size limit</strong> used for your project, the <strong>material</strong>, and the <strong>file format</strong> you needed to submit.</div>
    </div>
  </div>

  <div class="card" id="machines-workflow" style="margin-top:20px;">
    <div class="section-title">&#128260; Process / Workflow</div>
    <div class="section-sub">Step-by-step workflow from design to finished product &mdash; useful for both submissions and report writing.</div>

    <h4 style="font-size:16px;font-weight:700;margin:0 0 12px;color:var(--navy);">&#128293; Laser Cutting Workflow</h4>
    <div class="machine-process">
      <div class="machine-process-step"><div class="num">1</div><h4>Design in 2D</h4><p>Create a vector drawing in Affinity Designer or another suitable vector tool. Work at 1:1 real cutting size.</p></div>
      <div class="machine-process-step"><div class="num">2</div><h4>Clean the File</h4><p>Remove image layers, convert text to curves, and keep only usable vector paths. Delete hidden objects.</p></div>
      <div class="machine-process-step"><div class="num">3</div><h4>Check Dimensions</h4><p>Confirm width and height are within your year&rsquo;s submission limit before saving.</p></div>
      <div class="machine-process-step"><div class="num">4</div><h4>Submit &amp; Review</h4><p>Upload through the dashboard. The technician checks the file, material choice, and size before the job is queued.</p></div>
    </div>

    <h4 style="font-size:16px;font-weight:700;margin:24px 0 12px;color:var(--navy);">&#9881; 3D Printing Workflow</h4>
    <div class="machine-process">
      <div class="machine-process-step"><div class="num">1</div><h4>Model in 3D</h4><p>Create the part in Tinkercad, Fusion 360, Blender, or another modelling tool. Design for printability.</p></div>
      <div class="machine-process-step"><div class="num">2</div><h4>Check Printability</h4><p>Verify wall thickness, overhangs, and supports. A model that looks good on screen may not print well.</p></div>
      <div class="machine-process-step"><div class="num">3</div><h4>Export STL + Screenshot</h4><p>Export the final model as STL. Capture a screenshot showing width, height, and depth dimensions.</p></div>
      <div class="machine-process-step"><div class="num">4</div><h4>Submit &amp; Slice</h4><p>Upload through the dashboard. The technician reviews printability, then slices, queues, and prints the model.</p></div>
    </div>
  </div>

  <div class="card" id="machines-report" style="margin-top:20px;">
    <div class="section-title">&#128221; Report &amp; Process Marks Guide</div>
    <div class="section-sub">Helps both DT and non-DT students document their learning &mdash; for reports, portfolios, presentations, or annotations.</div>

    <div class="machine-report-grid">
      <div class="machine-report-card">
        <h4>&#128196; Design Process &amp; Decisions</h4>
        <ul>
          <li>Name the exact machine and whether it is additive or subtractive manufacturing</li>
          <li>Explain why this machine was the correct choice for your design</li>
          <li>Note the dimensions used and how they relate to the size limit</li>
          <li>Explain material choice (e.g. cardboard vs acrylic) and file format decisions</li>
          <li>Describe any trade-offs between design intent and manufacturing limits</li>
        </ul>
      </div>
      <div class="machine-report-card">
        <h4>&#128247; Evidence &amp; Screenshots</h4>
        <ul>
          <li>Screenshot of your design file or 3D model in the software</li>
          <li>Dimension view showing width, height (and depth for 3D print)</li>
          <li>Before-and-after screenshots if you revised the design</li>
          <li>Vector path clean-up or STL mesh check evidence</li>
          <li>Photo of the finished fabricated piece if available</li>
        </ul>
      </div>
      <div class="machine-report-card">
        <h4>&#128270; Problems &amp; Reflections</h4>
        <ul>
          <li>Failed attempts or revisions &mdash; what went wrong and what you changed</li>
          <li>File preparation issues (e.g. image layers that had to be removed)</li>
          <li>Dimension mistakes and how you corrected them</li>
          <li>Tolerance, fit, or kerf issues for laser-cut assemblies</li>
          <li>Support or orientation problems for 3D prints</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="card">
    <div class="section-title">&#128269; What To Search / Research</div>
    <div class="section-sub">If you need more information for process marks or background research, start with these topics. They are the keywords students should search and understand.</div>
    <div class="machine-search-list">
      <span class="machine-search-chip">CO2 laser cutter vector file workflow</span>
      <span class="machine-search-chip">laser cutting kerf and tolerance</span>
      <span class="machine-search-chip">laser cutting cut vs engrave</span>
      <span class="machine-search-chip">FDM 3D printing PLA process</span>
      <span class="machine-search-chip">STL file for 3D printing</span>
      <span class="machine-search-chip">3D print supports and orientation</span>
      <span class="machine-search-chip">wall thickness for 3D printing</span>
      <span class="machine-search-chip">additive vs subtractive manufacturing</span>
      <span class="machine-search-chip">prototype manufacturing process</span>
      <span class="machine-search-chip">Affinity Designer vector export</span>
      <span class="machine-search-chip">text to curves vector design</span>
      <span class="machine-search-chip">3D print infill and shell</span>
    </div>
    <div class="alert alert-info" style="margin-top:14px;">
      <span class="alert-icon">&#128161;</span>
      <div>A strong report usually includes the <strong>machine name</strong>, <strong>process type</strong>, <strong>material</strong>, <strong>current size constraint</strong>, <strong>file format</strong>, and <strong>why that process fits the design</strong>.</div>
    </div>
  </div>

  <div class="card">
    <div class="section-title">&#9989; Process Marks Checklist</div>
    <div class="section-sub">Use this quick checklist when writing up your process or preparing your presentation.</div>
    <div class="help-checklist">
      <label><input type="checkbox"> I named the correct machine and process type</label>
      <label><input type="checkbox"> I wrote whether it is additive or subtractive manufacturing</label>
      <label><input type="checkbox"> I included the current project size limit</label>
      <label><input type="checkbox"> I stated the material and required file format</label>
      <label><input type="checkbox"> I explained the process steps from design to production</label>
      <label><input type="checkbox"> I included screenshots, measurements, or production evidence</label>
      <label><input type="checkbox"> I explained why I chose this machine and material</label>
      <label><input type="checkbox"> I documented any problems, revisions, or failed attempts</label>
      <label><input type="checkbox"> I showed file preparation evidence (vector clean-up, STL check, etc.)</label>
    </div>
    <div class="btn-group" style="margin-top:14px;">
      <button class="btn btn-primary" onclick="switchPage('submit')">Go To Submit</button>
      <button class="btn btn-ghost" onclick="switchPage('help')">Open Help &amp; Guidelines</button>
    </div>
  </div>
  `;
}

function renderHelpPage_() {
  return `
  <div class="card">
    <div class="section-title">&#128214; Submission Guidelines</div>
    <div class="section-sub">Everything you need to know before submitting your fabrication file. Read this page carefully &mdash; following these guidelines will help your submission get approved faster. For the full machine guide, use the <strong>Machines</strong> tab in the top navigation.</div>

    <div class="help-toc">
      <div class="help-toc-title">Table of Contents</div>
      <ol>
        <li><a href="javascript:void(0)" onclick="helpJump_('help-before')">Before You Submit</a></li>
        <li><a href="javascript:void(0)" onclick="helpJump_('help-type')">Choose the Correct Submission Type</a></li>
        <li><a href="javascript:void(0)" onclick="helpJump_('help-machines')">Our Machines</a></li>
        <li><a href="javascript:void(0)" onclick="helpJump_('help-laser')">Laser Cutting Requirements</a></li>
        <li><a href="javascript:void(0)" onclick="helpJump_('help-laser-prep')">How to Prepare a Laser Cutting File</a></li>
        <li><a href="javascript:void(0)" onclick="helpJump_('help-3d')">3D Printing Requirements</a></li>
        <li><a href="javascript:void(0)" onclick="helpJump_('help-3d-prep')">How to Prepare a 3D Printing File</a></li>
        <li><a href="javascript:void(0)" onclick="helpJump_('help-sizes')">Size Limits by Year</a></li>
        <li><a href="javascript:void(0)" onclick="helpJump_('help-naming')">File Naming</a></li>
        <li><a href="javascript:void(0)" onclick="helpJump_('help-form')">What to Enter in the Form</a></li>
        <li><a href="javascript:void(0)" onclick="helpJump_('help-checklist')">Submission Checklist</a></li>
        <li><a href="javascript:void(0)" onclick="helpJump_('help-after')">After You Submit</a></li>
        <li><a href="javascript:void(0)" onclick="helpJump_('help-needsfix')">If Your Submission Is Marked &ldquo;Needs Fix&rdquo;</a></li>
        <li><a href="javascript:void(0)" onclick="helpJump_('help-mistakes')">Common Mistakes</a></li>
        <li><a href="javascript:void(0)" onclick="helpJump_('help-tips')">Good Practice Tips</a></li>
        <li><a href="javascript:void(0)" onclick="helpJump_('help-contact')">Need Help?</a></li>
        <li><a href="javascript:void(0)" onclick="helpJump_('help-turnaround')">Turnaround Time &amp; Priority</a></li>
        <li><a href="javascript:void(0)" onclick="helpJump_('help-other')">Special Request</a></li>
        <li><a href="javascript:void(0)" onclick="helpJump_('help-quick')">Quick Reference (6 Key Rules)</a></li>
      </ol>
    </div>
  </div>

  <!-- QUICK-START HERO (always visible) -->
  <div class="qs-hero">
    <h3>&#127891; New Here? Start Here</h3>
    <p class="qs-sub">Whether you&rsquo;re a DT student, a teacher running a club, or from another department &mdash; here&rsquo;s how this system works in 3 simple steps.</p>
    <div class="qs-steps">
      <div class="qs-step">
        <div class="qs-step-icon">&#127919;</div>
        <div class="qs-step-num">1</div>
        <h4>Choose Your Path</h4>
        <p>Use <strong>DT Submit</strong> for DT coursework, or the <strong>Special Request</strong> tab in the navigation for all other departments, clubs &amp; competitions.</p>
      </div>
      <div class="qs-step">
        <div class="qs-step-icon">&#128196;</div>
        <div class="qs-step-num">2</div>
        <h4>Prepare Your File</h4>
        <p>Follow the file guidelines below for your machine type. Use the correct format and check the size limits for your year group.</p>
      </div>
      <div class="qs-step">
        <div class="qs-step-icon">&#128640;</div>
        <div class="qs-step-num">3</div>
        <h4>Submit &amp; Track</h4>
        <p>Fill in the form, upload your file, and submit. Use the <strong>Status</strong> page with your case number to track your request.</p>
      </div>
    </div>
    <div class="qs-divider"></div>
    <div class="qs-audience">
      <div class="qs-audience-card">
        <h4>&#128208; DT Students</h4>
        <ul>
          <li>Choose <strong>DT Submission</strong> on the Submit page</li>
          <li>Prepare your laser (.afdesign) or 3D (.stl) file</li>
          <li>Check the size limits for your year group</li>
          <li>Your DT teacher will be notified automatically</li>
        </ul>
      </div>
      <div class="qs-audience-card">
        <h4>&#127758; Non-DT Departments / Clubs / Competitions</h4>
        <ul>
          <li>Use the <strong>Special Request</strong> tab in the navigation</li>
          <li>Student requests on this pathway are for <strong>Y6-Y12</strong></li>
          <li>Your teacher or sponsor must approve the request</li>
          <li>Describe what you need &mdash; we&rsquo;ll help with the rest</li>
          <li>Great for Science fairs, art projects, robotics &amp; more</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- 1. Before You Submit -->
  <div class="help-section" id="help-before">
    <div class="help-section-title">&#9989; 1. Before You Submit <span class="help-badge-cat help-badge-everyone">Everyone</span></div>
    <p>Please read these instructions carefully before uploading any file. Submitting the correct file the first time helps the technician team review your work faster and reduces delays for everyone.</p>
    <p><strong>Before you upload, make sure you have:</strong></p>
    <ul>
      <li>Checked your design with your <strong>design teacher or technician</strong></li>
      <li>Selected the <strong>correct machine</strong> for your project (laser or 3D)</li>
      <li>Checked that your design fits the <strong>size limit for your year group</strong></li>
      <li>Prepared the <strong>correct working file format</strong> (not a screenshot or image)</li>
      <li>Prepared a <strong>preview image</strong> if required by your year group</li>
      <li>Used a <strong>school email address</strong> (@student.example.edu for students, @example.edu for teachers/staff)</li>
      <li>Entered your <strong>class number</strong> and <strong>teacher name</strong> correctly</li>
    </ul>
    <div class="alert alert-warning" style="margin-top:12px;">
      <span class="alert-icon">&#9888;</span>
      <div>If any of this information is wrong or incomplete, your submission may be marked <strong>Needs Fix</strong> or <strong>Rejected</strong>. Double-check everything before pressing Submit.</div>
    </div>
  </div>

  <!-- 2. Choose the Correct Submission Type -->
  <div class="help-section" id="help-type">
    <div class="help-section-title">&#128296; 2. Choose the Correct Submission Type <span class="help-badge-cat help-badge-everyone">Everyone</span></div>
    <p>You must choose the correct machine before uploading your file. Choosing the wrong machine will cause your submission to be returned.</p>

    <div class="help-grid" style="margin-top:12px;">
      <div class="help-card" style="border-left: 4px solid var(--blue);">
        <h4>&#128293; Laser Cutting</h4>
        <p>Choose <strong>Laser Cutting</strong> if your work will be <strong>cut from sheet material</strong> such as cardboard or acrylic. Your file must be a vector-based Affinity Designer working file.</p>
      </div>
      <div class="help-card" style="border-left: 4px solid var(--amber);">
        <h4>&#9881; 3D Printing</h4>
        <p>Choose <strong>3D Printing</strong> if your work will be <strong>printed as a 3D object</strong>. Your file must be an STL file exported from your 3D modelling software.</p>
      </div>
    </div>

    <div class="alert alert-error" style="margin-top:12px;">
      <span class="alert-icon">&#10060;</span>
      <div>Do <strong>NOT</strong> upload a laser cutting file to the 3D printing section, and do <strong>NOT</strong> upload a 3D model to the laser cutting section. Mismatched files will be rejected.</div>
    </div>
    <p style="font-size:12px;color:var(--slate);margin-top:10px;">To start a submission, go to the <a href="javascript:void(0)" onclick="switchPage('submit')" style="font-weight:700;">DT Submit</a> page for DT coursework or the <a href="javascript:void(0)" onclick="switchPage('other')" style="font-weight:700;">Special Request</a> page for non-DT work.</p>
  </div>

  <!-- 3. Our Machines -->
  <div class="help-section" id="help-machines">
    <div class="help-section-title">&#128736; 3. Our Machines <span class="help-badge-cat help-badge-everyone">Everyone</span></div>
    <p>The Design Fabrication workshop operates the following machines. Understanding what each machine does will help you choose the right submission type and prepare your file correctly. For the full machine guide, size-limit summary, and report checklist, open the <strong>Machines</strong> page in the top navigation.</p>

    <div class="machine-grid">
      <div class="machine-card machine-card--laser">
        <h4>&#128293; GCC LaserPro Spirit LS Pro</h4>
        <div class="machine-type">CO&#8322; Laser Cutter / Engraver</div>
        <p>Desktop CO&#8322; laser for precise cutting and engraving on flat sheet materials such as cardboard and acrylic.</p>
        <ul>
          <li>Max working area: <strong>640 &times; 460 mm</strong> (ext. to 740 &times; 460 mm)</li>
          <li>Cuts through sheet material along vector paths</li>
          <li>Requires vector working files (.af, .afdesign, .svg, .dxf)</li>
        </ul>
      </div>
      <div class="machine-card machine-card--laser">
        <h4>&#128293; GCC LaserPro Mercury III</h4>
        <div class="machine-type">CO&#8322; Laser Cutter / Engraver</div>
        <p>Reliable CO&#8322; laser engraver for batch cutting and larger sheet projects.</p>
        <ul>
          <li>Max working area: <strong>635 &times; 458 mm</strong></li>
          <li>Same file requirements as Spirit LS Pro</li>
          <li>Used for higher-volume or bigger projects</li>
        </ul>
      </div>
      <div class="machine-card machine-card--3d">
        <h4>&#9881; Creality K2 Plus</h4>
        <div class="machine-type">FDM 3D Printer &mdash; Enclosed, Heated Chamber</div>
        <p>High-speed CoreXY FDM printer that builds objects layer by layer. Supports a wide range of filaments.</p>
        <ul>
          <li>Max build volume: <strong>350 &times; 350 &times; 350 mm</strong></li>
          <li>Prints 3D objects from STL files</li>
          <li>Good for prototypes, models, and functional parts</li>
        </ul>
      </div>
      <div class="machine-card machine-card--3d">
        <h4>&#9881; Flashforge Guider IIs</h4>
        <div class="machine-type">Enclosed FDM 3D Printer</div>
        <p>Enclosed FDM printer with a heated chamber for reliable, consistent 3D prints.</p>
        <ul>
          <li>Max build volume: <strong>280 &times; 250 &times; 300 mm</strong></li>
          <li>Prints 3D objects from STL files</li>
          <li>Enclosed design for stable print quality</li>
        </ul>
      </div>
    </div>

    <div class="alert alert-warning" style="margin-top:12px;">
      <span class="alert-icon">&#9888;</span>
      <div><strong>Machine specs &ne; automatic job approval.</strong> School limits, technician review, file readiness, material suitability, safety, and queue load all factor into whether a job is approved. Non-DT requests may have additional review constraints.</div>
    </div>
    <div class="alert alert-info" style="margin-top:8px;">
      <span class="alert-icon">&#128161;</span>
      <div>All laser work requires <strong>vector files</strong>. All 3D printing requires <strong>STL files</strong>. If you are unsure which machine your project needs, ask your teacher.</div>
    </div>
    <div style="margin-top:10px;text-align:center;">
      <a class="btn btn-ghost btn-sm" href="javascript:void(0)" onclick="switchPage('machines')" style="margin-right:8px;">&#128736; Full Machines Guide &amp; Specifications</a>
    </div>
  </div>

  <!-- 4. Laser Cutting Requirements -->
  <div class="help-section" id="help-laser">
    <div class="help-section-title">&#128293; 4. Laser Cutting Requirements <span class="help-badge-cat help-badge-dt">DT Students</span></div>
    <p>All laser cut submissions must follow these rules precisely. Files that do not meet these requirements will be returned for correction.</p>

    <h4>&#9989; Required Working File</h4>
    <p>Upload an <strong>Affinity Designer working file</strong> (or for Y9+, a vector file):</p>
    <ul class="do-list">
      <li><span><strong>.af</strong> &mdash; Affinity Designer file</span></li>
      <li><span><strong>.afdesign</strong> &mdash; Affinity Designer file</span></li>
      <li><span><strong>.svg</strong> &mdash; Scalable Vector Graphics (Y9+)</span></li>
      <li><span><strong>.dxf</strong> &mdash; AutoCAD Drawing Exchange Format (Y9+)</span></li>
    </ul>
    <p><strong>Important:</strong> Upload <strong>one working file only</strong> for each submission. For laser cutting, that file must contain <strong>one page / one artboard only</strong>. If your project needs a second page, submit that second page as a <strong>new job</strong> so it enters the queue separately.</p>

    <h4>&#10060; Do NOT Upload These as Your Working File</h4>
    <p>The following file types are <strong>not accepted</strong> as the main laser cutting file:</p>
    <ul class="dont-list">
      <li><span>.png, .jpg, .jpeg &mdash; image files</span></li>
      <li><span>.pdf &mdash; PDF documents</span></li>
      <li><span>Screenshots or preview images</span></li>
      <li><span>Any non-editable image format</span></li>
    </ul>

    <h4>&#128207; Your Laser File Must</h4>
    <ul>
      <li>Be built using <strong>vector paths only</strong> (no raster / pixel / image layers)</li>
      <li>Be exported or saved as the <strong>whole document / whole artboard</strong></li>
      <li>Be prepared at the <strong>correct final size</strong> (not scaled up or down later)</li>
      <li>Not contain embedded photographs, scanned images, or bitmap fills</li>
    </ul>

    <div class="alert alert-warning" style="margin-top:10px;">
      <span class="alert-icon">&#9888;</span>
      <div>If you only export part of your artwork, or if your file contains images instead of vectors, your job <strong>cannot be manufactured</strong> and will be returned.</div>
    </div>

    <h4>&#128248; Preview Image (If Required)</h4>
    <p>Some year groups or assignments require a preview image showing what your design should look like. Accepted preview image types:</p>
    <ul>
      <li><span class="help-badge help-badge-ok">.png</span> <span class="help-badge help-badge-ok">.jpg</span> <span class="help-badge help-badge-ok">.jpeg</span></li>
    </ul>
    <p>Upload this <strong>in addition to</strong> your working file, not instead of it.</p>
  </div>

  <!-- 5. How to Prepare a Laser Cutting File -->
  <div class="help-section" id="help-laser-prep">
    <div class="help-section-title">&#128221; 5. How to Prepare a Laser Cutting File <span class="help-badge-cat help-badge-dt">DT Students</span></div>
    <p>This section is for <strong>beginners and non-DT users</strong> who may not have used Affinity Designer or laser cutting before. If you are an experienced DT student, you can skip to the next section.</p>

    <h4>&#9989; Step-by-Step: From Design to Working File</h4>
    <ol>
      <li><strong>Create your design in Affinity Designer</strong> (or another vector editor). Use only vector shapes and curves &mdash; no photos, pixel layers, or raster images.</li>
      <li><strong>Set your artboard / document size</strong> to exactly the size you want to cut (e.g. 20 &times; 20 cm for Y8). Use the correct units.</li>
      <li><strong>Check all paths are closed</strong>. Open paths can confuse the laser cutter. Use the Node Tool to close any open curves.</li>
      <li><strong>Convert any text to curves</strong>: Select text, then <em>Layer &gt; Convert to Curves</em>. This prevents font issues on the laser computer.</li>
      <li><strong>Remove any hidden layers or unused objects</strong> to keep the file clean.</li>
      <li><strong>Save the working file</strong>: <em>File &gt; Save As</em> and choose <strong>.afdesign</strong> format. This is your working file to upload.</li>
      <li><strong>Export a preview image</strong>: <em>File &gt; Export</em>, choose PNG, and save. Upload this as your preview.</li>
    </ol>

    <h4>&#9888; Common Beginner Mistakes</h4>
    <ul>
      <li>Uploading a screenshot or photo instead of the editable .afdesign file</li>
      <li>Leaving pixel / image layers in the file (the laser cannot read these)</li>
      <li>Exporting only a selection instead of the whole document</li>
      <li>Forgetting to convert text to curves</li>
      <li>Designing at the wrong size (e.g. too small and then scaling up later)</li>
    </ul>

    <div class="alert alert-info" style="margin-top:12px;">
      <span class="alert-icon">&#128161;</span>
      <div>If you have never used Affinity Designer before, ask your teacher or the DT technician for a quick walkthrough before starting.</div>
    </div>
  </div>

  <!-- 6. 3D Printing Requirements -->
  <div class="help-section" id="help-3d">
    <div class="help-section-title">&#9881; 6. 3D Printing Requirements <span class="help-badge-cat help-badge-dt">DT Students</span></div>
    <p>All 3D print submissions must follow these rules. Incomplete or incorrect submissions will be returned.</p>

    <h4>&#9989; Required Working File</h4>
    <p>Upload a valid <strong>STL file</strong>:</p>
    <ul class="do-list">
      <li><span><strong>.stl</strong> &mdash; Standard Tessellation Language file</span></li>
    </ul>
    <p><strong>Important:</strong> Upload <strong>one STL working file only</strong> per submission. If you need to print another separate file or version, send it as a <strong>new submission</strong> so it joins the queue separately.</p>

    <h4>&#128207; Your 3D Print Submission Should Also Include</h4>
    <ul>
      <li>A <strong>dimension screenshot</strong> showing the size of your model (width &times; height &times; depth)</li>
      <li>The correct <strong>overall dimensions</strong> in centimetres</li>
      <li>The correct <strong>material selection</strong>, if applicable</li>
    </ul>

    <h4>&#128269; Before Uploading Your STL</h4>
    <p>Please check that:</p>
    <ul>
      <li>The model is the <strong>final version</strong> (not a draft or test)</li>
      <li>The model is the <strong>correct size</strong> in your 3D software</li>
      <li>The model is <strong>not missing any important parts</strong></li>
      <li>The file <strong>opens correctly</strong> in your 3D software without errors</li>
      <li>The model is <strong>suitable for printing</strong> (no impossible overhangs, thin walls, etc.)</li>
    </ul>

    <div class="alert alert-warning" style="margin-top:10px;">
      <span class="alert-icon">&#9888;</span>
      <div>If your STL cannot be opened or appears incomplete/corrupted, your submission will be returned for correction.</div>
    </div>
  </div>

  <!-- 7. How to Prepare a 3D Printing File -->
  <div class="help-section" id="help-3d-prep">
    <div class="help-section-title">&#128221; 7. How to Prepare a 3D Printing File <span class="help-badge-cat help-badge-dt">DT Students</span></div>
    <p>This section is for <strong>beginners who have not submitted a 3D print before</strong>. If you are experienced with 3D modelling software, you can skip ahead.</p>

    <h4>&#9989; Step-by-Step: From Model to STL</h4>
    <ol>
      <li><strong>Design your model</strong> in 3D modelling software (e.g. Tinkercad, Fusion 360, SketchUp, or Blender). Think about whether your model can physically stand and print without impossible overhangs.</li>
      <li><strong>Check dimensions</strong> in your software. Make sure width, height, and depth are within the allowed limits for your year group.</li>
      <li><strong>Export as STL</strong>: Go to <em>File &gt; Export</em> (or equivalent) and choose <strong>STL</strong> format. Binary STL is preferred over ASCII for smaller file sizes.</li>
      <li><strong>Take a dimension screenshot</strong> from your 3D software showing the model with its measurements visible. Save as PNG or JPG.</li>
      <li><strong>Open and verify your STL</strong> in a free viewer (e.g. the Windows 3D Viewer or an online STL viewer) to confirm it looks correct before uploading.</li>
    </ol>

    <h4>&#9888; Common Beginner Mistakes</h4>
    <ul>
      <li>Exporting the wrong file type (e.g. .obj, .3mf) instead of .stl</li>
      <li>Model is far too small or too large because units were wrong</li>
      <li>Model has paper-thin walls that will break during or after printing</li>
      <li>Model has floating parts not connected to the main body</li>
      <li>No dimension screenshot provided &mdash; the technician cannot verify size</li>
    </ul>

    <div class="alert alert-info" style="margin-top:12px;">
      <span class="alert-icon">&#128161;</span>
      <div>If you are new to 3D modelling, <strong>Tinkercad</strong> (free, browser-based) is the easiest way to start. Ask your teacher for guidance on which software to use.</div>
    </div>
  </div>

  <!-- 8. Size Limits by Year -->
  <div class="help-section" id="help-sizes">
    <div class="help-section-title">&#128207; 8. Size Limits by Year <span class="help-badge-cat help-badge-everyone">Everyone</span></div>
    <p><strong>Always check your dimensions before submitting.</strong> Files that exceed the allowed size for your year group will be marked Needs Fix or Rejected until corrected.</p>

    <table class="help-size-table">
      <thead>
        <tr><th>Year &amp; Machine</th><th>Maximum Size</th><th>Material</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>Y8 Laser</strong></td><td>20 &times; 20 cm</td><td>3mm Hard Cardboard (White)</td></tr>
        <tr><td><strong>Y9 Laser</strong></td><td>60 &times; 40 cm</td><td>Cardboard or Acrylic</td></tr>
        <tr><td><strong>Y10 Laser</strong></td><td>60 &times; 40 cm</td><td>Cardboard or Acrylic</td></tr>
        <tr><td><strong>Y10 3D Print</strong></td><td>30 &times; 30 &times; 30 cm</td><td>PLA</td></tr>
      </tbody>
    </table>

    <div class="alert alert-info" style="margin-top:10px;">
      <span class="alert-icon">&#128161;</span>
      <div>If you are unsure about the size limit for your assignment, ask your design teacher before submitting.</div>
    </div>
    <div class="alert alert-warning" style="margin-top:10px;">
      <span class="alert-icon">&#128301;</span>
      <div><strong>Non-DT / Special Requests:</strong> If you are submitting through the <em>Special Request</em> pathway (not regular DT coursework), there is no fixed year-group size limit &mdash; but all projects are still constrained by machine bed size and available materials. Include accurate dimensions in your request so the technician can assess feasibility.</div>
    </div>
  </div>

  <!-- 9. File Naming -->
  <div class="help-section" id="help-naming">
    <div class="help-section-title">&#128196; 9. File Naming <span class="help-badge-cat help-badge-everyone">Everyone</span></div>
    <p>Use a clear and consistent file name so the technician team can identify your work quickly.</p>

    <h4>&#9989; Recommended Format</h4>
    <p><strong>Year + Name + Material / Version</strong></p>
    <ul class="do-list">
      <li><span><code>Y8_ChanTaiMan_3mm.afdesign</code></span></li>
      <li><span><code>Y10_LokWaiYan_final.stl</code></span></li>
      <li><span><code>Y9_SampleStudent_acrylic_v2.svg</code></span></li>
    </ul>

    <h4>&#10060; Do NOT Use Vague Names</h4>
    <ul class="dont-list">
      <li><span><code>design final final</code></span></li>
      <li><span><code>new one</code></span></li>
      <li><span><code>untitled</code></span></li>
      <li><span><code>screenshot</code></span></li>
      <li><span><code>IMG_2847.png</code></span></li>
    </ul>
    <p>A clear file name helps the technician identify your work without opening the file.</p>
  </div>

  <!-- 10. What to Enter in the Form -->
  <div class="help-section" id="help-form">
    <div class="help-section-title">&#128221; 10. What to Enter in the Form <span class="help-badge-cat help-badge-everyone">Everyone</span></div>
    <p>Please fill in the submission form carefully. Incorrect or missing information will delay your submission.</p>

    <div class="help-grid" style="margin-top:10px;">
      <div class="help-card">
        <h4>&#128100; Student Details</h4>
        <ul>
          <li>Your <strong>school email</strong> (studentID@student.example.edu or teacher@example.edu)</li>
          <li>Your <strong>full name</strong></li>
          <li>Your <strong>design class number</strong> (e.g. 8.1)</li>
          <li>Your <strong>teacher name</strong> (select from dropdown)</li>
          <li>Your <strong>year group</strong> (Y8, Y9, or Y10)</li>
        </ul>
      </div>
      <div class="help-card">
        <h4>&#128296; Machine &amp; Material</h4>
        <ul>
          <li>The correct <strong>machine</strong> (Laser or 3D)</li>
          <li>The correct <strong>material</strong></li>
          <li>Your design <strong>dimensions</strong></li>
        </ul>
      </div>
      <div class="help-card">
        <h4>&#128206; Files</h4>
        <ul>
          <li>Your <strong>working file</strong> (.af/.afdesign/.svg/.dxf or .stl)</li>
          <li>A <strong>preview image / screenshot</strong> if required</li>
        </ul>
      </div>
      <div class="help-card">
        <h4>&#128172; Additional Notes</h4>
        <p>Use the notes box only for useful extra information:</p>
        <ul>
          <li>&ldquo;This is version 2 after teacher feedback.&rdquo;</li>
          <li>&ldquo;The acrylic colour can be random.&rdquo;</li>
          <li>&ldquo;The model has two interlocking parts.&rdquo;</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- 11. Submission Checklist -->
  <div class="help-section" id="help-checklist">
    <div class="help-section-title">&#9745; 11. Submission Checklist <span class="help-badge-cat help-badge-everyone">Everyone</span></div>
    <p>Before pressing <strong>Submit</strong>, work through every item below. Tick each box as you confirm it.</p>

    <div class="help-checklist">
      <div class="help-checklist-title">&#128100; General</div>
      <label><input type="checkbox"> I used a <strong>school email address</strong></label>
      <label><input type="checkbox"> I entered my <strong>name, class, and teacher</strong> correctly</label>
      <label><input type="checkbox"> I selected the correct <strong>year group</strong></label>
      <label><input type="checkbox"> I selected the correct <strong>machine</strong> (Laser or 3D)</label>
      <label><input type="checkbox"> I selected the correct <strong>material</strong></label>
      <label><input type="checkbox"> I uploaded <strong>one working file only</strong> for this submission</label>
    </div>

    <div class="help-checklist">
      <div class="help-checklist-title">&#128293; Laser Cutting</div>
      <label><input type="checkbox"> I uploaded an <strong>.af or .afdesign</strong> file</label>
      <label><input type="checkbox"> My file uses <strong>vector paths only</strong> (no images/raster layers)</label>
      <label><input type="checkbox"> My file is the <strong>whole document / whole artboard</strong></label>
      <label><input type="checkbox"> My laser file contains <strong>one page / one artboard only</strong></label>
      <label><input type="checkbox"> My design is within the <strong>size limit</strong> for my year</label>
      <label><input type="checkbox"> I uploaded a <strong>preview image</strong> if required</label>
    </div>

    <div class="help-checklist">
      <div class="help-checklist-title">&#9881; 3D Printing</div>
      <label><input type="checkbox"> I uploaded a valid <strong>.stl</strong> file</label>
      <label><input type="checkbox"> This submission contains <strong>one STL working file only</strong></label>
      <label><input type="checkbox"> I checked my <strong>model dimensions</strong> in my 3D software</label>
      <label><input type="checkbox"> I uploaded a <strong>dimension screenshot</strong></label>
      <label><input type="checkbox"> My model is within the <strong>size limit</strong></label>
      <label><input type="checkbox"> My model is the <strong>final version</strong> and opens correctly</label>
    </div>

    <div class="alert alert-info" style="margin-top:10px;">
      <span class="alert-icon">&#128161;</span>
      <div>If you are not sure about any item, <strong>check with your teacher before submitting</strong>.</div>
    </div>
  </div>

  <!-- 12. After You Submit -->
  <div class="help-section" id="help-after">
    <div class="help-section-title">&#128270; 12. After You Submit <span class="help-badge-cat help-badge-everyone">Everyone</span></div>
    <p>After submission, you will receive a <strong>case number</strong>. Save this number &mdash; you can use it on the <strong>Lookup</strong> page and quote it when asking for help.</p>
    <p>Your submission status will change as it is reviewed and processed by the technician team. You will also receive <strong>email notifications</strong> when your status changes.</p>

    <h4>Status Meanings</h4>
    <div class="help-status-grid">
      <div class="help-status-item"><strong><span class="pill pill-submitted">Submitted</span></strong><p>Your file has been received and is waiting for review by the technician team.</p></div>
      <div class="help-status-item"><strong><span class="pill pill-needs_fix">Needs Fix</span></strong><p>There is a problem with your submission. Check the remarks carefully and correct the file before submitting again.</p></div>
      <div class="help-status-item"><strong><span class="pill pill-approved">Approved</span></strong><p>Your file has passed review and is ready to move into the production queue.</p></div>
      <div class="help-status-item"><strong><span class="pill pill-in_queue">In Queue</span></strong><p>Your file has been approved and is waiting in line for production.</p></div>
      <div class="help-status-item"><strong><span class="pill pill-in_production">In Production</span></strong><p>Your file is currently being fabricated on the machine.</p></div>
      <div class="help-status-item"><strong><span class="pill pill-completed">Completed</span></strong><p>Your work is finished! Collect it from the fabrication area or follow your teacher\\u2019s instructions.</p></div>
      <div class="help-status-item"><strong><span class="pill pill-rejected">Rejected</span></strong><p>Your submission cannot proceed. Read the remarks and speak to your teacher for guidance.</p></div>
    </div>
  </div>

  <!-- 13. If Your Submission Is Marked "Needs Fix" -->
  <div class="help-section" id="help-needsfix">
    <div class="help-section-title">&#128295; 13. If Your Submission Is Marked &ldquo;Needs Fix&rdquo; <span class="help-badge-cat help-badge-everyone">Everyone</span></div>
    <p><strong>Do not panic</strong> &mdash; this usually means your file can be corrected and submitted again. Most issues are quick to fix.</p>

    <h4>What to do:</h4>
    <ol>
      <li>Open the <strong>Lookup</strong> page</li>
      <li>Find your submission and read the <strong>remarks / issue notes</strong> carefully</li>
      <li>Fix the file <strong>exactly as requested</strong></li>
      <li>Speak to your <strong>teacher</strong> if you do not understand the problem</li>
      <li>Submit the <strong>corrected file</strong> as a new submission</li>
    </ol>

    <div class="alert alert-error" style="margin-top:10px;">
      <span class="alert-icon">&#10060;</span>
      <div>Do <strong>NOT</strong> simply re-upload the same incorrect file. Read the remarks first and make the required changes.</div>
    </div>
  </div>

  <!-- 14. Common Mistakes -->
  <div class="help-section" id="help-mistakes">
    <div class="help-section-title">&#9888; 14. Common Mistakes <span class="help-badge-cat help-badge-everyone">Everyone</span></div>
    <p>These are the most common reasons submissions are returned. Avoid these to get your work approved faster.</p>

    <div class="help-grid" style="margin-top:10px;">
      <div class="help-card" style="border-top: 3px solid var(--red);">
        <h4>&#128293; Laser Cutting Mistakes</h4>
        <ul>
          <li>Uploading a <strong>PNG/JPG/PDF</strong> instead of the Affinity working file</li>
          <li>Exporting only <strong>part of the artboard</strong> instead of the whole document</li>
          <li>Using <strong>image layers / pixel layers</strong> instead of vector paths</li>
          <li><strong>Exceeding the size limit</strong> for your year group</li>
          <li>Forgetting to upload a <strong>preview image</strong> when required</li>
          <li>Entering the <strong>wrong year group</strong> or <strong>wrong material</strong></li>
          <li>Using a <strong>personal email</strong> instead of a school email</li>
          <li>Uploading the file with a <strong>vague name</strong> (e.g. &ldquo;untitled&rdquo;)</li>
        </ul>
      </div>
      <div class="help-card" style="border-top: 3px solid var(--red);">
        <h4>&#9881; 3D Printing Mistakes</h4>
        <ul>
          <li>Uploading the <strong>wrong file type</strong> (not .stl)</li>
          <li>STL file <strong>cannot be opened</strong> or is corrupted</li>
          <li><strong>No dimension screenshot</strong> provided</li>
          <li>Model <strong>exceeds the allowed size</strong> for the printer</li>
          <li>Model is <strong>incomplete</strong> or not ready for print</li>
          <li>Model has <strong>impossible geometry</strong> (floating parts, paper-thin walls)</li>
          <li>Estimated <strong>print time is too long</strong></li>
        </ul>
      </div>
    </div>
  </div>

  <!-- 15. Good Practice Tips -->
  <div class="help-section" id="help-tips">
    <div class="help-section-title">&#128161; 15. Good Practice Tips <span class="help-badge-cat help-badge-everyone">Everyone</span></div>
    <p>Follow these tips to help your submission get approved faster and with fewer revisions.</p>
    <ul>
      <li>&#9989; Check with your teacher <strong>before</strong> you upload</li>
      <li>&#9989; Keep your file <strong>clean and organised</strong> (remove unused layers, objects)</li>
      <li>&#9989; Use <strong>clear layer names</strong> if your design has multiple parts</li>
      <li>&#9989; Double-check <strong>dimensions</strong> before export</li>
      <li>&#9989; Keep your file name <strong>clear and professional</strong></li>
      <li>&#9989; Upload the <strong>final version</strong>, not a draft or work-in-progress</li>
      <li>&#9989; Read <strong>all remarks</strong> carefully if your file is returned</li>
      <li>&#9989; Save a <strong>backup copy</strong> of your file before submitting</li>
      <li>&#9989; Start your submission <strong>early</strong> &mdash; do not wait until the deadline</li>
    </ul>
  </div>

  <!-- 16. Need Help? -->
  <div class="help-section" id="help-contact">
    <div class="help-section-title">&#128172; 16. Need Help? <span class="help-badge-cat help-badge-everyone">Everyone</span></div>
    <p>If you are unsure about <strong>file format, dimensions, export method</strong>, or whether your file is ready, please speak to:</p>
    <ul>
      <li>Your <strong>design teacher</strong> (for design questions and file preparation)</li>
      <li>The <strong>technician / workshop team</strong> (for machine and production questions)</li>
    </ul>
    <div class="alert alert-info" style="margin-top:10px;">
      <span class="alert-icon">&#128161;</span>
      <div>If your submission is marked <strong>Needs Fix</strong> or <strong>Rejected</strong>, always read the remarks first before asking for help. The remarks explain exactly what needs to be changed.</div>
    </div>
  </div>

  <!-- 17. Turnaround Time & Priority -->
  <div class="help-section" id="help-turnaround">
    <div class="help-section-title">&#9200; 17. Turnaround Time &amp; Priority <span class="help-badge-cat help-badge-everyone">Everyone</span></div>
    <p>` + APP.uiText.turnaroundHelpIntro + `</p>

    <h4>&#128197; ` + APP.uiText.turnaroundHelpSubheading + `</h4>
    <p>` + APP.uiText.turnaroundHelpSubheadingDetail + `</p>
    ` + renderWorkflowList_(APP.uiText.turnaroundHelpWorkflowSteps) + `

    <h4>&#128200; What Affects Turnaround Time?</h4>
    ` + renderBulletList_(APP.uiText.turnaroundHelpFactors) + `

    <h4>&#127919; Priority Guidelines</h4>
    ` + renderBulletList_(APP.uiText.turnaroundPriorityRules) + `

    <h4>&#128161; How to Get Your Work Done Faster</h4>
    <ul>
    ` + APP.uiText.turnaroundTips.map(function(t) { return '  <li>&#9989; ' + t + '</li>'; }).join('\n    ') + `
    </ul>

    <div class="alert alert-warning" style="margin-top:12px;">
      <span class="alert-icon">&#9888;</span>
      <div>` + APP.uiText.turnaroundHelpWarning + `</div>
    </div>
  </div>

  <!-- 18. Other / Special Requests -->
  <div class="help-section" id="help-other">
    <div class="help-section-title">&#128301; 18. Special Request <span class="help-badge-cat help-badge-nondt">Non-DT</span></div>
    <p>${APP.uiText.otherRequestHelpIntro}</p>

    <h4>&#128161; Who Should Use This Pathway?</h4>
    <p>Use the <strong>Special Request</strong> page (not the regular DT Submit page) if your fabrication need falls outside normal DT coursework. Student requests on this pathway are intended for <strong>Y6-Y12</strong> and should include teacher or sponsor approval. This includes:</p>
    ` + renderBulletList_(APP.uiText.otherRequestHelpEligible) + `

    <h4>&#128221; What You Need</h4>
    <p>Before submitting a Special Request, make sure you have:</p>
    ` + renderBulletList_(APP.uiText.otherRequestHelpRequired) + `

    <h4>&#9888;&#65039; Priority &amp; Expectations</h4>
    ` + renderDisclaimerBox_('Priority Notice', APP.uiText.otherRequestPriorityNotice + '<br><br>' + APP.uiText.otherRequestNoGuarantee, 'warning') + `

    <h4>&#128197; Workflow</h4>
    <p>Special Requests follow a similar workflow to DT submissions:</p>
    ` + renderWorkflowList_(APP.uiText.otherRequestWorkflowSteps) + `

    <div class="alert alert-info" style="margin-top:10px;">
      <span class="alert-icon">&#128161;</span>
      <div>To submit a Special Request, go to the <strong>Special Request</strong> tab in the navigation bar. For machine details, size limits, and workflow information, see the <a href="javascript:void(0)" onclick="switchPage('machines')" style="font-weight:700;">Machines Guide</a>.</div>
    </div>
  </div>

  <!-- 19. Quick Reference -->
  <div class="help-quick-ref" id="help-quick">
    <h3>&#9889; Quick Reference &mdash; 6 Key Rules</h3>
    <p style="opacity:.8;font-size:13px;margin-bottom:10px;">If you only remember six things, remember these:</p>
    <ol>
      <li>Choose the <strong>correct machine</strong> (Laser or 3D Print)</li>
      <li>Upload the <strong>correct working file type</strong> (.af / .afdesign for laser, .stl for 3D)</li>
      <li>Keep within the <strong>size limit for your year group</strong></li>
      <li>Upload the <strong>whole file</strong>, not a screenshot or partial export</li>
      <li>Check <strong>Lookup</strong> after submission for updates and remarks</li>
      <li>` + APP.uiText.turnaroundQuickRule + `</li>
    </ol>
  </div>
  `;
}

function renderRulesPage_(boot) {
  var yearOptions = renderRuleYearOptionsForUi_(boot, '— Select year —');
  return `
  <div class="card">
    <div class="section-title">&#128200; Queue Throughput</div>
    <div class="section-sub">Admin-only 30-day graph showing how many tasks were submitted each day and how many were finished that day. Counts combine DT submissions and Special Requests.</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:12px;">
      <button class="btn btn-ghost btn-sm" onclick="loadRulesQueueThroughput()">&#8635; Refresh Graph</button>
    </div>
    <div id="rulesQueueThroughputMsg" class="inline-msg tc-muted"></div>
    <div id="rulesQueueThroughput" style="margin-top:12px;">Loading queue throughput...</div>
  </div>

  <div class="card">
    <div class="section-title">&#9881; Rules Configuration</div>
    <div class="section-sub">View fabrication rules and manage submission deadlines or cutoffs for specific DT classes and year groups.</div>
    <div id="rulesMsg" class="inline-msg tc-muted"></div>
    <div id="rulesTable" style="margin-top:12px;overflow-x:auto;"></div>
    <div style="margin-top:12px;">
      <button class="btn btn-ghost btn-sm" onclick="openMasterSheet()">&#128196; Edit in Sheet</button>
      <button class="btn btn-ghost btn-sm" onclick="loadRulesTable()" style="margin-left:8px;">&#8635; Refresh</button>
    </div>
  </div>

  <div class="card" style="margin-top:16px;">
    <div class="section-title">&#128274; Submission Deadlines &amp; Cutoff</div>
    <div class="section-sub">DT coursework only. Leave Class No. blank to apply the control to the whole year group. Students see the matching deadline directly under Student Details after choosing their year group and class.</div>
    <div class="grid g3" style="margin-top:14px;">
      <div class="field">
        <label>Year Group</label>
        <select id="submissionControlYear">
          ${yearOptions}
        </select>
      </div>
      <div class="field">
        <label>Class No. <span class="helper" style="display:inline;">optional</span></label>
        <input type="text" id="submissionControlClass" placeholder="e.g. 8.1">
      </div>
      <div class="field">
        <label>Deadline</label>
        <input type="datetime-local" id="submissionControlDeadline">
      </div>
    </div>
    <div class="field" style="margin-top:10px;">
      <label>Message</label>
      <textarea id="submissionControlMessage" rows="2" placeholder="Optional message shown to students when the deadline or cutoff applies."></textarea>
      <div class="helper">Example: Final DT deadline passed. Speak to your teacher before requesting a late submission.</div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px;">
      <button class="btn btn-primary btn-sm" onclick="saveSubmissionControlAction('deadline')">&#9200; Set Deadline</button>
      <button class="btn btn-danger btn-sm" onclick="saveSubmissionControlAction('cutoff')">&#128274; Cut Off Now</button>
      <button class="btn btn-ghost btn-sm" onclick="saveSubmissionControlAction('reopen')">&#9989; Reopen</button>
      <button class="btn btn-ghost btn-sm" onclick="resetSubmissionControlForm_()">&#10060; Clear</button>
      <button class="btn btn-ghost btn-sm" onclick="loadSubmissionControlsTable()">&#8635; Refresh List</button>
    </div>
    <div id="submissionControlMsg" class="inline-msg tc-muted" style="margin-top:10px;"></div>
    <div id="submissionControlsTable" style="margin-top:12px;overflow-x:auto;"></div>
  </div>
  `;
}

function renderUsersPage_() {
  return `
  <div class="card">
    <div class="section-title">&#128101; User &amp; Role Management</div>
    <div class="section-sub">Manage who can access the dashboard and what role they have.</div>
    <div id="usersMsg" class="inline-msg tc-muted"></div>
    <div id="usersTable" style="margin-top:12px;overflow-x:auto;"></div>
    <div style="margin-top:12px;">
      <button class="btn btn-primary btn-sm" onclick="showAddUserForm()">+ Add User</button>
      <button class="btn btn-ghost btn-sm" onclick="openMasterSheet()" style="margin-left:8px;">&#128196; Edit in Sheet</button>
      <button class="btn btn-ghost btn-sm" onclick="loadUsersTable()" style="margin-left:8px;">&#8635; Refresh</button>
    </div>
    <div id="addUserForm" style="display:none;margin-top:16px;padding:16px;background:var(--bg);border-radius:var(--radius-sm);">
      <div class="grid g3">
        <div class="field"><label>Email</label><input type="email" id="newUserEmail" placeholder="studentID@student.example.edu or staff@example.edu"></div>
        <div class="field"><label>Name</label><input type="text" id="newUserName" placeholder="Display name"></div>
        <div class="field"><label>Role</label><select id="newUserRole"><option value="student">Student</option><option value="teacher">Teacher</option><option value="technician">Technician</option><option value="admin">Admin</option></select></div>
      </div>
      <div style="margin-top:10px;"><button class="btn btn-primary btn-sm" onclick="addNewUser()">Add User</button></div>
    </div>
  </div>
  `;
}

function renderAuditPage_() {
  return `
  <div class="card">
    <div class="section-title">&#128220; Audit Log</div>
    <div class="section-sub">Recent actions taken across the system. Showing last 200 entries.</div>
    <div id="auditMsg" class="inline-msg tc-muted"></div>
    <div id="auditTable" style="margin-top:12px;overflow-x:auto;"></div>
    <div style="margin-top:12px;">
      <button class="btn btn-ghost btn-sm" onclick="loadAuditLog()">&#8635; Refresh</button>
    </div>
  </div>
  `;
}

/* =========================
   HELPERS
   ========================= */

function escapeHtml_(str) {
  return String(str || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

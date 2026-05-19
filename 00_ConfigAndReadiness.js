/**
 * Run this function ONCE from the Apps Script editor (Run > authorizeScopes)
 * to grant the script permission to send emails via MailApp.
 * After running, accept the Google authorization prompt.
 */
function authorizeScopes() {
  if (APP.props.getProperty('MASTER_SPREADSHEET_ID') || APP.props.getProperty('ROOT_FOLDER_ID')) {
    requireSystemAdmin_();
  }
  // Touch MailApp so GAS requests the send_mail scope
  var remaining = MailApp.getRemainingDailyQuota();
  Logger.log('Authorization OK. Daily email quota remaining: ' + remaining);
  // Touch Drive so GAS requests the drive scope
  DriveApp.getRootFolder();
  Logger.log('Drive authorization OK.');
  // Touch Spreadsheet
  SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('Spreadsheet authorization OK.');
}

const DEPLOYMENT_INFO = {
  appName: 'Design Fabrication Dashboard',
  version: '2026-05-19-public-v120-sanitized-sync',
  channel: 'public-safe-github',
  updatedAt: '2026-05-19',
  scriptId: '',
  targetDeploymentId: '',
  targetUrl: '',
  access: 'CONFIGURE_FOR_YOUR_DOMAIN',
  executeAs: 'USER_DEPLOYING'
};

const APP = {
  name: 'Design Fabrication Dashboard',
  props: PropertiesService.getScriptProperties(),
  timeZone: (function() {
    try {
      return Session.getScriptTimeZone() || 'UTC';
    } catch (e) {
      return 'UTC';
    }
  })(),

  /* CC for Needs Fix emails — all parties on one thread for follow-up */
  technicianCcEmail: 'technician@example.edu',
  studentEmailDomains: ['student.example.edu'],
  staffEmailDomains: ['example.edu'],
  allowedEmailDomains: ['student.example.edu', 'example.edu'],

  sheets: {
    submissions: {
      name: 'Submissions',
      headers: [
        'submission_id',
        'created_at',
        'student_email',
        'student_name',
        'design_class_no',
        'design_teacher',
        'year_group',
        'machine',
        'material',
        'width',
        'height',
        'depth',
        'units',
        'working_file_id',
        'working_file_name',
        'working_file_url',
        'preview_file_id',
        'preview_file_name',
        'preview_file_url',
        'status',
        'issue_code',
        'admin_remarks',
        'submitted_by',
        'submitter_key',
        'updated_at',
        'updated_by',
        'prototype_fidelity'
      ]
    },
    rules: {
      name: 'Rules',
      headers: [
        'year_group',
        'machine',
        'max_width',
        'max_height',
        'max_depth',
        'units',
        'materials',
        'accepted_extensions',
        'preview_required',
        'notes',
        'active'
      ]
    },
    submissionControls: {
      name: 'SubmissionControls',
      headers: [
        'control_id',
        'year_group',
        'class_no',
        'deadline_at',
        'is_closed',
        'message',
        'active',
        'updated_at',
        'updated_by'
      ]
    },
    issueTemplates: {
      name: 'IssueTemplates',
      headers: [
        'issue_code',
        'issue_label',
        'applies_to',
        'email_subject',
        'email_body_html',
        'active',
        'sort_order'
      ]
    },
    users: {
      name: 'Users',
      headers: ['email', 'name', 'role', 'active']
    },
    auditLog: {
      name: 'AuditLog',
      headers: [
        'timestamp',
        'submission_id',
        'actor_email',
        'action_type',
        'old_status',
        'new_status',
        'notes'
      ]
    },
    otherRequests: {
      name: 'OtherRequests',
      headers: [
        'request_id',
        'created_at',
        'requester_email',
        'requester_name',
        'requester_role',
        'department_or_subject',
        'request_type',
        'project_name',
        'project_purpose',
        'competition_name',
        'event_or_deadline',
        'teacher_in_charge',
        'teacher_in_charge_email',
        'approved_by_email',
        'approval_status',
        'machine',
        'material',
        'width',
        'height',
        'depth',
        'units',
        'quantity',
        'working_file_id',
        'working_file_name',
        'working_file_url',
        'preview_file_id',
        'preview_file_name',
        'preview_file_url',
        'additional_requirements',
        'year_group',
        'class',
        'needed_by_date',
        'priority_reason',
        'request_description',
        'status',
        'issue_code',
        'admin_remarks',
        'submitted_by',
        'submitter_key',
        'updated_at',
        'updated_by'
      ]
    }
  },

  defaultSubmissionControls: [
    {
      control_id: 'default-y9-deadline-2026-05-20',
      year_group: 'Y9',
      class_no: '',
      deadline_at: '2026-05-20T23:59:00+08:00',
      is_closed: 'FALSE',
      message: 'Y9 DT submission deadline: 20 May 2026 23:59 Hong Kong time. This applies to Laser Cut and 3D Print submissions. If you need an exception, speak to your DT teacher before submitting.',
      active: 'TRUE',
      updated_at: '2026-05-18T00:00:00+08:00',
      updated_by: 'system default'
    },
    {
      control_id: 'default-y10-deadline-2026-05-20',
      year_group: 'Y10',
      class_no: '',
      deadline_at: '2026-05-20T23:59:00+08:00',
      is_closed: 'FALSE',
      message: 'Y10 DT submission deadline: 20 May 2026 23:59 Hong Kong time. This applies to Laser Cut and 3D Print submissions. If you need an exception, speak to your DT teacher before submitting.',
      active: 'TRUE',
      updated_at: '2026-05-18T00:00:00+08:00',
      updated_by: 'system default'
    }
  ],

  sampleRules: [
    ['Y8', 'laser', 20, 20, 0, 'cm', '3mm Hard Cardboard (White)', 'af,afdesign', 'TRUE', 'Consult teacher first; save whole document; no PNG', 'TRUE'],
    ['Y9', 'laser', 60, 40, 0, 'cm', '3mm Cardboard (Brown),3mm Acrylic Board (Random Colour)', 'dxf,svg,af,afdesign', 'TRUE', 'Vector only; no JPG/PNG pixels; whole document export', 'TRUE'],
    ['Y10', 'laser', 60, 40, 0, 'cm', '3mm Cardboard (Brown),3mm Acrylic Board (Random Colour)', 'af,afdesign', 'TRUE', 'Vector only; no JPG/PNG pixels', 'TRUE'],
    ['Y10', '3d', 30, 30, 30, 'cm', 'PLA', 'stl', 'TRUE', 'Upload dimension screenshot and final STL', 'TRUE']
  ],

  sampleIssues: [
    /* ── Laser Cut Issues ─────────────────────────────────── */
    ['LC_FILETYPE_WRONG', 'Wrong file type', 'laser', 'File revision required',
      '<p><strong>Problem:</strong> The uploaded file is not in the correct format. Accepted formats depend on your year group (e.g. .af, .afdesign for most year groups; Y9 also accepts .svg and .dxf). PNG, JPG, PDF, and other formats cannot be used for laser cutting.</p>' +
      '<p><strong>How to fix:</strong> Check the accepted file types shown for your year group and re-upload the correct format.</p>', 'TRUE', 1],
    ['LC_PNG_SUBMITTED', 'PNG submitted instead of working file', 'laser', 'PNG is not accepted as working file',
      '<p><strong>Problem:</strong> You uploaded a PNG image instead of the editable working file. A PNG cannot be used for laser cutting because it is not a vector file.</p>' +
      '<p><strong>How to fix:</strong> Open your original project in Affinity Designer. Go to <em>File &gt; Save As</em> and save as <strong>.afdesign</strong>. Re-upload the .afdesign file as your working file. You can still use the PNG as your preview image.</p>', 'TRUE', 2],
    ['LC_JPG_SUBMITTED', 'JPG / JPEG submitted instead of working file', 'laser', 'JPG is not accepted as working file',
      '<p><strong>Problem:</strong> You uploaded a JPG/JPEG image. This is a photo format and cannot be used for laser cutting.</p>' +
      '<p><strong>How to fix:</strong> Go back to Affinity Designer where you created your design. Use <em>File &gt; Save As</em> and choose <strong>.afdesign</strong> format. Upload that .afdesign file. The JPG can be used as your preview image instead.</p>', 'TRUE', 3],
    ['LC_PDF_SUBMITTED', 'PDF submitted instead of .afdesign', 'laser', 'PDF is not accepted as working file',
      '<p><strong>Problem:</strong> You uploaded a PDF file. While PDFs can contain vectors, we need the original editable Affinity Designer file to process your job correctly.</p>' +
      '<p><strong>How to fix:</strong> Open your project in Affinity Designer. Go to <em>File &gt; Save As</em> and save as <strong>.afdesign</strong>. Upload the .afdesign file as your working file.</p>', 'TRUE', 4],
    ['LC_NOT_WHOLE_DOCUMENT', 'Not whole document export', 'laser', 'Please export the whole document',
      '<p><strong>Problem:</strong> Your file was not exported as the whole document or whole artboard. Part of your design may be missing or cropped.</p>' +
      '<p><strong>How to fix:</strong> In Affinity Designer, go to <em>File &gt; Export</em>. Make sure <strong>"Whole Document"</strong> or <strong>"All Artboards"</strong> is selected (not "Selection Only"). Re-export and resubmit.</p>', 'TRUE', 5],
    ['LC_NOT_VECTOR_ONLY', 'Contains non-vector content', 'laser', 'File contains pixel/raster content',
      '<p><strong>Problem:</strong> Your file contains pixel (raster) layers or embedded images. Laser cut files must contain only vector curves and shapes.</p>' +
      '<p><strong>How to fix:</strong> Open the <em>Layers</em> panel in Affinity Designer. Look for any image or pixel layers (they will show a thumbnail of a photo/image). Delete those layers, keeping only your vector curves and shapes. Save and resubmit.</p>', 'TRUE', 6],
    ['LC_PIXEL_LAYER_FOUND', 'Embedded pixel/image layer found', 'laser', 'Pixel layer detected in working file',
      '<p><strong>Problem:</strong> An embedded pixel or image layer was detected inside your working file. This will cause problems during laser cutting.</p>' +
      '<p><strong>How to fix:</strong> Open the <em>Layers</em> panel, find the pixel/image layer (it usually shows a photo thumbnail), and delete it. Make sure only vector objects remain. Save and resubmit.</p>', 'TRUE', 7],
    ['LC_EXCEEDS_SIZE_LIMIT', 'Exceeds size limit', 'laser', 'Design exceeds size limit',
      '<p><strong>Problem:</strong> Your design dimensions exceed the maximum allowed size for your year group.</p>' +
      '<p><strong>How to fix:</strong> Check the size limits for your year group on the submission page. In Affinity Designer, select all objects (<em>Ctrl/Cmd + A</em>) and use the <em>Transform</em> panel (W and H fields) to resize. Make sure width and height are within the allowed limits. Save and resubmit.</p>', 'TRUE', 8],
    ['LC_WRONG_NAMING', 'Incorrect file naming', 'laser', 'Please rename your file',
      '<p><strong>Problem:</strong> Your file does not follow the required naming convention.</p>' +
      '<p><strong>How to fix:</strong> Rename your file using the format: <strong>Firstname_Lastname_ProjectName.afdesign</strong> (e.g. <em>John_Smith_BoxDesign.afdesign</em>). Then re-upload and resubmit.</p>', 'TRUE', 9],
    ['LC_NO_TEACHER_CONFIRMATION', 'No teacher confirmation', 'laser', 'Teacher confirmation required',
      '<p><strong>Problem:</strong> Your submission requires teacher approval before it can be processed, but we have not received confirmation from your teacher.</p>' +
      '<p><strong>How to fix:</strong> Show your design to your Design Technology teacher during class and ask them to confirm it is ready. Once your teacher approves, resubmit your file.</p>', 'TRUE', 10],
    ['LC_CUT_ONLY_NO_ENGRAVING', 'Cut lines only \u2014 no engraving', 'laser', 'Engraving not supported for this request',
      '<p><strong>Problem:</strong> Your file includes engraving paths or filled areas, but only cut lines are permitted for this submission.</p>' +
      '<p><strong>How to fix:</strong> Remove any filled shapes or engraving layers from your design. Keep only the outline/stroke paths that represent cut lines. Save and resubmit.</p>', 'TRUE', 11],
    ['LC_OPEN_PATHS', 'Open / unclosed paths detected', 'laser', 'Open paths need closing',
      '<p><strong>Problem:</strong> Your design contains open paths (lines that do not form a closed shape). The laser cutter requires closed paths to cut correctly.</p>' +
      '<p><strong>How to fix:</strong> In Affinity Designer, select the open path with the <em>Node Tool (A)</em>, then click <strong>Close Curve</strong> in the top toolbar. Repeat for all open paths. You can also use <em>Layer &gt; Geometry &gt; Merge Curves</em> to join connecting paths. Save and resubmit.</p>', 'TRUE', 12],
    ['LC_DUPLICATE_LINES', 'Overlapping / duplicate lines', 'laser', 'Duplicate lines found',
      '<p><strong>Problem:</strong> Your file contains overlapping or duplicate lines stacked on top of each other. This will cause the laser to cut the same line multiple times, which can burn through the material.</p>' +
      '<p><strong>How to fix:</strong> Zoom in closely and click on the lines to check if there are multiple objects stacked in the same position. Delete any duplicates so each cut line appears only once. Save and resubmit.</p>', 'TRUE', 13],
    ['LC_TEXT_NOT_CURVES', 'Text not converted to curves', 'laser', 'Text must be converted to curves',
      '<p><strong>Problem:</strong> Your design contains editable text objects. Text must be converted to vector curves before laser cutting, otherwise the font may not display correctly on the laser cutter computer.</p>' +
      '<p><strong>How to fix:</strong> Select all text in your design, then go to <em>Layer &gt; Convert to Curves</em> (or press <strong>Ctrl/Cmd + Enter</strong>). This turns the text into vector shapes that any computer can read. Save and resubmit.</p>', 'TRUE', 14],
    ['LC_WRONG_COLOUR_MAPPING', 'Wrong colour mapping (cut/engrave)', 'laser', 'Colour mapping needs correction',
      '<p><strong>Problem:</strong> The colours in your file do not match the required colour mapping. The laser software uses specific colours to distinguish between cut and engrave operations.</p>' +
      '<p><strong>How to fix:</strong> Use <strong>red stroke (RGB 255, 0, 0)</strong> for <em>cut lines</em> and <strong>black fill (RGB 0, 0, 0)</strong> for <em>engraving areas</em>. Do not use other colours for laser operations. Update the colours in the <em>Colour</em> panel and resubmit.</p>', 'TRUE', 15],
    ['LC_LINE_TOO_THIN', 'Stroke width incorrect for cutting', 'laser', 'Stroke width needs adjustment',
      '<p><strong>Problem:</strong> The stroke width on your cut lines is not set correctly. Cut lines need a specific stroke width for the laser to recognise them as cuts rather than engraving.</p>' +
      '<p><strong>How to fix:</strong> Select your cut lines, open the <em>Stroke</em> panel, and set the width to <strong>0.01 mm</strong> (hairline). This tells the laser software these are cut paths. Save and resubmit.</p>', 'TRUE', 16],
    ['LC_MATERIAL_NOT_AVAILABLE', 'Requested material not available', 'laser', 'Material not currently available',
      '<p><strong>Problem:</strong> The material you selected for your submission is not currently available in the workshop.</p>' +
      '<p><strong>How to fix:</strong> Check with your teacher or the technician for the list of materials currently in stock. Resubmit your work with an available material selected.</p>', 'TRUE', 17],
    ['LC_DESIGN_NOT_ON_ARTBOARD', 'Design outside artboard area', 'laser', 'Design must be on the artboard',
      '<p><strong>Problem:</strong> Some or all of your design is positioned outside the artboard boundary. Only objects inside the artboard will be processed.</p>' +
      '<p><strong>How to fix:</strong> In Affinity Designer, press <strong>Ctrl/Cmd + A</strong> to select all objects. Check that everything is within the white artboard area. If any objects are outside, drag them inside. You can also resize the artboard via <em>Document &gt; Resize Document</em>. Save and resubmit.</p>', 'TRUE', 18],
    ['LC_TOO_MANY_PIECES', 'Too many separate pieces / parts', 'laser', 'Too many parts in one submission',
      '<p><strong>Problem:</strong> Your design contains too many separate cut pieces for a single submission. This makes the job too complex or time-consuming.</p>' +
      '<p><strong>How to fix:</strong> Reduce the number of parts in your design, or split them across multiple submissions. If you need all the pieces, speak to your teacher about whether the project scope is appropriate.</p>', 'TRUE', 19],
    ['LC_DESIGN_TOO_SMALL', 'Design too small to cut safely', 'laser', 'Design is too small',
      '<p><strong>Problem:</strong> Your design or some of its features are too small to cut safely. Very small pieces can catch fire, warp, or break during cutting.</p>' +
      '<p><strong>How to fix:</strong> Ensure all parts are at least <strong>5 mm</strong> in their smallest dimension. Very thin slots or holes should be at least <strong>1 mm</strong> wide. Scale up your design if needed. Save and resubmit.</p>', 'TRUE', 20],
    ['LC_MIXED_UNITS', 'Dimensions appear to use wrong units', 'laser', 'Check your measurement units',
      '<p><strong>Problem:</strong> The dimensions in your file do not match what you entered on the submission form. It looks like your file may be set to a different unit (e.g. inches instead of cm, or pixels instead of mm).</p>' +
      '<p><strong>How to fix:</strong> In Affinity Designer, go to <em>Document &gt; Document Setup</em> and confirm the units are set to <strong>millimetres (mm)</strong> or <strong>centimetres (cm)</strong>. Check that the artboard/document size matches what you entered on the form. Fix and resubmit.</p>', 'TRUE', 21],
    ['LC_GROUPED_OBJECTS', 'Objects need ungrouping', 'laser', 'Please ungroup nested objects',
      '<p><strong>Problem:</strong> Your design contains deeply nested groups or clipping masks that prevent the laser software from reading the paths correctly.</p>' +
      '<p><strong>How to fix:</strong> Select all objects (<em>Ctrl/Cmd + A</em>), then go to <em>Layer &gt; Ungroup All</em> (you may need to do this multiple times). After ungrouping, check that all your curves are still correct, then save and resubmit.</p>', 'TRUE', 22],
    ['LC_ARTBOARD_SIZE_MISMATCH', 'Artboard size does not match form', 'laser', 'Artboard size mismatch',
      '<p><strong>Problem:</strong> The artboard/document size in your file does not match the width and height you entered on the submission form.</p>' +
      '<p><strong>How to fix:</strong> In Affinity Designer, go to <em>Document &gt; Resize Document</em> and set the width and height to match your submission form. Alternatively, update your submission form dimensions to match your actual file. Resubmit.</p>', 'TRUE', 23],
    ['LC_WRONG_DPI', 'Wrong export DPI / resolution', 'laser', 'Export resolution incorrect',
      '<p><strong>Problem:</strong> Your file was exported at the wrong DPI or resolution setting, which may affect the quality or accuracy of the cut.</p>' +
      '<p><strong>How to fix:</strong> When saving your .afdesign file, make sure the document DPI is set to <strong>72 DPI</strong> or higher. For exported preview images, use at least <strong>150 DPI</strong>. Go to <em>Document &gt; Document Setup</em> to check. Save and resubmit.</p>', 'TRUE', 24],
    ['LC_CONTAINS_GRADIENT', 'Contains gradients (not supported)', 'laser', 'Gradients cannot be laser cut',
      '<p><strong>Problem:</strong> Your design contains gradient fills or strokes. Laser cutters cannot process gradients \u2014 they need solid colours only.</p>' +
      '<p><strong>How to fix:</strong> Select any objects with gradients and change them to <strong>solid fills</strong> or <strong>solid strokes</strong> using the <em>Colour</em> panel. For engraving, use solid black. For cut lines, use solid red stroke. Save and resubmit.</p>', 'TRUE', 25],
    ['LC_CONTAINS_TRANSPARENCY', 'Contains transparency / opacity effects', 'laser', 'Transparency not supported',
      '<p><strong>Problem:</strong> Your design contains objects with reduced opacity or transparency effects. The laser cannot interpret semi-transparent areas.</p>' +
      '<p><strong>How to fix:</strong> Select all objects and set their <strong>opacity to 100%</strong> in the <em>Layers</em> panel or <em>Opacity</em> slider. Remove any blend modes other than "Normal". If you need different cut/engrave areas, use the colour mapping system (red for cut, black for engrave) instead of transparency. Save and resubmit.</p>', 'TRUE', 26],
    ['LC_KERF_NOT_ACCOUNTED', 'Kerf / fitting tolerance not considered', 'laser', 'Adjust for laser kerf',
      '<p><strong>Problem:</strong> Your design has interlocking or press-fit parts, but the laser kerf (the width of material removed by the laser beam, approx. 0.1\u20130.2 mm) has not been accounted for. The pieces may not fit together.</p>' +
      '<p><strong>How to fix:</strong> For parts that need to fit together tightly, add approximately <strong>0.1 mm</strong> tolerance to slots/tabs. Make slots slightly wider and tabs slightly narrower. If you are unsure, ask your teacher to help you with the kerf offset. Save and resubmit.</p>', 'TRUE', 27],
    ['LC_MISSING_PREVIEW', 'No preview image uploaded', 'laser', 'Preview image required',
      '<p><strong>Problem:</strong> You did not upload a preview image with your submission. A preview image helps the technician verify your design before cutting.</p>' +
      '<p><strong>How to fix:</strong> In Affinity Designer, go to <em>File &gt; Export</em> and export your design as a <strong>PNG</strong> image. Upload this PNG as your preview image when resubmitting.</p>', 'TRUE', 28],
    ['LC_MULTIPLE_ARTBOARDS', 'Multiple artboards \u2014 only one allowed', 'laser', 'Use only one artboard',
      '<p><strong>Problem:</strong> Your file contains multiple artboards. Only one artboard per submission is supported.</p>' +
      '<p><strong>How to fix:</strong> Combine all your design elements onto a single artboard in Affinity Designer. Delete any extra artboards. If you have multiple separate designs, submit them as separate requests. Save and resubmit.</p>', 'TRUE', 29],
    ['LC_FILL_ON_CUT_LINE', 'Cut lines should not have a fill', 'laser', 'Remove fill from cut lines',
      '<p><strong>Problem:</strong> Some of your cut lines have a fill colour applied. Cut lines should only have a stroke (outline), not a fill, otherwise the laser may engrave instead of cut.</p>' +
      '<p><strong>How to fix:</strong> Select your cut line objects, then in the <em>Colour</em> panel, click the <strong>Fill</strong> swatch and set it to <strong>None</strong> (the circle with a diagonal line). Keep only the red stroke. Save and resubmit.</p>', 'TRUE', 30],
    ['LC_DESIGN_INCOMPLETE', 'Design appears unfinished', 'laser', 'Design looks incomplete',
      '<p><strong>Problem:</strong> Your design appears to be incomplete or unfinished. There may be missing parts, placeholder shapes, or unfinished outlines.</p>' +
      '<p><strong>How to fix:</strong> Review your design carefully and complete any missing elements. Make sure all outlines are closed and the design looks as you intend it. If you are unsure whether your design is ready, ask your teacher to check it before resubmitting.</p>', 'TRUE', 31],

    /* ── 3D Print Issues ──────────────────────────────────── */
    ['P3_STL_UNREADABLE', 'STL file cannot be read', '3d', 'STL file needs revision',
      '<p><strong>Problem:</strong> Your STL file could not be opened or read by our slicing software. It may be corrupted or saved in an unsupported format.</p>' +
      '<p><strong>How to fix:</strong> Open your model in your 3D software (e.g. TinkerCAD, Fusion 360, Blender). Go to <em>File &gt; Export</em> and choose <strong>STL (Binary)</strong> format. Make sure the export completes without errors. Re-upload the new STL file.</p>', 'TRUE', 32],
    ['P3_NO_DIMENSION_PROOF', 'Missing dimension proof', '3d', 'Dimension screenshot required',
      '<p><strong>Problem:</strong> You did not upload a screenshot showing the dimensions (width, height, depth) of your 3D model.</p>' +
      '<p><strong>How to fix:</strong> Open your model in your 3D software or slicer, and take a screenshot that clearly shows the <strong>X, Y, and Z dimensions</strong> in the correct units (cm or mm). Upload this screenshot as your preview image and resubmit.</p>', 'TRUE', 33],
    ['P3_EXCEEDS_SIZE_LIMIT', 'Exceeds 3D print size limit', '3d', '3D model exceeds size limit',
      '<p><strong>Problem:</strong> Your 3D model is larger than the maximum print dimensions allowed for your year group.</p>' +
      '<p><strong>How to fix:</strong> Check the size limits on the submission page. Open your model in your slicer or 3D software and <strong>scale it down</strong> so all dimensions (X, Y, Z) fit within the allowed limits. Re-export the STL and resubmit with an updated dimension screenshot.</p>', 'TRUE', 34],
    ['P3_ESTIMATED_TIME_TOO_LONG', 'Estimated print time too long', '3d', 'Print time exceeds limit',
      '<p><strong>Problem:</strong> The estimated print time for your model is too long to be practical for classroom use.</p>' +
      '<p><strong>How to fix:</strong> Try one or more of the following: (1) <strong>Make the model smaller</strong> by scaling it down. (2) <strong>Reduce infill</strong> \u2014 10\u201315% infill is usually enough. (3) <strong>Simplify the geometry</strong> \u2014 remove unnecessary details or thin features. Then re-export and resubmit.</p>', 'TRUE', 35],
    ['P3_REQUIRES_SUPPORT_REVIEW', 'Requires support structure review', '3d', 'Support structures need review',
      '<p><strong>Problem:</strong> Your model has overhangs or features that will need support structures during printing. These need to be reviewed before we can proceed.</p>' +
      '<p><strong>How to fix:</strong> Try to <strong>minimise overhangs greater than 45\u00b0</strong> by redesigning or reorienting your model so the flat/largest face sits on the build plate. If supports are unavoidable, the technician will discuss options with you. You may also come to the workshop to review the print preview together.</p>', 'TRUE', 36],
    ['P3_NON_MANIFOLD', 'Non-manifold / non-watertight geometry', '3d', 'Model geometry needs repair',
      '<p><strong>Problem:</strong> Your 3D model has non-manifold geometry (holes, flipped faces, or edges shared by more than two faces). This means it is not "watertight" and cannot be printed as-is.</p>' +
      '<p><strong>How to fix:</strong> In your 3D software, run a <strong>mesh check</strong> or <strong>mesh analysis</strong> tool. In TinkerCAD, try re-exporting. In Blender, use <em>Mesh &gt; Clean Up &gt; Make Manifold</em> or the 3D Print Toolbox add-on. In Fusion 360, use the <em>Mesh &gt; Repair</em> tool. Fix all errors and re-export the STL.</p>', 'TRUE', 37],
    ['P3_THIN_WALLS', 'Walls too thin to print', '3d', 'Wall thickness too small',
      '<p><strong>Problem:</strong> Some walls or features in your model are too thin to be printed successfully. They may break during or after printing.</p>' +
      '<p><strong>How to fix:</strong> Ensure all walls are at least <strong>1.2 mm thick</strong> (minimum 2 perimeters). Check thin areas in your 3D software and thicken them. You can use the slicer preview to spot thin sections that appear as gaps. Re-export and resubmit.</p>', 'TRUE', 38],
    ['P3_WRONG_ORIENTATION', 'Model orientation will cause issues', '3d', 'Model orientation needs adjustment',
      '<p><strong>Problem:</strong> Your model is oriented in a way that will produce poor print quality or require excessive supports.</p>' +
      '<p><strong>How to fix:</strong> <strong>Rotate your model</strong> so the largest flat surface sits on the build plate (the bottom). This reduces the need for support structures and improves print quality. Re-export the STL in the new orientation and resubmit with an updated dimension screenshot.</p>', 'TRUE', 39],
    ['P3_FILE_TOO_LARGE', 'STL file too large / too many polygons', '3d', 'STL file size needs reduction',
      '<p><strong>Problem:</strong> Your STL file is very large or contains too many polygons, which makes it difficult to process.</p>' +
      '<p><strong>How to fix:</strong> In your 3D software, reduce the mesh resolution or use a <strong>Decimate</strong> modifier (in Blender) or reduce export quality. Aim for under 50 MB. The visual quality will still be fine for 3D printing at a lower polygon count. Re-export and resubmit.</p>', 'TRUE', 40],
    ['P3_MISSING_STL', 'No STL file uploaded', '3d', 'STL file required',
      '<p><strong>Problem:</strong> No STL file was found in your submission. The 3D printer requires an STL file to work.</p>' +
      '<p><strong>How to fix:</strong> Open your 3D model in your design software. Go to <em>File &gt; Export</em> and choose <strong>STL</strong> format. Upload the exported .stl file as your working file and resubmit.</p>', 'TRUE', 41],

    /* ── General Issues ───────────────────────────────────── */
    ['GEN_INCOMPLETE_SUBMISSION', 'Submission incomplete / missing info', '', 'Submission incomplete',
      '<p><strong>Problem:</strong> Your submission is missing required information or files. We cannot process it until all fields are filled in correctly.</p>' +
      '<p><strong>How to fix:</strong> Review your submission and make sure all required fields are completed: student name, class, year group, dimensions, working file, and preview image (if required). Resubmit with the missing information.</p>', 'TRUE', 42],
    ['GEN_WRONG_MACHINE', 'Wrong machine type selected', '', 'Wrong machine selected',
      '<p><strong>Problem:</strong> The machine type you selected (Laser Cut or 3D Print) does not match the type of file or project you submitted.</p>' +
      '<p><strong>How to fix:</strong> Create a new submission and select the correct machine type. Upload the appropriate file format for that machine (.afdesign for laser, .stl for 3D print).</p>', 'TRUE', 43],
    ['GEN_RESUBMIT_REQUIRED', 'Please resubmit your work', '', 'Resubmission required',
      '<p><strong>Problem:</strong> There is a general issue with your submission that requires you to start a new submission.</p>' +
      '<p><strong>How to fix:</strong> Please read the additional remarks from the technician below (if any), fix the issue, and submit a new request through the dashboard.</p>', 'TRUE', 44]
  ],

  status: {
    SUBMITTED: 'submitted',
    NEEDS_FIX: 'needs_fix',
    APPROVED: 'approved',
    IN_QUEUE: 'in_queue',
    IN_PRODUCTION: 'in_production',
    COMPLETED: 'completed',
    REJECTED: 'rejected'
  },

  adminRoles: ['admin', 'teacher', 'technician'],

  queuePolicy: {
    activeBusyThreshold: 20,
    activeHeavyThreshold: 30,
    studentCountRevealThreshold: 50,
    pickupEstimate: {
      workStartsAfterSchoolDays: 3,
      pickupStartAfterSchoolDays: 4,
      pickupEndAfterSchoolDays: 5
    },
    laserCapacityNotice: {
      active: true,
      version: '2026-05-04-laser-reduced-capacity',
      title: 'Laser queue update',
      summary: 'One laser cutter is currently offline. Only one laser cutter is running, so laser jobs may move more slowly than usual.',
      detail: 'Please avoid duplicate submissions. Check Status for updates, and keep your file ready in case a revision is requested.',
      scaleLabel: 'Busy starts at 20 active queue items. Heavy starts above 30 active queue items.'
    }
  },

  uiText: {
    turnaroundHeadline: 'Please Allow Processing Time',
    turnaroundShort: 'Submitting a file does <strong>not</strong> mean same-day production. Every submission goes through <strong>review, approval, queueing, and production</strong> &mdash; each step takes time. Turnaround depends on file readiness, workload, machine availability, and job priority.',
    turnaroundCompact: 'Submitting does not guarantee same-day production. All jobs require review and queueing time. Please submit well ahead of any deadline.',
    turnaroundChecklistReminder: 'Allow enough time &mdash; production is not instant. Submit early and plan for possible revisions.',
    turnaroundSuccessIntro: 'Your submission will move through the following stages:',
    turnaroundSuccessOutro: '<strong>Same-day completion should not be expected.</strong> Turnaround time depends on queue length, file readiness, machine availability, and priority. Check the <strong>Status</strong> page for live progress instead of assuming a timeline.',
    turnaroundStatusNotice: 'All submissions go through <strong>review &rarr; approval &rarr; queue &rarr; production</strong>. Timing depends on queue length, file readiness, machine availability, teacher confirmation, and job priority. DT curriculum work may be prioritised. <strong>Same-day production is not guaranteed.</strong>',
    turnaroundQuickRule: '<strong>Submit early</strong> &mdash; production takes time and same-day turnaround is not guaranteed',
    turnaroundHelpIntro: 'Fabrication is a <strong>multi-step workflow</strong>, not an instant service. Understanding how the process works will help you plan ahead and avoid disappointment.',
    turnaroundHelpSubheading: 'Submission &#8800; Same-Day Production',
    turnaroundHelpSubheadingDetail: 'Submitting a file does <strong>not</strong> mean it will be produced on the same day. Every job must go through the following stages, each of which takes time:',
    turnaroundHelpWarning: 'Submitting at the last minute does not guarantee urgent processing. The workshop handles many submissions each week. <strong>Please plan ahead.</strong>',
    turnaroundFactors: [
      'DT lesson-related work may be prioritised over non-DT requests.',
      'Incomplete files, wrong formats, or revision requests will extend processing time.',
      '<strong>Plan ahead and submit early</strong> to allow enough time for revisions.'
    ],
    turnaroundWorkflowSteps: [
      { title: 'Review', description: 'a technician checks your file for completeness and correctness.' },
      { title: 'Approval / Needs Fix', description: 'your file is either approved or returned for revision.' },
      { title: 'Queue', description: 'approved jobs enter the production queue in order of priority.' },
      { title: 'Production', description: 'your job is fabricated when a machine slot is available.' },
      { title: 'Completed', description: 'collect your finished work from the workshop.' }
    ],
    turnaroundHelpWorkflowSteps: [
      { title: 'Review', description: 'the technician team checks your file for format, dimensions, and completeness.' },
      { title: 'Approval or Needs Fix', description: 'if your file passes review, it is approved. If not, it is returned for correction.' },
      { title: 'Queueing', description: 'approved jobs enter the production queue and are processed in order of priority.' },
      { title: 'Production', description: 'your job is fabricated when a machine slot and technician time are available.' },
      { title: 'Collection', description: 'once completed, you collect your finished work from the workshop.' }
    ],
    turnaroundHelpFactors: [
      '<strong>File readiness</strong> &mdash; complete, correct files are reviewed faster. Incomplete files, wrong formats, or missing previews will delay your submission.',
      '<strong>Revision requests</strong> &mdash; if your file is marked &ldquo;Needs Fix&rdquo;, the clock resets. Each round of revision adds processing time.',
      '<strong>Queue length</strong> &mdash; during busy periods (project deadlines, assessment weeks), the queue may be longer than usual.',
      '<strong>Machine availability</strong> &mdash; machines require maintenance, calibration, and cooldown time between jobs.',
      '<strong>Teacher confirmation</strong> &mdash; some submissions require teacher approval before production can begin.'
    ],
    turnaroundPriorityRules: [
      '<strong>DT class-related / curriculum-critical work</strong> is generally given higher priority, especially near assessment deadlines.',
      'Jobs from <strong>other subjects or personal projects</strong> are welcome but may wait longer depending on current workload.',
      'The technician team processes jobs fairly, but <strong>urgent DT curriculum needs take precedence</strong> when the queue is full.'
    ],
    turnaroundTips: [
      'Submit <strong>early</strong> &mdash; do not leave it to the last day before a deadline.',
      'Follow all <strong>file format and size rules</strong> carefully to avoid &ldquo;Needs Fix&rdquo; returns.',
      '<strong>Check with your teacher</strong> before uploading to catch issues early.',
      'Monitor the <strong>Status page</strong> to respond quickly if revisions are needed.',
      'Submit the <strong>final version</strong> of your file, not a draft.'
    ],
    statusMessages: {
      submitted:     'Your file has been received and is waiting for technician review. This typically takes 1\u20133 school days depending on workload.',
      needs_fix:     'Your file needs changes before it can proceed. Please review the notes below or speak to your teacher. Revision requests extend processing time.',
      approved:      'Your submission has passed review and is ready for scheduling. It will enter the production queue shortly.',
      in_queue:      'Your job is approved and waiting in the production queue. Wait time depends on queue length, machine availability, and priority.',
      in_production: 'Your job is currently being fabricated. You will be notified when it is ready for collection.',
      completed:     'Your job is complete! Please collect it from the workshop at your earliest convenience.',
      rejected:      'This submission cannot proceed in its current form. Please review the notes and resubmit if needed.'
    },

    /* ── Other / Special Requests ────────────────────── */
    otherRequestIntroHeadline: '&#11088; Special Fabrication Request',
    otherRequestIntroBody: 'Use this page for fabrication requests <strong>outside of regular DT coursework</strong> &mdash; competitions, exhibitions, other subject projects, or special builds. All requests are reviewed by the workshop team.',
    otherRequestPriorityNotice: 'DT curriculum work may be <strong>prioritised</strong> over non-DT requests. Non-DT jobs may take longer depending on current workload and machine availability.',
    otherRequestApprovalNotice: 'All requests must have a <strong>responsible teacher or staff sponsor</strong>. Requests without clear approval may be rejected or placed on hold.',
    otherRequestNoGuarantee: 'Submitting a request does <strong>not</strong> guarantee acceptance, same-day production, or deadline fulfilment. Please plan ahead and submit early.',
    otherRequestChecklist: [
      'You have a responsible teacher / staff member who has approved this request.',
      'Your file is final or near-final quality &mdash; not a rough draft.',
      'Dimensions are accurate and within machine limits.',
      'Purpose , use case, and any deadlines are clearly stated.',
      'You understand DT coursework may be prioritised ahead of this request.'
    ],
    otherRequestTypes: [
      { value: 'competition', label: 'Competition Project' },
      { value: 'other_subject', label: 'Other Subject Work' },
      { value: 'exhibition', label: 'Exhibition / Display' },
      { value: 'event', label: 'School Event' },
      { value: 'prototype', label: 'Prototype / Product' },
      { value: 'club', label: 'Club / CCA Project' },
      { value: 'other', label: 'Other' }
    ],
    otherRequestRoles: [
      { value: 'student', label: 'Student' },
      { value: 'teacher', label: 'Teacher' },
      { value: 'staff', label: 'Staff' },
      { value: 'club', label: 'Club / CCA Representative' },
      { value: 'other', label: 'Other' }
    ],
    otherRequestDepartments: [
      { value: 'Science', label: 'Science' },
      { value: 'Art', label: 'Art' },
      { value: 'Geography', label: 'Geography' },
      { value: 'ICT', label: 'ICT' },
      { value: 'Competition Team', label: 'Competition Team' },
      { value: 'School Event', label: 'School Event' },
      { value: 'Club', label: 'Club' },
      { value: 'Other', label: 'Other' }
    ],
    otherRequestPurposes: [
      { value: 'class_project', label: 'Class Project' },
      { value: 'competition', label: 'Competition' },
      { value: 'display_model', label: 'Display Model' },
      { value: 'event_prop', label: 'Event Prop' },
      { value: 'prototype', label: 'Prototype' },
      { value: 'club_activity', label: 'Club Activity' },
      { value: 'other', label: 'Other' }
    ],
    otherRequestWorkflowSteps: [
      { title: 'Review', description: 'technician checks the request, file, and approval details.' },
      { title: 'Approval Check', description: 'the request is verified with the responsible teacher / sponsor.' },
      { title: 'Queue Decision', description: 'approved requests enter the production queue based on priority.' },
      { title: 'Production', description: 'your job is fabricated when a machine slot is available.' },
      { title: 'Collection', description: 'collect your finished work from the workshop.' }
    ],
    otherRequestSuccessIntro: 'Your request has been submitted for review. It is <strong>not</strong> automatically approved.',
    otherRequestSuccessOutro: '<strong>Same-day production should not be expected.</strong> DT curriculum work may be prioritised ahead of this request. Check the <strong>Status</strong> page for updates.',
    otherRequestHelpIntro: 'This pathway is for fabrication requests that fall outside of regular DT student coursework submissions. Student Special Requests are intended for Y6-Y12 with responsible teacher or sponsor approval.',
    otherRequestHelpEligible: [
      'Competition prototypes or display items',
      'Other subject projects requiring laser cutting or 3D printing',
      'Exhibition or event builds (displays, signage, props)',
      'Club / CCA projects with teacher approval',
      'Special prototypes or product development requests'
    ],
    otherRequestHelpRequired: [
      'A <strong>responsible teacher or staff sponsor</strong> who approves the request',
      'A <strong>clear project name and purpose</strong> explaining why fabrication is needed',
      'A <strong>ready-to-fabricate working file</strong> in the correct format',
      'Accurate <strong>dimensions</strong> within machine limits',
      '<strong>Competition or event deadlines</strong> if applicable',
      'Understanding that <strong>DT coursework takes priority</strong>'
    ]
  },

  teacherEmails: {
    'DT Teacher 1': 'teacher1@example.edu',
    'DT Teacher 2': 'teacher2@example.edu',
    'DT Teacher 3': 'teacher3@example.edu',
    'DT Teacher 4': 'teacher4@example.edu',
    'DT Teacher 5': 'teacher5@example.edu',
    'DT Teacher 6': 'teacher6@example.edu',
    'DT Teacher 7': 'teacher7@example.edu',
    'DT Teacher 8': 'teacher8@example.edu',
    'DT Teacher 9': 'teacher9@example.edu',
    'DT Technician': 'technician@example.edu',
    'System Admin': 'admin@example.edu'
  },

  teacherBetaClasses: [
    { teacher: 'DT Teacher 1', teacher_email: 'teacher1@example.edu', year_group: 'Y6', class_no: '6.2', label: 'Class 6.2', roster: [
      { homeroom: "Y06X", student_no: "1", name: "Sample Student 62-01", email: "student6201@student.example.edu" },
      { homeroom: "Y06X", student_no: "2", name: "Sample Student 62-02", email: "student6202@student.example.edu" },
      { homeroom: "Y06X", student_no: "3", name: "Sample Student 62-03", email: "student6203@student.example.edu" },
      { homeroom: "Y06X", student_no: "4", name: "Sample Student 62-04", email: "student6204@student.example.edu" },
      { homeroom: "Y06X", student_no: "5", name: "Sample Student 62-05", email: "student6205@student.example.edu" }
    ] },
    { teacher: 'DT Teacher 1', teacher_email: 'teacher1@example.edu', year_group: 'Y6', class_no: '6.5', label: 'Class 6.5', roster: [
      { homeroom: "Y06X", student_no: "1", name: "Sample Student 65-01", email: "student6501@student.example.edu" },
      { homeroom: "Y06X", student_no: "2", name: "Sample Student 65-02", email: "student6502@student.example.edu" },
      { homeroom: "Y06X", student_no: "3", name: "Sample Student 65-03", email: "student6503@student.example.edu" },
      { homeroom: "Y06X", student_no: "4", name: "Sample Student 65-04", email: "student6504@student.example.edu" },
      { homeroom: "Y06X", student_no: "5", name: "Sample Student 65-05", email: "student6505@student.example.edu" }
    ] },
    { teacher: 'DT Teacher 1', teacher_email: 'teacher1@example.edu', year_group: 'Y6', class_no: '6.8', label: 'Class 6.8', roster: [
      { homeroom: "Y06X", student_no: "1", name: "Sample Student 68-01", email: "student6801@student.example.edu" },
      { homeroom: "Y06X", student_no: "2", name: "Sample Student 68-02", email: "student6802@student.example.edu" },
      { homeroom: "Y06X", student_no: "3", name: "Sample Student 68-03", email: "student6803@student.example.edu" },
      { homeroom: "Y06X", student_no: "4", name: "Sample Student 68-04", email: "student6804@student.example.edu" },
      { homeroom: "Y06X", student_no: "5", name: "Sample Student 68-05", email: "student6805@student.example.edu" }
    ] },
    { teacher: 'DT Teacher 1', teacher_email: 'teacher1@example.edu', year_group: 'Y7', class_no: '7.2', label: 'Class 7.2', roster: [
      { homeroom: "Y07X", student_no: "1", name: "Sample Student 72-01", email: "student7201@student.example.edu" },
      { homeroom: "Y07X", student_no: "2", name: "Sample Student 72-02", email: "student7202@student.example.edu" },
      { homeroom: "Y07X", student_no: "3", name: "Sample Student 72-03", email: "student7203@student.example.edu" },
      { homeroom: "Y07X", student_no: "4", name: "Sample Student 72-04", email: "student7204@student.example.edu" },
      { homeroom: "Y07X", student_no: "5", name: "Sample Student 72-05", email: "student7205@student.example.edu" }
    ] },
    { teacher: 'DT Teacher 1', teacher_email: 'teacher1@example.edu', year_group: 'Y7', class_no: '7.5', label: 'Class 7.5', roster: [
      { homeroom: "Y07X", student_no: "1", name: "Sample Student 75-01", email: "student7501@student.example.edu" },
      { homeroom: "Y07X", student_no: "2", name: "Sample Student 75-02", email: "student7502@student.example.edu" },
      { homeroom: "Y07X", student_no: "3", name: "Sample Student 75-03", email: "student7503@student.example.edu" },
      { homeroom: "Y07X", student_no: "4", name: "Sample Student 75-04", email: "student7504@student.example.edu" },
      { homeroom: "Y07X", student_no: "5", name: "Sample Student 75-05", email: "student7505@student.example.edu" }
    ] },
    { teacher: 'DT Teacher 1', teacher_email: 'teacher1@example.edu', year_group: 'Y7', class_no: '7.8', label: 'Class 7.8', roster: [
      { homeroom: "Y07X", student_no: "1", name: "Sample Student 78-01", email: "student7801@student.example.edu" },
      { homeroom: "Y07X", student_no: "2", name: "Sample Student 78-02", email: "student7802@student.example.edu" },
      { homeroom: "Y07X", student_no: "3", name: "Sample Student 78-03", email: "student7803@student.example.edu" },
      { homeroom: "Y07X", student_no: "4", name: "Sample Student 78-04", email: "student7804@student.example.edu" },
      { homeroom: "Y07X", student_no: "5", name: "Sample Student 78-05", email: "student7805@student.example.edu" }
    ] },
    { teacher: 'DT Teacher 2', teacher_email: 'teacher2@example.edu', year_group: 'Y6', class_no: '6.7', label: 'Class 6.7', roster: [
      { homeroom: "Y06X", student_no: "1", name: "Sample Student 67-01", email: "student6701@student.example.edu" },
      { homeroom: "Y06X", student_no: "2", name: "Sample Student 67-02", email: "student6702@student.example.edu" },
      { homeroom: "Y06X", student_no: "3", name: "Sample Student 67-03", email: "student6703@student.example.edu" },
      { homeroom: "Y06X", student_no: "4", name: "Sample Student 67-04", email: "student6704@student.example.edu" },
      { homeroom: "Y06X", student_no: "5", name: "Sample Student 67-05", email: "student6705@student.example.edu" }
    ] },
    { teacher: 'DT Teacher 2', teacher_email: 'teacher2@example.edu', year_group: 'Y7', class_no: '7.6', label: 'Class 7.6', roster: [
      { homeroom: "Y07X", student_no: "1", name: "Sample Student 76-01", email: "student7601@student.example.edu" },
      { homeroom: "Y07X", student_no: "2", name: "Sample Student 76-02", email: "student7602@student.example.edu" },
      { homeroom: "Y07X", student_no: "3", name: "Sample Student 76-03", email: "student7603@student.example.edu" },
      { homeroom: "Y07X", student_no: "4", name: "Sample Student 76-04", email: "student7604@student.example.edu" },
      { homeroom: "Y07X", student_no: "5", name: "Sample Student 76-05", email: "student7605@student.example.edu" }
    ] },
    { teacher: 'DT Teacher 2', teacher_email: 'teacher2@example.edu', year_group: 'Y8', class_no: '8.3', label: 'Class 8.3', roster: [
      { homeroom: "Y08X", student_no: "1", name: "Sample Student 83-01", email: "student8301@student.example.edu" },
      { homeroom: "Y08X", student_no: "2", name: "Sample Student 83-02", email: "student8302@student.example.edu" },
      { homeroom: "Y08X", student_no: "3", name: "Sample Student 83-03", email: "student8303@student.example.edu" },
      { homeroom: "Y08X", student_no: "4", name: "Sample Student 83-04", email: "student8304@student.example.edu" },
      { homeroom: "Y08X", student_no: "5", name: "Sample Student 83-05", email: "student8305@student.example.edu" }
    ] },
    { teacher: 'DT Teacher 2', teacher_email: 'teacher2@example.edu', year_group: 'Y9', class_no: '9.1', label: 'Class 9.1', roster: [
      { homeroom: "Y09X", student_no: "1", name: "Sample Student 91-01", email: "student9101@student.example.edu" },
      { homeroom: "Y09X", student_no: "2", name: "Sample Student 91-02", email: "student9102@student.example.edu" },
      { homeroom: "Y09X", student_no: "3", name: "Sample Student 91-03", email: "student9103@student.example.edu" },
      { homeroom: "Y09X", student_no: "4", name: "Sample Student 91-04", email: "student9104@student.example.edu" },
      { homeroom: "Y09X", student_no: "5", name: "Sample Student 91-05", email: "student9105@student.example.edu" }
    ] },
    { teacher: 'DT Teacher 2', teacher_email: 'teacher2@example.edu', year_group: 'Y9', class_no: '9.6', label: 'Class 9.6', roster: [
      { homeroom: "Y09X", student_no: "1", name: "Sample Student 96-01", email: "student9601@student.example.edu" },
      { homeroom: "Y09X", student_no: "2", name: "Sample Student 96-02", email: "student9602@student.example.edu" },
      { homeroom: "Y09X", student_no: "3", name: "Sample Student 96-03", email: "student9603@student.example.edu" },
      { homeroom: "Y09X", student_no: "4", name: "Sample Student 96-04", email: "student9604@student.example.edu" },
      { homeroom: "Y09X", student_no: "5", name: "Sample Student 96-05", email: "student9605@student.example.edu" }
    ] },
    { teacher: 'DT Teacher 2', teacher_email: 'teacher2@example.edu', year_group: 'Y10', class_no: '10.3', label: 'Class 10.3', roster: [
      { homeroom: "Y10X", student_no: "1", name: "Sample Student 103-01", email: "student10301@student.example.edu" },
      { homeroom: "Y10X", student_no: "2", name: "Sample Student 103-02", email: "student10302@student.example.edu" },
      { homeroom: "Y10X", student_no: "3", name: "Sample Student 103-03", email: "student10303@student.example.edu" },
      { homeroom: "Y10X", student_no: "4", name: "Sample Student 103-04", email: "student10304@student.example.edu" },
      { homeroom: "Y10X", student_no: "5", name: "Sample Student 103-05", email: "student10305@student.example.edu" }
    ] },
    { teacher: 'DT Teacher 3', teacher_email: 'teacher3@example.edu', year_group: 'Y6', class_no: '6.9', label: 'Class 6.9', roster: [
      { homeroom: "Y06X", student_no: "1", name: "Sample Student 69-01", email: "student6901@student.example.edu" },
      { homeroom: "Y06X", student_no: "2", name: "Sample Student 69-02", email: "student6902@student.example.edu" },
      { homeroom: "Y06X", student_no: "3", name: "Sample Student 69-03", email: "student6903@student.example.edu" },
      { homeroom: "Y06X", student_no: "4", name: "Sample Student 69-04", email: "student6904@student.example.edu" },
      { homeroom: "Y06X", student_no: "5", name: "Sample Student 69-05", email: "student6905@student.example.edu" }
    ] },
    { teacher: 'DT Teacher 3', teacher_email: 'teacher3@example.edu', year_group: 'Y7', class_no: '7.3', label: 'Class 7.3', roster: [
      { homeroom: "Y07X", student_no: "1", name: "Sample Student 73-01", email: "student7301@student.example.edu" },
      { homeroom: "Y07X", student_no: "2", name: "Sample Student 73-02", email: "student7302@student.example.edu" },
      { homeroom: "Y07X", student_no: "3", name: "Sample Student 73-03", email: "student7303@student.example.edu" },
      { homeroom: "Y07X", student_no: "4", name: "Sample Student 73-04", email: "student7304@student.example.edu" },
      { homeroom: "Y07X", student_no: "5", name: "Sample Student 73-05", email: "student7305@student.example.edu" }
    ] },
    { teacher: 'DT Teacher 3', teacher_email: 'teacher3@example.edu', year_group: 'Y8', class_no: '8.7', label: 'Class 8.7', roster: [
      { homeroom: "Y08X", student_no: "1", name: "Sample Student 87-01", email: "student8701@student.example.edu" },
      { homeroom: "Y08X", student_no: "2", name: "Sample Student 87-02", email: "student8702@student.example.edu" },
      { homeroom: "Y08X", student_no: "3", name: "Sample Student 87-03", email: "student8703@student.example.edu" },
      { homeroom: "Y08X", student_no: "4", name: "Sample Student 87-04", email: "student8704@student.example.edu" },
      { homeroom: "Y08X", student_no: "5", name: "Sample Student 87-05", email: "student8705@student.example.edu" }
    ] },
    { teacher: 'DT Teacher 3', teacher_email: 'teacher3@example.edu', year_group: 'Y9', class_no: '9.2', label: 'Class 9.2', roster: [
      { homeroom: "Y09X", student_no: "1", name: "Sample Student 92-01", email: "student9201@student.example.edu" },
      { homeroom: "Y09X", student_no: "2", name: "Sample Student 92-02", email: "student9202@student.example.edu" },
      { homeroom: "Y09X", student_no: "3", name: "Sample Student 92-03", email: "student9203@student.example.edu" },
      { homeroom: "Y09X", student_no: "4", name: "Sample Student 92-04", email: "student9204@student.example.edu" },
      { homeroom: "Y09X", student_no: "5", name: "Sample Student 92-05", email: "student9205@student.example.edu" }
    ] },
    { teacher: 'DT Teacher 3', teacher_email: 'teacher3@example.edu', year_group: 'Y9', class_no: '9.5', label: 'Class 9.5', roster: [
      { homeroom: "Y09X", student_no: "1", name: "Sample Student 95-01", email: "student9501@student.example.edu" },
      { homeroom: "Y09X", student_no: "2", name: "Sample Student 95-02", email: "student9502@student.example.edu" },
      { homeroom: "Y09X", student_no: "3", name: "Sample Student 95-03", email: "student9503@student.example.edu" },
      { homeroom: "Y09X", student_no: "4", name: "Sample Student 95-04", email: "student9504@student.example.edu" },
      { homeroom: "Y09X", student_no: "5", name: "Sample Student 95-05", email: "student9505@student.example.edu" }
    ] },
    { teacher: 'DT Teacher 3', teacher_email: 'teacher3@example.edu', year_group: 'Y10', class_no: '10.4', label: 'Class 10.4', roster: [
      { homeroom: "Y10X", student_no: "1", name: "Sample Student 104-01", email: "student10401@student.example.edu" },
      { homeroom: "Y10X", student_no: "2", name: "Sample Student 104-02", email: "student10402@student.example.edu" },
      { homeroom: "Y10X", student_no: "3", name: "Sample Student 104-03", email: "student10403@student.example.edu" },
      { homeroom: "Y10X", student_no: "4", name: "Sample Student 104-04", email: "student10404@student.example.edu" },
      { homeroom: "Y10X", student_no: "5", name: "Sample Student 104-05", email: "student10405@student.example.edu" }
    ] }
  ],

  adminEmailOverrides: [
    'admin@example.edu',
    'technician@example.edu',
    'teacher1@example.edu',
    'teacher2@example.edu',
    'teacher3@example.edu'
  ]
};

const TECHNICIAN_ALLOWED_STATUSES = [
  APP.status.APPROVED,
  APP.status.IN_QUEUE,
  APP.status.IN_PRODUCTION,
  APP.status.COMPLETED
];

const PREVIEW_IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'];

/* ----- MACHINE SPECIFICATIONS (verification-safe data model) -----
   verificationStatus: 'confirmed' | 'unverified' | 'school-guidance'
   sourceLabel:  human-readable provenance for each machine              */
const MACHINE_SPECS = {
  spiritLS: {
    displayName: 'GCC LaserPro Spirit LS Pro',
    machineType: 'CO\u2082 Laser Cutter / Engraver',
    category: 'laser',
    workingSize: { value: '640 \u00d7 460 mm', extra: 'Extendable pass-through to 740 \u00d7 460 mm', status: 'confirmed' },
    speed: { value: 'Up to 3.04 m/s (120 in/s)', status: 'confirmed' },
    wattage: { value: '30 W \u2013 100 W (CO\u2082)', status: 'confirmed' },
    resolution: { value: 'Up to 1 500 dpi', status: 'confirmed' },
    zAxis: { value: '165 mm (6.5 in)', status: 'confirmed' },
    motor: { value: 'Closed-loop DC servo', status: 'confirmed' },
    connectivity: { value: '10Base-T Ethernet / USB Type-A 2.0 / USB Type-B 2.0', status: 'confirmed' },
    acceptedFiles: { value: '.af / .afdesign / .svg / .dxf', status: 'school-guidance' },
    sourceLabel: 'GCC official brochure / product page',
    sourceUrl: 'https://www.gccworld.com/product/laser-engraver/spirit-ls',
    schoolLimitNote: 'School submission limits (not machine limits): Y8 20\u00d720 cm, Y9 60\u00d740 cm, Y10 60\u00d740 cm. Technician review still required.',
    goodFor: 'Flat parts, packaging nets, models, signage, engraved plates, precision prototyping',
    beginnerTips: [
      'Convert all text to curves/outlines before exporting',
      'Design at 1:1 real cutting size \u2014 not scaled',
      'Remove image layers \u2014 the laser follows vector paths only',
      'Check your dimensions against the school year-group limit, not the machine maximum'
    ]
  },
  mercuryIII: {
    displayName: 'GCC LaserPro Mercury III',
    machineType: 'CO\u2082 Laser Cutter / Engraver',
    category: 'laser',
    workingSize: { value: '635 \u00d7 458 mm (25 \u00d7 18 in)', extra: null, status: 'confirmed' },
    speed: { value: null, status: 'unverified' },
    wattage: { value: '12 W / 30 W / 40 W / 60 W / 80 W (CO\u2082)', status: 'confirmed' },
    resolution: { value: 'Up to 1 500 dpi', status: 'confirmed' },
    zAxis: { value: '165 mm (6.5 in)', status: 'confirmed' },
    motor: { value: 'Closed-loop DC servo', status: 'confirmed' },
    connectivity: { value: '10Base-T Ethernet / USB Type-A 2.0 / USB Type-B 2.0', status: 'confirmed' },
    acceptedFiles: { value: '.af / .afdesign / .svg / .dxf', status: 'school-guidance' },
    sourceLabel: 'GCC official brochure / product page',
    sourceUrl: 'https://www.gccworld.com/product/laser-engraver/mercury-iii',
    schoolLimitNote: 'School submission limits apply. This machine\'s larger bed does not mean any size is accepted \u2014 school year-group limits and technician review still apply.',
    goodFor: 'Batch cutting, larger sheet projects, general-purpose sheet work',
    beginnerTips: [
      'Same file preparation as the Spirit LS Pro',
      'Large files with many paths take longer to cut and queue',
      'Keep your file clean and free of duplicate or hidden paths',
      'School size limits still apply even though the machine bed is large'
    ]
  },
  k2Plus: {
    displayName: 'Creality K2 Plus',
    machineType: 'FDM 3D Printer \u2014 Enclosed, Heated Chamber',
    category: '3d',
    buildVolume: { value: '350 \u00d7 350 \u00d7 350 mm', status: 'confirmed' },
    speed: { value: '\u2264 600 mm/s', status: 'confirmed' },
    acceleration: { value: '\u2264 30 000 mm/s\u00b2', status: 'confirmed' },
    layerHeight: { value: '0.05 \u2013 0.3 mm', status: 'confirmed' },
    nozzle: { value: '0.4 mm (max 350 \u00b0C)', status: 'confirmed' },
    heatbed: { value: 'Max 120 \u00b0C', status: 'confirmed' },
    chamber: { value: 'Actively heated up to 60 \u00b0C', status: 'confirmed' },
    filaments: { value: 'PLA / PETG / TPU / ASA / PET / ABS / PA / PC / CF / GF / PPA-CF / PPS / PPS-CF (1.75 mm)', status: 'confirmed' },
    connectivity: { value: 'USB / Wi-Fi (dual-band) / Ethernet', status: 'confirmed' },
    sourceLabel: 'Creality official product & support page',
    sourceUrl: 'https://www.creality.com/products/creality-k2-plus-cfs-combo',
    schoolLimitNote: 'School submission limit: Y10 30\u00d730\u00d730 cm. The machine\'s full 350 mm build volume is NOT the student design limit. Technician review required.',
    goodFor: 'Prototypes, display models, functional parts, mechanisms, multi-material projects',
    beginnerTips: [
      'Check wall thickness and overhangs \u2014 a model that looks correct on screen may not print well',
      'Include a dimension screenshot with your STL submission',
      'PLA is the standard school material; other filaments require approval',
      'Design to the school limit (30\u00d730\u00d730 cm), not the machine maximum'
    ]
  },
  guiderIIs: {
    displayName: 'Flashforge Guider IIs',
    machineType: 'Enclosed FDM 3D Printer',
    category: '3d',
    buildVolume: { value: '280 \u00d7 250 \u00d7 300 mm', status: 'confirmed' },
    speed: { value: null, status: 'unverified' },
    layerHeight: { value: null, status: 'unverified' },
    nozzle: { value: '0.4 mm', status: 'confirmed' },
    heatbed: { value: null, status: 'unverified' },
    chamber: { value: 'Enclosed build chamber', status: 'confirmed' },
    filaments: { value: 'PLA (school standard); ABS / PETG may be available', status: 'school-guidance' },
    sourceLabel: 'Flashforge official product page',
    sourceUrl: 'https://www.flashforge.com/product-detail/flashforge-guider-iis-3d-printer',
    schoolLimitNote: 'School submission limit: Y10 30\u00d730\u00d730 cm. The machine\'s full build volume is NOT the student design limit. Technician review required.',
    goodFor: 'Larger or longer-running prints, stable-temperature jobs, enclosed reliability',
    beginnerTips: [
      'Same STL workflow as the K2 Plus',
      'Larger prints take significantly longer \u2014 plan ahead',
      'Machine assignment is decided by the technician based on queue and job size',
      'PLA is the standard school material'
    ]
  }
};

/* =========================
   ONE-TIME SETUP / BOOTSTRAP
   ========================= */

function bootstrap() {
  if (APP.props.getProperty('MASTER_SPREADSHEET_ID') || APP.props.getProperty('ROOT_FOLDER_ID')) {
    requireSystemAdmin_();
  }

  const summary = {};

  const rootFolder = getOrCreateRootFolder_();
  summary.rootFolderId = rootFolder.getId();
  summary.rootFolderUrl = rootFolder.getUrl();

  const spreadsheet = getOrCreateMasterSpreadsheet_(rootFolder);
  summary.spreadsheetId = spreadsheet.getId();
  summary.spreadsheetUrl = spreadsheet.getUrl();

  ensureSheet_(spreadsheet, APP.sheets.submissions.name, APP.sheets.submissions.headers);
  ensureSheet_(spreadsheet, APP.sheets.rules.name, APP.sheets.rules.headers);
  ensureSheet_(spreadsheet, APP.sheets.submissionControls.name, APP.sheets.submissionControls.headers);
  ensureSheet_(spreadsheet, APP.sheets.issueTemplates.name, APP.sheets.issueTemplates.headers);
  ensureSheet_(spreadsheet, APP.sheets.users.name, APP.sheets.users.headers);
  ensureSheet_(spreadsheet, APP.sheets.auditLog.name, APP.sheets.auditLog.headers);
  ensureSheet_(spreadsheet, APP.sheets.otherRequests.name, APP.sheets.otherRequests.headers);

  seedRules_(spreadsheet.getSheetByName(APP.sheets.rules.name));
  seedIssueTemplates_(spreadsheet.getSheetByName(APP.sheets.issueTemplates.name));
  seedUsers_(spreadsheet.getSheetByName(APP.sheets.users.name));

  createFolderTree_(rootFolder);

  APP.props.setProperties({
    APP_NAME: APP.name,
    ROOT_FOLDER_ID: rootFolder.getId(),
    MASTER_SPREADSHEET_ID: spreadsheet.getId()
  }, true);

  const webAppUrl = ScriptApp.getService().getUrl();
  summary.webAppUrl = webAppUrl || '(deploy as web app first)';
  summary.pages = {
    submit: webAppUrl ? webAppUrl + '?page=submit' : '',
    status: webAppUrl ? webAppUrl + '?page=status' : '',
    admin:  webAppUrl ? webAppUrl + '?page=admin'  : ''
  };

  Logger.log(JSON.stringify(summary, null, 2));
  return summary;
}

function setup() {
  return bootstrap();
}

function preflight() {
  requireSystemAdmin_();
  const report = getDeploymentReadiness_(true, { includeStorageIds: true });
  Logger.log(JSON.stringify(report, null, 2));
  return report;
}

function getDeploymentReadiness() {
  requireSystemAdmin_();
  return getDeploymentReadiness_(true, { includeStorageIds: false });
}

function getClientBuildInfo_() {
  return {
    appName: DEPLOYMENT_INFO.appName,
    version: DEPLOYMENT_INFO.version,
    channel: DEPLOYMENT_INFO.channel,
    updatedAt: DEPLOYMENT_INFO.updatedAt,
    targetDeploymentId: DEPLOYMENT_INFO.targetDeploymentId,
    targetUrl: DEPLOYMENT_INFO.targetUrl,
    access: DEPLOYMENT_INFO.access
  };
}

function getDeploymentReadiness_(deep, options) {
  options = options || {};
  const props = APP.props.getProperties();
  const report = {
    appName: APP.name,
    version: DEPLOYMENT_INFO.version,
    channel: DEPLOYMENT_INFO.channel,
    checkedAt: formatAppTimestamp_(new Date()),
    timeZone: getAppTimeZone_(),
    scriptId: DEPLOYMENT_INFO.scriptId,
    targetDeploymentId: DEPLOYMENT_INFO.targetDeploymentId,
    targetUrl: DEPLOYMENT_INFO.targetUrl,
    access: DEPLOYMENT_INFO.access,
    executeAs: DEPLOYMENT_INFO.executeAs,
    webAppUrl: '',
    ready: false,
    status: 'checking',
    summary: '',
    checks: [],
    warnings: []
  };

  const requiredProps = ['APP_NAME', 'ROOT_FOLDER_ID', 'MASTER_SPREADSHEET_ID'];
  const missingProps = requiredProps.filter(function(name) {
    return !String(props[name] || '').trim();
  });
  addReadinessCheck_(
    report,
    'Script properties',
    missingProps.length === 0,
    missingProps.length ? ('Missing: ' + missingProps.join(', ')) : 'Required app, Drive, and spreadsheet properties are set.'
  );

  if (props.APP_NAME && props.APP_NAME !== APP.name) {
    report.warnings.push('APP_NAME is set to "' + props.APP_NAME + '"; UI falls back safely but the deployment title should normally match "' + APP.name + '".');
  }

  try {
    const serviceUrl = ScriptApp.getService().getUrl() || '';
    report.webAppUrl = serviceUrl;
    addReadinessCheck_(
      report,
      'Web app deployment',
      !!serviceUrl,
      serviceUrl || 'No web app URL returned. Deploy the script as a web app before sharing.'
    );
    if (serviceUrl && serviceUrl.indexOf(DEPLOYMENT_INFO.targetDeploymentId) === -1) {
      report.warnings.push('Script service URL does not match the configured test deployment ID. This can happen when viewing a dev endpoint, but check deployments before sharing.');
    }
  } catch (err) {
    addReadinessCheck_(report, 'Web app deployment', false, getErrorMessage_(err));
  }

  addReadinessCheck_(
    report,
    'Access mode',
    DEPLOYMENT_INFO.access === 'DOMAIN',
    'Configured for domain users only. Anonymous visitors will be asked to sign in.'
  );

  if (!deep) {
    return finalizeReadinessReport_(report);
  }

  if (props.ROOT_FOLDER_ID) {
    try {
      const folder = DriveApp.getFolderById(props.ROOT_FOLDER_ID);
      if (options.includeStorageIds) report.rootFolderId = props.ROOT_FOLDER_ID;
      addReadinessCheck_(report, 'Drive storage', !!folder, folder ? ('Root folder: ' + folder.getName()) : 'Root folder not found.');
    } catch (err) {
      addReadinessCheck_(report, 'Drive storage', false, getErrorMessage_(err));
    }
  } else {
    addReadinessCheck_(report, 'Drive storage', false, 'ROOT_FOLDER_ID is missing.');
  }

  if (props.MASTER_SPREADSHEET_ID) {
    try {
      const ss = SpreadsheetApp.openById(props.MASTER_SPREADSHEET_ID);
      if (options.includeStorageIds) report.masterSpreadsheetId = props.MASTER_SPREADSHEET_ID;
      addReadinessCheck_(report, 'Master spreadsheet', !!ss, ss ? ('Spreadsheet: ' + ss.getName()) : 'Spreadsheet not found.');
      checkSheetSchemasForReadiness_(report, ss);
      checkSeedDataForReadiness_(report, ss);
    } catch (err) {
      addReadinessCheck_(report, 'Master spreadsheet', false, getErrorMessage_(err));
    }
  } else {
    addReadinessCheck_(report, 'Master spreadsheet', false, 'MASTER_SPREADSHEET_ID is missing.');
  }

  return finalizeReadinessReport_(report);
}

function addReadinessCheck_(report, name, ok, detail) {
  report.checks.push({
    name: name,
    ok: !!ok,
    detail: String(detail || '')
  });
}

function checkSheetSchemasForReadiness_(report, ss) {
  const problems = [];
  Object.keys(APP.sheets).forEach(function(key) {
    const cfg = APP.sheets[key];
    const sheet = ss.getSheetByName(cfg.name);
    if (!sheet) {
      problems.push(cfg.name + ' sheet missing');
      return;
    }
    const lastCol = Math.max(sheet.getLastColumn(), cfg.headers.length);
    const headers = sheet.getRange(1, 1, 1, lastCol).getDisplayValues()[0];
    const headerSet = {};
    headers.forEach(function(h) {
      if (h) headerSet[String(h)] = true;
    });
    const missing = cfg.headers.filter(function(h) {
      return !headerSet[h];
    });
    if (missing.length) {
      problems.push(cfg.name + ' missing headers: ' + missing.join(', '));
    }
  });

  addReadinessCheck_(
    report,
    'Sheets and headers',
    problems.length === 0,
    problems.length ? problems.slice(0, 4).join(' | ') : 'All configured sheets and required headers are present.'
  );
  if (problems.length > 4) {
    report.warnings.push((problems.length - 4) + ' additional sheet/header issue(s) omitted from the short readiness display.');
  }
}

function checkSeedDataForReadiness_(report, ss) {
  const rulesSheet = ss.getSheetByName(APP.sheets.rules.name);
  const issuesSheet = ss.getSheetByName(APP.sheets.issueTemplates.name);
  const usersSheet = ss.getSheetByName(APP.sheets.users.name);
  const activeRules = countReadinessRows_(rulesSheet);
  const issueTemplates = countReadinessRows_(issuesSheet);
  const users = countReadinessRows_(usersSheet);

  addReadinessCheck_(report, 'Rules seed data', activeRules >= APP.sampleRules.length, activeRules + ' rule row(s) available.');
  addReadinessCheck_(report, 'Issue templates', issueTemplates >= APP.sampleIssues.length, issueTemplates + ' issue template row(s) available.');
  addReadinessCheck_(report, 'Role records', users > 0, users + ' user/role row(s) available.');
}

function countReadinessRows_(sheet) {
  if (!sheet) return 0;
  return Math.max(0, sheet.getLastRow() - 1);
}

function finalizeReadinessReport_(report) {
  const failed = report.checks.filter(function(check) { return !check.ok; });
  report.ready = failed.length === 0;
  report.status = failed.length ? 'action_needed' : (report.warnings.length ? 'ready_with_warnings' : 'ready');
  report.summary = failed.length
    ? (failed.length + ' readiness check(s) need attention.')
    : (report.warnings.length ? 'Ready with warning(s).' : 'Ready for test deployment.');
  return report;
}

function getErrorMessage_(err) {
  return String((err && err.message) || err || 'Unknown error');
}

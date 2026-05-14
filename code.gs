/**
 * Public-safe snapshot generated from the split Apps Script source.
 *
 * Sanitisation notes:
 * - live Apps Script deployment IDs and spreadsheet/Drive IDs are intentionally omitted
 * - staff and student emails are replaced with example.edu placeholders
 * - teacher names are replaced with generic labels
 * - teacher class rosters use synthetic demo students only
 * - configure school-specific contacts, rosters, script properties, and deployments locally
 */

/* ============================================================
   00_ConfigAndReadiness.js
   ============================================================ */

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
  version: 'public-github-sanitized-class-submission-sync',
  channel: 'github-reference',
  updatedAt: '2026-05-14',
  scriptId: '',
  targetDeploymentId: '',
  targetUrl: '',
  access: 'CONFIGURE_IN_APPS_SCRIPT',
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
    "Teacher A": "teacher.a@example.edu",
    "Teacher B": "teacher.b@example.edu",
    "Teacher C": "teacher.c@example.edu",
    "Teacher D": "teacher.d@example.edu",
    "Teacher E": "teacher.e@example.edu",
    "Teacher F": "teacher.f@example.edu",
    "Teacher G": "teacher.g@example.edu",
    "Teacher H": "teacher.h@example.edu",
    "Teacher I": "teacher.i@example.edu"
  },

  teacherBetaClasses: [
    { teacher: "Teacher A", teacher_email: "teacher.a@example.edu", year_group: "Y6", class_no: "6.2", label: "Class 6.2", roster: [
      { homeroom: "Y06 Demo", student_no: "1", name: "Demo Student 001", email: "student001@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "2", name: "Demo Student 002", email: "student002@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "3", name: "Demo Student 003", email: "student003@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "4", name: "Demo Student 004", email: "student004@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "5", name: "Demo Student 005", email: "student005@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "6", name: "Demo Student 006", email: "student006@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "7", name: "Demo Student 007", email: "student007@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "8", name: "Demo Student 008", email: "student008@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "9", name: "Demo Student 009", email: "student009@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "10", name: "Demo Student 010", email: "student010@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "11", name: "Demo Student 011", email: "student011@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "12", name: "Demo Student 012", email: "student012@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "13", name: "Demo Student 013", email: "student013@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "14", name: "Demo Student 014", email: "student014@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "15", name: "Demo Student 015", email: "student015@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "16", name: "Demo Student 016", email: "student016@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "17", name: "Demo Student 017", email: "student017@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "18", name: "Demo Student 018", email: "student018@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "19", name: "Demo Student 019", email: "student019@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "20", name: "Demo Student 020", email: "student020@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "21", name: "Demo Student 021", email: "student021@student.example.edu" }
    ] },
    { teacher: "Teacher A", teacher_email: "teacher.a@example.edu", year_group: "Y6", class_no: "6.5", label: "Class 6.5", roster: [
      { homeroom: "Y06 Demo", student_no: "1", name: "Demo Student 022", email: "student022@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "2", name: "Demo Student 023", email: "student023@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "3", name: "Demo Student 024", email: "student024@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "4", name: "Demo Student 025", email: "student025@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "5", name: "Demo Student 026", email: "student026@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "6", name: "Demo Student 027", email: "student027@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "7", name: "Demo Student 028", email: "student028@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "8", name: "Demo Student 029", email: "student029@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "9", name: "Demo Student 030", email: "student030@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "10", name: "Demo Student 031", email: "student031@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "11", name: "Demo Student 032", email: "student032@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "12", name: "Demo Student 033", email: "student033@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "13", name: "Demo Student 034", email: "student034@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "14", name: "Demo Student 035", email: "student035@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "15", name: "Demo Student 036", email: "student036@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "16", name: "Demo Student 037", email: "student037@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "17", name: "Demo Student 038", email: "student038@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "18", name: "Demo Student 039", email: "student039@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "19", name: "Demo Student 040", email: "student040@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "20", name: "Demo Student 041", email: "student041@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "21", name: "Demo Student 042", email: "student042@student.example.edu" }
    ] },
    { teacher: "Teacher A", teacher_email: "teacher.a@example.edu", year_group: "Y6", class_no: "6.8", label: "Class 6.8", roster: [
      { homeroom: "Y06 Demo", student_no: "1", name: "Demo Student 043", email: "student043@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "2", name: "Demo Student 044", email: "student044@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "3", name: "Demo Student 045", email: "student045@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "4", name: "Demo Student 046", email: "student046@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "5", name: "Demo Student 047", email: "student047@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "6", name: "Demo Student 048", email: "student048@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "7", name: "Demo Student 049", email: "student049@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "8", name: "Demo Student 050", email: "student050@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "9", name: "Demo Student 051", email: "student051@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "10", name: "Demo Student 052", email: "student052@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "11", name: "Demo Student 053", email: "student053@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "12", name: "Demo Student 054", email: "student054@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "13", name: "Demo Student 055", email: "student055@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "14", name: "Demo Student 056", email: "student056@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "15", name: "Demo Student 057", email: "student057@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "16", name: "Demo Student 058", email: "student058@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "17", name: "Demo Student 059", email: "student059@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "18", name: "Demo Student 060", email: "student060@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "19", name: "Demo Student 061", email: "student061@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "20", name: "Demo Student 062", email: "student062@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "21", name: "Demo Student 063", email: "student063@student.example.edu" }
    ] },
    { teacher: "Teacher A", teacher_email: "teacher.a@example.edu", year_group: "Y7", class_no: "7.2", label: "Class 7.2", roster: [
      { homeroom: "Y07 Demo", student_no: "1", name: "Demo Student 064", email: "student064@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "2", name: "Demo Student 065", email: "student065@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "3", name: "Demo Student 066", email: "student066@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "4", name: "Demo Student 067", email: "student067@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "5", name: "Demo Student 068", email: "student068@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "6", name: "Demo Student 069", email: "student069@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "7", name: "Demo Student 070", email: "student070@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "8", name: "Demo Student 071", email: "student071@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "9", name: "Demo Student 072", email: "student072@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "10", name: "Demo Student 073", email: "student073@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "11", name: "Demo Student 074", email: "student074@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "12", name: "Demo Student 075", email: "student075@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "13", name: "Demo Student 076", email: "student076@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "14", name: "Demo Student 077", email: "student077@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "15", name: "Demo Student 078", email: "student078@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "16", name: "Demo Student 079", email: "student079@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "17", name: "Demo Student 080", email: "student080@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "18", name: "Demo Student 081", email: "student081@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "19", name: "Demo Student 082", email: "student082@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "20", name: "Demo Student 083", email: "student083@student.example.edu" }
    ] },
    { teacher: "Teacher A", teacher_email: "teacher.a@example.edu", year_group: "Y7", class_no: "7.5", label: "Class 7.5", roster: [
      { homeroom: "Y07 Demo", student_no: "1", name: "Demo Student 084", email: "student084@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "2", name: "Demo Student 085", email: "student085@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "3", name: "Demo Student 086", email: "student086@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "4", name: "Demo Student 087", email: "student087@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "5", name: "Demo Student 088", email: "student088@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "6", name: "Demo Student 089", email: "student089@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "7", name: "Demo Student 090", email: "student090@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "8", name: "Demo Student 091", email: "student091@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "9", name: "Demo Student 092", email: "student092@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "10", name: "Demo Student 093", email: "student093@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "11", name: "Demo Student 094", email: "student094@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "12", name: "Demo Student 095", email: "student095@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "13", name: "Demo Student 096", email: "student096@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "14", name: "Demo Student 097", email: "student097@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "15", name: "Demo Student 098", email: "student098@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "16", name: "Demo Student 099", email: "student099@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "17", name: "Demo Student 100", email: "student100@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "18", name: "Demo Student 101", email: "student101@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "19", name: "Demo Student 102", email: "student102@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "20", name: "Demo Student 103", email: "student103@student.example.edu" }
    ] },
    { teacher: "Teacher A", teacher_email: "teacher.a@example.edu", year_group: "Y7", class_no: "7.8", label: "Class 7.8", roster: [
      { homeroom: "Y07 Demo", student_no: "1", name: "Demo Student 104", email: "student104@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "2", name: "Demo Student 105", email: "student105@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "3", name: "Demo Student 106", email: "student106@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "4", name: "Demo Student 107", email: "student107@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "5", name: "Demo Student 108", email: "student108@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "6", name: "Demo Student 109", email: "student109@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "7", name: "Demo Student 110", email: "student110@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "8", name: "Demo Student 111", email: "student111@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "9", name: "Demo Student 112", email: "student112@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "10", name: "Demo Student 113", email: "student113@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "11", name: "Demo Student 114", email: "student114@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "12", name: "Demo Student 115", email: "student115@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "13", name: "Demo Student 116", email: "student116@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "14", name: "Demo Student 117", email: "student117@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "15", name: "Demo Student 118", email: "student118@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "16", name: "Demo Student 119", email: "student119@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "17", name: "Demo Student 120", email: "student120@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "18", name: "Demo Student 121", email: "student121@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "19", name: "Demo Student 122", email: "student122@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "20", name: "Demo Student 123", email: "student123@student.example.edu" }
    ] },
    { teacher: "Teacher B", teacher_email: "teacher.b@example.edu", year_group: "Y6", class_no: "6.7", label: "Class 6.7", roster: [
      { homeroom: "Y06 Demo", student_no: "1", name: "Demo Student 124", email: "student124@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "2", name: "Demo Student 125", email: "student125@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "3", name: "Demo Student 126", email: "student126@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "4", name: "Demo Student 127", email: "student127@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "5", name: "Demo Student 128", email: "student128@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "6", name: "Demo Student 129", email: "student129@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "7", name: "Demo Student 130", email: "student130@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "8", name: "Demo Student 131", email: "student131@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "9", name: "Demo Student 132", email: "student132@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "10", name: "Demo Student 133", email: "student133@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "11", name: "Demo Student 134", email: "student134@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "12", name: "Demo Student 135", email: "student135@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "13", name: "Demo Student 136", email: "student136@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "14", name: "Demo Student 137", email: "student137@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "15", name: "Demo Student 138", email: "student138@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "16", name: "Demo Student 139", email: "student139@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "17", name: "Demo Student 140", email: "student140@student.example.edu" }
    ] },
    { teacher: "Teacher B", teacher_email: "teacher.b@example.edu", year_group: "Y7", class_no: "7.6", label: "Class 7.6", roster: [
      { homeroom: "Y07 Demo", student_no: "1", name: "Demo Student 141", email: "student141@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "2", name: "Demo Student 142", email: "student142@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "3", name: "Demo Student 143", email: "student143@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "4", name: "Demo Student 144", email: "student144@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "5", name: "Demo Student 145", email: "student145@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "6", name: "Demo Student 146", email: "student146@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "7", name: "Demo Student 147", email: "student147@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "8", name: "Demo Student 148", email: "student148@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "9", name: "Demo Student 149", email: "student149@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "10", name: "Demo Student 150", email: "student150@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "11", name: "Demo Student 151", email: "student151@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "12", name: "Demo Student 152", email: "student152@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "13", name: "Demo Student 153", email: "student153@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "14", name: "Demo Student 154", email: "student154@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "15", name: "Demo Student 155", email: "student155@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "16", name: "Demo Student 156", email: "student156@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "17", name: "Demo Student 157", email: "student157@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "18", name: "Demo Student 158", email: "student158@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "19", name: "Demo Student 159", email: "student159@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "20", name: "Demo Student 160", email: "student160@student.example.edu" }
    ] },
    { teacher: "Teacher B", teacher_email: "teacher.b@example.edu", year_group: "Y8", class_no: "8.3", label: "Class 8.3", roster: [
      { homeroom: "Y08 Demo", student_no: "1", name: "Demo Student 161", email: "student161@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "2", name: "Demo Student 162", email: "student162@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "3", name: "Demo Student 163", email: "student163@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "4", name: "Demo Student 164", email: "student164@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "5", name: "Demo Student 165", email: "student165@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "6", name: "Demo Student 166", email: "student166@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "7", name: "Demo Student 167", email: "student167@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "8", name: "Demo Student 168", email: "student168@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "9", name: "Demo Student 169", email: "student169@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "10", name: "Demo Student 170", email: "student170@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "11", name: "Demo Student 171", email: "student171@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "12", name: "Demo Student 172", email: "student172@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "13", name: "Demo Student 173", email: "student173@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "14", name: "Demo Student 174", email: "student174@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "15", name: "Demo Student 175", email: "student175@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "16", name: "Demo Student 176", email: "student176@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "17", name: "Demo Student 177", email: "student177@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "18", name: "Demo Student 178", email: "student178@student.example.edu" }
    ] },
    { teacher: "Teacher B", teacher_email: "teacher.b@example.edu", year_group: "Y9", class_no: "9.1", label: "Class 9.1", roster: [
      { homeroom: "Y09 Demo", student_no: "1", name: "Demo Student 179", email: "student179@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "2", name: "Demo Student 180", email: "student180@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "3", name: "Demo Student 181", email: "student181@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "4", name: "Demo Student 182", email: "student182@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "5", name: "Demo Student 183", email: "student183@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "6", name: "Demo Student 184", email: "student184@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "7", name: "Demo Student 185", email: "student185@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "8", name: "Demo Student 186", email: "student186@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "9", name: "Demo Student 187", email: "student187@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "10", name: "Demo Student 188", email: "student188@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "11", name: "Demo Student 189", email: "student189@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "12", name: "Demo Student 190", email: "student190@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "13", name: "Demo Student 191", email: "student191@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "14", name: "Demo Student 192", email: "student192@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "15", name: "Demo Student 193", email: "student193@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "16", name: "Demo Student 194", email: "student194@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "17", name: "Demo Student 195", email: "student195@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "18", name: "Demo Student 196", email: "student196@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "19", name: "Demo Student 197", email: "student197@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "20", name: "Demo Student 198", email: "student198@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "21", name: "Demo Student 199", email: "student199@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "22", name: "Demo Student 200", email: "student200@student.example.edu" }
    ] },
    { teacher: "Teacher B", teacher_email: "teacher.b@example.edu", year_group: "Y9", class_no: "9.6", label: "Class 9.6", roster: [
      { homeroom: "Y09 Demo", student_no: "1", name: "Demo Student 201", email: "student201@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "2", name: "Demo Student 202", email: "student202@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "3", name: "Demo Student 203", email: "student203@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "4", name: "Demo Student 204", email: "student204@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "5", name: "Demo Student 205", email: "student205@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "6", name: "Demo Student 206", email: "student206@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "7", name: "Demo Student 207", email: "student207@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "8", name: "Demo Student 208", email: "student208@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "9", name: "Demo Student 209", email: "student209@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "10", name: "Demo Student 210", email: "student210@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "11", name: "Demo Student 211", email: "student211@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "12", name: "Demo Student 212", email: "student212@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "13", name: "Demo Student 213", email: "student213@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "14", name: "Demo Student 214", email: "student214@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "15", name: "Demo Student 215", email: "student215@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "16", name: "Demo Student 216", email: "student216@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "17", name: "Demo Student 217", email: "student217@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "18", name: "Demo Student 218", email: "student218@student.example.edu" }
    ] },
    { teacher: "Teacher B", teacher_email: "teacher.b@example.edu", year_group: "Y10", class_no: "10.3", label: "Class 10.3", roster: [
      { homeroom: "Y10 Demo", student_no: "1", name: "Demo Student 219", email: "student219@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "2", name: "Demo Student 220", email: "student220@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "3", name: "Demo Student 221", email: "student221@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "4", name: "Demo Student 222", email: "student222@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "5", name: "Demo Student 223", email: "student223@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "6", name: "Demo Student 224", email: "student224@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "7", name: "Demo Student 225", email: "student225@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "8", name: "Demo Student 226", email: "student226@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "9", name: "Demo Student 227", email: "student227@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "10", name: "Demo Student 228", email: "student228@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "11", name: "Demo Student 229", email: "student229@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "12", name: "Demo Student 230", email: "student230@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "13", name: "Demo Student 231", email: "student231@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "14", name: "Demo Student 232", email: "student232@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "15", name: "Demo Student 233", email: "student233@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "16", name: "Demo Student 234", email: "student234@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "17", name: "Demo Student 235", email: "student235@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "18", name: "Demo Student 236", email: "student236@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "19", name: "Demo Student 237", email: "student237@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "20", name: "Demo Student 238", email: "student238@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "21", name: "Demo Student 239", email: "student239@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "22", name: "Demo Student 240", email: "student240@student.example.edu" }
    ] },
    { teacher: "Teacher C", teacher_email: "teacher.c@example.edu", year_group: "Y6", class_no: "6.9", label: "Class 6.9", roster: [
      { homeroom: "Y06 Demo", student_no: "1", name: "Demo Student 241", email: "student241@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "2", name: "Demo Student 242", email: "student242@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "3", name: "Demo Student 243", email: "student243@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "4", name: "Demo Student 244", email: "student244@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "5", name: "Demo Student 245", email: "student245@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "6", name: "Demo Student 246", email: "student246@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "7", name: "Demo Student 247", email: "student247@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "8", name: "Demo Student 248", email: "student248@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "9", name: "Demo Student 249", email: "student249@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "10", name: "Demo Student 250", email: "student250@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "11", name: "Demo Student 251", email: "student251@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "12", name: "Demo Student 252", email: "student252@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "13", name: "Demo Student 253", email: "student253@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "14", name: "Demo Student 254", email: "student254@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "15", name: "Demo Student 255", email: "student255@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "16", name: "Demo Student 256", email: "student256@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "17", name: "Demo Student 257", email: "student257@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "18", name: "Demo Student 258", email: "student258@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "19", name: "Demo Student 259", email: "student259@student.example.edu" },
      { homeroom: "Y06 Demo", student_no: "20", name: "Demo Student 260", email: "student260@student.example.edu" }
    ] },
    { teacher: "Teacher C", teacher_email: "teacher.c@example.edu", year_group: "Y7", class_no: "7.3", label: "Class 7.3", roster: [
      { homeroom: "Y07 Demo", student_no: "1", name: "Demo Student 261", email: "student261@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "2", name: "Demo Student 262", email: "student262@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "3", name: "Demo Student 263", email: "student263@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "4", name: "Demo Student 264", email: "student264@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "5", name: "Demo Student 265", email: "student265@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "6", name: "Demo Student 266", email: "student266@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "7", name: "Demo Student 267", email: "student267@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "8", name: "Demo Student 268", email: "student268@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "9", name: "Demo Student 269", email: "student269@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "10", name: "Demo Student 270", email: "student270@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "11", name: "Demo Student 271", email: "student271@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "12", name: "Demo Student 272", email: "student272@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "13", name: "Demo Student 273", email: "student273@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "14", name: "Demo Student 274", email: "student274@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "15", name: "Demo Student 275", email: "student275@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "16", name: "Demo Student 276", email: "student276@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "17", name: "Demo Student 277", email: "student277@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "18", name: "Demo Student 278", email: "student278@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "19", name: "Demo Student 279", email: "student279@student.example.edu" },
      { homeroom: "Y07 Demo", student_no: "20", name: "Demo Student 280", email: "student280@student.example.edu" }
    ] },
    { teacher: "Teacher C", teacher_email: "teacher.c@example.edu", year_group: "Y8", class_no: "8.7", label: "Class 8.7", roster: [
      { homeroom: "Y08 Demo", student_no: "1", name: "Demo Student 281", email: "student281@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "2", name: "Demo Student 282", email: "student282@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "3", name: "Demo Student 283", email: "student283@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "4", name: "Demo Student 284", email: "student284@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "5", name: "Demo Student 285", email: "student285@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "6", name: "Demo Student 286", email: "student286@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "7", name: "Demo Student 287", email: "student287@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "8", name: "Demo Student 288", email: "student288@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "9", name: "Demo Student 289", email: "student289@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "10", name: "Demo Student 290", email: "student290@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "11", name: "Demo Student 291", email: "student291@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "12", name: "Demo Student 292", email: "student292@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "13", name: "Demo Student 293", email: "student293@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "14", name: "Demo Student 294", email: "student294@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "15", name: "Demo Student 295", email: "student295@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "16", name: "Demo Student 296", email: "student296@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "17", name: "Demo Student 297", email: "student297@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "18", name: "Demo Student 298", email: "student298@student.example.edu" },
      { homeroom: "Y08 Demo", student_no: "19", name: "Demo Student 299", email: "student299@student.example.edu" }
    ] },
    { teacher: "Teacher C", teacher_email: "teacher.c@example.edu", year_group: "Y9", class_no: "9.2", label: "Class 9.2", roster: [
      { homeroom: "Y09 Demo", student_no: "1", name: "Demo Student 300", email: "student300@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "2", name: "Demo Student 301", email: "student301@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "3", name: "Demo Student 302", email: "student302@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "4", name: "Demo Student 303", email: "student303@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "5", name: "Demo Student 304", email: "student304@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "6", name: "Demo Student 305", email: "student305@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "7", name: "Demo Student 306", email: "student306@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "8", name: "Demo Student 307", email: "student307@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "9", name: "Demo Student 308", email: "student308@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "10", name: "Demo Student 309", email: "student309@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "11", name: "Demo Student 310", email: "student310@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "12", name: "Demo Student 311", email: "student311@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "13", name: "Demo Student 312", email: "student312@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "14", name: "Demo Student 313", email: "student313@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "15", name: "Demo Student 314", email: "student314@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "16", name: "Demo Student 315", email: "student315@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "17", name: "Demo Student 316", email: "student316@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "18", name: "Demo Student 317", email: "student317@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "19", name: "Demo Student 318", email: "student318@student.example.edu" }
    ] },
    { teacher: "Teacher C", teacher_email: "teacher.c@example.edu", year_group: "Y9", class_no: "9.5", label: "Class 9.5", roster: [
      { homeroom: "Y09 Demo", student_no: "1", name: "Demo Student 319", email: "student319@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "2", name: "Demo Student 320", email: "student320@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "3", name: "Demo Student 321", email: "student321@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "4", name: "Demo Student 322", email: "student322@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "5", name: "Demo Student 323", email: "student323@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "6", name: "Demo Student 324", email: "student324@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "7", name: "Demo Student 325", email: "student325@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "8", name: "Demo Student 326", email: "student326@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "9", name: "Demo Student 327", email: "student327@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "10", name: "Demo Student 328", email: "student328@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "11", name: "Demo Student 329", email: "student329@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "12", name: "Demo Student 330", email: "student330@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "13", name: "Demo Student 331", email: "student331@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "14", name: "Demo Student 332", email: "student332@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "15", name: "Demo Student 333", email: "student333@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "16", name: "Demo Student 334", email: "student334@student.example.edu" },
      { homeroom: "Y09 Demo", student_no: "17", name: "Demo Student 335", email: "student335@student.example.edu" }
    ] },
    { teacher: "Teacher C", teacher_email: "teacher.c@example.edu", year_group: "Y10", class_no: "10.4", label: "Class 10.4", roster: [
      { homeroom: "Y10 Demo", student_no: "1", name: "Demo Student 336", email: "student336@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "2", name: "Demo Student 337", email: "student337@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "3", name: "Demo Student 338", email: "student338@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "4", name: "Demo Student 339", email: "student339@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "5", name: "Demo Student 340", email: "student340@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "6", name: "Demo Student 341", email: "student341@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "7", name: "Demo Student 342", email: "student342@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "8", name: "Demo Student 343", email: "student343@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "9", name: "Demo Student 344", email: "student344@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "10", name: "Demo Student 345", email: "student345@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "11", name: "Demo Student 346", email: "student346@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "12", name: "Demo Student 347", email: "student347@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "13", name: "Demo Student 348", email: "student348@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "14", name: "Demo Student 349", email: "student349@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "15", name: "Demo Student 350", email: "student350@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "16", name: "Demo Student 351", email: "student351@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "17", name: "Demo Student 352", email: "student352@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "18", name: "Demo Student 353", email: "student353@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "19", name: "Demo Student 354", email: "student354@student.example.edu" },
      { homeroom: "Y10 Demo", student_no: "20", name: "Demo Student 355", email: "student355@student.example.edu" }
    ] }
  ],

  adminEmailOverrides: [
    'admin@example.edu',
    'technician@example.edu',
    'teacher.a@example.edu',
    'teacher.b@example.edu',
    'teacher.c@example.edu'
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


/* ============================================================
   10_WebAndSubmissionApi.js
   ============================================================ */

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

function getSubmissionControlsForClient() {
  return getSubmissionControlRows_()
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


/* ============================================================
   20_WorkflowEmailValidation.js
   ============================================================ */

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
  var body =
    '<p>Dear ' + escapeHtml_(record.requester_name || 'Requester') + ',</p>' +
    '<p>Your Special Request has been received and is now waiting for review.</p>' +
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


/* ============================================================
   30_DataAdminSetup.js
   ============================================================ */

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
  return getSubmissionControlRows_().sort(compareSubmissionControls_);
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


/* ============================================================
   80_UiShell.js
   ============================================================ */

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
      return /^[^\\s@]+@(student\\.)?vsa\\.edu\\.hk$/i.test(String(email || '').trim());
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
    function getSubmissionControlDecisionClient_(yearGroup, classNo) {
      var targetYear = String(yearGroup || '').trim().toUpperCase();
      var requestedClass = String(classNo || '').trim();
      var targetClass = normalizeClassNoClient_(requestedClass);
      if (!targetYear) return { blocked: false, status: 'open', message: '', scope_label: '' };

      var controls = (BOOT.submissionControls || []).filter(function(row) {
        if (String(row.active || '').toLowerCase() === 'false') return false;
        if (String(row.year_group || '').trim().toUpperCase() !== targetYear) return false;
        var controlClass = normalizeClassNoClient_(row.class_no);
        return !controlClass || controlClass === targetClass;
      }).sort(compareSubmissionControlsClient_);

      var fallbackScope = targetYear + (requestedClass ? ' Class ' + requestedClass : '');
      if (!controls.length) return { blocked: false, status: 'open', message: '', scope_label: fallbackScope };

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
          deadline_at: matched.deadline_at || ''
        };
      }

      var deadlineMs = matched.deadline_at ? new Date(matched.deadline_at).getTime() : NaN;
      if (!isNaN(deadlineMs) && deadlineMs < Date.now()) {
        return {
          blocked: true,
          status: 'deadline_passed',
          message: customMessage || ('The submission deadline for ' + scopeLabel + ' passed on ' + deadlineText + '. Please speak to your teacher if you need an exception.'),
          scope_label: scopeLabel,
          deadline_at: matched.deadline_at || ''
        };
      }

      return {
        blocked: false,
        status: matched.deadline_at ? 'deadline_set' : 'open',
        message: customMessage || (deadlineText ? ('Submission deadline for ' + scopeLabel + ': ' + deadlineText + '.') : ''),
        scope_label: scopeLabel,
        deadline_at: matched.deadline_at || ''
      };
    }
    function renderSubmissionControlNotice_(el, decision) {
      if (!el) return;
      if (!decision || (!decision.message && !decision.blocked)) {
        el.style.display = 'none';
        el.innerHTML = '';
        return;
      }
      var icon = decision.blocked ? '&#128274;' : '&#9200;';
      var cls = decision.blocked ? 'alert alert-warning' : 'alert alert-info';
      el.className = cls;
      el.innerHTML = '<span class="alert-icon">' + icon + '</span><span>' + esc(decision.message) + '</span>';
      el.style.display = 'flex';
    }
    function syncSubmissionControls_(controls) {
      BOOT.submissionControls = controls || [];
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

    function shouldShowStudentLaserCapacityNotice_() {
      var role = String((BOOT.currentUser && BOOT.currentUser.role) || 'guest');
      if (role !== 'student' && role !== 'guest') return false;
      if (!LASER_CAPACITY_NOTICE || LASER_CAPACITY_NOTICE.active === false) return false;
      try {
        if (sessionStorage.getItem(laserCapacitySeenKey_()) === '1') return false;
      } catch(e) {}
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

    function showStudentLaserCapacityNotice_() {
      if (!shouldShowStudentLaserCapacityNotice_()) return;
      if (document.getElementById('laserCapacityOverlay')) return;
      var summary = LASER_CAPACITY_NOTICE.summary || 'One laser cutter is currently offline. Only one laser cutter is running, so laser jobs may move more slowly than usual.';
      var detail = LASER_CAPACITY_NOTICE.detail || 'Please avoid duplicate submissions and check Status for updates.';
      var scale = LASER_CAPACITY_NOTICE.scaleLabel || ('Busy starts at ' + QUEUE_BUSY_THRESHOLD + ' active queue items. Heavy starts above ' + QUEUE_HEAVY_THRESHOLD + ' active queue items.');
      var overlay = document.createElement('div');
      overlay.id = 'laserCapacityOverlay';
      overlay.className = 'overlay';
      overlay.innerHTML =
        '<div class="modal laser-capacity-modal" role="dialog" aria-modal="true" aria-labelledby="laserCapacityTitle" tabindex="-1">' +
          '<div class="modal-head"><h3 id="laserCapacityTitle">&#128293; ' + esc(LASER_CAPACITY_NOTICE.title || 'Laser queue update') + '</h3><button class="modal-close" onclick="closeLaserCapacityNotice_()" aria-label="Close laser queue update">&times;</button></div>' +
          '<div class="laser-capacity-body">' +
            '<div class="laser-capacity-alert"><strong>Reduced laser capacity</strong>' + esc(summary) + '</div>' +
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
      banner.innerHTML = '\\ud83d\\udc41 Student View Preview &mdash; This is what students see. <button onclick=\"previewStudentView()\" style=\"background:#78350f;color:#fff;border:none;padding:4px 12px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;\">Exit Preview</button>';
      document.body.prepend(banner);
      switchPage('submit');
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
      loadRulesTable();
      loadSubmissionControlsTable();
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


/* ============================================================
   90_UiPages.js
   ============================================================ */

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
      <div id="submissionControlNotice" style="display:none;margin:12px 0 16px;"></div>

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
                <option value="Teacher B">Teacher B</option>
                <option value="Teacher D">Teacher D</option>
                <option value="DT technician">DT technician</option>
                <option value="Teacher C">Teacher C</option>
                <option value="Teacher E">Teacher E</option>
                <option value="Teacher G">Teacher G</option>
                <option value="Teacher A">Teacher A</option>
                <option value="Admin User">Admin User</option>
                <option value="Teacher F">Teacher F</option>
                <option value="Teacher H">Teacher H</option>
                <option value="Teacher I">Teacher I</option>
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
      <li><span><code>Y9_WongSiuMing_acrylic_v2.svg</code></span></li>
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
    <div class="section-sub">DT coursework only. Leave Class No. blank to apply the control to the whole year group.</div>
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

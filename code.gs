/**
 * Run this function ONCE from the Apps Script editor (Run > authorizeScopes)
 * to grant the script permission to send emails via MailApp.
 * After running, accept the Google authorization prompt.
 */
function authorizeScopes() {
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

const APP = {
  name: 'Design Fabrication Dashboard',
  props: PropertiesService.getScriptProperties(),

  /* Public showcase placeholder — replace before deployment */
  technicianCcEmail: 'dt-technician@example.edu',

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
        'updated_at',
        'updated_by'
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
    'Teacher A': 'teacher.a@example.edu',
    'Teacher B': 'teacher.b@example.edu',
    'Teacher C': 'teacher.c@example.edu',
    'Teacher D': 'teacher.d@example.edu',
    'Teacher E': 'teacher.e@example.edu'
  }
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
  const summary = {};

  const rootFolder = getOrCreateRootFolder_();
  summary.rootFolderId = rootFolder.getId();
  summary.rootFolderUrl = rootFolder.getUrl();

  const spreadsheet = getOrCreateMasterSpreadsheet_(rootFolder);
  summary.spreadsheetId = spreadsheet.getId();
  summary.spreadsheetUrl = spreadsheet.getUrl();

  ensureSheet_(spreadsheet, APP.sheets.submissions.name, APP.sheets.submissions.headers);
  ensureSheet_(spreadsheet, APP.sheets.rules.name, APP.sheets.rules.headers);
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

/* =========================
   WEB APP
   ========================= */

function doGet(e) {
  const page = ((e && e.parameter && e.parameter.page) || 'submit').toLowerCase();
  const safePage = ['submit', 'status', 'admin', 'machines', 'help', 'rules', 'users', 'audit', 'other'].includes(page) ? page : 'submit';

  let webAppUrl = '';
  try {
    const u = ScriptApp.getService().getUrl();
    // Accept both /exec (production) and /dev (test) GAS endpoints
    if (u && u.includes('script.google.com') && (u.includes('/exec') || u.includes('/dev'))) webAppUrl = u;
  } catch(e) {}
  const user = getCurrentUser_();
  const adminPages = ['admin', 'rules', 'users', 'audit'];
  /* Server-side redirect: force students/guests to 'submit' if they try admin pages */
  const resolvedPage = (!user.isAdmin && adminPages.includes(safePage)) ? 'submit' : safePage;

  const boot = {
    page: resolvedPage,
    baseUrl: webAppUrl,
    rules: getRulesForClient(),
    issueTemplates: user.isAdmin ? getIssueTemplatesForClient() : [],
    currentUser: user,
    statuses: user.isAdmin ? Object.values(APP.status) : [],
    appName: APP.props.getProperty('APP_NAME') || APP.name,
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
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/* =========================
   PUBLIC SERVER FUNCTIONS
   ========================= */

function getRulesForClient() {
  return getRowsAsObjects_(APP.sheets.rules.name).filter(r => String(r.active).toLowerCase() !== 'false');
}

function submitSubmission(payload) {
  validateSubmission_(payload);

  const now = new Date();
  const submissionId = Utilities.getUuid();

  const record = {
    submission_id: submissionId,
    created_at: now.toISOString(),
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
    updated_at: now.toISOString(),
    updated_by: payload.student_email || ''
  };

  appendObject_(APP.sheets.submissions.name, record);

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
  validateOtherRequest_(payload);

  const now = new Date();
  const requestId = 'OR-' + Utilities.getUuid().substring(0, 8).toUpperCase();

  const record = {
    request_id: requestId,
    created_at: now.toISOString(),
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
    updated_at: now.toISOString(),
    updated_by: payload.requester_email || ''
  };

  appendObject_(APP.sheets.otherRequests.name, record);

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
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.teacher_in_charge_email)) throw new Error('Teacher in charge email format is invalid.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.approved_by_email)) throw new Error('Approval email format is invalid.');
  if (!['laser', '3d'].includes(payload.machine)) throw new Error('Machine must be laser or 3d.');

  if (!payload.working_file || !payload.working_file.name) throw new Error('Working file is required.');

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
  return attachSubmissionActivity_(getRowsAsObjects_(APP.sheets.otherRequests.name)
    .filter(function(r) {
      return String(r.requester_email || '').trim().toLowerCase() === target ||
             String(r.request_id || '').trim().toLowerCase() === target;
    })
    .sort(function(a, b) { return new Date(b.created_at) - new Date(a.created_at); }), 'requester_email');
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
  if (mineOnly && user.email) {
    var myEmail = user.email.toLowerCase();
    rows = rows.filter(function(r) {
      return String(r.teacher_in_charge_email||'').trim().toLowerCase() === myEmail ||
             String(r.approved_by_email||'').trim().toLowerCase() === myEmail;
    });
  }
  rows.sort(function(a, b) { return new Date(b.created_at) - new Date(a.created_at); });
  return attachSubmissionActivity_(rows, 'requester_email');
}

function updateOtherRequestStatus(requestId, status, remarks) {
  var user = requireAdmin_();
  var validStatuses = Object.values(APP.status);
  var nextStatus = String(status || '').trim();
  if (!requestId) throw new Error('requestId is required.');
  if (!validStatuses.includes(nextStatus)) throw new Error('Invalid status value.');

  /* Technician role: restrict to allowed statuses only */
  if (user.role === 'technician' && TECHNICIAN_ALLOWED_STATUSES.indexOf(nextStatus) === -1) {
    throw new Error('Technicians can only set status to: ' + TECHNICIAN_ALLOWED_STATUSES.join(', '));
  }

  var lock = LockService.getDocumentLock();
  lock.waitLock(10000);
  try {

    var sheet = getSheet_(APP.sheets.otherRequests.name);
    var values = sheet.getDataRange().getDisplayValues();
    var headers = values[0];
    var idCol = headers.indexOf('request_id');
    if (idCol === -1) throw new Error('request_id column missing.');

    for (var r = 1; r < values.length; r++) {
      if (values[r][idCol] === requestId) {
        var rowIndex = r + 1;
        var oldStatus = values[r][headers.indexOf('status')] || '';
        writeCellByHeader_(sheet, headers, rowIndex, 'status', nextStatus);
        writeCellByHeader_(sheet, headers, rowIndex, 'admin_remarks', String(remarks || '').trim());
        writeCellByHeader_(sheet, headers, rowIndex, 'updated_at', new Date().toISOString());
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

  return attachSubmissionActivity_(getRowsAsObjects_(APP.sheets.submissions.name)
    .filter(r => {
      const emailMatch = String(r.student_email || '').trim().toLowerCase() === target;
      const idMatch = String(r.submission_id || '').trim().toLowerCase() === target;
      return emailMatch || idMatch;
    })
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at)), 'student_email');
}

function getIssueTemplatesForClient() {
  return getRowsAsObjects_(APP.sheets.issueTemplates.name)
    .filter(r => String(r.active).toLowerCase() !== 'false')
    .sort((a, b) => Number(a.sort_order || 0) - Number(b.sort_order || 0));
}

function generateEmailDraft(submissionId, issueCodes, remarks) {
  requireAdmin_();

  const submission = getSubmissionById_(submissionId);
  if (!submission) throw new Error('Submission not found.');

  const allTemplates = getIssueTemplatesForClient();
  const codes = (issueCodes || '').split(',').map(s => s.trim()).filter(Boolean);
  const selectedTemplates = allTemplates.filter(t => codes.includes(t.issue_code));

  const machineName = submission.machine === '3d' ? '3D Print' : 'Laser Cut';
  const subjects = selectedTemplates.map(t => t.email_subject).filter(Boolean);
  const subject = subjects.length
    ? subjects.join(' / ') + ' — ' + submission.student_name
    : 'Submission Review — ' + submission.student_name;

  const issueHtml = selectedTemplates.map(t =>
    '<li><strong>' + escapeHtml_(t.issue_label) + '</strong><br>' + (t.email_body_html || '') + '</li>'
  ).join('');

  const body =
    '<p>Dear ' + escapeHtml_(submission.student_name) + ',</p>' +
    '<p>We reviewed your ' + escapeHtml_(machineName) + ' submission ' +
    '(<strong>' + escapeHtml_(submission.year_group) + '</strong>, Class ' +
    escapeHtml_(submission.design_class_no) + ') and found the following issue(s):</p>' +
    (issueHtml ? '<ul>' + issueHtml + '</ul>' : '') +
    (remarks ? '<p><strong>Additional remarks:</strong> ' + escapeHtml_(remarks) + '</p>' : '') +
    '<p>Please revise and resubmit your file. As a reminder:</p>' +
    '<ul>' +
    '<li>Upload the correct working file format</li>' +
    '<li>Ensure your design is within the allowed dimensions</li>' +
    '<li>Include a preview image if required</li>' +
    '</ul>' +
    '<p>If you have any questions, please speak with your teacher.</p>' +
    '<p>Best regards,<br>Design Technology Technician Team</p>';

  return {
    to: submission.student_email || '',
    subject: subject,
    body_html: body
  };
}

function generateTeacherUpdateDraft(submissionId, statusOverride, issueCodeOverride, remarksOverride) {
  const actor = requireAdmin_();
  const submission = getSubmissionById_(submissionId);
  if (!submission) throw new Error('Submission not found.');

  const status = String(statusOverride || submission.status || '').trim();
  const issueCode = String(issueCodeOverride || submission.issue_code || '').trim();
  const remarks = String(remarksOverride || submission.admin_remarks || '').trim();
  const teacherName = String(submission.design_teacher || '').trim();
  const teacherEmail = resolveTeacherEmail_(submission, teacherName);
  const statusLabel = getStatusLabel_(status);
  const machineName = submission.machine === '3d' ? '3D Print' : 'Laser Cut';

  const actionLine = getTeacherActionLine_(status);
  const issueLine = issueCode
    ? '<p><strong>Issue Code:</strong> ' + escapeHtml_(issueCode) + '</p>'
    : '';

  const body =
    '<p>Dear ' + escapeHtml_(teacherName || 'Teacher') + ',</p>' +
    '<p>This is a fabrication workflow update for your student submission.</p>' +
    '<ul>' +
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

  const subject = 'Design Technology Update - ' + (submission.student_name || 'Student') + ' - ' + statusLabel;

  return {
    to: teacherEmail || '',
    subject: subject,
    body_html: body,
    missing_to: !teacherEmail,
    teacher_name: teacherName
  };
}

function getSpreadsheetUrl() {
  requireAdmin_();
  return getSpreadsheet_().getUrl();
}

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

  // Teacher view defaults to "my students only" unless explicitly turned off.
  if (user.role === 'teacher' && String(filters.mine_only || 'true').toLowerCase() !== 'false') {
    rows = rows.filter(r => isTeacherRecordMatch_(r, user));
  } else if (mineOnly) {
    rows = rows.filter(r => isTeacherRecordMatch_(r, user));
  }

  rows.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  return attachSubmissionActivity_(rows, 'student_email');
}

function updateSubmissionStatus(submissionId, status, issueCode, remarks) {
  const user = requireAdmin_();
  const validStatuses = Object.values(APP.status);
  const nextStatus = String(status || '').trim();

  if (!submissionId) throw new Error('submissionId is required.');
  if (!validStatuses.includes(nextStatus)) throw new Error('Invalid status value.');
  if (user.role === 'technician' && TECHNICIAN_ALLOWED_STATUSES.indexOf(nextStatus) === -1) {
    throw new Error('Technician can only set approved, in_queue, in_production, or completed.');
  }

  var lock = LockService.getDocumentLock();
  lock.waitLock(10000);
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
    const issueTemplates = getIssueTemplatesForClient();
    const issueExists = issueTemplates.some(t => t.issue_code === nextIssueCode);
    if (!issueExists) throw new Error('Unknown issue code selected.');
  }

  for (let r = 1; r < values.length; r++) {
    if (values[r][idCol] === submissionId) {
      const rowIndex = r + 1;
      const oldStatus = statusCol !== -1 ? values[r][statusCol] : '';
      const oldIssueCode = issueCol !== -1 ? values[r][issueCol] : '';
      const resolvedIssueCode = issueProvided ? nextIssueCode : oldIssueCode;

      writeCellByHeader_(sheet, headers, rowIndex, 'status', nextStatus);
      writeCellByHeader_(sheet, headers, rowIndex, 'issue_code', resolvedIssueCode || '');
      writeCellByHeader_(sheet, headers, rowIndex, 'admin_remarks', nextRemarks);
      writeCellByHeader_(sheet, headers, rowIndex, 'updated_at', new Date().toISOString());
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
  const base64 = payload.base64;
  const fileName = payload.fileName;
  const mimeType = payload.mimeType || 'application/octet-stream';
  const yearGroup = payload.yearGroup || 'General';
  const bucket = payload.bucket || 'misc';

  if (!base64 || !fileName) throw new Error('Missing file payload.');

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

  /* ---------- build requester email body ---------- */
  var subject = 'Design Fabrication — ' + statusLabel + ' — ' + (req.project_name || 'Special Request');
  var body = '<p>Dear ' + requesterName + ',</p>';

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
  body += '<p>Best regards,<br>Design Technology Technician Team</p>';

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
      (APP.technicianCcEmail ? ', DT technician mailbox' : '') + '<br>' +
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
  var subject = 'Design Technology — Submission Received — ' + (record.student_name || 'Student');
  var body =
    '<p>Dear ' + escapeHtml_(record.student_name || 'Student') + ',</p>' +
    '<p>Your <strong>' + escapeHtml_(machineName) + '</strong> submission has been received and is now waiting for technician review.</p>' +
    '<table style="border-collapse:collapse;width:100%;margin:12px 0;">' +
    '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Submission ID</strong></td><td style="padding:6px 12px;border:1px solid #ddd;font-family:monospace;">' + escapeHtml_(record.submission_id || '') + '</td></tr>' +
    '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Machine</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(machineName) + '</td></tr>' +
    '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Material</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(record.material || '') + '</td></tr>' +
    '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Year / Class</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(record.year_group || '') + ' / Class ' + escapeHtml_(record.design_class_no || '') + '</td></tr>' +
    '</table>' +
    '<p><strong>What happens next:</strong></p>' +
    '<ol>' +
    '<li>A technician will review your file.</li>' +
    '<li>You will receive an email when the status changes.</li>' +
    '<li>Use the <strong>My Status</strong> page on the Dashboard to check progress at any time.</li>' +
    '</ol>' +
    '<p>Save your Submission ID — you will need it to track your request.</p>' +
    '<p>Best regards,<br>Design Technology Technician Team</p>';
  MailApp.sendEmail({ to: email, subject: subject, htmlBody: body });
}

/**
 * Sends a confirmation email to the requester when an Other Request is first created.
 */
function sendOtherRequestConfirmation_(record) {
  var email = String(record.requester_email || '').trim();
  if (!email) return;
  var machineName = record.machine === '3d' ? '3D Print' : 'Laser Cut';
  var subject = 'Design Fabrication — Request Received — ' + (record.project_name || 'Special Request');
  var body =
    '<p>Dear ' + escapeHtml_(record.requester_name || 'Requester') + ',</p>' +
    '<p>Your Special Request has been received and is now waiting for review.</p>' +
    '<table style="border-collapse:collapse;width:100%;margin:12px 0;">' +
    '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Request ID</strong></td><td style="padding:6px 12px;border:1px solid #ddd;font-family:monospace;">' + escapeHtml_(record.request_id || '') + '</td></tr>' +
    '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Project</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(record.project_name || '') + '</td></tr>' +
    '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Type</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(record.request_type || '') + '</td></tr>' +
    '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Machine</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(machineName) + '</td></tr>' +
    '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Teacher In Charge</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(record.teacher_in_charge || '') + '</td></tr>' +
    '</table>' +
    '<p><strong>What happens next:</strong></p>' +
    '<ol>' +
    '<li>A technician will review your request and file.</li>' +
    '<li>You will receive an email when the status changes.</li>' +
    '<li>Use the <strong>My Status</strong> page on the Dashboard to check progress at any time.</li>' +
    '</ol>' +
    '<p>Save your Request ID — you will need it to track your request.</p>' +
    '<p>Best regards,<br>Design Technology Technician Team</p>';
  MailApp.sendEmail({ to: email, subject: subject, htmlBody: body });

  /* Also notify teacher in charge */
  var teacherEmail = String(record.teacher_in_charge_email || '').trim();
  if (teacherEmail && teacherEmail !== email) {
    var teacherSubject = 'Design Fabrication — New Request — ' + (record.project_name || 'Special Request') + ' (by ' + (record.requester_name || 'requester') + ')';
    var teacherBody =
      '<p>Dear ' + escapeHtml_(record.teacher_in_charge || 'Teacher') + ',</p>' +
      '<p>A new Special Request has been submitted where you are listed as teacher-in-charge:</p>' +
      '<table style="border-collapse:collapse;width:100%;margin:12px 0;">' +
      '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Requester</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(record.requester_name || '') + ' (' + escapeHtml_(record.requester_email || '') + ')</td></tr>' +
      '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Project</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(record.project_name || '') + '</td></tr>' +
      '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Type</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(record.request_type || '') + '</td></tr>' +
      '<tr><td style="padding:6px 12px;border:1px solid #ddd;background:#f8f9fa;"><strong>Machine</strong></td><td style="padding:6px 12px;border:1px solid #ddd;">' + escapeHtml_(machineName) + '</td></tr>' +
      '</table>' +
      '<p>You will be notified of any status changes.<br>Regards,<br>Design Technology Technician Team</p>';
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

  /* ---------- build student email body ---------- */
  var studentSubject = 'Design Technology Status Update - ' + statusLabel + ' - ' + (submission.student_name || 'Student');
  var studentBody = '<p>Dear ' + studentName + ',</p>';

  if (newStatus === APP.status.NEEDS_FIX) {
    var allTemplates = getIssueTemplatesForClient();
    var codes = String(issueCode || '').split(',').map(function(s) { return s.trim(); }).filter(Boolean);
    var selTpls = allTemplates.filter(function(t) { return codes.indexOf(t.issue_code) !== -1; });
    var issueHtml = selTpls.map(function(t) {
      return '<li><strong>' + escapeHtml_(t.issue_label) + '</strong><br>' + (t.email_body_html || '') + '</li>';
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
  studentBody += '<p>Best regards,<br>Design Technology Technician Team</p>';

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
      (APP.technicianCcEmail ? ', DT technician mailbox' : '') + '<br>' +
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
  payload.machine = String(payload.machine || '').trim().toLowerCase();
  payload.material = String(payload.material || '').trim();

  const required = [
    'student_email',
    'student_name',
    'design_class_no',
    'design_teacher',
    'year_group',
    'machine',
    'material'
  ];
  required.forEach(key => {
    if (!String(payload[key] || '').trim()) {
      throw new Error(`Missing required field: ${key}`);
    }
  });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.student_email)) {
    throw new Error('Student email format is invalid.');
  }

  if (!['laser', '3d'].includes(payload.machine)) {
    throw new Error('Machine must be laser or 3d.');
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
  return formatHongKongTimestamp_(new Date());
}

function formatHongKongTimestamp_(value) {
  const date = toDateObject_(value);
  if (!date) return '';
  return Utilities.formatDate(date, 'Asia/Hong_Kong', "yyyy-MM-dd'T'HH:mm:ss") + '+08:00';
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
 * Count today's submissions (HK timezone) for a given email.
 * Returns { total, dt, special }.
 */
function getTodaySubmissionCountByEmail_(email) {
  var result = { total: 0, dt: 0, special: 0 };
  if (!email) return result;
  var e = String(email).trim().toLowerCase();
  var today = Utilities.formatDate(new Date(), 'Asia/Hong_Kong', 'yyyy-MM-dd');
  var ss = getSpreadsheet_();
  // DT submissions
  var subSheet = ss.getSheetByName(APP.sheets.submissions.name);
  if (subSheet && subSheet.getLastRow() > 1) {
    var subData = subSheet.getRange(2, 1, subSheet.getLastRow() - 1, subSheet.getLastColumn()).getValues();
    for (var i = 0; i < subData.length; i++) {
      var row = subData[i];
      if (String(row[2] || '').trim().toLowerCase() === e) {
        var ts = formatHongKongTimestamp_(row[1]);
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
        var ots = formatHongKongTimestamp_(orow[1]);
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

  var today = Utilities.formatDate(new Date(), 'Asia/Hong_Kong', 'yyyy-MM-dd');
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
      var subTs = formatHongKongTimestamp_(subDate);
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
      var otherTs = formatHongKongTimestamp_(otherDate);
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
 * Public endpoint: returns daily submission activity for an email.
 */
function getSubmissionActivity(email) {
  var activity = getSubmissionActivityByEmail_(email);
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

function getFileExtension_(fileName) {
  const normalized = String(fileName || '').trim().toLowerCase();
  if (!normalized.includes('.')) return '';
  return normalized.split('.').pop();
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
  const sheet = getSpreadsheet_().getSheetByName(name);
  if (!sheet) throw new Error(`Sheet not found: ${name}`);
  return sheet;
}

function getRowsAsObjects_(sheetName) {
  const sheet = getSheet_(sheetName);
  const values = sheet.getDataRange().getDisplayValues();
  if (values.length < 2) return [];

  const headers = values[0];
  return values.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i] || '');
    return obj;
  });
}

function appendObject_(sheetName, obj) {
  const sheet = getSheet_(sheetName);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  const row = headers.map(h => obj[h] ?? '');
  sheet.appendRow(row);
}

function writeCellByHeader_(sheet, headers, rowIndex, headerName, value) {
  const col = headers.indexOf(headerName);
  if (col === -1) throw new Error(`Missing header: ${headerName}`);
  sheet.getRange(rowIndex, col + 1).setValue(value);
}

/* =========================
   AUTH
   ========================= */

function getCurrentUser_() {
  let email = '';
  try { email = Session.getActiveUser().getEmail() || ''; } catch(e) {}
  try { if (!email) email = Session.getEffectiveUser().getEmail() || ''; } catch(e) {}

  if (!email) {
    return { email: '', name: '', role: 'student', isAdmin: false };
  }

  let match = null;
  try {
    const users = getRowsAsObjects_(APP.sheets.users.name);
    match = users.find(u => String(u.email || '').toLowerCase() === email.toLowerCase() && String(u.active).toLowerCase() !== 'false');
  } catch(e) {}

  return {
    email,
    name: match ? match.name : '',
    role: match ? match.role : 'student',
    isAdmin: !!(match && APP.adminRoles.includes(match.role))
  };
}

function requireAdmin_() {
  const user = getCurrentUser_();
  if (!user.isAdmin) throw new Error('Admin access required.');
  return user;
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

  ['Y8', 'Y9', 'Y10'].forEach(year => {
    const subYear = getOrCreateFolder_(submissions, year);
    getOrCreateFolder_(subYear, 'laser');
    if (year === 'Y10') getOrCreateFolder_(subYear, '3d');

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

/* =========================
   UI RENDERING
   ========================= */

/* =========================
   ADMIN CONFIG FUNCTIONS
   ========================= */

function getAdminRulesRows() {
  requireAdmin_();
  return getRowsAsObjects_(APP.sheets.rules.name);
}

function saveAdminRule(rowIndex, data) {
  const user = requireAdmin_();
  if (user.role !== 'admin') throw new Error('Only admins can edit rules.');
  const sheet = getSheet_(APP.sheets.rules.name);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  Object.keys(data).forEach(function(key) {
    writeCellByHeader_(sheet, headers, rowIndex, key, data[key]);
  });
  appendObject_(APP.sheets.auditLog.name, {
    timestamp: getAuditTimestamp_(),
    submission_id: '',
    actor_email: user.email || '',
    action_type: 'edit_rule',
    old_status: '',
    new_status: '',
    notes: 'Rule row ' + rowIndex + ' updated'
  });
  return { ok: true };
}

function getAdminUsersRows() {
  requireAdmin_();
  return getRowsAsObjects_(APP.sheets.users.name);
}

function saveAdminUser(rowIndex, data) {
  const user = requireAdmin_();
  if (user.role !== 'admin') throw new Error('Only admins can manage users.');
  const sheet = getSheet_(APP.sheets.users.name);
  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getDisplayValues()[0];
  Object.keys(data).forEach(function(key) {
    writeCellByHeader_(sheet, headers, rowIndex, key, data[key]);
  });
  appendObject_(APP.sheets.auditLog.name, {
    timestamp: getAuditTimestamp_(),
    submission_id: '',
    actor_email: user.email || '',
    action_type: 'edit_user',
    old_status: '',
    new_status: '',
    notes: 'User row ' + rowIndex + ': ' + (data.email || '') + ' role=' + (data.role || '')
  });
  return { ok: true };
}

function addAdminUser(data) {
  const user = requireAdmin_();
  if (user.role !== 'admin') throw new Error('Only admins can add users.');
  appendObject_(APP.sheets.users.name, {
    email: data.email || '',
    name: data.name || '',
    role: data.role || 'student',
    active: data.active || 'TRUE'
  });
  appendObject_(APP.sheets.auditLog.name, {
    timestamp: getAuditTimestamp_(),
    submission_id: '',
    actor_email: user.email || '',
    action_type: 'add_user',
    old_status: '',
    new_status: '',
    notes: 'Added user: ' + (data.email || '')
  });
  return { ok: true };
}

function getAuditLogRows(limit) {
  const user = requireAdmin_();
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
  requireAdmin_();
  return getRowsAsObjects_(APP.sheets.issueTemplates.name);
}

/* =========================
   UI RENDERING — v2 (role-aware, spec-compliant)
   ========================= */

function renderPage_(page, boot) {
  var u = boot.currentUser;
  var role = u.role || 'guest';
  var isAdmin = u.isAdmin;
  var userChip = u.email
    ? '<div class="user-chip"><span class="user-avatar">' + escapeHtml_((u.name || u.email).charAt(0).toUpperCase()) + '</span><span class="user-info"><span class="user-name">' + escapeHtml_(u.name || u.email.split('@')[0]) + '</span><span class="user-role role-' + escapeHtml_(role) + '">' + escapeHtml_(role) + '</span></span></div>'
    : '<div class="user-chip"><span class="user-name muted-chip">Not signed in</span></div>';

  /* Role-adaptive nav */
  var navItems = '';
  if (role === 'student' || role === 'guest') {
    navItems =
      '<a href="?page=submit" id="nav-submit" class="tab-btn ' + (page === 'submit' ? 'active' : '') + '" onclick="switchPage(\'submit\'); return false;"><span class="tab-icon">&#128196;</span> DT Submit</a>' +
      '<a href="?page=status" id="nav-status" class="tab-btn ' + (page === 'status' ? 'active' : '') + '" onclick="switchPage(\'status\'); return false;"><span class="tab-icon">&#128270;</span> My Status</a>' +
      '<a href="?page=machines" id="nav-machines" class="tab-btn ' + (page === 'machines' ? 'active' : '') + '" onclick="switchPage(\'machines\'); return false;"><span class="tab-icon">&#128736;</span> Machines</a>' +
      '<a href="?page=other" id="nav-other" class="tab-btn tab-btn--special ' + (page === 'other' ? 'active' : '') + '" onclick="switchPage(\'other\'); return false;"><span class="tab-icon">&#11088;</span> Special Request</a>' +
      '<a href="?page=help" id="nav-help" class="tab-btn ' + (page === 'help' ? 'active' : '') + '" onclick="switchPage(\'help\'); return false;"><span class="tab-icon">&#10067;</span> Help</a>';
  } else if (role === 'teacher') {
    navItems =
      '<a href="?page=submit" id="nav-submit" class="tab-btn ' + (page === 'submit' ? 'active' : '') + '" onclick="switchPage(\'submit\'); return false;"><span class="tab-icon">&#128196;</span> DT Submit</a>' +
      '<a href="?page=status" id="nav-status" class="tab-btn ' + (page === 'status' ? 'active' : '') + '" onclick="switchPage(\'status\'); return false;"><span class="tab-icon">&#128270;</span> Student Status</a>' +
      '<a href="?page=admin" id="nav-admin" class="tab-btn ' + (page === 'admin' ? 'active' : '') + '" onclick="switchPage(\'admin\'); return false;"><span class="tab-icon">&#128203;</span> My Students</a>' +
      '<a href="?page=machines" id="nav-machines" class="tab-btn ' + (page === 'machines' ? 'active' : '') + '" onclick="switchPage(\'machines\'); return false;"><span class="tab-icon">&#128736;</span> Machines</a>' +
      '<a href="?page=other" id="nav-other" class="tab-btn tab-btn--special ' + (page === 'other' ? 'active' : '') + '" onclick="switchPage(\'other\'); return false;"><span class="tab-icon">&#11088;</span> Special Request</a>' +
      '<a href="?page=help" id="nav-help" class="tab-btn ' + (page === 'help' ? 'active' : '') + '" onclick="switchPage(\'help\'); return false;"><span class="tab-icon">&#10067;</span> Help</a>';
  } else if (role === 'technician') {
    navItems =
      '<a href="?page=admin" id="nav-admin" class="tab-btn ' + (page === 'admin' ? 'active' : '') + '" onclick="switchPage(\'admin\'); return false;"><span class="tab-icon">&#128736;</span> Queue</a>' +
      '<a href="?page=other" id="nav-other" class="tab-btn tab-btn--special ' + (page === 'other' ? 'active' : '') + '" onclick="switchPage(\'other\'); return false;"><span class="tab-icon">&#11088;</span> Special Request</a>' +
      '<a href="?page=status" id="nav-status" class="tab-btn ' + (page === 'status' ? 'active' : '') + '" onclick="switchPage(\'status\'); return false;"><span class="tab-icon">&#128270;</span> Lookup</a>' +
      '<a href="?page=submit" id="nav-submit" class="tab-btn ' + (page === 'submit' ? 'active' : '') + '" onclick="switchPage(\'submit\'); return false;"><span class="tab-icon">&#128196;</span> Submit</a>' +
      '<a href="?page=machines" id="nav-machines" class="tab-btn ' + (page === 'machines' ? 'active' : '') + '" onclick="switchPage(\'machines\'); return false;"><span class="tab-icon">&#128736;</span> Machines</a>' +
      '<a href="?page=help" id="nav-help" class="tab-btn ' + (page === 'help' ? 'active' : '') + '" onclick="switchPage(\'help\'); return false;"><span class="tab-icon">&#10067;</span> Help</a>';
  } else {
    /* admin — full nav */
    navItems =
      '<a href="?page=admin" id="nav-admin" class="tab-btn ' + (page === 'admin' ? 'active' : '') + '" onclick="switchPage(\'admin\'); return false;"><span class="tab-icon">&#128736;</span> Dashboard</a>' +
      '<a href="?page=submit" id="nav-submit" class="tab-btn ' + (page === 'submit' ? 'active' : '') + '" onclick="switchPage(\'submit\'); return false;"><span class="tab-icon">&#128196;</span> Submit</a>' +
      '<a href="?page=other" id="nav-other" class="tab-btn tab-btn--special ' + (page === 'other' ? 'active' : '') + '" onclick="switchPage(\'other\'); return false;"><span class="tab-icon">&#11088;</span> Special Request</a>' +
      '<a href="?page=status" id="nav-status" class="tab-btn ' + (page === 'status' ? 'active' : '') + '" onclick="switchPage(\'status\'); return false;"><span class="tab-icon">&#128270;</span> Lookup</a>' +
      '<a href="?page=rules" id="nav-rules" class="tab-btn ' + (page === 'rules' ? 'active' : '') + '" onclick="switchPage(\'rules\'); return false;"><span class="tab-icon">&#9881;</span> Rules</a>' +
      '<a href="?page=users" id="nav-users" class="tab-btn ' + (page === 'users' ? 'active' : '') + '" onclick="switchPage(\'users\'); return false;"><span class="tab-icon">&#128101;</span> Users</a>' +
      '<a href="?page=audit" id="nav-audit" class="tab-btn ' + (page === 'audit' ? 'active' : '') + '" onclick="switchPage(\'audit\'); return false;"><span class="tab-icon">&#128220;</span> Audit</a>' +
      '<a href="?page=machines" id="nav-machines" class="tab-btn ' + (page === 'machines' ? 'active' : '') + '" onclick="switchPage(\'machines\'); return false;"><span class="tab-icon">&#128736;</span> Machines</a>' +
      '<a href="?page=help" id="nav-help" class="tab-btn ' + (page === 'help' ? 'active' : '') + '" onclick="switchPage(\'help\'); return false;"><span class="tab-icon">&#10067;</span> Help</a>';
  }

  /* Admin-only pages rendered empty for non-admins */
  var rulesPageHtml = isAdmin ? renderRulesPage_() : '';
  var usersPageHtml = isAdmin ? renderUsersPage_() : '';
  var auditPageHtml = isAdmin ? renderAuditPage_() : '';

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
    .shell { max-width: 1200px; margin: 0 auto; padding: 0 16px 40px; }
    .header { background: var(--navy); color: #fff; padding: 0 16px; position: sticky; top: 0; z-index: 100; }
    .header-inner { max-width: 1200px; margin: 0 auto; display: flex; align-items: center; justify-content: space-between; height: 56px; gap: 16px; }
    .logo { font-weight: 800; font-size: 16px; letter-spacing: -.3px; white-space: nowrap; display: flex; align-items: center; gap: 8px; }
    .logo-icon { font-size: 20px; }
    .user-chip { display: flex; align-items: center; gap: 8px; font-size: 12px; }
    .user-avatar { width: 30px; height: 30px; border-radius: 50%; background: var(--maroon); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
    .user-info { display: flex; flex-direction: column; line-height: 1.3; }
    .user-name { font-weight: 600; }
    .user-role { font-size: 10px; text-transform: uppercase; letter-spacing: .5px; opacity: .7; }
    .muted-chip { opacity: .5; font-size: 12px; }

    /* ---------- NAV ---------- */
    .tab-bar { display: flex; gap: 2px; padding: 0 16px; background: var(--navy); overflow-x: auto; max-width: 1200px; margin: 0 auto; }
    .tab-btn { color: rgba(255,255,255,.6); font-size: 13px; font-weight: 600; padding: 10px 16px; border-bottom: 3px solid transparent; transition: var(--transition); white-space: nowrap; text-decoration: none; display: flex; align-items: center; gap: 6px; }
    .tab-btn:hover { color: #fff; text-decoration: none; background: rgba(255,255,255,.05); }
    .tab-btn.active { color: #fff; border-bottom-color: var(--rose); }
    .tab-btn--special { color: #fbbf24; text-shadow: 0 0 8px rgba(251,191,36,.2); }
    .tab-btn--special:hover { color: #fde68a; background: rgba(251,191,36,.12); text-shadow: 0 0 10px rgba(251,191,36,.35); }
    .tab-btn--special.active { color: #fde68a; border-bottom-color: #f59e0b; text-shadow: 0 0 10px rgba(251,191,36,.3); }
    .tab-icon { font-size: 15px; }
    .tab-bar-wrap { position: relative; background: var(--navy); }
    .tab-bar-wrap::before, .tab-bar-wrap::after { content: ''; position: absolute; top: 0; bottom: 0; width: 24px; z-index: 2; pointer-events: none; transition: opacity .2s; opacity: 0; }
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

    /* ---------- FILE ZONES ---------- */
    .file-zone { border: 2px dashed var(--card-border); border-radius: var(--radius-sm); padding: 20px; text-align: center; cursor: pointer; transition: var(--transition); position: relative; }
    .file-zone:hover, .file-zone.drag-over { border-color: var(--blue); background: #f8faff; }
    .file-zone input[type=file] { position: absolute; opacity: 0; width: 100%; height: 100%; top: 0; left: 0; cursor: pointer; }
    .file-zone-icon { font-size: 28px; margin-bottom: 4px; }
    .file-zone-label { font-weight: 600; font-size: 13px; }
    .file-zone-sub { font-size: 11px; color: var(--slate-lt); margin-top: 2px; }
    .file-chosen { font-size: 12px; color: var(--green); margin-top: 6px; font-weight: 600; }

    /* ---------- PATH SELECTOR ---------- */
    .path-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px; }
    .path-card { border: 2px solid var(--card-border); border-radius: var(--radius); padding: 24px 20px; cursor: pointer; transition: var(--transition); text-align: center; position: relative; }
    .path-card:hover { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(59,130,246,.08); }
    .path-card--primary { border-color: var(--maroon); background: linear-gradient(135deg, #fef2f2 0%, #fff 100%); }
    .path-card--primary .path-badge { background: var(--maroon); color: #fff; }
    .path-card--secondary { background: linear-gradient(135deg, #eef2ff 0%, #fff 100%); }
    .path-card--secondary .path-badge { background: var(--navy-lt); color: #fff; }
    .path-card-icon { font-size: 36px; margin-bottom: 8px; line-height: 1; }
    .path-badge { display: inline-block; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; padding: 3px 10px; border-radius: 10px; margin-bottom: 8px; }
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

    /* ---------- STATS BAR ---------- */
    .stats-bar { display: grid; grid-template-columns: repeat(auto-fit, minmax(90px, 1fr)); gap: 8px; margin-top: 16px; overflow: visible; }
    .stat-card { background: var(--bg); border-radius: var(--radius-sm); padding: 12px 8px; text-align: center; cursor: pointer; transition: var(--transition); border: 2px solid transparent; min-width: 0; }
    .stat-card:hover { border-color: var(--blue); }
    .stat-num { font-size: 20px; font-weight: 800; overflow: hidden; text-overflow: ellipsis; }
    .stat-label { font-size: 10px; color: var(--slate-lt); font-weight: 600; text-transform: uppercase; letter-spacing: .3px; margin-top: 2px; }

    /* ---------- FILTER BAR ---------- */
    .filter-bar { display: flex; flex-wrap: wrap; gap: 10px; align-items: flex-end; margin-top: 16px; padding: 14px; background: var(--bg); border-radius: var(--radius-sm); }
    .filter-bar .field { flex: 1 1 140px; min-width: 120px; }
    .filter-bar .field label { font-size: 11px; }
    .filter-bar input, .filter-bar select { font-size: 12px; padding: 7px 10px; }
    .filter-meta { flex: 0 0 100%; display: flex; gap: 10px; align-items: center; justify-content: flex-end; flex-wrap: wrap; padding-top: 4px; border-top: 1px solid var(--card-border); margin-top: 4px; }
    .teacher-toggle { font-size: 12px; display: flex; align-items: center; gap: 5px; cursor: pointer; white-space: nowrap; margin-right: auto; }

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
    .queue-row--attention td { background: #fffdf7; }
    .queue-row--done td { background: #f8fafc; border-color: #e2e8f0; }
    .queue-row--done .queue-name, .queue-row--done .queue-status-note, .queue-row--done .queue-next-owner, .queue-row--done .queue-context-main { color: var(--slate); }
    .queue-row--done .queue-meta, .queue-row--done .queue-meta-aux, .queue-row--done .queue-context-sub, .queue-row--done .queue-risk-note, .queue-row--done .queue-status-aux { color: #94a3b8; }
    .queue-cell-requester { min-width: 238px; }
    .queue-cell-context { min-width: 190px; }
    .queue-cell-status { min-width: 212px; }
    .queue-cell-meta { min-width: 132px; }
    .queue-cell-action { width: 98px; text-align: right; }
    .queue-name { font-size: 15px; font-weight: 800; color: var(--navy); line-height: 1.18; }
    .queue-meta { font-size: 11px; color: var(--slate); margin-top: 3px; line-height: 1.32; }
    .queue-meta-aux { font-size: 10px; color: var(--slate-lt); margin-top: 2px; line-height: 1.32; }
    .queue-context { display: flex; flex-direction: column; gap: 4px; }
    .queue-context-top { display: flex; flex-wrap: wrap; gap: 5px; align-items: center; margin-bottom: 1px; }
    .queue-context-main { font-size: 13px; font-weight: 700; color: var(--navy); line-height: 1.24; }
    .queue-context-sub { font-size: 10px; color: var(--slate-lt); line-height: 1.28; }
    .queue-status-block { display: flex; flex-direction: column; gap: 4px; }
    .queue-status-block .pill { align-self: flex-start; }
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
    .queue-row--done .queue-review-btn { color: var(--slate); border-color: #cbd5e1; }
    .queue-empty { margin-top: 12px; }

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
    .email-meta { padding: 14px 20px; background: var(--bg); font-size: 13px; }
    .email-meta p { margin-bottom: 4px; }
    .email-preview { padding: 16px 20px; }
    .email-preview h4 { font-size: 13px; font-weight: 700; margin-bottom: 8px; }
    .email-body { font-size: 13px; line-height: 1.6; }

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

    @media (max-width: 640px) {
      .header-inner { height: 48px; }
      .logo { font-size: 14px; }
      .tab-btn { padding: 8px 12px; font-size: 12px; }
      .tab-btn--special { text-shadow: none; }
      .card { padding: 16px; }
      .drawer { width: 100vw; }
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
      .queue-cell-action { width: auto; }
      .queue-meta-block { gap: 8px; }
      .queue-review-btn { min-height: 40px; }
      .drawer-body { padding: 16px; }
      .drawer-actions { padding: 12px 16px; }
      .drawer-actions .btn { flex: 1 1 100%; }
      .review-summary-grid { grid-template-columns: 1fr; }
    }
    @media (max-width: 860px) { .machine-page-grid { grid-template-columns: 1fr; } }
  </style>
</head>
<body class="role-${escapeHtml_(role)}">
  <div class="toast-container" id="toastContainer"></div>
  <button class="scroll-top-btn" id="scrollTopBtn" onclick="window.scrollTo({top:0,behavior:'smooth'})" title="Back to top">&#8593;</button>

  <header class="header">
    <div class="header-inner">
      <div class="logo"><span class="logo-icon">&#128736;</span> ${escapeHtml_(boot.appName)}` + (isAdmin ? `<span class="role-badge role-badge-${escapeHtml_(role)}">${escapeHtml_(role)}</span>` : '') + `</div>
      ` + userChip + `
    </div>
  </header>
  <nav class="tab-bar-wrap" id="tabBarWrap"><div class="tab-bar">` + navItems + `</div></nav>

  <div class="shell">
    <div class="content">
      <div id="page-submit" style="display:${page === 'submit' ? 'block' : 'none'}">${renderSubmitPage_()}</div>
      <div id="page-other"  style="display:${page === 'other'  ? 'block' : 'none'}">${renderOtherRequestPage_()}</div>
      <div id="page-status" style="display:${page === 'status' ? 'block' : 'none'}">${renderStatusPage_(boot.currentUser)}</div>
      ` + (isAdmin ? `<div id="page-admin"  style="display:${page === 'admin'  ? 'block' : 'none'}">${renderAdminPage_(boot.currentUser)}</div>` : `<div id="page-admin" style="display:none"><div class="card"><div class="section-title">&#128274; Access Restricted</div><p>You do not have permission to view this page.</p></div></div>`) + `
      <div id="page-machines" style="display:${page === 'machines' ? 'block' : 'none'}">${renderMachinesPage_()}</div>
      <div id="page-help"   style="display:${page === 'help'   ? 'block' : 'none'}">${renderHelpPage_()}</div>
      ` + (isAdmin ? `<div id="page-rules"  style="display:${page === 'rules'  ? 'block' : 'none'}">` + rulesPageHtml + `</div>
      <div id="page-users"  style="display:${page === 'users'  ? 'block' : 'none'}">` + usersPageHtml + `</div>
      <div id="page-audit"  style="display:${page === 'audit'  ? 'block' : 'none'}">` + auditPageHtml + `</div>` : '') + `
    </div>
  </div>

  <footer class="site-footer">
    <strong>Design Fabrication Dashboard</strong> &mdash; School Design &amp; Technology Department<br>
    Laser Cutting &bull; 3D Printing &bull; Prototyping &bull; Creative Making<br>
    Need machine details? Visit the <a href="javascript:void(0)" onclick="switchPage('machines')" style="color:var(--blue);text-decoration:underline;">Machines Guide</a> or the <a href="javascript:void(0)" onclick="switchPage('help')" style="color:var(--blue);text-decoration:underline;">Help &amp; Guidelines</a> page.
  </footer>

  ` + (isAdmin ? `<div class="drawer-overlay" id="reviewDrawer">
    <div class="drawer">
      <div class="drawer-head"><h3 id="drawerTitle">Review Submission</h3><button class="drawer-close" onclick="closeDrawer()">&times;</button></div>
      <div class="drawer-body" id="drawerBody"></div>
      <div class="drawer-actions" id="drawerActions"></div>
    </div>
  </div>` : '') + `

  <script>
    var CLIENT_BUILD = '2026-03-04-v2-role-aware';
    console.log('Design Fabrication Dashboard build:', CLIENT_BUILD);
    var BOOT = ${JSON.stringify(boot)};
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

    function statusProgress(status) { return Number(STATUS_PROGRESS[String(status||'').trim()]||0); }
    function statusOwner(status) { return STATUS_OWNER[String(status||'').trim()]||'Workflow Team'; }
    function statusActionHint(status) { return STATUS_ACTION_HINT[String(status||'').trim()]||'Check the latest remarks for next steps.'; }
    function statusPill(status) { var s = String(status||''); return '<span class="pill pill-' + s + '">' + esc((STATUS_LABELS[s]||s).toUpperCase()) + '</span>'; }
    function formatDisplayTs(value) { var text = String(value||''); return text ? text.replace('T', ' ').substring(0, 16) : '\u2014'; }
    function sourcePill(source) {
      return source === 'other'
        ? '<span class="pill pill-source-special" title="Special Request">SPECIAL REQUEST</span>'
        : '<span class="pill pill-source-dt" title="DT Student Project">DT PROJECT</span>';
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
      return (status === 'completed' || status === 'rejected') ? 'queue-row--done' : 'queue-row--active';
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

    /* ---------- NAV ---------- */
    var _pages = ['submit','other','status','admin','machines','help','rules','users','audit'];
    var _adminPages = ['admin','rules','users','audit'];
    var _init = {};
    function switchPage(p) {
      /* Role guard: block students/guests from admin-only pages */
      if (!BOOT.currentUser.isAdmin && _adminPages.indexOf(p) !== -1) {
        showToast('You do not have permission to view that page.','error');
        return;
      }
      _pages.forEach(function(n) {
        var el = document.getElementById('page-' + n);
        var nav = document.getElementById('nav-' + n);
        if (el) el.style.display = (n === p ? 'block' : 'none');
        if (nav) nav.classList.toggle('active', n === p);
      });
      if (!_init[p]) { _init[p] = true; initPage(p); }
      try { if (history && history.replaceState) history.replaceState({}, '', '?page=' + p); } catch(e) {}
    }
    function initPage(p) {
      if (p === 'submit') initSubmitPage();
      if (p === 'other')  initOtherPage();
      if (p === 'status') initStatusPage();
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
          showToast('Submission ID copied!', 'success');
        });
      }
    }
    function resetSubmitForm_() {
      document.getElementById('submitSuccess').style.display = 'none';
      document.getElementById('submitFormWrap').style.display = 'block';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    function esc(str) {
      return String(str||'')
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
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

    /* ================================================
       SUBMIT PAGE
    ================================================ */
    function initSubmitPage() {
      var yearSel = document.getElementById('year_group');
      var machineSel = document.getElementById('machine');
      var materialSel = document.getElementById('material');
      var ruleBox = document.getElementById('ruleBox');
      var unitsInput = document.getElementById('units');
      var form = document.getElementById('submitForm');
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
      yearSel.innerHTML = '<option value="">\\u2014 Select year \\u2014</option>' + years.map(function(y) { return '<option value="' + y + '">' + y + '</option>'; }).join('');

      /* Pre-fill student email if logged in */
      var emailInput = form.querySelector('[name="student_email"]');
      if (emailInput && BOOT.currentUser.email && !emailInput.value) emailInput.value = BOOT.currentUser.email;

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

      function updateGuide() {
        var rule = BOOT.rules.find(function(r) { return r.year_group === yearSel.value && r.machine === machineSel.value; });
        var previewReq = !!(rule && String(rule.preview_required).toLowerCase() === 'true');
        var is3d = machineSel.value === '3d';

        var s1 = ['student_email','student_name','design_class_no','design_teacher'].every(function(n) {
          var i = form.querySelector('[name="' + n + '"]'); return i && String(i.value||'').trim();
        });
        var s2 = !!(yearSel.value && machineSel.value && materialSel.value && rule);
        var s3 = !!(Number(widthInput.value||0)>0 && Number(heightInput.value||0)>0 && (!is3d || Number(depthInput.value||0)>0));
        var s4 = !!(workingInput && workingInput.files && workingInput.files.length) && (!previewReq || (previewInput && previewInput.files && previewInput.files.length));

        setStep(0, s1); setStep(1, s2); setStep(2, s3); setStep(3, s4); setStep(4, true);
        var done = [s1,s2,s3,s4,true].filter(Boolean).length;
        var pct = Math.round((done/5)*100);
        if (guideBar) guideBar.style.width = pct + '%';
        if (guideHint) guideHint.textContent = pct === 100 ? 'Ready to submit! Please double-check filenames.' : done + '/5 sections complete. Finish all items before submitting.';
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
          updateGuide(); return;
        }
        var mats = String(rule.materials||'').split(',').map(function(s){ return s.trim(); }).filter(Boolean);
        materialSel.disabled = false;
        materialSel.innerHTML = mats.length ? mats.map(function(m){ return '<option value="' + esc(m) + '">' + esc(m) + '</option>'; }).join('') : '<option value="">No configured material</option>';
        unitsInput.value = rule.units || '';
        var previewReq = String(rule.preview_required).toLowerCase() === 'true';
        var dims = [rule.max_width, rule.max_height, rule.max_depth].filter(function(v){ return String(v)!=='0' && v!==''; });
        var ext = String(rule.accepted_extensions||'').split(',').map(function(s){ return s.trim().toUpperCase(); }).filter(Boolean);
        var chips = [];
        if (dims.length) chips.push('\\ud83d\\udccf Max: ' + dims.join(' \\u00d7 ') + ' ' + esc(rule.units||''));
        if (ext.length) chips.push('\\ud83d\\udcc4 ' + ext.join(', '));
        if (previewReq) chips.push('\\ud83d\\uddbc\\ufe0f Preview required');
        ruleBox.innerHTML = '<strong>' + esc(year) + ' \\u2013 ' + esc(MACHINE_LABELS[machine]||machine) + ' Requirements</strong>' + '<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px;">' + chips.map(function(c){ return '<span class="rule-chip">' + c + '</span>'; }).join('') + '</div>' + (rule.notes ? '<div class="rule-row" style="margin-top:8px;"><span class="rule-icon">\\u2139\\ufe0f</span><span>' + esc(rule.notes) + '</span></div>' : '');
        updateGuide();
      }

      yearSel.addEventListener('change', applyRules);
      machineSel.addEventListener('change', applyRules);
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
        var btn = document.getElementById('submitBtn');
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
              suc.querySelector('.id-box-text').textContent = res.submission_id;
              /* Populate submission activity in success state */
              var saEl = document.getElementById('successSubmittedAt');
              if (saEl && res.submitted_at) {
                var parts = [];
                parts.push('\\ud83d\\uddd3\\ufe0f Submitted: ' + formatDisplayTs(res.submitted_at));
                if (res.submissions_today) parts.push('\\ud83d\\udcca Today: ' + res.submissions_today + ' total (' + (res.dt_submissions_today||0) + ' DT, ' + (res.special_submissions_today||0) + ' Special)');
                if (res.last_24h_submissions > res.submissions_today) parts.push('\\u23f1 Last 24h: ' + res.last_24h_submissions + ' total requests');
                saEl.innerHTML = parts.join('<br>');
                saEl.style.display = 'block';
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
              form.reset();
              materialSel.disabled = true; ruleBox.innerHTML = ''; unitsInput.value = '';
              document.querySelectorAll('.file-chosen').forEach(function(el){ el.textContent = ''; });
              updateGuide();
              btn.disabled = false; btn.innerHTML = 'Submit';
              showToast('Submission received!', 'success');
            })
            .withFailureHandler(function(err) { setMsg('submitMsg', err.message||String(err), 'error'); btn.disabled = false; btn.innerHTML = 'Submit'; })
            .submitSubmission(payload);
        } catch(err) { setMsg('submitMsg', err.message||String(err), 'error'); btn.disabled = false; btn.innerHTML = 'Submit'; }
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
      if (!zone || !inp || !chosen) return;
      zone.addEventListener('click', function(e){ if (e.target === inp) return; inp.click(); });
      zone.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inp.click(); } });
      zone.addEventListener('dragover', function(e){ e.preventDefault(); zone.classList.add('drag-over'); });
      zone.addEventListener('dragleave', function(){ zone.classList.remove('drag-over'); });
      zone.addEventListener('drop', function(e) {
        e.preventDefault(); zone.classList.remove('drag-over');
        if (e.dataTransfer.files.length) {
          var dt = new DataTransfer(); dt.items.add(e.dataTransfer.files[0]); inp.files = dt.files;
          chosen.textContent = '\\u2705 ' + e.dataTransfer.files[0].name;
          if (cb) cb();
        }
      });
      inp.addEventListener('change', function(){ chosen.textContent = inp.files.length ? '\\u2705 ' + inp.files[0].name : ''; if (cb) cb(); });
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
        var chkApproval = document.getElementById('otherConfirmApproval');
        var chkTimeline = document.getElementById('otherConfirmTimeline');
        if (chkApproval && !chkApproval.checked) { setMsg('otherSubmitMsg', 'Please confirm that teacher/supervisor approval has been obtained.', 'error'); return; }
        if (chkTimeline && !chkTimeline.checked) { setMsg('otherSubmitMsg', 'Please confirm that you understand the review and production timeline.', 'error'); return; }
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
              suc.querySelector('.id-box-text').textContent = res.request_id;
              /* Populate submission activity in success state */
              var saEl = document.getElementById('otherSuccessSubmittedAt');
              if (saEl && res.submitted_at) {
                var parts = [];
                parts.push('\\ud83d\\uddd3\\ufe0f Submitted: ' + formatDisplayTs(res.submitted_at));
                if (res.submissions_today) parts.push('\\ud83d\\udcca Today: ' + res.submissions_today + ' total (' + (res.dt_submissions_today||0) + ' DT, ' + (res.special_submissions_today||0) + ' Special)');
                if (res.last_24h_submissions > res.submissions_today) parts.push('\\u23f1 Last 24h: ' + res.last_24h_submissions + ' total requests');
                saEl.innerHTML = parts.join('<br>');
                saEl.style.display = 'block';
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
              form.reset();
              materialSel.innerHTML = '<option value="">\\u2014 Select machine first \\u2014</option>';
              document.querySelectorAll('#page-other .file-chosen').forEach(function(el){ el.textContent = ''; });
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
      document.querySelectorAll('#page-other .file-chosen').forEach(function(el) { el.textContent = ''; });
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

    function renderStatusSummary_(rows) {
      var c = { submitted:0, needs_fix:0, in_progress:0, completed:0 };
      rows.forEach(function(r) {
        var s = String(r.status||'');
        if (s==='submitted') c.submitted++;
        if (s==='needs_fix') c.needs_fix++;
        if (s==='completed') c.completed++;
        if (['approved','in_queue','in_production'].indexOf(s)!==-1) c.in_progress++;
      });
      return '<div class="status-summary"><div class="summary-card"><div class="num">' + rows.length + '</div><div class="lbl">Total</div></div><div class="summary-card"><div class="num">' + c.submitted + '</div><div class="lbl">Awaiting</div></div><div class="summary-card"><div class="num">' + c.in_progress + '</div><div class="lbl">In Process</div></div><div class="summary-card"><div class="num">' + c.needs_fix + '</div><div class="lbl">Needs Fix</div></div><div class="summary-card"><div class="num">' + c.completed + '</div><div class="lbl">Done</div></div></div>';
    }

    function loadStatuses() {
      var q = document.getElementById('statusQuery').value.trim();
      if (!q) { setMsg('statusMsg','Please enter your email or submission ID.','error'); return; }
      setMsg('statusMsg','Searching\\u2026','muted');
      var statusBtn = document.querySelector('#page-status .btn-primary');
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
          el.innerHTML = '<div class="alert alert-warning"><span class="alert-icon">\\ud83d\\udd0d</span><span><strong>No submissions found.</strong> Try your full school email, or paste the Submission ID / Request ID exactly as shown in the confirmation message. If you still cannot find it, ask your teacher or the technician team to confirm which email was used.</span></div>';
          return;
        }
        function renderCard(r) {
          var dims = [r.width,r.height,r.depth].filter(function(v){ return v && String(v)!=='0'; });
          var msg = STATUS_MSG[r.status] || '';
          var progress = statusProgress(r.status);
          var owner = statusOwner(r.status);
          var extra = '';
          if (r.status === 'needs_fix') {
            var fixMsg = r.admin_remarks || 'Review the technician feedback, fix your file, and resubmit through the Dashboard.';
            extra = '<div class="sub-card-msg msg-needs_fix"><strong>Action required:</strong> ' + esc(fixMsg) + '</div>';
            var daysWaiting = 0;
            var rawDate = new Date(r.updated_at || r.created_at || '');
            if (!isNaN(rawDate.getTime())) daysWaiting = Math.floor((Date.now() - rawDate.getTime()) / 86400000);
            if (daysWaiting >= 3) {
              extra += '<div class="alert alert-warning" style="margin-top:10px;"><span class="alert-icon">&#9888;</span><span><strong>Waiting for revision:</strong> ' + daysWaiting + ' day(s) since the last update.</span></div>';
            }
          }
          else if (msg) extra = '<div class="sub-card-msg msg-' + esc(r.status) + '">' + esc(msg) + '</div>';
          var sourceTag = '<span style="margin-left:6px;">' + sourcePill(r._source) + '</span>';
          var titleLabel = r._source === 'other'
            ? esc(r.project_name||'Special Request') + ' \\u2013 ' + esc(MACHINE_LABELS[r.machine]||r.machine)
            : esc(MACHINE_LABELS[r.machine]||r.machine) + ' \\u2013 ' + esc(r.material||'\\u2014');
          var detailFields = '';
          if (r._source === 'other') {
            detailFields =
              '<div class="sub-card-field"><label>Type</label><div class="val">' + esc(r.request_type||'\\u2014') + '</div></div>' +
              '<div class="sub-card-field"><label>Dept</label><div class="val">' + esc(r.department_or_subject||'\\u2014') + '</div></div>' +
              '<div class="sub-card-field"><label>Teacher</label><div class="val">' + esc(r.teacher_in_charge||'\\u2014') + '</div></div>' +
              (dims.length ? '<div class="sub-card-field"><label>Size</label><div class="val">' + dims.join('\\u00d7') + ' ' + esc(r.units||'') + '</div></div>' : '') +
              '<div class="sub-card-field"><label>Updated</label><div class="val">' + esc(r.updated_at ? r.updated_at.substring(0,16).replace('T',' ') : '\\u2014') + '</div></div>' +
              '<div class="sub-card-field" style="grid-column:1/-1"><label>Request ID</label><div class="val" style="font-family:monospace;font-size:12px;word-break:break-all;">' + esc(r.request_id||r.submission_id||'') + '</div></div>';
          } else {
            detailFields =
              '<div class="sub-card-field"><label>Year</label><div class="val">' + esc(r.year_group||'\\u2014') + '</div></div>' +
              '<div class="sub-card-field"><label>Class</label><div class="val">' + esc(r.design_class_no||'\\u2014') + '</div></div>' +
              '<div class="sub-card-field"><label>Teacher</label><div class="val">' + esc(r.design_teacher||'\\u2014') + '</div></div>' +
              (dims.length ? '<div class="sub-card-field"><label>Size</label><div class="val">' + dims.join('\\u00d7') + ' ' + esc(r.units||'') + '</div></div>' : '') +
              '<div class="sub-card-field"><label>Updated</label><div class="val">' + esc(r.updated_at ? r.updated_at.substring(0,16).replace('T',' ') : '\\u2014') + '</div></div>' +
              '<div class="sub-card-field" style="grid-column:1/-1"><label>Submission ID</label><div class="val" style="font-family:monospace;font-size:12px;word-break:break-all;">' + esc(r.submission_id||'') + '</div></div>';
          }
          return '<div class="sub-card">' +
            '<div class="sub-card-head"><div><div class="sub-card-title">' + titleLabel + sourceTag + '</div><div class="sub-card-meta">Submitted ' + esc(r.created_at ? r.created_at.substring(0,16).replace('T',' ') : '') + '</div></div>' + statusPill(r.status) + '</div>' +
            '<div class="progress-strip"><div class="progress-fill" style="width:' + progress + '%"></div></div>' +
            '<div class="progress-meta"><span>Progress: ' + progress + '%</span><span>Owner: ' + esc(owner) + '</span></div>' +
            buildTimeline(r.status) +
            '<div class="sub-card-body">' + detailFields + '</div>' + extra + '</div>';
        }
        function renderSection(title, subtitle, rows) {
          if (!rows.length) return '';
          return '<div style="margin-top:18px;">' +
            '<div class="section-title" style="font-size:18px;margin-bottom:4px;">' + title + '</div>' +
            '<div class="section-sub" style="margin-bottom:12px;">' + subtitle + '</div>' +
            rows.map(renderCard).join('') +
          '</div>';
        }
        var dtOnly = all.filter(function(r){ return r._source === 'dt'; });
        var otherOnly = all.filter(function(r){ return r._source === 'other'; });
        var statusHtml = renderStatusSummary_(all);
        var topActivity = all[0] && all[0]._activity ? all[0]._activity : null;
        if (topActivity && (Number(topActivity.counts.total || 0) >= 2 || Number(topActivity.last24_count || 0) >= 2)) {
          statusHtml += '<div class="alert alert-info status-activity-banner"><span class="alert-icon">&#128202;</span><span><strong>Recent activity for this requester:</strong> ' + Number(topActivity.counts.total || 0) + ' request(s) today and ' + Number(topActivity.last24_count || 0) + ' in the last 24 hours. Review the latest record carefully before resubmitting or chasing the queue.</span></div>';
        }
        if (dtOnly.length && otherOnly.length) {
          statusHtml += renderSection('DT Submissions', 'Your regular DT coursework workflow items.', dtOnly);
          statusHtml += renderSection('Special Requests', 'Competition, club, event, or non-DT fabrication requests.', otherOnly);
        } else {
          statusHtml += all.map(renderCard).join('');
        }
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
      ['filterSource','filterYear','filterMachine','filterStatus'].forEach(function(id) {
        var el = document.getElementById(id); if (el) el.addEventListener('change', loadAdminRows);
      });
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
    function loadAdminRows() {
      var source = (document.getElementById('filterSource')||{}).value||'';
      var filters = {
        year_group: (document.getElementById('filterYear')||{}).value||'',
        machine: (document.getElementById('filterMachine')||{}).value||'',
        status: (document.getElementById('filterStatus')||{}).value||'',
        teacher_query: (document.getElementById('filterTeacher')||{}).value||'',
        class_no: (document.getElementById('filterClass')||{}).value||'',
        student_email: (document.getElementById('filterStudentEmail')||{}).value||'',
        mine_only: (document.getElementById('filterMineOnly')||{}).checked ? 'true' : 'false'
      };
      setMsg('adminMsg','Loading\\u2026','muted');
      var dtRows = null, orRows = null, dtDone = false, orDone = false, hadError = false;
      function renderAdmin() {
        if (!dtDone || !orDone || hadError) return;
        (dtRows||[]).forEach(function(r){ r._source = 'dt'; });
        (orRows||[]).forEach(function(r){ r._source = 'other'; r.student_name = r.requester_name || ''; r.student_email = r.requester_email || ''; r.design_class_no = r.department_or_subject || ''; r.submission_id = r.submission_id || r.request_id; });
        var rows = (dtRows||[]).concat(orRows||[]);
        rows.sort(function(a,b){ return new Date(b.created_at) - new Date(a.created_at); });
        _adminRows = rows;
        var counts = {};
        rows.forEach(function(r){ counts[r.status] = (counts[r.status]||0)+1; });
        ['submitted','needs_fix','approved','in_queue','in_production','completed','rejected'].forEach(function(s){ setStatCard(s, counts[s]||0); });
        document.getElementById('statTotal').textContent = rows.length;
        setMsg('adminMsg', rows.length + ' submission(s).', 'muted');
        var el = document.getElementById('adminTable');
        var filterBanner = filters.mine_only === 'true'
          ? '<div class="alert alert-info" style="margin:0 0 12px;"><span class="alert-icon">&#8505;</span><span><strong>Filtered view:</strong> showing DT submissions where you are the teacher, plus Special Requests where you are the responsible teacher or approver. Turn off <strong>My students only</strong> to see the wider queue.</span></div>'
          : '';
        if (!rows.length) { el.innerHTML = filterBanner + '<div class="queue-empty alert alert-neutral"><span class="alert-icon">\ud83d\udce5</span><span>' + (filters.mine_only === 'true' ? 'No records are currently linked to your teacher / sponsor account under these filters.' : 'No submissions match the current filters.') + '</span></div>'; return; }
        el.innerHTML = filterBanner + '<div class="tbl-wrap"><table class="queue-table"><thead><tr><th>Requester</th><th>Job</th><th>Status</th><th>Queue Context</th><th>Action</th></tr></thead><tbody>' +
          rows.map(function(r, idx) {
            var dims = [r.width,r.height,r.depth].filter(function(v){ return v && String(v)!=='0'; });
            var machineLabel = esc(MACHINE_LABELS[r.machine]||r.machine||'');
            var materialLabel = esc(r.material||'\u2014');
            var dimsLabel = dims.length ? dims.join('\u00d7') + ' ' + esc(r.units||'') : '\u2014';
            var submittedMeta = queueTimeMeta(r.created_at);
            var updatedMeta = queueTimeMeta(r.updated_at);
            var statusNote = queueStatusNote(r);
            var requesterCell = r._source === 'other'
              ? '<td class="queue-cell-requester" data-label="Requester"><div class="queue-name">' + esc(r.requester_name||'\u2014') + '</div><div class="queue-meta-aux">' + esc(r.requester_email||'') + '</div><div class="queue-meta">' + esc(r.project_name || 'Untitled Special Request') + '</div><div class="queue-meta-aux">Sponsor: ' + esc(r.teacher_in_charge || '\u2014') + (r.department_or_subject ? ' · ' + esc(r.department_or_subject) : '') + '</div></td>'
              : '<td class="queue-cell-requester" data-label="Requester"><div class="queue-name">' + esc(r.student_name||'\u2014') + '</div><div class="queue-meta-aux">' + esc(r.student_email||'') + '</div><div class="queue-meta">Class ' + esc(r.design_class_no||'\u2014') + ' · ' + esc(r.year_group||'\u2014') + '</div><div class="queue-meta-aux">Teacher: ' + esc(r.design_teacher||'\u2014') + '</div></td>';
            var contextCell = '<td class="queue-cell-context" data-label="Job"><div class="queue-context"><div class="queue-context-top">' + sourcePill(r._source) + '</div><div class="queue-context-main">' + machineLabel + '</div><div class="queue-context-sub">' + materialLabel + (dims.length ? ' · ' + dimsLabel : '') + '</div>' + (r._source === 'other' && r.project_purpose ? '<div class="queue-context-sub">' + esc(r.project_purpose) + '</div>' : '') + '</div></td>';
            var statusCell = '<td class="queue-cell-status" data-label="Status"><div class="queue-status-block">' + statusPill(r.status) + '<div class="queue-next-owner">' + esc(statusOwner(r.status)) + '</div><div class="queue-status-note">' + esc(statusActionHint(r.status)) + '</div>' + (statusNote ? '<div class="queue-status-aux">' + esc(statusNote) + '</div>' : '') + '</div></td>';
            var metaCell = '<td class="queue-cell-meta" data-label="Queue Context"><div class="queue-meta-block"><div><div class="queue-time-main">Submitted ' + esc(submittedMeta || 'recently') + '</div><div class="queue-time-sub">' + esc(formatDisplayTs(r.created_at)) + '</div>' + (updatedMeta && r.updated_at && r.updated_at !== r.created_at ? '<div class="queue-time-sub">Updated ' + esc(updatedMeta) + '</div>' : '') + '</div>' + queueRiskBlock(r._activity) + '</div></td>';
            var actionCell = '<td class="queue-cell-action" data-label="Action"><button class="' + queueReviewButtonClass(r) + '" onclick="openDrawer(' + idx + ')">' + ((r.status === 'completed' || r.status === 'rejected') ? 'View' : 'Review') + '</button></td>';
            var rowClass = ['queue-row', queueRowStateClass(r.status), queueSourceClass(r._source), queueAttentionClass(r)].join(' ').trim();
            return '<tr class="' + rowClass + '">' +
              requesterCell +
              contextCell +
              statusCell +
              metaCell +
              actionCell +
            '</tr>';
          }).join('') + '</tbody></table></div>';
      }
      function onError(err) { if (!hadError) { hadError = true; setMsg('adminMsg', err.message||String(err), 'error'); } }
      if (source === 'other') {
        dtRows = []; dtDone = true;
        google.script.run.withSuccessHandler(function(rows){ orRows = rows; orDone = true; renderAdmin(); }).withFailureHandler(onError).getAdminOtherRequests(filters);
      } else if (source === 'dt') {
        orRows = []; orDone = true;
        google.script.run.withSuccessHandler(function(rows){ dtRows = rows; dtDone = true; renderAdmin(); }).withFailureHandler(onError).getAdminRows(filters);
      } else {
        google.script.run.withSuccessHandler(function(rows){ dtRows = rows; dtDone = true; renderAdmin(); }).withFailureHandler(onError).getAdminRows(filters);
        google.script.run.withSuccessHandler(function(rows){ orRows = rows; orDone = true; renderAdmin(); }).withFailureHandler(onError).getAdminOtherRequests(filters);
      }
    }

    function filterByStatus(status) {
      var sel = document.getElementById('filterStatus');
      if (!sel) return;
      sel.value = (sel.value === status) ? '' : status;
      loadAdminRows();
    }

    /* ---------- REVIEW DRAWER ---------- */
    function openDrawer(idx) {
      var r = _adminRows[idx]; if (!r) return;
      var overlay = document.getElementById('reviewDrawer');
      var isOther = r._source === 'other';
      document.getElementById('drawerTitle').textContent = isOther ? 'Review Special Request: ' + (r.project_name || 'Untitled') : 'Review: ' + (r.student_name || 'Submission');
      var isTech = BOOT.currentUser.role === 'technician';
      var techStatuses = ['approved','in_queue','in_production','completed'];
      var visibleStatuses = isTech ? techStatuses : BOOT.statuses;
      var issues = getIssueOptionsForMachine(r.machine);
      var dims = [r.width,r.height,r.depth].filter(function(v){ return v && String(v)!=='0'; });
      var activity = r._activity || {};
      var counts = activity.counts || {};
      var summarySection = '<div class="drawer-section"><div class="drawer-section-title">Operational Summary</div>' +
        '<div class="review-summary-grid">' +
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
          '<div class="drawer-field"><label>Teacher</label><div class="val">' + esc(r.design_teacher) + '</div></div></div>';
      }

      var body = summarySection + detailSection +
        '<div class="drawer-section"><div class="drawer-section-title">Fabrication</div>' +
        '<div class="drawer-field"><label>Machine</label><div class="val">' + esc(MACHINE_LABELS[r.machine]||r.machine) + '</div></div>' +
        '<div class="drawer-field"><label>Material</label><div class="val">' + esc(r.material||'\\u2014') + '</div></div>' +
        (dims.length ? '<div class="drawer-field"><label>Dimensions</label><div class="val">' + dims.join('\\u00d7') + ' ' + esc(r.units||'') + '</div></div>' : '') +
        (isOther && r.quantity ? '<div class="drawer-field"><label>Quantity</label><div class="val">' + esc(String(r.quantity)) + '</div></div>' : '') +
        '<div class="drawer-field"><label>Current Status</label><div class="val">' + statusPill(r.status) + '</div></div>' +
        (r.working_file_url ? '<div class="drawer-field"><label>Working File</label><div class="val"><a href="' + r.working_file_url + '" target="_blank">\\ud83d\\udcc4 ' + esc(r.working_file_name||'Download') + '</a></div></div>' : '') +
        (r.preview_file_url ? '<div class="drawer-field"><label>Preview</label><div class="val"><a href="' + r.preview_file_url + '" target="_blank">\\ud83d\\uddbc\\ufe0f View Preview</a></div><img src="https://drive.google.com/thumbnail?id=' + esc(r.preview_file_id) + '&sz=w400" alt="Preview" style="margin-top:6px;max-width:100%;border-radius:6px;border:1px solid var(--card-border);" onerror="this.style.display=\\'none\\'"></div>' : '') +
        (isOther && r.additional_requirements ? '<div class="drawer-field"><label>Notes</label><div class="val">' + esc(r.additional_requirements) + '</div></div>' : '') +
        '<div class="drawer-field"><label>Submitted</label><div class="val">' + esc(r.created_at ? r.created_at.substring(0,16).replace('T',' ') : '') + '</div></div>' +
        '<div class="drawer-field"><label>ID</label><div class="val" style="font-family:monospace;font-size:11px;word-break:break-all;">' + esc(r.submission_id || r.request_id) + '</div></div></div>' +
        '<div class="drawer-section"><div class="drawer-section-title">Review Actions</div>' +
        '<div class="drawer-field"><label>Set Status</label><select id="drawer_status" onchange="syncDrawerActionCue_()">' + visibleStatuses.map(function(s){ return '<option value="' + s + '"' + (s===r.status?' selected':'') + '>' + (STATUS_LABELS[s]||s) + '</option>'; }).join('') + '</select></div>' +
        '<div class="review-flag review-flag--info" id="drawerActionCue"><strong>Next step:</strong> ' + esc(statusActionHint(r.status)) + '</div>' +
        (isTech ? '' : '<div class="drawer-field"><label>Issue (optional)</label><select id="drawer_issue"><option value="">\\u2014 No issue \\u2014</option>' + issues.map(function(t){ return '<option value="' + esc(t.issue_code) + '"' + (t.issue_code===r.issue_code?' selected':'') + '>' + esc(t.issue_label) + '</option>'; }).join('') + '</select></div>') +
        '<div class="drawer-field"><label>Remarks (student-visible)</label><textarea id="drawer_remarks" rows="3" placeholder="Notes visible to the requester\\u2026">' + esc(r.admin_remarks||'') + '</textarea></div></div>';

      document.getElementById('drawerBody').innerHTML = body;
      var saveId = esc(r.submission_id || r.request_id);
      document.getElementById('drawerActions').innerHTML =
        '<button class="btn btn-primary btn-sm" onclick="saveFromDrawer(\\'' + saveId + '\\')">Save Changes</button>' +
        (isOther ? '' : '<button class="btn btn-ghost btn-sm" onclick="draftEmail(\\'' + saveId + '\\')">\\u2709 Draft Email</button>') +
        (isTech || BOOT.currentUser.role === 'admin' ? '<button class="btn btn-ghost btn-sm" onclick="reportTeacher(\\'' + saveId + '\\')">\\ud83d\\udce2 Notify Teacher</button>' : '') +
        '<button class="btn btn-ghost btn-sm" onclick="closeDrawer()">Close</button>';

      overlay.classList.add('show');
      overlay.onclick = function(e) { if (e.target === overlay) closeDrawer(); };
      syncDrawerActionCue_();
    }

    function closeDrawer() { document.getElementById('reviewDrawer').classList.remove('show'); }

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
        document.getElementById('studentPreviewBanner').remove();
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
      var studentPages = ['submit','status','machines','other','help'];
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
        '<div class="modal">' +
          '<div class="modal-head"><h3>&#9993; Email Draft</h3><button class="modal-close" onclick="document.getElementById(\\'emailOverlay\\').remove()">&times;</button></div>' +
          '<div class="email-meta"><p><strong>To:</strong> ' + esc(d.to) + '</p><p><strong>Subject:</strong> ' + esc(d.subject) + '</p></div>' + warn +
          '<div class="email-preview"><h4>Email Body</h4><div class="email-body" id="emailBody">' + (d.body_html||'') + '</div></div>' +
          '<div class="btn-group" style="padding:14px 20px;border-top:1px solid var(--card-border);">' +
            '<button class="btn btn-primary btn-sm" onclick="copyEmailHtml_()">&#128203; Copy HTML</button>' +
            '<button class="btn btn-ghost btn-sm" onclick="openMailDraft_()">Open in Mail</button>' +
            '<button class="btn btn-ghost btn-sm" onclick="document.getElementById(\\'emailOverlay\\').remove()">Close</button>' +
          '</div></div>';
      document.body.appendChild(overlay);
      overlay.addEventListener('click', function(e){ if (e.target === overlay) overlay.remove(); });
    }

    function openMailDraft_() {
      var d = window.__emailDraft || {};
      var to = encodeURIComponent(String(d.to||''));
      var subject = encodeURIComponent(String(d.subject||''));
      var bodyText = '';
      try {
        bodyText = String(d.body_html||'')
          .replace(/<br\\s*\\/?>/gi, '\\n')
          .replace(/<[^>]+>/g, ' ')
          .replace(/\\s+/g, ' ')
          .trim();
      } catch(e) {}
      var body = encodeURIComponent(bodyText);
      window.open('mailto:' + to + '?subject=' + subject + (body ? '&body=' + body : ''), '_blank');
    }

    function copyEmailHtml_() {
      var body = document.getElementById('emailBody');
      if (!body) return;
      if (navigator.clipboard) {
        navigator.clipboard.writeText(body.innerHTML).then(function(){ showToast('HTML copied to clipboard.','success'); });
      } else {
        var r = document.createRange(); r.selectNodeContents(body);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        document.execCommand('copy');
        showToast('Copied.','success');
      }
    }

    /* ================================================
       RULES PAGE (admin only)
    ================================================ */
    function initRulesPage() {
      if (!BOOT.currentUser.isAdmin || BOOT.currentUser.role !== 'admin') return;
      loadRulesTable();
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
      if (!BOOT.currentUser.isAdmin) return;
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
              return '<tr><td style="white-space:nowrap;">' + esc(r.timestamp ? r.timestamp.substring(0,19).replace('T',' ') : '') + '</td><td>' + esc(r.actor_email) + '</td><td>' + esc(r.action_type) + '</td><td style="font-family:monospace;font-size:11px;max-width:120px;word-break:break-all;">' + esc(r.submission_id) + '</td><td>' + (r.new_status ? statusPill(r.new_status) : esc(r.old_status + ' \\u2192 ' + r.new_status)) + '</td><td style="max-width:250px;">' + esc(r.notes) + '</td></tr>';
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
        title.addEventListener('click', function() {
          title.closest('.help-section').classList.toggle('help-expanded');
        });
      });
    })();
    function helpJump_(id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.classList.add('help-expanded');
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

function renderSubmitPage_() {
  var teacherOptions = Object.keys(APP.teacherEmails).sort().map(function(t) {
    return '<option value="' + escapeHtml_(t) + '">' + escapeHtml_(t) + '</option>';
  }).join('');
  return `
  <div class="welcome-banner">
    <h3>&#128075; Welcome to the Design Fabrication Dashboard</h3>
    <p>Submit your DT coursework laser cutting or 3D printing files below. Your submission will be reviewed by the technician and you&rsquo;ll receive email updates on its status.</p>
    <div class="welcome-pills">
      <span class="welcome-pill">&#128293; Laser Cutting</span>
      <span class="welcome-pill">&#9881; 3D Printing</span>
      <span class="welcome-pill">&#128640; Fast Tracking</span>
      <span class="welcome-pill">&#128172; Email Notifications</span>
    </div>
  </div>

  <div class="card">
    <div class="section-title">&#128196; DT Coursework Submission</div>
    <div class="section-sub">Submit your Design &amp; Technology laser cutting or 3D printing working file. Fill in the form below.</div>
    <p style="font-size:12px;color:var(--slate-lt);margin:0 0 16px;line-height:1.5;">&#11088; Not DT coursework? Competitions, other subjects, clubs, or events &rarr; use <a href="javascript:void(0)" onclick="switchPage('other')" style="font-weight:700;color:var(--blue);text-decoration:underline;">Special Request</a> in the top navigation.</p>

    ` + renderDisclaimerBox_('&#9200; ' + APP.uiText.turnaroundHeadline, APP.uiText.turnaroundShort + renderBulletList_(APP.uiText.turnaroundFactors)) + `

    <div class="guide-card">
      <div class="guide-title">&#128221; Submission Checklist</div>
      <ul class="guide-list">
        <li id="guideStep1"><span class="guide-check">&#9675;</span><span>Fill in your student details exactly as school records.</span></li>
        <li id="guideStep2"><span class="guide-check">&#9675;</span><span>Select your year and machine to see the correct file rules.</span></li>
        <li id="guideStep3"><span class="guide-check">&#9675;</span><span>Enter your design dimensions. Check they are within limits.</span></li>
        <li id="guideStep4"><span class="guide-check">&#9675;</span><span>Upload the correct working file and preview image (if required).</span></li>
        <li id="guideStep5"><span class="guide-check">&#9675;</span><span>` + APP.uiText.turnaroundChecklistReminder + `</span></li>
      </ul>
      <div class="guide-progress">
        <div class="progress-strip"><div id="submitGuideBar" class="progress-fill" style="width:0%"></div></div>
        <div id="submitGuideHint" class="hint">0/5 sections complete. Finish all items before submitting.</div>
      </div>
    </div>

    <div id="submitFormWrap">
      <div id="ruleBox" class="rule-box"></div>

      <form id="submitForm" autocomplete="off">
        <div class="form-section">
          <div class="form-section-title">Student Details</div>
          <div class="grid g2">
            <div class="field">
              <label>Email <span class="req">*</span></label>
              <input type="email" name="student_email" placeholder="studentID@student.school.edu" required>
              <div class="helper">Use your school email address.</div>
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
                ${teacherOptions}
              </select>
            </div>
            <div class="field">
              <label>Year Group <span class="req">*</span></label>
              <select name="year_group" id="year_group" required>
                <option value="">&mdash; Select year &mdash;</option>
              </select>
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
          <div class="grid g2">
            <div class="field">
              <label>Working File <span class="req">*</span></label>
              <div class="file-zone" id="zone_workingFile" role="button" tabindex="0">
                <input type="file" id="workingFile">
                <div class="file-zone-icon">&#128196;</div>
                <div class="file-zone-label">Click or drag &amp; drop</div>
                <div class="file-zone-sub">Affinity Designer (.af, .afdesign), SVG, DXF, or STL</div>
                <div class="file-chosen" id="chosen_workingFile"></div>
              </div>
            </div>
            <div class="field">
              <label>Preview Image <span class="req">*</span></label>
              <div class="file-zone" id="zone_previewFile" role="button" tabindex="0">
                <input type="file" id="previewFile" accept="image/*">
                <div class="file-zone-icon">&#128444;&#65039;</div>
                <div class="file-zone-label">Click or drag &amp; drop</div>
                <div class="file-zone-sub">PNG, JPG, or JPEG accepted</div>
                <div class="file-chosen" id="chosen_previewFile"></div>
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
        <p>Your file has been submitted. Save your submission ID to track progress.</p>
      </div>

      <div class="success-id-block">
        <div class="success-id-label">Submission ID</div>
        <div class="id-box" id="successId" role="button" tabindex="0" onclick="copySuccessId_(this)">
          <span class="id-box-text"></span>
          <span class="id-box-icon" title="Copy to clipboard">&#128203;</span>
        </div>
        <div class="id-box-hint">Click to copy &mdash; you&#8217;ll need this to track your request.</div>
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
  `;
}

function renderOtherRequestPage_() {
  var teacherOptions = Object.keys(APP.teacherEmails).sort().map(function(t) {
    return '<option value="' + escapeHtml_(t) + '">' + escapeHtml_(t) + '</option>';
  }).join('');


  return `
  <div class="card">
    <div class="section-title">&#128301; ${APP.uiText.otherRequestIntroHeadline}</div>
    <div class="section-sub">${APP.uiText.otherRequestIntroBody}</div>
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
              <input type="email" name="requester_email" placeholder="your-email@school.edu" required>
              <div class="helper">Use your school email address.</div>
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
                <option value="">&mdash; Select &mdash;</option>
                <option value="Y6">Y6</option><option value="Y7">Y7</option>
                <option value="Y8">Y8</option>
                <option value="Y9">Y9</option><option value="Y10">Y10</option>
                <option value="Y11">Y11</option><option value="Y12">Y12</option>
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
              <input type="email" name="teacher_in_charge_email" id="otherTeacherEmail" placeholder="teacher@school.edu" required>
            </div>
            <div class="field">
              <label>Approver Email <span class="req">*</span></label>
              <input type="email" name="approved_by_email" placeholder="approver@school.edu" required>
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
                <input type="file" id="otherWorkingFile">
                <div class="file-zone-icon">&#128196;</div>
                <div class="file-zone-label">Click or drag &amp; drop</div>
                <div class="file-zone-sub">Upload the fabrication file that should be processed</div>
                <div class="file-chosen" id="chosen_otherWorkingFile"></div>
              </div>
            </div>
            <div class="field">
              <label>Preview Image <span class="req">*</span></label>
              <div class="file-zone" id="zone_otherPreviewFile" role="button" tabindex="0">
                <input type="file" id="otherPreviewFile" accept="image/*">
                <div class="file-zone-icon">&#128444;&#65039;</div>
                <div class="file-zone-label">Click or drag &amp; drop</div>
                <div class="file-zone-sub">PNG, JPG, or JPEG screenshot showing the model or dimensions</div>
                <div class="file-chosen" id="chosen_otherPreviewFile"></div>
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
        <div class="success-id-label">Request ID</div>
        <div class="id-box" id="otherSuccessId" role="button" tabindex="0" onclick="copySuccessId_(this)">
          <span class="id-box-text"></span>
          <span class="id-box-icon" title="Copy to clipboard">&#128203;</span>
        </div>
        <div class="id-box-hint">Click to copy &mdash; you&#8217;ll need this to track your request.</div>
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
  var title = isStudentView ? '&#128270; My Submission Status' : '&#128270; Submission Lookup';
  var sub = isStudentView
    ? 'Enter your school email or submission ID to check your fabrication progress. Your results will load automatically.'
    : 'Look up any submission by student email or submission ID.';
  return `
  <div class="card">
    <div class="section-title">${title}</div>
    <div class="section-sub">${sub}</div>

    ` + renderDisclaimerBox_('&#9200; Turnaround Time Notice', APP.uiText.turnaroundStatusNotice) + `

    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:8px;">
      <input id="statusQuery" type="text" placeholder="Email or Submission ID" style="flex:1;min-width:220px;">
      <button class="btn btn-primary" onclick="loadStatuses()" style="white-space:nowrap;">&#128270; Check Status</button>
    </div>
    <div id="statusMsg" class="inline-msg tc-muted" style="margin-bottom:12px;"></div>
    <div id="statusResults">
      <div id="statusEmptyState" style="text-align:center;padding:32px 16px;color:var(--muted);">
        <div style="font-size:36px;margin-bottom:12px;">&#128269;</div>
        <p style="margin:0 0 6px;font-weight:600;">No search yet</p>
        <p style="margin:0 0 18px;font-size:13px;">Enter your school email to see all your submissions, or paste a specific Submission ID to look up a single entry.</p>
        <div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap;max-width:600px;margin:0 auto;">
          <div style="flex:1;min-width:160px;background:var(--card);border:1px solid var(--card-border);border-radius:var(--radius-sm);padding:14px;text-align:center;">
            <div style="font-size:22px;margin-bottom:4px;">&#128232;</div>
            <div style="font-size:12px;font-weight:700;color:var(--navy);">Step 1: Enter Email</div>
            <div style="font-size:11px;color:var(--slate-lt);margin-top:2px;">Your school email address</div>
          </div>
          <div style="flex:1;min-width:160px;background:var(--card);border:1px solid var(--card-border);border-radius:var(--radius-sm);padding:14px;text-align:center;">
            <div style="font-size:22px;margin-bottom:4px;">&#128270;</div>
            <div style="font-size:12px;font-weight:700;color:var(--navy);">Step 2: Click Check</div>
            <div style="font-size:11px;color:var(--slate-lt);margin-top:2px;">We&rsquo;ll search both pathways</div>
          </div>
          <div style="flex:1;min-width:160px;background:var(--card);border:1px solid var(--card-border);border-radius:var(--radius-sm);padding:14px;text-align:center;">
            <div style="font-size:22px;margin-bottom:4px;">&#128200;</div>
            <div style="font-size:12px;font-weight:700;color:var(--navy);">Step 3: Track Progress</div>
            <div style="font-size:11px;color:var(--slate-lt);margin-top:2px;">See status, timeline &amp; remarks</div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;
}

function renderAdminPage_(user) {
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
    ? '<strong>Process Jobs:</strong> Click "Review" on any row to open the review panel. Set statuses and notify teachers from there.'
    : user.role === 'teacher'
      ? '<strong>Monitor Students:</strong> "My students only" is on by default. Review status, follow up on items marked "Needs Fix".'
      : '<strong>Admin View:</strong> Full access to all submissions. Click "Review" to open the detail panel.';

  return `
  <div class="card" style="margin-bottom:16px;">
    <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
      <div>
        <div class="section-title">&#128736; ${escapeHtml_(roleLabel)}</div>
        <div class="section-sub">${roleHint}</div>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn btn-ghost btn-sm" onclick="previewStudentView()">&#128065; Student View</button>
        <button class="btn btn-ghost btn-sm" onclick="openMasterSheet()">&#128196; Open Sheet</button>
      </div>
    </div>

    <div class="stats-bar">
      <div class="stat-card" onclick="filterByStatus('')" id="statCardAll"><div class="stat-num" id="statTotal">&mdash;</div><div class="stat-label">Total</div></div>
      <div class="stat-card" onclick="filterByStatus('submitted')"><div class="stat-num pill pill-submitted" id="stat_submitted">&mdash;</div><div class="stat-label">Submitted</div></div>
      <div class="stat-card" onclick="filterByStatus('needs_fix')"><div class="stat-num pill pill-needs_fix" id="stat_needs_fix">&mdash;</div><div class="stat-label">Needs Fix</div></div>
      <div class="stat-card" onclick="filterByStatus('approved')"><div class="stat-num pill pill-approved" id="stat_approved">&mdash;</div><div class="stat-label">Approved</div></div>
      <div class="stat-card" onclick="filterByStatus('in_queue')"><div class="stat-num pill pill-in_queue" id="stat_in_queue">&mdash;</div><div class="stat-label">In Queue</div></div>
      <div class="stat-card" onclick="filterByStatus('in_production')"><div class="stat-num pill pill-in_production" id="stat_in_production">&mdash;</div><div class="stat-label">In Prod</div></div>
      <div class="stat-card" onclick="filterByStatus('completed')"><div class="stat-num pill pill-completed" id="stat_completed">&mdash;</div><div class="stat-label">Done</div></div>
      <div class="stat-card" onclick="filterByStatus('rejected')"><div class="stat-num pill pill-rejected" id="stat_rejected">&mdash;</div><div class="stat-label">Rejected</div></div>
    </div>
  </div>

  <div class="card">
    <div class="filter-bar">
      <div class="field"><label>Source</label><select id="filterSource"><option value="">All</option><option value="dt">DT Submissions</option><option value="other">Special Requests</option></select></div>
      <div class="field"><label>Year</label><select id="filterYear"><option value="">All</option><option value="Y8">Y8</option><option value="Y9">Y9</option><option value="Y10">Y10</option></select></div>
      <div class="field"><label>Machine</label><select id="filterMachine"><option value="">All</option><option value="laser">Laser</option><option value="3d">3D Print</option></select></div>
      <div class="field"><label>Status</label><select id="filterStatus"><option value="">All</option><option value="submitted">Submitted</option><option value="needs_fix">Needs Fix</option><option value="approved">Approved</option><option value="in_queue">In Queue</option><option value="in_production">In Prod</option><option value="completed">Done</option><option value="rejected">Rejected</option></select></div>
      <div class="field"><label>Teacher</label><input type="text" id="filterTeacher" placeholder="Name"></div>
      <div class="field"><label>Class</label><input type="text" id="filterClass" placeholder="e.g. 8.1"></div>
      <div class="field"><label>Student</label><input type="text" id="filterStudentEmail" placeholder="Email"></div>
      <div class="filter-meta">
        <label class="teacher-toggle"><input type="checkbox" id="filterMineOnly"> My students only</label>
        <button class="btn btn-ghost btn-sm" onclick="document.querySelectorAll('.filter-bar select,.filter-bar input[type=text]').forEach(function(el){el.value='';});document.getElementById('filterMineOnly').checked=false;loadAdminRows();">&#10060; Clear</button>
        <button class="btn btn-primary btn-sm" onclick="loadAdminRows()">&#8635; Refresh</button>
      </div>
    </div>
    <div id="adminMsg" class="inline-msg tc-muted"></div>
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
        <p>Fill in the form, upload your file, and submit. Use the <strong>Status</strong> page with your Submission ID to track your request.</p>
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
      <li>Used your <strong>school email address</strong> (not a personal email)</li>
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
          <li>Your <strong>school email</strong> (e.g. name@school.edu)</li>
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
      <label><input type="checkbox"> I used my <strong>school email address</strong></label>
      <label><input type="checkbox"> I entered my <strong>name, class, and teacher</strong> correctly</label>
      <label><input type="checkbox"> I selected the correct <strong>year group</strong></label>
      <label><input type="checkbox"> I selected the correct <strong>machine</strong> (Laser or 3D)</label>
      <label><input type="checkbox"> I selected the correct <strong>material</strong></label>
    </div>

    <div class="help-checklist">
      <div class="help-checklist-title">&#128293; Laser Cutting</div>
      <label><input type="checkbox"> I uploaded an <strong>.af or .afdesign</strong> file</label>
      <label><input type="checkbox"> My file uses <strong>vector paths only</strong> (no images/raster layers)</label>
      <label><input type="checkbox"> My file is the <strong>whole document / whole artboard</strong></label>
      <label><input type="checkbox"> My design is within the <strong>size limit</strong> for my year</label>
      <label><input type="checkbox"> I uploaded a <strong>preview image</strong> if required</label>
    </div>

    <div class="help-checklist">
      <div class="help-checklist-title">&#9881; 3D Printing</div>
      <label><input type="checkbox"> I uploaded a valid <strong>.stl</strong> file</label>
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
    <p>After submission, you will receive a <strong>Submission ID</strong>. Save this ID &mdash; you can use it on the <strong>My Status</strong> page to check your progress at any time.</p>
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
      <li>Open the <strong>My Status</strong> page</li>
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
          <li>Using a <strong>personal email</strong> instead of your school email</li>
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
      <li>Check <strong>My Status</strong> after submission for updates and remarks</li>
      <li>` + APP.uiText.turnaroundQuickRule + `</li>
    </ol>
  </div>
  `;
}

function renderRulesPage_() {
  return `
  <div class="card">
    <div class="section-title">&#9881; Rules Configuration</div>
    <div class="section-sub">View and manage fabrication rules by year group and machine type. Edit directly in the Google Sheet for now.</div>
    <div id="rulesMsg" class="inline-msg tc-muted"></div>
    <div id="rulesTable" style="margin-top:12px;overflow-x:auto;"></div>
    <div style="margin-top:12px;">
      <button class="btn btn-ghost btn-sm" onclick="openMasterSheet()">&#128196; Edit in Sheet</button>
      <button class="btn btn-ghost btn-sm" onclick="loadRulesTable()" style="margin-left:8px;">&#8635; Refresh</button>
    </div>
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
        <div class="field"><label>Email</label><input type="email" id="newUserEmail" placeholder="studentID@student.school.edu"></div>
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

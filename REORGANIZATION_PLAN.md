# Repository Reorganization Plan

## Current Structure Issues
1. All HTML files in root directory (cluttered)
2. Large PDF files in root directory
3. Multiple markdown documentation files scattered in root
4. Test files buried in js/__tests__

## Proposed New Structure

```
VARC-Practice/
├── index.html              # Landing page (stays at root)
├── .gitignore
├── package.json
├── README.md              # Main README (stays at root)
│
├── pages/                 # All application pages
│   ├── quiz.html
│   ├── results.html
│   ├── rc-selection.html
│   ├── para-completion-selection.html
│   ├── para-summary-selection.html
│   └── test-dark-mode.html
│
├── css/                   # All stylesheets (existing)
│   ├── style.css
│   ├── landing.css
│   ├── selection.css
│   └── results.css
│
├── js/                    # All JavaScript (existing structure improved)
│   ├── app.js
│   ├── landing.js
│   ├── results.js
│   ├── storage.js
│   ├── utils.js
│   ├── darkmode.js
│   ├── rc-selection.js
│   ├── para-completion-selection.js
│   ├── para-summary-selection.js
│   └── selection.js
│
├── data/                  # All JSON data files (existing)
│   ├── rc-passages.json
│   ├── para-completion.json
│   └── para-summary.json
│
├── tests/                 # All test files (reorganized)
│   ├── unit/
│   │   ├── utils.test.js
│   │   └── storage.test.js
│   ├── integration/
│   │   ├── navigation.test.js
│   │   ├── quiz-flow.test.js
│   │   └── data-loading.test.js
│   └── e2e/
│       └── full-workflow.test.js
│
├── docs/                  # All documentation
│   ├── REPOSITORY_STRUCTURE.md
│   ├── IMPLEMENTATION_PLAN.md
│   ├── TESTING.md
│   ├── AGENT_NOTES.md
│   ├── PROJECT_SUMMARY.md
│   ├── MAINTENANCE_SUMMARY.md
│   ├── VERIFICATION_REPORT.md
│   ├── PHASE_1_COMPLETION.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   ├── FINAL_SUMMARY.md
│   └── ARCHITECTURE.md (new)
│
└── assets/                # Static assets
    └── pdfs/
        ├── Reading-Comprehension.pdf
        └── Top-96-CAT-Para-Completion-and-Summary-Questions.pdf
```

## Path Updates Required

### HTML Files Moving to pages/
All files except index.html need path updates:

1. **CSS imports**: `href="css/..."` → `href="../css/..."`
2. **JS imports**: `src="js/..."` → `src="../js/..."`  
3. **Navigation links**: `href="results.html"` → `href="results.html"` (stay in pages/)
4. **Back to index**: `href="index.html"` → `href="../index.html"`

### JS Files (staying in js/)
Data file paths need updates ONLY in files that fetch from pages/:
- Files in pages/ calling JS: No change needed (relative path stays `../data/...`)
- But data fetches in JS use relative from HTML location

Actually, since JS files stay in js/, and they're loaded from pages/, the fetch paths should work.
We need to verify this carefully.

### Key Considerations
1. Keep index.html at root (landing page)
2. All internal pages move to pages/
3. Relative paths must be updated accordingly
4. Test after each batch of moves

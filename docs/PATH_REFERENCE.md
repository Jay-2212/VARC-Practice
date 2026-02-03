# VARC Practice - Path Reference Guide

This document provides a comprehensive reference for all file paths in the VARC Practice application. Use this guide when adding features, modifying navigation, or debugging path issues.

## Table of Contents
1. [Directory Structure](#directory-structure)
2. [HTML Path References](#html-path-references)
3. [JavaScript Path References](#javascript-path-references)
4. [CSS Path References](#css-path-references)
5. [Data File Paths](#data-file-paths)
6. [Navigation Paths](#navigation-paths)
7. [Asset Paths](#asset-paths)
8. [Test File Paths](#test-file-paths)

---

## Directory Structure

```
VARC-Practice/
├── index.html                      # ROOT LEVEL
├── pages/                          # PAGES LEVEL
│   ├── rc-selection.html
│   ├── para-completion-selection.html
│   ├── para-summary-selection.html
│   ├── quiz.html
│   ├── results.html
│   └── test-dark-mode.html
├── css/                            # CSS LEVEL
│   ├── landing.css
│   ├── selection.css
│   ├── style.css
│   └── results.css
├── js/                             # JS LEVEL
│   ├── landing.js
│   ├── rc-selection.js
│   ├── para-completion-selection.js
│   ├── para-summary-selection.js
│   ├── app.js
│   ├── results.js
│   ├── storage.js
│   ├── utils.js
│   ├── darkmode.js
│   └── selection.js
├── data/                           # DATA LEVEL
│   ├── rc-passages.json
│   ├── para-completion.json
│   └── para-summary.json
├── tests/                          # TESTS LEVEL
│   ├── unit/
│   │   ├── utils.test.js
│   │   └── storage.test.js
│   └── integration/
│       ├── navigation.test.js
│       ├── data-loading.test.js
│       └── quiz-flow.test.js
├── docs/                           # DOCS LEVEL
│   └── [documentation files]
└── assets/                         # ASSETS LEVEL
    └── pdfs/
        ├── Reading-Comprehension.pdf
        └── Top-96-CAT-Para-Completion-and-Summary-Questions.pdf
```

---

## HTML Path References

### From Root Level (`index.html`)

#### CSS Links
```html
<link rel="stylesheet" href="css/landing.css">
```

#### JavaScript Sources
```html
<script src="js/darkmode.js"></script>
<script src="js/landing.js"></script>
```

#### Navigation Links
```html
<!-- Handled by JavaScript in landing.js -->
<!-- Navigates to: pages/rc-selection.html -->
<!-- Navigates to: pages/para-completion-selection.html -->
<!-- Navigates to: pages/para-summary-selection.html -->
```

---

### From Pages Level (`pages/*.html`)

#### CSS Links
```html
<link rel="stylesheet" href="../css/selection.css">
<link rel="stylesheet" href="../css/style.css">
<link rel="stylesheet" href="../css/results.css">
```

#### JavaScript Sources
```html
<!-- Common scripts -->
<script src="../js/utils.js"></script>
<script src="../js/storage.js"></script>
<script src="../js/darkmode.js"></script>

<!-- Page-specific scripts -->
<script src="../js/rc-selection.js"></script>
<script src="../js/para-completion-selection.js"></script>
<script src="../js/para-summary-selection.js"></script>
<script src="../js/app.js"></script>
<script src="../js/results.js"></script>
```

#### Navigation Links (HTML)
```html
<!-- Back to landing -->
<a href="../index.html" class="back-button">
    <i class="fas fa-arrow-left"></i> Back to Question Types
</a>
```

---

## JavaScript Path References

### From Root Level JS (`js/landing.js`)

#### Navigation (Loaded by index.html)
```javascript
// Navigate to selection pages
window.location.href = 'pages/rc-selection.html';
window.location.href = 'pages/para-completion-selection.html';
window.location.href = 'pages/para-summary-selection.html';
```

---

### From Pages Level JS (Loaded by pages/*.html)

#### Data File Fetching (`js/*-selection.js`)
```javascript
// From pages directory, data paths work because HTML is in pages/
const response = await fetch('data/rc-passages.json');
const response = await fetch('data/para-completion.json');
const response = await fetch('data/para-summary.json');
```

**Important**: These paths work because:
1. The fetch() is called from JS loaded by HTML in pages/
2. The relative path resolves from the HTML file's location
3. So `data/rc-passages.json` resolves to `../data/rc-passages.json` from pages/

#### Navigation from Selection Pages
```javascript
// Stay in pages directory
window.location.href = 'quiz.html';
```

#### Navigation from Quiz Page (`js/app.js`)
```javascript
// Back to root
window.location.href = '../index.html';

// To results (same directory)
window.location.href = `results.html?type=${this.questionType}&setId=${this.rcSetId}`;

// Back to selection pages
const backPages = {
    'rc': '../pages/rc-selection.html',
    'para-completion': '../pages/para-completion-selection.html',
    'para-summary': '../pages/para-summary-selection.html'
};
window.location.href = backPages[this.questionType] || '../index.html';
```

#### Navigation from Results Page (`js/results.js`)
```javascript
// Back to root
window.location.href = '../index.html';

// Retry quiz (same directory)
window.location.href = 'quiz.html';
```

---

## CSS Path References

### CSS Files Location
All CSS files are in the `css/` directory at root level.

### Referenced by Root HTML
```css
/* From index.html */
href="css/landing.css"
```

### Referenced by Pages HTML
```css
/* From pages/*.html */
href="../css/selection.css"
href="../css/style.css"
href="../css/results.css"
```

### No Internal CSS Imports
CSS files don't import other CSS files in this project.

---

## Data File Paths

### Data Files Location
All data files are in the `data/` directory at root level.

### File List
- `data/rc-passages.json` - Reading Comprehension passages and questions
- `data/para-completion.json` - Para Completion questions
- `data/para-summary.json` - Para Summary questions

### Accessed by JavaScript
```javascript
// From JS files loaded by pages/*.html
fetch('data/rc-passages.json')      // Works due to HTML location
fetch('data/para-completion.json')  // Works due to HTML location
fetch('data/para-summary.json')     // Works due to HTML location
```

### Data File Structure
Each data file contains:
```json
{
  "testInfo": {
    "title": "Test Title",
    "duration": 40,
    "totalQuestions": 24
  },
  "questions": [
    {
      "id": 1,
      "passageId": 1,  // or setId for para questions
      "passage": "...",
      "question": "...",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "..."
    }
  ]
}
```

---

## Navigation Paths

### Complete Navigation Map

```
User Flow:
---------

index.html (ROOT)
    │
    ├─→ [Select RC]
    │   └─→ pages/rc-selection.html
    │       └─→ pages/quiz.html?type=rc&setId=X
    │           └─→ pages/results.html?type=rc&setId=X
    │               ├─→ pages/quiz.html (retry)
    │               └─→ ../index.html (home)
    │
    ├─→ [Select Para Completion]
    │   └─→ pages/para-completion-selection.html
    │       └─→ pages/quiz.html?type=para-completion&setId=X
    │           └─→ pages/results.html?type=para-completion&setId=X
    │               ├─→ pages/quiz.html (retry)
    │               └─→ ../index.html (home)
    │
    └─→ [Select Para Summary]
        └─→ pages/para-summary-selection.html
            └─→ pages/quiz.html?type=para-summary&setId=X
                └─→ pages/results.html?type=para-summary&setId=X
                    ├─→ pages/quiz.html (retry)
                    └─→ ../index.html (home)
```

### URL Patterns

#### Landing Page
```
URL: /index.html (or just /)
Parameters: None
```

#### Selection Pages
```
URL: /pages/rc-selection.html
URL: /pages/para-completion-selection.html
URL: /pages/para-summary-selection.html
Parameters: None (stored in localStorage)
```

#### Quiz Page
```
URL: /pages/quiz.html
Parameters: None (loaded from localStorage)
Required Storage:
  - varc_question_type
  - varc_selected_rc_set (or PC/PS variant)
```

#### Results Page
```
URL: /pages/results.html?type=<type>&setId=<id>
Parameters:
  - type: 'rc' | 'para-completion' | 'para-summary'
  - setId: number
Required Storage:
  - Attempt data for the specified type and setId
```

---

## Asset Paths

### PDF Files
Located in: `assets/pdfs/`

Files:
- `assets/pdfs/Reading-Comprehension.pdf`
- `assets/pdfs/Top-96-CAT-Para-Completion-and-Summary-Questions.pdf`

**Note**: These are reference materials, not actively loaded by the application.

### External CDN Assets
```html
<!-- Font Awesome (all HTML files) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

---

## Test File Paths

### Test Directory Structure
```
tests/
├── unit/                    # Unit tests
│   ├── utils.test.js       # Tests for js/utils.js
│   └── storage.test.js     # Tests for js/storage.js
└── integration/            # Integration tests
    ├── navigation.test.js  # Navigation flow tests
    ├── data-loading.test.js # Data loading tests
    └── quiz-flow.test.js   # Quiz workflow tests
```

### Module Imports in Tests

#### From Unit Tests (`tests/unit/*.test.js`)
```javascript
const Utils = require('../../js/utils');
const StorageManager = require('../../js/storage');
```

#### From Integration Tests (`tests/integration/*.test.js`)
```javascript
const StorageManager = require('../../js/storage');
const Utils = require('../../js/utils');
const fs = require('fs');
const path = require('path');

// Reading data files
const dataDir = path.join(__dirname, '../../data');
const filePath = path.join(dataDir, 'rc-passages.json');
```

### Running Tests
```bash
# From project root
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

---

## Common Path Issues and Solutions

### Issue: 404 on CSS/JS files from pages/
**Symptom**: Resources not loading when opening pages/*.html
**Cause**: Missing `../` in path
**Solution**: All resource paths from pages/ must use `../`
```html
<!-- Wrong -->
<link rel="stylesheet" href="css/style.css">
<!-- Correct -->
<link rel="stylesheet" href="../css/style.css">
```

### Issue: Data not loading in quiz
**Symptom**: fetch() fails for data files
**Cause**: Incorrect relative path from JS
**Solution**: Use relative path from HTML location, not JS location
```javascript
// Correct (when JS is loaded by pages/*.html)
fetch('data/rc-passages.json')  // Resolves to ../data/ from pages/
```

### Issue: Navigation breaks after reorganization
**Symptom**: Clicking links results in 404
**Cause**: Old paths still used after moving files
**Solution**: Update all navigation to use new paths
```javascript
// Old (when pages were at root)
window.location.href = 'quiz.html';

// New (from root to pages)
window.location.href = 'pages/quiz.html';

// New (from pages to pages)
window.location.href = 'quiz.html';  // Same directory

// New (from pages to root)
window.location.href = '../index.html';
```

### Issue: Tests can't find modules
**Symptom**: Module not found error in tests
**Cause**: Tests moved but imports not updated
**Solution**: Update require paths to match new test location
```javascript
// Old (when tests were in js/__tests__/)
const Utils = require('../utils');

// New (tests in tests/unit/)
const Utils = require('../../js/utils');
```

---

## Path Checklist for New Features

When adding new features, verify:

- [ ] HTML files link to CSS with correct relative path
- [ ] HTML files link to JS with correct relative path
- [ ] JS files navigate using correct paths
- [ ] Data fetch() uses correct path
- [ ] Tests import modules with correct paths
- [ ] Navigation works in both directions
- [ ] All resources load without 404 errors
- [ ] Dark mode works on new pages
- [ ] localStorage keys follow naming convention

---

## Path Conventions

### Naming Conventions
- **HTML files**: kebab-case (e.g., `para-completion-selection.html`)
- **CSS files**: kebab-case (e.g., `landing.css`)
- **JS files**: kebab-case (e.g., `rc-selection.js`)
- **Data files**: kebab-case (e.g., `rc-passages.json`)
- **Test files**: kebab-case with .test.js suffix

### Directory Naming
- All lowercase
- No spaces
- Descriptive names
- Plural for collections (e.g., `pages/`, `tests/`)

### URL Parameter Naming
- Camel case in code
- Kebab-case in URLs
- Clear, descriptive names

---

## Quick Reference Table

| From Location | To Resource | Path |
|--------------|-------------|------|
| `index.html` | CSS | `css/landing.css` |
| `index.html` | JS | `js/landing.js` |
| `index.html` | Pages | `pages/rc-selection.html` |
| `pages/*.html` | CSS | `../css/style.css` |
| `pages/*.html` | JS | `../js/app.js` |
| `pages/*.html` | Root | `../index.html` |
| `pages/*.html` | Other pages | `quiz.html` |
| `js/*.js` (from root) | Pages | `pages/quiz.html` |
| `js/*.js` (from pages) | Data | `data/rc-passages.json` |
| `js/*.js` (from pages) | Root | `../index.html` |
| `js/*.js` (from pages) | Pages | `quiz.html` |
| `tests/unit/*.js` | JS modules | `../../js/utils.js` |
| `tests/integration/*.js` | Data | `../../data/rc-passages.json` |

---

**Document Version**: 1.0  
**Last Updated**: February 2026  
**Next Review**: When directory structure changes

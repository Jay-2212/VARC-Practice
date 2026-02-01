# Repository Structure Guide

This document explains the organization and purpose of files in the VARC Practice repository.

## Current Directory Structure

```
VARC-Practice/
├── Root HTML Files (Pages)
│   ├── index.html              # RC set selection page (will become landing page in Phase 2)
│   ├── quiz.html               # Main quiz interface for all question types
│   └── results.html            # Results display page
│
├── css/                        # Stylesheets
│   ├── style.css              # Main quiz interface styling
│   ├── selection.css          # Selection page styling (RC sets)
│   └── results.css            # Results page styling
│
├── js/                         # JavaScript application logic
│   ├── app.js                 # Main quiz application (VARCApp class)
│   ├── selection.js           # RC set selection logic (RCSetSelection class)
│   ├── results.js             # Results display and review logic
│   ├── storage.js             # localStorage persistence (StorageManager)
│   ├── utils.js               # Utility functions (Utils namespace)
│   └── __tests__/             # Unit tests
│       ├── utils.test.js      # Tests for utility functions
│       └── storage.test.js    # Tests for storage operations
│
├── data/                       # Question data (JSON)
│   └── rc-passages.json       # Reading Comprehension questions
│   # Phase 1 will add:
│   # ├── para-completion.json  # Para Completion questions
│   # └── para-summary.json     # Para Summary questions
│
├── PDF Resources
│   ├── Top 96 CAT Para Completion and Summary Questions With Video Solutions.pdf
│   └── Reading-Comprehension.pdf
│
├── Documentation
│   ├── README.md                  # Project overview and usage guide
│   ├── IMPLEMENTATION_PLAN.md     # Comprehensive implementation plan for agents
│   ├── REPOSITORY_STRUCTURE.md    # This file
│   ├── TESTING.md                 # Testing guidelines and setup
│   └── MAINTENANCE_SUMMARY.md     # Maintenance notes and history
│
└── Configuration
    ├── package.json               # Node.js project configuration, test scripts
    ├── .gitignore                 # Git ignore rules
    └── .git/                      # Git version control (hidden)
```

## File Purposes and Responsibilities

### HTML Pages

#### `index.html`
- **Current**: Displays grid of RC practice sets
- **After Phase 2**: Will become landing page with three question type options
- **Key Features**: 
  - Loads `js/selection.js` to display RC sets
  - Shows attempt history and best scores
  - Navigates to `quiz.html` when set is selected

#### `quiz.html`
- **Purpose**: Main quiz interface for taking tests
- **Features**:
  - Displays passages (for RC) and questions
  - Question palette with status indicators
  - Timer and navigation controls
  - Submit and review functionality
- **After Phase 2**: Will support all three question types dynamically

#### `results.html`
- **Purpose**: Display test results and review answers
- **Features**:
  - Score breakdown
  - Question-by-question review
  - Explanations display
  - Return to selection or retry options

### JavaScript Files

#### `js/app.js` - Main Quiz Application
**Class**: `VARCApp`
**Responsibilities**:
- Load and filter questions for selected RC set
- Manage quiz state (current question, answers, statuses)
- Handle timer and time tracking
- Process user interactions (answer selection, navigation)
- Calculate results and display them
- Support review mode after submission

**Key Methods**:
- `init()` - Initialize app, load questions, restore state
- `loadQuestion(index)` - Display specific question
- `saveAnswer()` - Save user's answer
- `submitTest()` - Process submission and show results
- `startTimer()` / `stopTimer()` - Timer management

**After Phase 2 Changes**:
- Detect question type from localStorage
- Load appropriate data file (rc/para-completion/para-summary)
- Filter questions by `passageId` (RC) or `setId` (others)
- Show/hide passage section based on question type

#### `js/selection.js` - RC Set Selection
**Class**: `RCSetSelection`
**Responsibilities**:
- Load RC questions from `data/rc-passages.json`
- Organize questions into sets by `passageId`
- Display sets in a grid with attempt history
- Handle set selection and navigation to quiz

**Key Methods**:
- `loadRCSets()` - Fetch and parse question data
- `organizeIntoRCSets(questions)` - Group by passageId
- `renderRCSets()` - Display set cards
- `getBestScore(attempts)` - Calculate best attempt score

**After Phase 2**:
- Will be renamed to `rc-selection.js`
- Similar files created for para-completion and para-summary

#### `js/storage.js` - Local Storage Manager
**Namespace**: `StorageManager`
**Responsibilities**:
- Persist quiz state across sessions
- Store user answers and question statuses
- Track attempt history for each RC set
- Manage timer state

**Key Methods**:
- `save(key, data)` - Save to localStorage
- `load(key, defaultValue)` - Load from localStorage
- `saveUserAnswer(index, answer)` - Store answer
- `getUserAnswers()` - Retrieve all answers
- `saveRCSetAttempt(setId, attempt)` - Record attempt

**Storage Keys**:
- `varc_user_answers` - User's answer choices
- `varc_question_status` - Question statuses (answered/review/etc.)
- `varc_selected_rc_set` - Currently selected RC set ID
- `varc_rc_set_attempts` - Attempt history

**After Phase 2 Changes**:
- Add keys for para-completion and para-summary
- Support multi-type set selection
- Track attempts separately per question type

#### `js/utils.js` - Utility Functions
**Namespace**: `Utils`
**Responsibilities**:
- HTML sanitization for XSS prevention
- Safe array access with bounds checking
- DOM element helpers
- Validation functions

**Key Functions**:
- `sanitizeHTML(html)` - Escape HTML special characters
- `parseHTMLSafe(html)` - Parse HTML while removing dangerous elements
- `isValidIndex(array, index)` - Validate array bounds
- `safeGetElement(id)` - Safely retrieve DOM elements

#### `js/results.js` - Results Display
**Responsibilities**:
- Load and display test results
- Show score breakdown
- Display explanations in review mode
- Handle navigation back to selection

### CSS Files

#### `css/style.css`
- Main quiz interface styling
- Question panel, passage section, options
- Palette and navigation styles
- Modal dialogs
- Responsive design

#### `css/selection.css`
- RC set selection page styling
- Grid layout for set cards
- Card hover effects
- Attempt indicators
- Mobile responsive

#### `css/results.css`
- Results page styling
- Score display
- Review mode styles
- Explanation formatting

**After Phase 2**:
- `css/landing.css` - New landing page with three options

### Data Files

#### `data/rc-passages.json`
**Structure**:
```json
{
  "testInfo": { "title": "...", "duration": 120, "totalQuestions": 201 },
  "questions": [
    {
      "id": 1,
      "passageId": 1,
      "passage": "<p>Passage text...</p>",
      "question": "Question text?",
      "type": "MCQ",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Explanation...",
      "marks": { "positive": 3, "negative": 1 }
    }
  ]
}
```

**Key Fields**:
- `passageId`: Groups questions that share a passage
- `passage`: HTML content (null for subsequent questions in same passage)
- `correctAnswer`: Zero-indexed (0 = first option)

**After Phase 1**: Two new files will be added:
- `data/para-completion.json` - Para Completion questions
- `data/para-summary.json` - Para Summary questions

## How Components Interact

### User Flow: Taking a Test

1. **Selection** (`index.html` + `js/selection.js`)
   - User sees available RC sets
   - Clicks on a set
   - `StorageManager.saveSelectedRCSet(setId)` stores selection
   - Redirects to `quiz.html`

2. **Quiz** (`quiz.html` + `js/app.js`)
   - `VARCApp.init()` runs on page load
   - Retrieves selected set ID from localStorage
   - Loads `data/rc-passages.json`
   - Filters questions where `passageId === selectedSetId`
   - Displays first question
   - Timer starts

3. **Answer & Navigate**
   - User selects answer → `VARCApp.saveAnswer()` → `StorageManager.saveUserAnswer()`
   - Clicks "Save & Next" → Updates status → Loads next question
   - Progress saved continuously to localStorage

4. **Submit** (`quiz.html` + `js/app.js`)
   - User clicks Submit button
   - `VARCApp.submitTest()` calculates score
   - Results shown in modal
   - Attempt saved: `StorageManager.saveRCSetAttempt(setId, attemptData)`

5. **Review** (`results.html` + `js/results.js`)
   - Shows all questions with user answers
   - Displays correct answers and explanations
   - Uses `Utils.parseHTMLSafe()` for secure rendering

### Data Flow

```
User Selection
    ↓
StorageManager.saveSelectedRCSet(id)
    ↓
localStorage['varc_selected_rc_set'] = id
    ↓
quiz.html loads
    ↓
VARCApp.init()
    ↓
Fetch 'data/rc-passages.json'
    ↓
Filter questions by passageId
    ↓
Display questions
    ↓
User answers → StorageManager → localStorage
    ↓
Submit → Calculate score → Save attempt
    ↓
Review mode or return to selection
```

## Key Architectural Patterns

### 1. **Class-Based Organization**
Each major page has a corresponding JavaScript class:
- `VARCApp` for quiz functionality
- `RCSetSelection` for set selection
- Future: `ParaCompletionSelection`, `ParaSummarySelection`

### 2. **Namespace Pattern**
Utility functions organized in namespaces:
- `StorageManager` - All localStorage operations
- `Utils` - Helper functions

### 3. **Data-Driven UI**
Questions and passages stored in JSON, dynamically rendered. No hard-coded content.

### 4. **Local Storage Persistence**
All state saved to localStorage:
- Quiz progress persists across page refreshes
- Attempt history tracked indefinitely
- User can close browser and resume later

### 5. **Security-First**
- All user-facing content sanitized (`Utils.parseHTMLSafe()`)
- Array access bounds-checked
- DOM queries validated

## Testing Infrastructure

### Jest Configuration
- Test framework: Jest with jsdom environment
- Test files: `js/__tests__/*.test.js`
- Coverage tracking enabled
- Run with: `npm test`

### Test Coverage
- `utils.test.js` - Utility function tests, XSS prevention
- `storage.test.js` - localStorage operations
- Security tests validate sanitization

## Where New Features Go

### Adding a New Question Type (e.g., Para Summary)
1. **Data**: Create `data/para-summary.json`
2. **Selection Page**: Create `para-summary-selection.html` + `js/para-summary-selection.js`
3. **Quiz Support**: Update `js/app.js` to load and handle new type
4. **Storage**: Add keys to `js/storage.js` for tracking attempts
5. **Landing**: Add button/card to choose this type

### Adding New Utility Functions
- Add to `js/utils.js` under `Utils` namespace
- Add tests to `js/__tests__/utils.test.js`
- Document with JSDoc comments

### Modifying UI Styling
- Quiz interface: Edit `css/style.css`
- Selection pages: Edit `css/selection.css`
- Results page: Edit `css/results.css`

## Notes for AI Agents

### When Working on Phase 1 (Data Extraction)
- Output goes in `data/` directory
- Follow exact JSON structure from `rc-passages.json`
- Use `setId` instead of `passageId` for new types
- Validate JSON before saving

### When Working on Phase 2 (Integration)
- Read `IMPLEMENTATION_PLAN.md` thoroughly
- Follow existing code patterns in `js/app.js` and `js/selection.js`
- Test all three question types independently
- Don't break existing RC functionality
- Update this document if structure changes

### Code Style
- Use ES6+ features (classes, arrow functions, const/let)
- Comment complex logic
- Use JSDoc for function documentation
- Handle errors gracefully (try-catch)
- Validate all data before use

---

**Last Updated**: 2026-02-01  
**Maintained By**: Development Team  
**Questions**: See IMPLEMENTATION_PLAN.md for detailed guidance

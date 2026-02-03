# VARC Practice - Application Architecture

## Overview

VARC Practice is a web-based CAT (Common Admission Test) mock test interface for practicing Verbal Ability and Reading Comprehension questions. The application is built with vanilla JavaScript, HTML5, and CSS3, following a modular architecture with clear separation of concerns.

## Architecture Principles

### 1. Client-Side Application
- **Pure Front-End**: No server-side logic required
- **Static Assets**: All data stored in JSON files
- **Local Storage**: Progress persisted in browser's localStorage
- **Mobile-First**: Responsive design that works on all devices

### 2. Modular Design
- **Separation of Concerns**: Each JS module handles specific functionality
- **Reusable Components**: Common utilities shared across modules
- **Independent Pages**: Each page is self-contained with its dependencies

### 3. Security First
- **XSS Prevention**: All user input and data sanitized
- **Input Validation**: Bounds checking and type validation
- **Safe HTML Parsing**: Whitelist-based HTML rendering

## Directory Structure

```
VARC-Practice/
│
├── index.html                  # Landing page - entry point
│
├── pages/                      # Application pages
│   ├── rc-selection.html           # RC set selection
│   ├── para-completion-selection.html  # Para completion selection
│   ├── para-summary-selection.html     # Para summary selection
│   ├── quiz.html                   # Main quiz interface
│   ├── results.html                # Results and review page
│   └── test-dark-mode.html         # Dark mode testing page
│
├── css/                        # Stylesheets
│   ├── landing.css                 # Landing page styles
│   ├── selection.css               # Selection pages styles
│   ├── style.css                   # Main quiz interface styles
│   └── results.css                 # Results page styles
│
├── js/                         # JavaScript modules
│   ├── landing.js                  # Landing page logic
│   ├── rc-selection.js             # RC selection logic
│   ├── para-completion-selection.js # Para completion selection logic
│   ├── para-summary-selection.js   # Para summary selection logic
│   ├── selection.js                # Legacy selection logic
│   ├── app.js                      # Main quiz application
│   ├── results.js                  # Results page logic
│   ├── storage.js                  # LocalStorage management
│   ├── utils.js                    # Utility functions
│   └── darkmode.js                 # Dark mode toggle
│
├── data/                       # Question data
│   ├── rc-passages.json            # Reading comprehension data
│   ├── para-completion.json        # Para completion data
│   └── para-summary.json           # Para summary data
│
├── tests/                      # Test files
│   ├── unit/                       # Unit tests
│   │   ├── utils.test.js
│   │   └── storage.test.js
│   └── integration/                # Integration tests
│       ├── navigation.test.js
│       ├── data-loading.test.js
│       └── quiz-flow.test.js
│
├── docs/                       # Documentation
│   └── [various .md files]
│
└── assets/                     # Static assets
    └── pdfs/                       # PDF resources
```

## Application Flow

### 1. User Journey

```
Landing Page (index.html)
    ↓
Select Question Type (RC, Para Completion, Para Summary)
    ↓
Selection Page (pages/*-selection.html)
    ↓
Choose Set/Passage
    ↓
Quiz Interface (pages/quiz.html)
    ↓
Answer Questions
    ↓
Submit Test
    ↓
Results Page (pages/results.html)
    ↓
Review Answers or Return to Landing
```

### 2. Page Navigation Map

```
index.html (root)
  ├─→ pages/rc-selection.html
  │     └─→ pages/quiz.html
  ├─→ pages/para-completion-selection.html
  │     └─→ pages/quiz.html
  └─→ pages/para-summary-selection.html
        └─→ pages/quiz.html

pages/quiz.html
  └─→ pages/results.html
        ├─→ pages/quiz.html (retry)
        └─→ ../index.html (home)
```

## Core Modules

### 1. Landing Module (`landing.js`)
**Responsibility**: Handle question type selection

**Key Functions**:
- `selectQuestionType(type)`: Navigate to appropriate selection page

**Dependencies**: None

**Navigation**: 
- Navigates TO: `pages/rc-selection.html`, `pages/para-completion-selection.html`, `pages/para-summary-selection.html`

---

### 2. Selection Modules (`*-selection.js`)
**Responsibility**: Load and display available sets/passages

**Key Functions**:
- `loadQuestions()`: Fetch question data from JSON
- `displaySets()`: Render available sets
- `selectSet(setId)`: Save selection and navigate to quiz

**Dependencies**: 
- `storage.js`: Save selected set
- `utils.js`: HTML sanitization
- `darkmode.js`: Dark mode support

**Data Sources**:
- `rc-selection.js`: `data/rc-passages.json`
- `para-completion-selection.js`: `data/para-completion.json`
- `para-summary-selection.js`: `data/para-summary.json`

**Navigation**:
- Navigates FROM: `../index.html`
- Navigates TO: `quiz.html`

---

### 3. Quiz Application (`app.js`)
**Responsibility**: Main quiz interface and logic

**Key Classes**:
- `VARCApp`: Main application controller

**Key Functions**:
- `init()`: Initialize quiz and load questions
- `loadQuestions()`: Fetch questions based on type and set
- `loadQuestion(index)`: Display specific question
- `handleAnswer(optionIndex)`: Process user's answer
- `saveAndNext()`: Save answer and move to next question
- `markForReview()`: Flag question for review
- `submitTest()`: Complete test and navigate to results

**Dependencies**:
- `storage.js`: Save/load progress
- `utils.js`: Utilities and validation
- `darkmode.js`: Dark mode support

**State Management**:
- Current question index
- User answers
- Question statuses (answered, not-answered, review, etc.)
- Timer state
- Test completion status

**Navigation**:
- Navigates FROM: Any selection page
- Navigates TO: `results.html`, `../pages/rc-selection.html` (or similar back pages)

---

### 4. Results Module (`results.js`)
**Responsibility**: Display test results and review

**Key Functions**:
- `loadAttemptData()`: Load test results from storage
- `displayResults()`: Show score, statistics, and performance
- `displayDetailedAnalysis()`: Question-by-question breakdown
- `retrySet()`: Clear data and restart quiz
- `returnToHome()`: Navigate to landing page

**Dependencies**:
- `storage.js`: Load attempt data
- `utils.js`: Formatting and utilities
- `darkmode.js`: Dark mode support

**Navigation**:
- Navigates FROM: `quiz.html`
- Navigates TO: `quiz.html` (retry), `../index.html` (home)

---

### 5. Storage Manager (`storage.js`)
**Responsibility**: Centralized localStorage management

**Key Features**:
- CRUD operations for all data types
- Question status tracking
- Timer state management
- User progress persistence
- Attempt history
- Data export/import

**Key Methods**:
```javascript
// Basic operations
save(key, value)
load(key, defaultValue)
remove(key)
clearAll()

// Answer management
saveAnswer(questionIndex, optionIndex)
getAnswer(questionIndex)
getAllAnswers()
clearAnswer(questionIndex)

// Status management
saveQuestionStatus(questionIndex, status)
getQuestionStatus(questionIndex)
getAllStatuses()
initializeStatuses(totalQuestions)

// Statistics
getStatistics(totalQuestions)

// Timer
saveTimerState(remainingSeconds)
getTimerState()

// Test state
markTestCompleted()
isTestCompleted()
saveCurrentQuestion(index)
getCurrentQuestion()

// Set management
saveQuestionType(type)
getQuestionType()
saveSelectedSet(type, setId)
getSelectedSetId(type)
getSetAttempts(type, setId)
saveSetAttempt(type, setId, attemptData)

// Data portability
exportTestData()
importTestData(data)
```

**Storage Keys**:
- `varc_user_answers`: User's selected answers
- `varc_question_status`: Status of each question
- `varc_current_question`: Current question index
- `varc_timer_state`: Timer remaining seconds
- `varc_test_completed`: Test completion flag
- `varc_user_name`: User's name
- `varc_question_type`: Current question type
- `varc_selected_rc_set`: Selected RC set ID
- `varc_selected_set_pc`: Selected para completion set
- `varc_selected_set_ps`: Selected para summary set
- `varc_rc_set_attempts`: RC attempt history
- `varc_set_attempts_pc`: Para completion attempts
- `varc_set_attempts_ps`: Para summary attempts
- `varc_attempt_start_time`: Test start timestamp
- `varc_question_times`: Time spent per question

---

### 6. Utilities Module (`utils.js`)
**Responsibility**: Common helper functions

**Security Functions**:
```javascript
sanitizeHTML(text)           // Escape HTML special characters
parseHTMLSafe(html)          // Parse HTML with whitelist
```

**Array Validation**:
```javascript
isValidIndex(array, index)   // Check array bounds
safeArrayGet(array, index)   // Safe array access
isValidArray(array)          // Validate non-empty array
```

**Number Validation**:
```javascript
isInRange(num, min, max)     // Range checking
safeParseInt(value)          // Safe integer parsing
safeDivide(a, b)             // Division with zero check
```

**Formatting**:
```javascript
formatTime(seconds)          // Convert seconds to MM:SS
```

**String Validation**:
```javascript
isValidString(str)           // Non-empty string check
```

---

### 7. Dark Mode Module (`darkmode.js`)
**Responsibility**: Theme switching

**Key Features**:
- Toggle between light and dark modes
- Persist preference in localStorage
- Dynamically create toggle button
- Smooth transitions

**API**:
```javascript
darkModeManager.toggle()                    // Toggle theme
darkModeManager.createToggleButton(parent)  // Add button
darkModeManager.getCurrentTheme()           // Get current theme
```

## Data Models

### Question Data Structure

#### Reading Comprehension (RC)
```json
{
  "testInfo": {
    "title": "RC Practice Set",
    "duration": 40,
    "totalQuestions": 24
  },
  "questions": [
    {
      "id": 1,
      "passageId": 1,
      "passage": "<p>Passage text...</p>",
      "question": "Question text?",
      "type": "MCQ",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Explanation text",
      "marks": {
        "positive": 3,
        "negative": 1
      }
    }
  ]
}
```

#### Para Completion / Summary
```json
{
  "testInfo": {
    "title": "Para Completion Practice",
    "duration": 40,
    "totalQuestions": 28
  },
  "questions": [
    {
      "id": 1,
      "setId": 1,
      "passage": "Paragraph text...",
      "question": "Question text?",
      "type": "MCQ",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 1,
      "explanation": "Explanation"
    }
  ]
}
```

### Attempt Data Structure
```javascript
{
  answers: {
    0: 1,    // questionIndex: selectedOption
    1: 3,
    2: 0
  },
  statuses: {
    0: 'answered',
    1: 'review-answered',
    2: 'not-answered'
  },
  score: {
    correct: 15,
    incorrect: 3,
    unattempted: 6,
    marks: 42,
    percentage: 70
  },
  timing: {
    totalTime: 2400,
    attemptStartTime: 1623456789000,
    questionTimes: {
      0: 45,
      1: 32
    }
  },
  userName: 'Test User',
  timestamp: 1623459012000
}
```

## State Management

### Application States

1. **Not Started**: No set selected, user at landing/selection
2. **In Progress**: Quiz active, timer running
3. **Paused**: User navigated away, state saved
4. **Completed**: Test submitted, results available
5. **Review**: Viewing results and explanations

### State Transitions

```
Not Started → [Select Set] → In Progress
In Progress → [Submit] → Completed
Completed → [Review] → Review
Review → [Retry] → Not Started
Review → [Home] → Not Started
In Progress → [Close Tab] → Paused
Paused → [Return] → In Progress (restored)
```

## Path Resolution

### From Root (`index.html`)
- CSS: `css/landing.css`
- JS: `js/landing.js`, `js/darkmode.js`
- Pages: `pages/rc-selection.html`

### From Pages Directory (`pages/*.html`)
- CSS: `../css/style.css`
- JS: `../js/app.js`, `../js/storage.js`, `../js/utils.js`
- Data: `../data/rc-passages.json` (fetched by JS)
- Navigation: `quiz.html` (same dir), `../index.html` (back to root)

### From JavaScript Files (`js/*.js`)
- Data: `data/rc-passages.json` (relative to HTML location)
- Navigation: Paths depend on where JS is loaded from

## Security Considerations

### XSS Prevention
1. **Input Sanitization**: All user input sanitized via `sanitizeHTML()`
2. **Safe HTML Parsing**: Whitelist-based HTML rendering
3. **URL Validation**: Dangerous protocols blocked (javascript:, data:, vbscript:)
4. **Event Handler Removal**: onclick and similar attributes stripped

### Data Validation
1. **Type Checking**: All parameters validated for correct types
2. **Bounds Checking**: Array access includes range validation
3. **Null Safety**: DOM elements checked before use
4. **Integer Validation**: Non-integer values rejected

### Error Handling
1. **Graceful Degradation**: Errors logged but don't crash app
2. **Default Values**: Sensible defaults for missing data
3. **Try-Catch Blocks**: Critical operations wrapped
4. **User Feedback**: Alerts for critical errors

## Performance Optimization

### Loading Strategy
1. **Lazy Loading**: Questions loaded only when needed
2. **Minimal Dependencies**: Each page loads only required JS
3. **Caching**: DOM elements cached in app initialization
4. **Local Storage**: Avoid repeated data fetch

### DOM Manipulation
1. **Batch Updates**: Multiple changes applied together
2. **Event Delegation**: Minimal event listeners
3. **DocumentFragment**: Efficient DOM construction

## Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Required Features
- ES6 JavaScript
- localStorage API
- Fetch API
- CSS Grid/Flexbox
- CSS Custom Properties

## Testing Strategy

### Unit Tests (`tests/unit/`)
- Test individual functions in isolation
- Cover edge cases and error conditions
- Mock external dependencies

### Integration Tests (`tests/integration/`)
- Test module interactions
- Verify data flow
- Test navigation paths
- Validate data loading

### Test Coverage
- Utils: 73 tests
- Storage: 73 tests
- Navigation: 17 tests
- Data Loading: 35 tests
- Quiz Flow: 32 tests
- **Total: 128 tests**

## Deployment

### Static Hosting
Application can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- AWS S3 + CloudFront
- Any static file server

### Requirements
- No build step required
- No server-side processing
- CORS not needed (same-origin)
- HTTPS recommended

### Deployment Steps
1. Upload all files maintaining directory structure
2. Ensure `index.html` is at root
3. Configure server to serve index.html as default
4. Test all navigation paths work
5. Verify data files load correctly

## Future Enhancements

### Planned Features
1. More question types (para jumbles, odd sentence out)
2. Performance analytics and history
3. Multiple test sections (LRDI, Quant)
4. Difficulty-based filtering
5. Timed practice mode per question
6. Export/import test sessions

### Technical Debt
1. Consider migration to React/Vue for better state management
2. Add service worker for offline support
3. Implement proper routing instead of page navigation
4. Add E2E tests with Playwright/Cypress
5. Optimize bundle size with build tools

## Maintenance

### Adding New Questions
1. Edit appropriate JSON file in `data/`
2. Follow existing data structure
3. Validate JSON syntax
4. Test with application

### Adding New Question Types
1. Create selection page in `pages/`
2. Create selection JS in `js/`
3. Add data file in `data/`
4. Update `landing.js` navigation
5. Update `app.js` to handle new type
6. Add storage keys in `storage.js`

### Modifying Styles
1. Identify appropriate CSS file
2. Use existing CSS variables when possible
3. Test in both light and dark modes
4. Verify responsive behavior

## Troubleshooting

### Common Issues

**Issue**: Questions not loading
- **Cause**: Incorrect data file path
- **Solution**: Check browser console, verify fetch() URL

**Issue**: Progress not saved
- **Cause**: localStorage disabled/full
- **Solution**: Check browser settings, clear old data

**Issue**: Timer not working
- **Cause**: Page reload or navigation
- **Solution**: Timer state is saved, restores on return

**Issue**: Dark mode not persisting
- **Cause**: localStorage blocked
- **Solution**: Enable localStorage in browser

## Support and Contribution

### Getting Help
1. Check existing documentation
2. Review test files for usage examples
3. Inspect browser console for errors
4. Check localStorage data structure

### Contributing
1. Follow existing code style
2. Add tests for new features
3. Update documentation
4. Ensure all tests pass
5. Test in multiple browsers

---

**Document Version**: 1.0  
**Last Updated**: February 2026  
**Maintained By**: VARC Practice Team

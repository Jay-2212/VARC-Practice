# VARC Practice - CAT Mock Test Interface

![Visitors](https://api.visitorbadge.io/api/visitors?path=Jay-2212%2FVARC-Practice&label=Views&countColor=%23263759&style=flat)

A practice interface for CAT VARC (Verbal Ability and Reading Comprehension) section that mimics the actual exam interface.

**Now includes 60+ Reading Comprehension passages with 201 questions, complete with answers and detailed explanations!**

## Features

- **Exam-like Interface**: Replicates the CAT exam interface with passage display, questions, and navigation
- **Question Palette**: Visual tracking of answered, unanswered, marked for review, and not visited questions
- **Timer**: 40-minute countdown timer (configurable)
- **Local Storage**: Automatically saves your progress - come back anytime to continue
- **Review Mode**: After submission, review your answers with correct answers and explanations
- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Keyboard Shortcuts**: Quick navigation using keyboard

## How to Use

### Running the App

1. **Simple Method**: Open `index.html` directly in a web browser
2. **With a Local Server** (recommended for loading questions from JSON):
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve

   # Using PHP
   php -S localhost:8000
   ```
   Then open `http://localhost:8000` in your browser.

### Taking the Test

1. Read the passage on the left panel
2. Answer the question on the right panel by clicking an option
3. Use the buttons at the bottom:
   - **Save & Next**: Save your answer and move to the next question
   - **Mark for Review & Next**: Flag the question for later review
   - **Clear Response**: Remove your selected answer
4. Use the question palette (right sidebar) to jump to any question
5. Click **Submit** when you're done

### Keyboard Shortcuts

- `→` or `n`: Next question
- `←` or `p`: Previous question
- `1-4`: Select option 1-4
- `r`: Mark for review and next
- `c`: Clear response

## Adding Your Own Questions

Edit `data/rc-passages.json` to add your own questions. The format is:

```json
{
  "testInfo": {
    "title": "Your Test Title",
    "duration": 40,
    "totalQuestions": 24,
    "sections": ["VARC"]
  },
  "questions": [
    {
      "id": 1,
      "passageId": 1,
      "passage": "<p>Your passage HTML here...</p>",
      "question": "Your question text here?",
      "type": "MCQ",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correctAnswer": 0,
      "explanation": "Explanation for the correct answer",
      "marks": { "positive": 3, "negative": 1 }
    },
    {
      "id": 2,
      "passageId": 1,
      "passage": null,
      "question": "Another question for the same passage?",
      "type": "MCQ",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 1,
      "explanation": "Explanation here",
      "marks": { "positive": 3, "negative": 1 }
    }
  ]
}
```

### Question Format Notes

- **passageId**: Group questions by passage using the same ID
- **passage**: Set to `null` for questions that share a passage with previous questions (same `passageId`)
- **correctAnswer**: Zero-indexed (0 = first option, 1 = second option, etc.)
- **type**: Use "MCQ" for multiple choice, "TITA" for Type In The Answer

## Project Structure

```
VARC-Practice/
├── index.html              # Landing page (entry point)
├── package.json            # Dependencies and scripts
├── README.md              # This file
│
├── pages/                 # Application pages
│   ├── rc-selection.html              # RC set selection
│   ├── para-completion-selection.html # Para completion selection
│   ├── para-summary-selection.html    # Para summary selection
│   ├── quiz.html                      # Main quiz interface
│   ├── results.html                   # Results and review page
│   └── test-dark-mode.html           # Dark mode testing
│
├── css/                   # Stylesheets
│   ├── landing.css               # Landing page styles
│   ├── selection.css             # Selection pages styles
│   ├── style.css                 # Main quiz interface styles
│   └── results.css               # Results page styles
│
├── js/                    # JavaScript modules
│   ├── landing.js                # Landing page logic
│   ├── rc-selection.js           # RC selection logic
│   ├── para-completion-selection.js  # Para completion selection
│   ├── para-summary-selection.js     # Para summary selection
│   ├── app.js                    # Main quiz application
│   ├── results.js                # Results page logic
│   ├── storage.js                # LocalStorage management
│   ├── utils.js                  # Utility functions
│   └── darkmode.js               # Dark mode functionality
│
├── data/                  # Question data files
│   ├── rc-passages.json          # Reading Comprehension
│   ├── para-completion.json      # Para Completion questions
│   └── para-summary.json         # Para Summary questions
│
├── tests/                 # Test files
│   ├── unit/                     # Unit tests
│   │   ├── utils.test.js
│   │   └── storage.test.js
│   └── integration/              # Integration tests
│       ├── navigation.test.js
│       ├── data-loading.test.js
│       └── quiz-flow.test.js
│
├── docs/                  # Documentation
│   ├── ARCHITECTURE.md           # Application architecture
│   ├── PATH_REFERENCE.md         # Path reference guide
│   ├── TESTING.md                # Testing documentation
│   └── [other documentation]
│
└── assets/                # Static assets
    └── pdfs/                     # Reference PDFs
        ├── Reading-Comprehension.pdf
        └── Top-96-CAT-Para-Completion-and-Summary-Questions.pdf
```

For detailed architecture information, see [ARCHITECTURE.md](docs/ARCHITECTURE.md).  
For path reference guide, see [PATH_REFERENCE.md](docs/PATH_REFERENCE.md).

## Resetting Your Progress

To reset your test progress:
1. Complete the test and click "Reset Test" in review mode, OR
2. Clear your browser's local storage for this site

## Browser Compatibility

Works on all modern browsers:
- Chrome (recommended)
- Firefox
- Safari
- Edge

## Code Quality & Security

This project has been optimized for security, reliability, and maintainability:

### Security Features
- **XSS Protection**: All user-provided content is sanitized before display
- **Input Validation**: URL parameters and user inputs are validated
- **Safe HTML Rendering**: Content is parsed safely while preserving formatting

### Error Handling
- **Defensive Programming**: All array access includes bounds checking
- **Null Safety**: DOM elements checked before use
- **Graceful Degradation**: Errors handled with sensible defaults

### Testing
- **Unit Tests**: Comprehensive test coverage with Jest
- **Security Tests**: Validates XSS prevention and sanitization
- **Edge Cases**: Tests for division by zero, invalid inputs, empty arrays

See [TESTING.md](docs/TESTING.md) for details on running tests.

### Code Documentation
- **JSDoc Comments**: All functions documented with parameters and return types
- **Inline Comments**: Complex logic explained with clear comments
- **Architecture Notes**: Data flow and state management documented

## Development

### Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

## Upcoming Features (In Development)

**Para Completion and Para Summary Questions** - A comprehensive implementation plan has been created to add two new question types to the platform:
- **Para Completion**: Questions where you fill in missing sentences
- **Para Summary**: Questions where you choose the best summary

See [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) for the detailed phased implementation guide.

## Repository Structure

For a detailed explanation of the repository organization and file purposes, see:
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - Complete application architecture
- [PATH_REFERENCE.md](docs/PATH_REFERENCE.md) - Comprehensive path reference guide
- [REPOSITORY_STRUCTURE.md](docs/REPOSITORY_STRUCTURE.md) - Detailed file descriptions

## Future Enhancements

- Para jumbles and odd sentence out questions
- Export/import test sessions
- Multiple test sections (LRDI, Quant)
- Performance analytics and history
- Difficulty-based filtering

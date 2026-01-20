# VARC Practice - CAT Mock Test Interface

A practice interface for CAT VARC (Verbal Ability and Reading Comprehension) section that mimics the actual exam interface.

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

Edit `data/questions.json` to add your own questions. The format is:

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
├── index.html          # Main HTML file
├── css/
│   └── style.css       # Styling
├── js/
│   ├── app.js          # Main application logic
│   └── storage.js      # Local storage management
├── data/
│   └── questions.json  # Question data
└── README.md           # This file
```

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

## Future Enhancements

- Add more question types (para jumbles, odd sentence out)
- Import questions from PDF
- Export/import test sessions
- Multiple test sections (LRDI, Quant)
- Performance analytics and history

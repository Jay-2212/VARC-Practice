# Implementation Notes for AI Agents

This document provides quick reference notes for AI agents working on Phase 1 and Phase 2 of the Para Completion and Summary integration.

---

## Quick Start

1. **Read First**: [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md) - Complete implementation guide
2. **Understand Structure**: [`REPOSITORY_STRUCTURE.md`](REPOSITORY_STRUCTURE.md) - Repository organization
3. **Check Dependencies**: Run `npm install` if testing is needed
4. **Start Local Server**: `python -m http.server 8000` or `npx serve`

---

## Phase 1: Data Extraction Agent Instructions

### Your Mission
Extract all Para Completion and Para Summary questions from the PDF and create two JSON files.

### Source File
`Top 96 CAT Para Completion and Summary Questions With Video Solutions.pdf`

### Output Files
1. `data/para-completion.json` - Para Completion questions
2. `data/para-summary.json` - Para Summary questions

### Template to Follow
Copy structure from `data/rc-passages.json` but use `setId` instead of `passageId`.

### Data Structure Example
```json
{
  "testInfo": {
    "title": "VARC Para Completion - Complete Set",
    "duration": 60,
    "totalQuestions": 48,
    "sections": ["VARC"],
    "questionType": "para-completion"
  },
  "questions": [
    {
      "id": 1,
      "setId": 1,
      "passage": null,
      "question": "<p>Paragraph text...</p><p>Which option best completes this?</p>",
      "type": "MCQ",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation text...",
      "marks": { "positive": 3, "negative": 1 }
    }
  ]
}
```

### Key Points
- **setId**: Group 3-5 questions per set (e.g., Q1-4: setId=1, Q5-8: setId=2)
- **passage**: Always `null` for these types
- **question**: Include the paragraph and the question prompt
- **correctAnswer**: Zero-indexed (0 = first option, 1 = second, etc.)
- **HTML formatting**: Preserve paragraph tags `<p>...</p>`

### Validation Checklist
- [ ] Total questions = 96 (split between both types)
- [ ] All questions have id, setId, question, options, correctAnswer, explanation
- [ ] Options arrays have 4-5 elements each
- [ ] correctAnswer is 0-3 (or 0-4 if 5 options)
- [ ] JSON is valid (test with `JSON.parse()`)
- [ ] No special characters are corrupted
- [ ] Explanations match question numbers

### Testing Your Output
```bash
# In browser console after loading the JSON
fetch('data/para-completion.json')
  .then(r => r.json())
  .then(data => {
    console.log('Total questions:', data.questions.length);
    console.log('First question:', data.questions[0]);
    console.log('Valid:', data.questions.every(q => 
      q.id && q.setId && q.question && q.options && 
      q.correctAnswer !== undefined && q.explanation
    ));
  });
```

---

## Phase 2: Interface & Integration Agent Instructions

### Your Mission
Create the multi-type question interface and integrate the extracted data.

### Prerequisites
- Phase 1 must be complete
- Both JSON files (`para-completion.json` and `para-summary.json`) must exist
- Test that JSON files load without errors

### Major Tasks

#### Task 1: Create New Landing Page
**File**: `index.html` (will replace current content)
- Display three cards: RC, Para Completion, Para Summary
- Each card shows question count and description
- On click, saves question type and navigates to selection page

**New File**: `js/landing.js`
- Handle click events for each question type
- Save type to localStorage: `localStorage.setItem('varc_question_type', type)`
- Navigate to appropriate selection page

**New File**: `css/landing.css`
- Card-based layout (3 columns on desktop, 1 on mobile)
- Hover effects
- Responsive design

#### Task 2: Rename and Update RC Selection
**Rename**: `index.html` → `rc-selection.html`
- Add back button to return to landing page
- Update title to "Reading Comprehension Practice Sets"
- Keep all existing functionality

**Rename**: `js/selection.js` → `js/rc-selection.js`
- Keep all existing code
- No functional changes needed

#### Task 3: Create Para Completion Selection
**New File**: `para-completion-selection.html`
- Clone structure from `rc-selection.html`
- Update title to "Para Completion Practice Sets"
- Load `js/para-completion-selection.js`

**New File**: `js/para-completion-selection.js`
- Clone structure from `js/rc-selection.js`
- Change data file: `data/para-completion.json`
- Use `setId` instead of `passageId` for grouping
- Update localStorage keys to avoid conflicts

#### Task 4: Create Para Summary Selection
**New File**: `para-summary-selection.html`
- Clone structure from `rc-selection.html`
- Update title to "Para Summary Practice Sets"
- Load `js/para-summary-selection.js`

**New File**: `js/para-summary-selection.js`
- Clone structure from `js/rc-selection.js`
- Change data file: `data/para-summary.json`
- Use `setId` instead of `passageId` for grouping
- Update localStorage keys to avoid conflicts

#### Task 5: Update Quiz Interface
**File**: `js/app.js` - Modify `VARCApp` class

**Key Changes**:
1. In `init()`:
   ```javascript
   this.questionType = StorageManager.getQuestionType(); // 'rc', 'para-completion', or 'para-summary'
   this.selectedSetId = StorageManager.getSelectedSetId(this.questionType);
   ```

2. In `loadQuestions()`:
   ```javascript
   const dataFiles = {
     'rc': 'data/rc-passages.json',
     'para-completion': 'data/para-completion.json',
     'para-summary': 'data/para-summary.json'
   };
   const response = await fetch(dataFiles[this.questionType]);
   ```

3. In question filtering:
   ```javascript
   if (this.questionType === 'rc') {
     this.questions = this.questions.filter(q => q.passageId === this.selectedSetId);
   } else {
     this.questions = this.questions.filter(q => q.setId === this.selectedSetId);
   }
   ```

4. In `loadQuestion()`:
   ```javascript
   if (this.questionType === 'rc' && question.passage) {
     // Show passage section
     this.elements.passageSection.style.display = 'block';
   } else {
     // Hide passage section for Para Completion/Summary
     this.elements.passageSection.style.display = 'none';
   }
   ```

#### Task 6: Update Storage Manager
**File**: `js/storage.js`

**Add Keys**:
```javascript
KEYS: {
  // ...existing keys...
  QUESTION_TYPE: 'varc_question_type',
  SELECTED_SET_PC: 'varc_selected_pc_set',
  SELECTED_SET_PS: 'varc_selected_ps_set',
  SET_ATTEMPTS_PC: 'varc_pc_set_attempts',
  SET_ATTEMPTS_PS: 'varc_ps_set_attempts',
}
```

**Add Methods**:
```javascript
getQuestionType() {
  return this.load(this.KEYS.QUESTION_TYPE, 'rc');
},

saveQuestionType(type) {
  this.save(this.KEYS.QUESTION_TYPE, type);
},

getSelectedSetId(type) {
  const keys = {
    'rc': this.KEYS.SELECTED_RC_SET,
    'para-completion': this.KEYS.SELECTED_SET_PC,
    'para-summary': this.KEYS.SELECTED_SET_PS
  };
  return this.load(keys[type]);
},

saveSelectedSet(type, setId) {
  this.saveQuestionType(type);
  const keys = {
    'rc': this.KEYS.SELECTED_RC_SET,
    'para-completion': this.KEYS.SELECTED_SET_PC,
    'para-summary': this.KEYS.SELECTED_SET_PS
  };
  this.save(keys[type], setId);
}
```

### Critical Rules

1. **DO NOT break RC functionality** - Test RC thoroughly after changes
2. **DO NOT modify** `js/utils.js`, `css/style.css` unless absolutely necessary
3. **DO use** existing patterns and code style
4. **DO validate** all localStorage operations
5. **DO test** on mobile view (responsive design)

### Testing Procedure

1. **Start local server**: `python -m http.server 8000`
2. **Test Landing Page**:
   - Open `http://localhost:8000`
   - Verify three cards display correctly
   - Click each card, verify navigation

3. **Test RC** (Ensure backward compatibility):
   - Select an RC set
   - Complete a few questions
   - Submit and check results
   - Verify explanations show correctly

4. **Test Para Completion**:
   - Return to landing
   - Click Para Completion
   - Select a set
   - Verify passage section is hidden
   - Answer questions
   - Submit and check results

5. **Test Para Summary**:
   - Same as Para Completion
   - Verify separate attempt tracking

6. **Test Back Navigation**:
   - From selection pages → landing page
   - From quiz → appropriate selection page

7. **Test Mobile View**:
   - Resize browser to mobile width (375px)
   - Verify all pages are responsive
   - Test navigation on mobile

### Common Issues and Solutions

**Issue**: JSON file not loading
- **Solution**: Check file path, ensure file exists, validate JSON syntax

**Issue**: Questions not filtering correctly
- **Solution**: Verify using correct field (`passageId` for RC, `setId` for others)

**Issue**: Passage showing for Para Completion/Summary
- **Solution**: Check `loadQuestion()` logic, ensure hiding passage section

**Issue**: localStorage conflicts between types
- **Solution**: Use separate keys for each type (see StorageManager updates)

**Issue**: Back navigation broken
- **Solution**: Implement `navigateBack()` method based on question type

### File Change Summary

**New Files**:
- `js/landing.js`
- `css/landing.css`
- `para-completion-selection.html`
- `para-summary-selection.html`
- `js/para-completion-selection.js`
- `js/para-summary-selection.js`

**Renamed Files**:
- `index.html` → `rc-selection.html`
- `js/selection.js` → `js/rc-selection.js`

**Modified Files**:
- `index.html` (new landing page content)
- `js/app.js` (multi-type support)
- `js/storage.js` (multi-type localStorage)

**HTML Reference Updates**:
In `rc-selection.html`, update script tags:
```html
<script src="js/rc-selection.js"></script>
```

---

## Useful Commands

### Start Development Server
```bash
# Python
python -m http.server 8000

# Node.js
npx serve
```

### Run Tests
```bash
npm test              # Run all tests
npm run test:watch    # Watch mode
npm run test:coverage # With coverage
```

### Validate JSON
```bash
# Using Node.js
node -e "console.log(JSON.parse(require('fs').readFileSync('data/para-completion.json', 'utf8')))"
```

### Git Operations
```bash
git status                    # Check changes
git add .                     # Stage all changes
git commit -m "message"       # Commit
git push                      # Push to remote
```

---

## Reference Links

- **Full Implementation Plan**: [`IMPLEMENTATION_PLAN.md`](IMPLEMENTATION_PLAN.md)
- **Repository Structure**: [`REPOSITORY_STRUCTURE.md`](REPOSITORY_STRUCTURE.md)
- **Testing Guide**: [`TESTING.md`](TESTING.md)
- **Project README**: [`README.md`](README.md)

---

## Questions or Issues?

If you encounter issues:
1. Check the implementation plan for detailed guidance
2. Review existing code patterns in `js/app.js` and `js/selection.js`
3. Test in browser console to debug
4. Validate all JSON files load correctly
5. Check browser console for errors

**Remember**: The goal is to maintain the quality and consistency of the existing RC experience while adding two new question types. Take your time, follow the patterns, and test thoroughly.

---

**Last Updated**: 2026-02-01  
**For**: Phase 1 & Phase 2 AI Agents  
**Status**: Ready for Implementation

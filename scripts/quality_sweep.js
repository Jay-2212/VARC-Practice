const fs = require('fs');
const path = require('path');

const DATA_FILES = [
  { type: 'rc', file: 'data/rc-passages.json' },
  { type: 'para-completion', file: 'data/para-completion.json' },
  { type: 'para-summary', file: 'data/para-summary.json' }
];

function stripHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenize(text) {
  return stripHtml(text)
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(token => token.length >= 3);
}

function jaccardSimilarity(aTokens, bTokens) {
  if (aTokens.length === 0 || bTokens.length === 0) return 0;
  const aSet = new Set(aTokens);
  const bSet = new Set(bTokens);
  let intersection = 0;
  for (const token of aSet) {
    if (bSet.has(token)) intersection += 1;
  }
  const union = new Set([...aSet, ...bSet]).size;
  return union === 0 ? 0 : intersection / union;
}

function isNearlySameText(a, b) {
  const aText = stripHtml(a);
  const bText = stripHtml(b);
  if (!aText || !bText) return false;
  if (aText === bText) return true;

  const aTokens = tokenize(aText);
  const bTokens = tokenize(bText);
  const similarity = jaccardSimilarity(aTokens, bTokens);
  const lengthRatio = Math.min(aText.length, bText.length) / Math.max(aText.length, bText.length);

  return similarity >= 0.85 && lengthRatio >= 0.8;
}

function hasLargeOverlap(a, b) {
  const aText = stripHtml(a);
  const bText = stripHtml(b);
  if (!aText || !bText) return false;
  if (aText.length < 80 || bText.length < 80) return false;

  const shorter = aText.length <= bText.length ? aText : bText;
  const longer = aText.length > bText.length ? aText : bText;
  const snippet = shorter.slice(0, 120);

  return longer.includes(snippet);
}

function formatQuestionRef(question, index) {
  const id = question.id !== undefined ? `id=${question.id}` : `index=${index + 1}`;
  const setId = question.setId || question.passageId || 'N/A';
  return `set=${setId}, ${id}`;
}

function analyzeFile(type, filePath) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);
  const questions = Array.isArray(data.questions) ? data.questions : [];
  const issues = [];

  questions.forEach((question, index) => {
    const ref = formatQuestionRef(question, index);
    const questionText = question.question || '';
    const passageText = question.passage || '';
    const options = Array.isArray(question.options) ? question.options : [];
    const correctAnswer = question.correctAnswer;

    if (!question.question) {
      issues.push({ ref, issue: 'Missing question text.' });
    }

    if (question.type === 'MCQ') {
      if (options.length < 2) {
        issues.push({ ref, issue: 'MCQ question has fewer than 2 options.' });
      }
      if (!Number.isInteger(correctAnswer) || correctAnswer < 0 || correctAnswer >= options.length) {
        issues.push({ ref, issue: `Correct answer index out of range (${correctAnswer}).` });
      }

      const normalizedOptions = options.map(option => stripHtml(option).toLowerCase());
      const optionLengths = normalizedOptions.map(option => option.length);
      const sortedLengths = [...optionLengths].sort((a, b) => a - b);
      const medianLength = sortedLengths.length > 0
        ? sortedLengths[Math.floor(sortedLengths.length / 2)]
        : 0;
      const duplicateIndices = new Set();
      normalizedOptions.forEach((option, optIndex) => {
        if (option.length === 0) {
          issues.push({ ref, issue: `Option ${optIndex + 1} is empty.` });
        }
        const firstIndex = normalizedOptions.indexOf(option);
        if (firstIndex !== optIndex && option.length > 0) {
          duplicateIndices.add(optIndex + 1);
          duplicateIndices.add(firstIndex + 1);
        }

        if (isNearlySameText(option, questionText) || hasLargeOverlap(option, questionText)) {
          issues.push({ ref, issue: `Option ${optIndex + 1} appears very similar to the question text.` });
        }

        if (passageText && (isNearlySameText(option, passageText) || hasLargeOverlap(option, passageText))) {
          issues.push({ ref, issue: `Option ${optIndex + 1} appears very similar to the passage text.` });
        }

        if (medianLength > 0 && option.length > medianLength * 2.5 && option.length > 180) {
          issues.push({ ref, issue: `Option ${optIndex + 1} is unusually long compared to other options.` });
        }
      });

      if (duplicateIndices.size > 0) {
        issues.push({ ref, issue: `Duplicate options detected (${Array.from(duplicateIndices).sort((a, b) => a - b).join(', ')}).` });
      }
    }
  });

  return { type, filePath, issues };
}

function generateReport(results) {
  const lines = [];
  lines.push('# Question Quality Sweep Report');
  lines.push('');
  lines.push(`Generated: ${new Date().toISOString()}`);
  lines.push('');

  results.forEach(result => {
    lines.push(`## ${result.type}`);
    lines.push(`File: ${result.filePath}`);
    lines.push('');

    if (result.issues.length === 0) {
      lines.push('No issues detected.');
      lines.push('');
      return;
    }

    result.issues.forEach((item, idx) => {
      lines.push(`${idx + 1}. ${item.ref} - ${item.issue}`);
    });
    lines.push('');
  });

  return lines.join('\n');
}

function run() {
  const results = DATA_FILES.map(({ type, file }) => {
    const fullPath = path.join(process.cwd(), file);
    return analyzeFile(type, fullPath);
  });

  const report = generateReport(results);
  const outputPath = path.join(process.cwd(), 'docs', 'QUALITY_SWEEP_REPORT.md');
  fs.writeFileSync(outputPath, report, 'utf-8');

  const totalIssues = results.reduce((sum, r) => sum + r.issues.length, 0);
  console.log(`Quality sweep complete. Issues found: ${totalIssues}`);
  console.log(`Report written to ${outputPath}`);
}

run();

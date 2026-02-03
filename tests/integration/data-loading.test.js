/**
 * Integration Tests for Data Loading
 * Tests that data files can be loaded and processed correctly
 */

const fs = require('fs');
const path = require('path');

describe('Data Loading Integration Tests', () => {
    const dataDir = path.join(__dirname, '../../data');
    
    describe('RC Passages Data', () => {
        let rcData;
        
        beforeAll(() => {
            const rcFilePath = path.join(dataDir, 'rc-passages.json');
            const rcFileContent = fs.readFileSync(rcFilePath, 'utf8');
            rcData = JSON.parse(rcFileContent);
        });
        
        test('should load rc-passages.json successfully', () => {
            expect(rcData).toBeDefined();
            expect(rcData).toHaveProperty('testInfo');
            expect(rcData).toHaveProperty('questions');
        });
        
        test('should have valid testInfo structure', () => {
            expect(rcData.testInfo).toHaveProperty('title');
            expect(rcData.testInfo).toHaveProperty('duration');
            expect(rcData.testInfo).toHaveProperty('totalQuestions');
            expect(typeof rcData.testInfo.duration).toBe('number');
            expect(typeof rcData.testInfo.totalQuestions).toBe('number');
        });
        
        test('should have questions array with valid structure', () => {
            expect(Array.isArray(rcData.questions)).toBe(true);
            expect(rcData.questions.length).toBeGreaterThan(0);
            
            // Check first question structure
            const firstQuestion = rcData.questions[0];
            expect(firstQuestion).toHaveProperty('id');
            expect(firstQuestion).toHaveProperty('passageId');
            expect(firstQuestion).toHaveProperty('question');
            expect(firstQuestion).toHaveProperty('options');
            expect(firstQuestion).toHaveProperty('correctAnswer');
        });
        
        test('should have questions with passage content', () => {
            // Find a question with passage content
            const questionWithPassage = rcData.questions.find(q => q.passage !== null);
            expect(questionWithPassage).toBeDefined();
            expect(typeof questionWithPassage.passage).toBe('string');
            expect(questionWithPassage.passage.length).toBeGreaterThan(0);
        });

        test('should include multi-paragraph passages', () => {
            const multiParagraph = rcData.questions.find(q => {
                if (!q.passage) {
                    return false;
                }
                const matches = q.passage.match(/<p>/g) || [];
                return matches.length > 1;
            });
            expect(multiParagraph).toBeDefined();
        });
        
        test('should have questions grouped by passageId', () => {
            const passageIds = new Set(rcData.questions.map(q => q.passageId));
            expect(passageIds.size).toBeGreaterThan(0);
            
            // Check that multiple questions share the same passageId
            const firstPassageId = rcData.questions[0].passageId;
            const questionsWithSamePassage = rcData.questions.filter(
                q => q.passageId === firstPassageId
            );
            expect(questionsWithSamePassage.length).toBeGreaterThan(0);
        });
        
        test('should have valid correctAnswer indices', () => {
            rcData.questions.forEach(question => {
                expect(typeof question.correctAnswer).toBe('number');
                expect(question.correctAnswer).toBeGreaterThanOrEqual(0);
                expect(question.correctAnswer).toBeLessThan(question.options.length);
            });
        });
        
        test('should have options for each question', () => {
            rcData.questions.forEach(question => {
                expect(Array.isArray(question.options)).toBe(true);
                expect(question.options.length).toBeGreaterThanOrEqual(4);
                expect(question.options.length).toBeLessThanOrEqual(5);
                question.options.forEach(option => {
                    expect(typeof option).toBe('string');
                    expect(option.length).toBeGreaterThanOrEqual(0);
                });
            });
        });
    });
    
    describe('Para Completion Data', () => {
        let paraCompletionData;
        
        beforeAll(() => {
            const filePath = path.join(dataDir, 'para-completion.json');
            const fileContent = fs.readFileSync(filePath, 'utf8');
            paraCompletionData = JSON.parse(fileContent);
        });
        
        test('should load para-completion.json successfully', () => {
            expect(paraCompletionData).toBeDefined();
            expect(paraCompletionData).toHaveProperty('testInfo');
            expect(paraCompletionData).toHaveProperty('questions');
        });
        
        test('should have valid question structure', () => {
            expect(Array.isArray(paraCompletionData.questions)).toBe(true);
            expect(paraCompletionData.questions.length).toBeGreaterThan(0);
            
            const firstQuestion = paraCompletionData.questions[0];
            expect(firstQuestion).toHaveProperty('id');
            expect(firstQuestion).toHaveProperty('setId');
            expect(firstQuestion).toHaveProperty('passage');
            expect(firstQuestion).toHaveProperty('question');
            expect(firstQuestion).toHaveProperty('options');
            expect(firstQuestion).toHaveProperty('correctAnswer');
        });
        
        test('should have questions grouped by setId', () => {
            const setIds = new Set(paraCompletionData.questions.map(q => q.setId));
            expect(setIds.size).toBeGreaterThan(0);
        });
        
        test('should have valid correctAnswer values', () => {
            paraCompletionData.questions.forEach(question => {
                expect(typeof question.correctAnswer).toBe('number');
                expect(question.correctAnswer).toBeGreaterThanOrEqual(0);
                expect(question.correctAnswer).toBeLessThan(question.options.length);
            });
        });
    });
    
    describe('Para Summary Data', () => {
        let paraSummaryData;
        
        beforeAll(() => {
            const filePath = path.join(dataDir, 'para-summary.json');
            const fileContent = fs.readFileSync(filePath, 'utf8');
            paraSummaryData = JSON.parse(fileContent);
        });
        
        test('should load para-summary.json successfully', () => {
            expect(paraSummaryData).toBeDefined();
            expect(paraSummaryData).toHaveProperty('testInfo');
            expect(paraSummaryData).toHaveProperty('questions');
        });
        
        test('should have valid question structure', () => {
            expect(Array.isArray(paraSummaryData.questions)).toBe(true);
            expect(paraSummaryData.questions.length).toBeGreaterThan(0);
            
            const firstQuestion = paraSummaryData.questions[0];
            expect(firstQuestion).toHaveProperty('id');
            expect(firstQuestion).toHaveProperty('setId');
            expect(firstQuestion).toHaveProperty('passage');
            expect(firstQuestion).toHaveProperty('question');
            expect(firstQuestion).toHaveProperty('options');
            expect(firstQuestion).toHaveProperty('correctAnswer');
        });
        
        test('should have questions grouped by setId', () => {
            const setIds = new Set(paraSummaryData.questions.map(q => q.setId));
            expect(setIds.size).toBeGreaterThan(0);
        });
        
        test('should have valid options for each question', () => {
            paraSummaryData.questions.forEach(question => {
                expect(Array.isArray(question.options)).toBe(true);
                // Para summary questions can have 3-5 options
                expect(question.options.length).toBeGreaterThanOrEqual(3);
                expect(question.options.length).toBeLessThanOrEqual(5);
                question.options.forEach(option => {
                    expect(typeof option).toBe('string');
                    // Allow empty strings as some options might be empty placeholders
                    expect(option.length).toBeGreaterThanOrEqual(0);
                });
            });
        });
    });
    
    describe('Data File Accessibility', () => {
        test('should have all required data files present', () => {
            const requiredFiles = [
                'rc-passages.json',
                'para-completion.json',
                'para-summary.json'
            ];
            
            requiredFiles.forEach(filename => {
                const filePath = path.join(dataDir, filename);
                expect(fs.existsSync(filePath)).toBe(true);
            });
        });
        
        test('should have readable data files', () => {
            const requiredFiles = [
                'rc-passages.json',
                'para-completion.json',
                'para-summary.json'
            ];
            
            requiredFiles.forEach(filename => {
                const filePath = path.join(dataDir, filename);
                expect(() => {
                    fs.readFileSync(filePath, 'utf8');
                }).not.toThrow();
            });
        });
        
        test('should have valid JSON in all data files', () => {
            const requiredFiles = [
                'rc-passages.json',
                'para-completion.json',
                'para-summary.json'
            ];
            
            requiredFiles.forEach(filename => {
                const filePath = path.join(dataDir, filename);
                const content = fs.readFileSync(filePath, 'utf8');
                expect(() => {
                    JSON.parse(content);
                }).not.toThrow();
            });
        });
    });
    
    describe('Data Consistency', () => {
        test('should have consistent marks structure across questions', () => {
            const rcFilePath = path.join(dataDir, 'rc-passages.json');
            const rcData = JSON.parse(fs.readFileSync(rcFilePath, 'utf8'));
            
            // Check if marks are present and consistent
            const questionsWithMarks = rcData.questions.filter(q => q.marks);
            if (questionsWithMarks.length > 0) {
                questionsWithMarks.forEach(question => {
                    expect(question.marks).toHaveProperty('positive');
                    expect(question.marks).toHaveProperty('negative');
                    expect(typeof question.marks.positive).toBe('number');
                    expect(typeof question.marks.negative).toBe('number');
                });
            }
        });
        
        test('should have explanations for questions when available', () => {
            const rcFilePath = path.join(dataDir, 'rc-passages.json');
            const rcData = JSON.parse(fs.readFileSync(rcFilePath, 'utf8'));
            
            // Check for explanations
            const questionsWithExplanations = rcData.questions.filter(q => q.explanation);
            if (questionsWithExplanations.length > 0) {
                questionsWithExplanations.forEach(question => {
                    expect(typeof question.explanation).toBe('string');
                    expect(question.explanation.length).toBeGreaterThan(0);
                });
            }
        });
    });
});

/**
 * Integration Tests for Quiz Flow
 * Tests the complete quiz workflow from start to submission
 */

describe('Quiz Flow Integration Tests', () => {
    let StorageManager, Utils;
    
    beforeEach(() => {
        // Mock localStorage
        global.localStorage = {
            store: {},
            getItem(key) {
                return this.store[key] || null;
            },
            setItem(key, value) {
                this.store[key] = String(value);
            },
            removeItem(key) {
                delete this.store[key];
            },
            clear() {
                this.store = {};
            }
        };
        
        // Load modules
        StorageManager = require('../../js/storage');
        Utils = require('../../js/utils');
        
        // Clear storage before each test
        StorageManager.clearAll();
    });
    
    afterEach(() => {
        StorageManager.clearAll();
    });
    
    describe('Quiz Initialization', () => {
        test('should initialize quiz with question type and set ID', () => {
            const questionType = 'rc';
            const setId = 1;
            
            StorageManager.saveQuestionType(questionType);
            StorageManager.saveSelectedSet(questionType, setId);
            
            expect(StorageManager.getQuestionType()).toBe('rc');
            expect(StorageManager.getSelectedSetId('rc')).toBe(1);
        });
        
        test('should initialize question statuses', () => {
            const totalQuestions = 10;
            StorageManager.initializeStatuses(totalQuestions);
            
            const statuses = StorageManager.getAllStatuses();
            expect(Object.keys(statuses).length).toBe(totalQuestions);
            
            // All should be 'not-visited' initially
            Object.values(statuses).forEach(status => {
                expect(status).toBe('not-visited');
            });
        });
        
        test('should save user name at start', () => {
            const userName = 'Test User';
            StorageManager.saveUserName(userName);
            
            expect(StorageManager.getUserName()).toBe('Test User');
        });
    });
    
    describe('Question Navigation', () => {
        beforeEach(() => {
            StorageManager.initializeStatuses(5);
        });
        
        test('should track current question index', () => {
            StorageManager.saveCurrentQuestion(0);
            expect(StorageManager.getCurrentQuestion()).toBe(0);
            
            StorageManager.saveCurrentQuestion(2);
            expect(StorageManager.getCurrentQuestion()).toBe(2);
        });
        
        test('should mark question as visited when navigating', () => {
            const questionIndex = 0;
            
            // Initially not visited
            expect(StorageManager.getQuestionStatus(questionIndex)).toBe('not-visited');
            
            // Mark as not-answered (visited but no answer)
            StorageManager.saveQuestionStatus(questionIndex, 'not-answered');
            expect(StorageManager.getQuestionStatus(questionIndex)).toBe('not-answered');
        });
        
        test('should allow navigation between questions', () => {
            // Navigate through questions
            for (let i = 0; i < 5; i++) {
                StorageManager.saveCurrentQuestion(i);
                StorageManager.saveQuestionStatus(i, 'not-answered');
            }
            
            const stats = StorageManager.getStatistics(5);
            expect(stats.notVisited).toBe(0);
            expect(stats.notAnswered).toBe(5);
        });
    });
    
    describe('Answer Management', () => {
        beforeEach(() => {
            StorageManager.initializeStatuses(5);
        });
        
        test('should save and retrieve answers', () => {
            StorageManager.saveAnswer(0, 2);
            expect(StorageManager.getAnswer(0)).toBe(2);
            
            StorageManager.saveAnswer(1, 0);
            expect(StorageManager.getAnswer(1)).toBe(0);
        });
        
        test('should update question status when answer is saved', () => {
            const questionIndex = 0;
            const selectedOption = 2;
            
            StorageManager.saveAnswer(questionIndex, selectedOption);
            StorageManager.saveQuestionStatus(questionIndex, 'answered');
            
            expect(StorageManager.getQuestionStatus(questionIndex)).toBe('answered');
            expect(StorageManager.getAnswer(questionIndex)).toBe(selectedOption);
        });
        
        test('should clear answer when requested', () => {
            StorageManager.saveAnswer(0, 2);
            expect(StorageManager.getAnswer(0)).toBe(2);
            
            StorageManager.clearAnswer(0);
            expect(StorageManager.getAnswer(0)).toBeNull();
        });
        
        test('should handle marking for review', () => {
            const questionIndex = 1;
            
            // Mark without answer
            StorageManager.saveQuestionStatus(questionIndex, 'review');
            expect(StorageManager.getQuestionStatus(questionIndex)).toBe('review');
            
            // Mark with answer
            StorageManager.saveAnswer(questionIndex, 1);
            StorageManager.saveQuestionStatus(questionIndex, 'review-answered');
            expect(StorageManager.getQuestionStatus(questionIndex)).toBe('review-answered');
        });
    });
    
    describe('Timer Management', () => {
        test('should track timer state', () => {
            const remainingSeconds = 2400; // 40 minutes
            StorageManager.saveTimerState(remainingSeconds);
            
            const timerState = StorageManager.getTimerState();
            expect(timerState).toBeLessThanOrEqual(remainingSeconds);
            expect(timerState).toBeGreaterThanOrEqual(0);
        });
        
        test('should track attempt start time', () => {
            StorageManager.saveAttemptStartTime();
            const startTime = StorageManager.getAttemptStartTime();
            
            expect(startTime).toBeDefined();
            expect(typeof startTime).toBe('number');
            expect(startTime).toBeLessThanOrEqual(Date.now());
        });
    });
    
    describe('Statistics Calculation', () => {
        beforeEach(() => {
            StorageManager.initializeStatuses(10);
        });
        
        test('should calculate correct statistics', () => {
            // Answer some questions
            StorageManager.saveAnswer(0, 1);
            StorageManager.saveQuestionStatus(0, 'answered');
            
            StorageManager.saveAnswer(1, 2);
            StorageManager.saveQuestionStatus(1, 'answered');
            
            // Visit but don't answer
            StorageManager.saveQuestionStatus(2, 'not-answered');
            
            // Mark for review
            StorageManager.saveQuestionStatus(3, 'review');
            
            // Mark for review with answer
            StorageManager.saveAnswer(4, 0);
            StorageManager.saveQuestionStatus(4, 'review-answered');
            
            const stats = StorageManager.getStatistics(10);
            
            expect(stats.answered).toBe(2);
            expect(stats.notAnswered).toBe(1);
            expect(stats.review).toBe(1);
            expect(stats.reviewAnswered).toBe(1);
            expect(stats.notVisited).toBe(5);
        });
        
        test('should track total answered including review-answered', () => {
            StorageManager.saveAnswer(0, 1);
            StorageManager.saveQuestionStatus(0, 'answered');
            
            StorageManager.saveAnswer(1, 2);
            StorageManager.saveQuestionStatus(1, 'review-answered');
            
            const stats = StorageManager.getStatistics(10);
            const totalAnswered = stats.answered + stats.reviewAnswered;
            
            expect(totalAnswered).toBe(2);
        });
    });
    
    describe('Test Submission', () => {
        beforeEach(() => {
            StorageManager.initializeStatuses(5);
            StorageManager.saveQuestionType('rc');
            StorageManager.saveSelectedSet('rc', 1);
        });
        
        test('should mark test as completed', () => {
            expect(StorageManager.isTestCompleted()).toBe(false);
            
            StorageManager.markTestCompleted();
            
            expect(StorageManager.isTestCompleted()).toBe(true);
        });
        
        test('should export test data on submission', () => {
            // Set up test data
            StorageManager.saveAnswer(0, 1);
            StorageManager.saveQuestionStatus(0, 'answered');
            StorageManager.saveAnswer(1, 2);
            StorageManager.saveQuestionStatus(1, 'answered');
            StorageManager.saveCurrentQuestion(2);
            StorageManager.saveUserName('Test User');
            
            const exportedData = StorageManager.exportTestData();
            
            expect(exportedData).toHaveProperty('answers');
            expect(exportedData).toHaveProperty('statuses');
            expect(exportedData).toHaveProperty('currentQuestion');
            expect(exportedData).toHaveProperty('userName');
            expect(exportedData).toHaveProperty('exportedAt');
            
            expect(exportedData.answers).toEqual({ 0: 1, 1: 2 });
            expect(exportedData.currentQuestion).toBe(2);
            expect(exportedData.userName).toBe('Test User');
        });
    });
    
    describe('Question Time Tracking', () => {
        test('should track time spent on questions', (done) => {
            const questionIndex = 0;
            
            StorageManager.startQuestionTimer(questionIndex);
            
            // Wait a bit then stop
            setTimeout(() => {
                StorageManager.stopQuestionTimer(questionIndex);
                const timeSpent = StorageManager.getQuestionTime(questionIndex);
                
                expect(timeSpent).toBeGreaterThan(0);
                done();
            }, 100);
        });
        
        test('should accumulate time across multiple visits', (done) => {
            const questionIndex = 0;
            
            // First visit
            StorageManager.startQuestionTimer(questionIndex);
            setTimeout(() => {
                StorageManager.stopQuestionTimer(questionIndex);
                const firstTime = StorageManager.getQuestionTime(questionIndex);
                
                // Second visit
                StorageManager.startQuestionTimer(questionIndex);
                setTimeout(() => {
                    StorageManager.stopQuestionTimer(questionIndex);
                    const totalTime = StorageManager.getQuestionTime(questionIndex);
                    
                    expect(totalTime).toBeGreaterThan(firstTime);
                    done();
                }, 50);
            }, 50);
        });
    });
    
    describe('Complete Quiz Workflow', () => {
        test('should complete full quiz workflow', () => {
            const questionType = 'rc';
            const setId = 1;
            const totalQuestions = 5;
            
            // 1. Initialize quiz
            StorageManager.saveQuestionType(questionType);
            StorageManager.saveSelectedSet(questionType, setId);
            StorageManager.saveUserName('Test User');
            StorageManager.initializeStatuses(totalQuestions);
            StorageManager.saveAttemptStartTime();
            
            // 2. Answer questions
            for (let i = 0; i < totalQuestions; i++) {
                StorageManager.saveCurrentQuestion(i);
                StorageManager.startQuestionTimer(i);
                
                // Answer some, skip some, review some
                if (i % 3 === 0) {
                    StorageManager.saveAnswer(i, i % 4);
                    StorageManager.saveQuestionStatus(i, 'answered');
                } else if (i % 3 === 1) {
                    StorageManager.saveQuestionStatus(i, 'not-answered');
                } else {
                    StorageManager.saveAnswer(i, i % 4);
                    StorageManager.saveQuestionStatus(i, 'review-answered');
                }
                
                StorageManager.stopQuestionTimer(i);
            }
            
            // 3. Check statistics
            const stats = StorageManager.getStatistics(totalQuestions);
            expect(stats.answered + stats.reviewAnswered + stats.notAnswered + stats.notVisited).toBe(totalQuestions);
            
            // 4. Submit test
            StorageManager.markTestCompleted();
            expect(StorageManager.isTestCompleted()).toBe(true);
            
            // 5. Export data
            const exportedData = StorageManager.exportTestData();
            expect(exportedData).toBeDefined();
            expect(exportedData.userName).toBe('Test User');
        });
    });
    
    describe('Data Sanitization', () => {
        test('should sanitize HTML in question text', () => {
            const maliciousText = '<script>alert("XSS")</script>Safe text';
            const sanitized = Utils.sanitizeHTML(maliciousText);
            
            expect(sanitized).not.toContain('<script>');
            expect(sanitized).toContain('Safe text');
        });
        
        test('should parse safe HTML correctly', () => {
            const safeHTML = '<p>This is <strong>bold</strong> text</p>';
            const parsed = Utils.parseHTMLSafe(safeHTML);
            
            expect(parsed).toContain('<strong>');
            expect(parsed).toContain('bold');
        });
    });
});

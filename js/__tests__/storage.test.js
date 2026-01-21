/**
 * Tests for StorageManager
 * Validates localStorage operations and data management
 */

// Mock localStorage
class LocalStorageMock {
    constructor() {
        this.store = {};
    }

    clear() {
        this.store = {};
    }

    getItem(key) {
        return this.store[key] || null;
    }

    setItem(key, value) {
        this.store[key] = String(value);
    }

    removeItem(key) {
        delete this.store[key];
    }

    get length() {
        return Object.keys(this.store).length;
    }

    key(index) {
        const keys = Object.keys(this.store);
        return keys[index] || null;
    }
}

global.localStorage = new LocalStorageMock();

// Load the StorageManager module
const StorageManager = require('../storage');

describe('StorageManager - Basic Operations', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    describe('save and load', () => {
        test('should save and retrieve data', () => {
            const data = { test: 'value' };
            StorageManager.save('test-key', data);
            const retrieved = StorageManager.load('test-key');
            expect(retrieved).toEqual(data);
        });

        test('should return default value when key does not exist', () => {
            const result = StorageManager.load('nonexistent', 'default');
            expect(result).toBe('default');
        });

        test('should return null by default for missing key', () => {
            const result = StorageManager.load('nonexistent');
            expect(result).toBeNull();
        });

        test('should handle JSON parse errors gracefully', () => {
            localStorage.setItem('bad-json', 'not valid json {');
            const result = StorageManager.load('bad-json', 'fallback');
            expect(result).toBe('fallback');
        });
    });

    describe('remove', () => {
        test('should remove data', () => {
            StorageManager.save('test-key', 'value');
            expect(StorageManager.load('test-key')).toBe('value');
            
            StorageManager.remove('test-key');
            expect(StorageManager.load('test-key')).toBeNull();
        });

        test('should handle removing non-existent key', () => {
            const result = StorageManager.remove('nonexistent');
            expect(result).toBe(true);
        });
    });

    describe('clearAll', () => {
        test('should clear all VARC-related data', () => {
            StorageManager.save(StorageManager.KEYS.USER_ANSWERS, { 0: 1 });
            StorageManager.save(StorageManager.KEYS.QUESTION_STATUS, { 0: 'answered' });
            
            StorageManager.clearAll();
            
            expect(StorageManager.load(StorageManager.KEYS.USER_ANSWERS)).toBeNull();
            expect(StorageManager.load(StorageManager.KEYS.QUESTION_STATUS)).toBeNull();
        });
    });
});

describe('StorageManager - Answer Management', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should save and retrieve answer', () => {
        StorageManager.saveAnswer(0, 2);
        expect(StorageManager.getAnswer(0)).toBe(2);
    });

    test('should handle zero as a valid answer', () => {
        StorageManager.saveAnswer(0, 0);
        expect(StorageManager.getAnswer(0)).toBe(0);
    });

    test('should return null for non-existent answer', () => {
        expect(StorageManager.getAnswer(999)).toBeNull();
    });

    test('should get all answers', () => {
        StorageManager.saveAnswer(0, 1);
        StorageManager.saveAnswer(1, 2);
        StorageManager.saveAnswer(2, 0);
        
        const answers = StorageManager.getAllAnswers();
        expect(answers).toEqual({ 0: 1, 1: 2, 2: 0 });
    });

    test('should clear answer', () => {
        StorageManager.saveAnswer(0, 2);
        StorageManager.clearAnswer(0);
        expect(StorageManager.getAnswer(0)).toBeNull();
    });
});

describe('StorageManager - Question Status', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should save and retrieve question status', () => {
        StorageManager.saveQuestionStatus(0, 'answered');
        expect(StorageManager.getQuestionStatus(0)).toBe('answered');
    });

    test('should return not-visited for non-existent status', () => {
        expect(StorageManager.getQuestionStatus(999)).toBe('not-visited');
    });

    test('should initialize statuses for all questions', () => {
        StorageManager.initializeStatuses(5);
        const statuses = StorageManager.getAllStatuses();
        
        expect(Object.keys(statuses).length).toBe(5);
        expect(statuses[0]).toBe('not-visited');
        expect(statuses[4]).toBe('not-visited');
    });

    test('should not reinitialize existing statuses', () => {
        StorageManager.saveQuestionStatus(0, 'answered');
        StorageManager.initializeStatuses(5);
        
        expect(StorageManager.getQuestionStatus(0)).toBe('answered');
    });
});

describe('StorageManager - Statistics', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should calculate statistics correctly', () => {
        StorageManager.initializeStatuses(10);
        StorageManager.saveQuestionStatus(0, 'answered');
        StorageManager.saveQuestionStatus(1, 'answered');
        StorageManager.saveQuestionStatus(2, 'not-answered');
        StorageManager.saveQuestionStatus(3, 'review');
        StorageManager.saveQuestionStatus(4, 'review-answered');
        
        const stats = StorageManager.getStatistics(10);
        
        expect(stats.answered).toBe(2);
        expect(stats.notAnswered).toBe(1);
        expect(stats.notVisited).toBe(5);
        expect(stats.review).toBe(1);
        expect(stats.reviewAnswered).toBe(1);
    });
});

describe('StorageManager - Timer', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should save and retrieve timer state', () => {
        StorageManager.saveTimerState(1800);
        
        // Small delay to simulate passage of time
        const timerState = StorageManager.getTimerState();
        
        expect(timerState).toBeLessThanOrEqual(1800);
        expect(timerState).toBeGreaterThanOrEqual(0);
    });

    test('should return null for missing timer state', () => {
        expect(StorageManager.getTimerState()).toBeNull();
    });

    test('should not return negative time', () => {
        // Simulate expired timer
        StorageManager.save(StorageManager.KEYS.TIMER_STATE, {
            remainingSeconds: 10,
            savedAt: Date.now() - 20000 // 20 seconds ago
        });
        
        const timerState = StorageManager.getTimerState();
        expect(timerState).toBe(0);
    });
});

describe('StorageManager - Test State', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should mark and check test completion', () => {
        expect(StorageManager.isTestCompleted()).toBe(false);
        
        StorageManager.markTestCompleted();
        expect(StorageManager.isTestCompleted()).toBe(true);
    });

    test('should save and retrieve current question', () => {
        StorageManager.saveCurrentQuestion(5);
        expect(StorageManager.getCurrentQuestion()).toBe(5);
    });

    test('should default to 0 for current question', () => {
        expect(StorageManager.getCurrentQuestion()).toBe(0);
    });
});

describe('StorageManager - Data Export/Import', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should export test data', () => {
        StorageManager.saveAnswer(0, 1);
        StorageManager.saveQuestionStatus(0, 'answered');
        StorageManager.saveCurrentQuestion(2);
        StorageManager.saveUserName('Test User');
        
        const exported = StorageManager.exportTestData();
        
        expect(exported.answers).toEqual({ 0: 1 });
        expect(exported.statuses).toEqual({ 0: 'answered' });
        expect(exported.currentQuestion).toBe(2);
        expect(exported.userName).toBe('Test User');
        expect(exported.exportedAt).toBeDefined();
    });

    test('should import test data', () => {
        const testData = {
            answers: { 0: 2, 1: 3 },
            statuses: { 0: 'answered', 1: 'review' },
            currentQuestion: 1,
            userName: 'Imported User'
        };
        
        StorageManager.importTestData(testData);
        
        expect(StorageManager.getAnswer(0)).toBe(2);
        expect(StorageManager.getQuestionStatus(0)).toBe('answered');
        expect(StorageManager.getCurrentQuestion()).toBe(1);
        expect(StorageManager.getUserName()).toBe('Imported User');
    });
});

describe('StorageManager - Question Time Tracking', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('should track question time', () => {
        StorageManager.startQuestionTimer(0);
        
        // Simulate some time passing
        setTimeout(() => {
            StorageManager.stopQuestionTimer(0);
            const time = StorageManager.getQuestionTime(0);
            expect(time).toBeGreaterThan(0);
        }, 50);
    });

    test('should accumulate time across multiple visits', () => {
        StorageManager.startQuestionTimer(0);
        StorageManager.stopQuestionTimer(0);
        
        const firstTime = StorageManager.getQuestionTime(0);
        
        StorageManager.startQuestionTimer(0);
        StorageManager.stopQuestionTimer(0);
        
        const totalTime = StorageManager.getQuestionTime(0);
        expect(totalTime).toBeGreaterThanOrEqual(firstTime);
    });

    test('should return 0 for untracked question', () => {
        expect(StorageManager.getQuestionTime(999)).toBe(0);
    });
});

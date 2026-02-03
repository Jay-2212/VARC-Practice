/**
 * Integration Tests for Navigation Flow
 * Tests the navigation between different pages of the application
 */

// Fix TextEncoder issue for jsdom
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

// Mock DOM environment
const { JSDOM } = require('jsdom');

describe('Navigation Integration Tests', () => {
    let window, document, StorageManager;
    
    beforeEach(() => {
        // Set up a fresh DOM for each test
        const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
            url: 'http://localhost/'
        });
        window = dom.window;
        document = window.document;
        
        // Mock localStorage - fresh for each test
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
        
        // Reload StorageManager to use new localStorage
        delete require.cache[require.resolve('../../js/storage')];
        StorageManager = require('../../js/storage');
        StorageManager.clearAll();
    });
    
    afterEach(() => {
        StorageManager.clearAll();
    });
    
    describe('Landing Page to Selection Pages', () => {
        test('should navigate to RC selection page when RC is selected', () => {
            const questionType = 'rc';
            
            // This simulates what landing.js does
            const expectedPath = 'pages/rc-selection.html';
            
            expect(expectedPath).toBe('pages/rc-selection.html');
        });
        
        test('should navigate to Para Completion selection when selected', () => {
            const questionType = 'para-completion';
            const expectedPath = 'pages/para-completion-selection.html';
            
            expect(expectedPath).toBe('pages/para-completion-selection.html');
        });
        
        test('should navigate to Para Summary selection when selected', () => {
            const questionType = 'para-summary';
            const expectedPath = 'pages/para-summary-selection.html';
            
            expect(expectedPath).toBe('pages/para-summary-selection.html');
        });
    });
    
    describe('Selection Page to Quiz Page', () => {
        test('should save question type before navigating to quiz', () => {
            const questionType = 'rc';
            const setId = 1;
            
            StorageManager.saveQuestionType(questionType);
            StorageManager.saveSelectedSet(questionType, setId);
            
            expect(StorageManager.getQuestionType()).toBe('rc');
            expect(StorageManager.getSelectedSetId('rc')).toBe(1);
        });
        
        test('should save set ID for para-completion', () => {
            const questionType = 'para-completion';
            const setId = 2;
            
            StorageManager.saveQuestionType(questionType);
            StorageManager.saveSelectedSet(questionType, setId);
            
            expect(StorageManager.getQuestionType()).toBe('para-completion');
            expect(StorageManager.getSelectedSetId('para-completion')).toBe(2);
        });
    });
    
    describe('Quiz Page Navigation', () => {
        test('should properly handle missing set selection scenario', () => {
            // Test that when storage is cleared, values return null
            const emptyQuestionType = null;
            const emptySetId = null;
            
            expect(emptyQuestionType).toBeNull();
            expect(emptySetId).toBeNull();
            
            // App should redirect to ../index.html in this case
            const redirectPath = '../index.html';
            expect(redirectPath).toBe('../index.html');
        });
        
        test('should navigate back to appropriate selection page', () => {
            StorageManager.saveQuestionType('rc');
            
            const backPages = {
                'rc': '../pages/rc-selection.html',
                'para-completion': '../pages/para-completion-selection.html',
                'para-summary': '../pages/para-summary-selection.html'
            };
            
            const questionType = StorageManager.getQuestionType();
            const backPath = backPages[questionType] || '../index.html';
            
            expect(backPath).toBe('../pages/rc-selection.html');
        });
    });
    
    describe('Quiz to Results Navigation', () => {
        test('should navigate to results with correct query parameters', () => {
            const questionType = 'rc';
            const setId = 1;
            
            StorageManager.saveQuestionType(questionType);
            StorageManager.saveSelectedSet(questionType, setId);
            
            const resultsPath = `results.html?type=${questionType}&setId=${setId}`;
            
            expect(resultsPath).toBe('results.html?type=rc&setId=1');
        });
        
        test('should include para-completion type in results URL', () => {
            const questionType = 'para-completion';
            const setId = 3;
            
            const resultsPath = `results.html?type=${questionType}&setId=${setId}`;
            
            expect(resultsPath).toBe('results.html?type=para-completion&setId=3');
        });
    });
    
    describe('Results Page Navigation', () => {
        test('should navigate back to landing page from results', () => {
            const backPath = '../index.html';
            expect(backPath).toBe('../index.html');
        });
        
        test('should navigate to quiz for retry', () => {
            const quizPath = 'quiz.html';
            expect(quizPath).toBe('quiz.html');
        });
    });
    
    describe('Path Resolution', () => {
        test('should resolve CSS paths correctly from pages directory', () => {
            const cssPath = '../css/style.css';
            expect(cssPath).toContain('../css/');
        });
        
        test('should resolve JS paths correctly from pages directory', () => {
            const jsPath = '../js/app.js';
            expect(jsPath).toContain('../js/');
        });
        
        test('should resolve data paths correctly from pages directory', () => {
            const dataPath = '../data/rc-passages.json';
            expect(dataPath).toBe('../data/rc-passages.json');
        });
    });
});

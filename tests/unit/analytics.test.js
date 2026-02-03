/**
 * Tests for analytics helper functions
 */

// Fix TextEncoder issue for jsdom - must be before JSDOM import
global.TextEncoder = require('util').TextEncoder;
global.TextDecoder = require('util').TextDecoder;

const { JSDOM } = require('jsdom');
const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
global.document = dom.window.document;
global.window = dom.window;

const Utils = require('../../js/utils');
global.Utils = Utils;

const Analytics = require('../../js/analytics');

describe('Analytics', () => {
    test('getQuestionTimesSeconds should map ms to seconds', () => {
        const attempt = {
            questions: [{}, {}, {}],
            questionTimes: { 0: 1500, 1: 0, 2: 30000 }
        };
        expect(Analytics.getQuestionTimesSeconds(attempt)).toEqual([2, 0, 30]);
    });

    test('summarizeAttempt should compute time stats', () => {
        const attempt = {
            totalTime: 90,
            questions: [
                { userAnswer: 0, correctAnswer: 0 },
                { userAnswer: 1, correctAnswer: 2 },
                { userAnswer: null, correctAnswer: 1 }
            ],
            questionTimes: { 0: 30000, 1: 45000, 2: 15000 },
            correct: 1,
            incorrect: 1,
            unattempted: 1
        };

        const summary = Analytics.summarizeAttempt(attempt);
        expect(summary.totalTime).toBe(90);
        expect(summary.times).toEqual([30, 45, 15]);
        expect(summary.medianTime).toBe(30);
        expect(summary.slowest.index).toBe(1);
        expect(summary.fastest.index).toBe(2);
    });

    test('buildInsights should generate insight strings', () => {
        const attempt = {
            questions: [
                { userAnswer: 0, correctAnswer: 0 },
                { userAnswer: 1, correctAnswer: 2 },
                { userAnswer: null, correctAnswer: 1 }
            ],
            questionTimes: { 0: 30000, 1: 45000, 2: 15000 },
            totalTime: 90,
            correct: 1,
            incorrect: 1,
            unattempted: 1
        };

        const summary = Analytics.summarizeAttempt(attempt);
        const insights = Analytics.buildInsights(attempt, summary);
        expect(Array.isArray(insights)).toBe(true);
        expect(insights.length).toBeGreaterThan(0);
    });
});

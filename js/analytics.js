/**
 * Analytics Helper Functions
 * Computes time/accuracy summaries and insights for attempts
 */

const Analytics = {
    /**
     * Get per-question times in seconds, aligned by question index.
     * @param {Object} attempt
     * @returns {number[]}
     */
    getQuestionTimesSeconds(attempt) {
        const totalQuestions = Array.isArray(attempt?.questions) ? attempt.questions.length : 0;
        const questionTimes = attempt?.questionTimes || {};
        const times = [];

        for (let i = 0; i < totalQuestions; i++) {
            const raw = questionTimes[i] ?? questionTimes[String(i)] ?? 0;
            const seconds = Math.max(0, Math.round(raw / 1000));
            times.push(seconds);
        }

        return times;
    },

    /**
     * Get question status for an attempt index.
     * @param {Object} attempt
     * @param {number} index
     * @returns {'correct'|'incorrect'|'unattempted'}
     */
    getQuestionStatus(attempt, index) {
        const question = attempt?.questions?.[index];
        if (!question) return 'unattempted';

        const answer = question.userAnswer;
        const hasAnswer = answer !== null && answer !== undefined && answer !== '';
        if (!hasAnswer) return 'unattempted';
        return answer === question.correctAnswer ? 'correct' : 'incorrect';
    },

    /**
     * Calculate median from a numeric array.
     * @param {number[]} values
     * @returns {number}
     */
    getMedian(values) {
        if (!Array.isArray(values) || values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        if (sorted.length % 2 === 0) {
            return (sorted[mid - 1] + sorted[mid]) / 2;
        }
        return sorted[mid];
    },

    /**
     * Get percentile (0-1) from array.
     * @param {number[]} values
     * @param {number} percentile
     * @returns {number}
     */
    getPercentile(values, percentile = 0.75) {
        if (!Array.isArray(values) || values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const index = Math.floor((sorted.length - 1) * percentile);
        return sorted[index];
    },

    /**
     * Summarize a single attempt with time + accuracy stats.
     * @param {Object} attempt
     * @returns {Object}
     */
    summarizeAttempt(attempt) {
        const times = this.getQuestionTimesSeconds(attempt);
        const totalQuestions = times.length;
        const totalTime = typeof attempt?.totalTime === 'number'
            ? Math.max(0, Math.round(attempt.totalTime))
            : times.reduce((sum, t) => sum + t, 0);

        const avgTime = totalQuestions > 0 ? totalTime / totalQuestions : 0;
        const medianTime = this.getMedian(times);
        const p75Time = this.getPercentile(times, 0.75);

        const timeWithIndex = times
            .map((time, index) => ({ time, index }))
            .filter(item => item.time > 0);

        const timeCandidates = timeWithIndex.length > 0 ? timeWithIndex : times.map((time, index) => ({ time, index }));

        const slowest = timeCandidates.reduce((max, curr) => curr.time > max.time ? curr : max, timeCandidates[0] || { time: 0, index: 0 });
        const fastest = timeCandidates.reduce((min, curr) => curr.time < min.time ? curr : min, timeCandidates[0] || { time: 0, index: 0 });

        const correct = typeof attempt?.correct === 'number' ? attempt.correct : 0;
        const incorrect = typeof attempt?.incorrect === 'number' ? attempt.incorrect : 0;
        const unattempted = typeof attempt?.unattempted === 'number' ? attempt.unattempted : 0;
        const attempted = correct + incorrect;
        const accuracy = attempted > 0 ? Math.round((correct / (correct + incorrect + unattempted)) * 100) : 0;

        let correctTimeSum = 0;
        let correctCount = 0;
        let incorrectTimeSum = 0;
        let incorrectCount = 0;

        for (let i = 0; i < totalQuestions; i++) {
            const status = this.getQuestionStatus(attempt, i);
            if (status === 'correct') {
                correctTimeSum += times[i];
                correctCount += 1;
            } else if (status === 'incorrect') {
                incorrectTimeSum += times[i];
                incorrectCount += 1;
            }
        }

        return {
            totalTime,
            avgTime,
            medianTime,
            p75Time,
            fastest,
            slowest,
            accuracy,
            correct,
            incorrect,
            unattempted,
            avgCorrectTime: correctCount > 0 ? correctTimeSum / correctCount : 0,
            avgIncorrectTime: incorrectCount > 0 ? incorrectTimeSum / incorrectCount : 0,
            times
        };
    },

    /**
     * Build human-readable insights based on time + accuracy patterns.
     * @param {Object} attempt
     * @param {Object} summary
     * @returns {string[]}
     */
    buildInsights(attempt, summary) {
        const insights = [];
        const totalQuestions = summary.times.length;

        if (totalQuestions === 0) return insights;

        if (summary.slowest && summary.slowest.time > 0) {
            const status = this.getQuestionStatus(attempt, summary.slowest.index);
            const label = `Q${summary.slowest.index + 1}`;
            const timeText = Utils?.formatDuration
                ? Utils.formatDuration(summary.slowest.time)
                : `${summary.slowest.time}s`;
            if (status === 'incorrect') {
                insights.push(`Most time spent on ${label} (${timeText}) and it was incorrect.`);
            } else if (status === 'unattempted') {
                insights.push(`Most time spent on ${label} (${timeText}) but it was left unattempted.`);
            } else {
                insights.push(`Most time spent on ${label} (${timeText}).`);
            }
        }

        const fastIncorrectIndex = summary.times
            .map((time, index) => ({ time, index }))
            .filter(item => this.getQuestionStatus(attempt, item.index) === 'incorrect' && item.time > 0)
            .sort((a, b) => a.time - b.time)[0];

        if (fastIncorrectIndex) {
            const label = `Q${fastIncorrectIndex.index + 1}`;
            const timeText = Utils?.formatDuration
                ? Utils.formatDuration(fastIncorrectIndex.time)
                : `${fastIncorrectIndex.time}s`;
            insights.push(`Fast but incorrect on ${label} (${timeText}). Consider slowing down here.`);
        }

        if (summary.avgCorrectTime > 0 && summary.avgIncorrectTime > 0) {
            if (summary.avgIncorrectTime < summary.avgCorrectTime * 0.7) {
                insights.push('Incorrect answers were much faster than correct ones. You may be rushing some questions.');
            } else if (summary.avgIncorrectTime > summary.avgCorrectTime * 1.3) {
                insights.push('Incorrect answers took longer than correct ones. Consider moving on sooner when stuck.');
            }
        }

        if (summary.unattempted > 0) {
            insights.push(`${summary.unattempted} question${summary.unattempted > 1 ? 's' : ''} left unattempted. Consider time allocation to maximize attempts.`);
        }

        const totalTime = summary.totalTime || summary.times.reduce((sum, t) => sum + t, 0);
        if (totalTime > 0) {
            const sorted = summary.times
                .map((time, index) => ({ time, index }))
                .sort((a, b) => b.time - a.time);
            const topTwo = sorted.slice(0, 2);
            const topShare = topTwo.reduce((sum, item) => sum + item.time, 0) / totalTime;
            if (topShare >= 0.5) {
                insights.push('Over 50% of your time went to just two questions. Consider time limits per question.');
            }
        }

        return insights.slice(0, 4);
    },

    /**
     * Summarize attempts for a question type (overall).
     * @param {Object[]} attempts
     * @returns {Object|null}
     */
    summarizeTypeAttempts(attempts) {
        if (!Array.isArray(attempts) || attempts.length === 0) return null;

        let totalScore = 0;
        let totalMarks = 0;
        let totalCorrect = 0;
        let totalIncorrect = 0;
        let totalUnattempted = 0;
        let totalTime = 0;

        let bestScore = null;

        attempts.forEach(attempt => {
            const score = typeof attempt.score === 'number' ? attempt.score : 0;
            const maxMarks = typeof attempt.totalMarks === 'number' ? attempt.totalMarks : 0;
            const correct = typeof attempt.correct === 'number' ? attempt.correct : 0;
            const incorrect = typeof attempt.incorrect === 'number' ? attempt.incorrect : 0;
            const unattempted = typeof attempt.unattempted === 'number' ? attempt.unattempted : 0;
            const time = typeof attempt.totalTime === 'number' ? attempt.totalTime : 0;

            totalScore += score;
            totalMarks += maxMarks;
            totalCorrect += correct;
            totalIncorrect += incorrect;
            totalUnattempted += unattempted;
            totalTime += time;

            if (!bestScore || score > bestScore.score) {
                bestScore = { score, totalMarks: maxMarks };
            }
        });

        const totalQuestions = totalCorrect + totalIncorrect + totalUnattempted;
        const accuracy = totalQuestions > 0
            ? Math.round((totalCorrect / totalQuestions) * 100)
            : 0;
        const avgScore = attempts.length > 0 ? totalScore / attempts.length : 0;
        const avgTimePerQuestion = totalQuestions > 0 ? totalTime / totalQuestions : 0;

        return {
            attempts: attempts.length,
            avgScore,
            accuracy,
            avgTimePerQuestion,
            bestScore
        };
    },

    /**
     * Compute tag-level accuracy across attempts.
     * @param {Object[]} attempts
     * @returns {Array}
     */
    getTagInsights(attempts) {
        if (!Array.isArray(attempts) || attempts.length === 0) return [];

        const tagStats = {};

        attempts.forEach(attempt => {
            attempt.questions?.forEach(question => {
                const tags = Array.isArray(question.tags) ? question.tags : [];
                if (tags.length === 0) return;

                const answer = question.userAnswer;
                const hasAnswer = answer !== null && answer !== undefined && answer !== '';
                if (!hasAnswer) return;

                const isCorrect = answer === question.correctAnswer;
                tags.forEach(tag => {
                    if (!tagStats[tag]) {
                        tagStats[tag] = { attempted: 0, correct: 0 };
                    }
                    tagStats[tag].attempted += 1;
                    if (isCorrect) {
                        tagStats[tag].correct += 1;
                    }
                });
            });
        });

        const insights = Object.entries(tagStats)
            .map(([tag, stats]) => ({
                tag,
                attempted: stats.attempted,
                accuracy: stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0
            }))
            .filter(item => item.attempted >= 5)
            .sort((a, b) => a.accuracy - b.accuracy);

        return insights;
    }
};

// Make Analytics available globally for browser
if (typeof window !== 'undefined') {
    window.Analytics = Analytics;
}

// Export for Node.js/testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Analytics;
}

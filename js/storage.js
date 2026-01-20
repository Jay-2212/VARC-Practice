/**
 * Storage Manager for VARC Practice App
 * Handles all localStorage operations for persisting test state
 */

const StorageManager = {
    // Storage keys
    KEYS: {
        TEST_STATE: 'varc_test_state',
        USER_ANSWERS: 'varc_user_answers',
        QUESTION_STATUS: 'varc_question_status',
        TIMER_STATE: 'varc_timer_state',
        TEST_COMPLETED: 'varc_test_completed',
        CURRENT_QUESTION: 'varc_current_question',
        QUESTIONS_DATA: 'varc_questions_data',
        USER_NAME: 'varc_user_name'
    },

    /**
     * Save data to localStorage
     * @param {string} key - Storage key
     * @param {any} data - Data to store
     */
    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    },

    /**
     * Load data from localStorage
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} - Stored data or default value
     */
    load(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return defaultValue;
        }
    },

    /**
     * Remove data from localStorage
     * @param {string} key - Storage key
     */
    remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Error removing from localStorage:', e);
            return false;
        }
    },

    /**
     * Clear all VARC-related data from localStorage
     */
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            this.remove(key);
        });
    },

    // User Answers Management
    /**
     * Save user's answer for a question
     * @param {number} questionIndex - Question index
     * @param {string|number} answer - User's answer
     */
    saveAnswer(questionIndex, answer) {
        const answers = this.load(this.KEYS.USER_ANSWERS, {});
        answers[questionIndex] = answer;
        this.save(this.KEYS.USER_ANSWERS, answers);
    },

    /**
     * Get user's answer for a question
     * @param {number} questionIndex - Question index
     * @returns {string|number|null} - User's answer or null
     */
    getAnswer(questionIndex) {
        const answers = this.load(this.KEYS.USER_ANSWERS, {});
        return answers[questionIndex] !== undefined ? answers[questionIndex] : null;
    },

    /**
     * Get all user answers
     * @returns {Object} - All answers
     */
    getAllAnswers() {
        return this.load(this.KEYS.USER_ANSWERS, {});
    },

    /**
     * Clear answer for a question
     * @param {number} questionIndex - Question index
     */
    clearAnswer(questionIndex) {
        const answers = this.load(this.KEYS.USER_ANSWERS, {});
        delete answers[questionIndex];
        this.save(this.KEYS.USER_ANSWERS, answers);
    },

    // Question Status Management
    /**
     * Question status types:
     * - 'not-visited': Never visited
     * - 'not-answered': Visited but not answered
     * - 'answered': Answered
     * - 'review': Marked for review (not answered)
     * - 'review-answered': Marked for review (answered)
     */

    /**
     * Save question status
     * @param {number} questionIndex - Question index
     * @param {string} status - Question status
     */
    saveQuestionStatus(questionIndex, status) {
        const statuses = this.load(this.KEYS.QUESTION_STATUS, {});
        statuses[questionIndex] = status;
        this.save(this.KEYS.QUESTION_STATUS, statuses);
    },

    /**
     * Get question status
     * @param {number} questionIndex - Question index
     * @returns {string} - Question status
     */
    getQuestionStatus(questionIndex) {
        const statuses = this.load(this.KEYS.QUESTION_STATUS, {});
        return statuses[questionIndex] || 'not-visited';
    },

    /**
     * Get all question statuses
     * @returns {Object} - All statuses
     */
    getAllStatuses() {
        return this.load(this.KEYS.QUESTION_STATUS, {});
    },

    /**
     * Initialize question statuses for all questions
     * @param {number} totalQuestions - Total number of questions
     */
    initializeStatuses(totalQuestions) {
        const existingStatuses = this.load(this.KEYS.QUESTION_STATUS, {});
        if (Object.keys(existingStatuses).length === 0) {
            const statuses = {};
            for (let i = 0; i < totalQuestions; i++) {
                statuses[i] = 'not-visited';
            }
            this.save(this.KEYS.QUESTION_STATUS, statuses);
        }
    },

    // Timer Management
    /**
     * Save timer state
     * @param {number} remainingSeconds - Remaining time in seconds
     */
    saveTimerState(remainingSeconds) {
        this.save(this.KEYS.TIMER_STATE, {
            remainingSeconds,
            savedAt: Date.now()
        });
    },

    /**
     * Get timer state with elapsed time adjustment
     * @returns {number|null} - Remaining seconds or null
     */
    getTimerState() {
        const timerState = this.load(this.KEYS.TIMER_STATE, null);
        if (!timerState) return null;

        // Calculate elapsed time since last save
        const elapsedSeconds = Math.floor((Date.now() - timerState.savedAt) / 1000);
        const adjustedTime = timerState.remainingSeconds - elapsedSeconds;

        return Math.max(0, adjustedTime);
    },

    // Current Question Management
    /**
     * Save current question index
     * @param {number} index - Question index
     */
    saveCurrentQuestion(index) {
        this.save(this.KEYS.CURRENT_QUESTION, index);
    },

    /**
     * Get current question index
     * @returns {number} - Current question index
     */
    getCurrentQuestion() {
        return this.load(this.KEYS.CURRENT_QUESTION, 0);
    },

    // Test Completion Management
    /**
     * Mark test as completed
     */
    markTestCompleted() {
        this.save(this.KEYS.TEST_COMPLETED, true);
    },

    /**
     * Check if test is completed
     * @returns {boolean}
     */
    isTestCompleted() {
        return this.load(this.KEYS.TEST_COMPLETED, false);
    },

    // Questions Data Management
    /**
     * Save questions data
     * @param {Array} questions - Questions array
     */
    saveQuestionsData(questions) {
        this.save(this.KEYS.QUESTIONS_DATA, questions);
    },

    /**
     * Get questions data
     * @returns {Array} - Questions array
     */
    getQuestionsData() {
        return this.load(this.KEYS.QUESTIONS_DATA, []);
    },

    // User Name Management
    /**
     * Save user name
     * @param {string} name - User name
     */
    saveUserName(name) {
        this.save(this.KEYS.USER_NAME, name);
    },

    /**
     * Get user name
     * @returns {string} - User name
     */
    getUserName() {
        return this.load(this.KEYS.USER_NAME, 'Student');
    },

    // Statistics
    /**
     * Get test statistics
     * @param {number} totalQuestions - Total number of questions
     * @returns {Object} - Statistics object
     */
    getStatistics(totalQuestions) {
        const statuses = this.getAllStatuses();
        const stats = {
            answered: 0,
            notAnswered: 0,
            notVisited: 0,
            review: 0,
            reviewAnswered: 0
        };

        for (let i = 0; i < totalQuestions; i++) {
            const status = statuses[i] || 'not-visited';
            switch (status) {
                case 'answered':
                    stats.answered++;
                    break;
                case 'not-answered':
                    stats.notAnswered++;
                    break;
                case 'not-visited':
                    stats.notVisited++;
                    break;
                case 'review':
                    stats.review++;
                    break;
                case 'review-answered':
                    stats.reviewAnswered++;
                    break;
            }
        }

        return stats;
    },

    /**
     * Export all test data for backup
     * @returns {Object} - Complete test state
     */
    exportTestData() {
        return {
            answers: this.getAllAnswers(),
            statuses: this.getAllStatuses(),
            currentQuestion: this.getCurrentQuestion(),
            timerState: this.load(this.KEYS.TIMER_STATE, null),
            testCompleted: this.isTestCompleted(),
            userName: this.getUserName(),
            exportedAt: new Date().toISOString()
        };
    },

    /**
     * Import test data from backup
     * @param {Object} data - Test data to import
     */
    importTestData(data) {
        if (data.answers) this.save(this.KEYS.USER_ANSWERS, data.answers);
        if (data.statuses) this.save(this.KEYS.QUESTION_STATUS, data.statuses);
        if (data.currentQuestion !== undefined) this.saveCurrentQuestion(data.currentQuestion);
        if (data.timerState) this.save(this.KEYS.TIMER_STATE, data.timerState);
        if (data.testCompleted) this.save(this.KEYS.TEST_COMPLETED, data.testCompleted);
        if (data.userName) this.saveUserName(data.userName);
    },

    /**
     * Reset test (clear answers and statuses but keep questions)
     * @param {number} totalQuestions - Total number of questions
     */
    resetTest(totalQuestions) {
        this.remove(this.KEYS.USER_ANSWERS);
        this.remove(this.KEYS.QUESTION_STATUS);
        this.remove(this.KEYS.TIMER_STATE);
        this.remove(this.KEYS.TEST_COMPLETED);
        this.remove(this.KEYS.CURRENT_QUESTION);
        this.initializeStatuses(totalQuestions);
    }
};

// Make StorageManager available globally
window.StorageManager = StorageManager;

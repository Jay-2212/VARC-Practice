/**
 * Results Page
 * Displays test results with time analysis and attempt comparison
 */

class ResultsPage {
    constructor() {
        this.rcSetId = null;
        this.currentAttempt = null;
        this.previousAttempts = [];
        this.init();
    }

    init() {
        // Get RC set ID from query parameter
        const urlParams = new URLSearchParams(window.location.search);
        this.rcSetId = parseInt(urlParams.get('setId'));

        if (!this.rcSetId) {
            alert('No RC set specified');
            window.location.href = 'index.html';
            return;
        }

        // Load attempt data
        this.loadAttemptData();
        
        // Display results
        this.displayResults();
    }

    /**
     * Load attempt data from URL parameters
     */
    loadAttemptData() {
        const urlParams = new URLSearchParams(window.location.search);
        const attemptDataStr = urlParams.get('attempt');
        
        if (attemptDataStr) {
            try {
                this.currentAttempt = JSON.parse(decodeURIComponent(attemptDataStr));
            } catch (e) {
                console.error('Failed to parse attempt data:', e);
            }
        }

        // Load previous attempts
        this.previousAttempts = StorageManager.getRCSetAttempts(this.rcSetId);
    }

    /**
     * Display all results
     */
    displayResults() {
        if (!this.currentAttempt) {
            alert('No attempt data found');
            window.location.href = 'index.html';
            return;
        }

        // Update RC set title
        document.getElementById('rc-set-title').textContent = `RC Set ${this.rcSetId}`;

        // Display score
        this.displayScore();

        // Display time analysis
        this.displayTimeAnalysis();

        // Display attempt comparison if there are previous attempts
        if (this.previousAttempts.length > 1) {
            this.displayAttemptComparison();
        }

        // Display answer review
        this.displayAnswerReview();
    }

    /**
     * Display score section
     */
    displayScore() {
        const { score, totalMarks, correct, incorrect, unattempted } = this.currentAttempt;

        document.getElementById('score-value').textContent = score;
        document.getElementById('score-total').textContent = `out of ${totalMarks}`;
        document.getElementById('correct-count').textContent = correct;
        document.getElementById('incorrect-count').textContent = incorrect;
        document.getElementById('unattempted-count').textContent = unattempted;
    }

    /**
     * Display time analysis section
     */
    displayTimeAnalysis() {
        const { totalTime, questionTimes, questions } = this.currentAttempt;

        // Display total time
        document.getElementById('total-time').textContent = this.formatTime(totalTime);

        // Calculate and display average time
        const avgTime = totalTime / questions.length;
        document.getElementById('avg-time').textContent = this.formatTime(Math.round(avgTime));

        // Display question time breakdown
        const breakdownContainer = document.getElementById('questions-time-breakdown');
        breakdownContainer.innerHTML = questions.map((q, index) => {
            const time = questionTimes[index] || 0;
            const answer = q.userAnswer;
            const isCorrect = answer === q.correctAnswer;
            const isUnattempted = answer === null || answer === undefined;
            
            let statusClass = 'unattempted';
            let statusIcon = 'fa-minus-circle';
            if (!isUnattempted) {
                statusClass = isCorrect ? 'correct' : 'incorrect';
                statusIcon = isCorrect ? 'fa-check-circle' : 'fa-times-circle';
            }

            return `
                <div class="question-time-item ${statusClass}">
                    <div class="question-label">
                        <span class="question-status ${statusClass}">
                            <i class="fas ${statusIcon}"></i>
                        </span>
                        <span>Question ${index + 1}</span>
                    </div>
                    <div class="question-time">${this.formatTime(Math.round(time / 1000))}</div>
                </div>
            `;
        }).join('');
    }

    /**
     * Display attempt comparison section
     */
    displayAttemptComparison() {
        const comparisonSection = document.getElementById('comparison-section');
        comparisonSection.style.display = 'block';

        const attemptsList = document.getElementById('attempts-list');
        attemptsList.innerHTML = this.previousAttempts.map((attempt, index) => {
            const isCurrent = index === this.previousAttempts.length - 1;
            const date = new Date(attempt.timestamp);
            
            return `
                <div class="attempt-item ${isCurrent ? 'current' : ''}">
                    <div class="attempt-info">
                        <div class="attempt-number">
                            ${isCurrent ? '<i class="fas fa-star"></i> ' : ''}
                            Attempt ${index + 1}
                            ${isCurrent ? ' (Current)' : ''}
                        </div>
                        <div class="attempt-date">${date.toLocaleString()}</div>
                    </div>
                    <div class="attempt-stats">
                        <div class="attempt-stat">
                            <div class="attempt-stat-label">Score</div>
                            <div class="attempt-stat-value">${attempt.score}/${attempt.totalMarks}</div>
                        </div>
                        <div class="attempt-stat">
                            <div class="attempt-stat-label">Time</div>
                            <div class="attempt-stat-value">${this.formatTime(attempt.totalTime)}</div>
                        </div>
                        <div class="attempt-stat">
                            <div class="attempt-stat-label">Correct</div>
                            <div class="attempt-stat-value" style="color: #4caf50">${attempt.correct}</div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    /**
     * Get answer text from options array
     */
    getAnswerText(options, answerIndex, defaultText = 'N/A') {
        if (
            !options ||
            typeof answerIndex !== 'number' ||
            !Number.isInteger(answerIndex) ||
            answerIndex < 0 ||
            answerIndex >= options.length
        ) {
            return defaultText;
        }

        return options[answerIndex];
    }

    /**
     * Display answer review section with explanations
     */
    displayAnswerReview() {
        const reviewList = document.getElementById('review-list');

        // Safely handle missing review container
        if (!reviewList) {
            return;
        }

        // Validate currentAttempt and questions before mapping
        if (
            !this.currentAttempt ||
            !Array.isArray(this.currentAttempt.questions)
        ) {
            reviewList.innerHTML = '<p>No questions available for review.</p>';
            return;
        }

        const { questions } = this.currentAttempt;
        reviewList.innerHTML = questions.map((q, index) => {
            const userAnswer = q.userAnswer;
            const isCorrect = userAnswer === q.correctAnswer;
            const isUnattempted = userAnswer === null || userAnswer === undefined;

            let statusClass = 'unattempted';
            let statusIcon = 'fa-minus-circle';
            let statusText = 'Unattempted';

            if (!isUnattempted) {
                statusClass = isCorrect ? 'correct' : 'incorrect';
                statusIcon = isCorrect ? 'fa-check-circle' : 'fa-times-circle';
                statusText = isCorrect ? 'Correct' : 'Incorrect';
            }

            // Get option text for display
            const userAnswerText = isUnattempted 
                ? 'Not answered'
                : this.getAnswerText(q.options, userAnswer, 'Not answered');
            const correctAnswerText = this.getAnswerText(q.options, q.correctAnswer, 'N/A');

            return `
                <div class="review-item ${statusClass}">
                    <div class="review-question-header">
                        <div class="review-question-number">
                            <span class="review-status-icon ${statusClass}">
                                <i class="fas ${statusIcon}"></i>
                            </span>
                            <span class="review-question-label">Question ${index + 1}</span>
                            <span class="review-status-badge ${statusClass}">${statusText}</span>
                        </div>
                    </div>
                    <div class="review-question-text">${q.question || 'Question text not available'}</div>
                    
                    <div class="review-answers">
                        ${!isUnattempted ? `
                            <div class="review-answer-item ${isCorrect ? '' : 'user-incorrect'}">
                                <strong>Your Answer:</strong> ${userAnswerText}
                            </div>
                        ` : `
                            <div class="review-answer-item user-unattempted">
                                <strong>Your Answer:</strong> ${userAnswerText}
                            </div>
                        `}
                        ${!isCorrect ? `
                            <div class="review-answer-item correct-answer">
                                <strong>Correct Answer:</strong> ${correctAnswerText}
                            </div>
                        ` : ''}
                    </div>

                    ${q.explanation ? `
                        <div class="review-explanation">
                            <div class="explanation-header">
                                <i class="fas fa-lightbulb"></i>
                                <strong>Explanation:</strong>
                            </div>
                            <div class="explanation-text">${q.explanation}</div>
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
    }

    /**
     * Format time in seconds to MM:SS
     */
    formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
}

/**
 * Navigate back to selection page
 */
function goToSelection() {
    // Clear current attempt data
    StorageManager.clearSelectedRCSet();
    StorageManager.resetTest(0);
    window.location.href = 'index.html';
}

/**
 * Reattempt the same RC set
 */
function reattempt() {
    const urlParams = new URLSearchParams(window.location.search);
    const setId = parseInt(urlParams.get('setId'));
    
    if (setId) {
        // Reset test state
        StorageManager.resetTest(0);
        StorageManager.saveSelectedRCSet(setId);
        window.location.href = 'quiz.html';
    } else {
        window.location.href = 'index.html';
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.resultsPage = new ResultsPage();
});

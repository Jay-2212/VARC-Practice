/**
 * RC Set Selection Page
 * Displays all available RC sets and allows users to select one
 */

class RCSetSelection {
    constructor() {
        this.rcSets = [];
        this.init();
    }

    async init() {
        await this.loadRCSets();
        this.renderRCSets();
    }

    /**
     * Load questions and organize them into RC sets
     */
    async loadRCSets() {
        // Load questions from data file
        try {
            const response = await fetch('data/rc-passages.json');
            if (response.ok) {
                const data = await response.json();
                const questions = data.questions || [];
                this.rcSets = this.organizeIntoRCSets(questions);
            } else {
                console.warn('Unable to load questions');
                this.rcSets = [];
            }
        } catch (e) {
            console.warn('Error loading questions:', e);
            this.rcSets = [];
        }
    }

    /**
     * Organize questions into RC sets based on passageId
     */
    organizeIntoRCSets(questions) {
        const setsMap = new Map();
        
        questions.forEach(question => {
            const passageId = question.passageId;
            if (!setsMap.has(passageId)) {
                setsMap.set(passageId, {
                    id: passageId,
                    questions: [],
                    passage: question.passage
                });
            }
            setsMap.get(passageId).questions.push(question);
        });

        return Array.from(setsMap.values());
    }

    /**
     * Render RC sets grid
     * Displays all available RC sets with safety checks
     */
    renderRCSets() {
        const grid = document.getElementById('rc-sets-grid');
        
        if (!grid) {
            console.error('RC sets grid container not found');
            return;
        }

        if (!Utils.isValidArray(this.rcSets)) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <h2>No RC Sets Available</h2>
                    <p>Please add questions to get started</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.rcSets.map(rcSet => {
            // Safely get attempts with validation
            const attempts = StorageManager.getRCSetAttempts(rcSet.id) || [];
            const attemptCount = attempts.length;
            const bestScore = this.getBestScore(attempts);
            const hasAttempts = attemptCount > 0;

            return `
                <div class="rc-set-card" data-set-id="${rcSet.id}">
                    ${hasAttempts ? `<span class="attempt-indicator ${attemptCount > 1 ? 'multiple' : ''}">${attemptCount}</span>` : ''}
                    <div class="rc-set-header">
                        <div class="rc-set-number">RC Set ${rcSet.id}</div>
                        <div class="rc-set-badge ${hasAttempts ? 'status-completed' : 'status-new'}">
                            ${hasAttempts ? 'Completed' : 'New'}
                        </div>
                    </div>
                    <div class="rc-set-info">
                        <p><i class="fas fa-question-circle"></i> ${rcSet.questions.length} Questions</p>
                        <p><i class="fas fa-book"></i> 1 Passage</p>
                        ${hasAttempts ? `<p><i class="fas fa-redo"></i> ${attemptCount} Attempt${attemptCount > 1 ? 's' : ''}</p>` : ''}
                    </div>
                    ${hasAttempts && bestScore !== null ? `
                        <div class="best-score">
                            <i class="fas fa-trophy"></i> Best Score: ${bestScore.score}/${bestScore.total}
                        </div>
                    ` : ''}
                    <button class="rc-set-action ${hasAttempts ? 'reattempt' : ''}" onclick="selectRCSet(${rcSet.id})">
                        <i class="fas fa-play"></i> ${hasAttempts ? 'Reattempt' : 'Start'}
                    </button>
                </div>
            `;
        }).join('');
    }

    /**
     * Get best score from attempts
     * Handles empty arrays and validates data structure
     * @param {Array} attempts - Array of attempt objects
     * @returns {Object|null} - Best score object or null
     */
    getBestScore(attempts) {
        // Validate attempts is a valid array with elements
        if (!Utils.isValidArray(attempts)) {
            return null;
        }
        
        // Find best attempt with validation
        const bestAttempt = attempts.reduce((best, current) => {
            // Validate both attempts have score property
            const bestScore = typeof best.score === 'number' ? best.score : -Infinity;
            const currentScore = typeof current.score === 'number' ? current.score : -Infinity;
            return currentScore > bestScore ? current : best;
        }, attempts[0]);

        // Validate bestAttempt has required properties
        if (!bestAttempt || typeof bestAttempt.score !== 'number') {
            return null;
        }

        return {
            score: bestAttempt.score,
            total: bestAttempt.totalMarks || 0
        };
    }
}

/**
 * Navigate to RC set quiz
 */
function selectRCSet(setId) {
    // Store selected RC set
    StorageManager.saveSelectedRCSet(setId);
    // Navigate to quiz page
    window.location.href = 'quiz.html';
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.rcSelection = new RCSetSelection();
});

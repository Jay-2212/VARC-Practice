/**
 * Para Completion Set Selection Page
 * Displays all available Para Completion sets and allows users to select one
 * 
 * Features:
 * - Organizes questions into sets by setId
 * - Shows attempt history for each set
 * - Displays best score achieved
 * - Allows reattempting completed sets
 * 
 * Data Flow:
 * 1. Loads questions from para-completion.json
 * 2. Groups questions by setId
 * 3. Retrieves attempt history from localStorage
 * 4. Renders cards with set information
 * 5. On selection, saves set ID and question type, navigates to quiz
 * 
 * @class ParaCompletionSelection
 */

class ParaCompletionSelection {
    constructor() {
        this.sets = [];
        this.init();
    }

    async init() {
        await this.loadSets();
        this.renderSets();
    }

    /**
     * Load questions and organize them into sets
     */
    async loadSets() {
        // Load questions from data file
        try {
            const response = await fetch('../data/para-completion.json');
            if (response.ok) {
                const data = await response.json();
                const questions = data.questions || [];
                this.sets = this.organizeIntoSets(questions);
            } else {
                console.warn('Unable to load para completion questions');
                this.sets = [];
            }
        } catch (e) {
            console.warn('Error loading para completion questions:', e);
            this.sets = [];
        }
    }

    /**
     * Organize questions into sets based on setId
     */
    organizeIntoSets(questions) {
        const setsMap = new Map();
        
        questions.forEach(question => {
            const setId = question.setId;
            if (!setsMap.has(setId)) {
                setsMap.set(setId, {
                    id: setId,
                    questions: []
                });
            }
            setsMap.get(setId).questions.push(question);
        });

        return Array.from(setsMap.values());
    }

    /**
     * Render sets grid
     * Displays all available sets with safety checks
     */
    renderSets() {
        const grid = document.getElementById('sets-grid');
        
        if (!grid) {
            console.error('Sets grid container not found');
            return;
        }

        if (!Utils.isValidArray(this.sets)) {
            grid.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book-open"></i>
                    <h2>No Para Completion Sets Available</h2>
                    <p>Please add questions to get started</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.sets.map(set => {
            // Safely get attempts with validation
            const attempts = StorageManager.getSetAttempts('para-completion', set.id) || [];
            const attemptCount = attempts.length;
            const bestScore = this.getBestScore(attempts);
            const hasAttempts = attemptCount > 0;

            return `
                <div class="rc-set-card" data-set-id="${set.id}">
                    ${hasAttempts ? `<span class="attempt-indicator ${attemptCount > 1 ? 'multiple' : ''}">${attemptCount}</span>` : ''}
                    <div class="rc-set-header">
                        <div class="rc-set-number">PC Set ${set.id}</div>
                        <div class="rc-set-badge ${hasAttempts ? 'status-completed' : 'status-new'}">
                            ${hasAttempts ? 'Completed' : 'New'}
                        </div>
                    </div>
                    <div class="rc-set-info">
                        <p><i class="fas fa-question-circle"></i> ${set.questions.length} Questions</p>
                        ${hasAttempts ? `<p><i class="fas fa-redo"></i> ${attemptCount} Attempt${attemptCount > 1 ? 's' : ''}</p>` : ''}
                    </div>
                    ${hasAttempts && bestScore !== null ? `
                        <div class="best-score">
                            <i class="fas fa-trophy"></i> Best Score: ${bestScore.score}/${bestScore.total}
                        </div>
                    ` : ''}
                    <button class="rc-set-action ${hasAttempts ? 'reattempt' : ''}" onclick="selectSet('para-completion', ${set.id})">
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
 * Navigate to set quiz
 */
function selectSet(type, setId) {
    // Store selected set and question type
    StorageManager.saveSelectedSet(type, setId);
    // Navigate to quiz page
    window.location.href = 'quiz.html';
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.paraCompletionSelection = new ParaCompletionSelection();
});

/**
 * Landing Page Logic
 * Handles navigation to different question type selection pages
 * 
 * This module manages:
 * - Question type selection
 * - Navigation to appropriate selection pages
 * - Storing selected question type in localStorage
 * 
 * @namespace LandingPage
 */

/**
 * Handle question type selection
 * Saves the selected type to localStorage and navigates to appropriate selection page
 * 
 * @param {string} type - Question type: 'rc', 'para-completion', or 'para-summary'
 */
function selectQuestionType(type) {
    // Save selected question type to localStorage
    localStorage.setItem('varc_question_type', type);
    
    // Navigate to appropriate selection page
    switch(type) {
        case 'rc':
            window.location.href = 'pages/rc-selection.html';
            break;
        case 'para-completion':
            window.location.href = 'pages/para-completion-selection.html';
            break;
        case 'para-summary':
            window.location.href = 'pages/para-summary-selection.html';
            break;
        default:
            console.error('Invalid question type:', type);
    }
}

/**
 * Render overall analytics below the question type cards
 */
function renderOverallAnalytics() {
    const grid = document.getElementById('overall-analytics-grid');
    const insightsContainer = document.getElementById('overall-insights');

    if (!grid) return;

    const types = [
        { type: 'rc', label: 'Reading Comprehension' },
        { type: 'para-completion', label: 'Para Completion' },
        { type: 'para-summary', label: 'Para Summary' }
    ];

    grid.innerHTML = types.map(({ type, label }) => {
        const attempts = StorageManager.getAllSetAttempts(type);
        const summary = Analytics.summarizeTypeAttempts(attempts);

        if (!summary) {
            return `
                <div class="overall-analytics-card">
                    <div class="overall-card-title">${label}</div>
                    <div class="overall-card-stat">Attempts <span>0</span></div>
                    <div class="overall-card-stat">Avg Accuracy <span>0%</span></div>
                    <div class="overall-card-stat">Avg Time/Q <span>0s</span></div>
                    <div class="overall-card-stat">Best Score <span>-</span></div>
                </div>
            `;
        }

        const avgScoreDisplay = Number.isFinite(summary.avgScore)
            ? (Number.isInteger(summary.avgScore) ? summary.avgScore : summary.avgScore.toFixed(1))
            : 0;
        const avgTimeDisplay = Utils.formatDuration(summary.avgTimePerQuestion || 0);
        const bestScoreDisplay = summary.bestScore
            ? `${summary.bestScore.score}/${summary.bestScore.totalMarks}`
            : '-';

        return `
            <div class="overall-analytics-card">
                <div class="overall-card-title">${label}</div>
                <div class="overall-card-stat">Attempts <span>${summary.attempts}</span></div>
                <div class="overall-card-stat">Avg Score <span>${avgScoreDisplay}</span></div>
                <div class="overall-card-stat">Avg Accuracy <span>${summary.accuracy}%</span></div>
                <div class="overall-card-stat">Avg Time/Q <span>${avgTimeDisplay}</span></div>
                <div class="overall-card-stat">Best Score <span>${bestScoreDisplay}</span></div>
            </div>
        `;
    }).join('');

    if (!insightsContainer) return;

    const allAttempts = [
        ...StorageManager.getAllSetAttempts('rc'),
        ...StorageManager.getAllSetAttempts('para-completion'),
        ...StorageManager.getAllSetAttempts('para-summary')
    ];

    if (allAttempts.length === 0) {
        insightsContainer.innerHTML = '<div class="overall-insight-item">Complete a set to unlock analytics insights.</div>';
        return;
    }

    const tagInsights = Analytics.getTagInsights(allAttempts);
    if (tagInsights.length > 0) {
        const topTags = tagInsights.slice(0, 3);
        insightsContainer.innerHTML = topTags.map(tag => (
            `<div class="overall-insight-item">Lowest accuracy in "${Utils.sanitizeHTML(tag.tag)}" (${tag.accuracy}% over ${tag.attempted} attempts).</div>`
        )).join('');
    } else {
        insightsContainer.innerHTML = '<div class="overall-insight-item">Question-type insights appear once tagged questions are added.</div>';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderOverallAnalytics();
});

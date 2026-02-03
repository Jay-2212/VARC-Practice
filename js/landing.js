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

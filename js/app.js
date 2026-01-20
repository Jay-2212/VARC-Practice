/**
 * VARC Practice App - Main Application
 * CAT Mock Test Interface for Reading Comprehension Practice
 */

class VARCApp {
    constructor() {
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.timerInterval = null;
        this.remainingTime = 40 * 60; // 40 minutes in seconds
        this.isReviewMode = false;
        this.isTestSubmitted = false;

        // DOM Elements
        this.elements = {};

        // Initialize the app
        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        this.cacheElements();
        this.bindEvents();
        await this.loadQuestions();
        this.restoreState();
        this.renderPalette();
        this.loadQuestion(this.currentQuestionIndex);
        this.updateStatistics();

        if (!this.isTestSubmitted) {
            this.startTimer();
        }

        // Set user name
        const userName = StorageManager.getUserName();
        this.elements.userName.textContent = userName;
    }

    /**
     * Cache DOM elements for better performance
     */
    cacheElements() {
        this.elements = {
            // Question display
            passageSection: document.getElementById('passage-section'),
            passageText: document.getElementById('passage-text'),
            questionSection: document.getElementById('question-section'),
            questionNumber: document.getElementById('question-number'),
            questionText: document.getElementById('question-text'),
            optionsContainer: document.getElementById('options-container'),
            questionType: document.getElementById('question-type'),
            positiveMarks: document.getElementById('positive-marks'),
            negativeMarks: document.getElementById('negative-marks'),

            // Palette
            paletteBtns: document.getElementById('palette-btns'),
            sidebarPaletteBtns: document.getElementById('sidebar-palette-btns'),

            // Statistics
            answeredCount: document.getElementById('answered-count'),
            unansweredCount: document.getElementById('unanswered-count'),
            notvisitedCount: document.getElementById('notvisited-count'),
            reviewCount: document.getElementById('review-count'),
            reviewAnsweredCount: document.getElementById('review-answered-count'),

            // Sidebar statistics
            sidebarAnsweredCount: document.getElementById('sidebar-answered-count'),
            sidebarUnansweredCount: document.getElementById('sidebar-unanswered-count'),
            sidebarNotvisitedCount: document.getElementById('sidebar-notvisited-count'),
            sidebarReviewCount: document.getElementById('sidebar-review-count'),
            sidebarReviewAnsweredCount: document.getElementById('sidebar-review-answered-count'),

            // Timer
            timeLeft: document.getElementById('time-left'),

            // Buttons
            saveNextBtn: document.getElementById('save-next-btn'),
            reviewBtn: document.getElementById('review-btn'),
            clearBtn: document.getElementById('clear-btn'),
            submitBtn: document.getElementById('submit-btn'),
            sidebarSubmitBtn: document.getElementById('sidebar-submit-btn'),

            // Side panel
            sidePanel: document.getElementById('side-panel'),
            iconAngle: document.querySelector('.icon-angle'),

            // Sidebar
            sidebar: document.getElementById('sidebar'),
            overlay: document.querySelector('.overlay'),
            sidebarToggle: document.getElementById('sidebar-toggle'),
            dismiss: document.getElementById('dismiss'),

            // User
            userName: document.getElementById('user-name'),

            // Modals
            submitModal: document.getElementById('submit-modal'),
            resultsModal: document.getElementById('results-modal'),
            questionPaperModal: document.getElementById('question-paper-modal'),

            // Modal elements
            modalAnswered: document.getElementById('modal-answered'),
            modalUnanswered: document.getElementById('modal-unanswered'),
            modalReview: document.getElementById('modal-review'),
            modalNotvisited: document.getElementById('modal-notvisited'),
            resultsBody: document.getElementById('results-body'),
            questionPaperBody: document.getElementById('question-paper-body'),

            // Fullscreen
            fullscreenBtn: document.getElementById('fullscreen-btn')
        };
    }

    /**
     * Bind event listeners
     */
    bindEvents() {
        // Navigation buttons
        this.elements.saveNextBtn.addEventListener('click', () => this.saveAndNext());
        this.elements.reviewBtn.addEventListener('click', () => this.markForReviewAndNext());
        this.elements.clearBtn.addEventListener('click', () => this.clearResponse());

        // Submit buttons
        this.elements.submitBtn.addEventListener('click', () => this.showSubmitModal());
        this.elements.sidebarSubmitBtn?.addEventListener('click', () => this.showSubmitModal());

        // Side panel toggle
        document.querySelector('.icon-angle-con')?.addEventListener('click', () => this.toggleSidePanel());

        // Mobile sidebar
        this.elements.sidebarToggle?.addEventListener('click', () => this.toggleSidebar());
        this.elements.dismiss?.addEventListener('click', () => this.closeSidebar());
        this.elements.overlay?.addEventListener('click', () => this.closeSidebar());

        // Submit modal buttons
        document.getElementById('confirm-submit-btn')?.addEventListener('click', () => this.submitTest());
        document.getElementById('cancel-submit-btn')?.addEventListener('click', () => this.hideSubmitModal());

        // Results modal buttons
        document.getElementById('review-answers-btn')?.addEventListener('click', () => this.enterReviewMode());
        document.getElementById('close-results-btn')?.addEventListener('click', () => this.hideResultsModal());

        // Question paper modal
        document.getElementById('question-paper-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showQuestionPaperModal();
        });
        document.getElementById('close-qp-modal')?.addEventListener('click', () => this.hideQuestionPaperModal());
        document.getElementById('close-qp-btn')?.addEventListener('click', () => this.hideQuestionPaperModal());

        // Fullscreen
        this.elements.fullscreenBtn?.addEventListener('click', () => this.toggleFullscreen());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));

        // Before unload - save state
        window.addEventListener('beforeunload', () => this.saveState());
    }

    /**
     * Load questions from data file or localStorage
     */
    async loadQuestions() {
        // First check if questions are in localStorage
        const storedQuestions = StorageManager.getQuestionsData();

        if (storedQuestions && storedQuestions.length > 0) {
            this.questions = storedQuestions;
            return;
        }

        // Load from data file
        try {
            const response = await fetch('data/questions.json');
            if (response.ok) {
                const data = await response.json();
                this.questions = data.questions || [];
                StorageManager.saveQuestionsData(this.questions);
            } else {
                // Load sample questions
                console.warn(
                    `Unable to load questions from "data/questions.json" (status: ${response.status}). Falling back to sample questions.`
                );
                this.questions = this.getSampleQuestions();
                StorageManager.saveQuestionsData(this.questions);
            }
        } catch (e) {
            console.warn(
                'An error occurred while loading "data/questions.json". Falling back to sample questions.',
                e
            );
            this.questions = this.getSampleQuestions();
            StorageManager.saveQuestionsData(this.questions);
        }

        // Initialize statuses for all questions
        StorageManager.initializeStatuses(this.questions.length);
    }

    /**
     * Get sample questions for demonstration
     */
    getSampleQuestions() {
        return [
            {
                id: 1,
                passageId: 1,
                passage: `<p>Neither Marx, nor Mill, nor Nietzsche find the present condition of society to be advantageous to human flourishing. For each, the present condition of human affairs reduces human beings to something less than fully human ... Marx explains this demise of human flourishing as 'alienation', Mill as; 'conformity', and Nietzsche as; 'slave morality'.</p>

<p>Karl Marx suggests that man is a "species-being, not only in that he practically and theoretically makes as his object his own species as well as that of things, but also in that as a present and living species he considers himself to be a universal and consequently free being". Marx believes that humans become less than fully human when they are unable to own the object of his labour and no longer view that labour as a manifestation of his life. Marx defined this decline of human flourishing as 'alienation'. He proposed that mankind (as workers) have become detached from their labour and consequent products of that labour, suggesting that the labour exerted is used to gain wages. He argues that the labour is simply a representation of earnings, we are alienated from work, it is external to us rather than being a part of our nature. Therefore, we are not fulfilled by our work, just our desire to gain wages. He states that money has alienated us from the products of our labour since it "reduces all human qualities to quantitative, interchangeable values devoid of any specific value".</p>

<p>Marx's theory of alienation could be considered similar to Fredrich Nietzsche's idea of slave morality. Nietzsche's view that humans have become something less than fully human due to their need to be oppressed can be compared to Marx's view that humans are no longer accepting their labour to be a manifestation of their lives. In Marx's case, the labour and need for a wage can be seen as the oppressor causing humans to disassociate themselves from work and the products made due to a feeling of labour being a means to an end. These theories differ from John Stuart Mill who suggested that it is society's willingness to conform as a whole, rather than the individual's need for financial and moral stability for the demise of human flourishing.</p>

<p>Mill believed that there is a danger of conformity, suggesting that there is a risk of society becoming identical and monocultural. Aristotle agrees with this view, stating that conformity stifles genius, whereas non-conformity can promote individuality and excellence due to people discovering new ways of living that could benefit society.</p>`,
                question: `"In Marx's case, the labour and need for a wage can be seen as the oppressor causing humans to disassociate themselves from work and the products made due to a feeling of labour being a means to an end." The given statement best serves to`,
                type: 'MCQ',
                options: [
                    'highlight how Marx\'s alienation is conceptually the same as Nietzsche\'s slave morality in describing modern society',
                    'illustrate the concept of alienation by explaining how the need for wages can be disadvantageous to human flourishing.',
                    'explain the manner in which alienation manifests in a capitalistic society, emphasising how the present condition of society is disadvantageous to human flourishing',
                    'illuminate the convergence between the notions of Marx\'s alienation and Nietzsche\'s slave morality.'
                ],
                correctAnswer: 2,
                explanation: 'The statement explains how alienation manifests in capitalistic society where labor becomes merely a means to earn wages, disconnecting workers from their work and its products.',
                marks: { positive: 3, negative: 1 }
            },
            {
                id: 2,
                passageId: 1,
                passage: null, // Uses same passage as question 1
                question: `According to the passage, which of the following would Marx most likely agree with?`,
                type: 'MCQ',
                options: [
                    'Workers find fulfillment primarily through the wages they earn from their labor.',
                    'The quantification of labor through money diminishes the inherent value of human work.',
                    'Conformity in society is the primary cause of human alienation.',
                    'Slave morality and alienation are identical concepts with different names.'
                ],
                correctAnswer: 1,
                explanation: 'Marx argues that money "reduces all human qualities to quantitative, interchangeable values devoid of any specific value," showing that quantification through money diminishes the value of work.',
                marks: { positive: 3, negative: 1 }
            },
            {
                id: 3,
                passageId: 1,
                passage: null,
                question: `The passage suggests that Mill's view of conformity differs from Marx's alienation in that:`,
                type: 'MCQ',
                options: [
                    'Mill focuses on individual financial needs while Marx focuses on societal pressure.',
                    'Mill emphasizes society\'s collective tendency to conform, while Marx emphasizes individual separation from labor.',
                    'Mill believes conformity is beneficial, while Marx sees alienation as harmful.',
                    'Mill\'s conformity leads to human flourishing, while Marx\'s alienation does not.'
                ],
                correctAnswer: 1,
                explanation: 'The passage states that Mill\'s theories "differ from" Marx\'s because Mill "suggested that it is society\'s willingness to conform as a whole, rather than the individual\'s need" that causes the demise of human flourishing.',
                marks: { positive: 3, negative: 1 }
            },
            {
                id: 4,
                passageId: 1,
                passage: null,
                question: `Based on the passage, what is the relationship between Aristotle's view and Mill's concept of conformity?`,
                type: 'MCQ',
                options: [
                    'Aristotle completely rejects Mill\'s notion of conformity as irrelevant to human flourishing.',
                    'Aristotle supports Mill\'s view by arguing that conformity suppresses individual genius.',
                    'Aristotle believes conformity is necessary for societal stability, unlike Mill.',
                    'Aristotle and Mill have opposing views on whether non-conformity benefits society.'
                ],
                correctAnswer: 1,
                explanation: 'The passage states "Aristotle agrees with this view, stating that conformity stifles genius, whereas non-conformity can promote individuality and excellence."',
                marks: { positive: 3, negative: 1 }
            },
            {
                id: 5,
                passageId: 2,
                passage: `<p>The relationship between economic growth and environmental sustainability has been one of the most contentious debates in contemporary policy circles. Traditional economic models have long assumed that growth and environmental protection are mutually exclusive goals—that pursuing one necessarily comes at the expense of the other. This assumption has shaped decades of policy decisions, often resulting in environmental degradation being treated as an acceptable cost of economic progress.</p>

<p>However, recent research has begun to challenge this conventional wisdom. The concept of "green growth" suggests that economic expansion and environmental stewardship can be complementary rather than contradictory. Proponents argue that investments in clean technology, renewable energy, and sustainable infrastructure can drive economic growth while simultaneously reducing environmental impact. They point to examples of countries that have managed to decouple economic growth from carbon emissions, at least partially.</p>

<p>Critics of the green growth narrative remain skeptical. They argue that the evidence for absolute decoupling—where economic growth continues while environmental impact decreases in absolute terms—remains limited and often relies on accounting tricks such as outsourcing pollution-intensive production to other countries. Furthermore, they contend that the focus on green growth distracts from more fundamental questions about whether infinite growth is possible or desirable on a finite planet.</p>

<p>The debate has significant implications for policy. If green growth is achievable, then policies can focus on redirecting economic activity toward sustainable sectors without requiring fundamental changes to consumption patterns or economic structures. If critics are correct, however, more radical transformations may be necessary, potentially including steady-state economics or even degrowth in wealthy nations.</p>`,
                question: `The primary purpose of the passage is to:`,
                type: 'MCQ',
                options: [
                    'Advocate for the adoption of green growth policies worldwide.',
                    'Present contrasting perspectives on the relationship between economic growth and environmental sustainability.',
                    'Prove that traditional economic models are fundamentally flawed.',
                    'Argue that degrowth is the only solution to environmental challenges.'
                ],
                correctAnswer: 1,
                explanation: 'The passage presents both the green growth perspective and its critics without explicitly taking sides, making its primary purpose to present contrasting viewpoints.',
                marks: { positive: 3, negative: 1 }
            },
            {
                id: 6,
                passageId: 2,
                passage: null,
                question: `According to the passage, critics of green growth argue that:`,
                type: 'MCQ',
                options: [
                    'Clean technology investments are too expensive to be practical.',
                    'Evidence for absolute decoupling is limited and may involve statistical manipulation.',
                    'Environmental protection should always take priority over economic growth.',
                    'Renewable energy cannot drive meaningful economic expansion.'
                ],
                correctAnswer: 1,
                explanation: 'The passage states that critics argue "evidence for absolute decoupling... remains limited and often relies on accounting tricks such as outsourcing pollution-intensive production to other countries."',
                marks: { positive: 3, negative: 1 }
            },
            {
                id: 7,
                passageId: 2,
                passage: null,
                question: `The term "absolute decoupling" as used in the passage most likely refers to:`,
                type: 'MCQ',
                options: [
                    'Complete separation of economic policy from environmental concerns.',
                    'Economic growth occurring while total environmental impact decreases.',
                    'Transferring polluting industries to developing nations.',
                    'Achieving zero carbon emissions while maintaining current GDP levels.'
                ],
                correctAnswer: 1,
                explanation: 'The passage defines absolute decoupling as "where economic growth continues while environmental impact decreases in absolute terms."',
                marks: { positive: 3, negative: 1 }
            },
            {
                id: 8,
                passageId: 2,
                passage: null,
                question: `The passage implies that traditional economic models:`,
                type: 'MCQ',
                options: [
                    'Were deliberately designed to harm the environment.',
                    'Have been completely abandoned by modern economists.',
                    'Treated environmental costs as acceptable trade-offs for growth.',
                    'Successfully balanced economic and environmental goals.'
                ],
                correctAnswer: 2,
                explanation: 'The passage states that traditional models resulted in "environmental degradation being treated as an acceptable cost of economic progress."',
                marks: { positive: 3, negative: 1 }
            }
        ];
    }

    /**
     * Restore state from localStorage
     */
    restoreState() {
        // Check if test is completed
        this.isTestSubmitted = StorageManager.isTestCompleted();

        if (this.isTestSubmitted) {
            this.isReviewMode = true;
        }

        // Restore current question
        this.currentQuestionIndex = StorageManager.getCurrentQuestion();

        // Restore timer
        const savedTime = StorageManager.getTimerState();
        if (savedTime !== null && !this.isTestSubmitted) {
            this.remainingTime = savedTime;
        }
    }

    /**
     * Save current state to localStorage
     */
    saveState() {
        StorageManager.saveCurrentQuestion(this.currentQuestionIndex);
        if (!this.isTestSubmitted) {
            StorageManager.saveTimerState(this.remainingTime);
        }
    }

    /**
     * Render the question palette
     */
    renderPalette() {
        const paletteHTML = this.questions.map((q, index) => {
            const status = StorageManager.getQuestionStatus(index);
            const isCurrent = index === this.currentQuestionIndex;
            return `<div class="palette-btn ${status} ${isCurrent ? 'current' : ''}"
                         data-index="${index}">${index + 1}</div>`;
        }).join('');

        if (this.elements.paletteBtns) {
            this.elements.paletteBtns.innerHTML = paletteHTML;
            this.elements.paletteBtns.querySelectorAll('.palette-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const index = parseInt(btn.dataset.index);
                    this.navigateToQuestion(index);
                });
            });
        }

        if (this.elements.sidebarPaletteBtns) {
            this.elements.sidebarPaletteBtns.innerHTML = paletteHTML;
            this.elements.sidebarPaletteBtns.querySelectorAll('.palette-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const index = parseInt(btn.dataset.index);
                    this.navigateToQuestion(index);
                    this.closeSidebar();
                });
            });
        }
    }

    /**
     * Update palette button status
     */
    updatePaletteButton(index) {
        const status = StorageManager.getQuestionStatus(index);

        // Update main palette
        const mainBtn = this.elements.paletteBtns?.querySelector(`[data-index="${index}"]`);
        if (mainBtn) {
            mainBtn.className = `palette-btn ${status} ${index === this.currentQuestionIndex ? 'current' : ''}`;
        }

        // Update sidebar palette
        const sidebarBtn = this.elements.sidebarPaletteBtns?.querySelector(`[data-index="${index}"]`);
        if (sidebarBtn) {
            sidebarBtn.className = `palette-btn ${status} ${index === this.currentQuestionIndex ? 'current' : ''}`;
        }
    }

    /**
     * Update current indicator on all palette buttons
     */
    updateCurrentIndicator() {
        // Remove current class from all buttons
        document.querySelectorAll('.palette-btn').forEach(btn => {
            btn.classList.remove('current');
        });

        // Add current class to current question buttons
        document.querySelectorAll(`[data-index="${this.currentQuestionIndex}"]`).forEach(btn => {
            btn.classList.add('current');
        });
    }

    /**
     * Load and display a question
     */
    loadQuestion(index) {
        if (index < 0 || index >= this.questions.length) return;

        const question = this.questions[index];
        this.currentQuestionIndex = index;

        // Update question number
        this.elements.questionNumber.textContent = index + 1;

        // Update marks
        this.elements.positiveMarks.textContent = question.marks?.positive || 3;
        this.elements.negativeMarks.textContent = question.marks?.negative || 1;
        this.elements.questionType.textContent = question.type || 'MCQ';

        // Load passage
        this.loadPassage(question);

        // Load question text
        this.elements.questionText.innerHTML = `<p>${question.question}</p>`;

        // Load options
        this.loadOptions(question, index);

        // Update status if not visited before
        const currentStatus = StorageManager.getQuestionStatus(index);
        if (currentStatus === 'not-visited') {
            StorageManager.saveQuestionStatus(index, 'not-answered');
            this.updatePaletteButton(index);
            this.updateStatistics();
        }

        // Update current indicator
        this.updateCurrentIndicator();

        // Save current position
        StorageManager.saveCurrentQuestion(index);
    }

    /**
     * Load passage for the question
     */
    loadPassage(question) {
        // Check if this question has its own passage or shares with previous
        let passage = question.passage;

        if (!passage && question.passageId) {
            // Find the passage from the first question with this passageId
            const passageQuestion = this.questions.find(q => q.passageId === question.passageId && q.passage);
            if (passageQuestion) {
                passage = passageQuestion.passage;
            }
        }

        if (passage) {
            this.elements.passageSection.style.display = 'block';
            this.elements.passageText.innerHTML = passage;
            document.querySelector('.question-content').classList.remove('no-passage');
        } else {
            this.elements.passageSection.style.display = 'none';
            document.querySelector('.question-content').classList.add('no-passage');
        }
    }

    /**
     * Load options for MCQ question
     */
    loadOptions(question, index) {
        const savedAnswer = StorageManager.getAnswer(index);

        if (question.type === 'TITA') {
            // Type In The Answer
            this.elements.optionsContainer.innerHTML = `
                <div class="tita-container">
                    <input type="text" class="tita-input" id="tita-answer"
                           placeholder="Type your answer here"
                           value="${savedAnswer || ''}"
                           ${this.isReviewMode ? 'disabled' : ''}>
                </div>
            `;

            if (!this.isReviewMode) {
                document.getElementById('tita-answer')?.addEventListener('input', (e) => {
                    this.handleTITAInput(e.target.value);
                });
            }

            // Show correct answer in review mode
            if (this.isReviewMode && question.correctAnswer !== undefined) {
                this.elements.optionsContainer.innerHTML += `
                    <div class="explanation">
                        <strong>Correct Answer:</strong> ${question.correctAnswer}<br>
                        ${question.explanation ? `<strong>Explanation:</strong> ${question.explanation}` : ''}
                    </div>
                `;
            }
        } else {
            // Multiple Choice Question
            const optionsHTML = question.options.map((option, optIndex) => {
                const isSelected = savedAnswer === optIndex;
                const isCorrect = question.correctAnswer === optIndex;

                let optionClass = 'option';
                if (isSelected) optionClass += ' selected';

                if (this.isReviewMode) {
                    if (isCorrect) optionClass += ' correct';
                    else if (isSelected && !isCorrect) optionClass += ' incorrect';
                }

                return `
                    <div class="${optionClass}" data-index="${optIndex}">
                        <input type="radio" name="option" id="option-${optIndex}"
                               ${isSelected ? 'checked' : ''}
                               ${this.isReviewMode ? 'disabled' : ''}>
                        <label for="option-${optIndex}">${option}</label>
                    </div>
                `;
            }).join('');

            this.elements.optionsContainer.innerHTML = optionsHTML;

            // Add click handlers for options
            if (!this.isReviewMode) {
                this.elements.optionsContainer.querySelectorAll('.option').forEach(opt => {
                    opt.addEventListener('click', () => {
                        const optIndex = parseInt(opt.dataset.index);
                        this.selectOption(optIndex);
                    });
                });
            }

            // Show explanation in review mode
            if (this.isReviewMode && question.explanation) {
                this.elements.optionsContainer.innerHTML += `
                    <div class="explanation">
                        <strong>Explanation:</strong> ${question.explanation}
                    </div>
                `;
            }
        }

        // Add review mode class to question section
        if (this.isReviewMode) {
            this.elements.questionSection.classList.add('review-mode');
        } else {
            this.elements.questionSection.classList.remove('review-mode');
        }
    }

    /**
     * Handle option selection
     */
    selectOption(optIndex) {
        if (this.isReviewMode) return;

        // Update visual selection
        this.elements.optionsContainer.querySelectorAll('.option').forEach((opt, i) => {
            if (i === optIndex) {
                opt.classList.add('selected');
                opt.querySelector('input').checked = true;
            } else {
                opt.classList.remove('selected');
                opt.querySelector('input').checked = false;
            }
        });

        // Save answer
        StorageManager.saveAnswer(this.currentQuestionIndex, optIndex);

        // Update status
        const currentStatus = StorageManager.getQuestionStatus(this.currentQuestionIndex);
        if (currentStatus === 'review') {
            StorageManager.saveQuestionStatus(this.currentQuestionIndex, 'review-answered');
        } else {
            StorageManager.saveQuestionStatus(this.currentQuestionIndex, 'answered');
        }

        this.updatePaletteButton(this.currentQuestionIndex);
        this.updateStatistics();
    }

    /**
     * Handle TITA input
     */
    handleTITAInput(value) {
        if (this.isReviewMode) return;

        if (value.trim()) {
            StorageManager.saveAnswer(this.currentQuestionIndex, value.trim());
            const currentStatus = StorageManager.getQuestionStatus(this.currentQuestionIndex);
            if (currentStatus === 'review') {
                StorageManager.saveQuestionStatus(this.currentQuestionIndex, 'review-answered');
            } else {
                StorageManager.saveQuestionStatus(this.currentQuestionIndex, 'answered');
            }
        } else {
            StorageManager.clearAnswer(this.currentQuestionIndex);
            const currentStatus = StorageManager.getQuestionStatus(this.currentQuestionIndex);
            if (currentStatus === 'review-answered') {
                StorageManager.saveQuestionStatus(this.currentQuestionIndex, 'review');
            } else {
                StorageManager.saveQuestionStatus(this.currentQuestionIndex, 'not-answered');
            }
        }

        this.updatePaletteButton(this.currentQuestionIndex);
        this.updateStatistics();
    }

    /**
     * Navigate to a specific question
     */
    navigateToQuestion(index) {
        if (index < 0 || index >= this.questions.length) return;
        this.loadQuestion(index);
    }

    /**
     * Save current answer and go to next question
     */
    saveAndNext() {
        // Move to next question
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.loadQuestion(this.currentQuestionIndex + 1);
        }
    }

    /**
     * Mark current question for review and go to next
     */
    markForReviewAndNext() {
        const currentStatus = StorageManager.getQuestionStatus(this.currentQuestionIndex);
        const hasAnswer = StorageManager.getAnswer(this.currentQuestionIndex) !== null;

        if (hasAnswer) {
            StorageManager.saveQuestionStatus(this.currentQuestionIndex, 'review-answered');
        } else {
            StorageManager.saveQuestionStatus(this.currentQuestionIndex, 'review');
        }

        this.updatePaletteButton(this.currentQuestionIndex);
        this.updateStatistics();

        // Move to next question
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.loadQuestion(this.currentQuestionIndex + 1);
        }
    }

    /**
     * Clear response for current question
     */
    clearResponse() {
        if (this.isReviewMode) return;

        StorageManager.clearAnswer(this.currentQuestionIndex);

        const currentStatus = StorageManager.getQuestionStatus(this.currentQuestionIndex);
        if (currentStatus === 'review-answered') {
            StorageManager.saveQuestionStatus(this.currentQuestionIndex, 'review');
        } else {
            StorageManager.saveQuestionStatus(this.currentQuestionIndex, 'not-answered');
        }

        // Reload options to clear visual selection
        this.loadOptions(this.questions[this.currentQuestionIndex], this.currentQuestionIndex);
        this.updatePaletteButton(this.currentQuestionIndex);
        this.updateStatistics();
    }

    /**
     * Update statistics display
     */
    updateStatistics() {
        const stats = StorageManager.getStatistics(this.questions.length);

        // Main panel
        if (this.elements.answeredCount) this.elements.answeredCount.textContent = stats.answered;
        if (this.elements.unansweredCount) this.elements.unansweredCount.textContent = stats.notAnswered;
        if (this.elements.notvisitedCount) this.elements.notvisitedCount.textContent = stats.notVisited;
        if (this.elements.reviewCount) this.elements.reviewCount.textContent = stats.review;
        if (this.elements.reviewAnsweredCount) this.elements.reviewAnsweredCount.textContent = stats.reviewAnswered;

        // Sidebar
        if (this.elements.sidebarAnsweredCount) this.elements.sidebarAnsweredCount.textContent = stats.answered;
        if (this.elements.sidebarUnansweredCount) this.elements.sidebarUnansweredCount.textContent = stats.notAnswered;
        if (this.elements.sidebarNotvisitedCount) this.elements.sidebarNotvisitedCount.textContent = stats.notVisited;
        if (this.elements.sidebarReviewCount) this.elements.sidebarReviewCount.textContent = stats.review;
        if (this.elements.sidebarReviewAnsweredCount) this.elements.sidebarReviewAnsweredCount.textContent = stats.reviewAnswered;
    }

    /**
     * Start the timer
     */
    startTimer() {
        if (this.timerInterval) clearInterval(this.timerInterval);

        this.updateTimerDisplay();

        this.timerInterval = setInterval(() => {
            this.remainingTime--;
            this.updateTimerDisplay();
            StorageManager.saveTimerState(this.remainingTime);

            if (this.remainingTime <= 0) {
                this.submitTest();
            }
        }, 1000);
    }

    /**
     * Stop the timer
     */
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }

    /**
     * Update timer display
     */
    updateTimerDisplay() {
        const minutes = Math.floor(this.remainingTime / 60);
        const seconds = this.remainingTime % 60;
        this.elements.timeLeft.textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // Add warning color when time is low
        if (this.remainingTime <= 300) { // 5 minutes
            this.elements.timeLeft.style.color = '#f44336';
        }
    }

    /**
     * Show submit confirmation modal
     */
    showSubmitModal() {
        const stats = StorageManager.getStatistics(this.questions.length);

        this.elements.modalAnswered.textContent = stats.answered + stats.reviewAnswered;
        this.elements.modalUnanswered.textContent = stats.notAnswered + stats.review;
        this.elements.modalReview.textContent = stats.review + stats.reviewAnswered;
        this.elements.modalNotvisited.textContent = stats.notVisited;

        this.elements.submitModal.classList.add('active');
    }

    /**
     * Hide submit confirmation modal
     */
    hideSubmitModal() {
        this.elements.submitModal.classList.remove('active');
    }

    /**
     * Submit the test
     */
    submitTest() {
        this.stopTimer();
        this.hideSubmitModal();

        // Calculate results
        const results = this.calculateResults();

        // Mark test as completed
        StorageManager.markTestCompleted();
        this.isTestSubmitted = true;

        // Show results
        this.showResults(results);
    }

    /**
     * Calculate test results
     */
    calculateResults() {
        let correct = 0;
        let incorrect = 0;
        let unattempted = 0;
        let totalMarks = 0;
        let maxMarks = 0;

        this.questions.forEach((question, index) => {
            const userAnswer = StorageManager.getAnswer(index);
            const positiveMarks = question.marks?.positive || 3;
            const negativeMarks = question.marks?.negative || 1;

            maxMarks += positiveMarks;

            if (userAnswer === null || userAnswer === undefined) {
                unattempted++;
            } else if (userAnswer === question.correctAnswer) {
                correct++;
                totalMarks += positiveMarks;
            } else {
                incorrect++;
                totalMarks -= negativeMarks;
            }
        });

        return {
            correct,
            incorrect,
            unattempted,
            totalMarks: Math.max(0, totalMarks),
            maxMarks,
            totalQuestions: this.questions.length,
            percentage: maxMarks > 0 ? Math.round((Math.max(0, totalMarks) / maxMarks) * 100) : 0
        };
    }

    /**
     * Show results modal
     */
    showResults(results) {
        this.elements.resultsBody.innerHTML = `
            <div class="results-score">
                <div class="score">${results.totalMarks}</div>
                <div class="total">out of ${results.maxMarks}</div>
            </div>
            <div class="results-details">
                <div class="item">
                    <div class="value" style="color: #4caf50">${results.correct}</div>
                    <div class="label">Correct</div>
                </div>
                <div class="item">
                    <div class="value" style="color: #f44336">${results.incorrect}</div>
                    <div class="label">Incorrect</div>
                </div>
                <div class="item">
                    <div class="value" style="color: #9e9e9e">${results.unattempted}</div>
                    <div class="label">Unattempted</div>
                </div>
                <div class="item">
                    <div class="value" style="color: #0288d1">${results.percentage}%</div>
                    <div class="label">Percentage</div>
                </div>
            </div>
        `;

        this.elements.resultsModal.classList.add('active');
    }

    /**
     * Hide results modal
     */
    hideResultsModal() {
        this.elements.resultsModal.classList.remove('active');
    }

    /**
     * Enter review mode to see correct answers
     */
    enterReviewMode() {
        this.isReviewMode = true;
        this.hideResultsModal();

        // Reload current question with review mode enabled
        this.loadQuestion(this.currentQuestionIndex);

        // Update button text
        this.elements.saveNextBtn.textContent = 'Next';
        this.elements.reviewBtn.style.display = 'none';
        this.elements.clearBtn.style.display = 'none';
        this.elements.submitBtn.textContent = 'Reset Test';
        this.elements.submitBtn.onclick = () => this.resetTest();
    }

    /**
     * Show custom confirmation modal before resetting the test
     */
    showResetConfirmModal() {
        if (!this.elements.resetConfirmModal) {
            const overlay = document.createElement('div');
            overlay.id = 'resetConfirmModal';
            overlay.className = 'modal-overlay';

            const dialog = document.createElement('div');
            dialog.className = 'modal-dialog';

            const message = document.createElement('p');
            message.textContent = 'Are you sure you want to reset the test? All your answers will be cleared.';

            const actions = document.createElement('div');
            actions.className = 'modal-actions';

            const cancelBtn = document.createElement('button');
            cancelBtn.type = 'button';
            cancelBtn.textContent = 'Cancel';

            const confirmBtn = document.createElement('button');
            confirmBtn.type = 'button';
            confirmBtn.textContent = 'Reset Test';

            actions.appendChild(cancelBtn);
            actions.appendChild(confirmBtn);

            dialog.appendChild(message);
            dialog.appendChild(actions);
            overlay.appendChild(dialog);

            document.body.appendChild(overlay);

            this.elements.resetConfirmModal = overlay;
            this.elements.resetConfirmCancelBtn = cancelBtn;
            this.elements.resetConfirmConfirmBtn = confirmBtn;

            cancelBtn.addEventListener('click', () => this.hideResetConfirmModal());
            overlay.addEventListener('click', (event) => {
                if (event.target === overlay) {
                    this.hideResetConfirmModal();
                }
            });
            confirmBtn.addEventListener('click', () => {
                this.hideResetConfirmModal();
                this.performTestReset();
            });
        }

        this.elements.resetConfirmModal.style.display = 'block';
    }

    /**
     * Hide reset confirmation modal
     */
    hideResetConfirmModal() {
        if (this.elements.resetConfirmModal) {
            this.elements.resetConfirmModal.style.display = 'none';
        }
    }

    /**
     * Perform the actual test reset after confirmation
     */
    performTestReset() {
        StorageManager.resetTest(this.questions.length);
        this.isTestSubmitted = false;
        this.isReviewMode = false;
        this.remainingTime = 40 * 60;
        this.currentQuestionIndex = 0;

        // Reset UI
        this.elements.saveNextBtn.textContent = 'Save & Next';
        this.elements.reviewBtn.style.display = '';
        this.elements.clearBtn.style.display = '';
        this.elements.submitBtn.textContent = 'Submit';
        this.elements.submitBtn.onclick = () => this.showSubmitModal();
        this.elements.timeLeft.style.color = '';

        // Reload
        this.renderPalette();
        this.loadQuestion(0);
        this.updateStatistics();
        this.startTimer();
    }

    /**
     * Reset the test
     */
    resetTest() {
        this.showResetConfirmModal();
    }

    /**
     * Get a truncated preview of question text without cutting words abruptly.
     * @param {string} text
     * @param {number} maxLength
     * @returns {string}
     */
    truncateQuestionText(text, maxLength = 140) {
        if (typeof text !== 'string') {
            return '';
        }
        if (text.length <= maxLength) {
            return text;
        }
        const truncated = text.slice(0, maxLength);
        const lastSpaceIndex = truncated.lastIndexOf(' ');
        if (lastSpaceIndex > 0) {
            return truncated.slice(0, lastSpaceIndex) + '...';
        }
        return truncated + '...';
    }

    /**
     * Show question paper modal
     */
    showQuestionPaperModal() {
        const questionsHTML = this.questions.map((q, index) => {
            const status = StorageManager.getQuestionStatus(index);
            const preview = this.truncateQuestionText(q.question, 140);
            return `
                <div class="qp-question" data-index="${index}">
                    <span class="qp-question-number">Q${index + 1}.</span>
                    ${preview}
                    <span class="img-button ${status}" style="float: right; width: 24px; height: 24px; font-size: 12px; font-size: 12px;">${index + 1}</span>
                </div>
            `;
        }).join('');

        this.elements.questionPaperBody.innerHTML = questionsHTML;

        // Add click handlers
        this.elements.questionPaperBody.querySelectorAll('.qp-question').forEach(qp => {
            qp.addEventListener('click', () => {
                const index = parseInt(qp.dataset.index);
                this.navigateToQuestion(index);
                this.hideQuestionPaperModal();
            });
        });

        this.elements.questionPaperModal.classList.add('active');
    }

    /**
     * Hide question paper modal
     */
    hideQuestionPaperModal() {
        this.elements.questionPaperModal.classList.remove('active');
    }

    /**
     * Toggle side panel visibility
     */
    toggleSidePanel() {
        this.elements.sidePanel.classList.toggle('collapsed');
        this.elements.iconAngle.classList.toggle('rotated');
    }

    /**
     * Toggle mobile sidebar
     */
    toggleSidebar() {
        this.elements.sidebar.classList.toggle('active');
        this.elements.overlay.classList.toggle('active');
    }

    /**
     * Close mobile sidebar
     */
    closeSidebar() {
        this.elements.sidebar.classList.remove('active');
        this.elements.overlay.classList.remove('active');
    }

    /**
     * Toggle fullscreen
     */
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Error attempting fullscreen:', err);
            });
            this.elements.fullscreenBtn.innerHTML = '<i class="fas fa-compress"></i>';
        } else {
            document.exitFullscreen();
            this.elements.fullscreenBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    }

    /**
     * Handle keyboard shortcuts
     */
    handleKeyPress(e) {
        // Don't handle if typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch (e.key) {
            case 'ArrowRight':
            case 'n':
                this.saveAndNext();
                break;
            case 'ArrowLeft':
            case 'p':
                if (this.currentQuestionIndex > 0) {
                    this.navigateToQuestion(this.currentQuestionIndex - 1);
                }
                break;
            case '1':
            case '2':
            case '3':
            case '4':
                if (!this.isReviewMode) {
                    this.selectOption(parseInt(e.key) - 1);
                }
                break;
            case 'r':
                if (!this.isReviewMode) {
                    this.markForReviewAndNext();
                }
                break;
            case 'c':
                if (!this.isReviewMode) {
                    this.clearResponse();
                }
                break;
        }
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.varcApp = new VARCApp();
});

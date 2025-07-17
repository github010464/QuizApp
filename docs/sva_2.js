/* ---------- GLOBAL VARIABLES ---------- */
let quizData = []; // To store the fetched quiz data
let totalQuestions = 0; // To store the total number of questions
let answeredQuestionsCount = 0; // Tracks the number of questions the user has answered

/* ---------- LOAD QUIZ DATA ---------- */
// Fetches the quiz questions from the 'sva_2.json' file
fetch("sva_2.json") // Changed from QuizApp.json to sva_2.json
    .then((res) => {
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
    })
    .then((data) => {
        quizData = data; // Store the data globally
        totalQuestions = quizData.length; // Set total questions count
        renderQuiz(quizData); // Render the quiz
    })
    .catch((err) => {
        document.getElementById("quizContainer").textContent =
            "Failed to load quiz. Please check the JSON file and console for errors.";
        console.error("Error loading quiz data:", err);
    });

/* ---------- RENDER QUIZ ---------- */
function renderQuiz(data) {
    const container = document.getElementById("quizContainer");
    container.innerHTML = ''; // Clear existing content

    data.forEach((q, qi) => {
        const card = document.createElement("div");
        card.className = "question-card";
        card.dataset.questionIndex = qi;
        card.dataset.answered = "false"; // Initialize as not answered

        // Removed q.prompt from here. Only the question number is displayed.
        card.innerHTML = `
            <p class="question-title">${qi + 1}.</p>
            <ul class="choices"></ul>
            <p class="explanation" hidden></p>
        `;
        const ul = card.querySelector(".choices");

        q.choices.forEach((choiceText, ci) => {
            const li = document.createElement("li");
            li.className = "choice-item"; // A new class for the list item holding the radio button

            const inputId = `q${qi}-c${ci}`; // Unique ID for each radio input

            // Create the radio input element
            const radioInput = document.createElement("input");
            radioInput.type = "radio";
            radioInput.id = inputId;
            radioInput.name = `question-${qi}`; // Group radio buttons for each question
            radioInput.value = ci; // Store the index of the choice
            radioInput.dataset.isCorrect = ci === q.correctIndex; // Store correctness
            radioInput.dataset.cardIndex = qi; // Store card index for handleChoice

            // Create the label for the radio button
            const label = document.createElement("label");
            label.htmlFor = inputId;
            label.textContent = choiceText;

            // Append radio and label to the list item
            li.appendChild(radioInput);
            li.appendChild(label);

            // Add event listener to the radio input (use 'change' event for radios)
            radioInput.addEventListener("change", () => {
                handleChoice(radioInput, card, q);
            });

            ul.appendChild(li); // Append the list item to the choices ul
        });
        container.appendChild(card);
    });
}

/* ---------- HANDLE CHOICE CLICK (now handles radio 'change' event) ---------- */
function handleChoice(selectedRadio, card, q) {
    // If this question has already been answered, don't process it again
    if (card.dataset.answered === "true") {
        return;
    }

    // Mark this specific card as answered
    card.dataset.answered = "true";
    answeredQuestionsCount++; // Increment the global counter for answered questions

    const isCorrect = selectedRadio.dataset.isCorrect === "true";

    // Apply styles directly to the li parent for visual feedback
    const parentLi = selectedRadio.closest('.choice-item'); // Find the parent li
    if (parentLi) {
        parentLi.classList.add(isCorrect ? "correct" : "wrong");
    }

    // You might want to update the icon logic here for radio buttons
    // For simplicity, we'll just show explanation. Icons are less common for radio buttons
    // unless styled heavily. If you want a check/X, you'd add a span next to the label text.

    // If incorrect, highlight the correct answer
    if (!isCorrect) {
        // Find all radio buttons for this question
        const allRadiosInCard = card.querySelectorAll(`input[name="question-${q.seqNo}"]`);
        allRadiosInCard.forEach((radio) => {
            if (radio.dataset.isCorrect === "true") {
                radio.closest('.choice-item').classList.add("correct"); // Apply 'correct' to its parent li
            }
        });
    }

    const expEl = card.querySelector(".explanation");
    expEl.innerHTML = `
        <div class="${
            isCorrect ? "feedback-success" : "feedback-error"
        }" style="margin-bottom: 8px;">
            ${
                isCorrect
                    ? "That's correct! Here's why:"
                    : "Incorrect! Here's the explanation."
            }
        </div>
        <div class="${
            isCorrect ? "explanation-content-success" : "explanation-content-error"
        }">
            ${q.explanation || "No explanation provided."}
        </div>
    `;
    expEl.hidden = false;

    // Logic to show "Try a New Quiz" button if this is the last question AND it's been answered
    const currentQuestionIndex = parseInt(card.dataset.questionIndex);
    if (currentQuestionIndex === totalQuestions - 1) {
        const tryNewQuizBtn = document.getElementById("tryNewQuizBtn");
        setTimeout(() => {
            tryNewQuizBtn.style.display = "block";
            tryNewQuizBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 500);
    }
}

/* ---------- Event Listener for "Try a New Quiz" button ---------- */
document.getElementById("tryNewQuizBtn").addEventListener("click", () => {
    // Check if all questions have been answered
    if (answeredQuestionsCount < totalQuestions) {
        alert("Please answer all questions before trying a new quiz!");
        return; // Stop the function here if not all questions are answered
    }

    // If all questions are answered, proceed to the new quiz (or quiz selection page)
    window.location.href = "index.html"; // Redirect to your main menu or another quiz
});
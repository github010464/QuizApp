/* ---------- GLOBAL VARIABLES ---------- */
let quizData = []; // To store the fetched quiz data
let totalQuestions = 0; // To store the total number of questions
let answeredQuestionsCount = 0; // Tracks the number of questions the user has answered

/* ---------- LOAD QUIZ DATA ---------- */
fetch("QuizApp.json")
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
            "Failed to load quiz.";
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
        // Add a dataset to track if this specific card has been answered
        card.dataset.answered = "false"; // Initialize as not answered
        card.innerHTML = `
            <p class="question-title">${qi + 1}. ${q.prompt}</p>
            <ul class="choices"></ul>
            <p class="explanation" hidden></p>
        `;
        const ul = card.querySelector(".choices");
        q.choices.forEach((choiceText, ci) => {
            const li = document.createElement("li");
            li.className = "choice";
            li.dataset.isCorrect = ci === q.correctIndex;
            li.innerHTML = `<span class="icon"></span><span>${choiceText}</span>`;
            li.addEventListener("click", () => handleChoice(li, card, q));
            ul.appendChild(li);
        });
        container.appendChild(card);
    });
}

/* ---------- HANDLE CHOICE CLICK ---------- */
function handleChoice(li, card, q) {
    // Prevent second click on the same question
    if (card.dataset.answered === "true") return;

    // Mark this specific card as answered
    card.dataset.answered = "true";
    answeredQuestionsCount++; // Increment the global counter for answered questions

    const isCorrect = li.dataset.isCorrect === "true";
    li.classList.add(isCorrect ? "correct" : "wrong");
    li.querySelector(".icon").textContent = isCorrect ? "✓" : "✗";

    // Mark wrong ones (optional visual aid)
    if (!isCorrect) {
        [...card.querySelectorAll(".choice")].forEach((c) => {
            if (c !== li && c.dataset.isCorrect === "true") {
                c.classList.add("correct");
                c.querySelector(".icon").textContent = "✓";
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
    window.location.href = "sva2.html"; // Redirect to your main menu or another quiz
});

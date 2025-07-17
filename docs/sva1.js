/* ---------- GLOBAL VARIABLES ---------- */
let quizData = []; // To store the fetched quiz data
let totalQuestions = 0;
let answeredQuestionsCount = 0;

const QUIZ_COMPLETION_LIMIT = 2;
const QUIZ_COUNT_KEY = "completedQuizCount";
const COMPLETED_QUIZZES_LIST_KEY = "completedQuizPages";

/* ---------- LOAD QUIZ DATA ---------- */
fetch("sva1.json")
    .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
    })
    .then((data) => {
        quizData = shuffleArray(data); // Shuffle questions
        totalQuestions = quizData.length;
        renderQuiz(quizData);
    })
    .catch((err) => {
        document.getElementById("quizContainer").textContent = "Failed to load quiz.";
        console.error("Error loading quiz data:", err);
    });

/* ---------- RENDER QUIZ ---------- */
function renderQuiz(data) {
    const container = document.getElementById("quizContainer");
    container.innerHTML = "";

    data.forEach((q, qi) => {
        const card = document.createElement("div");
        card.className = "question-card";
        card.dataset.questionIndex = qi;
        card.dataset.answered = "false";

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

/* ---------- HANDLE CHOICE ---------- */
function handleChoice(li, card, q) {
    if (card.dataset.answered === "true") return;
    card.dataset.answered = "true";
    answeredQuestionsCount++;

    const isCorrect = li.dataset.isCorrect === "true";
    li.classList.add(isCorrect ? "correct" : "wrong");
    li.querySelector(".icon").textContent = isCorrect ? "✓" : "✗";

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
        <div class="${isCorrect ? "feedback-success" : "feedback-error"}" style="margin-bottom: 8px;">
            ${isCorrect ? "That's correct! Here's why:" : "Incorrect! Here's the explanation."}
        </div>
        <div class="${isCorrect ? "explanation-content-success" : "explanation-content-error"}">
            ${q.explanation || "No explanation provided."}
        </div>
    `;
    expEl.hidden = false;

    if (answeredQuestionsCount === totalQuestions) {
        handleCompletion();
    }
}

/* ---------- HANDLE QUIZ COMPLETION ---------- */
function handleCompletion() {
    const tryBtn = document.getElementById("tryNewQuizBtn");
    let count = parseInt(localStorage.getItem(QUIZ_COUNT_KEY)) || 0;
    count++;
    localStorage.setItem(QUIZ_COUNT_KEY, count);

    if (count >= QUIZ_COMPLETION_LIMIT) {
        tryBtn.style.display = "none";
        const congrats = document.createElement("p");
        congrats.textContent = "🎉 Congratulations! You've completed all available quizzes!";
        congrats.style.textAlign = "center";
        congrats.style.fontSize = "1.2em";
        congrats.style.fontWeight = "bold";
        congrats.style.color = "green";
        document.getElementById("quizContainer").appendChild(congrats);
    } else {
        tryBtn.style.display = "block";
        tryBtn.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
}

/* ---------- SHUFFLE QUESTIONS ---------- */
function shuffleArray(array) {
    let arr = array.slice(); // Copy original array
    for (let i = arr.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/* ---------- TRY NEW QUIZ BUTTON ---------- */
document.getElementById("tryNewQuizBtn").addEventListener("click", () => {
    if (answeredQuestionsCount < totalQuestions) {
        alert("Please answer all questions before trying a new quiz!");
        return;
    }
    window.location.href = "sva2.html"; // Adjust destination if needed
});

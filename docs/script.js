/* ---------- LOAD QUIZ DATA ---------- */
fetch("QuizApp.json")
  .then((res) => res.json())
  .then(renderQuiz)
  .catch((err) => {
    document.getElementById("quizContainer").textContent =
      "Failed to load quiz.";
    console.error(err);
  });

/* ---------- RENDER QUIZ ---------- */
function renderQuiz(data) {
  const container = document.getElementById("quizContainer");
  data.forEach((q, qi) => {
    const card = document.createElement("div");
    card.className = "question-card";
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
  // prevent second click
  if (card.dataset.answered) return;
  card.dataset.answered = "true";

  const isCorrect = li.dataset.isCorrect === "true";
  li.classList.add(isCorrect ? "correct" : "wrong");
  li.querySelector(".icon").textContent = isCorrect ? "✓" : "✗";

  // mark wrong ones (optional visual aid)
  if (!isCorrect) {
    [...card.querySelectorAll(".choice")].forEach((c) => {
      if (c !== li && c.dataset.isCorrect === "true") {
        c.classList.add("correct");
        c.querySelector(".icon").textContent = "✓";
      }
    });
  }

  const expEl = card.querySelector(".explanation");

  // Modify this part:
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
      ${q.explanation || ""}
    </div>
  `;

  expEl.hidden = false;
}

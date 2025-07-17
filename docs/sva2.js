const QUIZ_COMPLETION_LIMIT = 2;
const QUIZ_COUNT_KEY = 'completedQuizCount';

const quizContainer = document.getElementById("quizContainer");
const tryNewQuizBtn = document.getElementById("tryNewQuizBtn");
const congratsMessage = document.getElementById("congratsMessage");

let quizData = [];
let answeredQuestions = 0;

// Load quiz from JSON
fetch("sva2.json")
  .then((response) => response.json())
  .then((data) => {
    quizData = shuffleArray(data);
    renderQuiz();
  })
  .catch((error) => {
    console.error("Failed to load quiz data:", error);
  });

// Shuffle array
function shuffleArray(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

// Render questions
function renderQuiz() {
  quizContainer.innerHTML = "";
  quizData.forEach((question, index) => {
    const card = document.createElement("div");
    card.className = "question-card";

    const questionNumberEl = document.createElement("div");
    questionNumberEl.className = "question-title";
    questionNumberEl.textContent = `Question ${index + 1} of ${quizData.length}`;
    card.appendChild(questionNumberEl);

    const choicesList = document.createElement("ul");
    choicesList.className = "choices";

    question.choices.forEach((choice, choiceIndex) => {
      const choiceItem = document.createElement("li");
      choiceItem.className = "choice-item";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = `question-${index}`;
      input.id = `q${index}-choice${choiceIndex}`;
      input.disabled = false;

      const label = document.createElement("label");
      label.htmlFor = input.id;
      label.textContent = choice;

      choiceItem.appendChild(input);
      choiceItem.appendChild(label);
      choicesList.appendChild(choiceItem);

      input.addEventListener("change", () => {
        handleAnswer(choiceIndex, question.correctIndex, index, choiceItem, question.explanation, choicesList);
      });
    });

    card.appendChild(choicesList);
    quizContainer.appendChild(card);
  });
}

// Handle answer logic
function handleAnswer(selectedIndex, correctIndex, questionIndex, selectedItem, explanationText, choicesList) {
  const allInputs = choicesList.querySelectorAll("input[type='radio']");
  allInputs.forEach((input) => (input.disabled = true));

  const allChoices = choicesList.querySelectorAll(".choice-item");
  allChoices.forEach((item, idx) => {
    item.classList.remove("correct", "wrong");
    if (idx === correctIndex) {
      item.classList.add("correct");
    }
    if (idx === selectedIndex && selectedIndex !== correctIndex) {
      item.classList.add("wrong");
    }
  });

  const feedback = document.createElement("span");
  feedback.className = selectedIndex === correctIndex ? "feedback-success" : "feedback-error";
  feedback.textContent = selectedIndex === correctIndex ? "✅ Correct!" : "❌ Incorrect.";
  choicesList.parentNode.insertBefore(feedback, choicesList);

  // const explanation = document.createElement("div");
  // explanation.className = selectedIndex === correctIndex
  //   ? "explanation-content-success"
  //   : "explanation-content-error";
  // explanation.classList.add("explanation");
  // explanation.textContent = explanationText;
  // choicesList.parentNode.appendChild(explanation);

  // Create a label for the explanation
const explanationLabel = document.createElement("div");
explanationLabel.textContent = "Explanation:";
explanationLabel.style.fontWeight = "bold";
explanationLabel.style.marginTop = "8px";
explanationLabel.style.marginBottom = "4px";

// Create the explanation content
const explanation = document.createElement("div");
explanation.className = selectedIndex === correctIndex
  ? "explanation-content-success"
  : "explanation-content-error";
explanation.classList.add("explanation");
explanation.textContent = explanationText;

// Append label and explanation
choicesList.parentNode.appendChild(explanationLabel);
choicesList.parentNode.appendChild(explanation);


  answeredQuestions++;
  if (answeredQuestions === quizData.length) {
    handleQuizCompletion();
  }
}

// Handle completion counter
function handleQuizCompletion() {
  const completedCount = parseInt(localStorage.getItem(QUIZ_COUNT_KEY)) || 0;
  const newCount = completedCount + 1;
  localStorage.setItem(QUIZ_COUNT_KEY, newCount);

  if (newCount >= QUIZ_COMPLETION_LIMIT) {
    congratsMessage.style.display = "block";
    tryNewQuizBtn.style.display = "none";
  } else {
    tryNewQuizBtn.style.display = "inline-block";
    congratsMessage.style.display = "none";
  }
}

// Restart quiz
tryNewQuizBtn.addEventListener("click", () => {
  quizData = shuffleArray(quizData);
  answeredQuestions = 0;
  tryNewQuizBtn.style.display = "none";
  congratsMessage.style.display = "none";
  renderQuiz();
});

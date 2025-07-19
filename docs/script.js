        /* ---------- GLOBAL VARIABLES ---------- */
        let quizData = []; // To store the fetched quiz data
        let totalQuestions = 0;
        let answeredQuestionsCount = 0;
        let isJson1Format = false; // Flag to determine the JSON format
        let currentQuizFile = "sva1.json"; // Default quiz file

        const QUIZ_COMPLETION_LIMIT = 3;
        const QUIZ_COUNT_KEY = "completedQuizCount";

        const quizContainer = document.getElementById("quizContainer");
        const tryNewQuizBtn = document.getElementById("tryNewQuizBtn");
        const congratsMessage = document.getElementById("congratsMessage");

        /* ---------- HELPER FUNCTION: GET URL PARAMETER ---------- */
        function getUrlParameter(name) {
            name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
            const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
            const results = regex.exec(location.search);
            return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
        }

        /* ---------- LOAD QUIZ DATA ---------- */
        function loadQuiz(filename) {
            // Update the current quiz file
            currentQuizFile = filename;

            fetch(filename)
                .then((res) => {
                    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                    return res.json();
                })
                .then((data) => {
                    // Determine JSON format based on the first question's structure
                    if (data.length > 0) {
                        isJson1Format = data[0].hasOwnProperty('prompt') && data[0].hasOwnProperty('choices') && data[0].hasOwnProperty('correctIndex');
                    } else {
                        isJson1Format = false; // Handle empty quiz data case
                    }
                    quizData = shuffleArray(data); // Shuffle questions
                    totalQuestions = quizData.length;
                    renderQuiz(); // Call renderQuiz to display the loaded quiz
                })
                .catch((err) => {
                    quizContainer.textContent = `Failed to load quiz: ${filename}. Please check the file path and format.`;
                    console.error("Error loading quiz data:", err);
                });
        }

        // Initial load based on URL parameter or default
        const quizParam = getUrlParameter('quiz');
        if (quizParam) {
            loadQuiz(quizParam);
        } else {
            loadQuiz(currentQuizFile); // Load the default quiz if no parameter
        }

        /* ---------- RENDER QUIZ ---------- */
        function renderQuiz() {
            quizContainer.innerHTML = ""; // Clear previous content
            answeredQuestionsCount = 0; // Reset count for a new quiz instance
            tryNewQuizBtn.style.display = "none"; // Hide button until quiz completion
            congratsMessage.style.display = "none"; // Hide congrats message

            quizData.forEach((q, qi) => {
                const card = document.createElement("div");
                card.className = "question-card";
                card.dataset.questionIndex = qi;
                card.dataset.answered = "false"; // Tracks if this specific question has been answered

                const questionTitle = document.createElement("p");
                questionTitle.className = "question-title";
                questionTitle.textContent = `${qi + 1}. ${isJson1Format ? q.prompt : q.question}`;
                card.appendChild(questionTitle);

                const choicesList = document.createElement("ul");
                choicesList.className = isJson1Format ? "choices" : "options"; // Use appropriate class

                if (isJson1Format) {
                    q.choices.forEach((choiceText, ci) => {
                        const li = document.createElement("li");
                        li.className = "choice";
                        li.dataset.isCorrect = ci === q.correctIndex;
                        li.innerHTML = `<span class="icon"></span><span>${choiceText}</span>`;
                        li.addEventListener("click", () => handleAnswer(li, card, q, isJson1Format));
                        choicesList.appendChild(li);
                    });
                } else { // JSON 2 format
                    q.options.forEach((option, oi) => {
                        const choiceItem = document.createElement("li");
                        choiceItem.className = "choice-item";

                        const input = document.createElement("input");
                        input.type = "radio";
                        input.name = `question-${qi}`;
                        input.id = `q${qi}-choice${oi}`;
                        input.disabled = false; // Enable for new quiz

                        const label = document.createElement("label");
                        label.htmlFor = input.id;
                        label.textContent = option.text;

                        choiceItem.appendChild(input);
                        choiceItem.appendChild(label);
                        choicesList.appendChild(choiceItem);

                        // Use a closure to capture current question and choice index
                        choiceItem.addEventListener("click", () => {
                            // Programmatically click the radio button when the li is clicked
                            input.checked = true;
                            handleAnswer(choiceItem, card, q, isJson1Format, oi);
                        });
                    });
                }
                card.appendChild(choicesList);

                const explanationContainer = document.createElement("div");
                explanationContainer.className = "explanation";
                explanationContainer.hidden = true; // Initially hidden
                card.appendChild(explanationContainer);

                quizContainer.appendChild(card);
            });
        }

        /* ---------- HANDLE ANSWER (Unified) ---------- */
        function handleAnswer(selectedElement, card, questionData, isJson1, selectedIndexForJson2 = -1) {
            if (card.dataset.answered === "true") return; // Prevent re-answering
            card.dataset.answered = "true";
            answeredQuestionsCount++;

            let isCorrect;
            let explanationText = questionData.explanation || "No explanation provided.";

            if (isJson1) {
                isCorrect = selectedElement.dataset.isCorrect === "true";
                selectedElement.classList.add(isCorrect ? "correct" : "wrong");
                selectedElement.querySelector(".icon").textContent = isCorrect ? "✓" : "✗";

                // Show correct answer if the selected one was wrong
                if (!isCorrect) {
                    [...card.querySelectorAll(".choice")].forEach((c) => {
                        if (c !== selectedElement && c.dataset.isCorrect === "true") {
                            c.classList.add("correct");
                            c.querySelector(".icon").textContent = "✓";
                        }
                    });
                }
            } else { // JSON 2 format
                const correctOption = questionData.options.find(opt => opt.isCorrect);
                const correctIndex = questionData.options.indexOf(correctOption);
                isCorrect = (selectedIndexForJson2 === correctIndex);

                // Disable all radio buttons for this question
                const allInputs = card.querySelectorAll("input[type='radio']");
                allInputs.forEach((input) => (input.disabled = true));

                // Apply styles to all choices based on correctness
                const allChoices = card.querySelectorAll(".choice-item");
                allChoices.forEach((item, idx) => {
                    item.classList.remove("correct", "wrong"); // Clean up existing classes
                    if (idx === correctIndex) {
                        item.classList.add("correct");
                    }
                    if (idx === selectedIndexForJson2 && selectedIndexForJson2 !== correctIndex) {
                        item.classList.add("wrong");
                    }
                });

                // Prepare feedback and explanation for JSON2
                const explanationLabel = document.createElement("div");
                explanationLabel.className = "explanation-label";
                explanationLabel.textContent = "Explanation:";

                const feedback = document.createElement("div");
                feedback.className = isCorrect ? "feedback-success" : "feedback-error";
                feedback.textContent = isCorrect ? "✅ Correct!" : "❌ Incorrect.";

                const explanationContent = document.createElement("div");
                explanationContent.className = isCorrect ? "explanation-content-success" : "explanation-content-error";
                explanationContent.textContent = explanationText;

                const explanationContainer = card.querySelector(".explanation");
                explanationContainer.innerHTML = ''; // Clear previous content
                explanationContainer.appendChild(feedback);
                explanationContainer.appendChild(explanationLabel);
                explanationContainer.appendChild(explanationContent);
                explanationContainer.hidden = false;
            }

            // Only for JSON 1, explanation is inside the card originally. For JSON 2, it's appended by handleAnswer.
            // So, only update and show explanation if it's the JSON 1 original structure
            if (isJson1) {
                const expEl = card.querySelector(".explanation");
                expEl.innerHTML = `
                    <div class="${isCorrect ? "feedback-success" : "feedback-error"}" style="margin-bottom: 8px;">
                        ${isCorrect ? "That's correct! Here's why:" : "Incorrect! Here's the explanation."}
                    </div>
                    <div class="${isCorrect ? "explanation-content-success" : "explanation-content-error"}">
                        ${explanationText}
                    </div>
                `;
                expEl.hidden = false;
            }

            if (answeredQuestionsCount === totalQuestions) {
                handleCompletion();
            }
        }

        /* ---------- HANDLE COMPLETION ---------- */
        function handleCompletion() {
            const completedCount = parseInt(localStorage.getItem(QUIZ_COUNT_KEY)) || 0;
            const newCount = completedCount + 1;
            localStorage.setItem(QUIZ_COUNT_KEY, newCount);

            if (newCount >= QUIZ_COMPLETION_LIMIT) {
                congratsMessage.style.display = "block";
                tryNewQuizBtn.style.display = "none"; // Hide button if limit reached
            } else {
                tryNewQuizBtn.style.display = "block"; // Show button if not reached
                congratsMessage.style.display = "none";
                tryNewQuizBtn.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
        }

        /* ---------- SHUFFLE QUESTIONS ---------- */
        function shuffleArray(array) {
            let arr = array.slice(); // Create a shallow copy to avoid modifying original array
            for (let i = arr.length - 1; i > 0; i--) {
                let j = Math.floor(Math.random() * (i + 1));
                [arr[i], arr[j]] = [arr[j], arr[i]]; // ES6 destructuring for swap
            }
            return arr;
        }

        /* ---------- TRY NEW QUIZ BUTTON ---------- */
        tryNewQuizBtn.addEventListener("click", () => {
            if (answeredQuestionsCount < totalQuestions) {
                alert("Please answer all questions before trying a new quiz!");
                return;
            }
            // To load a new quiz (e.g., from a different JSON file or re-shuffle current)
            // For now, it reloads the *same* quiz file, reshuffled.
            // If you had multiple quiz files (e.g., sva1.json, sva2.json, sva3.json),
            // you'd add logic here to cycle through them or let the user choose.
            // Example: To cycle to sva2.json after sva1.json:
            // if (currentQuizFile === "sva1.json") {
            //     loadQuiz("sva2.json");
            // } else {
            //     loadQuiz("sva1.json"); // Or another default
            // }

            // For now, re-load the current quiz file (which reshuffles)
            loadQuiz(currentQuizFile);
            window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top
        });
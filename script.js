let score = 0;
  let total = 0;
  let timeLeft = 30;
  let timerInterval = null;
  let currentDifficulty = 2;

  function startGame() {
    currentDifficulty = parseInt(document.getElementById("difficulty").value);
    score = 0;
    total = 0;
    timeLeft = 30;

    document.getElementById("score").textContent = `スコア: 0 点`;
    document.getElementById("accuracy").textContent = `正答率: 0%`;
    document.getElementById("result").textContent = "";
    document.getElementById("retry").style.display = "none";
    document.getElementById("timer").textContent = `残り時間: ${timeLeft} 秒`;

    clearInterval(timerInterval);
    startTimer();
    generateQuestion();
  }

  function startTimer() {
    timerInterval = setInterval(() => {
      timeLeft--;
      document.getElementById("timer").textContent = `残り時間: ${timeLeft} 秒`;
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        endGame();
      }
    }, 1000);
  }

  function endGame() {
    document.getElementById("question").textContent = "⏱️ 時間切れ！";
    document.getElementById("options").innerHTML = "";
    document.getElementById("result").textContent = `最終ス���ア: ${score} 点`;
    document.getElementById("retry").style.display = "inline-block";
  }

  function generateQuestion() {
    if (timeLeft <= 0) return;

    let a, b, op, correctAnswer;
    const operators = currentDifficulty === 2 ? ["+", "-"] : ["×", "÷"];
    op = operators[Math.floor(Math.random() * operators.length)];

    if (op === "+" || op === "-") {
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      if (op === "-" && a < b) [a, b] = [b, a];
    } else {
      a = Math.floor(Math.random() * 9) + 1;
      b = Math.floor(Math.random() * 9) + 1;
      if (op === "×") {
        correctAnswer = a * b;
      } else {
        correctAnswer = a;
        a = a * b;
      }
    }

    const questionText = `${a} ${op} ${b}`;
    switch(op) {
      case "+": correctAnswer = a + b; break;
      case "-": correctAnswer = a - b; break;
      case "×": correctAnswer = a * b; break;
      case "÷": correctAnswer = a / b; break;
    }

    const options = [correctAnswer];
    while (options.length < 4) {
      let wrong = correctAnswer + Math.floor(Math.random() * 10 - 5);
      if (!options.includes(wrong) && wrong >= 0) {
        options.push(wrong);
      }
    }

    options.sort(() => Math.random() - 0.5);
    document.getElementById("question").textContent = questionText;
    const optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";

    options.forEach(opt => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.onclick = () => {
        total++;
        if (opt === correctAnswer) {
          score++;
          document.getElementById("result").textContent = "⭕ 正解！";
        } else {
          document.getElementById("result").textContent = "❌ ちがうよ。";
        }
        updateStats();
        setTimeout(() => {
          document.getElementById("result").textContent = "";
          generateQuestion();
        }, 800);
      };
      optionsDiv.appendChild(btn);
    });
  }

  function updateStats() {
    document.getElementById("score").textContent = `スコア: ${score} 点`;
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    document.getElementById("accuracy").textContent = `正答率: ${accuracy}%`;
  }

  // イベント登録（安全なDOM読み込み後に）
  window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("startBtn").addEventListener("click", startGame);
    document.getElementById("retry").addEventListener("click", startGame);
  });

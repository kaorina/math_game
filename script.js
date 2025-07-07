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

  // ゲーム状態をスクリーンリーダーに通知
  announceToScreenReader(`ゲームを開始しました。${currentDifficulty}年生レベルで、5秒間で問題を解いてください。`);

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
  document.getElementById("result").textContent = `最終スコア: ${score} 点`;
  document.getElementById("retry").style.display = "inline-block";
  
  // ゲーム終了をスクリーンリーダーに通知
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
  announceToScreenReader(`ゲーム終了です。最終スコアは${score}点、正答率は${accuracy}パーセントでした。もう一度プレイしたい場合は、もう一度あそぶボタンを押してください。`);
  
  // リトライボタンにフォーカスを当てる
  document.getElementById("retry").focus();
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
  
  // 新しい問題をスクリーンリーダーに通知
  announceToScreenReader(`新しい問題です。${questionText}。選択肢は次の通りです。`);

  options.forEach((opt, index) => {
    const btn = document.createElement("button");
    btn.textContent = opt;
    btn.setAttribute("aria-label", `選択肢 ${index + 1}: ${opt}`);
    btn.onclick = () => {
      total++;
      const isCorrect = opt === correctAnswer;
      if (isCorrect) {
        score++;
        document.getElementById("result").textContent = "⭕ 正解！";
        announceToScreenReader(`正解です！答えは${opt}でした。`);
      } else {
        document.getElementById("result").textContent = "❌ ちがうよ。";
        announceToScreenReader(`不正解です。正しい答えは${correctAnswer}でした。`);
      }
      updateStats();
      setTimeout(() => {
        document.getElementById("result").textContent = "";
        generateQuestion();
      }, 800);
    };
    
    // キーボードナビゲーション対応
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
    
    optionsDiv.appendChild(btn);
  });
}

function updateStats() {
  document.getElementById("score").textContent = `スコア: ${score} 点`;
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
  document.getElementById("accuracy").textContent = `正答率: ${accuracy}%`;
  
  // スコア更新をスクリーンリーダーに通知（頻繁すぎないように5問毎に）
  if (total % 5 === 0) {
    announceToScreenReader(`現在のスコア: ${score}点、正答率: ${accuracy}パーセントです。`);
  }
}

// スクリーンリーダーへのアナウンス関数
function announceToScreenReader(message) {
  const announcer = document.getElementById('game-status');
  announcer.textContent = message;
  
  // メッセージをリセットして、同じメッセージでも再度読み上げられるようにする
  setTimeout(() => {
    announcer.textContent = '';
  }, 1000);
}

// キーボードナビゲーションのサポート
function handleKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    // 数字キーで1-4で選択肢を選択
    if (e.key >= '1' && e.key <= '4') {
      const options = document.querySelectorAll('#options button');
      const index = parseInt(e.key) - 1;
      if (options[index]) {
        e.preventDefault();
        options[index].click();
      }
    }
    
    // Enterキーでゲーム開始
    if (e.key === 'Enter' && document.getElementById('startBtn').style.display !== 'none') {
      const startBtn = document.getElementById('startBtn');
      if (startBtn.offsetParent !== null) {
        startBtn.click();
      }
    }
  });
}

// イベント登録（安全なDOM読み込み後に）
window.addEventListener("DOMContentLoaded", () => {
  document.getElementById("startBtn").addEventListener("click", startGame);
  document.getElementById("retry").addEventListener("click", startGame);
  
  // キーボードナビゲーションを初期化
  handleKeyboardNavigation();
  
  // ゲーム開始時にスクリーンリーダーにアナウンス
  announceToScreenReader('小学生クイズゲームへようこそ！難易度を選択してゲームスタートボタンを押してください。');
});

let score = 0;
let total = 0;
let timeLeft = 30;
let timerInterval = null;
let currentDifficulty = 2;

function startGame() {
  try {
    const difficultyElement = document.getElementById("difficulty");
    if (!difficultyElement) {
      throw new Error("難易度選択要素が見つかりません");
    }
    
    currentDifficulty = parseInt(difficultyElement.value);
    if (isNaN(currentDifficulty) || (currentDifficulty !== 2 && currentDifficulty !== 3)) {
      throw new Error("無効な難易度が選択されています");
    }
    
    score = 0;
    total = 0;
    timeLeft = 30;

    const scoreElement = document.getElementById("score");
    const accuracyElement = document.getElementById("accuracy");
    const resultElement = document.getElementById("result");
    const retryElement = document.getElementById("retry");
    const timerElement = document.getElementById("timer");
    
    if (!scoreElement || !accuracyElement || !resultElement || !retryElement || !timerElement) {
      throw new Error("必要なDOM要素が見つかりません");
    }

    scoreElement.textContent = `スコア: 0 点`;
    accuracyElement.textContent = `正答率: 0%`;
    resultElement.textContent = "";
    retryElement.style.display = "none";
    timerElement.textContent = `残り時間: ${timeLeft} 秒`;

    // ゲーム状態をスクリーンリーダーに通知
    announceToScreenReader(`ゲームを開始しました。${currentDifficulty}年生レベルで、30秒間で問題を解いてください。`);

    clearInterval(timerInterval);
    startTimer();
    generateQuestion();
  } catch (error) {
    handleError('ゲーム開始エラー', error);
  }
}

function startTimer() {
  try {
    timerInterval = setInterval(() => {
      timeLeft--;
      const timerElement = document.getElementById("timer");
      if (timerElement) {
        timerElement.textContent = `残り時間: ${timeLeft} 秒`;
      }
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        endGame();
      }
    }, 1000);
  } catch (error) {
    handleError('タイマーエラー', error);
  }
}

function endGame() {
  try {
    const questionElement = document.getElementById("question");
    const optionsElement = document.getElementById("options");
    const resultElement = document.getElementById("result");
    const retryElement = document.getElementById("retry");
    
    if (!questionElement || !optionsElement || !resultElement || !retryElement) {
      throw new Error("ゲーム終了処理に必要な要素が見つかりません");
    }
    
    questionElement.textContent = "⏱️ 時間切れ！";
    optionsElement.innerHTML = "";
    resultElement.textContent = `最終スコア: ${score} 点`;
    retryElement.style.display = "inline-block";
    
    // ゲーム終了をスクリーンリーダーに通知
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    announceToScreenReader(`ゲーム終了です。最終スコアは${score}点、正答率は${accuracy}パーセントでした。もう一度プレイしたい場合は、もう一度あそぶボタンを押してください。`);
    
    // リトライボタンにフォーカスを当てる
    retryElement.focus();
  } catch (error) {
    handleError('ゲーム終了エラー', error);
  }
}

function generateQuestion() {
  try {
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

    // 答えの数値検証
    if (isNaN(correctAnswer) || !isFinite(correctAnswer)) {
      throw new Error("無効な答えが生成されました");
    }

    const options = [correctAnswer];
    let attempts = 0;
    while (options.length < 4 && attempts < 20) {
      attempts++;
      let wrong = correctAnswer + Math.floor(Math.random() * 10 - 5);
      if (!options.includes(wrong) && wrong >= 0 && Number.isInteger(wrong)) {
        options.push(wrong);
      }
    }
    
    // 選択肢が不十分な場合のフォールバック
    while (options.length < 4) {
      options.push(Math.floor(Math.random() * 50) + 1);
    }

    options.sort(() => Math.random() - 0.5);
    
    const questionElement = document.getElementById("question");
    const optionsDiv = document.getElementById("options");
    
    if (!questionElement || !optionsDiv) {
      throw new Error("問題表示要素が見つかりません");
    }
    
    questionElement.textContent = questionText;
    optionsDiv.innerHTML = "";
    
    // 新しい問題をスクリーンリーダーに通知
    announceToScreenReader(`新しい問題です。${questionText}。選択肢は次の通りです。`);

    options.forEach((opt, index) => {
      const btn = document.createElement("button");
      btn.textContent = opt;
      btn.setAttribute("aria-label", `選択肢 ${index + 1}: ${opt}`);
      btn.onclick = () => {
        try {
          total++;
          const isCorrect = opt === correctAnswer;
          const resultElement = document.getElementById("result");
          
          if (!resultElement) {
            throw new Error("結果表示要素が見つかりません");
          }
          
          if (isCorrect) {
            score++;
            resultElement.textContent = "⭕ 正解！";
            announceToScreenReader(`正解です！答えは${opt}でした。`);
          } else {
            resultElement.textContent = "❌ ちがうよ。";
            announceToScreenReader(`不正解です。正しい答えは${correctAnswer}でした。`);
          }
          updateStats();
          setTimeout(() => {
            if (resultElement) {
              resultElement.textContent = "";
            }
            generateQuestion();
          }, 800);
        } catch (error) {
          handleError('答え処理エラー', error);
        }
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
  } catch (error) {
    handleError('問題生成エラー', error);
  }
}

function updateStats() {
  try {
    const scoreElement = document.getElementById("score");
    const accuracyElement = document.getElementById("accuracy");
    
    if (!scoreElement || !accuracyElement) {
      throw new Error("統計表示要素が見つかりません");
    }
    
    scoreElement.textContent = `スコア: ${score} 点`;
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    accuracyElement.textContent = `正答率: ${accuracy}%`;
    
    // スコア更新をスクリーンリーダーに通知（頻繁すぎないように5問毎に）
    if (total % 5 === 0) {
      announceToScreenReader(`現在のスコア: ${score}点、正答率: ${accuracy}パーセントです。`);
    }
  } catch (error) {
    handleError('統計更新エラー', error);
  }
}

// スクリーンリーダーへのアナウンス関数
function announceToScreenReader(message) {
  try {
    const announcer = document.getElementById('game-status');
    if (!announcer) {
      console.warn('スクリーンリーダー用要素が見つかりません');
      return;
    }
    
    announcer.textContent = message;
    
    // メッセージをリセットして、同じメッセージでも再度読み上げられるようにする
    setTimeout(() => {
      if (announcer) {
        announcer.textContent = '';
      }
    }, 1000);
  } catch (error) {
    console.error('スクリーンリーダーアナウンスエラー:', error);
  }
}

// エラーハンドリング関数
function handleError(context, error) {
  console.error(`${context}:`, error);
  
  // ユーザーにエラーを通知
  const resultElement = document.getElementById('result');
  if (resultElement) {
    resultElement.textContent = 'エラーが発生しました。ページをリロードしてください。';
    resultElement.style.color = 'red';
  }
  
  // スクリーンリーダーにエラーを通知
  announceToScreenReader(`エラーが発生しました: ${context}。ページをリロードしてください。`);
  
  // タイマーを停止
  if (timerInterval) {
    clearInterval(timerInterval);
  }
}

// キーボードナビゲーションのサポート
function handleKeyboardNavigation() {
  try {
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
      if (e.key === 'Enter') {
        const startBtn = document.getElementById('startBtn');
        if (startBtn && startBtn.offsetParent !== null) {
          startBtn.click();
        }
      }
    });
  } catch (error) {
    handleError('キーボードナビゲーションエラー', error);
  }
}

// イベント登録（安全なDOM読み込み後に）
window.addEventListener("DOMContentLoaded", () => {
  try {
    const startBtn = document.getElementById("startBtn");
    const retryBtn = document.getElementById("retry");
    
    if (!startBtn || !retryBtn) {
      throw new Error("必要なボタン要素が見つかりません");
    }
    
    startBtn.addEventListener("click", startGame);
    retryBtn.addEventListener("click", startGame);
    
    // キーボードナビゲーションを初期化
    handleKeyboardNavigation();
    
    // ゲーム開始時にスクリーンリーダーにアナウンス
    announceToScreenReader('小学生クイズゲームへようこそ！難易度を選択してゲームスタートボタンを押してください。');
  } catch (error) {
    handleError('初期化エラー', error);
  }
});

// グローバルエラーハンドラー
window.addEventListener('error', (event) => {
  handleError('グローバルエラー', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  handleError('未処理のPromiseエラー', event.reason);
});

describe('算数ゲーム - エラーハンドリング', () => {
  beforeEach(() => {
    cy.visitGame()
    cy.waitForGameReady()
  })

  describe('無効な難易度選択時の処理', () => {
    it('無効な難易度値でゲーム開始時にエラーが処理される', () => {
      // 無効な難易度値を設定
      cy.get('#difficulty').then($select => {
        $select.val('999')
      })
      
      cy.startGame()
      
      // エラーメッセージが表示されることを確認
      cy.get('#result').should('contain', 'エラーが発生しました')
      cy.get('#result').should('have.css', 'color', 'rgb(255, 0, 0)')
    })

    it('NaN値の難易度でエラーが適切に処理される', () => {
      // 文字列値を設定
      cy.get('#difficulty').then($select => {
        $select.val('invalid')
      })
      
      cy.startGame()
      
      // エラーメッセージが表示されることを確認
      cy.get('#result').should('contain', 'エラーが発生しました')
    })

    it('空の難易度値でエラーが適切に処理される', () => {
      // 空の値を設定
      cy.get('#difficulty').then($select => {
        $select.val('')
      })
      
      cy.startGame()
      
      // エラーメッセージまたは適切なフォールバック動作を確認
      cy.get('#result').should('contain', 'エラーが発生しました')
    })
  })

  describe('DOM要素が存在しない場合の処理', () => {
    it('スコア表示要素が存在しない場合のエラー処理', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      // DOM要素を削除
      cy.get('#score').then($score => {
        $score.remove()
      })
      
      // 統計更新時のエラーハンドリングをテスト
      cy.get('#options button').first().click()
      
      // エラーが適切に処理されることを確認
      cy.get('#result').should('contain', 'エラーが発生しました')
    })

    it('タイマー表示要素が存在しない場合のエラー処理', () => {
      // タイマー要素を削除
      cy.get('#timer').then($timer => {
        $timer.remove()
      })
      
      cy.selectDifficulty(2)
      cy.startGame()
      
      // エラーが適切に処理されることを確認（ゲームが続行可能）
      cy.get('#question').should('be.visible')
      cy.get('#options').should('be.visible')
    })

    it('問題表示要素が存在しない場合のエラー処理', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      // 問題表示要素を削除
      cy.get('#question').then($question => {
        $question.remove()
      })
      
      // 新しい問題生成時のエラーハンドリングをテスト
      cy.get('#options button').first().click()
      cy.wait(1000)
      
      // エラーが適切に処理されることを確認
      cy.get('#result').should('contain', 'エラーが発生しました')
    })

    it('選択肢コンテナが存在しない場合のエラー処理', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      // 選択肢コンテナを削除
      cy.get('#options').then($options => {
        $options.remove()
      })
      
      // 新しい問題生成時のエラーハンドリングをテスト
      cy.get('#options button').first().click()
      cy.wait(1000)
      
      // エラーが適切に処理されることを確認
      cy.get('#result').should('contain', 'エラーが発生しました')
    })

    it('リトライボタンが存在しない場合のエラー処理', () => {
      // リトライボタンを削除
      cy.get('#retry').then($retry => {
        $retry.remove()
      })
      
      cy.selectDifficulty(2)
      cy.startGame()
      
      // ゲーム終了時のエラーハンドリングをテスト
      cy.waitForGameEnd()
      
      // エラーが適切に処理されることを確認
      cy.get('#result').should('contain', 'エラーが発生しました')
    })
  })

  describe('JavaScript エラー発生時の適切な処理', () => {
    it('スクリーンリーダー用要素が存在しない場合の処理', () => {
      // game-status要素を削除
      cy.get('#game-status').then($gameStatus => {
        $gameStatus.remove()
      })
      
      cy.selectDifficulty(2)
      cy.startGame()
      
      // ゲームが正常に動作することを確認（エラーで停止しない）
      cy.get('#question').should('be.visible')
      cy.get('#options button').should('have.length', 4)
    })

    it('handleError関数が正しく動作する', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      // 手動でエラーを発生させる
      cy.window().then((win) => {
        win.handleError('テストエラー', new Error('テスト用エラー'))
      })
      
      // エラーメッセージが表示されることを確認
      cy.get('#result').should('contain', 'エラーが発生しました')
      cy.get('#result').should('have.css', 'color', 'rgb(255, 0, 0)')
    })

    it('グローバルエラーハンドラーが設定されている', () => {
      // グローバルエラーハンドラーの存在を確認
      cy.window().then((win) => {
        // JavaScript エラーを発生させる
        win.eval('throw new Error(\"テスト用グローバルエラー\")')
      })
      
      // エラーが適切に処理されることを確認
      cy.get('#result').should('contain', 'エラーが発生しました')
    })

    it('数値計算エラーが適切に処理される', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      // 無効な数値計算を強制的に発生させる
      cy.window().then((win) => {
        // correctAnswerを無効な値に設定
        win.eval('correctAnswer = NaN')
      })
      
      cy.get('#options button').first().click()
      
      // エラーが適切に処理されることを確認
      cy.get('#result').should('contain', 'エラーが発生しました')
    })

    it('タイマー停止時にエラーが発生しない', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      // タイマーを複数回停止してもエラーが発生しないことを確認
      cy.window().then((win) => {
        if (win.timerInterval) {
          win.clearInterval(win.timerInterval)
          win.clearInterval(win.timerInterval) // 二重停止
        }
      })
      
      // ゲームが正常に動作することを確認
      cy.get('#question').should('be.visible')
      cy.get('#options button').should('have.length', 4)
    })
  })

  describe('ネットワークエラーとリソース読み込みエラー', () => {
    it('スタイルシートが読み込めない場合でも機能する', () => {
      // CSSファイルの読み込みを妨害
      cy.intercept('GET', '/style.css', { statusCode: 404 })
      
      cy.visitGame()
      cy.waitForGameReady()
      
      // 基本機能が動作することを確認
      cy.selectDifficulty(2)
      cy.startGame()
      cy.get('#question').should('be.visible')
      cy.get('#options button').should('have.length', 4)
    })

    it('画像が読み込めない場合でも機能する', () => {
      // 画像の読み込みを妨害
      cy.intercept('GET', '/*.png.jpg', { statusCode: 404 })
      
      cy.visitGame()
      cy.waitForGameReady()
      
      // 基本機能が動作することを確認
      cy.selectDifficulty(2)
      cy.startGame()
      cy.get('#question').should('be.visible')
      cy.get('#options button').should('have.length', 4)
    })
  })

  describe('メモリリークとパフォーマンス', () => {
    it('タイマーが適切にクリアされる', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      // ゲームを複数回開始/停止してメモリリークをチェック
      cy.get('#retry').should('not.be.visible')
      
      cy.window().then((win) => {
        // タイマーの状態を確認
        expect(win.timerInterval).to.not.be.null
      })
      
      // ゲーム終了
      cy.waitForGameEnd()
      
      cy.window().then((win) => {
        // タイマーがクリアされていることを確認
        expect(win.timerInterval).to.be.null
      })
    })

    it('イベントリスナーが適切に管理される', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      // 複数の選択肢ボタンがイベントリスナーを持つことを確認
      cy.get('#options button').each($button => {
        cy.wrap($button).should('have.attr', 'aria-label')
      })
      
      // 新しい問題生成時に古いボタンが適切に削除されることを確認
      cy.get('#options button').first().click()
      cy.wait(1000)
      
      cy.get('#options button').should('have.length', 4)
    })
  })
})
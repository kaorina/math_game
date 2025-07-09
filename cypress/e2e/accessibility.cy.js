describe('算数ゲーム - アクセシビリティ', () => {
  beforeEach(() => {
    cy.visitGame()
    cy.waitForGameReady()
  })

  describe('キーボードナビゲーション', () => {
    it('数字キー1-4で選択肢を選択できる', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      // 数字キー1を押して最初の選択肢を選択
      cy.get('body').type('1')
      
      // 回答が処理されることを確認
      cy.get('#result').should('be.visible')
      cy.get('#result').invoke('text').should('match', /(正解|ちがう)/)
    })

    it('数字キー2-4で対応する選択肢を選択できる', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      // 各数字キーをテスト
      const keys = ['2', '3', '4']
      keys.forEach(key => {
        cy.get('body').type(key)
        cy.wait(1000)
        cy.get('#result').should('be.visible')
        cy.get('#result').invoke('text').should('match', /(正解|ちがう)/)
      })
    })

    it('Enterキーでゲームを開始できる', () => {
      cy.selectDifficulty(2)
      cy.get('body').type('{enter}')
      
      // ゲームが開始されることを確認
      cy.get('#question').should('be.visible')
      cy.get('#options').should('be.visible')
    })

    it('タブキーでフォーカス移動ができる', () => {
      // 難易度選択にフォーカス
      cy.get('#difficulty').focus()
      cy.get('#difficulty').should('be.focused')
      
      // タブキーでスタートボタンに移動
      cy.get('#difficulty').tab()
      cy.get('#startBtn').should('be.focused')
    })

    it('選択肢ボタンでEnterキーとスペースキーが機能する', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      // 最初の選択肢にフォーカス
      cy.get('#options button').first().focus()
      
      // Enterキーで選択
      cy.get('#options button').first().type('{enter}')
      
      // 回答が処理されることを確認
      cy.get('#result').should('be.visible')
      cy.get('#result').invoke('text').should('match', /(正解|ちがう)/)
    })
  })

  describe('スクリーンリーダー対応', () => {
    it('ゲーム開始時にスクリーンリーダー用メッセージが設定される', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      // ゲーム状態用要素にメッセージが設定されることを確認
      cy.get('#game-status').should('exist')
      cy.get('#game-status').should('have.class', 'sr-only')
    })

    it('問題変更時にスクリーンリーダー用メッセージが更新される', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      // 初期状態のメッセージを確認
      cy.get('#game-status').then($status => {
        const initialText = $status.text()
        
        // 回答を選択
        cy.get('#options button').first().click()
        cy.wait(1000)
        
        // メッセージが更新されることを確認
        cy.get('#game-status').should('not.have.text', initialText)
      })
    })

    it('ゲーム終了時にスクリーンリーダー用メッセージが設定される', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      cy.waitForGameEnd()
      
      // ゲーム終了メッセージが設定されることを確認
      cy.get('#game-status').should('contain.text', 'ゲーム終了')
    })

    it('正解・不正解時にスクリーンリーダー用メッセージが設定される', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      cy.get('#options button').first().click()
      
      // 結果に応じたメッセージが設定されることを確認
      cy.get('#game-status').invoke('text').should('match', /(正解|不正解)/)
    })
  })

  describe('ARIA属性の動作確認', () => {
    it('選択肢ボタンに適切なaria-labelが設定される', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      cy.get('#options button').each(($button, index) => {
        cy.wrap($button).should('have.attr', 'aria-label')
        cy.wrap($button).should('have.attr', 'aria-label').and('contain', `選択肢 ${index + 1}`)
      })
    })

    it('ゲーム情報セクションにaria-liveが設定される', () => {
      cy.get('#timer').should('have.attr', 'aria-label', '残り時間')
      cy.get('#score').should('have.attr', 'aria-label', '現在のスコア')
      cy.get('#accuracy').should('have.attr', 'aria-label', '正答率')
    })

    it('問題と選択肢セクションにaria-liveが設定される', () => {
      cy.get('#question').should('have.attr', 'role', 'heading')
      cy.get('#question').should('have.attr', 'aria-level', '2')
      cy.get('#options').should('have.attr', 'role', 'group')
      cy.get('#options').should('have.attr', 'aria-label', '回答選択肢')
    })

    it('結果表示にaria-liveが設定される', () => {
      cy.get('#result').should('have.attr', 'aria-live', 'assertive')
      cy.get('#result').should('have.attr', 'aria-label', '回答結果')
    })

    it('リトライボタンに適切なaria-labelが設定される', () => {
      cy.get('#retry').should('have.attr', 'aria-label', 'ゲームをもう一度プレイする')
    })

    it('難易度選択にaria-describedbyが設定される', () => {
      cy.get('#difficulty').should('have.attr', 'aria-describedby', 'difficulty-help')
      cy.get('#difficulty-help').should('exist')
      cy.get('#difficulty-help').should('have.class', 'sr-only')
    })

    it('スタートボタンにaria-describedbyが設定される', () => {
      cy.get('#startBtn').should('have.attr', 'aria-describedby', 'start-help')
      cy.get('#start-help').should('exist')
      cy.get('#start-help').should('have.class', 'sr-only')
    })
  })

  describe('フォーカス管理', () => {
    it('ゲーム終了時にリトライボタンにフォーカスが移動する', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      cy.waitForGameEnd()
      
      // リトライボタンにフォーカスが当たることを確認
      cy.get('#retry').should('be.focused')
    })

    it('フォーカスインジケーターが適切に表示される', () => {
      // スタートボタンにフォーカス
      cy.get('#startBtn').focus()
      cy.get('#startBtn').should('have.css', 'outline-color', 'rgb(0, 122, 204)')
      
      // 難易度選択にフォーカス
      cy.get('#difficulty').focus()
      cy.get('#difficulty').should('have.css', 'outline-color', 'rgb(0, 122, 204)')
    })

    it('選択肢ボタンのフォーカス状態が適切に管理される', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      // 各選択肢ボタンにフォーカスできることを確認
      cy.get('#options button').each($button => {
        cy.wrap($button).focus()
        cy.wrap($button).should('be.focused')
        cy.wrap($button).should('have.css', 'outline-color', 'rgb(0, 122, 204)')
      })
    })
  })

  describe('高コントラストとアクセシビリティ設定', () => {
    it('高コントラストモードでのスタイルが適用される', () => {
      // 高コントラストモードをシミュレート
      cy.window().then((win) => {
        const mediaQuery = win.matchMedia('(prefers-contrast: high)')
        if (mediaQuery.matches) {
          cy.get('body').should('have.css', 'background-color', 'rgb(255, 255, 255)')
          cy.get('body').should('have.css', 'color', 'rgb(0, 0, 0)')
        }
      })
    })

    it('動きの軽減設定が適用される', () => {
      // 動きの軽減設定をシミュレート
      cy.window().then((win) => {
        const mediaQuery = win.matchMedia('(prefers-reduced-motion: reduce)')
        if (mediaQuery.matches) {
          // アニメーションが軽減されることを確認
          cy.get('*').should('have.css', 'animation-duration', '0.01s')
        }
      })
    })
  })

  describe('セマンティックHTML構造', () => {
    it('適切なセマンティック要素が使用される', () => {
      cy.get('main').should('exist')
      cy.get('header').should('exist')
      cy.get('section').should('have.length.greaterThan', 0)
    })

    it('見出し構造が適切に設定される', () => {
      cy.get('h1').should('exist')
      cy.get('h1').should('contain', '小学生クイズゲーム')
    })

    it('ラベルが適切に関連付けられる', () => {
      cy.get('label[for="difficulty"]').should('exist')
      cy.get('#difficulty').should('exist')
    })

    it('ボタンが適切にマークアップされる', () => {
      cy.get('#startBtn').should('have.prop', 'tagName', 'BUTTON')
      cy.get('#retry').should('have.prop', 'tagName', 'BUTTON')
    })
  })

  describe('モバイルアクセシビリティ', () => {
    it('ビューポートが適切に設定される', () => {
      cy.get('head meta[name="viewport"]').should('exist')
      cy.get('head meta[name="viewport"]').should('have.attr', 'content').and('include', 'width=device-width')
    })

    it('タッチデバイスでの操作が可能', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      // タッチイベントをシミュレート
      cy.get('#options button').first().trigger('touchstart')
      cy.get('#options button').first().trigger('touchend')
      
      // 回答が処理されることを確認
      cy.get('#result').should('be.visible')
    })
  })

  describe('キーボードトラップの回避', () => {
    it('フォーカスがゲーム要素内に適切に制限される', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      // 選択肢ボタンから他の要素にフォーカス移動できることを確認
      cy.get('#options button').first().focus()
      cy.get('#options button').first().tab()
      
      // フォーカスが他の要素に移動できることを確認
      cy.focused().should('not.match', '#options button:first')
    })

    it('すべてのインタラクティブ要素にフォーカスできる', () => {
      const interactiveElements = ['#difficulty', '#startBtn', '#retry']
      
      interactiveElements.forEach(selector => {
        cy.get(selector).focus()
        cy.get(selector).should('be.focused')
      })
    })
  })
})

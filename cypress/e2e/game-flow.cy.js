describe('算数ゲーム - 基本的なゲームフロー', () => {
  beforeEach(() => {
    cy.visitGame()
    cy.waitForGameReady()
  })

  describe('難易度選択機能', () => {
    it('2年生を選択できる', () => {
      cy.selectDifficulty(2)
      cy.get('#difficulty').should('have.value', '2')
    })

    it('3年生を選択できる', () => {
      cy.selectDifficulty(3)
      cy.get('#difficulty').should('have.value', '3')
    })

    it('難易度オプションに正しいテキストが表示される', () => {
      cy.get('#difficulty option[value="2"]').should('contain', '2年生')
      cy.get('#difficulty option[value="3"]').should('contain', '3年生')
    })
  })

  describe('ゲーム開始機能', () => {
    it('スタートボタンをクリックしてゲームを開始できる', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      cy.get('#question').should('be.visible')
      cy.get('#options').should('be.visible')
      cy.get('#timer').should('contain', '残り時間')
      cy.get('#score').should('contain', 'スコア: 0 点')
    })

    it('ゲーム開始時にタイマーが30秒から開始される', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      cy.get('#timer').should('contain', '30')
    })

    it('ゲーム開始時にスコアが0点で初期化される', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      cy.get('#score').should('contain', 'スコア: 0 点')
      cy.get('#accuracy').should('contain', '正答率: 0%')
    })
  })

  describe('問題表示機能', () => {
    it('2年生レベルで足し算・引き算の問題が表示される', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      cy.get('#question').should('be.visible')
      cy.get('#question').invoke('text').should('match', /\d+\s*[\+\-]\s*\d+/)
    })

    it('3年生レベルで掛け算・割り算の問題が表示される', () => {
      cy.selectDifficulty(3)
      cy.startGame()
      
      cy.get('#question').should('be.visible')
      cy.get('#question').invoke('text').should('match', /\d+\s*[×÷]\s*\d+/)
    })

    it('選択肢が4つ表示される', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      cy.get('#options button').should('have.length', 4)
    })

    it('選択肢にaria-labelが設定されている', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      cy.get('#options button').each(($button, index) => {
        cy.wrap($button).should('have.attr', 'aria-label')
        cy.wrap($button).should('have.attr', 'aria-label').and('contain', `選択肢 ${index + 1}`)
      })
    })
  })

  describe('回答選択機能', () => {
    it('回答を選択できる', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      cy.get('#options button').first().click()
      cy.get('#result').should('be.visible')
      cy.get('#result').invoke('text').should('match', /(正解|ちがう)/)
    })

    it('正解時にスコアが増加する', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      // 正解を見つけるまで試行
      cy.get('#question').invoke('text').then((questionText) => {
        const match = questionText.match(/(\d+)\s*[\+\-]\s*(\d+)/)
        if (match) {
          const [, a, b] = match
          const operator = questionText.includes('+') ? '+' : '-'
          const correctAnswer = operator === '+' ? 
            parseInt(a) + parseInt(b) : 
            parseInt(a) - parseInt(b)
          
          cy.get('#options button').contains(correctAnswer.toString()).click()
          cy.get('#result').should('contain', '正解')
          cy.get('#score').should('contain', 'スコア: 1 点')
        }
      })
    })

    it('回答後に新しい問題が表示される', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      cy.get('#question').invoke('text').then((firstQuestion) => {
        cy.get('#options button').first().click()
        cy.wait(1000)
        cy.get('#question').invoke('text').should('not.equal', firstQuestion)
      })
    })
  })

  describe('スコア更新機能', () => {
    it('正答率が正しく計算される', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      // 数問回答してスコアを確認
      for (let i = 0; i < 3; i++) {
        cy.get('#options button').first().click()
        cy.wait(1000)
      }
      
      cy.get('#accuracy').should('contain', '正答率:')
      cy.get('#accuracy').invoke('text').should('match', /\d+%/)
    })

    it('スコアが累積される', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      // 複数回答してスコアの変化を確認
      cy.get('#options button').first().click()
      cy.wait(1000)
      cy.get('#options button').first().click()
      cy.wait(1000)
      
      cy.get('#score').invoke('text').should('match', /スコア: \d+ 点/)
    })
  })

  describe('ゲーム終了機能', () => {
    it('30秒経過後にゲームが終了する', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      cy.waitForGameEnd()
      cy.get('#question').should('contain', '時間切れ')
      cy.get('#retry').should('be.visible')
    })

    it('ゲーム終了時に最終スコアが表示される', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      cy.waitForGameEnd()
      cy.get('#result').should('contain', '最終スコア')
      cy.get('#result').invoke('text').should('match', /最終スコア: \d+ 点/)
    })

    it('リトライボタンをクリックして再ゲームできる', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      cy.waitForGameEnd()
      cy.get('#retry').click()
      
      cy.get('#question').should('be.visible')
      cy.get('#timer').should('contain', '30')
      cy.get('#score').should('contain', 'スコア: 0 点')
    })

    it('ゲーム終了時にリトライボタンにフォーカスが当たる', () => {
      cy.selectDifficulty(2)
      cy.startGame()
      
      cy.waitForGameEnd()
      cy.get('#retry').should('be.focused')
    })
  })
})

// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command to visit the game page
Cypress.Commands.add('visitGame', () => {
  cy.visit('/index.html')
  cy.get('body').should('be.visible')
})

// Custom command to check if game is ready
Cypress.Commands.add('waitForGameReady', () => {
  cy.get('#startBtn').should('be.visible')
  cy.get('#difficulty').should('be.visible')
  cy.get('#timer').should('exist')
  cy.get('#score').should('exist')
})

// Custom command to simulate game completion
Cypress.Commands.add('completeGame', () => {
  cy.selectDifficulty(2)
  cy.startGame()
  
  // Answer questions until game ends
  const answerQuestions = () => {
    cy.get('#options button').then($buttons => {
      if ($buttons.length > 0) {
        cy.get('#options button').first().click()
        cy.wait(1000)
        cy.get('#retry').then($retry => {
          if (!$retry.is(':visible')) {
            answerQuestions()
          }
        })
      }
    })
  }
  
  answerQuestions()
})


// ***********************************************************
// This example support/e2e.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from the command log
Cypress.on('window:before:load', (win) => {
  win.fetch = null
})

// Custom commands for accessibility testing
Cypress.Commands.add('checkA11y', (selector) => {
  cy.get(selector).should('have.attr', 'aria-label')
})

Cypress.Commands.add('checkKeyboardNavigation', (selector) => {
  cy.get(selector).focus().type('{enter}')
})

// Game specific commands
Cypress.Commands.add('selectDifficulty', (level) => {
  cy.get('#difficulty').select(level.toString())
})

Cypress.Commands.add('startGame', () => {
  cy.get('#startBtn').click()
})

Cypress.Commands.add('selectAnswer', (index) => {
  cy.get('#options button').eq(index).click()
})

Cypress.Commands.add('waitForGameEnd', () => {
  cy.get('#retry', { timeout: 35000 }).should('be.visible')
})

Cypress.Commands.add('checkScore', (expectedScore) => {
  cy.get('#score').should('contain', expectedScore)
})
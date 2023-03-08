const { defineConfig } = require("cypress");
require('dotenv').config()

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.NEXT_AUTH_URL,
    supportFile: "cypress/support/commands.cy.js",
    chromeWebSecurity: false,
    experimentalSessionAndOrigin: true,
  },
});

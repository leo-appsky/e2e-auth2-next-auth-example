const { defineConfig } = require("cypress");
const { GoogleSocialLogin } = require("cypress-social-logins").plugins;
require('dotenv').config()

module.exports = defineConfig({
  e2e: {
    baseUrl: process.env.NEXT_AUTH_URL,
    supportFile: "cypress/support/commands.cy.js",
    chromeWebSecurity: false,
    setupNodeEvents(on, config) {
      // implement node event listeners here
      on("task", {
        GoogleSocialLogin: GoogleSocialLogin, // listens for GoogleSocialLogin task in tests
      });
    },
  },
});

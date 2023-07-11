const { defineConfig } = require("cypress");

module.exports = defineConfig({
  projectId: "k49ti8",
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});

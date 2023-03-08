Cypress.Commands.add("loginWithGmail", () => {
  Cypress.log({
    name: "loginViaGmail",
  });
  cy.visit('/login')
  cy.contains("Sign In").click();
     //cy.session('login',()=>{
       cy.request("/api/auth/csrf").then((resp) => {
         const csrfToken = resp.body.csrfToken;
         cy.request({
           method: "POST",
           url: "/api/auth/callback/google",
           form: true,
           body: {
             csrfToken: csrfToken,
             json: true,
             callbackUrl: "/",
           },
         }).then(() => {
           cy.origin("accounts.google.com", () => {
             cy.get('input[type="email"]', { timeout: 26000 }).type(
               Cypress.env("GOOGLE_USER")
             );
             cy.get("button", { timeout: 26000 }).eq(3).click();
             cy.wait(2000);
             Cypress.on("uncaught:exception", (error, runnable) => {
               Cypress.log({
                 error,
               });
               return !error.message.includes(
                 "ResizeObserver loop limit exceeded"
               );
             });
             cy.get('input[name="password"]', { timeout: 26000 }).type(
               Cypress.env("GOOGLE_PSWD")
             );
             cy.wait(2000);
             cy.get('input[type="checkbox"]', { timeout: 26000 }).check();
             Cypress.on("uncaught:exception", (error, runnable) => {
               Cypress.log({
                 error,
               });
               return !error.message.includes(
                 "ResizeObserver loop limit exceeded"
               );
             });
             cy.wait(600);
             cy.get("button", { timeout: 26000 }).eq(2).click();
           });
         });
         cy.visit("/account");
       });
     //})
});

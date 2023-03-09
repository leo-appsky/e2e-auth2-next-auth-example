Cypress.Commands.add("loginWithGmail", () => {
  const username = Cypress.env("GOOGLE_USER");
  const password = Cypress.env("GOOGLE_PSWD");
  const loginUrl = Cypress.env("SITE_NAME") + "/login";
  const cookieName = Cypress.env("COOKIE_NAME");
  const socialLoginOptions = {
    username,
    password,
    loginUrl,
    headless: true,
    logs: true,
    isPopup: false,
    getAllBrowserCookies: true,
    loginSelector: 'button',
    cookieDelay: 200000,
    postLoginSelector: "h1",
  };
  return cy
    .task("GoogleSocialLogin", socialLoginOptions)
    .then(({ cookies }) => {
      cy.clearCookies();

      const cookie = cookies
        .filter((cookie) => cookie.name === cookieName)
        .pop();
     
        if (cookie) {
          cy.session('login',()=>{
            cy.setCookie(cookie.name, cookie.value, {
              domain: cookie.domain,
              expiry: cookie.expires,
              httpOnly: cookie.httpOnly,
              path: cookie.path,
              secure: cookie.secure,
            });
          })
        }
      
    })
    .then(() => {
      cy.visit("/account");
    }); 
});
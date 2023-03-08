describe("Account test", () => {
  before(() => {
    cy.loginWithGmail();
    cy.visit("/account");
  });

  it("displays title text", () => {
    cy.get("h1").should('be.visible')
  });
});

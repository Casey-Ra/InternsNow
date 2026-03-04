describe("Student Events", () => {
  it("navigates to /student/events from student header", () => {
    cy.visit("/student/find-opportunities");
    cy.get("header").contains("a", "Events").click();
    cy.url().should("include", "/student/events");
  });

  it("student header points Events tab to /student/events", () => {
    cy.visit("/student/events");
    cy.get("header")
      .contains("a", "Events")
      .should("have.attr", "href", "/student/events");
  });

  it("events list renders and links to detail page", () => {
    cy.visit("/student/events");

    cy.get("body").then(($body) => {
      if ($body.text().includes("No events listed yet.")) {
        cy.contains("No events listed yet.").should("be.visible");
      } else {
        cy.get('a[aria-label^="View details for"]').first().click({ force: true });
        cy.url().should("match", /\/student\/events\/.+/);
        cy.contains("Back to events").should("be.visible");
      }
    });
  });
});

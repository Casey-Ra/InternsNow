import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals";
import { render, screen } from "@testing-library/react";

const mockUseUser = jest.fn();

jest.mock("@auth0/nextjs-auth0/client", () => ({
  useUser: () => mockUseUser(),
}));

jest.mock("../components/Header", () => ({
  __esModule: true,
  default: ({ tone }: { tone?: string }) => (
    <div data-testid="header" data-tone={tone}>
      Header
    </div>
  ),
}));

jest.mock("../components/Footer", () => ({
  __esModule: true,
  default: ({ tone }: { tone?: string }) => (
    <div data-testid="footer" data-tone={tone}>
      Footer
    </div>
  ),
}));

let HomeLandingPage: typeof import("./page").default;

describe("HomeLandingPage", () => {
  beforeAll(async () => {
    HomeLandingPage = (await import("./page")).default;
  });

  beforeEach(() => {
    mockUseUser.mockReset();
  });

  it("routes student CTAs to intake for signed-out visitors", () => {
    mockUseUser.mockReturnValue({ user: null, isLoading: false });

    render(<HomeLandingPage />);

    expect(
      screen.getByRole("link", { name: "Find Your Career Now." }),
    ).toHaveProperty("href", expect.stringContaining("/intake"));
    expect(screen.getByRole("link", { name: "I'm a Student" }).getAttribute("href")).toBe(
      "/intake",
    );
    expect(screen.getByTestId("header").getAttribute("data-tone")).toBe("dark");
    expect(screen.getByTestId("footer").getAttribute("data-tone")).toBe("dark");
  });

  it("routes student CTAs to the dashboard for signed-in users", () => {
    mockUseUser.mockReturnValue({
      user: { sub: "auth0|student-1" },
      isLoading: false,
    });

    render(<HomeLandingPage />);

    expect(
      screen.getByRole("link", { name: "Find Your Career Now." }),
    ).toHaveProperty("href", expect.stringContaining("/student"));
    expect(screen.getByRole("link", { name: "I'm a Student" }).getAttribute("href")).toBe(
      "/student",
    );
  });
});

// Production /auth/login is currently returning 404 on the deployed branch,
// so user-facing auth entry points use the known-good direct Auth0 URL.
export const AUTH0_LOGIN_URL =
  "https://dev-qrmeb6o6i46gvquy.us.auth0.com/u/login?state=hKFo2SBaWGdSYnVRYmJXOE90RWNHT24wZXJvMlNoRENsMDFsTaFur3VuaXZlcnNhbC1sb2dpbqN0aWTZIHltQ3YzdExvSjJvQnN4d3lyQXp4RG4xRWxfMFFSQS04o2NpZNkgR29KRzlRRG53TXpjaU9OcWd0czI0S081Vm9WZWVra1I";

export const AUTH0_SIGNUP_URL = AUTH0_LOGIN_URL;

import { Auth0Client } from "@auth0/nextjs-auth0/server";

function getAppBaseUrl() {
  if (process.env.APP_BASE_URL?.trim()) {
    return process.env.APP_BASE_URL.trim();
  }

  if (process.env.VERCEL_URL?.trim()) {
    return `https://${process.env.VERCEL_URL.trim()}`;
  }

  return undefined;
}

export const auth0 = new Auth0Client({
  appBaseUrl: getAppBaseUrl(),
});

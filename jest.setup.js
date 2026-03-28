// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'

const { TextEncoder, TextDecoder } = require("node:util");

global.TextEncoder = global.TextEncoder || TextEncoder;
global.TextDecoder = global.TextDecoder || TextDecoder;

try {
  if (!global.fetch || !global.Request || !global.Response || !global.Headers) {
    const { fetch, Request, Response, Headers } = require("undici");
    global.fetch = global.fetch || fetch;
    global.Request = global.Request || Request;
    global.Response = global.Response || Response;
    global.Headers = global.Headers || Headers;
  }
} catch {
  // Node 20+ already provides fetch in most environments.
}

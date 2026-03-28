/* eslint-disable @typescript-eslint/no-require-imports */
// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import { TextDecoder, TextEncoder } from "node:util";

global.TextEncoder = global.TextEncoder || TextEncoder;
global.TextDecoder = global.TextDecoder || TextDecoder;

try {
  if (!global.fetch || !global.Request || !global.Response || !global.Headers) {
    const {
      fetch: undiciFetch,
      Request: undiciRequest,
      Response: undiciResponse,
      Headers: undiciHeaders,
    } = require("undici");

    global.fetch = global.fetch || undiciFetch;
    global.Request = global.Request || undiciRequest;
    global.Response = global.Response || undiciResponse;
    global.Headers = global.Headers || undiciHeaders;
  }
} catch {
  // Node 20+ already provides fetch in most environments.
}

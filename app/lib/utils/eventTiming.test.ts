import { describe, expect, test } from "@jest/globals";
import { inferEventEnd, parseDateOnly } from "./eventTiming";

describe("eventTiming", () => {
  test("parseDateOnly adds the current year when missing", () => {
    const parsed = parseDateOnly("Thu, Apr 30");

    expect(parsed).not.toBeNull();
    expect(parsed?.getFullYear()).toBe(new Date().getFullYear());
    expect(parsed?.getMonth()).toBe(3);
    expect(parsed?.getDate()).toBe(30);
  });

  test("inferEventEnd uses the end of a time range", () => {
    const parsed = inferEventEnd("Thu, Apr 30", "6:00 PM - 8:30 PM");

    expect(parsed).not.toBeNull();
    expect(parsed?.getHours()).toBe(20);
    expect(parsed?.getMinutes()).toBe(30);
  });

  test("inferEventEnd falls back to the end of day for date-only events", () => {
    const parsed = inferEventEnd("Thu, Apr 30", "");

    expect(parsed).not.toBeNull();
    expect(parsed?.getHours()).toBe(23);
    expect(parsed?.getMinutes()).toBe(59);
  });
});

import { describe, expect, it } from "@jest/globals";

import {
  DEFAULT_STUDENT_MAJOR,
  getStudentMajorOrDefault,
  getStudentMajorsOrDefault,
} from "./studentDefaults";

describe("studentDefaults", () => {
  it("falls back to the default student major when a single major is missing", () => {
    expect(getStudentMajorOrDefault("")).toBe(DEFAULT_STUDENT_MAJOR);
    expect(getStudentMajorOrDefault("   ")).toBe(DEFAULT_STUDENT_MAJOR);
    expect(getStudentMajorOrDefault()).toBe(DEFAULT_STUDENT_MAJOR);
  });

  it("preserves a saved major when one exists", () => {
    expect(getStudentMajorOrDefault("Mechanical Engineering")).toBe(
      "Mechanical Engineering",
    );
  });

  it("falls back to the default student major when no majors exist", () => {
    expect(getStudentMajorsOrDefault([])).toEqual([DEFAULT_STUDENT_MAJOR]);
    expect(getStudentMajorsOrDefault(["", "  ", null, undefined])).toEqual([
      DEFAULT_STUDENT_MAJOR,
    ]);
  });

  it("preserves saved majors when they exist", () => {
    expect(
      getStudentMajorsOrDefault(["  Mathematics  ", "", "Computer Engineering"]),
    ).toEqual(["Mathematics", "Computer Engineering"]);
  });
});

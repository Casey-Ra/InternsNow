export const DEFAULT_STUDENT_MAJOR = "Computer Science";

export function getStudentMajorOrDefault(major?: string | null): string {
  const normalizedMajor = (major ?? "").trim();
  return normalizedMajor || DEFAULT_STUDENT_MAJOR;
}

export function getStudentMajorsOrDefault(
  majors: Array<string | null | undefined>,
): string[] {
  const normalizedMajors = majors
    .map((major) => (major ?? "").trim())
    .filter(Boolean);

  return normalizedMajors.length > 0
    ? normalizedMajors
    : [DEFAULT_STUDENT_MAJOR];
}

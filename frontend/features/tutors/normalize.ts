import type {
  TutorCertificate,
  TutorEducation,
  TutorExperience,
  TutorProfile,
} from "@/features/tutors/types";

type JsonRecord = Record<string, unknown>;

function decodeJsonString(value: unknown): unknown {
  let decoded = value;

  for (let attempt = 0; attempt < 2 && typeof decoded === "string"; attempt += 1) {
    const candidate = decoded.trim();
    if (!candidate) return "";

    try {
      const parsed: unknown = JSON.parse(candidate);
      if (parsed === decoded) break;
      decoded = parsed;
    } catch {
      break;
    }
  }

  return decoded;
}

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toCandidates(value: unknown): unknown[] {
  const decoded = decodeJsonString(value);
  if (Array.isArray(decoded)) return decoded;
  if (decoded === null || decoded === undefined || decoded === "") return [];
  return [decoded];
}

export function normalizeStringList(value: unknown): string[] {
  return toCandidates(value)
    .flatMap((item) => (typeof item === "string" ? item.split(/[,،]/) : []))
    .map((item) => item.trim())
    .filter(Boolean);
}

export function normalizeLanguagesSpoken(
  value: unknown,
): Array<{ language: string; level: string }> {
  return toCandidates(value).flatMap((item) => {
    if (typeof item === "string") {
      return item.split(/[,،]/).flatMap((entry) => {
        const [languagePart, ...levelParts] = entry.split(":");
        const language = languagePart?.trim();
        if (!language) return [];
        return [{ language, level: levelParts.join(":").trim() }];
      });
    }

    if (!isRecord(item) || typeof item.language !== "string") return [];
    const language = item.language.trim();
    if (!language) return [];

    return [{
      language,
      level: typeof item.level === "string" ? item.level.trim() : "",
    }];
  });
}

function normalizeRecordList<T>(value: unknown): T[] {
  return toCandidates(value).filter(isRecord) as T[];
}

export function normalizeTutorProfile(profile: TutorProfile): TutorProfile {
  const raw = profile as TutorProfile & Record<string, unknown>;

  return {
    ...profile,
    subjects: normalizeStringList(raw.subjects),
    languages_spoken: normalizeLanguagesSpoken(raw.languages_spoken),
    certificates: normalizeRecordList<TutorCertificate>(raw.certificates),
    educations: normalizeRecordList<TutorEducation>(raw.educations),
    experiences: normalizeRecordList<TutorExperience>(raw.experiences),
    courses: raw.courses === undefined ? undefined : normalizeRecordList(raw.courses),
  };
}

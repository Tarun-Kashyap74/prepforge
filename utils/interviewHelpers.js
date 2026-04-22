export const stripCodeFences = (rawText = "") =>
  rawText
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

export const safeJsonParse = (value, fallback = null) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    return fallback;
  }
};

export const parseJsonFromUnknownText = (rawText = "", fallback = null) => {
  if (!rawText || typeof rawText !== "string") return fallback;

  const cleaned = stripCodeFences(rawText)
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .trim();

  const direct = safeJsonParse(cleaned, null);
  if (direct) return direct;

  const firstObject = cleaned.indexOf("{");
  const lastObject = cleaned.lastIndexOf("}");
  if (firstObject >= 0 && lastObject > firstObject) {
    const objectSlice = cleaned.slice(firstObject, lastObject + 1);
    const parsedObject = safeJsonParse(objectSlice, null);
    if (parsedObject) return parsedObject;
  }

  const firstArray = cleaned.indexOf("[");
  const lastArray = cleaned.lastIndexOf("]");
  if (firstArray >= 0 && lastArray > firstArray) {
    const arraySlice = cleaned.slice(firstArray, lastArray + 1);
    const parsedArray = safeJsonParse(arraySlice, null);
    if (parsedArray) return parsedArray;
  }

  return fallback;
};

export const normalizeInterviewPayload = (payload, questionCount = 5) => {
  const interviewQuestions = Array.isArray(payload?.interviewQuestions)
    ? payload.interviewQuestions
    : [];

  if (!interviewQuestions.length) {
    throw new Error("Interview questions were missing from the Gemini response.");
  }

  const interviewMeta = {
    mode: payload?.interviewMeta?.mode || "technical",
    difficulty: payload?.interviewMeta?.difficulty || "mid",
    targetCompany: payload?.interviewMeta?.targetCompany || "General",
    timedModeEnabled: Boolean(payload?.interviewMeta?.timedModeEnabled),
    timePerQuestionSeconds:
      Number(payload?.interviewMeta?.timePerQuestionSeconds) > 0
        ? Number(payload?.interviewMeta?.timePerQuestionSeconds)
        : 0,
    questionCount:
      Number(payload?.interviewMeta?.questionCount) > 0
        ? Number(payload?.interviewMeta?.questionCount)
        : Number(questionCount) || 5,
    preparationTips: Array.isArray(payload?.interviewMeta?.preparationTips)
      ? payload.interviewMeta.preparationTips
      : [],
  };

  const resumeJobMatch = {
    matchScore:
      Number(payload?.resumeJobMatch?.matchScore) >= 0
        ? Number(payload.resumeJobMatch.matchScore)
        : null,
    strengths: Array.isArray(payload?.resumeJobMatch?.strengths)
      ? payload.resumeJobMatch.strengths
      : [],
    gaps: Array.isArray(payload?.resumeJobMatch?.gaps)
      ? payload.resumeJobMatch.gaps
      : [],
    summary: payload?.resumeJobMatch?.summary || "",
  };

  const normalizedQuestions = interviewQuestions.map((question, index) => ({
    question: question?.question || `Question ${index + 1}`,
    answer: question?.answer || "No sample answer generated.",
    type: question?.type || "general",
    difficulty: question?.difficulty || interviewMeta.difficulty,
    hints: Array.isArray(question?.hints) ? question.hints : [],
    followUps: Array.isArray(question?.followUps) ? question.followUps : [],
  }));

  return {
    interviewMeta,
    resumeJobMatch,
    interviewQuestions: normalizedQuestions,
    finalMockReportTemplate: payload?.finalMockReportTemplate || {},
  };
};

export const parseStoredInterviewPayload = (jsonMockResp, fallbackCount = 5) => {
  const parsed = safeJsonParse(jsonMockResp, null);

  if (!parsed) {
    return {
      interviewMeta: {
        mode: "technical",
        difficulty: "mid",
        targetCompany: "General",
        timedModeEnabled: false,
        timePerQuestionSeconds: 0,
        questionCount: fallbackCount,
        preparationTips: [],
      },
      resumeJobMatch: {
        matchScore: null,
        strengths: [],
        gaps: [],
        summary: "",
      },
      interviewQuestions: [],
      finalMockReportTemplate: {},
    };
  }

  if (Array.isArray(parsed?.interviewQuestions) && !parsed?.interviewMeta) {
    return normalizeInterviewPayload(
      { interviewQuestions: parsed.interviewQuestions },
      fallbackCount
    );
  }

  return normalizeInterviewPayload(parsed, fallbackCount);
};

export const parseFeedbackPayload = (feedbackText = "", ratingValue = "") => {
  const parsed = safeJsonParse(feedbackText, null);

  if (!parsed || typeof parsed !== "object") {
    return {
      rating: Number(ratingValue) || null,
      summary: feedbackText || "No feedback generated.",
      idealAnswer: "",
      breakdown: null,
      star: null,
      nextSteps: [],
    };
  }

  return {
    rating:
      Number(parsed?.rating) >= 0
        ? Number(parsed.rating)
        : Number(ratingValue) || null,
    summary: parsed?.summary || parsed?.feedback || "No feedback generated.",
    idealAnswer: parsed?.idealAnswer || "",
    breakdown: parsed?.breakdown || null,
    star: parsed?.starCoaching || null,
    nextSteps: Array.isArray(parsed?.nextSteps) ? parsed.nextSteps : [],
  };
};

export const calculateCurrentStreak = (dateStrings = []) => {
  if (!dateStrings.length) return 0;

  const dateSet = new Set(
    dateStrings
      .map((value) => {
        const [day, month, year] = String(value).split("-");
        if (!day || !month || !year) return null;
        return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
      })
      .filter(Boolean)
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (true) {
    const iso = cursor.toISOString().slice(0, 10);
    if (!dateSet.has(iso)) break;
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};

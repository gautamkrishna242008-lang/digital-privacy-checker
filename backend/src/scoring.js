/**
 * scoring.js
 * -----------------------------------------------------------------------
 * A transparent, rule-based privacy scoring engine.
 *
 * Every point lost traces back to a specific rule defined in the weight
 * tables below — nothing here is a black box / learned model, by design
 * (see README "Why these choices").
 *
 * All functions are pure: same input always produces the same output,
 * with no side effects. That also makes this file easy to unit test.
 * -----------------------------------------------------------------------
 */

// ---- Category weights (must sum to 100) --------------------------------
const CATEGORY_WEIGHTS = {
  permissions: 25,
  dataCollection: 25,
  tracking: 20,
  dataSharing: 20,
  dataRetention: 10,
};

// ---- Permissions: risk points per permission if granted ----------------
const PERMISSION_WEIGHTS = {
  camera: 10,
  microphone: 10,
  location: 12,
  biometrics: 16,
  contacts: 8,
  sms: 8,
  storage: 4,
};

// ---- Data collection: risk points per data type collected ---------------
const DATA_COLLECTION_WEIGHTS = {
  name: 6,
  email: 8,
  phone: 8,
  financial: 14,
  health: 14,
  browsingHistory: 10,
  deviceId: 6,
};

// ---- Tracking: risk points per tracking method present -------------------
const TRACKING_WEIGHTS = {
  cookies: 6,
  analytics: 8,
  adTrackers: 10,
  fingerprinting: 12,
};

// ---- Data sharing: one selection, risk points per option -----------------
const DATA_SHARING_WEIGHTS = {
  none: 0,
  partners: 15,
  public: 30,
  unknown: 25,
};

// ---- Data retention: one selection, risk points per option ---------------
const DATA_RETENTION_WEIGHTS = {
  session: 0,
  limited: 10,
  indefinite: 25,
  unknown: 20,
};

const MAX_POINTS = {
  permissions: sum(Object.values(PERMISSION_WEIGHTS)),
  dataCollection: sum(Object.values(DATA_COLLECTION_WEIGHTS)),
  tracking: sum(Object.values(TRACKING_WEIGHTS)),
  dataSharing: Math.max(...Object.values(DATA_SHARING_WEIGHTS)),
  dataRetention: Math.max(...Object.values(DATA_RETENTION_WEIGHTS)),
};

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

/**
 * Scores a boolean-map category (permissions / dataCollection / tracking)
 * against its weight table.
 * Returns { score (0-100), pointsTriggered, maxPoints, triggered: [keys] }
 */
function scoreBooleanCategory(inputMap, weightTable, maxPoints) {
  const triggered = [];
  let pointsTriggered = 0;

  for (const key of Object.keys(weightTable)) {
    if (inputMap && inputMap[key]) {
      pointsTriggered += weightTable[key];
      triggered.push(key);
    }
  }

  const score = maxPoints === 0 ? 100 : 100 - (pointsTriggered / maxPoints) * 100;

  return {
    score: round(score),
    pointsTriggered,
    maxPoints,
    triggered,
  };
}

/**
 * Scores a single-choice category (dataSharing / dataRetention).
 */
function scoreChoiceCategory(choice, weightTable, maxPoints) {
  const key = weightTable.hasOwnProperty(choice) ? choice : "unknown";
  const pointsTriggered = weightTable[key];
  const score = maxPoints === 0 ? 100 : 100 - (pointsTriggered / maxPoints) * 100;

  return {
    score: round(score),
    pointsTriggered,
    maxPoints,
    selected: key,
  };
}

function round(n) {
  return Math.round(n * 10) / 10;
}

function riskLevelFor(score) {
  if (score >= 75) return "Low";
  if (score >= 45) return "Medium";
  return "High";
}

/**
 * Builds plain-language concerns for anything that lowered the score.
 */
function buildConcerns({ permissions, dataCollection, tracking, dataSharing, dataRetention }) {
  const concerns = [];

  const PERMISSION_LABELS = {
    camera: "Camera access",
    microphone: "Microphone access",
    location: "Precise location access",
    biometrics: "Biometric data access (fingerprint/face)",
    contacts: "Access to your contacts list",
    sms: "Access to SMS messages",
    storage: "Access to device storage",
  };
  permissions.triggered.forEach((key) => {
    concerns.push(`${PERMISSION_LABELS[key]} is requested, which increases exposure if misused.`);
  });

  const DATA_LABELS = {
    name: "your name",
    email: "your email address",
    phone: "your phone number",
    financial: "financial information",
    health: "health information",
    browsingHistory: "your browsing history",
    deviceId: "your device identifier",
  };
  if (dataCollection.triggered.length) {
    const items = dataCollection.triggered.map((k) => DATA_LABELS[k]).join(", ");
    concerns.push(`This service collects ${items}.`);
  }

  const TRACKING_LABELS = {
    cookies: "tracking cookies",
    analytics: "third-party analytics",
    adTrackers: "advertising trackers",
    fingerprinting: "device fingerprinting (a hard-to-block tracking method)",
  };
  tracking.triggered.forEach((key) => {
    concerns.push(`Uses ${TRACKING_LABELS[key]}.`);
  });

  if (dataSharing.selected === "partners") {
    concerns.push("Your data may be shared with third-party partners.");
  } else if (dataSharing.selected === "public") {
    concerns.push("Some of your data may be made public.");
  } else if (dataSharing.selected === "unknown") {
    concerns.push("It's unclear whether or how your data is shared — treat this as a risk.");
  }

  if (dataRetention.selected === "indefinite") {
    concerns.push("Your data may be retained indefinitely, with no automatic deletion.");
  } else if (dataRetention.selected === "unknown") {
    concerns.push("It's unclear how long your data is retained — treat this as a risk.");
  } else if (dataRetention.selected === "limited") {
    concerns.push("Data is retained for a limited period rather than deleted immediately.");
  }

  return concerns;
}

/**
 * Builds actionable, plain-language recommendations based on what was flagged.
 */
function buildRecommendations({ permissions, dataCollection, tracking, dataSharing, dataRetention }) {
  const recs = [];

  if (permissions.triggered.includes("biometrics")) {
    recs.push("Avoid enabling biometric login unless strictly necessary; prefer a strong passphrase instead.");
  }
  if (permissions.triggered.includes("location")) {
    recs.push("Set location access to 'while using the app' rather than 'always', or deny it if not essential.");
  }
  if (permissions.triggered.length) {
    recs.push("Review app permissions in your device settings and revoke any that aren't essential to core functionality.");
  }

  if (tracking.triggered.includes("fingerprinting") || tracking.triggered.includes("adTrackers")) {
    recs.push("Consider a privacy-focused browser or tracker-blocking extension to limit fingerprinting and ad tracking.");
  }
  if (tracking.triggered.includes("cookies")) {
    recs.push("Regularly clear cookies or use private/incognito browsing for this service.");
  }

  if (dataSharing.selected === "partners" || dataSharing.selected === "public" || dataSharing.selected === "unknown") {
    recs.push("Check the service's privacy policy for an opt-out of third-party data sharing, if one is offered.");
  }

  if (dataRetention.selected === "indefinite" || dataRetention.selected === "unknown") {
    recs.push("Where possible, request account/data deletion periodically rather than relying on automatic expiry.");
  }

  if (dataCollection.triggered.includes("financial") || dataCollection.triggered.includes("health")) {
    recs.push("Sensitive data (financial/health) is being collected — only proceed if the service is reputable and necessary.");
  }

  if (!recs.length) {
    recs.push("No major issues found — this service's stated practices look relatively privacy-respecting.");
  }

  return recs;
}

/**
 * Main entry point: takes the raw request body and returns a full report.
 */
function calculatePrivacyScore(input) {
  const permissions = scoreBooleanCategory(input.permissions, PERMISSION_WEIGHTS, MAX_POINTS.permissions);
  const dataCollection = scoreBooleanCategory(input.dataCollection, DATA_COLLECTION_WEIGHTS, MAX_POINTS.dataCollection);
  const tracking = scoreBooleanCategory(input.tracking, TRACKING_WEIGHTS, MAX_POINTS.tracking);
  const dataSharing = scoreChoiceCategory(input.dataSharing, DATA_SHARING_WEIGHTS, MAX_POINTS.dataSharing);
  const dataRetention = scoreChoiceCategory(input.dataRetention, DATA_RETENTION_WEIGHTS, MAX_POINTS.dataRetention);

  const categories = { permissions, dataCollection, tracking, dataSharing, dataRetention };

  const overallScore = round(
    (permissions.score * CATEGORY_WEIGHTS.permissions +
      dataCollection.score * CATEGORY_WEIGHTS.dataCollection +
      tracking.score * CATEGORY_WEIGHTS.tracking +
      dataSharing.score * CATEGORY_WEIGHTS.dataSharing +
      dataRetention.score * CATEGORY_WEIGHTS.dataRetention) /
      100
  );

  const riskLevel = riskLevelFor(overallScore);
  const concerns = buildConcerns(categories);
  const recommendations = buildRecommendations(categories);

  return {
    overallScore,
    riskLevel,
    categories: {
      permissions: { score: permissions.score, weight: CATEGORY_WEIGHTS.permissions, triggered: permissions.triggered },
      dataCollection: { score: dataCollection.score, weight: CATEGORY_WEIGHTS.dataCollection, triggered: dataCollection.triggered },
      tracking: { score: tracking.score, weight: CATEGORY_WEIGHTS.tracking, triggered: tracking.triggered },
      dataSharing: { score: dataSharing.score, weight: CATEGORY_WEIGHTS.dataSharing, selected: dataSharing.selected },
      dataRetention: { score: dataRetention.score, weight: CATEGORY_WEIGHTS.dataRetention, selected: dataRetention.selected },
    },
    concerns,
    recommendations,
  };
}

module.exports = {
  calculatePrivacyScore,
  CATEGORY_WEIGHTS,
  PERMISSION_WEIGHTS,
  DATA_COLLECTION_WEIGHTS,
  TRACKING_WEIGHTS,
  DATA_SHARING_WEIGHTS,
  DATA_RETENTION_WEIGHTS,
};

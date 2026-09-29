// api.js - Centralized API calls & client-side reactive scoring engine

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function handleResponse(res) {
  if (!res.ok) {
    let details = null;
    try {
      details = await res.json();
    } catch {
      // response wasn't JSON; ignore
    }
    const message = details?.error || `Request failed with status ${res.status}`;
    const error = new Error(message);
    error.details = details;
    throw error;
  }
  return res.json();
}

/**
 * Scan a website URL automatically for permissions, headers, and trackers
 */
export async function scanUrl(url) {
  const res = await fetch(`${API_URL}/api/scan-url`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  return handleResponse(res);
}

/**
 * Submit manual permission and data audit
 */
export async function analyzeSite(payload) {
  const res = await fetch(`${API_URL}/api/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return handleResponse(res);
}

/**
 * Fetch past audit history from SQLite database
 */
export async function getHistory() {
  const res = await fetch(`${API_URL}/api/history`);
  return handleResponse(res);
}

/**
 * Fetch a specific past audit by ID
 */
export async function getHistoryItem(id) {
  const res = await fetch(`${API_URL}/api/history/${id}`);
  return handleResponse(res);
}

/**
 * Fetch aggregate platform stats
 */
export async function getStats() {
  const res = await fetch(`${API_URL}/api/stats`);
  return handleResponse(res);
}

// -------------------------------------------------------------
// Pure client-side privacy scoring engine for INSTANT 0ms reaction
// Mirrors backend scoring.js with 100% mathematical fidelity
// -------------------------------------------------------------
const CATEGORY_WEIGHTS = {
  permissions: 25,
  dataCollection: 25,
  tracking: 20,
  dataSharing: 20,
  dataRetention: 10,
};

const PERMISSION_WEIGHTS = {
  camera: 10,
  microphone: 10,
  location: 12,
  biometrics: 16,
  contacts: 8,
  sms: 8,
  storage: 4,
};

const DATA_COLLECTION_WEIGHTS = {
  name: 6,
  email: 8,
  phone: 8,
  financial: 14,
  health: 14,
  browsingHistory: 10,
  deviceId: 6,
};

const TRACKING_WEIGHTS = {
  cookies: 6,
  analytics: 8,
  adTrackers: 10,
  fingerprinting: 12,
};

const DATA_SHARING_WEIGHTS = {
  none: 0,
  partners: 15,
  public: 30,
  unknown: 25,
};

const DATA_RETENTION_WEIGHTS = {
  session: 0,
  limited: 10,
  indefinite: 25,
  unknown: 20,
};

function sum(arr) {
  return arr.reduce((a, b) => a + b, 0);
}

const MAX_POINTS = {
  permissions: sum(Object.values(PERMISSION_WEIGHTS)),
  dataCollection: sum(Object.values(DATA_COLLECTION_WEIGHTS)),
  tracking: sum(Object.values(TRACKING_WEIGHTS)),
  dataSharing: Math.max(...Object.values(DATA_SHARING_WEIGHTS)),
  dataRetention: Math.max(...Object.values(DATA_RETENTION_WEIGHTS)),
};

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
    score: Math.round(score * 10) / 10,
    pointsTriggered,
    maxPoints,
    triggered,
  };
}

function scoreChoiceCategory(choice, weightTable, maxPoints) {
  const key = weightTable.hasOwnProperty(choice) ? choice : "unknown";
  const pointsTriggered = weightTable[key];
  const score = maxPoints === 0 ? 100 : 100 - (pointsTriggered / maxPoints) * 100;

  return {
    score: Math.round(score * 10) / 10,
    pointsTriggered,
    maxPoints,
    selected: key,
  };
}

export function clientCalculatePrivacyScore(input) {
  const permissions = scoreBooleanCategory(input.permissions, PERMISSION_WEIGHTS, MAX_POINTS.permissions);
  const dataCollection = scoreBooleanCategory(input.dataCollection, DATA_COLLECTION_WEIGHTS, MAX_POINTS.dataCollection);
  const tracking = scoreBooleanCategory(input.tracking, TRACKING_WEIGHTS, MAX_POINTS.tracking);
  const dataSharing = scoreChoiceCategory(input.dataSharing, DATA_SHARING_WEIGHTS, MAX_POINTS.dataSharing);
  const dataRetention = scoreChoiceCategory(input.dataRetention, DATA_RETENTION_WEIGHTS, MAX_POINTS.dataRetention);

  const overallScore = Math.round(
    (permissions.score * CATEGORY_WEIGHTS.permissions +
      dataCollection.score * CATEGORY_WEIGHTS.dataCollection +
      tracking.score * CATEGORY_WEIGHTS.tracking +
      dataSharing.score * CATEGORY_WEIGHTS.dataSharing +
      dataRetention.score * CATEGORY_WEIGHTS.dataRetention) /
      100
  );

  let riskLevel = "Low";
  if (overallScore < 45) riskLevel = "High";
  else if (overallScore < 75) riskLevel = "Medium";

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
  };
}

export {
  API_URL,
  PERMISSION_WEIGHTS,
  DATA_COLLECTION_WEIGHTS,
  TRACKING_WEIGHTS,
};

import { AppSettings, CallHistory } from "src/common/types";
import { Buffer } from "buffer";

// Settings
const SETTINGS_KEY = "SettingsKey";

export const saveSettings = (settings: AppSettings) => {
  const encoded = Buffer.from(JSON.stringify(settings), "utf-8").toString(
    "base64"
  );

  localStorage.setItem(SETTINGS_KEY, encoded);
};

export const getSettings = (): AppSettings => {
  const str = localStorage.getItem(SETTINGS_KEY);
  if (str) {
    const planText = Buffer.from(str, "base64").toString("utf-8");
    return JSON.parse(planText) as AppSettings;
  }
  return {} as AppSettings;
};

// Call History
const historyKey = "History";
const MAX_HISTORY_COUNT = 20;
export const saveCallHistory = (username: string, call: CallHistory) => {
  const str = localStorage.getItem(`${username}_${historyKey}`);
  let calls: CallHistory[] = [];
  if (str) {
    const c = Buffer.from(str, "base64").toString("utf-8");
    calls = JSON.parse(c);
  }
  calls.unshift(call);

  if (calls.length > MAX_HISTORY_COUNT) {
    calls = calls.slice(0, MAX_HISTORY_COUNT);
  }
  const saveStr = JSON.stringify(calls);
  const encoded = Buffer.from(saveStr, "utf-8").toString("base64");
  localStorage.setItem(`${username}_${historyKey}`, encoded);
};

export const isSaveCallHistory = (
  username: string,
  callSid: string,
  isSaved: boolean
) => {
  const calls = getCallHistories(username).map((c) => {
    if (c.callSid === callSid) {
      return { ...c, isSaved };
    } else {
      return c;
    }
  });
  const saveStr = JSON.stringify(calls);
  const encoded = Buffer.from(saveStr, "utf-8").toString("base64");
  localStorage.setItem(`${username}_${historyKey}`, encoded);
};

export const getCallHistories = (username: string): CallHistory[] => {
  const str = localStorage.getItem(`${username}_${historyKey}`);
  if (str) {
    const c = Buffer.from(str, "base64").toString("utf-8");
    return JSON.parse(c);
  }

  return [];
};

// Current Call
const currentCallKey = "CurrentCall";
export const saveCurrentCall = (call: CallHistory) => {
  sessionStorage.setItem(currentCallKey, JSON.stringify(call));
};

export const getCurrentCall = (): CallHistory | null => {
  const str = sessionStorage.getItem(currentCallKey);
  if (str) {
    return JSON.parse(str);
  }
  return null;
};

export const deleteCurrentCall = () => {
  sessionStorage.removeItem(currentCallKey);
};

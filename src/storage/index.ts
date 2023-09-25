import { AppSettings } from "src/common/types";
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

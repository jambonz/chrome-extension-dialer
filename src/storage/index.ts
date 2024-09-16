import {
  AdvancedAppSettings,
  AppSettings,
  CallHistory,
  ConferenceSettings,
  IAdvancedAppSettings,
  IAppSettings,
} from "src/common/types";
import { Buffer } from "buffer";

// Conference settings
const CONFERENCE_SETTINGS = "ConferenceSettingsKey";

export const saveConferenceSettings = (settings: ConferenceSettings) => {
  sessionStorage.setItem(CONFERENCE_SETTINGS, JSON.stringify(settings));
};

export const getConferenceSettings = (): ConferenceSettings => {
  return JSON.parse(
    sessionStorage.getItem(CONFERENCE_SETTINGS) || "{}"
  ) as ConferenceSettings;
};

export const deleteConferenceSettings = () => {
  sessionStorage.removeItem(CONFERENCE_SETTINGS);
};
// Settings
const SETTINGS_KEY = "SettingsKey";

interface saveSettingFormat {
  active: boolean;
  encoded: string;
  id: number;
}

export const saveSettings = (settings: AppSettings) => {
  const encoded = Buffer.from(JSON.stringify(settings), "utf-8").toString(
    "base64"
  );

  const str = localStorage.getItem(SETTINGS_KEY);

  const parsed = str ? JSON.parse(str) : [];
  const newItem = {
    id: parsed.length + 1,
    encoded,
    active: parsed.length === 0,
  };

  localStorage.setItem(SETTINGS_KEY, JSON.stringify([...parsed, newItem]));
};

export const editSettings = (settings: AppSettings, id: number) => {
  const encoded = Buffer.from(JSON.stringify(settings), "utf-8").toString(
    "base64"
  );

  const str = localStorage.getItem(SETTINGS_KEY);
  if (str) {
    const parsed = JSON.parse(str);

    // for edit:
    const newData = parsed.map((el: saveSettingFormat) => {
      if (el.id === id)
        return {
          id: el.id,
          active: el.active,
          encoded: encoded,
        };
      else return el;
    });

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newData));
  }
};
export const setActiveSettings = (id: number) => {
  const str = localStorage.getItem(SETTINGS_KEY);

  if (str) {
    const parsed = JSON.parse(str);

    const newData = parsed.map((el: saveSettingFormat) => ({
      ...el,
      active: el.id === id,
    }));

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newData));
  }
};

export const deleteSettings = (id: number) => {
  const str = localStorage.getItem(SETTINGS_KEY);
  if (str) {
    const parsed = JSON.parse(str);

    // for edit:
    const newData = parsed.filter((el: saveSettingFormat) => el.id !== id);

    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newData));
  }
};

export const getSettings = (): IAppSettings[] => {
  const str = localStorage.getItem(SETTINGS_KEY);
  if (str) {
    const data: { active: boolean; encoded: string; id: number }[] =
      JSON.parse(str);
    const decoded: IAppSettings[] = data.map((el) => {
      return {
        active: el.active,
        decoded: JSON.parse(
          Buffer.from(el.encoded, "base64").toString("utf-8")
        ),
        id: el.id,
      };
    });
    return decoded;
  }
  return [] as IAppSettings[];
};

export const getActiveSettings = (): IAppSettings => {
  const str = localStorage.getItem(SETTINGS_KEY);
  if (str) {
    const parsed: { active: boolean; encoded: string; id: number }[] =
      JSON.parse(str);

    const activeSettings = parsed.find((el) => el.active);
    if (activeSettings) {
      const decoded = {
        active: activeSettings?.active,
        decoded: JSON.parse(
          Buffer.from(activeSettings.encoded, "base64").toString("utf-8")
        ),
        id: activeSettings.id,
      };
      return decoded as IAppSettings;
    }
  }
  return {} as IAppSettings;
};

// Advanced settings
const ADVANCED_SETTINGS_KET = "AdvancedSettingsKey";

export const saveAddvancedSettings = (settings: AdvancedAppSettings) => {
  const encoded = Buffer.from(JSON.stringify(settings), "utf-8").toString(
    "base64"
  );

  const str = localStorage.getItem(ADVANCED_SETTINGS_KET);
  const data = str ? JSON.parse(str) : [];

  if (data.some((el: { encoded: string }) => el.encoded === encoded)) return;

  data.push({ encoded, active: data.length === 0, id: data.length + 1 });
  localStorage.setItem(ADVANCED_SETTINGS_KET, JSON.stringify(data));
};

export const getAdvancedSettings = (): IAdvancedAppSettings[] => {
  const str = localStorage.getItem(ADVANCED_SETTINGS_KET);

  if (str) {
    const data: { active: boolean; encoded: string; id: number }[] =
      JSON.parse(str);
    const decoded: IAdvancedAppSettings[] = data.map((el) => {
      return {
        active: el.active,
        decoded: JSON.parse(
          Buffer.from(el.encoded, "base64").toString("utf-8")
        ),
        id: el.id,
      };
    });
    return decoded;
  }
  return [] as IAdvancedAppSettings[];
};
export const getActiveAdvancedSettings = (): IAdvancedAppSettings => {
  const str = localStorage.getItem(ADVANCED_SETTINGS_KET);

  if (str) {
    const data: { active: boolean; encoded: string; id: number }[] =
      JSON.parse(str);
    const decoded: IAdvancedAppSettings[] = data.map((el) => {
      return {
        active: el.active,
        decoded: JSON.parse(
          Buffer.from(el.encoded, "base64").toString("utf-8")
        ),
        id: el.id,
      };
    });
    return decoded.find((el) => el.active) as IAdvancedAppSettings;
  }
  return {} as IAdvancedAppSettings;
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

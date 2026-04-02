import { CallState } from "@jambonz/client-sdk-web";
import { deleteWindowIdKey, getWindowIdKey, saveWindowIdKey } from "./storage";
import { PhoneNumberFormat, PhoneNumberUtil } from "google-libphonenumber";

export const formatPhoneNumber = (number: string) => {
  try {
    const phoneUtil = PhoneNumberUtil.getInstance();

    const phoneNumber = phoneUtil.parse(number, "US");
    return phoneUtil.format(phoneNumber, PhoneNumberFormat.NATIONAL);
  } catch (error) {}
  return number;
};

export const openPhonePopup = () => {
  return new Promise((resolve) => {
    const runningPhoneWindowId = getWindowIdKey();
    if (runningPhoneWindowId) {
      chrome.windows.update(runningPhoneWindowId, { focused: true }, () => {
        if (chrome.runtime.lastError) {
          deleteWindowIdKey();
          initiateNewPhonePopup(resolve);
        }
        resolve(1);
      });
    } else {
      initiateNewPhonePopup(resolve);
    }
  });
};

const initiateNewPhonePopup = (callback: (v: unknown) => void) => {
  const cfg: chrome.windows.CreateData = {
    url: chrome.runtime.getURL("window/index.html"),
    width: 440,
    height: 720,
    focused: true,
    type: "panel",
    state: "normal",
  };
  chrome.windows.create(cfg, (w) => {
    callback(1);
    if (w && w.id) saveWindowIdKey(w.id);
  });
};

export const isSipClientRinging = (callState: CallState | null) => {
  return callState === CallState.Ringing || callState === CallState.Connecting;
};

export const isSipClientAnswered = (callState: CallState | null) => {
  return callState === CallState.Connected;
};

export const isSipClientIdle = (callState: CallState | null) => {
  return callState === null || callState === CallState.Idle || callState === CallState.Ended;
};

export const normalizeUrl = (input: string): string => {
  // Extract the domain name
  const url = new URL(input.startsWith("http") ? input : `https://${input}`);

  // Return the fully formed URL
  return `${url.protocol}//${url.hostname}/api/v1`;
};

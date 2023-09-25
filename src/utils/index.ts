import { SipConstants } from "./../lib";
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
    width: 300,
    height: 630,
    focused: true,
    type: "panel",
    state: "normal",
  };
  chrome.windows.create(cfg, (w) => {
    callback(1);
    if (w && w.id) saveWindowIdKey(w.id);
  });
};

export const isSipClientRinging = (callStatus: string) => {
  return callStatus === SipConstants.SESSION_RINGING;
};

export const isSipClientAnswered = (callStatus: string) => {
  return callStatus === SipConstants.SESSION_ANSWERED;
};

export const isSipClientIdle = (callStatus: string) => {
  return (
    callStatus === SipConstants.SESSION_ENDED ||
    callStatus === SipConstants.SESSION_FAILED
  );
};

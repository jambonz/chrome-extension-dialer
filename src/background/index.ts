chrome.action.onClicked.addListener(async (tab) => {
  const windowId = await getWindowKey();
  if (windowId) {
    if (windowId) {
      chrome.windows.update(windowId, { focused: true }, (w) => {
        if (!w) {
          initiateNewPhonePopup();
        }
      });
    } else {
      initiateNewPhonePopup();
    }
  } else {
    initiateNewPhonePopup();
  }
});

const initiateNewPhonePopup = () => {
  chrome.windows.create(
    {
      url: chrome.runtime.getURL("window/index.html"),
      width: 440,
      height: 720,
      focused: true,
      type: "panel",
      state: "normal",
    },
    function (window) {
      if (window?.id) {
        saveWindowKey(window?.id);
      }
    }
  );
};

const saveWindowKey = async (id: number) => {
  await chrome.storage.local.set({
    WindowKey: id,
  });
};

const getWindowKey = async (): Promise<number> => {
  const result = await chrome.storage.local.get(["WindowKey"]);
  return result.WindowKey as number;
};

export {};

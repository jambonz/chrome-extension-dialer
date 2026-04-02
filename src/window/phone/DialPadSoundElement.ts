export default class DialPadAudioElements {
  private keySounds: { [key: string]: HTMLAudioElement | undefined } = {};

  constructor() {
    const keys = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "#"];
    const fileMap: Record<string, string> = {
      "*": "star",
      "#": "hash",
    };

    for (const key of keys) {
      const fileName = fileMap[key] || key;
      let audioURL;

      // Check if we're in a Chrome extension
      if (
        typeof chrome !== "undefined" &&
        chrome.runtime &&
        chrome.runtime.getURL
      ) {
        audioURL = chrome.runtime.getURL(`audios/dtmf-${fileName}.mp3`);
      } else {
        // We're in a web context, adjust this path as necessary
        audioURL = `/audios/dtmf-${fileName}.mp3`;
      }

      this.keySounds[key] = new Audio(audioURL);
      const audio = this.keySounds[key];
      if (audio) {
        audio.volume = 0.5;
      }
    }
  }

  playKeyTone(key: string): void {
    const audio = this.keySounds[key];
    if (audio) {
      if (!audio.paused) {
        audio.pause();
        audio.currentTime = 0;
      }
      audio.play();
    }
  }
}

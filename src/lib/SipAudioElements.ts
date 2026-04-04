export default class SipAudioElements {
  #ringing: HTMLAudioElement;
  #ringBack: HTMLAudioElement;
  #failed: HTMLAudioElement;
  #hungup: HTMLAudioElement;
  #localHungup: HTMLAudioElement;

  constructor() {
    this.#ringing = this.getAudio("audios/ringing.mp3");
    this.#ringing.loop = true;
    this.#ringing.volume = 0.8;
    this.#ringBack = this.getAudio("audios/us-ringback.mp3");
    this.#ringBack.loop = true;
    this.#ringBack.volume = 0.8;
    this.#failed = this.getAudio("audios/call-failed.mp3");
    this.#failed.volume = 0.3;
    this.#hungup = this.getAudio("audios/remote-party-hungup-tone.mp3");
    this.#hungup.volume = 0.3;
    this.#localHungup = this.getAudio("audios/local-party-hungup-tone.mp3");
    this.#localHungup.volume = 0.3;
  }

  private getAudio(path: string) {
    let audioURL;

    // Check if we're in a Chrome extension
    if (
      typeof chrome !== "undefined" &&
      chrome.runtime &&
      chrome.runtime.getURL
    ) {
      audioURL = chrome.runtime.getURL(path);
    } else {
      // We're in a web context, adjust this path as necessary
      audioURL = `/${path}`;
    }

    return new Audio(audioURL);
  }

  playLocalHungup() {
    this.pauseRingback();
    this.pauseRinging();
    this.#localHungup.play();
  }

  playRinging(): void {
    this.#ringing.play();
  }

  pauseRinging(): void {
    if (!this.#ringing.paused) {
      this.#ringing.pause();
    }
  }

  playRingback(): void {
    this.#ringBack.play();
  }

  pauseRingback(): void {
    if (!this.#ringBack.paused) {
      this.#ringBack.pause();
    }
  }

  playFailed(): void {
    this.pauseRinging();
    this.pauseRingback();
    this.#failed.play();
  }

  playRemotePartyHungup(): void {
    this.#hungup.play();
  }

  playAnswer(): void {
    this.pauseRinging();
    this.pauseRingback();
  }

  stopAll() {
    this.pauseRinging();
    this.pauseRingback();
    this.#ringing.currentTime = 0;
    this.#ringBack.currentTime = 0;
  }
}

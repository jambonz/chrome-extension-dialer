export default class SipAudioElements {
  #ringing: HTMLAudioElement;
  #ringBack: HTMLAudioElement;
  #failed: HTMLAudioElement;
  #busy: HTMLAudioElement;
  #remote: HTMLAudioElement;
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
    this.#busy = this.getAudio("audios/us-busy-signal.mp3");
    this.#busy.volume = 0.3;
    this.#hungup = this.getAudio("audios/remote-party-hungup-tone.mp3");
    this.#hungup.volume = 0.3;
    this.#localHungup = this.getAudio("audios/local-party-hungup-tone.mp3");
    this.#localHungup.volume = 0.3;
    this.#remote = new Audio();
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

  playLocalHungup(volume: number | undefined) {
    this.pauseRingback();
    this.pauseRinging();
    if (volume) {
      this.#localHungup.volume = volume;
    }
    this.#localHungup.play();
  }

  playRinging(volume: number | undefined): void {
    if (volume) {
      this.#ringing.volume = volume;
    }
    this.#ringing.play();
  }

  pauseRinging(): void {
    if (!this.#ringing.paused) {
      this.#ringing.pause();
    }
  }

  playRingback(volume: number | undefined): void {
    if (volume) {
      this.#ringBack.volume = volume;
    }
    this.#ringBack.play();
  }

  pauseRingback(): void {
    if (!this.#ringBack.paused) {
      this.#ringBack.pause();
    }
  }

  playFailed(volume: number | undefined): void {
    this.pauseRinging();
    this.pauseRingback();
    if (volume) {
      this.#failed.volume = volume;
    }
    this.#failed.play();
  }

  playRemotePartyHungup(volume: number | undefined): void {
    if (volume) {
      this.#hungup.volume = volume;
    }
    this.#hungup.play();
  }

  playAnswer(volume: number | undefined): void {
    this.pauseRinging();
    this.pauseRingback();
  }

  isRemoteAudioPaused(): boolean {
    return this.#remote.paused;
  }

  playRemote(stream: MediaStream) {
    this.#remote.srcObject = stream;
    this.#remote.play();
  }

  stopAll() {
    this.pauseRinging();
    this.pauseRingback();
  }

  isPLaying(audio: HTMLAudioElement) {
    return (
      audio.currentTime > 0 &&
      !audio.paused &&
      !audio.ended &&
      audio.readyState > audio.HAVE_CURRENT_DATA
    );
  }
}

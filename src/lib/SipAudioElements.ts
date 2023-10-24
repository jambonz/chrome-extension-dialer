export default class SipAudioElements {
  #ringing: HTMLAudioElement;
  #ringBack: HTMLAudioElement;
  #failed: HTMLAudioElement;
  #busy: HTMLAudioElement;
  #remote: HTMLAudioElement;
  #hungup: HTMLAudioElement;

  constructor() {
    this.#ringing = new Audio(chrome.runtime.getURL("audios/ringing.mp3"));
    this.#ringing.loop = true;
    this.#ringing.volume = 0.8;
    this.#ringBack = new Audio(chrome.runtime.getURL("audios/us-ringback.mp3"));
    this.#ringBack.loop = true;
    this.#ringBack.volume = 0.8;
    this.#failed = new Audio(chrome.runtime.getURL("audios/call-failed.mp3"));
    this.#failed.volume = 0.3;
    this.#busy = new Audio(chrome.runtime.getURL("audios/us-busy-signal.mp3"));
    this.#busy.volume = 0.3;
    this.#hungup = new Audio(
      chrome.runtime.getURL("audios/remote-party-hungup-tone.mp3")
    );
    this.#hungup.volume = 0.3;
    this.#remote = new Audio();
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

export default class SipAudioElements {
  #ringing: HTMLAudioElement;
  #failed: HTMLAudioElement;
  #answer: HTMLAudioElement;
  #remote: HTMLAudioElement;

  constructor() {
    this.#ringing = new Audio(chrome.runtime.getURL("audios/ringing.mp3"));
    this.#ringing.loop = true;
    this.#ringing.volume = 0.8;
    this.#failed = new Audio(chrome.runtime.getURL("audios/failed.mp3"));
    this.#failed.volume = 0.3;
    this.#answer = new Audio(chrome.runtime.getURL("audios/failed.mp3"));
    this.#answer.volume = 0.3;
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

  playFailed(volume: number | undefined): void {
    this.pauseRinging();
    if (volume) {
      this.#failed.volume = volume;
    }
    this.#failed.play();
  }

  playAnswer(volume: number | undefined): void {
    this.pauseRinging();
    // if (volume) {
    //   this.#answer.volume = volume;
    // }
    // this.#answer.play();
  }

  isRemoteAudioPaused(): boolean {
    return this.#remote.paused;
  }

  playRemote(stream: MediaStream) {
    this.#remote.srcObject = stream;
    this.#remote.play();
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

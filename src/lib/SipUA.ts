import * as events from "events";
import { UA, WebSocketInterface, debug } from "jssip";
import { DisconnectEvent } from "jssip/lib/WebSocketInterface";
import { RTCSession } from "jssip/lib/RTCSession";
import {
  ConnectedEvent,
  IncomingRTCSessionEvent,
  RegisteredEvent,
  UAConnectingEvent,
  UnRegisteredEvent,
} from "jssip/lib/UA";
import {
  SessionManager,
  SipAudioElements,
  SipSession,
  SipConstants,
  SipModel,
  normalizeNumber,
} from "./index";

export default class SipUA extends events.EventEmitter {
  #ua: UA;
  #rtcConfig: RTCConfiguration;
  #sessionManager: SessionManager;

  constructor(client: SipModel.ClientAuth, settings: SipModel.ClientOptions) {
    super();
    debug.enable("JsSIP:*");
    this.#sessionManager = new SessionManager();
    this.#rtcConfig = settings.pcConfig;
    this.#ua = new UA({
      uri: `sip:${client.username}`,
      password: client.password,
      display_name: client.name,
      sockets: [new WebSocketInterface(settings.wsUri)],
      register: settings.register,
    });
    this.#ua.on("connecting", (data: UAConnectingEvent) =>
      this.emit(SipConstants.UA_CONNECTING, { ...data, client })
    );
    this.#ua.on("connected", (data: ConnectedEvent) =>
      this.emit(SipConstants.UA_CONNECTED, { ...data, client })
    );
    this.#ua.on("disconnected", (data: DisconnectEvent) =>
      this.emit(SipConstants.UA_DISCONNECTED, {
        ...data,
        client,
      })
    );
    this.#ua.on("registered", (data: RegisteredEvent) =>
      this.emit(SipConstants.UA_REGISTERED, { ...data, client })
    );
    this.#ua.on("unregistered", (data: UnRegisteredEvent) =>
      this.emit(SipConstants.UA_UNREGISTERED, {
        ...data,
        client,
      })
    );
    this.#ua.on("registrationFailed", (data: UnRegisteredEvent) =>
      this.emit(SipConstants.UA_UNREGISTERED, {
        ...data,
        client,
      })
    );
    this.#ua.on("newRTCSession", (data: IncomingRTCSessionEvent) => {
      const rtcSession: RTCSession = data.session;
      const session: SipSession = new SipSession(
        rtcSession,
        this.#rtcConfig,
        new SipAudioElements()
      );
      this.#sessionManager.newSession(session);
      session.on(SipConstants.SESSION_RINGING, (args) =>
        this.updateSession(SipConstants.SESSION_RINGING, session, args, client)
      );
      session.on(SipConstants.SESSION_ANSWERED, (args) =>
        this.updateSession(SipConstants.SESSION_ANSWERED, session, args, client)
      );
      session.on(SipConstants.SESSION_FAILED, (args) =>
        this.updateSession(SipConstants.SESSION_FAILED, session, args, client)
      );
      session.on(SipConstants.SESSION_ENDED, (args) =>
        this.updateSession(SipConstants.SESSION_ENDED, session, args, client)
      );
      session.on(SipConstants.SESSION_MUTED, (args) =>
        this.updateSession(SipConstants.SESSION_MUTED, session, args, client)
      );
      session.on(SipConstants.SESSION_HOLD, (args) =>
        this.updateSession(SipConstants.SESSION_HOLD, session, args, client)
      );
      session.on(SipConstants.SESSION_UNHOLD, (args) =>
        this.updateSession(SipConstants.SESSION_UNHOLD, session, args, client)
      );
      session.on(SipConstants.SESSION_ICE_READY, (args) =>
        this.updateSession(
          SipConstants.SESSION_ICE_READY,
          session,
          args,
          client
        )
      );
      session.on(SipConstants.SESSION_ACTIVE, (args) => {
        this.updateSession(SipConstants.SESSION_ACTIVE, session, args, client);
      });
      session.setActive(true);
    });
  }

  updateSession(
    field: string,
    session: SipSession,
    args: any,
    client: SipModel.ClientAuth
  ) {
    this.emit(field, { ...args, client, session });
    this.#sessionManager.updateSession(field, session, args);
  }

  start(): void {
    this.#ua.start();
    this.emit(SipConstants.UA_START);
  }

  stop(): void {
    this.#ua.stop();
    this.emit(SipConstants.UA_STOP);
  }

  call(number: string, customHeaders: string[] = []): void {
    let normalizedNumber: string = normalizeNumber(number);
    this.#ua.call(normalizedNumber, {
      extraHeaders: [`X-Original-Number:${number}`].concat(customHeaders),
      mediaConstraints: { audio: true, video: false },
      pcConfig: this.#rtcConfig,
    });
  }

  isMuted(id: string | undefined): boolean {
    if (id) {
      return this.#sessionManager.getSession(id).isMuted();
    } else {
      return this.#sessionManager.activeSession.isMuted();
    }
  }

  mute(id: string | undefined): void {
    if (id) {
      this.#sessionManager.getSession(id).mute();
    } else {
      this.#sessionManager.activeSession.mute();
    }
  }

  unmute(id: string | undefined): void {
    if (id) {
      this.#sessionManager.getSession(id).unmute();
    } else {
      this.#sessionManager.activeSession.unmute();
    }
  }

  isHolded(id: string | undefined): boolean {
    if (id) {
      return this.#sessionManager.getSession(id).isHolded();
    } else {
      return this.#sessionManager.activeSession.isHolded();
    }
  }

  hold(id: string | undefined): void {
    if (id) {
      this.#sessionManager.getSession(id).hold();
    } else {
      this.#sessionManager.activeSession.hold();
    }
  }

  unhold(id: string | undefined): void {
    if (id) {
      this.#sessionManager.getSession(id).unhold();
    } else {
      this.#sessionManager.activeSession.unhold();
    }
  }

  dtmf(tone: number | string, id: string | undefined): void {
    if (id) {
      this.#sessionManager.getSession(id).sendDtmf(tone);
    } else {
      this.#sessionManager.activeSession.sendDtmf(tone);
    }
  }

  terminate(sipCode: number, reason: string, id: string | undefined): void {
    if (id) {
      this.#sessionManager.getSession(id).terminate(sipCode, reason);
    } else {
      this.#sessionManager.activeSession.terminate(sipCode, reason);
    }
  }

  answer(id: string | undefined): void {
    if (id) {
      this.#sessionManager.getSession(id).answer();
    } else {
      this.#sessionManager.activeSession.answer();
    }
  }

  activate(id: string) {
    const session: SipSession = this.#sessionManager.getSession(id);
    session.setActive(true);
  }
}

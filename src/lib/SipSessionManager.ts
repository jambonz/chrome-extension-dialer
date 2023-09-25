import {
    SipSession, SipModel, SipConstants
} from "./index";


export default class SipSessionManager {

    #sessions: Map<string, SipModel.SipSessionState>;

    constructor() {
        this.#sessions = new Map();
    }

    activate(session: SipSession) {
        this.#sessions.forEach((v, k) => {
            if (k !== session.id) {
                v.active = false;
                session.setActive(false);
            } else {
                v.active = true;
                session.setActive(true);
            }
        });
    }

    updateSession(field: string, session: SipSession, args: any): void {
        
        const state: SipModel.SipSessionState = this.getSessionState(session.id);
        if (state) {
            switch (field) {
                case SipConstants.SESSION_RINGING:
                    state.status = args.status;
                    break;
                case SipConstants.SESSION_ANSWERED:
                    state.status = args.status;
                    break;
                case SipConstants.SESSION_FAILED:
                case SipConstants.SESSION_ENDED:
                    state.status = args.status;
                    state.endState = {
                        cause: args.cause,
                        status: args.status,
                        originator: args.endState,
                        description: args.description
                    }
                    this.#sessions.delete(session.id);
                    break;
                case SipConstants.SESSION_MUTED:
                    state.muteStatus = args.status;
                    break;
                case SipConstants.SESSION_HOLD:
                    state.holdState = {
                        originator: args.originator,
                        status: args.status
                    }
                    break;
                case SipConstants.SESSION_ICE_READY:
                    state.iceReady = true;
                    break;
                case SipConstants.SESSION_ACTIVE:
                    state.active = true;
                    break;
            }
        }
    }

    getSessionState(id: string): SipModel.SipSessionState {
        const state = this.#sessions.get(id);
        if (!state) {
            throw new Error("Session not found");
        }
        return state;
    }

    getSession(id: string): SipSession {
        return this.getSessionState(id).sipSession;
    }



    newSession(session: SipSession): void {
        this.#sessions.set(session.id, 
            {
                id: session.id,
                sipSession: session,
                startDateTime: new Date(),
                active: true,
                status: 'init',
        });
    }

    get activeSession(): SipSession {
        if (this.#sessions.size === 0) {
            throw new Error("No sessions");
        }

        const state = [...this.#sessions.values()].filter((s) => s.active);
        if (state.length) {
            return state[0].sipSession;
        } else {
            throw new Error("No Active sessions");
        }
    }

    get count() {
        return this.#sessions.size;
    }
}
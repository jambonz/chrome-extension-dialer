import SipSession from "./SipSession";

export interface SipSessionState {
  id: string;
  sipSession: SipSession;
  startDateTime: Date;
  active: boolean;
  status: string;
  muteStatus?: string;
  iceReady?: boolean;
  endState?: EndState;
  holdState?: HoldState;
}

export interface EndState {
  cause: string;
  status: string;
  originator: string;
  description: string;
}

export interface HoldState {
  status: string;
  originator: string;
}

export interface ClientAuth {
  username: string;
  password: string;
  name: string;
}

export interface ClientOptions {
  pcConfig: PeerConnectionConfig;
  wsUri: string;
  register: boolean;
}

export interface PeerConnectionConfig {
  iceServers: IceServer[];
}

export interface IceServer {
  urls: string[];
}

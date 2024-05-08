export enum StatusCodes {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  UNPROCESSABLE_ENTITY = 422,
  INTERNAL_SERVER_ERROR = 500,
  /** SMPP temporarily unavailable */
  TEMPORARILY_UNAVAILABLE = 480,
}

export interface FetchTransport<Type> {
  headers: Headers;
  status: StatusCodes;
  json: Type;
  blob?: Blob;
}

export interface FetchError {
  status: StatusCodes;
  msg: string;
}

export interface Application {
  application_sid: string;
  name: string;
}

export interface Queue {
  name: string;
  length: number;
}

export interface RegisteredUser {
  name: string;
  contact: string;
  expiryTime: number;
  protocol: string;
  allow_direct_app_calling: boolean;
  allow_direct_queue_calling: boolean;
  allow_direct_user_calling: boolean;
  registered_status: string;
}

export type ConferenceParticipantActions =
  | "tag"
  | "untag"
  | "coach"
  | "mute"
  | "unmute"
  | "hold"
  | "unhold";

export interface ConferenceParticipantAction {
  action: ConferenceParticipantActions;
  tag: string;
}
export interface UpdateCall {
  conferenceParticipantAction: ConferenceParticipantAction;
}

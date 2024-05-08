import {
  Application,
  ConferenceParticipantAction,
  ConferenceParticipantActions,
  FetchError,
  FetchTransport,
  Queue,
  RegisteredUser,
  StatusCodes,
} from "./types";
import { MSG_SOMETHING_WRONG } from "./constants";
import { getAdvancedSettings } from "src/storage";
import { EmptyData } from "src/common/types";

const fetchTransport = <Type>(
  url: string,
  options: RequestInit
): Promise<FetchTransport<Type>> => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await fetch(url, options);
      const transport: FetchTransport<Type> = {
        headers: response.headers,
        status: response.status,
        json: <Type>{},
      };

      // Redirect unauthorized
      if (response.status === StatusCodes.UNAUTHORIZED) {
        reject();
      }

      // API error handling returns { msg: string; }
      // See @type StatusJSON and StatusEmpty in ./types
      if (
        response.status >= StatusCodes.BAD_REQUEST &&
        response.status <= StatusCodes.INTERNAL_SERVER_ERROR
      ) {
        try {
          const errJson = await response.json();
          reject(<FetchError>{
            status: response.status,
            ...errJson,
          });
        } catch (error) {
          reject(<FetchError>{
            status: response.status,
            msg: MSG_SOMETHING_WRONG,
          });
        }
      }

      // API success handling returns a valid JSON response
      // This could either be a DTO object or a generic response
      // See types for various responses in ./types
      if (
        response.status === StatusCodes.OK ||
        response.status === StatusCodes.CREATED
      ) {
        // Handle blobs -- e.g. pcap file API for RecentCalls
        if (
          options.headers!["Content-Type" as keyof HeadersInit] ===
          "application/octet-stream"
        ) {
          const blob: Blob = await response.blob();

          transport.blob = blob;
        } else {
          const json: Type = await response.json();

          transport.json = json;
        }
      }

      resolve(transport);
      // TypeError "Failed to fetch"
      // net::ERR_CONNECTION_REFUSED
      // This is the case if the server is unreachable...
    } catch (error: unknown) {
      reject(<FetchError>{
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        msg: (error as TypeError).message,
      });
    }
  });
};

const getAuthHeaders = () => {
  const advancedSettings = getAdvancedSettings();
  let token = advancedSettings.apiKey ?? null;

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const getFetch = <Type>(url: string) => {
  return fetchTransport<Type>(url, {
    headers: getAuthHeaders(),
  });
};

export const postFetch = <Type, Payload = undefined>(
  url: string,
  payload?: Payload
) => {
  return fetchTransport<Type>(url, {
    method: "POST",
    ...(payload && { body: JSON.stringify(payload) }),
    headers: getAuthHeaders(),
  });
};

export const putFetch = <Type, Payload>(url: string, payload: Payload) => {
  return fetchTransport<Type>(url, {
    method: "PUT",
    body: JSON.stringify(payload),
    headers: getAuthHeaders(),
  });
};

export const deleteFetch = <Type>(url: string) => {
  return fetchTransport<Type>(url, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
};

// GET Devices Users
export const getRegisteredUser = () => {
  const advancedSettings = getAdvancedSettings();
  return getFetch<string[]>(
    `${advancedSettings.apiServer}/Accounts/${advancedSettings.accountSid}/RegisteredSipUsers`
  );
};

export const getApplications = () => {
  const advancedSettings = getAdvancedSettings();
  return getFetch<Application[]>(
    `${advancedSettings.apiServer}/Accounts/${advancedSettings.accountSid}/Applications`
  );
};

export const getQueues = () => {
  const advancedSettings = getAdvancedSettings();
  return getFetch<Queue[]>(
    `${advancedSettings.apiServer}/Accounts/${advancedSettings.accountSid}/Queues`
  );
};

export const getSelfRegisteredUser = (username: string) => {
  const advancedSettings = getAdvancedSettings();
  return getFetch<RegisteredUser>(
    `${advancedSettings.apiServer}/Accounts/${advancedSettings.accountSid}/RegisteredSipUsers/${username}`
  );
};

export const getConferences = () => {
  const advancedSettings = getAdvancedSettings();
  return getFetch<string[]>(
    `${advancedSettings.apiServer}/Accounts/${advancedSettings.accountSid}/Conferences`
  );
};

export const updateConferenceParticipantAction = (
  callSid: string,
  payload: ConferenceParticipantAction
) => {
  const advancedSettings = getAdvancedSettings();
  return putFetch<EmptyData, ConferenceParticipantAction>(
    `${advancedSettings.apiServer}/Accounts/${advancedSettings.accountSid}/Calls/${callSid}`,
    payload
  );
};

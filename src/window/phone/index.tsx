import {
  Button,
  Center,
  Circle,
  HStack,
  Heading,
  IconButton,
  Image,
  Input,
  Select,
  Spacer,
  Text,
  Tooltip,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import {
  GitMerge,
  List,
  Mic,
  MicOff,
  Pause,
  PhoneOff,
  Play,
  Users,
} from "react-feather";
import {
  AdvancedAppSettings,
  SipCallDirection,
  SipClientStatus,
} from "src/common/types";
import { SipConstants, SipUA } from "src/lib";
import IncommingCall from "./incomming-call";
import DialPad from "./dial-pad";
import {
  isSipClientAnswered,
  isSipClientIdle,
  isSipClientRinging,
} from "src/utils";

import Avatar from "src/imgs/icons/Avatar.svg";
import GreenAvatar from "src/imgs/icons/Avatar-Green.svg";
import "./styles.scss";
import {
  deleteCurrentCall,
  getAdvancedSettings,
  getCurrentCall,
  saveCallHistory,
  saveCurrentCall,
} from "src/storage";
import { OutGoingCall } from "./outgoing-call";
import { v4 as uuidv4 } from "uuid";
import IconButtonMenu, { IconButtonMenuItems } from "src/components/menu";
import { getApplications, getQueues, getRegisteredUser } from "src/api";
import JambonzSwitch from "src/components/switch";
import { DEFAULT_TOAST_DURATION } from "src/common/constants";

type PhoneProbs = {
  sipDomain: string;
  sipServerAddress: string;
  sipUsername: string;
  sipPassword: string;
  sipDisplayName: string;
  calledNumber: [string, React.Dispatch<React.SetStateAction<string>>];
  calledName: [string, React.Dispatch<React.SetStateAction<string>>];
  advancedSettings: AdvancedAppSettings;
};

export const Phone = ({
  sipDomain,
  sipServerAddress,
  sipUsername,
  sipPassword,
  sipDisplayName,
  calledNumber: [calledANumber, setCalledANumber],
  calledName: [calledAName, setCalledAName],
  advancedSettings,
}: PhoneProbs) => {
  const [inputNumber, setInputNumber] = useState("");
  const [appName, setAppName] = useState("");
  const inputNumberRef = useRef(inputNumber);
  const [status, setStatus] = useState<SipClientStatus>("offline");
  const [isConfigured, setIsConfigured] = useState(false);
  const [callStatus, setCallStatus] = useState(SipConstants.SESSION_ENDED);
  const [sessionDirection, setSessionDirection] =
    useState<SipCallDirection>("");
  const sessionDirectionRef = useRef(sessionDirection);
  const sipUA = useRef<SipUA | null>(null);
  const timerRef = useRef<NodeJS.Timer | null>(null);
  const [seconds, setSeconds] = useState(0);
  const secondsRef = useRef(seconds);
  const [isCallButtonLoading, setIsCallButtonLoading] = useState(false);
  const [isAdvanceMode, setIsAdvancedMode] = useState(false);
  const isRestartRef = useRef(false);
  const sipDomainRef = useRef("");
  const sipUsernameRef = useRef("");
  const sipPasswordRef = useRef("");
  const sipServerAddressRef = useRef("");
  const sipDisplayNameRef = useRef("");
  const [isForceChangeUaStatus, setIsForceChangeUaStatus] = useState(false);
  const toast = useToast();

  useEffect(() => {
    sipDomainRef.current = sipDomain;
    sipUsernameRef.current = sipUsername;
    sipPasswordRef.current = sipPassword;
    sipServerAddressRef.current = sipServerAddress;
    sipDisplayNameRef.current = sipDisplayName;
    if (sipDomain && sipUsername && sipPassword && sipServerAddress) {
      if (sipUA.current) {
        clientGoOffline();
        isRestartRef.current = true;
      } else {
        createSipClient();
      }
      setIsConfigured(true);
    } else {
      setIsConfigured(false);
      clientGoOffline();
    }
  }, [sipDomain, sipUsername, sipPassword, sipServerAddress, sipDisplayName]);

  useEffect(() => {
    const advancedSettings = getAdvancedSettings();
    setIsAdvancedMode(!!advancedSettings.accountSid);
  }, [advancedSettings]);

  useEffect(() => {
    inputNumberRef.current = inputNumber;
    sessionDirectionRef.current = sessionDirection;
    secondsRef.current = seconds;
  }, [inputNumber, seconds, sessionDirection]);

  useEffect(() => {
    if (isSipClientIdle(callStatus) && isCallButtonLoading) {
      setIsCallButtonLoading(false);
    }
  }, [callStatus]);

  useEffect(() => {
    if (calledANumber) {
      if (
        !(
          calledANumber.startsWith("app-") || calledANumber.startsWith("queue-")
        )
      ) {
        setInputNumber(calledANumber);
      }

      setAppName(calledAName);
      makeOutboundCall(calledANumber, calledAName);
      setCalledANumber("");
      setCalledAName("");
    }
  }, [calledANumber]);

  useEffect(() => {
    if (status === "online" || status === "offline") {
      setIsForceChangeUaStatus(false);
    }
  }, [status]);

  // useEffect(() => {
  //   chrome.runtime.onMessage.addListener(function (request) {
  //     const msg = request as Message<any>;
  //     switch (msg.event) {
  //       case MessageEvent.Call:
  //         handleCallEvent(msg.data as Call);
  //         break;
  //       default:
  //         break;
  //     }
  //   });
  // }, []);

  // const handleCallEvent = (call: Call) => {
  //   if (!call.number) return;

  //   if (isSipClientIdle(callStatus)) {
  //     setIsCallButtonLoading(true);
  //     setInputNumber(call.number);
  //     sipUA.current?.call(call.number);
  //   }
  // };

  const startCallDurationCounter = () => {
    stopCallDurationCounter();
    timerRef.current = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
    }, 1000);
  };

  const stopCallDurationCounter = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setSeconds(0);
    }
  };

  const createSipClient = () => {
    const client = {
      username: `${sipUsernameRef.current}@${sipDomainRef.current}`,
      password: sipPasswordRef.current,
      name: sipDisplayNameRef.current ?? sipUsernameRef.current,
    };

    const settings = {
      pcConfig: {
        iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
      },
      wsUri: sipServerAddressRef.current,
      register: true,
    };

    const sipClient = new SipUA(client, settings);

    // UA Status
    sipClient.on(SipConstants.UA_REGISTERED, (args) => {
      setStatus("online");
    });
    sipClient.on(SipConstants.UA_UNREGISTERED, (args) => {
      setStatus("offline");
      if (isRestartRef.current) {
        createSipClient();
        isRestartRef.current = false;
      } else {
        clientGoOffline();
      }
      toast({
        title: `User is not registered${args.cause ? `, ${args.cause}` : ""}`,
        status: "warning",
        duration: DEFAULT_TOAST_DURATION,
        isClosable: true,
      });
    });

    sipClient.on(SipConstants.UA_DISCONNECTED, (args) => {
      setStatus("disconnected");
      if (args.error) {
        toast({
          title: `Cannot connect to ${sipServerAddress}, ${args.reason}`,
          status: "warning",
          duration: DEFAULT_TOAST_DURATION,
          isClosable: true,
        });
      }
    });
    // Call Status
    sipClient.on(SipConstants.SESSION_RINGING, (args) => {
      if (args.session.direction === "incoming") {
        saveCurrentCall({
          number: args.session.user,
          direction: args.session.direction,
          timeStamp: Date.now(),
          duration: "0",
          callSid: uuidv4(),
        });
      }
      setCallStatus(SipConstants.SESSION_RINGING);
      setSessionDirection(args.session.direction);
      setInputNumber(args.session.user);
    });
    sipClient.on(SipConstants.SESSION_ANSWERED, (args) => {
      const currentCall = getCurrentCall();
      if (currentCall) {
        currentCall.timeStamp = Date.now();
        saveCurrentCall(currentCall);
      }
      setCallStatus(SipConstants.SESSION_ANSWERED);
      startCallDurationCounter();
    });
    sipClient.on(SipConstants.SESSION_ENDED, (args) => {
      addCallHistory();
      setCallStatus(SipConstants.SESSION_ENDED);
      setSessionDirection("");
      stopCallDurationCounter();
    });
    sipClient.on(SipConstants.SESSION_FAILED, (args) => {
      addCallHistory();
      setCallStatus(SipConstants.SESSION_FAILED);
      setSessionDirection("");
      stopCallDurationCounter();
    });

    sipClient.start();
    sipUA.current = sipClient;
  };

  const addCallHistory = () => {
    const call = getCurrentCall();
    if (call) {
      saveCallHistory(sipUsername, {
        number: call.number,
        direction: call.direction,
        duration: transform(Date.now(), call.timeStamp),
        timeStamp: call.timeStamp,
        callSid: call.callSid,
        name: call.name,
      });
    }
    deleteCurrentCall();
  };

  function transform(t1: number, t2: number) {
    const diff = Math.abs(t1 - t2) / 1000; // Get the difference in seconds

    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = Math.floor(diff % 60);

    // Pad the values with a leading zero if they are less than 10
    const hours1 = hours < 10 ? "0" + hours : hours;
    const minutes1 = minutes < 10 ? "0" + minutes : minutes;
    const seconds1 = seconds < 10 ? "0" + seconds : seconds;

    return `${hours1}:${minutes1}:${seconds1}`;
  }

  const handleDialPadClick = (value: string) => {
    setInputNumber((prev) => prev + value);
    if (isSipClientAnswered(callStatus)) {
      sipUA.current?.dtmf(value, undefined);
    }
  };

  const handleCallButtion = () => {
    makeOutboundCall(inputNumber);
  };

  const makeOutboundCall = (number: string, name: string = "") => {
    if (sipUA.current && number) {
      setIsCallButtonLoading(true);
      setCallStatus(SipConstants.SESSION_RINGING);
      setSessionDirection("outgoing");
      saveCurrentCall({
        number: number,
        name,
        direction: "outgoing",
        timeStamp: Date.now(),
        duration: "0",
        callSid: uuidv4(),
      });
      // Add custom header if this is special jambonz call
      let customHeaders: string[] = [];
      if (number.startsWith("app-")) {
        customHeaders = [
          `X-Application-Sid: ${number.substring(4, number.length)}`,
        ];
      }
      sipUA.current.call(number, customHeaders);
    }
  };

  const clientGoOffline = () => {
    if (sipUA.current) {
      sipUA.current.stop();
      sipUA.current = null;
    }
  };

  const handleGoOffline = (s: SipClientStatus) => {
    if (s === status) {
      return;
    }
    if (s === "offline") {
      clientGoOffline();
    } else {
      createSipClient();
    }
  };

  const isOnline = () => {
    return status === "online";
  };

  const handleHangup = () => {
    if (isSipClientAnswered(callStatus) || isSipClientRinging(callStatus)) {
      sipUA.current?.terminate(480, "Call Finished", undefined);
    }
  };

  const handleCallOnHold = () => {
    if (isSipClientAnswered(callStatus)) {
      if (sipUA.current?.isHolded(undefined)) {
        sipUA.current?.unhold(undefined);
      } else {
        sipUA.current?.hold(undefined);
      }
    }
  };

  const handleCallMute = () => {
    if (isSipClientAnswered(callStatus)) {
      if (sipUA.current?.isMuted(undefined)) {
        sipUA.current?.unmute(undefined);
      } else {
        sipUA.current?.mute(undefined);
      }
    }
  };

  const handleAnswer = () => {
    if (isSipClientRinging(callStatus)) {
      sipUA.current?.answer(undefined);
    }
  };

  const handleDecline = () => {
    if (isSipClientRinging(callStatus)) {
      sipUA.current?.terminate(486, "Busy here", undefined);
    }
  };

  return (
    <Center flexDirection="column">
      {isConfigured ? (
        <>
          <HStack spacing={2} boxShadow="md" w="full" borderRadius={5} p={2}>
            <Image src={isOnline() ? GreenAvatar : Avatar} boxSize="50px" />
            <VStack alignItems="start" w="full" spacing={0}>
              <HStack spacing={2} w="full">
                <Text fontWeight="bold" fontSize="13px">
                  {sipDisplayName || sipUsername}
                </Text>
                <Circle size="8px" bg={isOnline() ? "green.500" : "gray.500"} />
                <Spacer />
                <JambonzSwitch
                  isDisabled={isForceChangeUaStatus}
                  onlabel="Online"
                  offLabel="Offline"
                  initialCheck={isOnline() || isForceChangeUaStatus}
                  onChange={(v) => {
                    setIsForceChangeUaStatus(true);
                    handleGoOffline(v ? "online" : "offline");
                  }}
                />
              </HStack>
              <Text fontWeight="bold" w="full">
                {`${sipUsername}@${sipDomain}`}
              </Text>
            </VStack>
          </HStack>
        </>
      ) : (
        <Heading size="md" mb={2}>
          Go to Settings to configure your account
        </Heading>
      )}

      {isSipClientRinging(callStatus) ? (
        sessionDirection === "incoming" ? (
          <IncommingCall
            number={inputNumber}
            answer={handleAnswer}
            decline={handleDecline}
          />
        ) : (
          <OutGoingCall
            number={inputNumber || appName}
            cancelCall={handleDecline}
          />
        )
      ) : (
        <VStack
          spacing={2}
          w="full"
          mt={5}
          className={isOnline() ? "" : "blurred"}
        >
          {isAdvanceMode && isSipClientIdle(callStatus) && (
            <HStack spacing={2} align="start" w="full">
              <IconButtonMenu
                icon={<Users />}
                tooltip="Call an online user"
                noResultLabel="No one else is online"
                onClick={(_, value) => {
                  setInputNumber(value);
                  makeOutboundCall(value);
                }}
                onOpen={() => {
                  return new Promise<IconButtonMenuItems[]>(
                    (resolve, reject) => {
                      getRegisteredUser()
                        .then(({ json }) => {
                          resolve(
                            json
                              .filter((u) => !u.includes(sipUsername))
                              .map((u) => {
                                const uName = u.match(/(^.*)@.*/);
                                return {
                                  name: uName ? uName[1] : u,
                                  value: uName ? uName[1] : u,
                                };
                              })
                          );
                        })
                        .catch((err) => reject(err));
                    }
                  );
                }}
              />
              <IconButtonMenu
                icon={<List />}
                tooltip="Take a call from queue"
                noResultLabel="No calls in queue"
                onClick={(name, value) => {
                  setAppName(`Queue ${name}`);
                  const calledQueue = `queue-${value}`;
                  setInputNumber("");
                  makeOutboundCall(calledQueue, `Queue ${name}`);
                }}
                onOpen={() => {
                  return new Promise<IconButtonMenuItems[]>(
                    (resolve, reject) => {
                      getQueues()
                        .then(({ json }) => {
                          resolve(
                            json.map((q) => ({
                              name: `${q.name} (${q.length})`,
                              value: q.name,
                            }))
                          );
                        })
                        .catch((err) => reject(err));
                    }
                  );
                }}
              />

              <IconButtonMenu
                icon={<GitMerge />}
                tooltip="Call an application"
                noResultLabel="No applications"
                onClick={(name, value) => {
                  setAppName(`App ${name}`);
                  const calledAppId = `app-${value}`;
                  setInputNumber("");
                  makeOutboundCall(calledAppId, `App ${name}`);
                }}
                onOpen={() => {
                  return new Promise<IconButtonMenuItems[]>(
                    (resolve, reject) => {
                      getApplications()
                        .then(({ json }) => {
                          resolve(
                            json.map((a) => ({
                              name: a.name,
                              value: a.application_sid,
                            }))
                          );
                        })
                        .catch((err) => reject(err));
                    }
                  );
                }}
              />
            </HStack>
          )}

          <Input
            value={inputNumber}
            bg="grey.500"
            fontWeight="bold"
            fontSize="24px"
            onChange={(e) => setInputNumber(e.target.value)}
            textAlign="center"
            isReadOnly={!isSipClientIdle(callStatus)}
          />

          {!isSipClientIdle(callStatus) && seconds >= 0 && (
            <Text fontSize="15px">
              {new Date(seconds * 1000).toISOString().substr(11, 8)}
            </Text>
          )}

          <DialPad handleDigitPress={handleDialPadClick} />

          {isSipClientIdle(callStatus) ? (
            <Button
              w="full"
              onClick={handleCallButtion}
              isDisabled={status === "offline"}
              colorScheme="jambonz"
              alignContent="center"
              isLoading={isCallButtonLoading}
            >
              Call
            </Button>
          ) : (
            <HStack w="full">
              <Tooltip
                label={sipUA.current?.isHolded(undefined) ? "UnHold" : "Hold"}
              >
                <IconButton
                  aria-label="Place call onhold"
                  icon={
                    sipUA.current?.isHolded(undefined) ? <Play /> : <Pause />
                  }
                  w="33%"
                  variant="unstyled"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  onClick={handleCallOnHold}
                />
              </Tooltip>

              <Spacer />
              <IconButton
                aria-label="Hangup"
                icon={<PhoneOff />}
                w="70px"
                h="70px"
                borderRadius="100%"
                colorScheme="jambonz"
                onClick={handleHangup}
              />
              <Spacer />
              <Tooltip
                label={sipUA.current?.isMuted(undefined) ? "Unmute" : "Mute"}
              >
                <IconButton
                  aria-label="Mute"
                  icon={
                    sipUA.current?.isMuted(undefined) ? <Mic /> : <MicOff />
                  }
                  w="33%"
                  variant="unstyled"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  onClick={handleCallMute}
                />
              </Tooltip>
            </HStack>
          )}
        </VStack>
      )}
    </Center>
  );
};

export default Phone;

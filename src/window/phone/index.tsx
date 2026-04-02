import {
  Box,
  Button,
  Circle,
  HStack,
  Heading,
  IconButton,
  Image,
  Input,
  Spacer,
  Text,
  Tooltip,
  VStack,
  useToast,
} from "@chakra-ui/react";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  IAppSettings,
  SipClientStatus,
} from "src/common/types";
import {
  useJambonzClient,
  useCall,
  ClientState,
  CallState as JambonzCallState,
} from "@jambonz/client-sdk-web";
import IncommingCall from "./incoming-call";
import DialPad from "./dial-pad";
import {
  isSipClientAnswered,
  isSipClientIdle,
} from "src/utils";
import { SipAudioElements } from "src/lib";

import Avatar from "src/imgs/icons/Avatar.svg";
import GreenAvatar from "src/imgs/icons/Avatar-Green.svg";
import "./styles.scss";
import {
  deleteCurrentCall,
  getCurrentCall,
  saveCallHistory,
  saveCurrentCall,
  setActiveSettings,
} from "src/storage";
import { OutGoingCall } from "./outgoing-call";
import { v4 as uuidv4 } from "uuid";
import IconButtonMenu, { IconButtonMenuItems } from "src/components/menu";
import {
  getApplications,
  getConferences,
  getQueues,
  getRegisteredUser,
  getSelfRegisteredUser,
} from "src/api";
import { DEFAULT_TOAST_DURATION } from "src/common/constants";
import { RegisteredUser } from "src/api/types";
import {
  faChevronDown,
  faCodeMerge,
  faList,
  faMicrophone,
  faMicrophoneSlash,
  faPause,
  faPeopleGroup,
  faPhoneSlash,
  faPlay,
  faUserGroup,
  faEarListen,
  faEarDeaf,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import JoinConference from "./conference";
import AnimateOnShow from "src/components/animate";
import AvailableAccounts from "./availableAccounts";

type PhoneProbs = {
  sipDomain: string;
  sipServerAddress: string;
  sipUsername: string;
  sipPassword: string;
  sipDisplayName: string;
  calledNumber: [string, React.Dispatch<React.SetStateAction<string>>];
  calledName: [string, React.Dispatch<React.SetStateAction<string>>];
  advancedSettings: IAppSettings | null;
  stat: [string, Dispatch<SetStateAction<SipClientStatus>>];
  allSettings: IAppSettings[];
  reload: () => void;
  setIsSwitchingUserStatus: React.Dispatch<React.SetStateAction<boolean>>;
  setIsOnline: React.Dispatch<React.SetStateAction<boolean>>;
  isUserOffline: boolean;
};

enum PAGE_VIEW {
  DIAL_PAD,
  INCOMING_CALL,
  OUTGOING_CALL,
  JOIN_CONFERENCE,
}

export const Phone = ({
  sipDomain,
  sipServerAddress,
  sipUsername,
  sipPassword,
  sipDisplayName,
  stat: [, setStatus],
  calledNumber: [calledANumber, setCalledANumber],
  calledName: [calledAName, setCalledAName],
  advancedSettings,
  allSettings,
  reload,
  setIsSwitchingUserStatus,
  setIsOnline,
  isUserOffline,
}: PhoneProbs) => {
  const [inputNumber, setInputNumber] = useState("");
  const [appName, setAppName] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [isCallButtonLoading, setIsCallButtonLoading] = useState(false);
  const [isAdvanceMode, setIsAdvancedMode] = useState(false);
  const [pageView, setPageView] = useState<PAGE_VIEW>(PAGE_VIEW.DIAL_PAD);
  const [registeredUser, setRegisteredUser] = useState<
    Partial<RegisteredUser>
  >({
    allow_direct_app_calling: false,
    allow_direct_queue_calling: false,
    allow_direct_user_calling: false,
  });
  const [selectedConference, setSelectedConference] = useState("");
  const [callSidState, setCallSidState] = useState("");
  const [showConference, setShowConference] = useState(false);
  const [showAccounts, setShowAccounts] = useState(false);
  const [isNoiseIsolation, setIsNoiseIsolation] = useState(false);

  const timerRef = useRef<NodeJS.Timer | null>(null);
  const FetchUsertimerRef = useRef<NodeJS.Timer | null>(null);
  const isInputNumberFocusRef = useRef(false);
  const accountsCardRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<SipAudioElements>(new SipAudioElements());
  const prevIsRegisteredRef = useRef(false);
  const sipUsernameRef = useRef(sipUsername);

  const toast = useToast();

  // Keep sipUsername ref up to date
  useEffect(() => {
    sipUsernameRef.current = sipUsername;
  }, [sipUsername]);

  // Build stable options for useJambonzClient
  const clientOptions = useMemo(() => {
    if (!sipDomain || !sipUsername || !sipPassword || !sipServerAddress) {
      return { server: "", username: "", password: "" };
    }
    return {
      server: sipServerAddress,
      username: sipUsername,
      password: sipPassword,
      displayName: sipDisplayName || sipUsername,
      realm: sipDomain,
    };
  }, [sipDomain, sipServerAddress, sipUsername, sipPassword, sipDisplayName]);

  const hasCredentials = !!(sipDomain && sipUsername && sipPassword && sipServerAddress);

  const {
    client,
    state: clientState,
    isRegistered,
    connect,
    disconnect,
    error: clientError,
  } = useJambonzClient(clientOptions);

  const {
    call: activeCall,
    state: callState,
    isMuted,
    isHeld,
    incomingCaller,
    makeCall,
    answerIncoming,
    declineIncoming,
    hangup,
    toggleMute,
    toggleHold,
    sendDtmf,
  } = useCall(client);

  // Sync client state to parent
  useEffect(() => {
    setStatus(clientState);
  }, [clientState, setStatus]);

  // Auto-connect/disconnect based on credentials and user offline toggle
  useEffect(() => {
    if (hasCredentials && !isUserOffline) {
      setIsSwitchingUserStatus(true);
      connect().catch((err) => {
        setIsSwitchingUserStatus(false);
        setIsOnline(false);
        toast({
          title: `Cannot connect to ${sipServerAddress}${err?.message ? `: ${err.message}` : ""}`,
          status: "warning",
          duration: DEFAULT_TOAST_DURATION,
          isClosable: true,
        });
      });
    } else {
      disconnect();
    }
  }, [hasCredentials, isUserOffline, sipDomain, sipUsername, sipPassword, sipServerAddress, sipDisplayName]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      clearFetchUserTimer();
    };
  }, [disconnect]);

  // Handle registration state changes
  useEffect(() => {
    if (isRegistered !== prevIsRegisteredRef.current) {
      prevIsRegisteredRef.current = isRegistered;
      setIsSwitchingUserStatus(false);
      setIsOnline(isRegistered);
    }
  }, [isRegistered, setIsSwitchingUserStatus, setIsOnline]);

  // Handle client errors
  useEffect(() => {
    if (clientError) {
      toast({
        title: clientError,
        status: "warning",
        duration: DEFAULT_TOAST_DURATION,
        isClosable: true,
      });
    }
  }, [clientError, toast]);

  // Handle disconnected state
  useEffect(() => {
    if (clientState === ClientState.Disconnected || clientState === ClientState.Error) {
      setIsSwitchingUserStatus(false);
      setIsOnline(false);
    }
  }, [clientState, setIsSwitchingUserStatus, setIsOnline]);

  // Audio feedback and page view based on call state
  useEffect(() => {
    if (isSipClientIdle(callState) && isCallButtonLoading) {
      setIsCallButtonLoading(false);
    }

    if (callState === JambonzCallState.Ringing || callState === JambonzCallState.Connecting) {
      if (incomingCaller) {
        // Incoming call
        setInputNumber(incomingCaller);
        setPageView(PAGE_VIEW.INCOMING_CALL);
        audioRef.current.playRinging();
        saveCurrentCall({
          number: incomingCaller,
          direction: "inbound",
          timeStamp: Date.now(),
          duration: "0",
          callSid: uuidv4(),
        });
      } else {
        // Outgoing call ringing
        setPageView(PAGE_VIEW.OUTGOING_CALL);
        audioRef.current.playRingback();
      }
    } else if (callState === JambonzCallState.Connected) {
      audioRef.current.playAnswer();
      const currentCall = getCurrentCall();
      if (currentCall) {
        currentCall.timeStamp = Date.now();
        saveCurrentCall(currentCall);
      }
      if (selectedConference) {
        setPageView(PAGE_VIEW.JOIN_CONFERENCE);
      } else {
        setPageView(PAGE_VIEW.DIAL_PAD);
      }
      startCallDurationCounter();
    } else if (callState === JambonzCallState.Ended || callState === null) {
      // Call ended or no call
      if (timerRef.current) {
        // There was an active call that just ended
        audioRef.current.playLocalHungup();
        addCallHistory();
        stopCallDurationCounter();
        setSelectedConference("");
        setIsNoiseIsolation(false);
        setPageView(PAGE_VIEW.DIAL_PAD);
      }
    }
  }, [callState, incomingCaller, selectedConference]);

  // Handle call failed event from the call object
  useEffect(() => {
    if (!activeCall) return;

    const onFailed = () => {
      audioRef.current.playFailed();
      addCallHistory();
      stopCallDurationCounter();
      setSelectedConference("");
      setPageView(PAGE_VIEW.DIAL_PAD);
    };

    activeCall.on("failed", onFailed);
    return () => {
      activeCall.off("failed", onFailed);
    };
  }, [activeCall]);

  // Get callSid from call headers when accepted
  useEffect(() => {
    if (!activeCall) return;

    const onAccepted = () => {
      // The SDK doesn't expose response headers directly,
      // use the call id as callSid
      setCallSidState(activeCall.id);
    };

    activeCall.on("accepted", onAccepted);
    return () => {
      activeCall.off("accepted", onAccepted);
    };
  }, [activeCall]);

  useEffect(() => {
    setIsAdvancedMode(!!advancedSettings?.decoded?.accountSid);
    fetchRegisterUser();
  }, [advancedSettings]);

  useEffect(() => {
    if (calledANumber) {
      if (
        !(
          calledANumber.startsWith("app-") ||
          calledANumber.startsWith("queue-") ||
          calledANumber.startsWith("conference-")
        )
      ) {
        setInputNumber(calledANumber);
      }

      setAppName(calledAName);
      makeOutboundCall(calledANumber, calledAName);
      setCalledANumber("");
      setCalledAName("");
    }
  }, [calledANumber, calledAName, setCalledAName, setCalledANumber]);

  const clearFetchUserTimer = () => {
    if (FetchUsertimerRef.current) {
      clearInterval(FetchUsertimerRef.current);
      FetchUsertimerRef.current = null;
    }
  };

  useEffect(() => {
    if (isAdvanceMode) {
      getConferences()
        .then(() => {
          setShowConference(true);
        })
        .catch(() => {
          setShowConference(false);
        });
      clearFetchUserTimer();
      FetchUsertimerRef.current = setInterval(() => {
        fetchRegisterUser();
      }, 10_000);
    } else {
      clearFetchUserTimer();
      setShowConference(false);
    }
    return () => clearFetchUserTimer();
  }, [isAdvanceMode]);

  useEffect(() => {
    if (showAccounts) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAccounts]);

  const fetchRegisterUser = () => {
    getSelfRegisteredUser(sipUsernameRef.current)
      .then(({ json }) => {
        setRegisteredUser(json);
      })
      .catch(() => {
        setRegisteredUser({
          allow_direct_app_calling: false,
          allow_direct_queue_calling: false,
          allow_direct_user_calling: false,
        });
      });
  };

  const addCallHistory = useCallback(() => {
    const call = getCurrentCall();
    if (call) {
      saveCallHistory(sipUsernameRef.current, {
        number: call.number,
        direction: call.direction,
        duration: transform(Date.now(), call.timeStamp),
        timeStamp: call.timeStamp,
        callSid: call.callSid,
        name: call.name,
      });
    }
    deleteCurrentCall();
  }, []);

  const startCallDurationCounter = useCallback(() => {
    stopCallDurationCounter();
    timerRef.current = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
    }, 1000);
  }, []);

  function stopCallDurationCounter() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setSeconds(0);
    }
  }

  function transform(t1: number, t2: number) {
    const diff = Math.abs(t1 - t2) / 1000;
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const secs = Math.floor(diff % 60);
    const hours1 = hours < 10 ? "0" + hours : hours;
    const minutes1 = minutes < 10 ? "0" + minutes : minutes;
    const seconds1 = secs < 10 ? "0" + secs : secs;
    return `${hours1}:${minutes1}:${seconds1}`;
  }

  const handleDialPadClick = (value: string, fromKeyboard: boolean) => {
    if (!(isInputNumberFocusRef.current && fromKeyboard)) {
      setInputNumber((prev) => prev + value);
    }

    if (isSipClientAnswered(callState)) {
      sendDtmf(value);
    }
  };

  const handleCallButton = () => {
    makeOutboundCall(inputNumber);
  };

  const makeOutboundCall = (number: string, name: string = "") => {
    if (client && isRegistered && number) {
      setIsCallButtonLoading(true);
      saveCurrentCall({
        number: number,
        name,
        direction: "outbound",
        timeStamp: Date.now(),
        duration: "0",
        callSid: uuidv4(),
      });

      // Use SDK-specific call methods based on the target type
      if (number.startsWith("app-")) {
        const appSid = number.substring(4);
        makeCall(number, {
          headers: { "X-Application-Sid": appSid },
        });
      } else if (number.startsWith("queue-")) {
        makeCall(number);
      } else if (number.startsWith("conference-")) {
        makeCall(number);
      } else {
        makeCall(number);
      }
    }
  };

  const handleHangup = () => {
    audioRef.current.stopAll();
    hangup();
  };

  const handleCallOnHold = () => {
    if (isSipClientAnswered(callState)) {
      toggleHold();
    }
  };

  const handleCallMute = () => {
    if (isSipClientAnswered(callState)) {
      toggleMute();
    }
  };

  const handleNoiseIsolation = () => {
    if (isSipClientAnswered(callState) && activeCall) {
      if (isNoiseIsolation) {
        activeCall.disableNoiseIsolation();
        setIsNoiseIsolation(false);
      } else {
        activeCall.enableNoiseIsolation();
        setIsNoiseIsolation(true);
      }
    }
  };

  const handleAnswer = () => {
    audioRef.current.pauseRinging();
    answerIncoming();
  };

  const handleDecline = () => {
    audioRef.current.stopAll();
    declineIncoming();
  };

  const handleSetActive = (id: number) => {
    setActiveSettings(id);
    setShowAccounts(false);
    reload();
  };

  const handleClickOutside = (event: Event) => {
    const target = event.target as Node;
    if (
      accountsCardRef.current &&
      !accountsCardRef.current.contains(target)
    ) {
      setShowAccounts(false);
    }
  };

  return (
    <Box flexDirection="column">
      {allSettings.length >= 1 ? (
        <>
          <Text fontSize={"small"} fontWeight={"semibold"} color={"gray.600"}>
            Account
          </Text>
          <Box className="relative" w={"full"}>
            {
              <HStack
                onClick={() => setShowAccounts(true)}
                _hover={{
                  cursor: "pointer",
                }}
                spacing={2}
                boxShadow="md"
                w="full"
                borderRadius={5}
                paddingY={2}
                paddingX={3.5}
              >
                {sipUsername && sipDomain ? (
                  <>
                    <Image
                      src={isRegistered ? GreenAvatar : Avatar}
                      boxSize="35px"
                    />
                    <VStack alignItems="start" w="full" spacing={0}>
                      <HStack spacing={2} w="full">
                        <Text fontWeight="bold" fontSize="13px">
                          {sipDisplayName || sipUsername}
                        </Text>
                        <Circle
                          size="8px"
                          bg={isRegistered ? "green.500" : "gray.500"}
                        />
                      </HStack>
                      <Text fontWeight="bold" w="full">
                        {`${sipUsername}@${sipDomain}`}
                      </Text>
                    </VStack>

                    <Spacer />
                    <VStack h="full" align="center">
                      <FontAwesomeIcon icon={faChevronDown} />
                    </VStack>
                  </>
                ) : (
                  <Text fontWeight={"extrabold"}>Select Account</Text>
                )}
              </HStack>
            }
            {showAccounts && (
              <AnimateOnShow initial={2} exit={0} duration={0.01}>
                <AvailableAccounts
                  refData={accountsCardRef}
                  allSettings={allSettings}
                  onSetActive={handleSetActive}
                />
              </AnimateOnShow>
            )}
          </Box>
        </>
      ) : (
        <Heading textAlign={"center"} size="md" mb={2}>
          Go to Settings to configure your account
        </Heading>
      )}
      {pageView === PAGE_VIEW.DIAL_PAD && (
        <VStack
          spacing={2}
          w="full"
          mt={5}
          className={isRegistered ? "" : "blurred"}
        >
          {isAdvanceMode && isSipClientIdle(callState) && (
            <HStack spacing={2} align="start" w="full">
              {registeredUser.allow_direct_user_calling && (
                <IconButtonMenu
                  icon={<FontAwesomeIcon icon={faUserGroup} />}
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
                            const sortedUsers = json.sort((a, b) =>
                              a.localeCompare(b)
                            );
                            resolve(
                              sortedUsers
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
              )}

              {registeredUser.allow_direct_queue_calling && (
                <IconButtonMenu
                  icon={<FontAwesomeIcon icon={faList} />}
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
                            const sortedQueues = json.sort((a, b) =>
                              a.name.localeCompare(b.name)
                            );
                            resolve(
                              sortedQueues.map((q) => ({
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
              )}

              {registeredUser.allow_direct_app_calling && (
                <IconButtonMenu
                  icon={<FontAwesomeIcon icon={faCodeMerge} />}
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
                            const sortedApps = json.sort((a, b) =>
                              a.name.localeCompare(b.name)
                            );
                            resolve(
                              sortedApps.map((a) => ({
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
              )}
              {registeredUser.allow_direct_app_calling && showConference && (
                <IconButtonMenu
                  icon={<FontAwesomeIcon icon={faPeopleGroup} />}
                  tooltip="Join a conference"
                  noResultLabel="No conference"
                  onClick={(name, value) => {
                    setPageView(PAGE_VIEW.JOIN_CONFERENCE);
                    setSelectedConference(
                      value === PAGE_VIEW.JOIN_CONFERENCE.toString()
                        ? ""
                        : value
                    );
                  }}
                  onOpen={() => {
                    return new Promise<IconButtonMenuItems[]>(
                      (resolve, reject) => {
                        getConferences()
                          .then(({ json }) => {
                            const sortedApps = json.sort((a, b) =>
                              a.localeCompare(b)
                            );
                            resolve([
                              {
                                name: "Start new conference",
                                value: PAGE_VIEW.JOIN_CONFERENCE.toString(),
                              },
                              ...sortedApps.map((a) => ({
                                name: a,
                                value: a,
                              })),
                            ]);
                          })
                          .catch((err) => reject(err));
                      }
                    );
                  }}
                />
              )}
            </HStack>
          )}

          <Input
            value={inputNumber}
            bg="grey.500"
            fontWeight="bold"
            fontSize="24px"
            onChange={(e) => {
              setInputNumber(e.target.value);
            }}
            onFocus={() => {
              isInputNumberFocusRef.current = true;
            }}
            onBlur={() => {
              isInputNumberFocusRef.current = false;
            }}
            textAlign="center"
            isReadOnly={!isSipClientIdle(callState)}
          />

          {!isSipClientIdle(callState) && seconds >= 0 && (
            <Text fontSize="15px">
              {new Date(seconds * 1000).toISOString().substring(11, 19)}
            </Text>
          )}

          <DialPad handleDigitPress={handleDialPadClick} />

          {isSipClientIdle(callState) ? (
            <Button
              w="full"
              onClick={handleCallButton}
              isDisabled={!isRegistered}
              colorScheme="jambonz"
              alignContent="center"
              isLoading={isCallButtonLoading}
            >
              Call
            </Button>
          ) : (
            <VStack w="full" spacing={2}>
              <HStack w="full">
                <Tooltip label={isHeld ? "UnHold" : "Hold"}>
                  <IconButton
                    aria-label="Place call onhold"
                    icon={
                      <FontAwesomeIcon icon={isHeld ? faPlay : faPause} />
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
                  icon={<FontAwesomeIcon icon={faPhoneSlash} />}
                  w="70px"
                  h="70px"
                  borderRadius="100%"
                  colorScheme="jambonz"
                  onClick={handleHangup}
                />
                <Spacer />
                <Tooltip label={isMuted ? "Unmute" : "Mute"}>
                  <IconButton
                    aria-label="Mute"
                    icon={
                      <FontAwesomeIcon
                        icon={isMuted ? faMicrophone : faMicrophoneSlash}
                      />
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
              {isSipClientAnswered(callState) && (
                <Tooltip
                  label={
                    isNoiseIsolation
                      ? "Disable Noise Isolation"
                      : "Enable Noise Isolation"
                  }
                >
                  <IconButton
                    aria-label="Toggle noise isolation"
                    icon={
                      <FontAwesomeIcon
                        icon={isNoiseIsolation ? faEarDeaf : faEarListen}
                      />
                    }
                    variant="unstyled"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    color={isNoiseIsolation ? "jambonz.500" : undefined}
                    onClick={handleNoiseIsolation}
                  />
                </Tooltip>
              )}
            </VStack>
          )}
        </VStack>
      )}
      {pageView === PAGE_VIEW.INCOMING_CALL && (
        <IncommingCall
          number={inputNumber}
          answer={handleAnswer}
          decline={handleDecline}
        />
      )}
      {pageView === PAGE_VIEW.OUTGOING_CALL && (
        <OutGoingCall
          number={inputNumber || appName}
          cancelCall={handleHangup}
        />
      )}
      {pageView === PAGE_VIEW.JOIN_CONFERENCE && (
        <JoinConference
          conferenceId={selectedConference}
          callSid={callSidState}
          callDuration={seconds}
          callStatus={callState ?? JambonzCallState.Idle}
          handleCancel={() => {
            if (isSipClientAnswered(callState)) {
              hangup();
            }
            setPageView(PAGE_VIEW.DIAL_PAD);
          }}
          call={(name) => {
            const conference = `conference-${name}`;
            setSelectedConference(name);
            setInputNumber(conference);
            makeOutboundCall(conference, `Conference ${name}`);
          }}
        />
      )}
    </Box>
  );
};

export default Phone;

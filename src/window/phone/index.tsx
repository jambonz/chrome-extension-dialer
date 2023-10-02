import {
  Button,
  Center,
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
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, Pause, PhoneOff, Play } from "react-feather";
import {
  Call,
  Message,
  MessageEvent,
  SipCallDirection,
  SipClientStatus,
} from "src/common/types";
import { SipConstants, SipUA } from "src/lib";
import IncommingCall from "./incomming-call";
import DialPad from "./dial-pad";
import {
  formatPhoneNumber,
  isSipClientAnswered,
  isSipClientIdle,
  isSipClientRinging,
} from "src/utils";

import Avatar from "src/imgs/icons/Avatar.svg";
import GreenAvatar from "src/imgs/icons/Avatar-Green.svg";
import "./styles.scss";
import { getCurrentCall, saveCallHistory, saveCurrentCall } from "src/storage";
import dayjs from "dayjs";

type PhoneProbs = {
  sipDomain: string;
  sipServerAddress: string;
  sipUsername: string;
  sipPassword: string;
  sipDisplayName: string;
};

export const Phone = ({
  sipDomain,
  sipServerAddress,
  sipUsername,
  sipPassword,
  sipDisplayName,
}: PhoneProbs) => {
  const [inputNumber, setInputNumber] = useState("");
  const inputNumberRef = useRef(inputNumber);
  const [status, setStatus] = useState<SipClientStatus>("offline");
  const [goOffline, setGoOffline] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [callStatus, setCallStatus] = useState(SipConstants.SESSION_ENDED);
  const [sessionDirection, setSessionDirection] =
    useState<SipCallDirection>("");
  const sessionDirectionRef = useRef(sessionDirection);
  const sipUA = useRef<SipUA | null>(null);
  const timerRef = useRef<NodeJS.Timer | null>(null);
  const [seconds, setSeconds] = useState(0);
  const secondsRef = useRef(seconds);

  useEffect(() => {
    if (sipDomain && sipUsername && sipPassword) {
      createSipClient();
      setIsConfigured(true);
    }
  }, [sipDomain, sipUsername, sipPassword, sipServerAddress, sipDisplayName]);

  useEffect(() => {
    inputNumberRef.current = inputNumber;
    sessionDirectionRef.current = sessionDirection;
    secondsRef.current = seconds;
  }, [inputNumber, seconds, sessionDirection]);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(function (request) {
      const msg = request as Message<any>;
      switch (msg.event) {
        case MessageEvent.Call:
          handleCallEvent(msg.data as Call);
          break;
        default:
          break;
      }
    });
  }, []);

  const handleCallEvent = (call: Call) => {
    if (!call.number) return;

    if (isSipClientIdle(callStatus)) {
      setInputNumber(call.number);
      sipUA.current?.call(call.number);
    }
  };

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

  const createSipClient = (forceOfflineMode = false) => {
    if (goOffline && !forceOfflineMode) {
      return;
    }

    clientGoOffline();

    const client = {
      username: `${sipUsername}@${sipDomain}`,
      password: sipPassword,
      name: sipDisplayName ?? sipUsername,
    };

    const settings = {
      pcConfig: {
        iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
      },
      wsUri: sipServerAddress,
      register: true,
    };

    const sipClient = new SipUA(client, settings);

    // UA Status
    sipClient.on(SipConstants.UA_REGISTERED, (args) => {
      setStatus("online");
    });
    sipClient.on(SipConstants.UA_UNREGISTERED, (args) => {
      setStatus("offline");
      clientGoOffline();
    });
    // Call Status
    sipClient.on(SipConstants.SESSION_RINGING, (args) => {
      saveCurrentCall({
        number: args.session.user,
        direction: args.session.direction,
        timeStamp: Date.now(),
        duration: "0",
      });
      setCallStatus(SipConstants.SESSION_RINGING);
      setSessionDirection(args.session.direction);
      setInputNumber(args.session.user);
    });
    sipClient.on(SipConstants.SESSION_ANSWERED, (args) => {
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
        duration: new Date((Date.now() - call.timeStamp) / 1000)
          .toISOString()
          .substr(11, 8),
        timeStamp: call.timeStamp,
      });
    }
  };

  const handleDialPadClick = (value: string) => {
    if (isSipClientIdle(callStatus)) {
      setInputNumber((prev) => prev + value);
    } else if (isSipClientAnswered(callStatus)) {
      sipUA.current?.dtmf(value, undefined);
    }
  };

  const handleCallButtion = () => {
    if (sipUA.current) {
      sipUA.current.call(inputNumber);
    }
  };

  const clientGoOffline = () => {
    if (sipUA.current) {
      sipUA.current.stop();
      sipUA.current = null;
    }
  };

  const handleGoOffline = () => {
    const newVal = !goOffline;
    setGoOffline(newVal);
    if (newVal) {
      clientGoOffline();
    } else {
      createSipClient(true);
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
          <HStack spacing={2} boxShadow="md" w="full" p={2} borderRadius={5}>
            <Image src={isOnline() ? GreenAvatar : Avatar} />
            <VStack spacing={2} alignItems="start">
              <HStack spacing={2}>
                <Text fontWeight="bold" fontSize="13px">
                  {sipDisplayName ?? sipUsername}
                </Text>
                <Circle size="8px" bg={isOnline() ? "green.500" : "gray.500"} />
                <Text fontSize="13px">{isOnline() ? "Online" : "Offline"}</Text>
              </HStack>
              <Text fontWeight="bold" w="full">
                {`${sipUsername}@${sipDomain}`}
              </Text>
            </VStack>
            {isSipClientIdle(callStatus) && (
              <>
                <Spacer />
                <Button
                  variant={isOnline() ? "outline" : "solid"}
                  borderRadius="50px 50px 50px 50px"
                  colorScheme={isOnline() ? "gray" : "jambonz"}
                  onClick={handleGoOffline}
                >
                  {isOnline() ? "GO OFFLINE" : "GO ONLINE"}
                </Button>
              </>
            )}
          </HStack>
        </>
      ) : (
        <Heading size="md" mb={2}>
          Go to Settings to configure your account
        </Heading>
      )}

      {isSipClientRinging(callStatus) && sessionDirection === "incoming" ? (
        <IncommingCall
          number={inputNumber}
          answer={handleAnswer}
          decline={handleDecline}
        />
      ) : (
        <VStack
          spacing={4}
          w="full"
          mt={5}
          className={isOnline() ? "" : "blurred"}
        >
          {isSipClientIdle(callStatus) ? (
            <Input
              value={inputNumber}
              bg="grey.500"
              fontWeight="bold"
              fontSize="24px"
              onChange={(e) => setInputNumber(e.target.value)}
              textAlign="center"
            />
          ) : (
            <VStack>
              <Text fontSize="22px" fontWeight="bold">
                {formatPhoneNumber(inputNumber)}
              </Text>
              {seconds > 0 && (
                <Text fontSize="15px">
                  {new Date(seconds * 1000).toISOString().substr(11, 8)}
                </Text>
              )}
            </VStack>
          )}

          <DialPad handleDigitPress={handleDialPadClick} />

          {isSipClientIdle(callStatus) ? (
            <Button
              w="full"
              onClick={handleCallButtion}
              isDisabled={status === "offline"}
              colorScheme="jambonz"
              alignContent="center"
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
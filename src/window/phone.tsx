import {
  Button,
  Center,
  Flex,
  HStack,
  Heading,
  IconButton,
  Input,
  InputGroup,
  InputRightElement,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { Delete } from "react-feather";
import { DEFAULT_COLOR_SCHEME } from "src/common/constants";
import { Call, Message, MessageEvent, SipClientStatus } from "src/common/types";
import { SipConstants, SipUA } from "src/lib";
import IncommingCall from "./incomming-call";
import OutgoingCall from "./outgoing-call";
import DialPad from "./dial-pad";
import {
  isSipClientAnswered,
  isSipClientIdle,
  isSipClientRinging,
  openPhonePopup,
} from "src/utils";

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
  const [status, setStatus] = useState<SipClientStatus>("offline");
  const [goOffline, setGoOffline] = useState(false);
  const [backtoOnline, setBackToOnline] = useState(false);
  const [callStatus, setCallStatus] = useState(SipConstants.SESSION_ENDED);
  const [sessionDirection, setSessionDirection] = useState("incoming");
  const [callHold, setCallHold] = useState(false);
  const sipUA = useRef<SipUA | null>(null);

  useEffect(() => {
    if (sipDomain && sipUsername && sipPassword) {
      createSipClient();
    }
  }, [sipDomain, sipUsername, sipPassword, sipServerAddress, sipDisplayName]);

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
      setBackToOnline(false);
    });
    sipClient.on(SipConstants.UA_UNREGISTERED, (args) => {
      setStatus("offline");
      clientGoOffline();
      setBackToOnline(false);
    });
    // Call Status
    sipClient.on(SipConstants.SESSION_RINGING, (args) => {
      setCallStatus(SipConstants.SESSION_RINGING);
      setSessionDirection(args.session.direction);
      setInputNumber(args.session.user);
    });
    sipClient.on(SipConstants.SESSION_ANSWERED, (args) => {
      setCallStatus(SipConstants.SESSION_ANSWERED);
    });
    sipClient.on(SipConstants.SESSION_ENDED, (args) => {
      setCallStatus(SipConstants.SESSION_ENDED);
      setSessionDirection("");
    });
    sipClient.on(SipConstants.SESSION_FAILED, (args) => {
      setCallStatus(SipConstants.SESSION_FAILED);
      setSessionDirection("");
    });
    sipClient.on(SipConstants.SESSION_HOLD, (args) => {
      setCallHold(true);
    });
    sipClient.on(SipConstants.SESSION_UNHOLD, (args) => {
      setCallHold(false);
    });

    sipClient.start();
    sipUA.current = sipClient;
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
      setBackToOnline(true);
    }
  };

  const handleHangup = () => {
    if (isSipClientAnswered(callStatus) || isSipClientRinging(callStatus)) {
      sipUA.current?.terminate(480, "Call Finished", undefined);
    }
  };

  const handleCallOnHold = () => {
    if (isSipClientAnswered(callStatus)) {
      if (callHold) {
        sipUA.current?.unhold(undefined);
      } else {
        sipUA.current?.hold(undefined);
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
      {status === "online" || goOffline || backtoOnline ? (
        <VStack mb={2}>
          <Text fontWeight="bold" maxW="full">
            {`${sipUsername}@${sipDomain}`}
          </Text>
          <Flex alignItems="center" justifyContent="space-between" w="full">
            <Text>
              <strong>Status:</strong> {status}
            </Text>
            <Spacer />
            {isSipClientIdle(callStatus) && (
              <Button
                size="sm"
                onClick={handleGoOffline}
                colorScheme={DEFAULT_COLOR_SCHEME}
                ml={5}
              >
                {goOffline ? "Go online" : "Go offline"}
              </Button>
            )}
          </Flex>
        </VStack>
      ) : (
        <Heading size="md" mb={2}>
          Go to Settings to configure your account
        </Heading>
      )}

      {!isSipClientIdle(callStatus) ? (
        sessionDirection === "outgoing" ? (
          <OutgoingCall
            callHold={callHold}
            callStatus={callStatus}
            number={inputNumber}
            hangup={handleHangup}
            callOnHold={handleCallOnHold}
            handleDialPadClick={handleDialPadClick}
          />
        ) : (
          <IncommingCall
            number={inputNumber}
            callStatus={callStatus}
            answer={handleAnswer}
            hangup={handleHangup}
            decline={handleDecline}
            handleDialPadClick={handleDialPadClick}
          />
        )
      ) : (
        <VStack w="200px" spacing={4}>
          <Center flexDirection="column">
            <InputGroup>
              <Input
                value={inputNumber}
                shadow="md"
                fontWeight="bold"
                onChange={(e) => setInputNumber(e.target.value)}
              />
              <InputRightElement
                children={
                  <IconButton
                    aria-label="Delete text"
                    icon={<Delete />}
                    variant="ghost"
                    colorScheme={DEFAULT_COLOR_SCHEME}
                    _hover={{ bg: "none" }}
                    _active={{ bg: "none" }}
                    onClick={() => setInputNumber((prev) => prev.slice(0, -1))}
                  />
                }
              />
            </InputGroup>
          </Center>

          <DialPad handleDigitPress={handleDialPadClick} />

          <HStack alignItems="center" w="80%">
            <Button
              w="full"
              onClick={handleCallButtion}
              isDisabled={status === "offline"}
              colorScheme={DEFAULT_COLOR_SCHEME}
            >
              Call
            </Button>
          </HStack>
        </VStack>
      )}
    </Center>
  );
};

export default Phone;

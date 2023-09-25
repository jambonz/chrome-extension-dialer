import {
  Button,
  VStack,
  Text,
  IconButton,
  Collapse,
  Tooltip,
} from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import { DEFAULT_COLOR_SCHEME } from "src/common/constants";
import { formatPhoneNumber, isSipClientAnswered } from "src/utils";
import DialPad from "./dial-pad";
import { Smartphone } from "react-feather";

type IncommingCallProbs = {
  number: string;
  callStatus: string;
  callHold: boolean;
  hangup: () => void;
  callOnHold: () => void;
  handleDialPadClick: (s: string) => void;
};

export const OutgoingCall = ({
  number,
  callStatus,
  callHold,
  hangup,
  callOnHold,
  handleDialPadClick,
}: IncommingCallProbs) => {
  const [seconds, setSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timer | null>(null);
  const [showDialPad, setShowDialPad] = useState(false);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    timerRef.current = setInterval(() => {
      setSeconds((seconds) => seconds + 1);
    }, 1000);
  }, []);
  return (
    <VStack alignItems="center" spacing={4} mt={5}>
      {!showDialPad && (
        <>
          <Text fontSize="2xl" fontWeight="bold">
            Talking to
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            {formatPhoneNumber(number)}
          </Text>

          <Text fontSize="xl" fontWeight="bold">
            {new Date(seconds * 1000).toISOString().substr(11, 8)}
          </Text>
        </>
      )}
      {isSipClientAnswered(callStatus) && (
        <Tooltip label="Dial pad">
          <IconButton
            colorScheme={DEFAULT_COLOR_SCHEME}
            aria-label="Toggle Dialpad"
            icon={<Smartphone />}
            onClick={() => setShowDialPad((prev) => !prev)}
          />
        </Tooltip>
      )}

      <Collapse in={showDialPad}>
        <DialPad handleDigitPress={handleDialPadClick} />
      </Collapse>

      <VStack spacing={5}>
        <Button w="full" colorScheme={DEFAULT_COLOR_SCHEME} onClick={hangup}>
          Hang up
        </Button>
        {isSipClientAnswered(callStatus) && (
          <Button
            w="full"
            colorScheme={DEFAULT_COLOR_SCHEME}
            onClick={callOnHold}
          >
            {callHold ? "Unhold " : "Place call on hold"}
          </Button>
        )}
      </VStack>
    </VStack>
  );
};

export default OutgoingCall;

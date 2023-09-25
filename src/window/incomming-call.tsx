import {
  Button,
  VStack,
  Text,
  Tooltip,
  IconButton,
  Collapse,
} from "@chakra-ui/react";
import { useState } from "react";
import { Smartphone } from "react-feather";
import { DEFAULT_COLOR_SCHEME } from "src/common/constants";
import {
  formatPhoneNumber,
  isSipClientAnswered,
  isSipClientRinging,
} from "src/utils";
import DialPad from "./dial-pad";

type IncommingCallProbs = {
  number: string;
  callStatus: string;
  answer: () => void;
  hangup: () => void;
  decline: () => void;
  handleDialPadClick: (s: string) => void;
};

export const IncommingCall = ({
  number,
  callStatus,
  answer,
  hangup,
  decline,
  handleDialPadClick,
}: IncommingCallProbs) => {
  const [showDialPad, setShowDialPad] = useState(false);
  return (
    <VStack alignItems="center" spacing={4} mt={5}>
      {!showDialPad && (
        <>
          <Text fontSize="2xl" fontWeight="bold">
            Incoming call from
          </Text>
          <Text fontSize="2xl" fontWeight="bold">
            {formatPhoneNumber(number)}
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

      <Button
        w="full"
        colorScheme={DEFAULT_COLOR_SCHEME}
        onClick={isSipClientRinging(callStatus) ? answer : hangup}
      >
        {isSipClientRinging(callStatus) ? "Answer" : "Hang up"}
      </Button>
      {isSipClientRinging(callStatus) && (
        <Button w="full" colorScheme={DEFAULT_COLOR_SCHEME} onClick={decline}>
          Decline
        </Button>
      )}
    </VStack>
  );
};

export default IncommingCall;

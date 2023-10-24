import {
  HStack,
  Icon,
  IconButton,
  Spacer,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import dayjs from "dayjs";
import { useState } from "react";
import {
  Phone,
  PhoneIncoming,
  PhoneOutgoing,
  Save,
  Trash2,
} from "react-feather";
import { CallHistory, SipCallDirection } from "src/common/types";
import { getSettings, isSaveCallHistory } from "src/storage";
import { formatPhoneNumber } from "src/utils";

type CallHistoryItemProbs = {
  call: CallHistory;
  onDataChange?: (call: CallHistory) => void;
  onCallNumber?: (number: string, name: string | undefined) => void;
  isSaved?: boolean;
};

export const CallHistoryItem = ({
  call,
  onDataChange,
  onCallNumber,
  isSaved,
}: CallHistoryItemProbs) => {
  const [callEnable, setCallEnable] = useState(false);
  const getDirectionIcon = (direction: SipCallDirection) => {
    if (direction === "outgoing") {
      return PhoneOutgoing;
    } else if (direction === "incoming") {
      return PhoneIncoming;
    } else {
      return Phone;
    }
  };

  return (
    <HStack
      spacing={5}
      borderBottomWidth="1px"
      borderBottomColor="gray.200"
      p={2}
      onMouseEnter={() => setCallEnable(true)}
      onMouseLeave={() => setCallEnable(false)}
    >
      {callEnable ? (
        <Tooltip label="Call">
          <IconButton
            aria-label="call recents"
            icon={<Phone />}
            onClick={() => {
              if (onCallNumber) {
                onCallNumber(call.number, call.name);
              }
            }}
            variant="unstyled"
            size="sm"
            color="green.500"
          />
        </Tooltip>
      ) : (
        <Icon as={getDirectionIcon(call.direction)} w="20px" h="20px" />
      )}

      <VStack align="start">
        <Text fontSize="14px" fontWeight="500">
          {call.name || formatPhoneNumber(call.number)}
        </Text>
        <Text fontSize="12px">{call.duration}</Text>
      </VStack>

      <Spacer />
      <VStack align="start">
        <Text fontSize="12px">
          {dayjs(call.timeStamp).format("MMM D, hh:mm A")}
        </Text>
      </VStack>
      <Tooltip label={isSaved && call.isSaved ? "Delete" : "Save"}>
        <IconButton
          aria-label="save recents"
          icon={isSaved && call.isSaved ? <Trash2 /> : <Save />}
          onClick={() => {
            if (!isSaved && call.isSaved) {
              return;
            }
            const settings = getSettings();
            if (settings.sipUsername) {
              isSaveCallHistory(
                settings.sipUsername,
                call.callSid,
                !call.isSaved
              );
              if (onDataChange) {
                onDataChange(call);
              }
            }
          }}
          variant="unstyled"
          size="sm"
          color={call.isSaved ? "jambonz.500" : ""}
        />
      </Tooltip>
    </HStack>
  );
};

export default CallHistoryItem;

import {
  HStack,
  IconButton,
  Spacer,
  Text,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import {
  faArrowRightFromBracket,
  faArrowRightToBracket,
  faPhone,
  faSave,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import dayjs from "dayjs";
import { useState } from "react";
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
      return faArrowRightFromBracket;
    } else if (direction === "incoming") {
      return faArrowRightToBracket;
    } else {
      return faPhone;
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
            icon={<FontAwesomeIcon icon={faPhone} />}
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
        <FontAwesomeIcon
          icon={getDirectionIcon(call.direction)}
          width="20px"
          height="20px"
        />
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
          icon={
            <FontAwesomeIcon
              icon={isSaved && call.isSaved ? faTrash : faSave}
            />
          }
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

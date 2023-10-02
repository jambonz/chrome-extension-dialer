import { HStack, Icon, Spacer, Text, VStack } from "@chakra-ui/react";
import dayjs from "dayjs";
import { Phone, PhoneIncoming, PhoneOutgoing } from "react-feather";
import { CallHistory, SipCallDirection } from "src/common/types";
import { formatPhoneNumber } from "src/utils";

type CallHistoryItemProbs = {
  call: CallHistory;
};

export const CallHistoryItem = ({ call }: CallHistoryItemProbs) => {
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
    >
      <Icon as={getDirectionIcon(call.direction)} w="20px" h="20px" />
      <VStack align="start">
        <Text fontSize="14px" fontWeight="500">
          {formatPhoneNumber(call.number)}
        </Text>
        <Text fontSize="12px">{call.duration}</Text>
      </VStack>
      <Spacer />
      <VStack align="start">
        <Text fontSize="12px">
          {dayjs(call.timeStamp).format("MMM D, hh:mm A")}
        </Text>
      </VStack>
    </HStack>
  );
};

export default CallHistoryItem;

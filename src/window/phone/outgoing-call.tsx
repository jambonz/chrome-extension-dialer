import { Button, Icon, Text, VStack } from "@chakra-ui/react";
import { PhoneCall } from "react-feather";
import { formatPhoneNumber } from "src/utils";

type OutGoingCallProbs = {
  number: string;
  cancelCall: () => void;
};

export const OutGoingCall = ({ number, cancelCall }: OutGoingCallProbs) => {
  return (
    <VStack alignItems="center" spacing={4} mt="130px" w="full">
      <Icon as={PhoneCall} color="jambonz.500" w="60px" h="60px" />
      <Text fontSize="15px">Dialing</Text>
      <Text fontSize="24px" fontWeight="bold">
        {formatPhoneNumber(number)}
      </Text>

      <Button w="full" colorScheme="jambonz" onClick={cancelCall}>
        Cancel
      </Button>
    </VStack>
  );
};

export default OutGoingCall;

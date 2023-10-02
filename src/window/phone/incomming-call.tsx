import { Button, VStack, Text, Icon, HStack, Spacer } from "@chakra-ui/react";
import { PhoneCall } from "react-feather";
import { formatPhoneNumber } from "src/utils";

type IncommingCallProbs = {
  number: string;
  answer: () => void;
  decline: () => void;
};

export const IncommingCall = ({
  number,
  answer,
  decline,
}: IncommingCallProbs) => {
  return (
    <VStack alignItems="center" spacing={4} mt="130px" w="full">
      <Icon as={PhoneCall} color="jambonz.500" w="60px" h="60px" />
      <Text fontSize="15px">Incoming call from</Text>
      <Text fontSize="24px" fontWeight="bold">
        {formatPhoneNumber(number)}
      </Text>

      <HStack w="full">
        <Button w="full" colorScheme="jambonz" onClick={decline}>
          Decline
        </Button>

        <Spacer />
        <Button w="full" colorScheme="green" onClick={answer}>
          Answer
        </Button>
      </HStack>
    </VStack>
  );
};

export default IncommingCall;

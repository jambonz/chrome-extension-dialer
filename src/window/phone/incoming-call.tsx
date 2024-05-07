import {
  Button,
  VStack,
  Text,
  Icon,
  HStack,
  Spacer,
  Box,
} from "@chakra-ui/react";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
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
      <Box
        as={FontAwesomeIcon}
        icon={faPhone}
        color="jambonz.500"
        width="60px"
        height="60px"
      />
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

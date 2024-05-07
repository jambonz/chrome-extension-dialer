import { Button, Icon, Text, VStack } from "@chakra-ui/react";
import { faPhone } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { formatPhoneNumber } from "src/utils";

type OutGoingCallProbs = {
  number: string;
  cancelCall: () => void;
};

export const OutGoingCall = ({ number, cancelCall }: OutGoingCallProbs) => {
  return (
    <VStack alignItems="center" spacing={4} mt="130px" w="full">
      <FontAwesomeIcon
        icon={faPhone}
        color="jambonz.500"
        width="60px"
        height="60px"
      />
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

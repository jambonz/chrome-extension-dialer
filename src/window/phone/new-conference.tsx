import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FormEvent } from "react";
import OutlineBox from "src/components/outline-box";

type NewConferenceProbs = {
  handleCancel: () => void;
};

export const NewConference = ({ handleCancel }: NewConferenceProbs) => {
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
  };
  return (
    <Box as="form" onSubmit={handleSubmit} w="full">
      <VStack spacing={4} mt="20px" w="full">
        <Text fontWeight="bold" fontSize="2xl">
          Start new conference
        </Text>
        <FormControl id="conference_name">
          <FormLabel>Conference name</FormLabel>
          <Input type="text" placeholder="Name" isRequired />
        </FormControl>

        <OutlineBox title="Join as">
          <Checkbox colorScheme="jambonz">Full participant</Checkbox>
          <Checkbox colorScheme="jambonz">Muted</Checkbox>
          <Checkbox colorScheme="jambonz">Coach mode</Checkbox>

          <FormControl id="speak_only_to">
            <FormLabel>Speak only to</FormLabel>
            <Input type="text" placeholder="agent" isRequired />
          </FormControl>

          <FormControl id="tag">
            <FormLabel>Tag</FormLabel>
            <Input type="text" placeholder="tags" isRequired />
          </FormControl>
        </OutlineBox>
        <HStack w="full">
          <Button colorScheme="jambonz" type="submit" w="full">
            Start Conference
          </Button>

          <Button
            colorScheme="grey"
            type="button"
            w="full"
            textColor="black"
            onClick={handleCancel}
          >
            Cancel
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default NewConference;

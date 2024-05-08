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
import { FormEvent, useState } from "react";
import OutlineBox from "src/components/outline-box";

type JoinConferenceProbs = {
  conferenceId?: string;
  callSid: string;
  handleCancel: () => void;
  call: (conference: string) => void;
};
export const JoinConference = ({
  conferenceId,
  handleCancel,
  call,
}: JoinConferenceProbs) => {
  const [conferenceName, setConferenceName] = useState(conferenceId || "");
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    call(conferenceName);
  };
  return (
    <Box as="form" onSubmit={handleSubmit} w="full">
      <VStack spacing={4} mt="20px" w="full">
        <Text fontWeight="bold">
          {!!conferenceId ? "Joining" : "Start"} conference
        </Text>
        <FormControl id="conference_name">
          <FormLabel>Conference name</FormLabel>
          <Input
            type="text"
            placeholder="Name"
            isRequired
            value={conferenceName}
            onChange={(e) => setConferenceName(e.target.value)}
            disabled={!!conferenceId}
          />
        </FormControl>

        <OutlineBox title="Join as">
          <Checkbox colorScheme="jambonz">Full participant</Checkbox>
          <Checkbox colorScheme="jambonz">Muted</Checkbox>
          <Checkbox colorScheme="jambonz">Coach mode</Checkbox>

          <FormControl id="speak_only_to">
            <FormLabel>Speak only to</FormLabel>
            <Input type="text" placeholder="agent" />
          </FormControl>

          <FormControl id="tag">
            <FormLabel>Tag</FormLabel>
            <Input type="text" placeholder="tags" />
          </FormControl>
        </OutlineBox>
        <HStack w="full">
          <Button colorScheme="jambonz" type="submit" w="full">
            {!!conferenceId ? "Join conference" : "Start conference"}
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

export default JoinConference;

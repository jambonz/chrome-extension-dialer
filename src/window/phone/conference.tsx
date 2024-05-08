import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Radio,
  RadioGroup,
  Text,
  VStack,
} from "@chakra-ui/react";
import { FormEvent, useEffect, useState } from "react";
import { updateConferenceParticipantAction } from "src/api";
import { ConferenceModes } from "src/api/types";
import OutlineBox from "src/components/outline-box";
import { SipConstants } from "src/lib";

type JoinConferenceProbs = {
  conferenceId?: string;
  callSid: string;
  callDuration: number;
  callStatus: string;
  handleCancel: () => void;
  call: (conference: string) => void;
};
export const JoinConference = ({
  conferenceId,
  callSid,
  callDuration,
  callStatus,
  handleCancel,
  call,
}: JoinConferenceProbs) => {
  const [conferenceName, setConferenceName] = useState(conferenceId || "");
  const [appTitle, setAppTitle] = useState(
    !!conferenceId ? "Joining Conference" : "Start Conference"
  );
  const [submitTitle, setSubmitTitle] = useState(
    !!conferenceId ? "Joining Conference" : "Start Conference"
  );
  const [cancelTitle, setCancelTitle] = useState("Cancel");
  const [isLoading, setIsLoading] = useState(false);
  const [speakOnlyTo, setSpeakOnlyTo] = useState("");
  const [tags, setTags] = useState("");
  const [mode, setMode] = useState<ConferenceModes>("full_participant");

  useEffect(() => {
    switch (callStatus) {
      case SipConstants.SESSION_ANSWERED:
        setAppTitle("Conference");
        setSubmitTitle("Update");
        setCancelTitle("Hangup");
        setIsLoading(false);
        configureConferenceSession();
        break;
      case SipConstants.SESSION_ENDED:
      case SipConstants.SESSION_FAILED:
        setIsLoading(false);
        break;
    }
  }, [callStatus]);

  useEffect(() => {
    switch (mode) {
      case "full_participant":
        break;
      case "muted":
        break;
      case "coach":
        break;
    }
  }, [mode]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (callStatus !== SipConstants.SESSION_ANSWERED) {
      call(conferenceName);
      if (!callSid) {
        setIsLoading(true);
      }
    } else {
      configureConferenceSession();
    }
  };

  const configureConferenceSession = async () => {
    if (callSid) {
      await updateConferenceParticipantAction(callSid, {
        action: mode === "muted" ? "mute" : "unmute",
        tag: "",
      });

      await updateConferenceParticipantAction(callSid, {
        action: tags ? "tag" : "untag",
        tag: tags,
      });

      await updateConferenceParticipantAction(callSid, {
        action: mode === "coach" ? "coach" : "uncoach",
        tag: speakOnlyTo,
      });
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} w="full">
      <VStack spacing={4} mt="20px" w="full">
        <Text fontWeight="bold">{appTitle}</Text>
        {callDuration > 0 && (
          <Text fontSize="15px">
            {new Date(callDuration * 1000).toISOString().substr(11, 8)}
          </Text>
        )}
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
          <RadioGroup
            onChange={(e) => setMode(e as ConferenceModes)}
            value={mode}
            colorScheme="jambonz"
          >
            <VStack align="start">
              <Radio value="full_participant" variant="">
                Full participant
              </Radio>
              <Radio value="muted">Muted</Radio>
              <Radio value="coach">Coach mode</Radio>
            </VStack>
          </RadioGroup>

          <FormControl id="speak_only_to">
            <FormLabel>Speak only to</FormLabel>
            <Input
              type="text"
              placeholder="tag"
              value={speakOnlyTo}
              onChange={(e) => setSpeakOnlyTo(e.target.value)}
              disabled={mode !== "coach"}
              required={mode === "coach"}
            />
          </FormControl>

          <FormControl id="tag">
            <FormLabel>Tag</FormLabel>
            <Input
              type="text"
              placeholder="tag"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </FormControl>
        </OutlineBox>
        <HStack w="full">
          <Button
            colorScheme="jambonz"
            type="submit"
            w="full"
            isLoading={isLoading}
          >
            {submitTitle}
          </Button>

          <Button
            colorScheme="grey"
            type="button"
            w="full"
            textColor="black"
            onClick={handleCancel}
          >
            {cancelTitle}
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
};

export default JoinConference;

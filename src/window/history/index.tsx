import {
  VStack,
  Grid,
  HStack,
  InputGroup,
  Input,
  InputLeftElement,
  Icon,
  Text,
  Spacer,
  UnorderedList,
} from "@chakra-ui/react";
import { useState } from "react";
import { Search, Sliders } from "react-feather";
import { CallHistory } from "src/common/types";
import CallHistoryItem from "./call-history-item";

type CallHistoriesProbs = {
  calls: CallHistory[];
};

export const CallHistories = ({ calls }: CallHistoriesProbs) => {
  const [searchText, setSearchText] = useState("");

  return (
    <VStack spacing={2}>
      <Grid w="full" templateColumns="1fr auto" gap={5}>
        <InputGroup size="md">
          <Input
            isDisabled={calls.length === 0}
            pr="4.5rem"
            placeholder="Type to search..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            bg="grey.100"
            fontWeight="normal"
          />
          <InputLeftElement mr={2}>
            <Icon as={Search} w="20px" h="20px" />
          </InputLeftElement>
        </InputGroup>
        <HStack spacing={2} bg="grey.100" p={2} borderRadius={7}>
          <Icon as={Sliders} w="20px" h="20px" />
          <Text fontSize="12px" fontWeight="500">
            Filter
          </Text>
        </HStack>
      </Grid>
      {calls.length > 0 ? (
        <UnorderedList
          w="full"
          spacing={2}
          maxH="500px"
          overflowY="auto"
          mt={2}
        >
          {calls.map((c) => (
            <CallHistoryItem call={c} />
          ))}
        </UnorderedList>
      ) : (
        <Text fontSize="24px" fontWeight="bold">
          No Call History
        </Text>
      )}
    </VStack>
  );
};

export default CallHistories;

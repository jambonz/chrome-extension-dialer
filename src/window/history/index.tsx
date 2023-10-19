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
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Search, Sliders } from "react-feather";
import { CallHistory } from "src/common/types";
import CallHistoryItem from "./call-history-item";

import { DEFAULT_COLOR_SCHEME } from "src/common/constants";
import Recents from "./recent";

type CallHistoriesProbs = {
  calls: CallHistory[];
  onDataChange?: (call: CallHistory) => void;
  onCallNumber?: (number: string) => void;
};

export const CallHistories = ({
  calls,
  onDataChange,
  onCallNumber,
}: CallHistoriesProbs) => {
  const [searchText, setSearchText] = useState("");

  return (
    <Tabs isFitted colorScheme={DEFAULT_COLOR_SCHEME}>
      <TabList mb="1em" gap={1}>
        <Tab>Saved</Tab>
        <Tab>Recent</Tab>
      </TabList>

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

      <TabPanels mt={1}>
        <TabPanel p={0}>
          <Recents
            calls={calls}
            search={searchText}
            isSaved
            onCallNumber={onCallNumber}
            onDataChange={onDataChange}
          />
        </TabPanel>
        <TabPanel p={0}>
          <Recents
            calls={calls}
            search={searchText}
            onCallNumber={onCallNumber}
            onDataChange={onDataChange}
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default CallHistories;

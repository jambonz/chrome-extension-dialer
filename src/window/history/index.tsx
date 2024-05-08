import {
  Grid,
  HStack,
  InputGroup,
  Input,
  InputLeftElement,
  Icon,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
} from "@chakra-ui/react";
import { useState } from "react";
import { CallHistory } from "src/common/types";

import { DEFAULT_COLOR_SCHEME } from "src/common/constants";
import Recents from "./recent";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faSliders } from "@fortawesome/free-solid-svg-icons";

type CallHistoriesProbs = {
  calls: CallHistory[];
  onDataChange?: (call: CallHistory) => void;
  onCallNumber?: (number: string, name: string | undefined) => void;
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
        <Tab>Recent</Tab>
        <Tab>Saved</Tab>
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
            <FontAwesomeIcon icon={faSearch} width="20px" height="20px" />
          </InputLeftElement>
        </InputGroup>
        <HStack spacing={2} bg="grey.100" p={2} borderRadius={7}>
          <FontAwesomeIcon icon={faSliders} width="20px" height="20px" />
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
            onCallNumber={onCallNumber}
            onDataChange={onDataChange}
          />
        </TabPanel>
        <TabPanel p={0}>
          <Recents
            calls={calls}
            search={searchText}
            isSaved
            onCallNumber={onCallNumber}
            onDataChange={onDataChange}
          />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default CallHistories;

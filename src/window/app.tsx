import {
  Box,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Grid,
  Center,
  HStack,
  Image,
} from "@chakra-ui/react";
import Phone from "./phone";
import Settings from "./settings";
import { DEFAULT_COLOR_SCHEME } from "src/common/constants";
import { useEffect, useState } from "react";
import { getCallHistories, getSettings } from "src/storage";

import jambonz from "src/imgs/jambonz.svg";
import CallHistories from "./history";
import { CallHistory } from "src/common/types";

export const WindowApp = () => {
  const [sipDomain, setSipDomain] = useState("");
  const [sipUsername, setSipUsername] = useState("");
  const [sipServerAddress, setSipServerAddress] = useState("");
  const [sipPassword, setSipPassword] = useState("");
  const [sipDisplayName, setSipDisplayName] = useState("");
  const [callHistories, setCallHistories] = useState<CallHistory[]>([]);
  const tabsSettings = [
    {
      title: "Phone",
      content: (
        <Phone
          sipUsername={sipUsername}
          sipPassword={sipPassword}
          sipDomain={sipDomain}
          sipDisplayName={sipDisplayName}
          sipServerAddress={sipServerAddress}
        />
      ),
    },
    {
      title: "Recent",
      content: <CallHistories calls={callHistories} />,
    },
    {
      title: "Settings",
      content: <Settings />,
    },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const onTabsChange = () => {
    loadSettings();
    setCallHistories(getCallHistories(sipUsername));
  };

  const loadSettings = () => {
    const settings = getSettings();
    if (settings.sipDomain && settings.sipDomain !== sipDomain) {
      setSipDomain(settings.sipDomain);
    }
    if (
      settings.sipServerAddress &&
      settings.sipServerAddress !== sipServerAddress
    ) {
      setSipServerAddress(settings.sipServerAddress);
    }
    if (settings.sipUsername && settings.sipUsername !== sipUsername) {
      setSipUsername(settings.sipUsername);
    }
    if (settings.sipPassword && settings.sipPassword !== sipPassword) {
      setSipPassword(settings.sipPassword);
    }
    if (settings.sipDisplayName && settings.sipDisplayName !== sipDisplayName) {
      setSipDisplayName(settings.sipDisplayName);
    }
  };
  return (
    <Grid h="100vh" templateRows="1fr auto">
      <Box p={2}>
        <Tabs
          isFitted
          variant="enclosed"
          colorScheme={DEFAULT_COLOR_SCHEME}
          onChange={onTabsChange}
        >
          <TabList mb="1em">
            {tabsSettings.map((s) => (
              <Tab
                _selected={{ color: "white", bg: "jambonz.500" }}
                bg="grey.500"
              >
                {s.title}
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            {tabsSettings.map((s) => (
              <TabPanel>{s.content}</TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      </Box>
      <Center>
        <HStack spacing={1} mb={2} align="start">
          <Text fontSize="14px">Powered by</Text>
          <Image src={jambonz} alt="Jambonz Logo" w="91px" h="31px" />
        </HStack>
      </Center>
    </Grid>
  );
};

export default WindowApp;

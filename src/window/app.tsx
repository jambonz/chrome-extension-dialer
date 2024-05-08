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
import {
  getAdvancedSettings,
  getCallHistories,
  getSettings,
} from "src/storage";

import jambonz from "src/imgs/jambonz.svg";
import CallHistories from "./history";
import { AdvancedAppSettings, CallHistory } from "src/common/types";

export const WindowApp = () => {
  const [sipDomain, setSipDomain] = useState("");
  const [sipUsername, setSipUsername] = useState("");
  const [sipServerAddress, setSipServerAddress] = useState("");
  const [sipPassword, setSipPassword] = useState("");
  const [sipDisplayName, setSipDisplayName] = useState("");
  const [callHistories, setCallHistories] = useState<CallHistory[]>([]);
  const [calledNumber, setCalledNumber] = useState("");
  const [calledName, setCalledName] = useState("");
  const [tabIndex, setTabIndex] = useState(0);
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedAppSettings>(
    getAdvancedSettings()
  );
  const tabsSettings = [
    {
      title: "Dialer",
      content: (
        <Phone
          sipUsername={sipUsername}
          sipPassword={sipPassword}
          sipDomain={sipDomain}
          sipDisplayName={sipDisplayName}
          sipServerAddress={sipServerAddress}
          calledNumber={[calledNumber, setCalledNumber]}
          calledName={[calledName, setCalledName]}
          advancedSettings={advancedSettings}
        />
      ),
    },
    {
      title: "Calls",
      content: (
        <CallHistories
          calls={callHistories}
          onDataChange={() => setCallHistories(getCallHistories(sipUsername))}
          onCallNumber={(number, name) => {
            setCalledNumber(number);
            setCalledName(name || "");
            setTabIndex(0);
          }}
        />
      ),
    },
    {
      title: "Settings",
      content: <Settings />,
    },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const onTabsChange = (i: number) => {
    loadSettings();
    setTabIndex(i);
    setCallHistories(getCallHistories(sipUsername));
  };

  const loadSettings = () => {
    const settings = getSettings();
    setAdvancedSettings(getAdvancedSettings());
    setSipDomain(settings.sipDomain);
    setSipServerAddress(settings.sipServerAddress);
    setSipUsername(settings.sipUsername);
    setSipPassword(settings.sipPassword);
    setSipDisplayName(settings.sipDisplayName);
  };
  return (
    <Grid h="100vh" templateRows="1fr auto">
      <Box p={2}>
        <Tabs
          isFitted
          variant="enclosed"
          colorScheme={DEFAULT_COLOR_SCHEME}
          onChange={onTabsChange}
          index={tabIndex}
        >
          <TabList mb="1em" gap={1}>
            {tabsSettings.map((s, i) => (
              <Tab
                _selected={{ color: "white", bg: "jambonz.500" }}
                bg="grey.500"
                key={i}
              >
                {s.title}
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            {tabsSettings.map((s, i) => (
              <TabPanel key={i}>{s.content}</TabPanel>
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

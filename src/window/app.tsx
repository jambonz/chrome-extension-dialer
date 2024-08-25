import {
  Box,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Grid,
} from "@chakra-ui/react";
import Phone from "./phone";
import Settings from "./settings";
import { DEFAULT_COLOR_SCHEME } from "src/common/constants";
import { useEffect, useState } from "react";
import { getActiveSettings, getCallHistories, getSettings } from "src/storage";

import CallHistories from "./history";
import { CallHistory, IAppSettings, SipClientStatus } from "src/common/types";
import Footer from "./footer/footer";

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
  const [status, setStatus] = useState<SipClientStatus>("stop");
  const [allSettings, setAllSettings] = useState<IAppSettings[]>([]);
  const [advancedSettings, setAdvancedSettings] = useState<IAppSettings | null>(
    null
  );

  const loadSettings = () => {
    const settings = getSettings();

    const activeSettings = settings.find((el) => el.active);

    setAllSettings(getSettings());
    setAdvancedSettings(getActiveSettings());
    setSipDomain(activeSettings?.decoded.sipDomain || "");
    setSipServerAddress(activeSettings?.decoded.sipServerAddress || "");
    setSipUsername(activeSettings?.decoded.sipUsername || "");
    setSipPassword(activeSettings?.decoded.sipPassword || "");
    setSipDisplayName(activeSettings?.decoded.sipDisplayName || "");
  };

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
          stat={[status, setStatus]}
          advancedSettings={advancedSettings}
          allSettings={allSettings}
          reload={loadSettings}
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

      <Footer
        sipServerAddress={sipServerAddress}
        sipUsername={sipUsername}
        sipDomain={sipDomain}
        sipDisplayName={sipDisplayName}
        sipPassword={sipPassword}
        status={status}
        setStatus={setStatus}
      />
    </Grid>
  );
};

export default WindowApp;

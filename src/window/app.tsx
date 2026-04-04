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
import { ClientState } from "@jambonz/client-sdk-web";
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
  const [status, setStatus] = useState<SipClientStatus>(ClientState.Disconnected);
  const [allSettings, setAllSettings] = useState<IAppSettings[]>([]);
  const [advancedSettings, setAdvancedSettings] = useState<IAppSettings | null>(
    null
  );
  const [isSwitchingUserStatus, setIsSwitchingUserStatus] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [isUserOffline, setIsUserOffline] = useState(false);

  const handleGoOffline = (s: SipClientStatus) => {
    if (s === ClientState.Unregistered) {
      setIsUserOffline(true);
    } else {
      setIsUserOffline(false);
    }
  };

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
          setIsSwitchingUserStatus={setIsSwitchingUserStatus}
          setIsOnline={setIsOnline}
          isUserOffline={isUserOffline}
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
    <Grid h="100vh" templateRows="1fr auto" overflow="hidden">
      <Box p={2} minH={0} display="flex" flexDirection="column" overflow="hidden">
        <Tabs
          isFitted
          variant="enclosed"
          colorScheme={DEFAULT_COLOR_SCHEME}
          onChange={onTabsChange}
          index={tabIndex}
          display="flex"
          flexDirection="column"
          flex="1"
          minH={0}
        >
          <TabList mb="1em" gap={1} flexShrink={0}>
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

          <TabPanels flex="1" minH={0} overflowY="auto">
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
        isSwitchingUserStatus={isSwitchingUserStatus}
        setIsSwitchingUserStatus={setIsSwitchingUserStatus}
        isOnline={isOnline}
        setIsOnline={setIsOnline}
        onHandleGoOffline={handleGoOffline}
      />
    </Grid>
  );
};

export default WindowApp;

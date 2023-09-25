import { Box, Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import Phone from "./phone";
import Settings from "./settings";
import { DEFAULT_COLOR_SCHEME } from "src/common/constants";
import { useEffect, useState } from "react";
import { getSettings } from "src/storage";

export const WindowApp = () => {
  const [sipDomain, setSipDomain] = useState("");
  const [sipUsername, setSipUsername] = useState("");
  const [sipServerAddress, setSipServerAddress] = useState("");
  const [sipPassword, setSipPassword] = useState("");
  const [sipDisplayName, setSipDisplayName] = useState("");
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
      title: "Settings",
      content: <Settings />,
    },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const onTabsChange = () => {
    loadSettings();
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
    <Box p={4}>
      <Tabs
        isFitted
        variant="enclosed"
        colorScheme={DEFAULT_COLOR_SCHEME}
        onChange={onTabsChange}
      >
        <TabList mb="1em">
          {tabsSettings.map((s) => (
            <Tab>{s.title}</Tab>
          ))}
        </TabList>

        <TabPanels>
          {tabsSettings.map((s) => (
            <TabPanel>{s.content}</TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default WindowApp;

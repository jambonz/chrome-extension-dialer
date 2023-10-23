import { Tab, TabList, TabPanel, TabPanels, Tabs } from "@chakra-ui/react";
import React from "react";
import { DEFAULT_COLOR_SCHEME } from "src/common/constants";
import BasicSettings from "./basic";
import AdvancedSettings from "./advanced";

export const Settings = () => {
  return (
    <Tabs isFitted colorScheme={DEFAULT_COLOR_SCHEME}>
      <TabList mb="1em" gap={1}>
        <Tab>Basic</Tab>
        <Tab>Advance</Tab>
      </TabList>

      <TabPanels mt={1}>
        <TabPanel p={0}>
          <BasicSettings />
        </TabPanel>
        <TabPanel p={0}>
          <AdvancedSettings />
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default Settings;

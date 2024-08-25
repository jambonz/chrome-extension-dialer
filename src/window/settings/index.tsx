import { Box, Button, Center, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { getSettings } from "src/storage";
import { IAppSettings } from "src/common/types";
import AccountForm from "./accountForm";
import AnimateOnShow from "src/components/animate";
import { AccordionList } from "src/window/settings/accordionList";

const MAX_NUM_OF_ACCOUNTS = 5;

export const Settings = () => {
  const [showForm, setShowForm] = useState(false);
  const [allSettings, setAllSettings] = useState<IAppSettings[]>([]);

  useEffect(
    function () {
      loadSettings();
    },
    [showForm]
  );

  function handleOpenForm() {
    setShowForm(true);
  }
  function handleCloseForm() {
    setShowForm(false);
  }

  const loadSettings = function () {
    setAllSettings(getSettings());
  };

  return (
    <div>
      <Box>
        <AccordionList allSettings={allSettings} reload={loadSettings} />
      </Box>
      {!showForm && (
        <Button
          marginY={"2.5"}
          colorScheme="jambonz"
          w="full"
          onClick={handleOpenForm}
          isDisabled={allSettings.length >= MAX_NUM_OF_ACCOUNTS}
        >
          Add Account
        </Button>
      )}
      <Center marginBottom={"2.5"} flexDirection={"column"}>
        <Text>
          {allSettings.length} of {MAX_NUM_OF_ACCOUNTS}{" "}
        </Text>
        {allSettings.length >= MAX_NUM_OF_ACCOUNTS && (
          <Text>Limit has been reached</Text>
        )}
      </Center>

      {showForm && (
        <AnimateOnShow>
          <AccountForm closeForm={handleCloseForm} />
        </AnimateOnShow>
      )}

      {/* <Tabs isFitted colorScheme={DEFAULT_COLOR_SCHEME}>
        <TabList mb="1em" gap={1}>
          <Tab>Basic</Tab>
          <Tab>Advanced</Tab>
        </TabList>

        <TabPanels mt={1}>
          <TabPanel p={0}>
            <BasicSettings />
          </TabPanel>
          <TabPanel p={0}>
            <AdvancedSettings />
          </TabPanel>
        </TabPanels>
      </Tabs> */}
    </div>
  );
};

export default Settings;

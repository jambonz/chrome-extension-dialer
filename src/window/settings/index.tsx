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
  const [showFormInAccordion, setShowFormInAccordion] = useState(false);
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

  const btnIsDisabled = allSettings.length >= MAX_NUM_OF_ACCOUNTS;

  return (
    <div>
      <Box>
        <AccordionList
          onOpenForm={() => setShowFormInAccordion((prev) => !prev)}
          allSettings={allSettings}
          reload={loadSettings}
          isNewFormOpen={showForm}
        />
      </Box>
      {!showForm && !showFormInAccordion && (
        <Button
          marginY={"3"}
          colorScheme="jambonz"
          // bg={btnIsDisabled ? "jambonz.0" : "jambonz.500"}
          // textColor={btnIsDisabled ? "jambonz.550" : "white"}
          w="full"
          onClick={handleOpenForm}
          isDisabled={btnIsDisabled}
          // _hover={{
          //   bg={btnIsDisabled ? "jambonz.0" : "jambonz.500"}
          // }}
        >
          Add Account
        </Button>
      )}

      {showForm && (
        <AnimateOnShow>
          <AccountForm closeForm={handleCloseForm} />
        </AnimateOnShow>
      )}

      <Center marginBottom={"2.5"} flexDirection={"column"}>
        <Text>
          {allSettings.length} of {MAX_NUM_OF_ACCOUNTS}{" "}
        </Text>
        {btnIsDisabled && <Text>Limit has been reached</Text>}
      </Center>

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

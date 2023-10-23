import {
  Button,
  FormControl,
  FormLabel,
  HStack,
  Image,
  Input,
  Spacer,
  Text,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { AdvancedAppSettings } from "src/common/types";
import PasswordInput from "src/components/password-input";
import InfoIcon from "src/imgs/icons/Info.svg";
import ResetIcon from "src/imgs/icons/Reset.svg";
import { getAdvancedSettings, saveAddvancedSettings } from "src/storage";

export const AdvancedSettings = () => {
  const [apiKey, setApiKey] = useState("");
  const [apiServer, setApiServer] = useState("");
  const [accountSid, setAccountSid] = useState("");

  useEffect(() => {
    const settings = getAdvancedSettings();
    if (settings.apiServer) {
      setApiServer(settings.apiServer);
    }
    if (settings.apiKey) {
      setApiKey(settings.apiKey);
    }
    if (settings.accountSid) {
      setAccountSid(settings.accountSid);
    }
  }, []);

  const handleSubmit = () => {
    const settings: AdvancedAppSettings = {
      accountSid,
      apiKey,
      apiServer,
    };

    saveAddvancedSettings(settings);
  };
  const resetSetting = () => {
    saveAddvancedSettings({} as AdvancedAppSettings);
    setApiKey("");
    setApiServer("");
    setAccountSid("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={2} w="full" h="full" p={0}>
        <VStack
          spacing={2}
          maxH="calc(100vh - 25em)"
          overflowY="auto"
          w="full"
          p={0}
        >
          <FormControl id="jambonz_api_server">
            <FormLabel>Jambonz API Server Base URL</FormLabel>
            <Input
              type="text"
              placeholder="https://jambonz.cloud/api"
              isRequired
              value={apiServer}
              onChange={(e) => setApiServer(e.target.value)}
            />
          </FormControl>
          <FormControl id="jambonz_account_sid">
            <FormLabel>Jambonz Account Sid</FormLabel>
            <Input
              type="text"
              placeholder="Account Sid"
              isRequired
              value={accountSid}
              onChange={(e) => setAccountSid(e.target.value)}
            />
          </FormControl>
          <FormControl id="api_key">
            <FormLabel>API Key</FormLabel>
            <PasswordInput password={[apiKey, setApiKey]} isRequired />
          </FormControl>
        </VStack>
        <Button colorScheme="jambonz" type="submit" w="full">
          Save
        </Button>
        <HStack w="full">
          <HStack spacing={1}>
            <Image src={InfoIcon} w="30px" h="30px" />
            <Text fontSize="14px">Get help</Text>
          </HStack>

          <Spacer />
          <HStack spacing={1}>
            <Image src={ResetIcon} w="30px" h="30px" />
            <Text fontSize="14px" onClick={resetSetting} cursor="pointer">
              Reset settings
            </Text>
          </HStack>
        </HStack>
      </VStack>
    </form>
  );
};

export default AdvancedSettings;

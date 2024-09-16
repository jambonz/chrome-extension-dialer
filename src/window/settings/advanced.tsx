import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Icon,
  Image,
  Input,
  Text,
  VStack,
} from "@chakra-ui/react";
import {
  faCheckCircle,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { getApplications } from "src/api";
import { AdvancedAppSettings } from "src/common/types";
import PasswordInput from "src/components/password-input";
import ResetIcon from "src/imgs/icons/Reset.svg";
import { getAdvancedSettings, saveAddvancedSettings } from "src/storage";
import { normalizeUrl } from "src/utils";
import { useToken } from "@chakra-ui/react";

export const AdvancedSettings = () => {
  const [apiKey, setApiKey] = useState("");
  const [apiServer, setApiServer] = useState("");
  const [accountSid, setAccountSid] = useState("");
  const [isCredentialOk, setIsCredentialOk] = useState(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);

  useEffect(() => {
    const settings = getAdvancedSettings();
    const activeSettings = settings.find(
      (el: { active: boolean }) => el.active
    );
    if (activeSettings?.decoded.apiServer) {
      setIsAdvancedMode(true);
      checkCredential();
      setApiServer(activeSettings?.decoded.apiServer);
    }
    if (activeSettings?.decoded.apiKey) {
      setApiKey(activeSettings?.decoded.apiKey);
    }
    if (activeSettings?.decoded.accountSid) {
      setAccountSid(activeSettings?.decoded.accountSid);
    }
  }, []);

  const checkCredential = () => {
    getApplications()
      .then(() => {
        setIsCredentialOk(true);
      })
      .catch(() => {
        setIsCredentialOk(false);
      });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiServer(normalizeUrl(apiServer));
    const settings: AdvancedAppSettings = {
      accountSid,
      apiKey,
      apiServer: normalizeUrl(apiServer),
    };

    saveAddvancedSettings(settings);
    setIsAdvancedMode(true);
    checkCredential();
  };
  const resetSetting = () => {
    saveAddvancedSettings({} as AdvancedAppSettings);
    setApiKey("");
    setApiServer("");
    setAccountSid("");
    setIsAdvancedMode(false);
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
        {isAdvancedMode && (
          <HStack w="full" mt={2} mb={2}>
            <Box
              as={FontAwesomeIcon}
              icon={isCredentialOk ? faCheckCircle : faCircleXmark}
              color={isCredentialOk ? "green.500" : "red.500"}
            />
            <Text
              fontSize="14px"
              color={isCredentialOk ? "green.500" : "red.500"}
            >
              Credential is {isCredentialOk ? "valid" : "invalid"}
            </Text>
          </HStack>
        )}

        <Button colorScheme="jambonz" type="submit" w="full">
          Save
        </Button>
        <VStack w="full" align="center" mt={2}>
          {/* <HStack spacing={1}>
            <Image src={InfoIcon} w="30px" h="30px" />
            <Text fontSize="14px">Get help</Text>
          </HStack> */}

          {/* <Spacer /> */}
          <HStack spacing={1}>
            <Image src={ResetIcon} w="30px" h="30px" />
            <Text fontSize="14px" onClick={resetSetting} cursor="pointer">
              Reset settings
            </Text>
          </HStack>
        </VStack>
      </VStack>
    </form>
  );
};

export default AdvancedSettings;

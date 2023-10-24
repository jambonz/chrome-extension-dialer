import {
  Box,
  Button,
  FormControl,
  FormLabel,
  HStack,
  Image,
  Input,
  Spacer,
  Text,
  VStack,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import PasswordInput from "src/components/password-input";
import { getSettings, saveSettings } from "src/storage";
import InfoIcon from "src/imgs/icons/Info.svg";
import ResetIcon from "src/imgs/icons/Reset.svg";
import { AppSettings } from "src/common/types";
import { DEFAULT_TOAST_DURATION } from "src/common/constants";

export const BasicSettings = () => {
  const [sipDomain, setSipDomain] = useState("");
  const [sipServerAddress, setSipServerAddress] = useState("");
  const [sipUsername, setSipUsername] = useState("");
  const [sipPassword, setSipPassword] = useState("");
  const [sipDisplayName, setSipDisplayName] = useState("");

  const toast = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const settings: AppSettings = {
      sipDomain,
      sipServerAddress: sipServerAddress,
      sipUsername,
      sipPassword,
      sipDisplayName,
    };

    saveSettings(settings);
    toast({
      title: "Settings saved successfully",
      status: "success",
      duration: DEFAULT_TOAST_DURATION,
      isClosable: true,
      colorScheme: "jambonz",
    });
  };

  const resetSetting = () => {
    saveSettings({} as AppSettings);
    setSipDomain("");
    setSipServerAddress("");
    setSipUsername("");
    setSipPassword("");
    setSipDisplayName("");
  };

  useEffect(() => {
    const settings = getSettings();
    if (settings.sipDomain) {
      setSipDomain(settings.sipDomain);
    }
    if (settings.sipServerAddress) {
      setSipServerAddress(settings.sipServerAddress);
    }
    if (settings.sipUsername) {
      setSipUsername(settings.sipUsername);
    }
    if (settings.sipPassword) {
      setSipPassword(settings.sipPassword);
    }
    if (settings.sipDisplayName) {
      setSipDisplayName(settings.sipDisplayName);
    }
  }, []);
  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={2} w="full" p={0}>
        <VStack
          spacing={2}
          maxH="calc(100vh - 25em)"
          overflowY="auto"
          w="full"
          p={0}
        >
          <FormControl id="jambonz_sip_domain">
            <FormLabel>Jambonz SIP Domain</FormLabel>
            <Input
              type="text"
              placeholder="Domain"
              isRequired
              value={sipDomain}
              onChange={(e) => setSipDomain(e.target.value)}
            />
          </FormControl>

          <FormControl id="jambonz_server_address">
            <FormLabel>Jambonz Server Address</FormLabel>
            <Input
              type="text"
              placeholder="wss://sip.jambonz.cloud:8443/"
              isRequired
              value={sipServerAddress}
              onChange={(e) => setSipServerAddress(e.target.value)}
            />
          </FormControl>

          <FormControl id="username">
            <FormLabel>SIP Username</FormLabel>
            <Input
              type="text"
              placeholder="Username"
              isRequired
              value={sipUsername}
              onChange={(e) => setSipUsername(e.target.value)}
            />
          </FormControl>

          <FormControl id="password">
            <FormLabel fontWeight="">SIP Password</FormLabel>
            <PasswordInput
              password={[sipPassword, setSipPassword]}
              placeHolder="Enter your password"
            />
          </FormControl>

          <FormControl id="sip_display_name">
            <FormLabel>SIP Display Name (Optional)</FormLabel>
            <Input
              type="text"
              placeholder="Display name"
              value={sipDisplayName}
              onChange={(e) => setSipDisplayName(e.target.value)}
            />
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

export default BasicSettings;

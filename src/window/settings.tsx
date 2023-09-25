import {
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { DEFAULT_TOAST_DURATION } from "src/common/constants";
import { AppSettings } from "src/common/types";
import { getSettings, saveSettings } from "src/storage";

export const Settings = () => {
  const [sipDomain, setSipDomain] = useState("");
  const [sipServerAddress, setSipServerAddress] = useState("");
  const [sipUsername, setSipUsername] = useState("");
  const [sipPassword, setSipPassword] = useState("");
  const [sipDisplayName, setSipDisplayName] = useState("");
  const [apiKey, setApiKey] = useState("");
  const toast = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const settings: AppSettings = {
      sipDomain,
      sipServerAddress: sipServerAddress,
      sipUsername,
      sipPassword,
      sipDisplayName,
      apiKey,
    };

    saveSettings(settings);
    toast({
      title: "Settings saved successfully",
      status: "success",
      duration: DEFAULT_TOAST_DURATION,
      isClosable: true,
    });
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
    if (settings.apiKey) {
      setApiKey(settings.apiKey);
    }
  }, []);
  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={4}>
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
            placeholder="Server address"
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
          <FormLabel>SIP Password</FormLabel>
          <Input
            type="password"
            placeholder="Enter your password"
            isRequired
            value={sipPassword}
            onChange={(e) => setSipPassword(e.target.value)}
          />
        </FormControl>

        <FormControl id="sip_display_name">
          <FormLabel>SIP Display Name</FormLabel>
          <Input
            type="text"
            placeholder="Display name"
            isRequired
            value={sipDisplayName}
            onChange={(e) => setSipDisplayName(e.target.value)}
          />
        </FormControl>

        <FormControl id="api_key">
          <FormLabel>API Key (optional)</FormLabel>
          <Input
            type="password"
            placeholder="API Key"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </FormControl>

        <Button colorScheme="pink" type="submit" w="80%">
          Save
        </Button>
      </VStack>
    </form>
  );
};

export default Settings;

import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  HStack,
  Input,
  Text,
  useToast,
  VStack,
} from "@chakra-ui/react";
import React, { useEffect, useState } from "react";
import { DEFAULT_TOAST_DURATION } from "src/common/constants";
import { AppSettings, IAppSettings } from "src/common/types";
import PasswordInput from "src/components/password-input";
import { deleteSettings, editSettings, saveSettings } from "src/storage";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faCircleXmark,
  faShuffle,
  faTrashCan,
} from "@fortawesome/free-solid-svg-icons";
import { normalizeUrl } from "src/utils";
import { getApplications } from "src/api";
import { colors } from "src/theme";

function AccountForm({
  closeForm,
  formData,
  handleClose,
  inputUniqueId,
}: {
  closeForm?: () => void;
  formData?: IAppSettings;
  handleClose?: () => void;
  inputUniqueId?: string; //duplicate form input id error fix
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [sipDomain, setSipDomain] = useState("");
  const [sipServerAddress, setSipServerAddress] = useState("");
  const [sipUsername, setSipUsername] = useState("");
  const [sipPassword, setSipPassword] = useState("");
  const [sipDisplayName, setSipDisplayName] = useState("");

  const [apiKey, setApiKey] = useState<string>("");
  const [apiServer, setApiServer] = useState<string | undefined>("");
  const [accountSid, setAccountSid] = useState<string | undefined>("");
  const [isCredentialOk, setIsCredentialOk] = useState<boolean>(false);
  const [isAdvancedMode, setIsAdvancedMode] = useState<boolean>(false);
  const toast = useToast();

  useEffect(
    function () {
      if (formData) {
        setSipDisplayName(formData.decoded.sipDisplayName);
        setSipDomain(formData.decoded.sipDomain);
        setSipServerAddress(formData.decoded.sipServerAddress);
        setSipUsername(formData.decoded.sipUsername);
        setSipPassword(formData.decoded.sipPassword);

        setAccountSid(formData.decoded.accountSid);
        setApiKey(formData.decoded.apiKey || "");
        setApiServer(formData.decoded.apiServer);
      }
    },
    [formData, handleClose]
  );

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

    const settings: AppSettings = {
      sipDomain,
      sipServerAddress,
      sipUsername,
      sipPassword,
      sipDisplayName,
      accountSid,
      apiKey,
      apiServer: apiServer ? normalizeUrl(apiServer) : "",
    };

    formData ? editSettings(settings, formData.id) : saveSettings(settings);

    if (showAdvanced) {
      setIsAdvancedMode(true);
      checkCredential();
    }

    toast({
      title: "Settings saved successfully",
      status: "success",
      duration: DEFAULT_TOAST_DURATION,
      isClosable: true,
      colorScheme: "jambonz",
    });

    if (formData) {
      handleClose && handleClose();
    } else {
      closeForm && closeForm();
    }
  };

  const handleDeleteSetting = (id: number) => {
    deleteSettings(id);
    if (formData) {
      handleClose && handleClose();
    } else {
      closeForm && closeForm();
    }
  };

  const resetSetting = () => {
    // saveSettings({} as AppSettings);
    setSipDomain("");
    setSipServerAddress("");
    setSipUsername("");
    setSipPassword("");
    setSipDisplayName("");

    setApiKey("");
    setApiServer("");
    setAccountSid("");
    setIsAdvancedMode(false);

    if (formData) {
      handleClose && handleClose();
    } else {
      closeForm && closeForm();
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing={2} w="full" p={0}>
        <VStack spacing={2} w="full" p={0}>
          <FormControl id={`sip_display_name${inputUniqueId}`}>
            <FormLabel>SIP Display Name (Optional)</FormLabel>
            <Input
              type="text"
              placeholder="Display name"
              value={sipDisplayName}
              onChange={(e) => setSipDisplayName(e.target.value)}
            />
          </FormControl>
          <FormControl id={`jambonz_sip_domain${inputUniqueId}`}>
            <FormLabel>Jambonz SIP Domain</FormLabel>
            <Input
              type="text"
              placeholder="Domain"
              isRequired
              value={sipDomain}
              onChange={(e) => setSipDomain(e.target.value)}
            />
          </FormControl>

          <FormControl id={`jambonz_server_address${inputUniqueId}`}>
            <FormLabel>Jambonz Server Address</FormLabel>
            <Input
              type="text"
              placeholder="wss://sip.jambonz.cloud:8443/"
              isRequired
              value={sipServerAddress}
              onChange={(e) => setSipServerAddress(e.target.value)}
            />
          </FormControl>

          <FormControl id={`username${inputUniqueId}`}>
            <FormLabel>SIP Username</FormLabel>
            <Input
              type="text"
              placeholder="Username"
              isRequired
              value={sipUsername}
              onChange={(e) => setSipUsername(e.target.value)}
            />
          </FormControl>

          <FormControl id={`password${inputUniqueId}`}>
            <FormLabel fontWeight="">SIP Password</FormLabel>
            <PasswordInput
              password={[sipPassword, setSipPassword]}
              placeHolder="Enter your password"
            />
          </FormControl>
          {showAdvanced && (
            <VStack w={"full"} bg={"gray.50"} borderRadius={"2xl"} p={"3.5"}>
              <FormControl id={`jambonz_api_server${inputUniqueId}`}>
                <FormLabel>Jambonz API Server Base URL</FormLabel>
                <Input
                  type="text"
                  placeholder="https://jambonz.cloud/api"
                  isRequired
                  value={apiServer}
                  onChange={(e) => setApiServer(e.target.value)}
                />
              </FormControl>
              <FormControl id={`jambonz_account_sid${inputUniqueId}`}>
                <FormLabel>Jambonz Account Sid</FormLabel>
                <Input
                  type="text"
                  isRequired
                  value={accountSid}
                  onChange={(e) => setAccountSid(e.target.value)}
                />
              </FormControl>
              <FormControl id={`api_key${inputUniqueId}`}>
                <FormLabel>API Key</FormLabel>
                <PasswordInput
                  password={[apiKey || "", setApiKey]}
                  isRequired
                />
              </FormControl>
            </VStack>
          )}
          <Center flexDirection={"column"} gap={"2.5"}>
            <Button
              gap={"2.5"}
              alignItems={"center"}
              onClick={() => setShowAdvanced((prev) => !prev)}
            >
              <Text textColor={"jambonz.500"}>
                {" "}
                {showAdvanced ? "Hide" : "Show"} Advanced Settings
              </Text>
              <FontAwesomeIcon color={colors.jambonz} icon={faShuffle} />
            </Button>
          </Center>
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

        <HStack
          w="full"
          alignItems="center"
          justifyContent={"space-between"}
          mt={2}
        >
          <HStack>
            <Button colorScheme="jambonz" type="submit" w="full">
              Save
            </Button>
            <Button
              colorScheme="jambonz"
              type="reset"
              w="full"
              onClick={resetSetting}
            >
              Cancel
            </Button>
          </HStack>
          <HStack
            _hover={{
              cursor: "pointer",
            }}
          >
            {formData && (
              <FontAwesomeIcon
                onClick={() => handleDeleteSetting(formData.id)}
                icon={faTrashCan}
                color={colors.jambonz}
              />
            )}
          </HStack>
        </HStack>
      </VStack>
    </form>
  );
}

export default AccountForm;

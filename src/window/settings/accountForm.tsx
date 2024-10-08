import {
  Box,
  Button,
  Center,
  FormControl,
  FormLabel,
  HStack,
  Image,
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
import { faCheckCircle } from "@fortawesome/free-solid-svg-icons";
import { normalizeUrl } from "src/utils";
import { getAdvancedValidation } from "src/api";
import Switch from "src/imgs/icons/Switch.svg";
import Trash from "src/imgs/icons/Trash.svg";
import invalid from "src/imgs/icons/invalid.svg";
import AnimateOnShow from "src/components/animate";

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

        if (
          formData.decoded.accountSid ||
          formData.decoded.apiKey ||
          formData.decoded.apiServer
        ) {
          setIsAdvancedMode(true);
          checkCredential(
            formData.decoded.apiServer || "",
            formData.decoded.accountSid || ""
          );
        }
      }
    },
    [formData, handleClose]
  );

  const checkCredential = (apiServer: string, accountSid: string) => {
    getAdvancedValidation(apiServer, accountSid)
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
      checkCredential(settings.apiServer || "", settings.accountSid || "");
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
    <form onSubmit={handleSubmit} className="formStyle">
      <VStack
        spacing={2}
        w="full"
        p={0}
        border={"1px"}
        borderColor={"gray.200"}
        borderRadius={"6px"}
        paddingY={"15px"}
        paddingRight={"15px"}
        paddingLeft={"10px"}
      >
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
            <AnimateOnShow>
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

                {isAdvancedMode && (
                  <HStack
                    w="full"
                    mt={2}
                    mb={2}
                    gap={"1.5"}
                    alignItems={"center"}
                  >
                    <Text
                      fontSize="12px"
                      fontWeight={600}
                      color={isCredentialOk ? "greenish.500" : "jambonz.450"}
                    >
                      {isCredentialOk
                        ? "Credentials are valid"
                        : "We cant verify your credentials"}
                    </Text>
                    {isCredentialOk ? (
                      <Box
                        as={FontAwesomeIcon}
                        icon={faCheckCircle}
                        color={"greenish.500"}
                      />
                    ) : (
                      <Box w={"22px"} h={"22px"} p={0} marginLeft={-1}>
                        <Image
                          width={"full"}
                          height={"full"}
                          p={0}
                          src={invalid}
                        />
                      </Box>
                    )}
                  </HStack>
                )}
              </VStack>
            </AnimateOnShow>
          )}
          <Center flexDirection={"column"} gap={"2.5"}>
            <Button
              variant={"ghost"}
              gap={"2.5"}
              alignItems={"center"}
              onClick={() => setShowAdvanced((prev) => !prev)}
            >
              <Text textColor={"jambonz.500"}>
                {" "}
                {showAdvanced ? "Hide" : "Show"} Advanced Settings
              </Text>
              <Image width={"15px"} height={"15px"} src={Switch} />
            </Button>
          </Center>
        </VStack>

        <HStack
          w="full"
          alignItems="center"
          justifyContent={"space-between"}
          mt={2}
        >
          <HStack>
            <Button
              textColor={"jambonz.500"}
              fontWeight={"semibold"}
              borderRadius={"11px"}
              bg="jambonz.0"
              type="submit"
              w="full"
            >
              Save
            </Button>
            <Button
              variant={"ghost"}
              colorScheme="jambonz"
              type="reset"
              fontWeight={"semibold"}
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
              <Image
                width={"24px"}
                height={"24px"}
                src={Trash}
                onClick={() => handleDeleteSetting(formData.id)}
              />
            )}
          </HStack>
        </HStack>
      </VStack>
    </form>
  );
}

export default AccountForm;

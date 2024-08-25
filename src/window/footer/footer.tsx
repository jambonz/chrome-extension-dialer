import { HStack, Image, Text, useToast } from "@chakra-ui/react";
import jambonz from "src/imgs/jambonz.svg";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { SipClientStatus } from "src/common/types";
import { SipConstants, SipUA } from "src/lib";
import { DEFAULT_TOAST_DURATION } from "src/common/constants";
import JambonzSwitch from "src/components/switch";
import "./styles.scss";

function Footer({
  status,
  setStatus,
  sipServerAddress,
  sipUsername,
  sipDomain,
  sipPassword,
  sipDisplayName,
}: {
  status: string;
  setStatus: Dispatch<SetStateAction<SipClientStatus>>;
  sipServerAddress: string;
  sipUsername: string;
  sipDomain: string;
  sipPassword: string;
  sipDisplayName: string;
}) {
  const [isConfigured, setIsConfigured] = useState(false);

  const [isSwitchingUserStatus, setIsSwitchingUserStatus] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  const sipUA = useRef<SipUA | null>(null);
  const sipUsernameRef = useRef("");
  const sipPasswordRef = useRef("");
  const sipServerAddressRef = useRef("");
  const sipDomainRef = useRef("");
  const sipDisplayNameRef = useRef("");
  const unregisteredReasonRef = useRef("");
  const isRestartRef = useRef(false);

  const toast = useToast();

  useEffect(() => {
    if (status === "registered" || status === "disconnected") {
      setIsSwitchingUserStatus(false);
      setIsOnline(status === "registered");
    }
  }, [status]);

  useEffect(() => {
    sipDomainRef.current = sipDomain;
    sipUsernameRef.current = sipUsername;
    sipPasswordRef.current = sipPassword;
    sipServerAddressRef.current = sipServerAddress;
    sipDisplayNameRef.current = sipDisplayName;
    if (sipDomain && sipUsername && sipPassword && sipServerAddress) {
      if (sipUA.current) {
        if (sipUA.current.isConnected()) {
          clientGoOffline();
          isRestartRef.current = true;
        } else {
          createSipClient();
        }
      } else {
        createSipClient();
      }
      setIsConfigured(true);
    } else {
      setIsConfigured(false);
      clientGoOffline();
    }
  }, [sipDomain, sipUsername, sipPassword, sipServerAddress, sipDisplayName]);

  const clientGoOffline = () => {
    if (sipUA.current) {
      sipUA.current.stop();
      sipUA.current = null;
    }
  };

  const handleGoOffline = (s: SipClientStatus) => {
    if (s === status) {
      return;
    }
    if (s === "unregistered") {
      if (sipUA.current) {
        sipUA.current.stop();
      }
    } else {
      if (sipUA.current) {
        sipUA.current.start();
      }
    }
  };

  const createSipClient = () => {
    setIsSwitchingUserStatus(true);
    const client = {
      username: `${sipUsernameRef.current}@${sipDomainRef.current}`,
      password: sipPasswordRef.current,
      name: sipDisplayNameRef.current ?? sipUsernameRef.current,
    };

    const settings = {
      pcConfig: {
        iceServers: [{ urls: ["stun:stun.l.google.com:19302"] }],
      },
      wsUri: sipServerAddressRef.current,
      register: true,
    };

    const sipClient = new SipUA(client, settings);

    // UA Status
    sipClient.on(SipConstants.UA_REGISTERED, (args) => {
      setStatus("registered");
    });
    sipClient.on(SipConstants.UA_UNREGISTERED, (args) => {
      setStatus("unregistered");
      if (sipUA.current) {
        sipUA.current.stop();
      }
      unregisteredReasonRef.current = `User is not registered${
        args.cause ? `, ${args.cause}` : ""
      }`;
    });

    sipClient.on(SipConstants.UA_DISCONNECTED, (args) => {
      if (unregisteredReasonRef.current) {
        toast({
          title: unregisteredReasonRef.current,
          status: "warning",
          duration: DEFAULT_TOAST_DURATION,
          isClosable: true,
        });
        unregisteredReasonRef.current = "";
      }
      setStatus("disconnected");
      if (isRestartRef.current) {
        createSipClient();
        isRestartRef.current = false;
      }

      if (args.error) {
        toast({
          title: `Cannot connect to ${sipServerAddress}, ${args.reason}`,
          status: "warning",
          duration: DEFAULT_TOAST_DURATION,
          isClosable: true,
        });
      }
    });

    sipClient.start();
    sipUA.current = sipClient;
  };

  return (
    <HStack
      paddingX={6}
      mb={2}
      justifyContent={"space-between"}
      alignItems={"center"}
    >
      {isConfigured ? (
        <HStack alignItems={"center"} flexWrap={"nowrap"} className="xs">
          <JambonzSwitch
            isDisabled={isSwitchingUserStatus}
            checked={[isOnline, setIsOnline]}
            onChange={(v) => {
              setIsSwitchingUserStatus(true);
              handleGoOffline(v ? "registered" : "unregistered");
            }}
          />
          <Text>You are {isOnline ? "online" : "offline"}</Text>
        </HStack>
      ) : (
        <span></span>
      )}
      <HStack
        spacing={1}
        alignItems={"start"}
        justify={"flex-end"}
        flexWrap={"wrap"}
      >
        <Text fontSize="14px">Powered by</Text>
        <Image src={jambonz} alt="Jambonz Logo" w="91px" h="31px" />
      </HStack>
    </HStack>
  );
}

export default Footer;

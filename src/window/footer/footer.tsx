import { HStack, Image, Text } from "@chakra-ui/react";
import jambonz from "src/imgs/jambonz.svg";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { SipClientStatus } from "src/common/types";
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
  isSwitchingUserStatus,
  setIsSwitchingUserStatus,
  isOnline,
  setIsOnline,
  onHandleGoOffline,
}: {
  status: string;
  setStatus: Dispatch<SetStateAction<SipClientStatus>>;
  sipServerAddress: string;
  sipUsername: string;
  sipDomain: string;
  sipPassword: string;
  sipDisplayName: string;
  isSwitchingUserStatus: boolean;
  setIsSwitchingUserStatus: React.Dispatch<React.SetStateAction<boolean>>;
  isOnline: boolean;
  setIsOnline: React.Dispatch<React.SetStateAction<boolean>>;
  onHandleGoOffline: (s: SipClientStatus) => void;
}) {
  const [isConfigured, setIsConfigured] = useState(false);

  useEffect(() => {
    if (status === "registered" || status === "disconnected") {
      setIsSwitchingUserStatus(false);
      setIsOnline(status === "registered");
    }
  }, [status, setIsSwitchingUserStatus, setIsOnline]);

  useEffect(() => {
    if (sipDomain && sipUsername && sipPassword && sipServerAddress) {
      setIsConfigured(true);
    } else {
      setIsConfigured(false);
    }
  }, [sipDomain, sipUsername, sipPassword, sipServerAddress]);

  return (
    <HStack
      padding={"15px"}
      justifyContent={"space-between"}
      alignItems={"center"}
      bg={"grey.75"}
    >
      {isConfigured ? (
        <HStack alignItems={"center"} flexWrap={"nowrap"} className="xs">
          <JambonzSwitch
            isDisabled={isSwitchingUserStatus}
            checked={[isOnline, setIsOnline]}
            onChange={(v) => {
              setIsSwitchingUserStatus(true);
              onHandleGoOffline(v ? "registered" : "unregistered");
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

import { HStack, Text, VStack } from "@chakra-ui/react";
import { faCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { RefObject } from "react";
import { IAppSettings } from "src/common/types";

function AvailableAccounts({
  allSettings,
  onSetActive,
  refData,
}: {
  allSettings: IAppSettings[];
  onSetActive: (x: number) => void;
  refData: RefObject<HTMLDivElement>;
}) {
  return (
    <VStack
      ref={refData}
      w={"full"}
      alignItems={"start"}
      bg={"grey.200"}
      borderRadius={"xl"}
      className="absolute"
      padding={3}
      border={"1px"}
      borderColor={"gray.400"}
      boxShadow={"lg"}
    >
      {allSettings.map((el, i) => (
        <HStack
          key={i}
          justifyContent={"start"}
          _hover={{
            cursor: "pointer",
          }}
          onClick={() => onSetActive(el.id)}
        >
          {el.active && <FontAwesomeIcon icon={faCheck} />}
          <Text marginLeft={el.active ? "-0.5" : "5"}>
            {el.decoded.sipDisplayName || el.decoded.sipUsername}
          </Text>
          &nbsp;
          <Text>({`${el.decoded.sipUsername}@${el.decoded.sipDomain}`})</Text>
        </HStack>
      ))}
    </VStack>
  );
}

export default AvailableAccounts;

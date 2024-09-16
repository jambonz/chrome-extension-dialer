import { Box, HStack, Text, VStack } from "@chakra-ui/react";
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
      zIndex={"modal"}
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
          display={"flex"}
          justifyContent={"start"}
          _hover={{
            cursor: "pointer",
          }}
          onClick={() => onSetActive(el.id)}
        >
          <Box w={"12px"}>
            {el.active ? <FontAwesomeIcon icon={faCheck} /> : null}
          </Box>
          <Text>{el.decoded.sipDisplayName || el.decoded.sipUsername}</Text>
          &nbsp;
          <Text>({`${el.decoded.sipUsername}@${el.decoded.sipDomain}`})</Text>
        </HStack>
      ))}
    </VStack>
  );
}

export default AvailableAccounts;

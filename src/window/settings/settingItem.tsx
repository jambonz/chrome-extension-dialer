import { HStack, Text, VStack } from "@chakra-ui/react";
import React from "react";
import { IAppSettings } from "src/common/types";

function SettingItem({ data }: { data: IAppSettings }) {
  return (
    <HStack
      w={"full"}
      display={"flex"}
      marginY={"1.5"}
      border={"1px"}
      borderColor={"gray.200"}
      justifyContent={"start"}
      borderRadius={"2xl"}
      padding={"2.5"}
    >
      <VStack gap={"0"} alignItems={"start"}>
        <Text fontWeight={"bold"}>
          {data.decoded.sipDisplayName || data.decoded.sipUsername}
        </Text>
        <Text>{`${data.decoded.sipUsername}@${data.decoded.sipDomain}`}</Text>
      </VStack>
    </HStack>
  );
}

export default SettingItem;

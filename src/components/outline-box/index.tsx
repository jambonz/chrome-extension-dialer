import { VStack, Text } from "@chakra-ui/react";
import { ReactNode } from "react";

const OutlineBox = ({
  title,
  children,
  h,
  borderColor,
}: {
  title: string;
  children: ReactNode;
  h?: string;
  borderColor?: string;
}) => {
  return (
    <VStack align="stretch" h={h || ""} w="full">
      <VStack
        border="1px"
        borderColor={borderColor || ""}
        position="relative"
        borderRadius={5}
        p={4}
        h={h || ""}
        align="start"
      >
        <Text
          position="absolute"
          top={-3}
          left={2}
          bg="white"
          color={borderColor || ""}
          px={2}
        >
          {title}
        </Text>
        {children}
      </VStack>
    </VStack>
  );
};

export default OutlineBox;

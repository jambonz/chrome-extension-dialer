import { Box, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";

type JambonzSwitchProbs = {
  onlabel: string;
  offLabel: string;
  initialCheck: boolean;
  onChange: (value: boolean) => void;
};
function JambonzSwitch({
  onlabel,
  offLabel,
  initialCheck,
  onChange,
}: JambonzSwitchProbs) {
  const [isToggled, setToggled] = useState(initialCheck);

  useEffect(() => {
    setToggled(initialCheck);
  }, [initialCheck]);

  return (
    <Box
      position="relative"
      w="90px"
      h="30px"
      bg={isToggled ? "green.500" : "grey.500"}
      borderRadius="full"
      onClick={() => {
        const value = !isToggled;
        setToggled(value);
        onChange(value);
      }}
      _hover={{ cursor: "pointer" }}
    >
      <Text
        position="absolute"
        top="50%"
        left={isToggled ? "40%" : "60%"}
        transform="translate(-50%, -50%)"
        color={isToggled ? "white" : "black"}
        fontWeight="bold"
      >
        {isToggled ? onlabel : offLabel}
      </Text>
      <Box
        position="absolute"
        top="50%"
        left={isToggled ? "70%" : "5%"}
        w="24px"
        h="24px"
        bg="white"
        borderRadius="full"
        transform="translateY(-50%)"
        transition="0.2s ease"
        style={{ boxShadow: "0 3px 4px rgba(0,0,0,0.5)" }}
      ></Box>
    </Box>
  );
}

export default JambonzSwitch;

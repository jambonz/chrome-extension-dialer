import { Box, Text } from "@chakra-ui/react";

type JambonzSwitchProbs = {
  onlabel?: string;
  offLabel?: string;
  checked: [boolean, React.Dispatch<React.SetStateAction<boolean>>];
  isDisabled?: boolean;
  onChange: (value: boolean) => void;
};
function JambonzSwitch({
  onlabel,
  offLabel,
  checked: [isToggled, setToggled],
  isDisabled = false,
  onChange,
}: JambonzSwitchProbs) {
  return (
    <Box
      position="relative"
      w="50px"
      h="30px"
      bg={isToggled ? "green.500" : "grey.500"}
      borderRadius="full"
      onClick={() => {
        if (!isDisabled) {
          const value = !isToggled;
          setToggled(value);
          onChange(value);
        }
      }}
      _hover={{ cursor: "pointer" }}
    >
      {onlabel && offLabel && (
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
      )}
      <Box
        position="absolute"
        top="50%"
        left={isToggled ? "50%" : "5%"}
        w="22px"
        h="22px"
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

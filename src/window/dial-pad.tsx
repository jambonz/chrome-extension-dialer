import { Button, HStack, VStack } from "@chakra-ui/react";

type DialPadProbs = {
  handleDigitPress: (digit: string) => void;
};

export const DialPad = ({ handleDigitPress }: DialPadProbs) => {
  const buttons = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    ["*", "0", "#"],
  ];

  return (
    <VStack w="full" bg="black" spacing={0.5}>
      {buttons.map((row, rowIndex) => (
        <HStack key={rowIndex} justifyContent="space-between" spacing={0.5}>
          {row.map((num) => (
            <Button
              key={num}
              onClick={() => handleDigitPress(num)}
              size="lg"
              p={0}
              width="70px"
              height="70px"
              variant="unstyled"
              bg="white"
              borderRadius={0}
            >
              {num}
            </Button>
          ))}
        </HStack>
      ))}
    </VStack>
  );
};

export default DialPad;

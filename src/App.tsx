import React from "react";
import "./styles.scss";
import { Button, Flex, Text } from "@chakra-ui/react";
import { openPhonePopup } from "./utils";
import { DEFAULT_COLOR_SCHEME } from "./common/constants";
export const App = () => {
  const handleClick = () => {
    openPhonePopup();
  };

  return (
    <Flex
      justifyContent="center"
      flexFlow="column"
      height="100%"
      padding="20px"
      alignItems="center"
    >
      <Text fontSize="24px" mb={5}>
        Click 'Start' to activate the service.
      </Text>
      <Button
        size="lg"
        width="full"
        onClick={handleClick}
        colorScheme="jambonz"
      >
        Start
      </Button>
    </Flex>
  );
};

export default App;

import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import {
  ChakraProvider,
  Text,
  IconButton,
  Flex,
  CSSReset,
} from "@chakra-ui/react";
import { Phone } from "react-feather";

export const ContentApp = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const [selectedText, setSelectedText] = useState("");

  // Add event listener for text selection
  useEffect(() => {
    function handleMouseUp() {
      const selectedText = window.getSelection()?.toString();
      if (selectedText) {
        setSelectedText(selectedText);
        const range = window.getSelection()?.getRangeAt(0);
        const rect = range?.getBoundingClientRect();
        setIsOpen(true);
        setPosition({ left: rect?.left || 0, top: rect?.bottom || 0 });
      } else {
        setIsOpen(false);
      }
    }

    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <ChakraProvider>
      <CSSReset />
      {isOpen && (
        <Flex
          position="fixed"
          left={position.left}
          top={position.top}
          bg="white"
          p={4}
          border="1px solid"
          borderColor="gray.200"
          boxShadow="md"
          alignItems="center"
        >
          <Text>{selectedText}</Text>
          <IconButton
            colorScheme="blue"
            ml={2}
            aria-label="text"
            icon={<Phone />}
          />
        </Flex>
      )}
    </ChakraProvider>
  );
};

// Create a new div and attach it to the DOM
const root = document.createElement("div");
document.body.appendChild(root);

ReactDOM.render(<ContentApp />, root);

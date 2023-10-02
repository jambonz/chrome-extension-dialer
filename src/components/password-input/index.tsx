import { useState } from "react";
import {
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Box,
} from "@chakra-ui/react";
import { Eye, EyeOff } from "react-feather";

type PasswordInputProbs = {
  password: [string, React.Dispatch<React.SetStateAction<string>>];
  placeHolder?: string;
};

function PasswordInput({
  password: [pass, setPass],
  placeHolder,
}: PasswordInputProbs) {
  const [showPassword, setShowPassword] = useState(false);
  const handleClick = () => setShowPassword(!showPassword);

  return (
    <InputGroup size="md">
      <Input
        pr="4.5rem"
        type={showPassword ? "text" : "password"}
        placeholder={placeHolder || ""}
        value={pass}
        onChange={(e) => setPass(e.target.value)}
      />
      <InputRightElement width="4.5rem">
        <Button h="1.75rem" size="sm" onClick={handleClick} variant="unstyled">
          {showPassword ? <EyeOff /> : <Eye />}
        </Button>
      </InputRightElement>
    </InputGroup>
  );
}

export default PasswordInput;

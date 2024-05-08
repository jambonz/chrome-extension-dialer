import { useState } from "react";
import { Input, InputGroup, InputRightElement, Button } from "@chakra-ui/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

type PasswordInputProbs = {
  password: [string, React.Dispatch<React.SetStateAction<string>>];
  placeHolder?: string;
  isRequired?: boolean;
};

function PasswordInput({
  password: [pass, setPass],
  placeHolder,
  isRequired = false,
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
        isRequired
        onChange={(e) => setPass(e.target.value)}
      />
      <InputRightElement width="4.5rem">
        <Button h="1.75rem" size="sm" onClick={handleClick} variant="unstyled">
          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
        </Button>
      </InputRightElement>
    </InputGroup>
  );
}

export default PasswordInput;

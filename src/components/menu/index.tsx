import {
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Spinner,
  Tooltip,
} from "@chakra-ui/react";
import { useState } from "react";

export interface IconButtonMenuItems {
  name: string;
  value: string;
}
type IconButtonMenuProbs = {
  icon: React.ReactElement;
  onOpen: () => Promise<IconButtonMenuItems[]>;
  onClick: (name: string, value: string) => void;
  tooltip: string;
};

export const IconButtonMenu = ({
  icon,
  onOpen,
  onClick,
  tooltip,
}: IconButtonMenuProbs) => {
  const [items, setItems] = useState<IconButtonMenuItems[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleOnOpen = () => {
    setIsLoading(true);
    onOpen()
      .then((values) => setItems(values))
      .finally(() => setIsLoading(false));
  };
  return (
    <Menu onOpen={handleOnOpen}>
      <Tooltip label={tooltip}>
        <MenuButton
          as={IconButton}
          aria-label="Options"
          icon={icon}
          variant="unstyled"
        />
      </Tooltip>

      <MenuList>
        {isLoading ? (
          <MenuItem>
            <Spinner color="jambonz.500" size="xs" />
          </MenuItem>
        ) : (
          items.map((i, idx) => (
            <MenuItem key={idx} onClick={() => onClick(i.name, i.value)}>
              {i.name}
            </MenuItem>
          ))
        )}
      </MenuList>
    </Menu>
  );
};

export default IconButtonMenu;

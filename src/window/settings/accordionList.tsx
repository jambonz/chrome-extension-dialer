import {
  Accordion,
  AccordionButton,
  AccordionItem,
  AccordionPanel,
  useDisclosure,
} from "@chakra-ui/react";
import { useState } from "react";
import { IAppSettings } from "src/common/types";
import AccountForm from "src/window/settings/accountForm";
import SettingItem from "src/window/settings/settingItem";

export function AccordionList({
  allSettings,
  reload,
  handleOpenFormInAccordion,
  handleCloseFormInAccordion,
  isNewFormOpen,
  handleCloseNewForm,
}: {
  allSettings: IAppSettings[];
  reload: () => void;
  handleOpenFormInAccordion: () => void;
  handleCloseFormInAccordion: () => void;
  isNewFormOpen: boolean;
  handleCloseNewForm: () => void;
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [openAcc, setOpenAcc] = useState(0);

  const closeFormInAccordion = function () {
    onClose();
    handleCloseFormInAccordion();
    reload();
  };

  function handleToggleAcc(accIndex: number) {
    if (isNewFormOpen) handleCloseNewForm(); //closes new form if open
    handleOpenFormInAccordion();
    setOpenAcc(accIndex);
    // onToggle();
    onOpen();
  }
  return (
    <Accordion
      index={isOpen ? [openAcc] : []}
      allowToggle
      sx={{
        "& > *:last-child": {
          marginBottom: "7px",
        },
      }}
    >
      {allSettings.map((data, index) => (
        <AccordionItem borderColor={"white"} key={index}>
          <AccordionButton
            padding={0}
            marginBottom={-1}
            _hover={{
              backgroundColor: "#fff",
              cursor: "default",
            }}
          >
            {isOpen && index === openAcc ? null : (
              <SettingItem
                onToggleAcc={() => handleToggleAcc(index)}
                data={data}
              />
            )}
          </AccordionButton>
          <AccordionPanel pb={4} px={0}>
            <AccountForm
              formData={data}
              handleClose={closeFormInAccordion}
              inputUniqueId={`${data.id}`}
            />
          </AccordionPanel>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

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
  onOpenForm,
  isNewFormOpen,
}: {
  allSettings: IAppSettings[];
  reload: () => void;
  onOpenForm: () => void;
  isNewFormOpen: boolean;
}) {
  const { isOpen, onToggle } = useDisclosure();
  const [openAcc, setOpenAcc] = useState(0);

  const closeFormInAccordion = function () {
    reload();
    onToggle();
  };

  function handleToggleAcc(accIndex: number) {
    if (isNewFormOpen) return; //prevents opening form if for for new account is open
    onOpenForm();
    setOpenAcc(accIndex);
    onToggle();
  }
  return (
    <Accordion index={isOpen ? [openAcc] : []} allowToggle>
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
            <SettingItem
              onToggleAcc={() => handleToggleAcc(index)}
              data={data}
            />
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

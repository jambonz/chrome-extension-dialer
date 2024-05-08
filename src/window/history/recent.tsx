import { Text, UnorderedList, VStack } from "@chakra-ui/react";
import CallHistoryItem from "./call-history-item";
import { CallHistory } from "src/common/types";
import { useEffect, useState } from "react";
import Fuse from "fuse.js";

type RecentsProbs = {
  calls: CallHistory[];
  search: string;
  isSaved?: boolean;
  onDataChange?: (call: CallHistory) => void;
  onCallNumber?: (number: string, name: string | undefined) => void;
};

export const Recents = ({
  calls,
  search,
  isSaved,
  onDataChange,
  onCallNumber,
}: RecentsProbs) => {
  const [callHistories, setCallHistories] = useState<CallHistory[]>(calls);

  useEffect(() => {
    if (search) {
      setCallHistories((prev) =>
        new Fuse(prev, {
          keys: ["number"],
        })
          .search(search)
          .map(({ item }) => item)
      );
    } else {
      setCallHistories(
        isSaved ? calls.filter((c) => c.isSaved === true) : calls
      );
    }
  }, [search]);

  useEffect(() => {
    setCallHistories(isSaved ? calls.filter((c) => c.isSaved === true) : calls);
  }, [calls]);

  return (
    <VStack spacing={2}>
      {callHistories.length > 0 ? (
        <UnorderedList
          w="full"
          maxH="calc(100vh - 21em)"
          overflowY="auto"
          spacing={2}
          mt={2}
        >
          {callHistories.map((c, i) => (
            <CallHistoryItem
              key={i}
              isSaved={isSaved}
              call={c}
              onCallNumber={onCallNumber}
              onDataChange={onDataChange}
            />
          ))}
        </UnorderedList>
      ) : (
        <Text fontSize="24px" fontWeight="bold">
          {isSaved ? "No saved calls" : "No Call History"}
        </Text>
      )}
    </VStack>
  );
};

export default Recents;

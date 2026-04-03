import { Text, UnorderedList, VStack } from "@chakra-ui/react";
import CallHistoryItem from "./call-history-item";
import { CallHistory } from "src/common/types";
import { useEffect, useMemo, useState } from "react";
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
  const baseCalls = useMemo(
    () => (isSaved ? calls.filter((c) => c.isSaved === true) : calls),
    [calls, isSaved]
  );

  const fuseInstance = useMemo(
    () => new Fuse(baseCalls, { keys: ["number"] }),
    [baseCalls]
  );

  const callHistories = useMemo(() => {
    if (search) {
      return fuseInstance.search(search).map(({ item }) => item);
    }
    return baseCalls;
  }, [search, fuseInstance, baseCalls]);

  return (
    <VStack spacing={2}>
      {callHistories.length > 0 ? (
        <UnorderedList
          w="full"
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

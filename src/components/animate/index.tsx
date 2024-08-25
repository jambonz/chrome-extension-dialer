import React, { ReactNode } from "react";
import { motion } from "framer-motion";

function AnimateOnShow({
  children,
  initial = -20,
  exit = -20,
  duration = 0.3,
}: {
  children: ReactNode;
  initial?: number;
  exit?: number;
  duration?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: initial }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: exit }}
      transition={{ duration: duration }}
    >
      {children}
    </motion.div>
  );
}

export default AnimateOnShow;

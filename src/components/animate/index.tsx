import React, { ReactNode } from "react";
import { motion } from "framer-motion";

function AnimateOnShow({
  children,
  initial = -20,
  exit = -20,
  duration = 0.5,
}: {
  children: ReactNode;
  initial?: number;
  exit?: number;
  duration?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: initial, height: 0 }}
      animate={{ opacity: 1, y: 0, height: "auto" }}
      exit={{ opacity: 0, y: exit, height: 0 }}
      transition={{ duration: duration }}
      style={{ width: "100%" }}
    >
      {children}
    </motion.div>
  );
}

export default AnimateOnShow;

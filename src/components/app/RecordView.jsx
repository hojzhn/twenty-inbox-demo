import { AnimatePresence, motion } from "framer-motion";
import { RecordDetail } from "../layout/RecordDetail";

export function RecordView({ view }) {
  return (
    <motion.div
      key="record"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18, ease: "easeOut" }}
      className="flex-1 min-h-0 flex flex-col"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={view.entity.objectId}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.14, ease: "easeOut" }}
          className="flex-1 min-h-0 flex flex-col"
        >
          <RecordDetail entity={view.entity} defaultTab={view.tab} />
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}

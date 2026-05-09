import { motion } from "framer-motion";
import ActionPanel from "../layout/ActionPanel";

export function ActionPanelSlot({
  actionPanelHidden,
  doneIds,
  isMobile,
  onActionStateChange,
  onClose,
  onMarkDone,
  savedActionState,
  selected,
}) {
  if (!selected) return null;

  const panel = (
    <ActionPanel
      task={selected}
      doneIds={doneIds}
      savedActionState={savedActionState}
      onActionStateChange={onActionStateChange}
      onClose={onClose}
      onMarkDone={onMarkDone}
    />
  );

  if (isMobile) {
    return (
      <motion.aside
        key="action-panel-mobile"
        initial={{ x: "100%" }}
        animate={{ x: actionPanelHidden ? "100%" : 0 }}
        exit={{ x: "100%" }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 bottom-[52px] z-50 bg-[var(--background-primary)] overflow-hidden"
      >
        {panel}
      </motion.aside>
    );
  }

  return (
    <motion.aside
      key="action-panel-desktop"
      initial={{ width: 0 }}
      animate={{ width: 500 }}
      exit={{ width: 0 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="h-full overflow-hidden flex-shrink-0"
    >
      <div className="w-[500px] h-full pl-2">{panel}</div>
    </motion.aside>
  );
}

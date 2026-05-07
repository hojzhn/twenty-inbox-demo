import { AnimatePresence, motion } from "framer-motion";
import { ActionHeader } from "./ActionHeader";
import { ACTIONS, ACTION_OPTIONS } from "../../actions/Actions";

export default function ActionSelector({ task, actionId, setActionId }) {
  const action = actionId ? ACTIONS[actionId] : null;
  const Body = action?.Body;

  return (
    <div className="flex flex-col gap-3">
      <ActionHeader
        actionId={actionId}
        setActionId={setActionId}
        options={ACTION_OPTIONS}
      />
      <AnimatePresence mode="wait" initial={false}>
        {Body && (
          <motion.div
            key={`${task.id}:${actionId}`}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <Body task={task} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

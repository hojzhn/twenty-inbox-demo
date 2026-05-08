import { AnimatePresence, motion } from "framer-motion";
import { ActionHeader } from "./ActionHeader";
import { ACTIONS, getActionOptionSections } from "../../actions/Actions";

export default function ActionSelector({
  task,
  actionId,
  setActionId,
  actionDraft,
  onActionDraftChange,
}) {
  const action = actionId ? ACTIONS[actionId] : null;
  const Body = action?.Body;
  const sections = getActionOptionSections(task.trigger);

  return (
    <div className="flex flex-col gap-3">
      <ActionHeader
        actionId={actionId}
        setActionId={setActionId}
        sections={sections}
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
            <Body
              task={task}
              actionDraft={actionDraft}
              onActionDraftChange={onActionDraftChange}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

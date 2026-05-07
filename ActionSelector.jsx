import { ActionHeader } from "./ActionHeader";
import { ACTIONS, ACTION_OPTIONS } from "./Actions";

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
      {Body && <Body key={task.id} task={task} />}
    </div>
  );
}

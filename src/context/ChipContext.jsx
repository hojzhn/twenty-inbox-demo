import { createContext, useContext } from "react";

// Lets a parent (App) hook into clicks on `<Chip />` without threading props
// through every renderer. Value is a callback (entity) => void, or null when
// chips should remain non-interactive.

export const ChipClickContext = createContext(null);

export const useChipClick = () => useContext(ChipClickContext);

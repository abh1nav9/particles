import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "./store";

export { store } from "./store";
export { toggleTheme } from "./themeSlice";
export type { RootState, AppDispatch };

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

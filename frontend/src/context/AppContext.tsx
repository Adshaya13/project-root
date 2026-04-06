import { createContext, useContext } from "react";
import { appName } from "../utils/env";

interface AppContextValue {
  appName: string;
}

const AppContext = createContext<AppContextValue>({ appName });

export function AppProvider({ children }: { children: React.ReactNode }) {
  return <AppContext.Provider value={{ appName }}>{children}</AppContext.Provider>;
}

export function useAppContext() {
  return useContext(AppContext);
}

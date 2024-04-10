// Context for wallet
import { createContext } from "react";

interface WalletState {
  account: string;
  setAccount: (account: string) => void;
}

export const WalletContext = createContext<WalletState>({
  account: "",
  setAccount: () => {},
});

import { useState } from "react";
import "./App.css";
import { Wallet } from "./components/wallet";
import { WalletContext } from "./context/wallet";

function App() {
  const [account, setAccount] = useState<string>("");

  return (
    <WalletContext.Provider
      value={{
        account: account,
        setAccount: setAccount,
      }}
    >
      <Wallet />
    </WalletContext.Provider>
  );
}

export default App;

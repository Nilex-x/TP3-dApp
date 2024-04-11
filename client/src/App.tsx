import { MetaMaskProvider } from "@metamask/sdk-react";
import { useState } from "react";
import "./App.css";
import { ContractComponent as Contract } from "./components/contract";
import { Wallet } from "./components/wallet";
import { WalletContext } from "./context/wallet";

function App() {
  const [account, setAccount] = useState<string>("");

  return (
    <MetaMaskProvider
      debug={false}
      sdkOptions={{
        dappMetadata: {
          name: "TP3 - Wallet",
          url: window.location.href,
        },
      }}
    >
      <WalletContext.Provider
        value={{
          account: account,
          setAccount: setAccount,
        }}
      >
        <Wallet />
        <Contract />
      </WalletContext.Provider>
    </MetaMaskProvider>
  );
}

export default App;

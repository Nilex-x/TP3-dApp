import { MetaMaskProvider } from "@metamask/sdk-react";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
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
        <ToastContainer position="bottom-right" />
      </WalletContext.Provider>
    </MetaMaskProvider>
  );
}

export default App;

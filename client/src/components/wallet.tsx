import { useSDK } from "@metamask/sdk-react";
import { LoaderCircle } from "lucide-react";
import { useContext, useEffect, useState } from "react";
import Web3 from "web3";
import { WalletContext } from "../context/wallet";

export const Wallet = () => {
  const [web3, setWeb3] = useState<Web3>();
  const [balance, setBalance] = useState<number>(0);
  const { account, setAccount } = useContext(WalletContext);
  const { sdk, connected, connecting } = useSDK();

  useEffect(() => {
    if (typeof window.ethereum !== "undefined")
      setWeb3(new Web3(window.ethereum));
  }, []);

  useEffect(() => {
    getBalance().then((balance) => setBalance(balance));
  }, [account]);

  const connect = async () => {
    try {
      const accounts = await sdk?.connect();
      setAccount(accounts[0]);
    } catch (err) {
      console.warn("failed to connect..", err);
    }
  };

  const disconnect = async () => {
    try {
      await sdk?.disconnect();
      setAccount("");
    } catch (err) {
      console.warn("failed to disconnect..", err);
    }
  };

  const getBalance = async () => {
    return (
      web3?.eth.getBalance(account).then((balance) => {
        return parseFloat(web3?.utils.fromWei(balance, "ether"));
      }) ?? 0
    );
  };

  return (
    <div>
      {(!connected || !account) && (
        <button
          onClick={connect}
          className="px-4 py-2 font-bold text-white bg-blue-500 rounded hover:bg-blue-700 "
        >
          {connecting ? (
            <LoaderCircle className="w-24 size-6 animate-spin" />
          ) : (
            "Connect"
          )}
        </button>
      )}

      {connected && account && (
        <button
          onClick={disconnect}
          className="px-4 py-2 font-bold text-white bg-red-500 rounded hover:bg-red-700 "
        >
          Disconnect
        </button>
      )}

      {connected && account && (
        <div className="flex items-center justify-center mt-4 gap-x-2">
          <span className="px-2 py-1 text-xs bg-green-300 rounded">
            {account && `${account}`}
          </span>
          <span>({balance.toPrecision(5)} ETH)</span>
        </div>
      )}
    </div>
  );
};

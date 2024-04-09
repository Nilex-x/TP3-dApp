import { useContext, useEffect, useState } from "react";
import Web3 from "web3";
import { WalletContext } from "../context/wallet";

export const Wallet = () => {
  const [accounts, setAccounts] = useState<string[]>([]);
  const { account: selectedAccount, setAccount } = useContext(WalletContext);

  const loadBlockChain = async () => {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
    const accounts = await web3.eth.getAccounts();

    setAccounts(accounts);
  };

  useEffect(() => {
    loadBlockChain();
  }, []);

  return (
    <select
      onChange={(e) => setAccount(e.target.value)}
      defaultValue={selectedAccount}
      className="p-2 border border-gray-300 rounded"
    >
      {accounts.map((account) => (
        <option key={account} value={account}>
          {account}
        </option>
      ))}
    </select>
  );
};

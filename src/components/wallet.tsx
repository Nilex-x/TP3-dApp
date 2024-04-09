import { useEffect, useState } from "react";
import Web3 from "web3";

export const Wallet = () => {
  const [account, setAccount] = useState<string>("");

  const loadBlockChain = async () => {
    const web3 = new Web3(Web3.givenProvider || "http://localhost:7545");
    const accounts = await web3.eth.getAccounts();

    setAccount(accounts[0]);
  };

  useEffect(() => {
    loadBlockChain();
  }, []);

  return (
    <div>
      <p>{account}</p>
    </div>
  );
};

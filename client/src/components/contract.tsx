import { useContext, useEffect, useState } from "react";
import Web3, { Contract } from "web3";
import { TODO_LIST_ABI } from "../config";
import { WalletContext } from "../context/wallet";

export const ContractComponent = () => {
  const { account } = useContext(WalletContext);
  const [todoList, setTodoList] = useState<Contract<typeof TODO_LIST_ABI>>();

  useEffect(() => {
    // Load todolist with truffle
    const loadTodolist = async () => {
      // Load contract
      const contract = await window.ethereum?.request({
        method: "eth_getCode",
        params: ["0x863bB4Db07052819701a0cC1AbC2dcB4Ca5fADf5"],
      });

      // Check if contract is deployed
      if (contract === "0x") {
        console.log("Contract not deployed");
        return;
      }

      const web3 = new Web3(window.ethereum);

      // Get contract instance
      const instance = new web3.eth.Contract(
        TODO_LIST_ABI,
        "0x863bB4Db07052819701a0cC1AbC2dcB4Ca5fADf5"
      );

      setTodoList(instance);

      // Get task count
      const taskCount = await instance.methods.taskCount().call();

      console.log(taskCount);
    };

    loadTodolist();
  }, []);

  return (
    <div>
      <button
        onClick={async () => {
          if (!todoList) return;

          await todoList.methods.createTask("Task 1").send({
            from: account,
          });
        }}
      >
        Create task
      </button>
    </div>
  );
};

export default Contract;

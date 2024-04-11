import { FormEvent, useContext, useEffect, useState } from "react";
import Web3, { Address, Contract, Uint } from "web3";
import { TODO_LIST_ABI } from "../config";
import { WalletContext } from "../context/wallet";

import TODO_LIST_CONFIG from '../../../build/contracts/TodoList.json';

interface TaskType {
  owner: Address;
  id: Uint;
  content: string;
  validated: boolean;
  completed: boolean;
}

export const ContractComponent = () => {
  const { account } = useContext(WalletContext);
  const [todoList, setTodoList] = useState<Contract<typeof TODO_LIST_ABI>>();
  const [tasks, setTasks] = useState<Array<TaskType>>([]);
  const [content, setContent] = useState<string>('');

  const getTasks = async (todolist: Contract<typeof TODO_LIST_ABI>) => {
    const taskTmp: Array<TaskType> = [];

    // Get task count
    const taskCount: bigint | undefined = await todolist.methods
      .taskCount()
      .call();

    for (var i = 1; i <= taskCount!; i++) {
      const task: any & TaskType = await todolist.methods.tasks(i).call();
      taskTmp.push({
        owner: task.owner,
        id: task.id,
        content: task.content,
        validated: task.validated,
        completed: task.completed,
      });
    }

    console.log(taskTmp);
    setTasks(taskTmp);
  };

  // Load todolist with truffle
  const loadTodolist = async () => {
    // Load contract
    const contract = await window.ethereum?.request({
      method: "eth_getCode",
      params: [import.meta.env.VITE_SMART_CONTRACT_ADDRESS], // smart contract address
    });

    // Check if contract is deployed
    if (contract === "0x") {
      console.log("Contract not deployed");
      return;
    }

    const web3 = new Web3(window.ethereum);

    // Get contract instance
    const instance = new web3.eth.Contract(
        TODO_LIST_CONFIG.abi,
        import.meta.env.VITE_SMART_CONTRACT_ADDRESS // smart contract address
    );

    setTodoList(instance);

    getTasks(instance);
  };

  useEffect(() => {
    if (!todoList) {
      loadTodolist();
    } else {
      getTasks(todoList);
    }
  }, []);

  const createTask = async (e: FormEvent) => {
    e.preventDefault();

    if (!todoList) {
      console.log("contract not deployed");
      return;
    }

    try {
      await todoList.methods.createTask(content).send({
        from: account,
        gas: "100000",
      });
      getTasks(todoList);
    } catch (err) {
      console.error(err);
    }
  };

  const validateTask = async (id: Uint) => {
    if (!todoList) {
      console.log("contract not deployed");
      return;
    }

    try {
      await todoList.methods.validateTask(id).call();
      getTasks(todoList);
    } catch (err) {
      console.error(err);
    }
  }

  const completeTask = async (id: Uint) => {
    if (!todoList) {
      console.log("contract not deployed");
      return;
    }

    try {
      await todoList.methods.toggleCompleted(id).send({
        from: account,
        gas: "100000",
      });
      getTasks(todoList);
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <div style={{ margin: 20 }}>
      <form onSubmit={createTask}>
        <input
          style={{
            backgroundColor: "#a3a3a3",
            borderRadius: 10,
            paddingInlineStart: 10,
          }}
          name="content"
          type="text"
          onChange={(e) => setContent(e.target.value)}
        />
        <button style={{ marginLeft: 10 }} type="submit">
          create
        </button>
      </form>
      <div style={{ display: "flew", flexDirection: "row", justifyContent: "center", alignItems: "center" }}>
        {tasks.map((task, index) => (
          <div style={{ display: 'flex', flexDirection: "row" }} key={"task" + index}>
            <div style={{ margin: 10 }}>
              {task.content}
            </div>
            {!task.validated &&
              <button style={{ margin: 5, backgroundColor: "yellow", padding: 5, borderRadius: 6 }} onClick={() => validateTask(task.id)}>Validate</button>
            }
            {!task.completed &&
              <button style={{ margin: 5, backgroundColor: "green", padding: 5, borderRadius: 6 }} onClick={() => completeTask(task.id)}>Complete</button>
            }
          </div>
        ))}
      </div>
    </div>
  );
};

export default Contract;

import { FormEvent, useContext, useEffect, useState } from "react";
import Web3, { Address, Contract, EventLog, Uint } from "web3";
import { TODO_LIST_ABI } from "../config";
import { WalletContext } from "../context/wallet";

import { toast } from "react-toastify";
import TODO_LIST_CONFIG from "../../../build/contracts/TodoList.json";

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
  const [content, setContent] = useState<string>("");

  const getTasks = async (todolist: Contract<typeof TODO_LIST_ABI>) => {
    const taskTmp: Array<TaskType> = [];

    // Get task count
    const taskCount: bigint | undefined = await todolist.methods
      .taskCount()
      .call();

    for (let i = 1; i <= taskCount!; i++) {
      const task: any & TaskType = await todolist.methods.tasks(i).call();
      taskTmp.push({
        owner: task.owner,
        id: task.id,
        content: task.content,
        validated: task.validated,
        completed: task.completed,
      });
    }

    setTasks(taskTmp);
  };

  useEffect(() => {
    // Load todolist with truffle
    const loadTodolist = async () => {
        console.log(import.meta.env.VITE_SMART_CONTRACT_ADDRESS)

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

    const toastCreated = (event: EventLog) => {
      toast(`Task "${event.returnValues.content}" created`, {
        type: "success",
      });
    };
    const toastValidated = (event: EventLog) => {
      toast(`Task "${event.returnValues.content}" validated`, {
        type: "info",
      });
    };
    const toastCompleted = () => {
      toast(`Task completed`, {
        type: "info",
      });
    };

    if (!todoList) {
      loadTodolist();
    } else {
      getTasks(todoList);

      todoList.events.TaskCreated().on("data", toastCreated);

      todoList.events.TaskValidate().on("data", toastValidated);

      todoList.events.TaskCompleted().on("data", toastCompleted);
    }

    return () => {
      todoList?.events.TaskCreated().removeAllListeners();
      todoList?.events.TaskValidate().removeAllListeners();
      todoList?.events.TaskCompleted().removeAllListeners();
    };
  }, [todoList]);

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
      await todoList.methods.validateTask(id).send({
        from: account,
        gas: "100000",
      });
      getTasks(todoList);
    } catch (err) {
      console.error(err);
    }
  };

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
  };

  if (!account) {
    return (
      <div className="mt-8">
        You need to connect your wallet to interact with the contract
      </div>
    );
  }

  return (
    <div className="mt-8">
      <form
        onSubmit={createTask}
        className="flex items-center justify-center gap-x-3"
      >
        <input
          className="px-4 py-2 border border-gray-300 rounded"
          placeholder="Task name"
          name="content"
          type="text"
          onChange={(e) => setContent(e.target.value)}
        />
        <button
          className="px-4 py-2 text-white bg-blue-400 rounded hover:bg-blue-500"
          type="submit"
        >
          Add task
        </button>
      </form>
      <div className="flex flex-col-reverse mt-4">
        {tasks.map((task, index) => {
          if (task.owner.toLowerCase() !== account.toLowerCase()) return null;

          return (
            <div
              className="flex items-center justify-between px-4 py-2 mt-2 border border-gray-300 rounded"
              key={"task" + index}
            >
              <div
                className={`font-bold ${task.completed ? "line-through" : ""} ${
                  !task.validated ? "text-red-500" : ""
                }`}
              >
                {task.content}
              </div>
              <div className="flex gap-x-2">
                <button
                  className="px-4 py-2 text-white bg-blue-400 rounded hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-400"
                  disabled={task.validated}
                  onClick={() => validateTask(task.id)}
                >
                  Validate
                </button>

                <button
                  className="px-4 py-2 text-white bg-green-400 rounded hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-400"
                  disabled={task.completed}
                  onClick={() => completeTask(task.id)}
                >
                  Complete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Contract;

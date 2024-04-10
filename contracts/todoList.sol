// SPDX-License-Identifier: MIT
pragma solidity ^0.5.16;

contract TodoList {
    uint public taskCount = 0;
    struct Task {
        address owner;
        uint id;
        string content;
        bool validated;
        bool completed;
    }
    mapping(uint => Task) public tasks;

    constructor() public {
        createTask("TP3 Blockchain");
    }

    modifier onlyOwner(uint _id) {
        Task memory _task = tasks[_id];
        require(msg.sender == _task.owner);
        _;
    }

    event TaskCreated(
        uint id,
        string content
    );

    event TaskValidate(
        uint id,
        string content,
        bool validate
    );

    event TaskCompleted(
        uint id,
        bool completed
    );

    function createTask(string memory _content) public {
        taskCount++;
        tasks[taskCount] = Task(msg.sender, taskCount, _content, false, false);
        emit TaskCreated(taskCount, _content);
    }

    function createValidTask(string memory _content) public payable {
        require(msg.value > 0, "Zero amount not allowed");
        taskCount++;
        tasks[taskCount] = Task(msg.sender, taskCount, _content, true, false);
        emit TaskCreated(taskCount, _content);
    }

    function validateTask(uint _id) public {
        Task memory _task = tasks[_id];
        if (_task.validated == true) {
            revert("Task is already validate !");
        }
        _task.validated = true;
        emit TaskValidate(_id, _task.content, true);
    }

    function toggleCompleted(uint _id) public onlyOwner(_id) {
        Task memory _task = tasks[_id];
        _task.completed = !_task.completed;
        tasks[_id] = _task;
        emit TaskCompleted(_id, _task.completed);
    }

}
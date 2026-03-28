const taskInput = document.getElementById('task-input');
const addTaskButton = document.getElementById('add-task');
const taskList = document.getElementById('task-list');
const filter = document.getElementById('filter');

let taskId = 0;

addTaskButton.addEventListener('click', () => 
{
    if (taskInput.value.trim() === '') return;
    const li = document.createElement('li');
    li.className = 'task';
    li.textContent = taskInput.value;
    li.id = `task-${taskId}`;

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.classList.add('delete-task');
    deleteButton.addEventListener('click', () => 
    {
        taskList.removeChild(li);
    });

    const completeButton = document.createElement('button');
    completeButton.textContent = 'Complete';
    completeButton.classList.add('task-complete');
    completeButton.addEventListener('click', () => 
    {
        li.classList.add('completed');
    });

    li.appendChild(deleteButton);
    li.appendChild(completeButton);
    taskList.appendChild(li);
    taskInput.value = '';
    taskId++;
});

filter.addEventListener('change', () => 
{
    const tasks = taskList.getElementsByTagName('li');
    Array.from(tasks).forEach(task => 
    {
        switch (filter.value) 
        {
            case 'all':
                task.style.display = '';
                break;
            case 'completed':
                if(task.classList.contains('completed')) 
                {
                    task.style.display = '';
                } 
                else 
                {
                    task.style.display = 'none';
                }
                break;
            case 'active':
                if(!task.classList.contains('completed')) 
                {
                    task.style.display = '';
                } 
                else 
                {
                    task.style.display = 'none';
                }
                break;
        }
    });
});
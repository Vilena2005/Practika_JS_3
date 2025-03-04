Vue.component('kanban', {
    template: `
        <div class='app'> 
            <h1>KABAN TABLE</h1>
            <create-task-form @task-created="createTask"></create-task-form>
            <div class="columns">
                <column title="Запланированные задачи" :tasks="plannedTasks" @task-moved="moveTask" @task-delete="deleteTask"></column>
                <column title="Задачи в работе" :tasks='inProgressTasks' @task-moved="moveTask"></column>
                <column title="Тестирование" :tasks="testingTasks" @task-moved="moveTask" @task-returned="returnTask"></column>
                <column title="Выполненные задачи" :tasks="completedTasks"></column>
            </div>
        </div>
    `,
    data() {
        return {
            plannedTasks: [],
            inProgressTasks: [],
            testingTasks: [],
            completedTasks: []
        }
    },
    methods: {
        createTask(task) {
            this.plannedTasks.push(task);
            this.saveTasks();
        },
        moveTask({task, targetColumn}) {
            this[task.column].splice(this[task.column].indexOf(task), 1);
            this[targetColumn].push({...task, column: targetColumn, lastEdited: new Date()});
            this.saveTasks();
        },
        returnTask({task, targetColumn, returnReason}){
            this[task.column].splice(this[task.column].indexOf(task), 1);
            this[targetColumn].push({...task, column: targetColumn, lastEdited: new Date(), returnReason: returnReason});
            this.saveTasks();
        },
        deleteTask(task){
            const index = this[task.column].findIndex(t => t === task);
            if (index !== -1) {
                this[task.column].splice(index, 1);
            }
            this.saveTasks();
        },
        saveTasks() {
            const tasks = {
                plannedTasks: this.plannedTasks,
                inProgressTasks: this.inProgressTasks,
                testingTasks: this.testingTasks,
                completedTasks: this.completedTasks
            };
            localStorage.setItem('kanbanTasks', JSON.stringify(tasks));
        },
        loadTasks() {
            const tasks = localStorage.getItem('kanbanTasks');
            if (tasks) {
                const parsedTasks = JSON.parse(tasks);
                this.plannedTasks = parsedTasks.plannedTasks || [];
                this.inProgressTasks = parsedTasks.inProgressTasks || [];
                this.testingTasks = parsedTasks.testingTasks || [];
                this.completedTasks = parsedTasks.completedTasks || [];
            }
        }
    },
    created() {
        this.loadTasks();
    }
})
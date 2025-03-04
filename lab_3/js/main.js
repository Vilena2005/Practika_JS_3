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

Vue.component('create-task-form', {
    template: `
        <div class="task-form">
            <h2>Создание задачи</h2>
            <input type="text" v-model="title" placeholder="Заголовок">
            <textarea v-model="description" placeholder="Описание"></textarea>
            <h4>Подзадачи</h4>
            <div v-for="(subtask, index) in subtasks" :key="index">
                <input type="text" v-model="subtask.title" placeholder="Название подзадачи">
                <button @click="removeSubtask(index)">Удалить</button>
            </div>
            <button @click="addSubtask">Добавить подзадачу</button>
            <label for="deadline">Дедлайн:</label>
            <input type="date" v-model="deadline">
            <h4 v-if="notUniqueTitle(title)">Задача с таким заголовком уже существует</h4>
            <h4 v-if="title == '' || description == '' || deadline ==''">Для создания задачи заполните все поля</h4>
            <button @click="createTask" v-if="title !== '' && description !== '' && deadline !=='' && !notUniqueTitle(title)">Создать</button>
        </div>
   `,
    data() {
        return {
            title: '',
            description: '',
            deadline: '',
            subtasks: []
        }
    },
    methods: {
        addSubtask() {
            this.subtasks.push({ title: '', completed: false });
        },
        removeSubtask(index) {
            this.subtasks.splice(index, 1);
        },
        notUniqueTitle(title) {
            const allTasks = [
                ...this.$parent.plannedTasks,
                ...this.$parent.inProgressTasks,
                ...this.$parent.testingTasks,
                ...this.$parent.completedTasks
            ];

            return allTasks.some(task => task.title === title);
        },
        createTask() {
            const filteredSubtasks = this.subtasks.filter(subtask => subtask.title.trim() !== '');
            
            const newTask = {
                title: this.title,
                description: this.description,
                deadline: this.deadline,
                lastEdited: new Date(),
                column: 'plannedTasks',
                subtasks: filteredSubtasks
            };

            this.$emit('task-created', newTask);

            this.title = '';
            this.description = '';
            this.deadline = '';
            this.subtasks = [];
        }
    }
})



let app = new Vue({
    el: '#app'
})
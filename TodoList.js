var oAdd = document.getElementById('add');
var oTodoList = document.getElementById('todoList');
var oDoneList = document.getElementById('doneList');
var oTodoNum = document.getElementById('todoNum');
var oDoneNum = document.getElementById('doneNum');

function TaskManager(){
	this.todos = [];
	this.dones = [];
	this.history = [];
	this.total_count = 0;
}

/* 声明Task
 */
function Task(obj){
	/*静态变量*/
	Task.STATUS_TODO = 'todo';
	Task.STATUS_DONE = 'done';

	//Task实例变量，Task去调用
	this.name = obj.name;
	this.status = obj.status || Task.STATUS_TODO;
	this.index = obj.index || TaskManager.getInstance().total_count;
	this.create_at = obj.create_at || new Date();
	this.id = obj.id || new Date().getTime();

	TaskManager.getInstance().pushItem(this);
}

/*
 *把新建的task添加进todos里面 
 */
TaskManager.prototype.pushItem = function(task){
	if(task.isDone()){
		this.dones.push(task);
	}else{
		this.todos.push(task);
	}
	this.total_count ++;
}

/*
 *管理者单例模式
 */
TaskManager.getInstance = (function(){
	var Instance;
	return function(){
		if(!Instance){
			Instance = new TaskManager();
		}
		return Instance;
	}
})();

/*
*Task实例方法，获取是否完成
 */
Task.prototype.isDone = function(){
	return this.status == Task.STATUS_DONE;
}

/*
* 改变status状态
 */
Task.prototype.changeStatus = function(){
	if(this.isDone()){
		this.status = Task.STATUS_TODO;
	}else{
		this.status = Task.STATUS_DONE;
	}

	TaskManager.getInstance().refreshItem(this);
}

/*
 *删除manager数组中的task
 */
TaskManager.prototype.deleteStatus = function(status,id){
	if(status == Task.STATUS_TODO){
		var index = this.todos.indexOf(id);
		this.todos.splice(index,1);
	}
	if(status == Task.STATUS_DONE){
		var index = this.dones.indexOf(id);
		this.dones.splice(index,1);
	}
}

TaskManager.prototype.refreshItem = function(task){
	if(task.isDone()){
		//从未完成到完成
		var index = this.todos.indexOf(task);
		if(index > -1){
			this.todos.splice(index,1);
			this.dones.push(task);
		}
	}else{
		//从完成到未完成
		var index = this.dones.indexOf(task);
		if(index > -1){
			this.dones.splice(index,1);
			this.todos.push(task);
		}
	}
}

/*
 *在输入框输入内容后点击回车添加任务
 */
oAdd.onkeydown = function(event){
	if(event.keyCode == 13){  //判断按键为回车
		if(oAdd.value !== ""){
			var task = new Task({name:oAdd.value});  //创建一个新的task
			oTodoList.innerHTML += `<li id="${task.id}"><input type="checkbox" onclick="changePage(${task.id})">${oAdd.value}<a href="javascript:void(0)" title="删除" onclick="fnDelete(${task.id})">-</a></li>`;
			oAdd.value = "";
		}else{
			return;
		}
		oTodoNum.innerHTML = TaskManager.getInstance().todos.length;
		oDoneNum.innerHTML = TaskManager.getInstance().dones.length;
	
		//把TaskManager转化为Json格式存储
		localStorage.setItem('list',JSON.stringify(TaskManager.getInstance()));
	}
}

/*
 *获取Task的ID值
 */
TaskManager.prototype.getTaskById = function(id){
	for(var i=0;i < this.todos.length;i++){
		if(id == this.todos[i].id){
			return this.todos[i];
		}
	}
	for(var i=0;i< this.dones.length;i++){
		if(id == this.dones[i].id){
			return this.dones[i];
		}
	}
}

/*
 *改变页面	
 */
function changePage(id){
	var task = TaskManager.getInstance().getTaskById(id);
	task.changeStatus();
	if(task.isDone()){
		oDoneList.appendChild(document.getElementById(id));
	}else{
		oTodoList.appendChild(document.getElementById(id));
	}
	oTodoNum.innerHTML = TaskManager.getInstance().todos.length;
	oDoneNum.innerHTML = TaskManager.getInstance().dones.length;
	localStorage.setItem('list',JSON.stringify(TaskManager.getInstance()));
}

/*
 *删除任务
 */
function fnDelete(id){
	// debugger;
	var task = TaskManager.getInstance().getTaskById(id);
	TaskManager.getInstance().deleteStatus(task.status,task);
	document.getElementById(id).remove();
	TaskManager.getInstance().total_count --;
	oTodoNum.innerHTML = TaskManager.getInstance().todos.length;
	oDoneNum.innerHTML = TaskManager.getInstance().dones.length;
	localStorage.setItem('list',JSON.stringify(TaskManager.getInstance()));
}

/*
 *打开页面加载
 *把Json字符串转换为对象
 */
var oTaskList = JSON.parse(localStorage.getItem('list'));
	
if(typeof(oTaskList) !== 'undefined' && oTaskList !== null){
	voluation();
	// debugger;
	var taskManager = TaskManager.getInstance();
	var todoLen = taskManager.todos.length || 0;

	//todos Task页面展示
	for(var i=0;i<todoLen;i++){
		oTodoList.innerHTML += `<li id="${taskManager.todos[i].id}">${taskManager.todos[i].name}<input type="checkbox" onclick="changePage(${taskManager.todos[i].id})">${taskManager.todos[i].name}<a href="javascript:void(0)" title="删除" onclick="fnDelete(${taskManager.todos[i].id})">-</a></li>`;
	}
	var doneLen = taskManager.dones.length || 0;

	//dones Tasks页面展示
	for(var i=0;i<doneLen;i++){
		oDoneList.innerHTML += `<li id="${taskManager.dones[i].id}">${taskManager.dones[i].name}<input type="checkbox" checked="checked" onclick="changePage(${taskManager.dones[i].id})">${taskManager.dones[i].name}<a href="javascript:void(0)" title="删除" onclick="fnDelete(${taskManager.dones[i].id})">-</a></li>`;
	}
	oTodoNum.innerHTML = oTaskList.todos.length;
	oDoneNum.innerHTML = oTaskList.dones.length;
}

/*
 *把oTaskList对象的值赋给TaskManager类
 */
function voluation(){
	for(var i=0;i<oTaskList.todos.length;i++){
		new Task(oTaskList.todos[i]);
	}
	for(var i=0;i<oTaskList.dones.length;i++){
		new Task(oTaskList.dones[i]);
	}
	for(var i=0;i<oTaskList.history.length;i++){
		new Task(oTaskList.history[i]);
	}
}

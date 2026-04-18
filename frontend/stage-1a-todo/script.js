let todo = {
  title: "Build Todo Card Component",
  description: "Create a fully accessible and responsive todo card with proper test IDs and semantic HTML.",
  priority: "High",
  status: "Pending",
  dueDate: new Date("2026-03-01T18:00:00Z"),
  completed: false,
};

// DOM
const title = document.getElementById("title");
const description = document.getElementById("description");
const fullDescription = document.getElementById("fullDescription");
const status = document.getElementById("status");
const priority = document.getElementById("priority");
const checkbox = document.getElementById("complete");
const dueDateEl = document.getElementById("dueDate");
const timeRemaining = document.getElementById("timeRemaining");
const overdueIndicator = document.getElementById("overdueIndicator");
const statusControl = document.getElementById("statusControl");
const priorityIndicator = document.getElementById("priorityIndicator");

// Edit
const editForm = document.getElementById("editForm");
const editTitle = document.getElementById("editTitle");
const editDesc = document.getElementById("editDesc");
const editPriority = document.getElementById("editPriority");
const editDate = document.getElementById("editDate");
const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");

// Expand
const expandBtn = document.getElementById("expandBtn");
const collapsible = document.getElementById("collapsible");

let expanded = false;

// -------- FUNCTIONS --------

function render() {
  title.textContent = todo.title;
  description.textContent = todo.description;
  fullDescription.textContent = todo.description;

  status.textContent = todo.status;
  priority.textContent = todo.priority;

  checkbox.checked = todo.completed;
  statusControl.value = todo.status;

  dueDateEl.textContent = `Due ${todo.dueDate.toDateString()}`;

  title.style.textDecoration = todo.completed ? "line-through" : "none";

  updatePriorityUI();
  updateTime();
}

function updatePriorityUI() {
  priorityIndicator.className = "";

  if (todo.priority === "High") priorityIndicator.classList.add("high");
  if (todo.priority === "Medium") priorityIndicator.classList.add("medium");
  if (todo.priority === "Low") priorityIndicator.classList.add("low");
}

function updateTime() {
  if (todo.status === "Done") {
    timeRemaining.textContent = "Completed";
    overdueIndicator.textContent = "";
    return;
  }

  const now = new Date();
  const diff = todo.dueDate - now;

  const minutes = Math.floor(Math.abs(diff) / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (diff < 0) {
    overdueIndicator.textContent = "Overdue";
    overdueIndicator.style.color = "red";

    if (hours < 1) timeRemaining.textContent = `Overdue by ${minutes} mins`;
    else if (hours < 24) timeRemaining.textContent = `Overdue by ${hours} hrs`;
    else timeRemaining.textContent = `Overdue by ${days} days`;

  } else {
    overdueIndicator.textContent = "";

    if (minutes < 60) timeRemaining.textContent = `Due in ${minutes} mins`;
    else if (hours < 24) timeRemaining.textContent = `Due in ${hours} hrs`;
    else timeRemaining.textContent = `Due in ${days} days`;
  }
}

// -------- EVENTS --------

checkbox.onchange = () => {
  todo.completed = checkbox.checked;
  todo.status = checkbox.checked ? "Done" : "Pending";
  render();
};

statusControl.onchange = () => {
  todo.status = statusControl.value;
  todo.completed = todo.status === "Done";
  render();
};

expandBtn.onclick = () => {
  expanded = !expanded;
  collapsible.hidden = !expanded;
  expandBtn.setAttribute("aria-expanded", expanded);
  expandBtn.textContent = expanded ? "Show Less" : "Show More";
};

function enterEditMode() {
  editForm.hidden = false;

  editTitle.value = todo.title;
  editDesc.value = todo.description;
  editPriority.value = todo.priority;
  editDate.value = todo.dueDate.toISOString().slice(0,16);
}

function handleDelete() {
  alert("Delete clicked");
}

saveBtn.onclick = () => {
  todo.title = editTitle.value;
  todo.description = editDesc.value;
  todo.priority = editPriority.value;
  todo.dueDate = new Date(editDate.value);

  editForm.hidden = true;
  render();
};

cancelBtn.onclick = () => {
  editForm.hidden = true;
};

// Init
render();
setInterval(updateTime, 60000);
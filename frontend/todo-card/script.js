const checkbox = document.getElementById("complete");
const status = document.getElementById("status");
const title = document.getElementById("title");

const dueDate = new Date("2026-03-01T18:00:00Z");
const timeEl = document.getElementById("timeRemaining");

function updateTimeRemaining() {
  const now = new Date();
  const diff = dueDate - now;

  const absHours = Math.abs(Math.floor(diff / (1000 * 60 * 60)));

  if (diff < 0) {
    timeEl.textContent = `Overdue by ${absHours} hour(s)`;
  } else if (absHours === 0) {
    timeEl.textContent = "Due now!";
  } else if (absHours < 24) {
    timeEl.textContent = "Due tomorrow";
  } else {
    const days = Math.floor(absHours / 24);
    timeEl.textContent = `Due in ${days} day(s)`;
  }
}

updateTimeRemaining();
setInterval(updateTimeRemaining, 60000);

checkbox.addEventListener("change", () => {
  if (checkbox.checked) {
    status.textContent = "Done";
    title.style.textDecoration = "line-through";
  } else {
    status.textContent = "Pending";
    title.style.textDecoration = "none";
  }
});

function handleEdit() {
  console.log("edit clicked");
}

function handleDelete() {
  alert("Delete clicked");
}
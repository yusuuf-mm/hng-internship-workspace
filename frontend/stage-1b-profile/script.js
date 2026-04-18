const timeEl = document.getElementById("time");

function updateTime() {
  timeEl.textContent = Date.now();
}

// initial render
updateTime();

// update every second
setInterval(updateTime, 1000);
const STORAGE_KEY = "tasks"; // localStorage key

const columns = {
  todo: document.querySelector("#todo"),
  progress: document.querySelector("#progress"),
  done: document.querySelector("#done"),
};

const columnList = Object.values(columns);

let dragElement = null;
let taskData = { todo: [], progress: [], done: [] };

// Column-wise task count update
function updateCounts() {
  columnList.forEach((col) => {
    const tasks = col.querySelectorAll(".task");
    const countEl = col.querySelector(".heading .right");
    if (countEl) {
      countEl.innerText = tasks.length;
    }
  });
}

// Save current UI -> localStorage
function saveTasks() {
  columnList.forEach((col) => {
    const tasks = col.querySelectorAll(".task");
    const colId = col.id;

    taskData[colId] = Array.from(tasks).map((t) => ({
      title: t.querySelector("h2")?.innerText.trim() || "",
      desc: t.querySelector("p")?.innerText.trim() || "",
    }));
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(taskData));
}

// Ek naya .task element create karo (with listeners)
function createTaskElement(title, desc) {
  const div = document.createElement("div");
  div.classList.add("task");
  div.setAttribute("draggable", "true");

  div.innerHTML = `
    <h2>${title}</h2>
    <p>${desc}</p>
    <button class="delete-task">Delete</button>
  `;

  // dragstart pe is element ko remember karenge
  div.addEventListener("dragstart", () => {
    dragElement = div;
  });

  // delete button
  const deleteBtn = div.querySelector(".delete-task");
  deleteBtn.addEventListener("click", () => {
    div.remove();
    updateCounts();
    saveTasks();
  });

  return div;
}

// Column par drag & drop events attach karo
function addDragEventsToColumn(col) {
  col.addEventListener("dragenter", (e) => {
    e.preventDefault();
    col.classList.add("hover-over");
  });

  col.addEventListener("dragover", (e) => {
    e.preventDefault(); // drop allow
  });

  col.addEventListener("dragleave", () => {
    col.classList.remove("hover-over");
  });

  col.addEventListener("drop", (e) => {
    e.preventDefault();
    col.classList.remove("hover-over");

    if (dragElement) {
      col.appendChild(dragElement);
      dragElement = null;
      updateCounts();
      saveTasks();
    }
  });
}

// localStorage se tasks load karo
function loadTasksFromStorage() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return;

  try {
    const data = JSON.parse(stored);
    taskData = data;

    // Har column ke liye tasks create karke append karo
    Object.keys(columns).forEach((colId) => {
      const col = columns[colId];
      const tasks = data[colId] || [];

      

      tasks.forEach((task) => {
        const el = createTaskElement(task.title, task.desc);
        col.appendChild(el);
      });
    });

    updateCounts();
  } catch (err) {
    console.error("Error parsing tasks from storage:", err);
  }
}



// 1) Pehle se HTML me jo .task hai, usko bhi proper bana do
document.querySelectorAll(".task").forEach((taskEl) => {
  taskEl.setAttribute("draggable", "true");

  taskEl.addEventListener("dragstart", () => {
    dragElement = taskEl;
  });

  let btn = taskEl.querySelector("button");
  if (btn) {
    btn.classList.add("delete-task");
    btn.addEventListener("click", () => {
      taskEl.remove();
      updateCounts();
      saveTasks();
    });
  }
});

// 2) Columns pe drag & drop events
columnList.forEach(addDragEventsToColumn);

// 3) localStorage se data load karo (agar hai)
loadTasksFromStorage();
updateCounts();



const toggleModalButton = document.querySelector("#toggle-modal");
const modalBg = document.querySelector(".modal .bg");
const modal = document.querySelector(".modal");
const addTaskButton = document.querySelector("#add-new-task");

const titleInput = document.querySelector("#task-title-input");
const descInput = document.querySelector("#task-desc-input");

toggleModalButton.addEventListener("click", () => {
  modal.classList.toggle("active");
});

modalBg.addEventListener("click", () => {
  modal.classList.remove("active");
});

addTaskButton.addEventListener("click", () => {
  const title = titleInput.value.trim();
  const desc = descInput.value.trim();

  if (!title) {
    // agar title khali hai to kuch mat karo
    return;
  }

  // Naya task banao & TODO me daal do
  const taskEl = createTaskElement(title, desc);
  columns.todo.appendChild(taskEl);

  // Inputs clear karo
  titleInput.value = "";
  descInput.value = "";

  updateCounts();
  saveTasks();

  modal.classList.remove("active");
});

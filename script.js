// ── STATE ──
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
let currentFilter = 'all';

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  showDate();
  renderTasks();

  // Add task on Enter key
  document.getElementById('task-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') addTask();
  });
});

// ── SHOW DATE ──
function showDate() {
  const now = new Date();
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('date').textContent = now.toLocaleDateString('en-US', options);
}

// ── ADD TASK ──
function addTask() {
  const input = document.getElementById('task-input');
  const priority = document.getElementById('priority-select').value;
  const text = input.value.trim();

  if (!text) {
    input.focus();
    input.style.borderColor = '#ef4444';
    setTimeout(() => input.style.borderColor = '', 1000);
    return;
  }

  const task = {
    id: Date.now(),
    text: text,
    priority: priority,
    done: false,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(task);
  saveTasks();
  renderTasks();

  input.value = '';
  input.focus();
}

// ── TOGGLE DONE ──
function toggleTask(id) {
  tasks = tasks.map(t => t.id === id ? { ...t, done: !t.done } : t);
  saveTasks();
  renderTasks();
}

// ── DELETE TASK ──
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

// ── CLEAR COMPLETED ──
function clearCompleted() {
  tasks = tasks.filter(t => !t.done);
  saveTasks();
  renderTasks();
}

// ── FILTER ──
function filterTasks(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderTasks();
}

// ── RENDER ──
function renderTasks() {
  const list = document.getElementById('task-list');
  const empty = document.getElementById('empty-state');

  let filtered = tasks;
  if (currentFilter === 'pending')   filtered = tasks.filter(t => !t.done);
  if (currentFilter === 'completed') filtered = tasks.filter(t => t.done);

  list.innerHTML = '';

  if (filtered.length === 0) {
    empty.style.display = 'block';
  } else {
    empty.style.display = 'none';
    filtered.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item ${task.done ? 'done' : ''}`;
      li.innerHTML = `
        <div class="task-check" onclick="toggleTask(${task.id})">
          ${task.done ? '✓' : ''}
        </div>
        <span class="task-text">${escapeHTML(task.text)}</span>
        <span class="priority-badge ${task.priority}">${task.priority}</span>
        <button class="delete-btn" onclick="deleteTask(${task.id})" title="Delete">✕</button>
      `;
      list.appendChild(li);
    });
  }

  updateStats();
}

// ── STATS ──
function updateStats() {
  const total     = tasks.length;
  const completed = tasks.filter(t => t.done).length;
  const pending   = total - completed;

  document.getElementById('total').textContent     = total;
  document.getElementById('pending').textContent   = pending;
  document.getElementById('completed').textContent = completed;
}

// ── SAVE ──
function saveTasks() {
  localStorage.setItem('tasks', JSON.stringify(tasks));
}

// ── SECURITY: escape HTML to prevent XSS ──
function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
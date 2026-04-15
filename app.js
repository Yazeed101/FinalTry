// Seed data — realistic tasks across a few projects.
const tasks = [
  { id: "ENG-214", title: "Migrate auth service to edge runtime", status: "in_progress", priority: "high",    assignee: "Mara Liu",     due: "2026-04-18" },
  { id: "DES-108", title: "Refine empty state illustrations",      status: "review",      priority: "medium",  assignee: "Theo Park",    due: "2026-04-22" },
  { id: "ENG-219", title: "Fix flaky billing integration tests",   status: "todo",        priority: "urgent",  assignee: "Aya Farouk",   due: "2026-04-14" },
  { id: "MKT-056", title: "Draft Q2 launch announcement",          status: "in_progress", priority: "medium",  assignee: "Chris Vaughn", due: "2026-04-25" },
  { id: "DES-110", title: "Audit contrast across dashboard pages", status: "todo",        priority: "low",     assignee: "Theo Park",    due: "2026-05-02" },
  { id: "ENG-221", title: "Rate limit webhook delivery queue",     status: "review",      priority: "high",    assignee: "Noah Bryant",  due: "2026-04-19" },
  { id: "ENG-198", title: "Ship dark mode tokens to tailwind",     status: "done",        priority: "medium",  assignee: "Mara Liu",     due: "2026-04-09" },
  { id: "OPS-042", title: "Rotate staging database credentials",   status: "done",        priority: "urgent",  assignee: "Aya Farouk",   due: "2026-04-08" },
  { id: "ENG-226", title: "Investigate intermittent 502 on /api/v2/reports", status: "in_progress", priority: "urgent",  assignee: "Noah Bryant", due: "2026-04-15" },
  { id: "DES-112", title: "Explore new onboarding flow",           status: "todo",        priority: "medium",  assignee: "Ines Galvez",  due: "2026-04-28" },
  { id: "MKT-061", title: "Customer case study — Fieldstone Co.",  status: "review",      priority: "low",     assignee: "Chris Vaughn", due: "2026-04-30" },
  { id: "ENG-230", title: "Deprecate v1 tasks endpoint",           status: "todo",        priority: "low",     assignee: "Mara Liu",     due: "2026-05-10" },
];

const STATUS_LABELS = {
  todo: "Todo",
  in_progress: "In progress",
  review: "In review",
  done: "Done",
};

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 };
const PRIORITY_ICON = {
  urgent: "alert-octagon",
  high:   "signal-high",
  medium: "signal-medium",
  low:    "signal-low",
};

// Stable pastel backgrounds for avatar initials.
const AVATAR_COLORS = [
  ["#e0e7ff", "#4338ca"],
  ["#fef3c7", "#b45309"],
  ["#d1fae5", "#047857"],
  ["#fee2e2", "#b91c1c"],
  ["#e0f2fe", "#0369a1"],
  ["#fce7f3", "#be185d"],
];

function hashString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function initials(name) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

function avatarColor(name) {
  return AVATAR_COLORS[hashString(name) % AVATAR_COLORS.length];
}

function formatDue(iso) {
  const d = new Date(iso + "T00:00:00");
  const today = new Date("2026-04-15T00:00:00");
  const diff = Math.round((d - today) / (1000 * 60 * 60 * 24));
  const overdue = diff < 0;
  let label;
  if (diff === 0) label = "Today";
  else if (diff === 1) label = "Tomorrow";
  else if (diff === -1) label = "Yesterday";
  else if (diff > 1 && diff < 7) label = d.toLocaleDateString("en-US", { weekday: "short" });
  else label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return { label, overdue };
}

const state = {
  search: "",
  status: "all",
};

function escapeHtml(s) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function renderRow(task) {
  const [bg, fg] = avatarColor(task.assignee);
  const { label, overdue } = formatDue(task.due);
  const statusLabel = STATUS_LABELS[task.status];
  return `
    <tr>
      <td><input type="checkbox" aria-label="Select ${escapeHtml(task.id)}" /></td>
      <td>
        <div class="task-cell">
          <span class="task-title">${escapeHtml(task.title)}</span>
          <span class="task-id">${escapeHtml(task.id)}</span>
        </div>
      </td>
      <td>
        <span class="pill pill-${task.status}">
          <span class="pill-dot"></span>${statusLabel}
        </span>
      </td>
      <td>
        <span class="priority priority-${task.priority}">
          <i data-lucide="${PRIORITY_ICON[task.priority]}" class="icon-14"></i>
          ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
      </td>
      <td>
        <div class="assignee">
          <span class="assignee-avatar" style="background:${bg};color:${fg}">${initials(task.assignee)}</span>
          <span class="assignee-name">${escapeHtml(task.assignee)}</span>
        </div>
      </td>
      <td><span class="due ${overdue && task.status !== "done" ? "overdue" : ""}">${label}</span></td>
      <td>
        <button class="row-action" aria-label="More actions">
          <i data-lucide="more-horizontal" class="icon-14"></i>
        </button>
      </td>
    </tr>
  `;
}

function applyFilters() {
  const q = state.search.trim().toLowerCase();
  return tasks
    .filter((t) => state.status === "all" || t.status === state.status)
    .filter((t) => !q || t.title.toLowerCase().includes(q) || t.id.toLowerCase().includes(q) || t.assignee.toLowerCase().includes(q))
    .sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
}

function render() {
  const rows = applyFilters();
  const body = document.getElementById("taskBody");
  const empty = document.getElementById("emptyState");
  const count = document.getElementById("count");

  body.innerHTML = rows.map(renderRow).join("");
  empty.hidden = rows.length > 0;
  count.textContent = `${rows.length} of ${tasks.length} task${tasks.length === 1 ? "" : "s"}`;

  if (window.lucide) window.lucide.createIcons();
}

function wireEvents() {
  document.getElementById("search").addEventListener("input", (e) => {
    state.search = e.target.value;
    render();
  });

  const filter = document.getElementById("statusFilter");
  filter.addEventListener("click", (e) => {
    const btn = e.target.closest(".chip");
    if (!btn) return;
    filter.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
    btn.classList.add("active");
    state.status = btn.dataset.status;
    render();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) window.lucide.createIcons();
  wireEvents();
  render();
});

"use strict";

// =====================================
// JOB APPLICATION TRACKER
// =====================================

const STORAGE_KEY = "jobTrackerApplications_v1";
const PAGE_SIZE = 6;

const $ = (id) => document.getElementById(id);

const modal = $("applicationModal");
const form = $("applicationForm");
const tbody = $("applicationsBody");
const toast = $("toast");

let currentPage = 1;
let toastTimer;
let applications = loadApplications();

// =====================================
// INITIAL SAMPLE DATA
// =====================================

function getSampleApplications() {
  return [
    {
      id: "sample-1",
      company: "Google",
      jobRole: "Software Engineer",
      applicationDate: "2026-10-20",
      status: "Applied",
      jobLink: "",
      notes: ""
    },
    {
      id: "sample-2",
      company: "Amazon",
      jobRole: "Full Stack Developer",
      applicationDate: "2026-10-15",
      status: "Interview",
      jobLink: "",
      notes: ""
    },
    {
      id: "sample-3",
      company: "TCS",
      jobRole: "Frontend Developer",
      applicationDate: "2026-10-10",
      status: "Interview",
      jobLink: "",
      notes: ""
    },
    {
      id: "sample-4",
      company: "Infosys",
      jobRole: "Web Developer",
      applicationDate: "2026-10-08",
      status: "Applied",
      jobLink: "",
      notes: ""
    },
    {
      id: "sample-5",
      company: "Wipro",
      jobRole: "Software Engineer",
      applicationDate: "2026-10-05",
      status: "Offer",
      jobLink: "",
      notes: ""
    },
    {
      id: "sample-6",
      company: "Accenture",
      jobRole: "Associate Software Engineer",
      applicationDate: "2026-09-30",
      status: "Applied",
      jobLink: "",
      notes: ""
    }
  ];
}

// =====================================
// LOCAL STORAGE
// =====================================

function loadApplications() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (saved !== null) {
      const parsed = JSON.parse(saved);

      if (Array.isArray(parsed)) {
        return parsed.filter((app) =>
          app &&
          typeof app.id === "string" &&
          typeof app.company === "string" &&
          typeof app.jobRole === "string" &&
          typeof app.applicationDate === "string" &&
          ["Applied", "Interview", "Offer", "Rejected"].includes(app.status)
        );
      }
    }

    const samples = getSampleApplications();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
    return samples;
  } catch (error) {
    console.error("Could not load application data:", error);
    return getSampleApplications();
  }
}

function saveApplications() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(applications));
    return true;
  } catch (error) {
    console.error("Could not save application data:", error);
    showToast("Could not save data. Check browser storage.");
    return false;
  }
}

// =====================================
// HELPERS
// =====================================

function createId() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID();
  }

  return "app-" + Date.now() + "-" +
    Math.random().toString(36).slice(2, 9);
}

function escapeHTML(value) {
  const entities = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  };

  return String(value ?? "").replace(/[&<>"']/g, (char) =>
    entities[char]
  );
}

function formatDate(dateString) {
  const parts = dateString.split("-");

  if (parts.length !== 3) return dateString;

  const [year, month, day] = parts.map(Number);
  const date = new Date(year, month - 1, day);

  if (Number.isNaN(date.getTime())) return dateString;

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(date);
}

function getCounts() {
  const counts = {
    Applied: 0,
    Interview: 0,
    Offer: 0,
    Rejected: 0
  };

  applications.forEach((app) => {
    if (Object.hasOwn(counts, app.status)) {
      counts[app.status]++;
    }
  });

  return counts;
}

function percentage(count, total) {
  return total ? Math.round((count / total) * 100) : 0;
}

function getStatusClass(status) {
  return {
    Applied: "status-applied",
    Interview: "status-interview",
    Offer: "status-offer",
    Rejected: "status-rejected"
  }[status] || "status-applied";
}

function getStatusIcon(status) {
  return {
    Applied: "fa-solid fa-play",
    Interview: "fa-solid fa-users",
    Offer: "fa-solid fa-star",
    Rejected: "fa-solid fa-xmark"
  }[status] || "fa-solid fa-circle";
}

function getCompanyInitials(company) {
  return company
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

// =====================================
// TOAST MESSAGE
// =====================================

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);
}

// =====================================
// DASHBOARD STATISTICS
// =====================================

function updateDashboard() {
  const counts = getCounts();
  const total = applications.length;

  $("totalCount").textContent = total;
  $("appliedCount").textContent = counts.Applied;
  $("interviewCount").textContent = counts.Interview;
  $("offerCount").textContent = counts.Offer;
  $("rejectedCount").textContent = counts.Rejected;

  $("totalNote").textContent = total
    ? `${total} applications in your tracker`
    : "Start tracking your applications";

  $("appliedNote").textContent =
    `${percentage(counts.Applied, total)}% of total`;

  $("interviewNote").textContent =
    `${percentage(counts.Interview, total)}% of total`;

  $("offerNote").textContent =
    `${percentage(counts.Offer, total)}% of total`;

  $("rejectedNote").textContent =
    `${percentage(counts.Rejected, total)}% of total`;

  $("chartTotal").textContent = total;

  $("legendApplied").textContent = counts.Applied;
  $("legendInterview").textContent = counts.Interview;
  $("legendOffer").textContent = counts.Offer;
  $("legendRejected").textContent = counts.Rejected;

  $("percentApplied").textContent =
    `${percentage(counts.Applied, total)}%`;

  $("percentInterview").textContent =
    `${percentage(counts.Interview, total)}%`;

  $("percentOffer").textContent =
    `${percentage(counts.Offer, total)}%`;

  $("percentRejected").textContent =
    `${percentage(counts.Rejected, total)}%`;

  updateDonutChart(counts, total);
}

function updateDonutChart(counts, total) {
  const chart = $("donutChart");

  if (!total) {
    chart.style.background = "#e9eef6";
    return;
  }

  const colors = [
    { value: counts.Applied, color: "#18b87a" },
    { value: counts.Interview, color: "#923ff0" },
    { value: counts.Offer, color: "#f6ae30" },
    { value: counts.Rejected, color: "#f04f62" }
  ];

  let currentAngle = 0;

  const segments = colors.map((item) => {
    const start = currentAngle;
    currentAngle += (item.value / total) * 360;

    return `${item.color} ${start}deg ${currentAngle}deg`;
  });

  chart.style.background =
    `conic-gradient(${segments.join(", ")})`;
}

// =====================================
// SEARCH, FILTER AND SORT
// =====================================

function getFilteredApplications() {
  const query = $("tableSearch").value.trim().toLowerCase();
  const status = $("statusFilter").value;
  const sort = $("sortBy").value;

  let filtered = applications.filter((app) => {
    const matchesSearch =
      app.company.toLowerCase().includes(query) ||
      app.jobRole.toLowerCase().includes(query);

    const matchesStatus =
      status === "All" || app.status === status;

    return matchesSearch && matchesStatus;
  });

  if (sort === "newest") {
    filtered.sort((a, b) =>
      b.applicationDate.localeCompare(a.applicationDate)
    );
  } else if (sort === "oldest") {
    filtered.sort((a, b) =>
      a.applicationDate.localeCompare(b.applicationDate)
    );
  } else if (sort === "company") {
    filtered.sort((a, b) =>
      a.company.localeCompare(b.company)
    );
  }

  return filtered;
}

function syncGlobalSearch() {
  const globalValue = $("globalSearch").value;
  $("tableSearch").value = globalValue;
  currentPage = 1;
  renderApplications();
}

// =====================================
// RENDER APPLICATION TABLE
// =====================================

function renderApplications() {
  const filtered = getFilteredApplications();
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  currentPage = Math.min(currentPage, totalPages);
  currentPage = Math.max(currentPage, 1);

  const start = (currentPage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  if (!visible.length) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="empty-state">
          <i class="fa-regular fa-folder-open"></i>
          <strong>No applications found</strong>
          Try another search or add a new application.
        </td>
      </tr>
    `;
  } else {
    tbody.innerHTML = visible.map((app, index) => {
      const safeCompany = escapeHTML(app.company);
      const safeRole = escapeHTML(app.jobRole);
      const safeStatus = escapeHTML(app.status);
      const safeDate = escapeHTML(formatDate(app.applicationDate));
      const initials = escapeHTML(getCompanyInitials(app.company));
      const statusClass = getStatusClass(app.status);
      const statusIcon = getStatusIcon(app.status);
      const rowNumber = start + index + 1;

      return `
        <tr>
          <td>${rowNumber}</td>

          <td>
            <div class="company-cell">
              <span class="company-logo">${initials}</span>
              <span>${safeCompany}</span>
            </div>
          </td>

          <td>${safeRole}</td>
          <td>${safeDate}</td>

          <td>
            <span class="status-badge ${statusClass}">
              <i class="${statusIcon}"></i>
              ${safeStatus}
            </span>
          </td>

          <td>
            <div class="action-buttons">
              <button class="action-btn edit-btn"
                data-action="edit" data-id="${escapeHTML(app.id)}"
                aria-label="Edit ${safeCompany}" title="Edit">
                <i class="fa-solid fa-pen"></i>
              </button>

              <button class="action-btn delete-btn"
                data-action="delete" data-id="${escapeHTML(app.id)}"
                aria-label="Delete ${safeCompany}" title="Delete">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  $("resultsText").textContent = filtered.length
    ? `Showing ${start + 1} to ${Math.min(start + PAGE_SIZE, filtered.length)} of ${filtered.length} applications`
    : "Showing 0 applications";

  $("pageNumber").textContent = currentPage;
  $("prevPage").disabled = currentPage <= 1;
  $("nextPage").disabled = currentPage >= totalPages;
}

// =====================================
// ADD / EDIT MODAL
// =====================================

function openModal(app = null) {
  form.reset();

  $("editId").value = app ? app.id : "";
  $("modalTitle").textContent = app
    ? "Edit Application"
    : "Add Application";

  $("saveButtonText").textContent = app
    ? "Update Application"
    : "Save Application";

  $("company").value = app ? app.company : "";
  $("jobRole").value = app ? app.jobRole : "";
  $("applicationDate").value = app
    ? app.applicationDate
    : new Date().toLocaleDateString("en-CA");

  $("applicationStatus").value = app ? app.status : "Applied";
  $("jobLink").value = app ? (app.jobLink || "") : "";
  $("notes").value = app ? (app.notes || "") : "";

  modal.classList.add("show");
  document.body.style.overflow = "hidden";

  setTimeout(() => $("company").focus(), 50);
}

function closeModal() {
  modal.classList.remove("show");
  document.body.style.overflow = "";
  form.reset();
  $("editId").value = "";
}

function handleFormSubmit(event) {
  event.preventDefault();

  if (!form.reportValidity()) return;

  const id = $("editId").value;

  const company = $("company").value.trim();
  const jobRole = $("jobRole").value.trim();
  const applicationDate = $("applicationDate").value;
  const status = $("applicationStatus").value;
  const jobLink = $("jobLink").value.trim();
  const notes = $("notes").value.trim();

  if (!company || !jobRole || !applicationDate) {
    showToast("Please fill in all required fields.");
    return;
  }

  if (applicationDate > "9999-12-31") {
    showToast("Please enter a valid date.");
    return;
  }

  const duplicate = applications.some((app) =>
    app.id !== id &&
    app.company.toLowerCase() === company.toLowerCase() &&
    app.jobRole.toLowerCase() === jobRole.toLowerCase()
  );

  if (duplicate && !confirm(
    "This company and job role already exist. Add it anyway?"
  )) {
    return;
  }

  const newApplication = {
    id: id || createId(),
    company,
    jobRole,
    applicationDate,
    status,
    jobLink,
    notes
  };

  const previousApplications = applications.map((app) => ({ ...app }));

  if (id) {
    applications = applications.map((app) =>
      app.id === id ? newApplication : app
    );
  } else {
    applications.push(newApplication);
  }

  if (!saveApplications()) {
    applications = previousApplications;
    return;
  }

  closeModal();
  currentPage = 1;
  updateDashboard();
  renderApplications();

  showToast(id
    ? "Application updated successfully!"
    : "Application added successfully!"
  );
}

// =====================================
// DELETE APPLICATION
// =====================================

function deleteApplication(id) {
  const app = applications.find((item) => item.id === id);

  if (!app) return;

  const shouldDelete = confirm(
    `Delete the application for ${app.company} - ${app.jobRole}?`
  );

  if (!shouldDelete) return;

  const previousApplications = applications;
  applications = applications.filter((item) => item.id !== id);

  if (!saveApplications()) {
    applications = previousApplications;
    return;
  }

  const totalPages = Math.max(
    1,
    Math.ceil(getFilteredApplications().length / PAGE_SIZE)
  );

  currentPage = Math.min(currentPage, totalPages);

  updateDashboard();
  renderApplications();
  showToast("Application deleted successfully.");
}

// =====================================
// TABLE ACTION BUTTONS
// =====================================

tbody.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-action]");

  if (!button) return;

  const id = button.dataset.id;
  const action = button.dataset.action;

  if (action === "edit") {
    const app = applications.find((item) => item.id === id);

    if (app) openModal(app);
  }

  if (action === "delete") {
    deleteApplication(id);
  }
});

// =====================================
// SEARCH / FILTER EVENTS
// =====================================

$("globalSearch").addEventListener("input", syncGlobalSearch);

$("tableSearch").addEventListener("input", () => {
  $("globalSearch").value = $("tableSearch").value;
  currentPage = 1;
  renderApplications();
});

$("statusFilter").addEventListener("change", () => {
  currentPage = 1;
  renderApplications();
});

$("sortBy").addEventListener("change", () => {
  currentPage = 1;
  renderApplications();
});

// =====================================
// PAGINATION
// =====================================

$("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    renderApplications();
  }
});

$("nextPage").addEventListener("click", () => {
  const totalPages = Math.max(
    1,
    Math.ceil(getFilteredApplications().length / PAGE_SIZE)
  );

  if (currentPage < totalPages) {
    currentPage++;
    renderApplications();
  }
});

// =====================================
// OPEN / CLOSE MODAL
// =====================================

function addButtonListeners() {
  [
    "addBtn",
    "sidebarAdd",
    "mobileAddBtn",
    "quickAdd"
  ].forEach((id) => {
    $(id).addEventListener("click", () => openModal());
  });
}

addButtonListeners();

$("closeModal").addEventListener("click", closeModal);
$("cancelModal").addEventListener("click", closeModal);
form.addEventListener("submit", handleFormSubmit);

modal.addEventListener("click", (event) => {
  if (event.target === modal) closeModal();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classList.contains("show")) {
    closeModal();
  }
});

// =====================================
// QUICK ACTIONS
// =====================================

$("viewAll").addEventListener("click", () => {
  $("tableSearch").value = "";
  $("globalSearch").value = "";
  $("statusFilter").value = "All";
  $("sortBy").value = "newest";
  currentPage = 1;

  renderApplications();

  $("applications").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

$("quickSearch").addEventListener("click", () => {
  $("globalSearch").focus();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});

$("quickFilter").addEventListener("click", () => {
  $("statusFilter").focus();

  $("applications").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
});

$("dreamCard").addEventListener("click", () => {
  showToast("Keep learning, applying and growing. Your next opportunity awaits!");
});

// =====================================
// PROFILE SETTINGS
// =====================================

$("profileMenu").addEventListener("click", () => {
  const currentName = $("profileName").textContent;

  const newName = prompt("Enter your display name:", currentName);

  if (newName === null) return;

  const cleanName = newName.trim();

  if (!cleanName) {
    showToast("Name cannot be empty.");
    return;
  }

  $("profileName").textContent = cleanName;

  $("avatar").textContent = cleanName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");

  $("welcomeName");
  const heading = document.querySelector(".welcome-text h1");

  heading.innerHTML = `Hello, ${escapeHTML(cleanName)} <span>👋</span>`;

  try {
    localStorage.setItem("jobTrackerProfileName", cleanName);
  } catch (error) {
    console.warn("Profile name could not be saved:", error);
  }

  showToast("Profile name updated!");
});


// =====================================
// MOBILE SIDEBAR
// =====================================

$("menuToggle").addEventListener("click", () => {
  $("sidebar").classList.toggle("open");
});

document.addEventListener("click", (event) => {
  const sidebar = $("sidebar");
  const menuButton = $("menuToggle");

  if (
      
      sidebar &&
      menuButton &&
      sidebar.classList.contains("open")
&&
    
    !sidebar.contains(event.target) &&
    !menuButton.contains(event.target)
  ) {
    sidebar.classList.remove("open");
  }
});

(function () {
  "use strict";

  const APPS_KEY = "jobTrackerApplications_v1";
  const SETTINGS_KEY = "jt_settings";

  const DEFAULTS = {
    name: "", email: "", role: "",
    darkMode: false,
    weeklyGoal: 5,
    reminderOn: false, reminderDays: 7,
    statuses: ["Applied", "Interview", "Offer", "Rejected"],
    sortBy: "newest", perPage: 6
  };

  const g = (id) => document.getElementById(id);
  if (!g("st-save")) return;

  function loadSettings() {
    try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}")); }
    catch (e) { return Object.assign({}, DEFAULTS); }
  }

  function loadApps() {
    try {
      const data = JSON.parse(localStorage.getItem(APPS_KEY) || "[]");
      return Array.isArray(data) ? data : [];
    } catch (e) { return []; }
  }

  let settings = loadSettings();

  function say(msg) {
    const t = g("st-toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(say.timer);
    say.timer = setTimeout(() => t.classList.remove("show"), 2200);
  }

  function setToggle(btn, on) { btn.setAttribute("aria-checked", String(on)); }

  function applyTheme(dark) {
    if (dark) document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
  }

  function weekStart() {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - d.getDay());
    return d;
  }

  function renderGoal() {
    g("st-goalValue").textContent = settings.weeklyGoal;
    const start = weekStart();
    const done = loadApps().filter((a) => {
      const d = new Date(a.applicationDate + "T00:00:00");
      return !isNaN(d) && d >= start;
    }).length;
    const pct = Math.min(100, Math.round((done / settings.weeklyGoal) * 100));
    g("st-goalBar").style.width = pct + "%";
    g("st-goalText").textContent = done + " of " + settings.weeklyGoal + " applied this week";
  }

  function renderChips() {
    const box = g("st-chips");
    box.innerHTML = "";
    settings.statuses.forEach((s, i) => {
      const chip = document.createElement("span");
      chip.className = "st-chip c-" + s.toLowerCase().replace(/[^a-z0-9]/g, "");
      chip.appendChild(document.createTextNode(s));
      const x = document.createElement("button");
      x.type = "button";
      x.setAttribute("aria-label", "Remove " + s);
      x.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      x.addEventListener("click", () => { settings.statuses.splice(i, 1); renderChips(); });
      chip.appendChild(x);
      box.appendChild(chip);
    });
  }

  function fillForm() {
    g("st-name").value = settings.name;
    g("st-email").value = settings.email;
    g("st-role").value = settings.role;
    setToggle(g("st-dark"), settings.darkMode);
    setToggle(g("st-remOn"), settings.reminderOn);
    g("st-remDays").value = String(settings.reminderDays);
    g("st-sortBy").value = settings.sortBy;
    g("st-perPage").value = String(settings.perPage);
    renderGoal();
    renderChips();
  }

  function collect() {
    settings.name = g("st-name").value.trim();
    settings.email = g("st-email").value.trim();
    settings.role = g("st-role").value.trim();
    settings.reminderDays = Number(g("st-remDays").value);
    settings.sortBy = g("st-sortBy").value;
    settings.perPage = Number(g("st-perPage").value);
  }

  g("st-dark").addEventListener("click", () => {
    settings.darkMode = !settings.darkMode;
    setToggle(g("st-dark"), settings.darkMode);
    applyTheme(settings.darkMode);
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  });

  g("st-remOn").addEventListener("click", () => {
    settings.reminderOn = !settings.reminderOn;
    setToggle(g("st-remOn"), settings.reminderOn);
  });

  g("st-goalMinus").addEventListener("click", () => {
    if (settings.weeklyGoal > 1) { settings.weeklyGoal--; renderGoal(); }
  });
  g("st-goalPlus").addEventListener("click", () => {
    if (settings.weeklyGoal < 50) { settings.weeklyGoal++; renderGoal(); }
  });

  function addStatus() {
    const input = g("st-newStatus");
    const err = g("st-statusError");
    const v = input.value.trim();
    if (!v) { err.textContent = "Enter a status name."; return; }
    if (settings.statuses.some((s) => s.toLowerCase() === v.toLowerCase())) {
      err.textContent = "That status already exists.";
      return;
    }
    settings.statuses.push(v);

    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(settings)
    );
    
    input.value = "";
    err.textContent = "";
    renderChips();
  }
  g("st-addStatus").addEventListener("click", addStatus);
  g("st-newStatus").addEventListener("keydown", (e) => { if (e.key === "Enter") addStatus(); });
  g("st-newStatus").addEventListener("input", () => { g("st-statusError").textContent = ""; });

  g("st-save").addEventListener("click", () => {
    collect();
    if (settings.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)) {
      say("Enter a valid email address");
      g("st-email").focus();
      return;
    }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    say("Settings saved");
  });

  function download(filename, text, type) {
    const blob = new Blob([text], { type: type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function csvCell(v) {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
  }

  g("st-exportJson").addEventListener("click", () => {
    const apps = loadApps();
    if (!apps.length) { g("st-dataMsg").textContent = "No applications to export yet."; return; }
    download("job-tracker-backup.json", JSON.stringify(apps, null, 2), "application/json");
    g("st-dataMsg").textContent = "Exported " + apps.length + " applications.";
  });

  g("st-exportCsv").addEventListener("click", () => {
    const apps = loadApps();
    if (!apps.length) { g("st-dataMsg").textContent = "No applications to export yet."; return; }
    const cols = ["company", "jobRole", "applicationDate", "status", "jobLink", "notes"];
    const lines = [cols.join(",")];
    apps.forEach((a) => lines.push(cols.map((c) => csvCell(a[c])).join(",")));
    download("job-tracker-applications.csv", lines.join("\n"), "text/csv");
    g("st-dataMsg").textContent = "Exported " + apps.length + " applications.";
  });

  g("st-importBtn").addEventListener("click", () => g("st-importFile").click());
  g("st-importFile").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!Array.isArray(data)) throw new Error("not an array");
        localStorage.setItem(APPS_KEY, JSON.stringify(data));
        location.reload();
      } catch (err) {
        g("st-dataMsg").textContent = "That file is not a valid Job Tracker backup.";
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  const dlg = g("st-confirm");
  g("st-clearBtn").addEventListener("click", () => dlg.showModal());
  g("st-cancel").addEventListener("click", () => dlg.close());
  g("st-doClear").addEventListener("click", () => {
    localStorage.setItem(APPS_KEY, "[]");
    location.reload();
  });

  applyTheme(settings.darkMode);
  fillForm();
})();

(function () {
  "use strict";

  function updateHeader() {
    let s = {};
    try { s = JSON.parse(localStorage.getItem("jt_settings") || "{}"); } catch (e) {}

    const name = (s.name || "").trim();
    if (!name) return;

    const nameEl = document.getElementById("profileName");
    const avatarEl = document.getElementById("avatar");

    if (nameEl) nameEl.textContent = name;

    if (avatarEl) {
      const parts = name.split(/\s+/);
      const first = parts[0].charAt(0);
      const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
      avatarEl.textContent = (first + last).toUpperCase();
    }
  }

  const saveBtn = document.getElementById("st-save");
  if (saveBtn) saveBtn.addEventListener("click", updateHeader);

  updateHeader();
})();

(function () {
  "use strict";

  const APPS_KEY = "jobTrackerApplications_v1";
  const SETTINGS_KEY = "jt_settings";
  const SEEN_KEY = "jt_notif_seen";

  const btn = document.getElementById("notificationBtn");
  if (!btn) return;
  const dot = btn.querySelector("span");

  function read(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v == null ? fallback : v;
    } catch (e) { return fallback; }
  }

  function parseDate(s) {
    const d = new Date(s + "T00:00:00");
    return isNaN(d) ? null : d;
  }

  function buildItems() {
    const raw = read(APPS_KEY, []);
    const apps = Array.isArray(raw) ? raw : [];
    const s = Object.assign({ weeklyGoal: 5, reminderOn: false, reminderDays: 7 }, read(SETTINGS_KEY, {}));
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const items = [];

    if (s.reminderOn) {
      const waiting = [];
      apps.forEach((a) => {
        if (a.status !== "Applied") return;
        const d = parseDate(a.applicationDate);
        if (!d) return;
        const days = Math.floor((now - d) / 86400000);
        if (days >= s.reminderDays) waiting.push({ a: a, days: days });
      });
      waiting.sort((x, y) => y.days - x.days);
      waiting.forEach((w) => {
        items.push({
          type: "followup",
          title: w.a.company + " \u00b7 " + w.a.jobRole,
          text: "Applied " + w.days + " days ago with no reply. Time to follow up."
        });
      });
    }

    const start = new Date(now);
    start.setDate(start.getDate() - start.getDay());
    const done = apps.filter((a) => {
      const d = parseDate(a.applicationDate);
      return d && d >= start;
    }).length;
    const goal = Number(s.weeklyGoal) || 5;

    if (done < goal) {
      items.push({
        type: "goal",
        title: "Weekly goal",
        text: done + " of " + goal + " applied this week. " + (goal - done) + " more to go."
      });
    } else {
      items.push({
        type: "done",
        title: "Weekly goal reached",
        text: "You applied to " + done + " jobs this week. Great work."
      });
    }
    return items;
  }

  function signature(items) {
    return items.map((i) => i.type + i.title + i.text).join("|");
  }

  const panel = document.createElement("div");
  panel.className = "st-notif";
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "Notifications");
  document.body.appendChild(panel);

  const icons = { followup: "fa-clock", goal: "fa-bullseye", done: "fa-circle-check" };

  function render(items) {
    panel.innerHTML = "";
    const head = document.createElement("div");
    head.className = "st-notif-head";
    head.textContent = "Notifications";
    panel.appendChild(head);

    if (!items.length) {
      const empty = document.createElement("div");
      empty.className = "st-notif-empty";
      empty.textContent = "You're all caught up.";
      panel.appendChild(empty);
      return;
    }

    items.forEach((item) => {
      const row = document.createElement(item.type === "followup" ? "button" : "div");
      row.className = "st-notif-item";
      if (item.type === "followup") row.type = "button";

      const icon = document.createElement("span");
      icon.className = "st-notif-icon " + item.type;
      icon.innerHTML = '<i class="fa-solid ' + icons[item.type] + '"></i>';

      const body = document.createElement("span");
      const title = document.createElement("span");
      title.className = "st-notif-title";
      title.textContent = item.title;
      const text = document.createElement("span");
      text.className = "st-notif-text";
      text.textContent = item.text;
      body.appendChild(title);
      body.appendChild(text);

      row.appendChild(icon);
      row.appendChild(body);

      if (item.type === "followup") {
        row.addEventListener("click", () => {
          close();
          const target = document.getElementById("applications");
          if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
      panel.appendChild(row);
    });
  }

  function place() {
    const area = btn.parentElement.getBoundingClientRect();
    const bell = btn.getBoundingClientRect();
    panel.style.top = bell.bottom + 10 + "px";
    panel.style.right = Math.max(8, window.innerWidth - area.right) + "px";
  }

  function open() {
    const items = buildItems();
    render(items);
    place();
    panel.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
    localStorage.setItem(SEEN_KEY, signature(items));
    if (dot) dot.style.display = "none";
  }

  function close() {
    panel.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
  }

  function refreshDot() {
    if (!dot) return;
    const items = buildItems();
    const unseen = items.length && signature(items) !== localStorage.getItem(SEEN_KEY);
    dot.style.display = unseen ? "" : "none";
  }

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (panel.classList.contains("open")) close();
    else open();
  });

  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target)) close();
    setTimeout(refreshDot, 300);
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  window.addEventListener("resize", close);
  window.addEventListener("scroll", close, true);
  document.addEventListener("visibilitychange", refreshDot);

  refreshDot();
})();

(function () {
  const $id = (id) => document.getElementById(id);
  const root = document.documentElement;
  const panel = $id("signinPanel");
  const menu = $id("accountMenu");
  let mode = "signin";

  const getUser = () => {
    try { return JSON.parse(localStorage.getItem("jtUser")); } catch { return null; }
  };
  const toast = (msg) => { if (typeof showToast === "function") showToast(msg); };

  function setHello(name) {
    const h1 = document.querySelector(".welcome-text h1");
    if (!h1) return;
    h1.textContent = name ? "Hello, " + name.split(" ")[0] + " " : "Hello there ";
    const wave = document.createElement("span");
    wave.textContent = "👋";
    h1.appendChild(wave);
  }

  function applyUser(u) {
    const name = u.name || "User";
    const initials = name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
    $id("profileName").textContent = name;
    $id("avatar").textContent = initials;
    $id("accName").textContent = name;
    $id("accEmail").textContent = u.email || "";
    setHello(name);
    try { localStorage.setItem("jobTrackerProfileName", name); } catch (e) {}
  }

  function closeAll() {
    panel.classList.remove("open");
    menu.classList.remove("open");
  }

  function setMode(m) {
    mode = m;
    const up = m === "signup";
    $id("acTitle").textContent = up ? "Create account" : "Sign in";
    $id("acSubmit").textContent = up ? "Create account" : "Sign in";
    $id("acSwitchText").textContent = up ? "Already have an account?" : "New here?";
    $id("acSwitch").textContent = up ? "Sign in" : "Create account";
    $id("acName").style.display = up ? "block" : "none";
    $id("acNameLabel").style.display = up ? "block" : "none";
    $id("acName").required = up;
    $id("acError").textContent = "";
  }

  setMode(getUser() ? "signin" : "signup");

  $id("signinBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.remove("open");
    panel.classList.toggle("open");
  });

  $id("accountBtn").addEventListener("click", (e) => {
    e.stopPropagation();
    panel.classList.remove("open");
    menu.classList.toggle("open");
  });

  $id("acSwitch").addEventListener("click", () =>
    setMode(mode === "signin" ? "signup" : "signin"));

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".profile-area")) closeAll();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeAll(); });
  $id("accSettings").addEventListener("click", closeAll);

  panel.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = $id("acEmail").value.trim().toLowerCase();
    const pass = $id("acPass").value;
    const err = $id("acError");

    if (mode === "signup") {
      const name = $id("acName").value.trim();
      if (!name) { err.textContent = "Please enter your name."; return; }
      localStorage.setItem("jtUser", JSON.stringify({ name, email, pass }));
    } else {
      const user = getUser();
      if (!user) { err.textContent = "No account found. Create one first."; setMode("signup"); return; }
      if (user.email !== email || user.pass !== pass) {
        err.textContent = "Wrong email or password."; return;
      }
    }

    localStorage.setItem("jtSession", "1");
    root.classList.add("signed-in");
    applyUser(getUser());
    panel.reset();
    closeAll();
    toast("Signed in");
  });

  $id("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("jtSession");
    root.classList.remove("signed-in");
    setHello(null);
    setMode("signin");
    closeAll();
    toast("Signed out");
  });

  new MutationObserver(() => {
    const u = getUser();
    const n = $id("profileName").textContent.trim();
    if (u && n && n !== u.name && root.classList.contains("signed-in")) {
      u.name = n;
      localStorage.setItem("jtUser", JSON.stringify(u));
      $id("accName").textContent = n;
    }
  }).observe($id("profileName"), { childList: true, characterData: true, subtree: true });

  const existing = getUser();
  if (existing && localStorage.getItem("jtSession")) applyUser(existing);
  else setHello(null);
})();

// INITIALIZE DASHBOARD
applications = loadApplications();
updateDashboard();
renderApplications();
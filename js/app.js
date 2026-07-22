/**
 * Job Tracker - Core Application Logic
 */

const STORAGE_KEY = 'job_tracker_applications_v1';

// Initial Sample Data (Seeded if storage is empty)
const SAMPLE_JOBS = [
  {
    id: 'job-1',
    company: 'Acme Tech',
    title: 'Senior Frontend Developer',
    stage: 'interviewing',
    dateApplied: '2026-07-10',
    location: 'Remote',
    workMode: 'Remote',
    url: 'https://example.com/jobs/frontend',
    notes: 'Had technical interview round 1. Next step: System design.'
  },
  {
    id: 'job-2',
    company: 'Apex Solutions',
    title: 'Full Stack Engineer',
    stage: 'applied',
    dateApplied: '2026-07-15',
    location: 'New York, NY',
    workMode: 'Hybrid',
    url: '',
    notes: 'Applied via LinkedIn referral.'
  },
  {
    id: 'job-3',
    company: 'Starlight Cloud',
    title: 'UI/UX Engineer',
    stage: 'offer',
    dateApplied: '2026-06-28',
    location: 'San Francisco, CA',
    workMode: 'Remote',
    url: 'https://example.com/starlight/ui',
    notes: 'Received written offer! Reviewing compensation package.'
  },
  {
    id: 'job-4',
    company: 'Nova Analytics',
    title: 'Product Engineer',
    stage: 'applied',
    dateApplied: '2026-07-18',
    location: 'Austin, TX',
    workMode: 'Onsite',
    url: '',
    notes: 'Recruiter call scheduled for Thursday.'
  },
  {
    id: 'job-5',
    company: 'Vanguard Systems',
    title: 'Software Developer',
    stage: 'rejected',
    dateApplied: '2026-06-15',
    location: 'Remote',
    workMode: 'Remote',
    url: '',
    notes: 'Role closed due to budget changes.'
  }
];

class JobTrackerApp {
  constructor() {
    this.jobs = [];
    this.currentView = 'board'; // 'board' | 'table' | 'analytics'
    this.searchQuery = '';
    this.filterStage = 'all';
    this.editingId = null;

    this.chartInstances = {};

    this.init();
  }

  init() {
    this.loadJobs();
    this.bindEvents();
    this.render();
  }

  loadJobs() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        this.jobs = JSON.parse(stored);
      } catch (e) {
        console.error('Error parsing stored jobs:', e);
        this.jobs = [...SAMPLE_JOBS];
      }
    } else {
      this.jobs = [...SAMPLE_JOBS];
      this.saveJobs();
    }
  }

  saveJobs() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.jobs));
  }

  bindEvents() {
    // Navigation Tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.target.getAttribute('data-view');
        this.switchView(view);
      });
    });

    // Search and Filter
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderViews();
      });
    }

    const filterSelect = document.getElementById('stage-filter');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.filterStage = e.target.value;
        this.renderViews();
      });
    }

    // Modal Triggers
    document.getElementById('btn-add-job')?.addEventListener('click', () => this.openModal());
    document.getElementById('modal-close-btn')?.addEventListener('click', () => this.closeModal());
    document.getElementById('btn-cancel-modal')?.addEventListener('click', () => this.closeModal());

    // Job URL N/A Checkbox Listener
    const urlNaCheckbox = document.getElementById('field-url-na');
    const urlInput = document.getElementById('field-url');
    if (urlNaCheckbox && urlInput) {
      urlNaCheckbox.addEventListener('change', (e) => {
        if (e.target.checked) {
          urlInput.value = '';
          urlInput.disabled = true;
          urlInput.placeholder = 'Link marked as N/A / Expired';
        } else {
          urlInput.disabled = false;
          urlInput.placeholder = 'https://linkedin.com/jobs/view/...';
        }
      });
    }

    // Job Form Submission
    document.getElementById('job-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // Sidebar Drawer Controls
    const sidebarToggleBtn = document.getElementById('btn-sidebar-toggle');
    const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (sidebarToggleBtn) {
      sidebarToggleBtn.addEventListener('click', () => this.openSidebar());
    }
    if (sidebarCloseBtn) {
      sidebarCloseBtn.addEventListener('click', () => this.closeSidebar());
    }
    if (sidebarOverlay) {
      sidebarOverlay.addEventListener('click', () => this.closeSidebar());
    }

    // Sidebar Action Triggers
    document.getElementById('btn-sidebar-export-csv')?.addEventListener('click', () => {
      this.exportCSV();
      this.closeSidebar();
    });
    document.getElementById('btn-sidebar-export-json')?.addEventListener('click', () => {
      this.exportJSON();
      this.closeSidebar();
    });
    document.getElementById('btn-sidebar-import-json')?.addEventListener('click', () => {
      document.getElementById('input-import-json')?.click();
      this.closeSidebar();
    });
    document.getElementById('input-import-json')?.addEventListener('change', (e) => this.importJSON(e));
    document.getElementById('btn-sidebar-seed-demo')?.addEventListener('click', () => {
      this.closeSidebar();
      if (confirm('Reset tracker with sample demo applications?')) {
        this.jobs = [...SAMPLE_JOBS];
        this.saveJobs();
        this.render();
      }
    });

    // Keyboard Shortcuts (Escape key to close modal or sidebar)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        this.closeSidebar();
      }
    });
  }

  openSidebar() {
    document.getElementById('sidebar-drawer')?.classList.add('open');
    document.getElementById('sidebar-overlay')?.classList.add('open');
    document.getElementById('btn-sidebar-toggle')?.setAttribute('aria-expanded', 'true');
  }

  closeSidebar() {
    document.getElementById('sidebar-drawer')?.classList.remove('open');
    document.getElementById('sidebar-overlay')?.classList.remove('open');
    document.getElementById('btn-sidebar-toggle')?.setAttribute('aria-expanded', 'false');
  }

  switchView(viewName) {
    this.currentView = viewName;
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-view') === viewName);
    });

    document.querySelectorAll('.view-container').forEach(vc => {
      vc.classList.toggle('active', vc.id === `view-${viewName}`);
    });

    this.closeSidebar();
    this.renderViews();
  }

  getFilteredJobs() {
    return this.jobs.filter(job => {
      const matchesSearch = !this.searchQuery || 
        job.company.toLowerCase().includes(this.searchQuery) ||
        job.title.toLowerCase().includes(this.searchQuery) ||
        (job.location && job.location.toLowerCase().includes(this.searchQuery));

      const matchesStage = this.filterStage === 'all' || job.stage === this.filterStage;

      return matchesSearch && matchesStage;
    });
  }

  render() {
    this.renderMetrics();
    this.renderViews();
  }

  renderMetrics() {
    const total = this.jobs.length;
    const activeInterviews = this.jobs.filter(j => j.stage === 'interviewing').length;
    const offersAndAccepted = this.jobs.filter(j => j.stage === 'offer' || j.stage === 'accepted').length;
    
    // Response rate: % of applications that reached interviewing, offer, accepted, or rejected stage
    const responded = this.jobs.filter(j => j.stage === 'interviewing' || j.stage === 'offer' || j.stage === 'accepted' || j.stage === 'rejected').length;
    const responseRate = total > 0 ? Math.round((responded / total) * 100) : 0;

    document.getElementById('metric-total').textContent = total;
    document.getElementById('metric-active').textContent = activeInterviews;
    document.getElementById('metric-rate').textContent = `${responseRate}%`;
    document.getElementById('metric-offers').textContent = offersAndAccepted;
  }

  renderViews() {
    const filtered = this.getFilteredJobs();
    this.renderKanban(filtered);
    this.renderTable(filtered);
    
    if (this.currentView === 'analytics') {
      this.renderCharts();
    }
  }

  renderKanban(filteredJobs) {
    const stages = ['applied', 'interviewing', 'offer', 'accepted', 'rejected'];
    
    stages.forEach(stage => {
      const colWrapper = document.getElementById(`kanban-cards-${stage}`);
      const countBadge = document.getElementById(`count-${stage}`);
      const colParent = colWrapper ? colWrapper.closest('.kanban-col') : null;

      if (!colWrapper) return;

      // Enable Drop Zone on Column
      if (colParent && !colParent.hasAttribute('data-drag-bound')) {
        colParent.setAttribute('data-drag-bound', 'true');
        colParent.setAttribute('data-stage', stage);

        colParent.addEventListener('dragover', (e) => {
          e.preventDefault();
          colParent.classList.add('drag-over');
        });

        colParent.addEventListener('dragleave', () => {
          colParent.classList.remove('drag-over');
        });

        colParent.addEventListener('drop', (e) => {
          e.preventDefault();
          colParent.classList.remove('drag-over');
          const jobId = e.dataTransfer.getData('text/plain');
          if (jobId) {
            this.moveJobStage(jobId, stage);
          }
        });
      }

      const stageJobs = filteredJobs.filter(j => j.stage === stage);
      countBadge.textContent = stageJobs.length;

      if (stageJobs.length === 0) {
        colWrapper.innerHTML = `<div class="empty-state"><p>No jobs</p></div>`;
      } else {
        colWrapper.innerHTML = stageJobs.map(job => `
          <div class="job-card" draggable="true" id="card-${job.id}" data-job-id="${job.id}" onclick="app.editJob('${job.id}')">
            <div class="job-card-top">
              <div class="job-company">${this.escapeHtml(job.company)}</div>
              <span class="badge badge-${job.workMode ? job.workMode.toLowerCase() : 'mode'}">${this.escapeHtml(job.workMode || 'Full time')}</span>
            </div>
            <div class="job-title">${this.escapeHtml(job.title)}</div>
            <div class="job-meta">
              <span>📍 ${this.escapeHtml(job.location || 'N/A')}</span>
              <span>📅 ${this.formatDate(job.dateApplied)}</span>
            </div>
          </div>
        `).join('');

        // Attach dragstart/dragend events to cards
        stageJobs.forEach(job => {
          const cardEl = document.getElementById(`card-${job.id}`);
          if (cardEl) {
            cardEl.addEventListener('dragstart', (e) => {
              e.stopPropagation();
              e.dataTransfer.setData('text/plain', job.id);
              cardEl.classList.add('dragging');
            });

            cardEl.addEventListener('dragend', () => {
              cardEl.classList.remove('dragging');
            });
          }
        });
      }
    });
  }

  moveJobStage(jobId, newStage) {
    const job = this.jobs.find(j => j.id === jobId);
    if (job && job.stage !== newStage) {
      job.stage = newStage;
      if (newStage === 'accepted') {
        this.triggerConfetti();
      }
      this.saveJobs();
      this.render();
    }
  }

  triggerConfetti() {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  }

  renderTable(filteredJobs) {
    const tbody = document.getElementById('table-body');
    if (!tbody) return;

    if (filteredJobs.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="empty-state">No matching job applications found.</td>
        </tr>`;
      return;
    }

    tbody.innerHTML = filteredJobs.map(job => {
      let urlCell = '<span style="color:#94a3b8">-</span>';
      if (job.url === 'N/A' || job.urlNa) {
        urlCell = '<span style="color:#94a3b8; font-size: 0.775rem;">Link N/A</span>';
      } else if (job.url) {
        urlCell = `<a href="${this.escapeHtml(job.url)}" target="_blank" rel="noopener" class="job-link">View Listing ↗</a>`;
      }

      return `
      <tr>
        <td><strong>${this.escapeHtml(job.company)}</strong></td>
        <td>${this.escapeHtml(job.title)}</td>
        <td><span class="badge badge-${job.stage}">${this.escapeHtml(job.stage)}</span></td>
        <td>${this.formatDate(job.dateApplied)}</td>
        <td>${this.escapeHtml(job.location || 'Remote/Unspecified')}</td>
        <td>${urlCell}</td>
        <td>
          <div class="table-actions">
            <button class="btn btn-secondary btn-sm" onclick="app.editJob('${job.id}')">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="app.deleteJob('${job.id}')">Delete</button>
          </div>
        </td>
      </tr>
      `;
    }).join('');
  }

  renderCharts() {
    if (typeof Chart === 'undefined') return;

    const stageCounts = {
      Applied: this.jobs.filter(j => j.stage === 'applied').length,
      Interviewing: this.jobs.filter(j => j.stage === 'interviewing').length,
      Offer: this.jobs.filter(j => j.stage === 'offer').length,
      Accepted: this.jobs.filter(j => j.stage === 'accepted').length,
      Rejected: this.jobs.filter(j => j.stage === 'rejected').length
    };

    // 1. Stage Breakdown Doughnut Chart
    const ctxStage = document.getElementById('stageChart')?.getContext('2d');
    if (ctxStage) {
      if (this.chartInstances.stage) this.chartInstances.stage.destroy();
      
      this.chartInstances.stage = new Chart(ctxStage, {
        type: 'doughnut',
        data: {
          labels: Object.keys(stageCounts),
          datasets: [{
            data: Object.values(stageCounts),
            backgroundColor: ['#38bdf8', '#60a5fa', '#34d399', '#4ade80', '#f87171'],
            borderWidth: 2,
            borderColor: '#ffffff'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom' }
          }
        }
      });
    }

    // 2. Applications Over Time Bar Chart
    const dateMap = {};
    this.jobs.forEach(j => {
      if (j.dateApplied) {
        const monthYear = j.dateApplied.substring(0, 7); // YYYY-MM
        dateMap[monthYear] = (dateMap[monthYear] || 0) + 1;
      }
    });

    const sortedDates = Object.keys(dateMap).sort();
    const formattedLabels = sortedDates.map(d => this.formatMonthYear(d));
    const timelineLabels = sortedDates.length > 0 ? formattedLabels : ['No Data'];
    const timelineData = sortedDates.length > 0 ? sortedDates.map(d => dateMap[d]) : [0];

    const ctxTimeline = document.getElementById('timelineChart')?.getContext('2d');
    if (ctxTimeline) {
      if (this.chartInstances.timeline) this.chartInstances.timeline.destroy();

      this.chartInstances.timeline = new Chart(ctxTimeline, {
        type: 'bar',
        data: {
          labels: timelineLabels,
          datasets: [{
            label: 'Applications Submitted',
            data: timelineData,
            backgroundColor: '#2563eb',
            borderRadius: 6
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            x: {
              title: {
                display: true,
                text: 'Month Applied',
                font: { size: 12, weight: 'bold' }
              }
            },
            y: {
              beginAtZero: true,
              ticks: { precision: 0 },
              title: {
                display: true,
                text: 'Total Applications',
                font: { size: 12, weight: 'bold' }
              }
            }
          },
          plugins: {
            legend: { display: false }
          }
        }
      });
    }
  }

  openModal(jobToEdit = null) {
    const modal = document.getElementById('job-modal');
    const title = document.getElementById('modal-title');
    const form = document.getElementById('job-form');
    const urlNaCheckbox = document.getElementById('field-url-na');
    const urlInput = document.getElementById('field-url');

    if (!modal || !form) return;

    form.reset();
    if (urlInput) {
      urlInput.disabled = false;
      urlInput.placeholder = 'https://linkedin.com/jobs/view/...';
    }

    if (jobToEdit) {
      this.editingId = jobToEdit.id;
      title.textContent = 'Edit Job Application';
      document.getElementById('field-company').value = jobToEdit.company || '';
      document.getElementById('field-title').value = jobToEdit.title || '';
      document.getElementById('field-stage').value = jobToEdit.stage || 'applied';
      document.getElementById('field-date').value = jobToEdit.dateApplied || '';
      document.getElementById('field-location').value = jobToEdit.location || '';
      document.getElementById('field-workMode').value = jobToEdit.workMode || 'Remote';
      document.getElementById('field-notes').value = jobToEdit.notes || '';
      
      const isNa = jobToEdit.url === 'N/A' || jobToEdit.urlNa;
      if (urlNaCheckbox) urlNaCheckbox.checked = isNa;
      if (urlInput) {
        if (isNa) {
          urlInput.value = '';
          urlInput.disabled = true;
          urlInput.placeholder = 'Link marked as N/A / Expired';
        } else {
          urlInput.value = jobToEdit.url || '';
        }
      }

      document.getElementById('btn-delete-job').style.display = 'inline-flex';
    } else {
      this.editingId = null;
      title.textContent = 'Add New Job Application';
      document.getElementById('field-date').value = new Date().toISOString().split('T')[0];
      if (urlNaCheckbox) urlNaCheckbox.checked = false;
      document.getElementById('btn-delete-job').style.display = 'none';
    }

    modal.classList.add('open');
  }

  closeModal() {
    const modal = document.getElementById('job-modal');
    if (modal) modal.classList.remove('open');
  }

  handleFormSubmit() {
    const company = document.getElementById('field-company').value.trim();
    const title = document.getElementById('field-title').value.trim();
    const stage = document.getElementById('field-stage').value;
    const dateApplied = document.getElementById('field-date').value;
    const location = document.getElementById('field-location').value.trim();
    const workMode = document.getElementById('field-workMode').value;
    const isNa = document.getElementById('field-url-na')?.checked;
    const rawUrl = document.getElementById('field-url').value.trim();
    const url = isNa ? 'N/A' : rawUrl;
    const notes = document.getElementById('field-notes').value.trim();

    if (!company || !title) {
      alert('Please fill out Company Name and Job Title.');
      return;
    }

    if (this.editingId) {
      // Update existing
      const index = this.jobs.findIndex(j => j.id === this.editingId);
      if (index !== -1) {
        this.jobs[index] = {
          ...this.jobs[index],
          company, title, stage, dateApplied, location, workMode, url, notes, urlNa: isNa
        };
      }
    } else {
      // Add new
      const newJob = {
        id: `job-${Date.now()}`,
        company, title, stage, dateApplied, location, workMode, url, notes, urlNa: isNa
      };
      this.jobs.unshift(newJob);
    }

    if (stage === 'accepted') {
      this.triggerConfetti();
    }

    this.saveJobs();
    this.closeModal();
    this.render();
  }

  editJob(id) {
    const job = this.jobs.find(j => j.id === id);
    if (job) {
      this.openModal(job);
    }
  }

  deleteJob(id) {
    const job = this.jobs.find(j => j.id === id);
    if (!job) return;

    if (confirm(`Are you sure you want to delete application for ${job.company} - ${job.title}?`)) {
      this.jobs = this.jobs.filter(j => j.id !== id);
      this.saveJobs();
      this.closeModal();
      this.render();
    }
  }

  exportCSV() {
    if (this.jobs.length === 0) {
      alert('No job data available to export.');
      return;
    }

    const headers = ['Company', 'Job Title', 'Stage', 'Date Applied', 'Location', 'Work Mode', 'Job Listing URL', 'Notes'];
    const rows = this.jobs.map(j => [
      `"${(j.company || '').replace(/"/g, '""')}"`,
      `"${(j.title || '').replace(/"/g, '""')}"`,
      `"${(j.stage || '').replace(/"/g, '""')}"`,
      `"${(j.dateApplied || '').replace(/"/g, '""')}"`,
      `"${(j.location || '').replace(/"/g, '""')}"`,
      `"${(j.workMode || '').replace(/"/g, '""')}"`,
      `"${(j.url || '').replace(/"/g, '""')}"`,
      `"${(j.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `job_applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  exportJSON() {
    if (this.jobs.length === 0) {
      alert('No job data available to backup.');
      return;
    }

    const jsonString = JSON.stringify(this.jobs, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `job_tracker_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  importJSON(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          if (confirm(`Import ${imported.length} job applications? This will overwrite current entries.`)) {
            this.jobs = imported;
            this.saveJobs();
            this.render();
            alert('Job applications successfully imported!');
          }
        } else {
          alert('Invalid JSON file format. Must be an array of job objects.');
        }
      } catch (err) {
        alert('Failed to parse JSON file: ' + err.message);
      }
    };
    reader.readAsText(file);
    // Reset file input value
    event.target.value = '';
  }

  formatMonthYear(yearMonthStr) {
    if (!yearMonthStr || !yearMonthStr.includes('-')) return yearMonthStr;
    const parts = yearMonthStr.split('-');
    if (parts.length === 2) {
      const [year, month] = parts;
      const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }); // e.g. "Jul 2026"
      }
    }
    return yearMonthStr;
  }

  formatDate(dateStr) {
    if (!dateStr) return '-';
    // Handle standard YYYY-MM-DD from HTML date input
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      const [year, month, day] = parts;
      if (year.length === 4) {
        return `${day.padStart(2, '0')}-${month.padStart(2, '0')}-${year}`;
      }
    }

    // Fallback date parsing
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>"']/g, function(m) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      }[m];
    });
  }
}

// Global instance initialization
let app;
document.addEventListener('DOMContentLoaded', () => {
  app = new JobTrackerApp();
  // Attach delete modal handler
  document.getElementById('btn-delete-job')?.addEventListener('click', () => {
    if (app.editingId) app.deleteJob(app.editingId);
  });
});

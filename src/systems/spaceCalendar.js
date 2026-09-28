import { SPACE_MILESTONE_CALENDAR } from '../data/kidsContent.js';
import { HISTORICAL_SOL_LOGS } from '../data/telemetryData.js';

export class SpaceCalendarManager {
  constructor() {
    this.currentLanguage = 'en';
    this.selectedEvent = SPACE_MILESTONE_CALENDAR[0];
    this.selectedBody = 'all'; // 'all', 'moon', 'mars'
  }

  setLanguage(lang) {
    this.currentLanguage = lang;
    this.render();
  }

  setBodyFilter(body) {
    this.selectedBody = body;
    this.render();
  }

  get filteredEvents() {
    if (this.selectedBody === 'all') return SPACE_MILESTONE_CALENDAR;
    return SPACE_MILESTONE_CALENDAR.filter(e => e.body === this.selectedBody);
  }

  render() {
    const container = document.getElementById('space-calendar-container');
    if (!container) return;

    const isBn = this.currentLanguage === 'bn';
    const events = this.filteredEvents;

    container.innerHTML = `
      <!-- Calendar Top Filter -->
      <div class="calendar-filter-bar">
        <button class="cal-filter-btn ${this.selectedBody === 'all' ? 'active' : ''}" data-body="all">
          🌌 ${isBn ? 'সব মাইলফলক' : 'All Milestones'}
        </button>
        <button class="cal-filter-btn ${this.selectedBody === 'moon' ? 'active' : ''}" data-body="moon">
          🌕 ${isBn ? 'চাঁদ মিশন ইভেন্ট' : 'Moon Events'}
        </button>
        <button class="cal-filter-btn ${this.selectedBody === 'mars' ? 'active' : ''}" data-body="mars">
          🔴 ${isBn ? 'মঙ্গল সল লগ' : 'Mars Sol Logs'}
        </button>
      </div>

      <div class="calendar-main-grid">
        <!-- Milestone Dates Timeline Column -->
        <div class="calendar-timeline-col">
          <h4 class="cal-col-header">📅 ${isBn ? 'ঐতিহাসিক মহাকাশ দিনপঞ্জি' : 'Landmark Mission Dates'}</h4>
          <div class="timeline-date-list">
            ${events.map((evt, idx) => {
              const isSelected = this.selectedEvent && this.selectedEvent.date === evt.date;
              return `
                <div class="cal-date-card ${isSelected ? 'selected' : ''}" data-idx="${idx}">
                  <div class="cal-date-badge">
                    <span class="cal-icon">${evt.icon}</span>
                    <span class="cal-date-txt">${evt.date}</span>
                  </div>
                  <div class="cal-card-summary">
                    <h5>${isBn ? evt.title_bn : evt.title_en}</h5>
                    <span class="cal-body-tag ${evt.body}">${evt.body.toUpperCase()}</span>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Selected Event Detail Inspector Column -->
        <div class="calendar-detail-col">
          ${this.renderEventDetail(this.selectedEvent)}
        </div>
      </div>
    `;

    this.bindEvents();
  }

  renderEventDetail(evt) {
    if (!evt) return '<div class="no-selection">Select a date from the calendar.</div>';
    const isBn = this.currentLanguage === 'bn';

    return `
      <div class="event-detail-card">
        <div class="event-header-row">
          <span class="event-icon-big">${evt.icon}</span>
          <div class="event-meta">
            <span class="event-body-pill ${evt.body}">${evt.body === 'moon' ? '🌕 LUNAR MISSION' : '🔴 MARTIAN SOL LOG'}</span>
            <h3 class="event-title">${isBn ? evt.title_bn : evt.title_en}</h3>
            <span class="event-date-stamp">🗓️ ${evt.date}</span>
          </div>
        </div>

        <div class="event-desc-box">
          <p>${isBn ? evt.desc_bn : evt.desc_en}</p>
        </div>

        <!-- Authentic Telemetry Box -->
        <div class="event-telemetry-box">
          <h4>🛰️ ${isBn ? 'নাসা রেকর্ড ও টেলিমেট্রি লগ' : 'NASA Mission Record & Telemetry Log'}</h4>
          <div class="telemetry-specs">
            <div class="ts-item">
              <span class="ts-k">${isBn ? 'স্থান / সাইট:' : 'Target Site:'}</span>
              <span class="ts-v">${evt.body === 'moon' ? 'Mare Tranquillitatis / Oceanus Procellarum' : 'Perseverance Valley / Jezero Delta'}</span>
            </div>
            <div class="ts-item">
              <span class="ts-k">${isBn ? 'স্ট্যাটাস:' : 'Historical Status:'}</span>
              <span class="ts-v verified">NASA PDS VERIFIED ✓</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    document.querySelectorAll('.cal-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setBodyFilter(btn.dataset.body);
      });
    });

    document.querySelectorAll('.cal-date-card').forEach(card => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.idx, 10);
        this.selectedEvent = this.filteredEvents[idx];
        this.render();
      });
    });
  }
}

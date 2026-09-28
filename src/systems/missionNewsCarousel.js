import { NASA_MOON_MISSIONS, NASA_MARS_MISSIONS } from '../data/missionsDatabase.js';

export class MissionNewsCarouselManager {
  constructor() {
    this.currentPlanet = 'mars'; // 'mars' or 'moon'
    this.currentCategory = 'all'; // 'all', 'rovers', 'landers', 'orbiters', 'human'
    this.currentIndex = 0;
    this.currentLanguage = 'en';
  }

  setLanguage(lang) {
    this.currentLanguage = lang;
    this.render();
  }

  setPlanet(planet) {
    this.currentPlanet = planet;
    this.currentIndex = 0;
    this.render();
  }

  setCategory(category) {
    this.currentCategory = category;
    this.currentIndex = 0;
    this.render();
  }

  get currentMissionsList() {
    const rawList = this.currentPlanet === 'moon' ? NASA_MOON_MISSIONS : NASA_MARS_MISSIONS;
    if (this.currentCategory === 'all') return rawList;

    if (this.currentCategory === 'rovers') {
      return rawList.filter(m => {
        const cat = (m.category || '').toLowerCase();
        const type = (m.type || '').toLowerCase();
        const name = (m.name_en || '').toLowerCase();
        const desc = (m.desc_en || '').toLowerCase();
        return (
          cat === 'rovers' ||
          type.includes('rover') ||
          type.includes('lrv') ||
          type.includes('wheeled') ||
          name.includes('rover') ||
          name.includes('lrv') ||
          name.includes('sojourner') ||
          name.includes('spirit') ||
          name.includes('opportunity') ||
          name.includes('curiosity') ||
          name.includes('perseverance') ||
          name.includes('viper') ||
          name.includes('ltv') ||
          name.includes('apollo 15') ||
          name.includes('apollo 16') ||
          name.includes('apollo 17') ||
          desc.includes('lunar roving vehicle') ||
          desc.includes('robotic rover')
        );
      });
    }

    if (this.currentCategory === 'landers') {
      return rawList.filter(m => {
        const cat = (m.category || '').toLowerCase();
        const type = (m.type || '').toLowerCase();
        const desc = (m.desc_en || '').toLowerCase();
        return (
          cat === 'landers' ||
          type.includes('lander') ||
          type.includes('impactor') ||
          type.includes('landing') ||
          desc.includes('soft-landing') ||
          desc.includes('touched down')
        );
      });
    }

    if (this.currentCategory === 'orbiters') {
      return rawList.filter(m => {
        const cat = (m.category || '').toLowerCase();
        const type = (m.type || '').toLowerCase();
        const desc = (m.desc_en || '').toLowerCase();
        return (
          cat === 'orbiters' ||
          type.includes('orbiter') ||
          type.includes('flyby') ||
          type.includes('survey') ||
          type.includes('probe') ||
          type.includes('cubesat') ||
          desc.includes('orbit') ||
          desc.includes('fly by')
        );
      });
    }

    if (this.currentCategory === 'human') {
      return rawList.filter(m => {
        const cat = (m.category || '').toLowerCase();
        const type = (m.type || '').toLowerCase();
        const name = (m.name_en || '').toLowerCase();
        return (
          cat === 'human' ||
          type.includes('crewed') ||
          type.includes('human') ||
          name.startsWith('apollo') ||
          name.startsWith('artemis')
        );
      });
    }

    return rawList.filter(m => m.category === this.currentCategory);
  }

  render() {
    const container = document.getElementById('mission-news-carousel-container');
    if (!container) return;

    const isBn = this.currentLanguage === 'bn';
    const missions = this.currentMissionsList;
    const isMars = this.currentPlanet === 'mars';

    container.innerHTML = `
      <!-- Top Filter & Planet Switcher -->
      <div class="news-header-controls">
        <div class="news-planet-tabs">
          <button class="news-planet-btn ${isMars ? 'active' : ''}" id="news-tab-mars">
            🔴 ${isBn ? 'মঙ্গল মিশন আর্কাইভ' : 'Mars Missions Archive'} (${NASA_MARS_MISSIONS.length})
          </button>
          <button class="news-planet-btn ${!isMars ? 'active' : ''}" id="news-tab-moon">
            🌕 ${isBn ? 'চাঁদ মিশন আর্কাইভ' : 'Moon Missions Archive'} (${NASA_MOON_MISSIONS.length})
          </button>
        </div>

        <div class="news-cat-filters">
          <button class="news-cat-btn ${this.currentCategory === 'all' ? 'active' : ''}" data-cat="all">
            ${isBn ? 'সব' : 'All'}
          </button>
          <button class="news-cat-btn ${this.currentCategory === 'rovers' ? 'active' : ''}" data-cat="rovers">
            🤖 ${isBn ? 'রোভার' : 'Rovers'}
          </button>
          <button class="news-cat-btn ${this.currentCategory === 'landers' ? 'active' : ''}" data-cat="landers">
            🛬 ${isBn ? 'ল্যান্ডার' : 'Landers'}
          </button>
          <button class="news-cat-btn ${this.currentCategory === 'orbiters' ? 'active' : ''}" data-cat="orbiters">
            🛰️ ${isBn ? 'অরবিটার' : 'Orbiters'}
          </button>
          <button class="news-cat-btn ${this.currentCategory === 'human' ? 'active' : ''}" data-cat="human">
            👨‍🚀 ${isBn ? 'মানববাহী' : 'Crewed'}
          </button>
        </div>
      </div>

      <!-- FB Carousel Card Slider Stage -->
      <div class="fb-carousel-stage">
        ${missions.length > 1 ? `
          <button class="carousel-nav-arrow left" id="news-carousel-prev" title="Previous Mission">❮</button>
        ` : ''}

        <div class="fb-carousel-track" id="fb-carousel-track">
          ${missions.length > 0 ? missions.map((m, idx) => {
            const statusClass = (m.status || '').toLowerCase().includes('success')
              ? 'status-success'
              : (m.status || '').toLowerCase().includes('active')
                ? 'status-active'
                : (m.status || '').toLowerCase().includes('plan')
                  ? 'status-planned'
                  : 'status-failed';

            return `
              <div class="fb-mission-card ${idx === this.currentIndex ? 'focused' : ''}" data-index="${idx}">
                <div class="card-hero-banner">
                  <div class="card-hero-overlay"></div>
                  <div class="card-top-row">
                    <span class="card-badge-icon">${m.badge || '🚀'}</span>
                    <span class="card-status-badge ${statusClass}">
                      ${isBn ? (m.status_bn || m.status) : m.status}
                    </span>
                  </div>
                  <span class="card-year-tag">${m.year || ''}</span>
                </div>

                <div class="card-content-body">
                  <div class="card-type-row">
                    <span class="card-type-label">${isBn ? (m.type_bn || m.type) : m.type}</span>
                    <span class="card-date-label">${m.date || ''}</span>
                  </div>
                  <h3 class="card-mission-title">${isBn ? (m.name_bn || m.name_en) : m.name_en}</h3>
                  <p class="card-mission-desc">${isBn ? (m.desc_bn || m.desc_en) : m.desc_en}</p>
                  <div class="card-facts-box">
                    <strong>💡 ${isBn ? 'মূল সাফল্য:' : 'Key Highlight:'}</strong>
                    <p>${isBn ? (m.facts_bn || m.facts_en || '') : (m.facts_en || '')}</p>
                  </div>
                </div>
              </div>
            `;
          }).join('') : `
            <div class="fb-mission-card focused" style="margin: auto; max-width: 420px; text-align: center; padding: 24px;">
              <div style="font-size: 38px; margin-bottom: 8px;">🔍</div>
              <h3 style="color: #fff; font-size: 16px; margin-bottom: 6px;">
                ${isBn ? 'এই ক্যাটাগরিতে কোনো মিশন পাওয়া যায়নি' : 'No missions found in this category'}
              </h3>
              <p style="color: #94a3b8; font-size: 12px; margin-bottom: 12px;">
                ${isBn ? 'অন্য ক্যাটাগরি বা সম্পূর্ণ আর্কাইভ দেখতে "সব" চাপুন।' : 'Try switching categories or select "All" to browse all missions.'}
              </p>
              <button class="news-cat-btn active" data-cat="all" style="margin: auto;">
                ${isBn ? 'সব মিশন দেখুন' : 'Show All Missions'}
              </button>
            </div>
          `}
        </div>

        ${missions.length > 1 ? `
          <button class="carousel-nav-arrow right" id="news-carousel-next" title="Next Mission">❯</button>
        ` : ''}
      </div>

      <!-- Carousel Pagination Dots -->
      <div class="carousel-dots-row">
        ${missions.map((_, i) => `
          <span class="c-dot ${i === this.currentIndex ? 'active' : ''}" data-index="${i}"></span>
        `).join('')}
      </div>
    `;

    this.bindEvents();
    if (missions.length > 0) {
      this.scrollToIndex(this.currentIndex);
    }
  }

  bindEvents() {
    document.getElementById('news-tab-mars')?.addEventListener('click', () => this.setPlanet('mars'));
    document.getElementById('news-tab-moon')?.addEventListener('click', () => this.setPlanet('moon'));

    document.querySelectorAll('.news-cat-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.setCategory(btn.dataset.cat);
      });
    });

    document.getElementById('news-carousel-prev')?.addEventListener('click', () => {
      const len = this.currentMissionsList.length;
      if (len <= 0) return;
      this.currentIndex = (this.currentIndex - 1 + len) % len;
      this.scrollToIndex(this.currentIndex);
    });

    document.getElementById('news-carousel-next')?.addEventListener('click', () => {
      const len = this.currentMissionsList.length;
      if (len <= 0) return;
      this.currentIndex = (this.currentIndex + 1) % len;
      this.scrollToIndex(this.currentIndex);
    });

    document.querySelectorAll('.carousel-dots-row .c-dot').forEach(dot => {
      dot.addEventListener('click', () => {
        this.currentIndex = parseInt(dot.dataset.index, 10);
        this.scrollToIndex(this.currentIndex);
      });
    });
  }

  scrollToIndex(idx) {
    const track = document.getElementById('fb-carousel-track');
    const cards = track?.querySelectorAll('.fb-mission-card');
    if (!track || !cards || cards.length === 0) return;

    cards.forEach((c, i) => {
      c.classList.toggle('focused', i === idx);
    });

    const targetCard = cards[idx];
    if (targetCard) {
      const trackWidth = track.clientWidth;
      const cardLeft = targetCard.offsetLeft;
      const cardWidth = targetCard.clientWidth;
      const scrollPos = cardLeft - (trackWidth / 2) + (cardWidth / 2);
      track.scrollTo({ left: scrollPos, behavior: 'smooth' });
    }

    document.querySelectorAll('.carousel-dots-row .c-dot').forEach((d, i) => {
      d.classList.toggle('active', i === idx);
    });
  }
}

// ======================== DATA ========================
const THEME_KEY = 'studyhub_theme';

const DEFAULT_EBOOK_EXAMS = ['SSC', 'Railways', 'UPPBPB', 'IB', 'RPF', 'Others'];
const DEFAULT_EBOOK_LANGUAGES = ['English', 'Hindi'];

let data = { categories: {}, ebooks: [], driveFolders: [], exams: DEFAULT_EBOOK_EXAMS.slice(), languages: DEFAULT_EBOOK_LANGUAGES.slice() };
let mockTests = [];
let topicTests = [];
let qidCounter = 0;

function normalizeNameList(list, fallback) {
  const seen = {};
  const values = [];
  (Array.isArray(list) ? list : []).forEach(value => {
    const clean = String(value == null ? '' : value).trim();
    const key = clean.toLowerCase();
    if (clean && !seen[key]) {
      values.push(clean);
      seen[key] = true;
    }
  });
  return values.length ? values : fallback.slice();
}

async function loadData() {
  try {
    const r = localStorage.getItem('studyhub_data');
    if (r) {
      const d = JSON.parse(r);
      data = {
        categories: d.categories || {},
        ebooks: d.ebooks || [],
        driveFolders: d.driveFolders || [],
        exams: normalizeNameList(d.exams, DEFAULT_EBOOK_EXAMS),
        languages: normalizeNameList(d.languages, DEFAULT_EBOOK_LANGUAGES)
      };
      mockTests = d.mockTests || [];
      topicTests = d.topicTests || [];
    }
  } catch {}
  if (!data.categories) data.categories = {};
  if (!Array.isArray(data.ebooks)) data.ebooks = [];
  if (!Array.isArray(mockTests)) mockTests = [];
  if (!Array.isArray(topicTests)) topicTests = [];
  data.exams = normalizeNameList(data.exams, DEFAULT_EBOOK_EXAMS);
  data.languages = normalizeNameList(data.languages, DEFAULT_EBOOK_LANGUAGES);
  if (normalizeQuestionTypes()) saveData();
  syncIds();
}

async function saveData() {
  try {
    localStorage.setItem('studyhub_data', JSON.stringify({
      categories: data.categories,
      ebooks: data.ebooks,
      driveFolders: data.driveFolders || [],
      exams: data.exams || DEFAULT_EBOOK_EXAMS,
      languages: data.languages || DEFAULT_EBOOK_LANGUAGES,
      mockTests,
      topicTests
    }));
  } catch { }
}

async function uploadFile(file, folder) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

async function deleteUploadedFile(url) {
  // Data URLs are embedded in the JSON — no server file to delete
}

function imgUrl(url) {
  return url || '';
}

function syncIds() {
  let maxId = 0;
  forEachQ((q) => { if (q.id > maxId) maxId = q.id; });
  qidCounter = maxId;
}

function genId() { return Date.now() + (++qidCounter); }

function sortedKeys(obj) {
  return Object.keys(obj).sort((a, b) => (obj[a].order || 0) - (obj[b].order || 0));
}

function forEachQ(fn) {
  sortedKeys(data.categories).forEach(catId => {
    const cat = data.categories[catId];
    sortedKeys(cat.subcategories || {}).forEach(subId => {
      const sub = cat.subcategories[subId];
      sortedKeys(sub.topics || {}).forEach(topicId => {
        const topic = sub.topics[topicId];
        (topic.questions || []).forEach((q, i) => fn(q, i, catId, subId, topicId, cat, sub, topic));
      });
    });
  });
}

function countQuestions() {
  let c = 0;
  forEachQ(() => c++);
  return c;
}

// ======================== SEED DATA ========================
async function seedData() {
  if (Object.keys(data.categories).length > 0) return;
  data.categories = {
    'general-awareness': {
      id: 'general-awareness', name: 'General Awareness', icon: '🌍', color: '#6c5ce7', order: 1,
      subcategories: {
        'geography': {
          id: 'geography', name: 'Geography', order: 1,
          topics: {
            'rivers': {
              id: 'rivers', name: 'Rivers', order: 1,
              questions: [
                { id: genId(), question: 'Which is the longest river in the world?', options: ['Amazon', 'Nile', 'Yangtze', 'Mississippi'], answer: 1, explanation: 'The Nile River is approximately 6,650 km long, making it the longest river in the world.', image: '' },
                { id: genId(), question: 'Which river is known as the "Ganga of the South"?', options: ['Kaveri', 'Godavari', 'Krishna', 'Mahanadi'], answer: 0, explanation: 'Kaveri River is often called the "Ganga of the South" due to its religious significance.', image: '' }
              ]
            },
            'mountains': {
              id: 'mountains', name: 'Mountains', order: 2,
              questions: [
                { id: genId(), question: 'Which is the highest mountain peak in the world?', options: ['K2', 'Mount Everest', 'Kangchenjunga', 'Lhotse'], answer: 1, explanation: 'Mount Everest is the highest mountain peak in the world at 8,848 meters.', image: '' }
              ]
            }
          }
        },
        'history': {
          id: 'history', name: 'History', order: 2,
          topics: {
            'indian-freedom': {
              id: 'indian-freedom', name: 'Indian Freedom Struggle', order: 1,
              questions: [
                { id: genId(), question: 'Who gave the "Quit India" speech in 1942?', options: ['Subhas Chandra Bose', 'Jawaharlal Nehru', 'Mahatma Gandhi', 'Bhagat Singh'], answer: 2, explanation: 'Mahatma Gandhi gave the "Quit India" speech on August 8, 1942.', image: '' }
              ]
            }
          }
        }
      }
    },
    'quantitative-aptitude': {
      id: 'quantitative-aptitude', name: 'Quantitative Aptitude', icon: '📐', color: '#00b894', order: 2,
      subcategories: {
        'arithmetic': {
          id: 'arithmetic', name: 'Arithmetic', order: 1,
          topics: {
            'percentage': {
              id: 'percentage', name: 'Percentage', order: 1,
              questions: [
                { id: genId(), question: 'What is 20% of 450?', options: ['70', '80', '90', '100'], answer: 2, explanation: '20% of 450 = (20/100) × 450 = 90.', image: '' },
                { id: genId(), question: 'If 30% of a number is 150, what is the number?', options: ['400', '450', '500', '550'], answer: 2, explanation: 'Let the number be x. 30% of x = 150 => x = 150 × 100/30 = 500.', image: '' }
              ]
            },
            'ratio': {
              id: 'ratio', name: 'Ratio & Proportion', order: 2,
              questions: [
                { id: genId(), question: 'If A:B = 2:3 and B:C = 4:5, find A:C.', options: ['8:15', '2:5', '8:12', '15:8'], answer: 0, explanation: 'A:B = 2:3, B:C = 4:5. Multiply: A:B:C = 8:12:15, so A:C = 8:15.', image: '' }
              ]
            }
          }
        },
        'algebra': {
          id: 'algebra', name: 'Algebra', order: 2,
          topics: {
            'linear-equations': {
              id: 'linear-equations', name: 'Linear Equations', order: 1,
              questions: [
                { id: genId(), question: 'Solve for x: 2x + 5 = 13', options: ['3', '4', '5', '6'], answer: 1, explanation: '2x + 5 = 13 => 2x = 8 => x = 4.', image: '' }
              ]
            }
          }
        }
      }
    },
    'reasoning': {
      id: 'reasoning', name: 'Logical Reasoning', icon: '🧠', color: '#fdcb6e', order: 3,
      subcategories: {
        'verbal': {
          id: 'verbal', name: 'Verbal Reasoning', order: 1,
          topics: {
            'analogy': {
              id: 'analogy', name: 'Analogy', order: 1,
              questions: [
                { id: genId(), question: 'Doctor : Hospital :: Teacher : ?', options: ['School', 'Office', 'Hospital', 'Court'], answer: 0, explanation: 'Doctor works in Hospital, similarly Teacher works in School.', image: '' }
              ]
            },
            'coding-decoding': {
              id: 'coding-decoding', name: 'Coding-Decoding', order: 2,
              questions: [
                { id: genId(), question: 'If CAT is coded as 3120, how is DOG coded?', options: ['4157', '4158', '5147', '5148'], answer: 0, explanation: 'C=3, A=1, T=20 => 3120. D=4, O=15, G=7 => 4157.', image: '' }
              ]
            }
          }
        }
      }
    },
    'general-science': {
      id: 'general-science', name: 'General Science', icon: '🔬', color: '#e17055', order: 4,
      subcategories: {
        'physics': {
          id: 'physics', name: 'Physics', order: 1,
          topics: {
            'motion': {
              id: 'motion', name: 'Motion', order: 1,
              questions: [
                { id: genId(), question: 'What is the SI unit of force?', options: ['Newton', 'Joule', 'Watt', 'Pascal'], answer: 0, explanation: 'The SI unit of force is Newton (N), named after Sir Isaac Newton.', image: '' }
              ]
            }
          }
        },
        'chemistry': {
          id: 'chemistry', name: 'Chemistry', order: 2,
          topics: {
            'elements': {
              id: 'elements', name: 'Elements & Compounds', order: 1,
              questions: [
                { id: genId(), question: 'What is the chemical symbol for Gold?', options: ['Go', 'Gd', 'Au', 'Ag'], answer: 2, explanation: 'Gold\'s chemical symbol is Au, from the Latin word "Aurum".', image: '' }
              ]
            }
          }
        }
      }
    }
  };
  await saveData();
}

// ======================== NAVIGATION ========================
function switchPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
  const titles = { dashboard: 'Dashboard', questions: 'Question Bank', mocks: 'Mock Tests', topics: 'Topic Tests', ebook: 'E-Book', admin: 'Admin' };
  document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
  document.getElementById('statsBadge').textContent = countQuestions() + ' questions';
  if (page === 'questions' && !_qbContext) renderQBTopics();
  if (page === 'dashboard') { _qbContext = null; renderDashboard(); }
  if (page === 'mocks') renderMockList();
  if (page === 'topics') renderTopicTests();
  if (page === 'ebook') renderEbook();
  if (page === 'admin') renderAdmin();
  document.getElementById('sidebar').classList.remove('open');
}

function openTestBuilder() {
  document.querySelectorAll('.admin-tab').forEach(x => x.classList.toggle('active', x.dataset.admin === 'builder'));
  switchPage('admin');
}

// ======================== DASHBOARD ========================
function renderDashboard() {
  const grid = document.getElementById('dashboardGrid');
  grid.innerHTML = '';
  const catColors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899'];
  let ci = 0;
  sortedKeys(data.categories).forEach(catId => {
    const cat = data.categories[catId];
    const card = document.createElement('div'); card.className = 'cat-card';
    const totalQ = countQInCat(catId);
    const iconHtml = cat.iconImage ? '<img src="' + imgUrl(cat.iconImage) + '" class="cat-icon-img">' : (cat.icon || '📂');
    const color = (cat.color && /^#[0-9a-f]{3,8}$/i.test(cat.color)) ? cat.color : catColors[ci++ % catColors.length];
    card.innerHTML = `
      <div class="cat-head" style="--cat-color:${color}">
        <span class="cat-icon-chip">${iconHtml}</span>
        <span class="cat-name">${esc(cat.name)}</span>
        <span class="cat-count">${totalQ} Q</span>
      </div>
      <div class="cat-body" id="catBody-${catId}"></div>`;
    grid.appendChild(card);

    const body = card.querySelector('.cat-body');
    sortedKeys(cat.subcategories || {}).forEach(subId => {
      const sub = cat.subcategories[subId];
      const subDiv = document.createElement('div'); subDiv.className = 'subcat-item';
      subDiv.innerHTML = `
        <div class="subcat-head" onclick="toggleSubcat('${catId}','${subId}')">
          <i class="far fa-folder"></i> ${esc(sub.name)} <span class="arrow" id="arrow-${catId}-${subId}"><i class="fas fa-chevron-down"></i></span>
        </div>
        <div class="topic-list hidden" id="topics-${catId}-${subId}"></div>`;
      body.appendChild(subDiv);

      const tl = document.getElementById('topics-' + catId + '-' + subId);
      sortedKeys(sub.topics || {}).forEach(topicId => {
        const topic = sub.topics[topicId];
        const qc = (topic.questions || []).length;
        const pill = document.createElement('span'); pill.className = 'topic-pill';
        pill.textContent = topic.name + ' (' + qc + ')';
        pill.addEventListener('click', () => openQuestionBank(catId, subId, topicId));
        tl.appendChild(pill);
      });
    });
  });
  updateHomeStats();
}

function countTopics() {
  let c = 0;
  sortedKeys(data.categories).forEach(catId => {
    const cat = data.categories[catId];
    sortedKeys(cat.subcategories || {}).forEach(subId => {
      c += Object.keys(cat.subcategories[subId].topics || {}).length;
    });
  });
  return c;
}

function animateNumber(el, target) {
  if (!el) return;
  const from = parseInt(el.textContent, 10) || 0;
  if (from === target) { el.textContent = target; return; }
  const start = performance.now();
  const dur = 650;
  function tick(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(from + (target - from) * eased);
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function updateHomeStats() {
  const subjects = Object.keys(data.categories).length;
  const questions = countQuestions();
  const topics = countTopics();
  const tests = mockTests.length;
  const ebooks = (data.ebooks || []).length;
  animateNumber(document.getElementById('heroSubjects'), subjects);
  animateNumber(document.getElementById('heroQuestions'), questions);
  animateNumber(document.getElementById('heroTests'), tests);
  animateNumber(document.getElementById('statQuestions'), questions);
  animateNumber(document.getElementById('statTopics'), topics);
  animateNumber(document.getElementById('statTests'), tests);
  animateNumber(document.getElementById('statEbooks'), ebooks);
}

function scrollToSubjects() {
  const el = document.getElementById('browseSubjects');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ======================== HERO CAROUSEL ========================
let _heroIdx = 0;
let _heroTimer = null;

function goHeroSlide(i) {
  const track = document.getElementById('heroTrack');
  if (!track) return;
  const total = track.children.length;
  if (!total) return;
  _heroIdx = (i + total) % total;
  track.style.transform = 'translateX(-' + (_heroIdx * 100) + '%)';
  document.querySelectorAll('#heroDots .carousel-dot').forEach((d, di) => {
    d.classList.toggle('active', di === _heroIdx);
  });
}

function stopHeroAuto() {
  if (_heroTimer) { clearInterval(_heroTimer); _heroTimer = null; }
}

function startHeroAuto() {
  stopHeroAuto();
  _heroTimer = setInterval(() => goHeroSlide(_heroIdx + 1), 5200);
}

function initHeroCarousel() {
  const track = document.getElementById('heroTrack');
  const dots = document.getElementById('heroDots');
  if (!track || !dots) return;
  const total = track.children.length;
  dots.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('button');
    dot.className = 'carousel-dot' + (i === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
    dot.addEventListener('click', () => { goHeroSlide(i); startHeroAuto(); });
    dots.appendChild(dot);
  }
  const prev = document.getElementById('heroPrev');
  const next = document.getElementById('heroNext');
  if (prev) prev.addEventListener('click', () => { goHeroSlide(_heroIdx - 1); startHeroAuto(); });
  if (next) next.addEventListener('click', () => { goHeroSlide(_heroIdx + 1); startHeroAuto(); });

  const carousel = document.getElementById('heroCarousel');
  carousel.addEventListener('mouseenter', stopHeroAuto);
  carousel.addEventListener('mouseleave', startHeroAuto);
  carousel.addEventListener('focusin', stopHeroAuto);
  carousel.addEventListener('focusout', startHeroAuto);
  startHeroAuto();
}

function countQInCat(catId) {
  let c = 0;
  const cat = data.categories[catId];
  if (!cat) return 0;
  Object.keys(cat.subcategories || {}).forEach(subId => {
    Object.keys(cat.subcategories[subId].topics || {}).forEach(topicId => {
      c += (cat.subcategories[subId].topics[topicId].questions || []).length;
    });
  });
  return c;
}

function renderQBTopics(catId, subId) {
  let html = '<div class="qb-subject-tabs">';
  const catIds = sortedKeys(data.categories);
  catIds.forEach(cId => {
    const cat = data.categories[cId];
    html += '<button class="qb-subject-btn' + (catId === cId ? ' active' : '') + '" onclick="renderQBTopics(\'' + cId + '\')">' + esc(cat.name) + '</button>';
  });
  html += '</div>';

  if (!catId) {
    html += '<div class="qb-empty">Select a subject above to view topics.</div>';
  } else {
    catIds.forEach(cId => {
      if (cId !== catId) return;
      const cat = data.categories[cId];
      html += '<div class="qb-category active">';
      sortedKeys(cat.subcategories || {}).forEach(sId => {
        if (subId && sId !== subId) return;
        const sub = cat.subcategories[sId];
        const hasTopics = Object.keys(sub.topics || {}).length > 0;
        if (!hasTopics) return;
        html += '<div class="qb-subsection"><div class="qb-subsection-title">' + esc(sub.name) + '</div><div class="qb-topics-row">';
        sortedKeys(sub.topics).forEach(tId => {
          const topic = sub.topics[tId];
          const qc = (topic.questions || []).length;
          html += '<div class="qb-topic-card" onclick="openQuestionBank(\'' + cId + '\',\'' + sId + '\',\'' + tId + '\')">';
          html += '<div class="qb-topic-name">' + esc(topic.name) + '</div>';
          html += '<div class="qb-topic-count">' + qc + ' Question' + (qc !== 1 ? 's' : '') + '</div></div>';
        });
        html += '</div></div>';
      });
      html += '</div>';
    });
  }

  document.getElementById('qbBreadcrumb').innerHTML = '<span>Question Bank</span>';
  document.getElementById('qbContent').innerHTML = html;
}

function filterDashboardTopics(val) {
  const q = val.toLowerCase().trim();
  document.querySelectorAll('.cat-card').forEach(card => {
    let catMatch = false;
    const subcatHeads = card.querySelectorAll('.subcat-head');
    subcatHeads.forEach(head => {
      const topicList = head.nextElementSibling;
      const pills = topicList ? topicList.querySelectorAll('.topic-pill') : [];
      let subMatch = false;
      pills.forEach(pill => {
        const match = !q || pill.textContent.toLowerCase().includes(q);
        pill.style.display = match ? '' : 'none';
        if (match) subMatch = true;
      });
      if (q) {
        const subName = head.textContent.trim();
        const subNameMatch = subName.toLowerCase().includes(q);
        if (subMatch || subNameMatch) {
          topicList.classList.remove('hidden');
          head.querySelector('.arrow')?.classList.add('open');
          catMatch = true;
        }
        if (!subNameMatch && !subMatch) {
          topicList.classList.add('hidden');
          head.querySelector('.arrow')?.classList.remove('open');
        }
      } else {
        topicList.classList.add('hidden');
        head.querySelector('.arrow')?.classList.remove('open');
      }
    });
    const catName = card.querySelector('.cat-head')?.textContent || '';
    if (q && !catMatch && !catName.toLowerCase().includes(q)) {
      card.style.display = 'none';
    } else {
      card.style.display = '';
    }
  });
}

function toggleSubcat(catId, subId) {
  const el = document.getElementById('topics-' + catId + '-' + subId);
  const arrow = document.getElementById('arrow-' + catId + '-' + subId);
  el.classList.toggle('hidden');
  if (arrow) arrow.classList.toggle('open');
}

// ======================== QUESTION BANK ========================
let _qbContext = null;
let _qbSelected = new Set();
let _qbPickerType = null;
// null = show the type picker, 'all' = every question, otherwise a type group id
let _qbTypeView = null;

function openQuestionBank(catId, subId, topicId) {
  _qbContext = { catId, subId, topicId };
  _qbSelected = new Set();
  _qbPickerType = null;
  _qbTypeView = null;
  switchPage('questions');
  renderQBView();
}

function setQBTypeView(view) {
  _qbTypeView = view;
  renderQBView();
}

function qbContextTopic() {
  if (!_qbContext) return null;
  return data.categories[_qbContext.catId]?.subcategories[_qbContext.subId]?.topics[_qbContext.topicId] || null;
}

function qbAllGroups(topic) {
  return qbGroupQuestions((topic && topic.questions) || [], topic);
}

// One entry per box on the type picker: every registered type (even with no
// questions yet), then stale/legacy type labels, then untyped questions.
function qbTypeEntries(topic, groups) {
  const entries = [];
  const typeIds = sortedKeys(getTopicTypes(topic));
  typeIds.forEach((tid, i) => {
    const type = getTopicTypes(topic)[tid] || {};
    const group = groups.find(g => g.id === tid);
    entries.push({
      id: tid,
      tag: 'Type ' + (i + 1),
      name: type.name || tid,
      count: group ? group.questions.length : 0
    });
  });
  if (typeIds.length) {
    let extraNo = typeIds.length;
    groups.forEach(group => {
      if (group.extra) {
        extraNo++;
        entries.push({ id: group.id, tag: 'Type ' + extraNo, name: group.name, count: group.questions.length });
      }
    });
    const untyped = groups.find(g => g.id === '__untyped__');
    if (untyped) {
      entries.push({ id: untyped.id, tag: 'Other', name: untyped.name, count: untyped.questions.length, untyped: true });
    }
  }
  return entries;
}

function makeQBTypeCard(info) {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'qb-type-card' + (info.untyped ? ' untyped' : '');
  card.innerHTML =
    '<span class="qb-type-card-tag">' + esc(info.tag) + '</span>' +
    '<span class="qb-type-card-name">' + esc(info.name) + '</span>' +
    '<span class="qb-type-card-count">' + info.count + ' Question' + (info.count === 1 ? '' : 's') + '</span>' +
    '<span class="qb-type-card-go"><i class="fas fa-arrow-right"></i></span>';
  card.addEventListener('click', function () { setQBTypeView(info.id); });
  return card;
}

function makeQBTypeTab(id, label, active) {
  const tab = document.createElement('button');
  tab.type = 'button';
  tab.className = 'qb-type-tab' + (active ? ' active' : '');
  tab.textContent = label;
  tab.addEventListener('click', function () { setQBTypeView(id); });
  return tab;
}

function qbViewHead(titleText, subText, backLabel, onBack) {
  const head = document.createElement('div');
  head.className = 'qb-view-head';
  const back = document.createElement('button');
  back.type = 'button';
  back.className = 'qb-back-btn';
  back.innerHTML = '<i class="fas fa-arrow-left"></i> ' + backLabel;
  back.addEventListener('click', onBack);
  const title = document.createElement('div');
  title.className = 'qb-view-title';
  title.innerHTML = esc(titleText) + (subText ? ' <span class="qb-view-sub">' + esc(subText) + '</span>' : '');
  head.appendChild(back);
  head.appendChild(title);
  return head;
}

function renderQBView() {
  const cat = data.categories[_qbContext.catId];
  const sub = cat && cat.subcategories[_qbContext.subId];
  const topic = sub && sub.topics[_qbContext.topicId];
  if (!cat || !sub || !topic) return;
  const container = document.getElementById('qbContent');
  const typeIds = sortedKeys(getTopicTypes(topic));
  const groups = qbAllGroups(topic);
  const viewGroup = (_qbTypeView && _qbTypeView !== 'all')
    ? groups.find(g => g.id === _qbTypeView)
    : null;
  const viewName = viewGroup
    ? viewGroup.name
    : ((_qbTypeView && _qbTypeView !== 'all') ? (getTypeName(topic, _qbTypeView) || '') : '');

  let crumb =
    '<a href="#" onclick="renderQBTopics(\'' + _qbContext.catId + '\');return false;">' + esc(cat.name) + '</a> › ' +
    '<a href="#" onclick="renderQBTopics(\'' + _qbContext.catId + '\',\'' + _qbContext.subId + '\');return false;">' + esc(sub.name) + '</a> › ';
  if (typeIds.length) {
    crumb += '<a href="#" onclick="setQBTypeView(null);return false;">' + esc(topic.name) + '</a>';
    if (viewName) crumb += ' › <span>' + esc(viewName) + '</span>';
  } else {
    crumb += '<span>' + esc(topic.name) + '</span>';
  }
  document.getElementById('qbBreadcrumb').innerHTML = crumb;

  // Every topic starts on the type boxes screen, even when it has no types yet.
  if (_qbTypeView === null) {
    renderQBTypePicker(container, topic, groups);
    return;
  }
  if (_qbTypeView !== 'all' && !viewGroup && !getTopicTypes(topic)[_qbTypeView]) {
    // The chosen type disappeared (for example after bulk assigning types).
    _qbTypeView = null;
    renderQBTypePicker(container, topic, groups);
    return;
  }
  renderQBQuestionView(container, topic, _qbTypeView, groups);
}

function renderQBTypePicker(container, topic, groups) {
  container.innerHTML = '';
  const entries = qbTypeEntries(topic, groups);
  if (!entries.length) {
    const empty = document.createElement('div');
    empty.className = 'qb-types-empty';
    empty.innerHTML = '<i class="fas fa-layer-group"></i><p>No questions in this topic yet.</p>';
    container.appendChild(empty);
    return;
  }
  const row = document.createElement('div');
  row.className = 'qb-types-row';
  entries.forEach(entry => row.appendChild(makeQBTypeCard(entry)));
  container.appendChild(row);
}

function renderQBQuestionView(container, topic, view, groups) {
  const typeIds = sortedKeys(getTopicTypes(topic));
  const isTypeView = !!(view && view !== 'all');
  const group = isTypeView ? groups.find(g => g.id === view) : null;
  const qsView = isTypeView
    ? (group ? group.questions : [])
    : (topic.questions || []);
  const typeName = isTypeView
    ? ((group && group.name) || getTypeName(topic, view) || view)
    : '';

  container.innerHTML = '';
  container.appendChild(qbViewHead(
    isTypeView ? typeName : (typeIds.length ? 'All Questions' : topic.name),
    qsView.length + ' Question' + (qsView.length === 1 ? '' : 's'),
    typeIds.length ? 'All types' : 'All topics',
    function () {
      if (typeIds.length) setQBTypeView(null);
      else renderQBTopics(_qbContext.catId, _qbContext.subId);
    }
  ));

  if (typeIds.length) {
    const tabs = document.createElement('div');
    tabs.className = 'qb-type-tabs';
    tabs.appendChild(makeQBTypeTab('all', 'All', !isTypeView));
    let tabNo = 0;
    qbTypeEntries(topic, groups).forEach(entry => {
      if (!entry.untyped) tabNo++;
      tabs.appendChild(makeQBTypeTab(entry.id, entry.untyped ? entry.name : tabNo + '. ' + entry.name, entry.id === view));
    });
    container.appendChild(tabs);
  }

  if (!qsView.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = '<i class="fas fa-inbox"></i><p>' +
      (isTypeView ? 'No questions in this type yet.' : 'No questions in this topic yet.') + '</p>';
    container.appendChild(empty);
    updateQBSelection();
    return;
  }

  let searchHtml = '<div style="margin-bottom:12px;"><input type="text" id="qbSearch" placeholder="Search questions..." style="width:100%;padding:10px 14px;border:2px solid var(--border);border-radius:var(--radius-sm);font-size:14px;background:var(--surface);color:var(--text);outline:none;" oninput="filterQBQuestions(this.value)"></div>';
  container.insertAdjacentHTML('beforeend', searchHtml);

  const bar = document.createElement('div');
  bar.className = 'qb-select-bar';
  bar.innerHTML =
    '<label class="qb-select-all"><input type="checkbox" id="qbSelectAll"> Select all</label>' +
    '<span class="qb-selected-count" id="qbSelectedCount">0 selected</span>' +
    '<div class="qb-select-actions">' +
      '<button type="button" class="qb-action-btn" id="qbAddMockBtn" disabled><i class="fas fa-stopwatch"></i> Add to Mock Test</button>' +
      '<button type="button" class="qb-action-btn" id="qbAddTopicBtn" disabled><i class="fas fa-list-check"></i> Add to Topic Test</button>' +
      '<button type="button" class="qb-action-btn qb-action-clear" id="qbClearSelBtn" disabled><i class="fas fa-xmark"></i> Clear</button>' +
    '</div>';
  container.appendChild(bar);

  const picker = document.createElement('div');
  picker.className = 'qb-picker hidden';
  picker.id = 'qbPicker';
  container.appendChild(picker);

  const list = document.createElement('div'); list.id = 'qbQuestionList';
  container.appendChild(list);

  window._qbAllQs = qsView;

  document.getElementById('qbSelectAll').addEventListener('change', function () { toggleQBSelectAll(this.checked); });
  document.getElementById('qbAddMockBtn').addEventListener('click', function () { openQBPicker('mock'); });
  document.getElementById('qbAddTopicBtn').addEventListener('click', function () { openQBPicker('topic'); });
  document.getElementById('qbClearSelBtn').addEventListener('click', clearQBSelection);

  window.buildQBItem = function buildQBItem(q, i) {
    const item = document.createElement('div'); item.className = 'q-item';
    item.dataset.qid = q.id;

    const head = document.createElement('div'); head.className = 'q-head';
    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'qb-q-check';
    check.value = q.id;
    check._qid = q.id;
    check.title = 'Select this question for a test';
    check.checked = _qbSelected.has(q.id);
    check.addEventListener('change', function () {
      if (this.checked) _qbSelected.add(this._qid);
      else _qbSelected.delete(this._qid);
      item.classList.toggle('qb-selected', this.checked);
      updateQBSelection();
    });
    const num = document.createElement('div'); num.className = 'q-num';
    num.textContent = 'Question ' + (i + 1);
    head.appendChild(check);
    head.appendChild(num);
    item.appendChild(head);
    item.classList.toggle('qb-selected', check.checked);
    if (q.image) {
      const img = document.createElement('img'); img.className = 'q-img'; img.src = imgUrl(q.image); img.alt = 'Question image';
      item.appendChild(img);
    }
    const text = document.createElement('div'); text.className = 'q-text';
    text.textContent = q.question;
    item.appendChild(text);
    const ans = document.createElement('div'); ans.className = 'q-answer';
    ans.innerHTML = '<strong>Answer:</strong> ' + esc(q.options ? q.options[q.answer] : '');
    item.appendChild(ans);
    if (q.explanation || q.expImage) {
      const exp = document.createElement('div'); exp.className = 'q-exp';
      let expHtml = '<strong>Explanation:</strong> ' + esc(q.explanation || '');
      if (q.expImage) expHtml += '<br><img src="' + imgUrl(q.expImage) + '" class="q-img" style="max-width:200px;margin-top:6px;">';
      exp.innerHTML = expHtml;
      item.appendChild(exp);
    }
    return item;
  }

  function renderQBList(qs) {
    renderQBTypeGroups(list, qs);
  }

  renderQBList(qsView);
}

function qbTypeKey(value) {
  return String(value == null ? '' : value).toLowerCase().replace(/[^a-z0-9]/g, '');
}

function qbGroupQuestions(qs, topic) {
  const groups = [];
  const byKey = new Map();
  if (topic) {
    sortedKeys(getTopicTypes(topic)).forEach((typeId, i) => {
      const type = getTopicTypes(topic)[typeId];
      const name = (type && type.name) || typeId;
      const group = { id: typeId, name, order: i + 1, questions: [] };
      groups.push(group);
      byKey.set(qbTypeKey(typeId), group);
      byKey.set(qbTypeKey(name), group);
    });
  }
  const untyped = { id: '__untyped__', name: 'Untyped', order: groups.length + 1, questions: [] };
  const extras = new Map();
  (qs || []).forEach(q => {
    const raw = q && q.type != null ? String(q.type).trim() : '';
    let group = null;
    if (raw) {
      group = byKey.get(qbTypeKey(raw)) || extras.get(qbTypeKey(raw));
      // A question can carry a type value that is no longer registered (legacy
      // data, renamed topic, etc.). Still group it instead of dumping it into
      // "Other" so the type-wise layout never disappears.
      if (!group) {
        group = { id: 'raw:' + raw, name: raw, order: groups.length + extras.size + 1, questions: [], extra: true };
        extras.set(qbTypeKey(raw), group);
        groups.push(group);
        byKey.set(qbTypeKey(raw), group);
      }
    }
    (group || untyped).questions.push(q);
  });
  const result = groups.filter(g => g.questions.length);
  if (untyped.questions.length) result.push(untyped);
  return result;
}

function makeQBTypeAssign(topic, getTargets, rerender) {
  const wrap = document.createElement('span');
  wrap.className = 'qb-type-assign';
  const sel = document.createElement('select');
  sel.className = 'qb-assign-select';
  sel.setAttribute('aria-label', 'Type to assign');
  const placeholder = document.createElement('option');
  placeholder.value = '';
  placeholder.textContent = 'Choose type…';
  sel.appendChild(placeholder);
  sortedKeys(getTopicTypes(topic)).forEach(tid => {
    const type = getTopicTypes(topic)[tid];
    const opt = document.createElement('option');
    opt.value = tid;
    opt.textContent = (type && type.name) || tid;
    sel.appendChild(opt);
  });
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'qb-assign-btn';
  btn.textContent = 'Assign';
  btn.addEventListener('click', function () {
    const typeId = sel.value;
    if (!typeId) { alert('Choose a type first.'); return; }
    const targets = getTargets();
    if (!targets.length) { alert('There are no untyped questions in this topic.'); return; }
    const name = getTypeName(topic, typeId) || typeId;
    if (!confirm('Assign type "' + name + '" to ' + targets.length + ' untyped question(s)?')) return;
    targets.forEach(q => { q.type = typeId; });
    saveData();
    renderDashboard();
    updateStats();
    rerender();
  });
  wrap.appendChild(sel);
  wrap.appendChild(btn);
  return wrap;
}

function refreshQBAfterTypeChange() {
  if (_qbTypeView && _qbTypeView !== 'all') {
    const topic = qbContextTopic();
    const groups = topic ? qbAllGroups(topic) : [];
    const registered = topic && getTopicTypes(topic)[_qbTypeView];
    if (!groups.some(g => g.id === _qbTypeView) && !registered) _qbTypeView = null;
  }
  renderQBView();
}

function renderQBTypeGroups(list, qs) {
  list.innerHTML = '';
  if (!qs.length) {
    list.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>No questions match your search.</p></div>';
    updateQBSelection();
    return;
  }
  const topic = qbContextTopic();
  const typeIds = topic ? sortedKeys(getTopicTypes(topic)) : [];
  const groups = qbGroupQuestions(qs, topic);

  // Drilled into a single type: show only its questions, as a flat list.
  if (topic && _qbTypeView && _qbTypeView !== 'all') {
    const viewGroup = qbAllGroups(topic).find(g => g.id === _qbTypeView);
    if (viewGroup && viewGroup.id === '__untyped__' && typeIds.length) {
      const hint = document.createElement('div');
      hint.className = 'qb-type-hint';
      hint.innerHTML = '<span>These questions have no type yet. Assign one to organise them:</span>';
      hint.appendChild(makeQBTypeAssign(topic, function () {
        return (topic.questions || []).filter(q => !q.type || !getTopicTypes(topic)[q.type]);
      }, refreshQBAfterTypeChange));
      list.appendChild(hint);
    }
    qs.forEach((q, i) => list.appendChild(buildQBItem(q, i)));
    updateQBSelection();
    return;
  }

  const typedGroups = groups.filter(g => g.id !== '__untyped__');
  const untypedGroups = groups.filter(g => g.id === '__untyped__');
  const rerender = refreshQBAfterTypeChange;
  const untypedTargets = function () {
    return (topic ? (topic.questions || []) : qs).filter(q => !q.type || !getTopicTypes(topic)[q.type]);
  };

  // All questions are still untyped: show the type picker so grouping can start.
  if (topic && typeIds.length && !typedGroups.length) {
    const hint = document.createElement('div');
    hint.className = 'qb-type-hint';
    const label = document.createElement('span');
    label.textContent = 'None of the questions shown have a type yet. Assign a type to group them:';
    hint.appendChild(label);
    hint.appendChild(makeQBTypeAssign(topic, untypedTargets, rerender));
    list.appendChild(hint);
    untypedGroups.forEach(group => {
      group.questions.forEach((q, i) => list.appendChild(buildQBItem(q, i)));
    });
    updateQBSelection();
    return;
  }

  // Topics with no types at all: explain why there are no type headers.
  if (topic && !typeIds.length) {
    const hint = document.createElement('div');
    hint.className = 'qb-type-hint info';
    hint.innerHTML = '<i class="fas fa-circle-info"></i> This topic has no types yet. Add types in <strong>Admin → Types</strong> to see type-wise groups.';
    list.appendChild(hint);
    if (!typedGroups.length) {
      let flatNo = 0;
      groups.forEach(group => {
        group.questions.forEach(q => {
          list.appendChild(buildQBItem(q, flatNo));
          flatNo++;
        });
      });
      updateQBSelection();
      return;
    }
  }

  let n = 0;
  let typeNo = 0;
  groups.forEach(group => {
    const section = document.createElement('div');
    section.className = 'qb-type-group';
    const untyped = group.id === '__untyped__';
    if (!untyped) typeNo++;
    const head = document.createElement('div');
    head.className = 'qb-type-head';
    head.innerHTML =
      '<span class="qb-type-index' + (untyped ? ' untyped' : '') + '">' + (untyped ? 'Other' : 'Type ' + typeNo) + '</span>' +
      '<strong>' + esc(group.name) + '</strong>' +
      '<span class="qb-type-count">' + group.questions.length + ' question' + (group.questions.length === 1 ? '' : 's') + '</span>';
    if (untyped && topic && typeIds.length) {
      head.appendChild(makeQBTypeAssign(topic, untypedTargets, rerender));
    }
    section.appendChild(head);
    group.questions.forEach(q => {
      section.appendChild(buildQBItem(q, n));
      n++;
    });
    list.appendChild(section);
  });
  updateQBSelection();
}

function toggleQBSelectAll(checked) {
  document.querySelectorAll('#qbQuestionList .qb-q-check').forEach(cb => {
    cb.checked = checked;
    if (checked) _qbSelected.add(cb._qid);
    else _qbSelected.delete(cb._qid);
    const item = cb.closest('.q-item');
    if (item) item.classList.toggle('qb-selected', checked);
  });
  updateQBSelection();
}

function updateQBSelection() {
  const checks = Array.from(document.querySelectorAll('#qbQuestionList .qb-q-check'));
  const selectedVisible = checks.filter(c => c.checked).length;
  const all = document.getElementById('qbSelectAll');
  if (all) {
    all.disabled = checks.length === 0;
    all.checked = checks.length > 0 && selectedVisible === checks.length;
    all.indeterminate = selectedVisible > 0 && selectedVisible < checks.length;
  }
  const count = document.getElementById('qbSelectedCount');
  if (count) count.textContent = _qbSelected.size + ' selected';
  const disabled = _qbSelected.size === 0;
  ['qbAddMockBtn', 'qbAddTopicBtn', 'qbClearSelBtn'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.disabled = disabled;
  });
}

function clearQBSelection() {
  _qbSelected = new Set();
  document.querySelectorAll('#qbQuestionList .qb-q-check').forEach(cb => {
    cb.checked = false;
    const item = cb.closest('.q-item');
    if (item) item.classList.remove('qb-selected');
  });
  hideQBPicker();
  updateQBSelection();
}

function hideQBPicker() {
  const picker = document.getElementById('qbPicker');
  if (picker) { picker.classList.add('hidden'); picker.innerHTML = ''; }
  _qbPickerType = null;
}

function qbPickerTopicInfo() {
  if (!_qbContext) return null;
  const cat = data.categories[_qbContext.catId];
  const sub = cat && cat.subcategories[_qbContext.subId];
  const topic = sub && sub.topics[_qbContext.topicId];
  return (cat && sub && topic) ? { cat, sub, topic } : null;
}

function openQBPicker(type) {
  if (!_qbSelected.size) { alert('Select at least one question first.'); return; }
  const picker = document.getElementById('qbPicker');
  const info = qbPickerTopicInfo();
  if (!picker || !info) return;
  _qbPickerType = type;
  const count = _qbSelected.size;
  const defaultName = type === 'mock'
    ? info.topic.name + ' — Custom Mock'
    : info.topic.name + ' — Custom Topic Test';
  const defaultDuration = Math.max(5, count);
  const noun = type === 'mock' ? 'mock' : 'topic';

  let html = '<div class="qb-picker-head"><strong>Add ' + count + ' selected question' + (count === 1 ? '' : 's') + ' to a ' + noun + ' test</strong>' +
    '<button type="button" class="qb-picker-close" id="qbPickerClose" aria-label="Close"><i class="fas fa-times"></i></button></div>';

  html += '<select id="qbPickTarget">';
  html += '<option value="new">➕ Create a new ' + noun + ' test</option>';
  if (type === 'mock') {
    mockTests.forEach((t, i) => {
      const n = (t.questionIds || []).length;
      html += '<option value="' + i + '">' + esc(t.name) + ' — ' + n + ' question' + (n === 1 ? '' : 's') + '</option>';
    });
  } else {
    topicTests.forEach((t, i) => {
      if (t.catId !== _qbContext.catId || t.subId !== _qbContext.subId || t.topicId !== _qbContext.topicId) return;
      const n = (t.questionIds || []).length;
      html += '<option value="' + i + '">' + esc(t.name) + ' — ' + n + ' question' + (n === 1 ? '' : 's') + '</option>';
    });
  }
  html += '</select>';

  html += '<div class="qb-picker-new" id="qbPickerNewFields">';
  html += '<input type="text" id="qbNewTestName" placeholder="Test name" value="' + esc(defaultName) + '">';
  html += '<input type="number" id="qbNewTestDuration" placeholder="Minutes" value="' + defaultDuration + '" min="1">';
  html += '<input type="number" id="qbNewTestMarks" placeholder="Marks" value="' + count + '" min="1">';
  html += '</div>';

  html += '<div class="qb-picker-actions">';
  html += '<button type="button" class="qb-action-btn qb-action-primary" id="qbPickerConfirm"><i class="fas fa-plus"></i> Add selected</button>';
  html += '<button type="button" class="qb-action-btn" id="qbPickerCancel">Cancel</button>';
  html += '</div>';

  picker.innerHTML = html;
  picker.classList.remove('hidden');

  const target = document.getElementById('qbPickTarget');
  const newFields = document.getElementById('qbPickerNewFields');
  target.addEventListener('change', function () {
    newFields.classList.toggle('hidden', this.value !== 'new');
  });
  document.getElementById('qbPickerClose').addEventListener('click', hideQBPicker);
  document.getElementById('qbPickerCancel').addEventListener('click', hideQBPicker);
  document.getElementById('qbPickerConfirm').addEventListener('click', function () { confirmQBPicker(type); });
  picker.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function confirmQBPicker(type) {
  const info = qbPickerTopicInfo();
  if (!info || !_qbSelected.size) return;
  const ids = Array.from(_qbSelected);
  const targetVal = document.getElementById('qbPickTarget').value;
  let test = null;
  let added = 0;
  let created = false;

  if (type === 'mock') {
    if (targetVal === 'new') {
      const name = (document.getElementById('qbNewTestName').value || '').trim();
      if (!name) { alert('Enter a name for the new mock test.'); return; }
      const duration = parseInt(document.getElementById('qbNewTestDuration').value, 10) || Math.max(5, ids.length);
      const marks = parseInt(document.getElementById('qbNewTestMarks').value, 10) || ids.length;
      test = {
        id: Date.now(),
        name,
        subtitle: info.cat.name + ' › ' + info.sub.name + ' · Custom Mock',
        duration,
        totalMarks: marks,
        questionIds: ids.slice()
      };
      mockTests.push(test);
      added = ids.length;
      created = true;
    } else {
      test = mockTests[parseInt(targetVal, 10)];
      if (!test) return;
      if (!Array.isArray(test.questionIds)) test.questionIds = [];
      const existing = new Set(test.questionIds.map(String));
      ids.forEach(id => {
        if (!existing.has(String(id))) { test.questionIds.push(id); existing.add(String(id)); added++; }
      });
      if (!added) { alert('Those questions are already in "' + test.name + '".'); return; }
      if (test.totalMarks === test.questionIds.length - added) test.totalMarks = test.questionIds.length;
    }
  } else {
    if (targetVal === 'new') {
      const name = (document.getElementById('qbNewTestName').value || '').trim();
      if (!name) { alert('Enter a name for the new topic test.'); return; }
      const duration = parseInt(document.getElementById('qbNewTestDuration').value, 10) || Math.max(5, ids.length);
      const marks = parseInt(document.getElementById('qbNewTestMarks').value, 10) || ids.length;
      test = {
        id: 'topiccustom:' + Date.now() + ':' + Math.floor(Math.random() * 10000),
        name,
        duration,
        totalMarks: marks,
        catId: _qbContext.catId,
        subId: _qbContext.subId,
        topicId: _qbContext.topicId,
        subtitle: 'Topic-wise Test · ' + info.cat.name + ' › ' + info.sub.name + ' › ' + info.topic.name,
        questionIds: ids.slice(),
        custom: true
      };
      topicTests.push(test);
      added = ids.length;
      created = true;
    } else {
      test = topicTests[parseInt(targetVal, 10)];
      if (!test) return;
      if (!Array.isArray(test.questionIds)) test.questionIds = [];
      const existing = new Set(test.questionIds.map(String));
      ids.forEach(id => {
        if (!existing.has(String(id))) { test.questionIds.push(id); existing.add(String(id)); added++; }
      });
      if (!added) { alert('Those questions are already in "' + test.name + '".'); return; }
      if (test.totalMarks === test.questionIds.length - added) test.totalMarks = test.questionIds.length;
    }
  }

  saveData();
  const message = created
    ? 'Created "' + test.name + '" with ' + added + ' question' + (added === 1 ? '' : 's') + '.'
    : 'Added ' + added + ' question' + (added === 1 ? '' : 's') + ' to "' + test.name + '".';
  clearQBSelection();
  alert(message);
}

function filterQBQuestions(val) {
  const q = val.toLowerCase().trim();
  const qs = window._qbAllQs || [];
  const list = document.getElementById('qbQuestionList');
  if (!list) return;
  const filtered = qs.filter(x => x.question.toLowerCase().includes(q) || (x.explanation || '').toLowerCase().includes(q));
  renderQBTypeGroups(list, filtered);
}

// ======================== E-BOOK ========================
let _ebookCategory = 'All';
let _ebookLanguage = 'All';
let _selectedEbookIdx = -1;

function getEbookExams() {
  data.exams = normalizeNameList(data.exams, DEFAULT_EBOOK_EXAMS);
  return data.exams;
}

function getEbookLanguages() {
  data.languages = normalizeNameList(data.languages, DEFAULT_EBOOK_LANGUAGES);
  return data.languages;
}

function ebookFallback(type) {
  const values = type === 'exam' ? getEbookExams() : getEbookLanguages();
  if (type === 'exam' && values.includes('Others')) return 'Others';
  return values[0] || (type === 'exam' ? DEFAULT_EBOOK_EXAMS[0] : DEFAULT_EBOOK_LANGUAGES[0]);
}

function ebookCategory(ebook) {
  const exams = getEbookExams();
  const value = String((ebook && ebook.category) || '').trim();
  return exams.includes(value) ? value : ebookFallback('exam');
}

function ebookLanguage(ebook) {
  const languages = getEbookLanguages();
  const value = String((ebook && ebook.language) || '').trim();
  return languages.includes(value) ? value : ebookFallback('language');
}

function ebookCollectionValues(type) {
  return type === 'exam' ? getEbookExams() : getEbookLanguages();
}

function ebookMatchesCollection(ebook, type, name) {
  return type === 'exam' ? ebookCategory(ebook) === name : ebookLanguage(ebook) === name;
}

function setEbookCollectionValue(ebook, type, name) {
  if (type === 'exam') ebook.category = name;
  else ebook.language = name;
}

function ebookCollectionCount(type, name) {
  return (data.ebooks || []).filter(ebook => ebookMatchesCollection(ebook, type, name)).length;
}

function addEbookCollectionItem(type) {
  const input = document.getElementById(type === 'exam' ? 'adminExamInput' : 'adminLanguageInput');
  if (!input) return;
  const value = input.value.trim();
  if (!value) { alert('Enter an exam or language name.'); return; }
  const values = ebookCollectionValues(type);
  if (values.some(item => item.toLowerCase() === value.toLowerCase())) {
    alert('"' + value + '" already exists.');
    return;
  }
  values.push(value);
  saveData();
  renderAdmin();
}

function editEbookCollectionItem(type, index) {
  const values = ebookCollectionValues(type);
  const oldName = values[index];
  if (!oldName) return;
  const value = prompt((type === 'exam' ? 'Exam' : 'Language') + ' name:', oldName);
  if (value === null) return;
  const newName = value.trim();
  if (!newName) { alert('Name cannot be empty.'); return; }
  if (newName.toLowerCase() !== oldName.toLowerCase() && values.some(item => item.toLowerCase() === newName.toLowerCase())) {
    alert('"' + newName + '" already exists.');
    return;
  }
  if (newName === oldName) return;
  values[index] = newName;
  (data.ebooks || []).forEach(ebook => {
    if (ebookMatchesCollection(ebook, type, oldName)) setEbookCollectionValue(ebook, type, newName);
  });
  if (type === 'exam' && _ebookCategory === oldName) _ebookCategory = newName;
  if (type === 'language' && _ebookLanguage === oldName) _ebookLanguage = newName;
  saveData();
  renderAdmin();
}

function deleteEbookCollectionItem(type, index) {
  const values = ebookCollectionValues(type);
  const oldName = values[index];
  if (!oldName) return;
  if (values.length <= 1) {
    alert('Keep at least one ' + (type === 'exam' ? 'exam' : 'language') + '.');
    return;
  }
  const affected = ebookCollectionCount(type, oldName);
  const fallback = values.filter((_, i) => i !== index).includes('Others') && type === 'exam'
    ? 'Others'
    : values.filter((_, i) => i !== index)[0];
  if (affected && !confirm(affected + ' e-book(s) use "' + oldName + '". Move them to "' + fallback + '"?')) return;
  values.splice(index, 1);
  (data.ebooks || []).forEach(ebook => {
    if (ebookMatchesCollection(ebook, type, oldName)) setEbookCollectionValue(ebook, type, fallback);
  });
  if (type === 'exam' && _ebookCategory === oldName) _ebookCategory = 'All';
  if (type === 'language' && _ebookLanguage === oldName) _ebookLanguage = 'All';
  saveData();
  renderAdmin();
}

function renderEbookCollectionList(type) {
  const values = ebookCollectionValues(type);
  return values.map((name, index) => {
    const count = ebookCollectionCount(type, name);
    return '<div class="admin-option-row"><div><span class="admin-option-name">' + esc(name) + '</span><span class="admin-option-count">' + count + ' E-Book' + (count === 1 ? '' : 's') + '</span></div><span><button type="button" class="act-btn edit" onclick="editEbookCollectionItem(\'' + type + '\',' + index + ')" aria-label="Edit"><i class="fas fa-pen"></i></button><button type="button" class="act-btn del" onclick="deleteEbookCollectionItem(\'' + type + '\',' + index + ')" aria-label="Delete"><i class="fas fa-trash"></i></button></span></div>';
  }).join('');
}

function ebookSelectOptionsHtml(values, selected) {
  return values.map(value => '<option value="' + esc(value) + '"' + (value === selected ? ' selected' : '') + '>' + esc(value) + '</option>').join('');
}

function ebookSelectHtml(id, values, selected) {
  const preferred = selected && values.includes(selected)
    ? selected
    : (values.includes('Others') ? 'Others' : values[0]);
  return '<select id="' + id + '">' + values.map(value => '<option value="' + esc(value) + '"' + (value === preferred ? ' selected' : '') + '>' + esc(value) + '</option>').join('') + '</select>';
}

function ebookLanguageSelectHtml(id, selected) {
  const values = getEbookLanguages();
  const preferred = selected && values.includes(selected) ? selected : (values.includes('English') ? 'English' : values[0]);
  return '<select id="' + id + '">' + values.map(value => '<option value="' + esc(value) + '"' + (value === preferred ? ' selected' : '') + '>' + esc(value) + '</option>').join('') + '</select>';
}

function ebookPagesText(ebook) {
  const pages = parseInt(ebook && ebook.pages, 10);
  return pages > 0 ? pages + ' Pages' : '';
}

function ebookSizeText(ebook) {
  return String((ebook && ebook.size) || '').trim();
}

function ebookFilterMatches(ebook) {
  const category = ebookCategory(ebook);
  const language = ebookLanguage(ebook);
  return (_ebookCategory === 'All' || category === _ebookCategory) && (_ebookLanguage === 'All' || language === _ebookLanguage);
}

function ebookCoverHTML(ebook, type) {
  const title = (ebook && ebook.name) || 'Study Material';
  if (ebook && ebook.cover) {
    return '<img class="ebook-cover-image" src="' + esc(ebook.cover) + '" alt="' + esc(title) + ' cover">';
  }
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = ((hash << 5) - hash) + title.charCodeAt(i);
  const hue = Math.abs(hash) % 360;
  const klass = type === 'modal' ? 'ebook-cover-generated ebook-cover-generated-large' : 'ebook-cover-generated';
  return '<div class="' + klass + '" style="--cover-hue:' + hue + '">' +
    '<div class="ebook-cover-brand">STUDY HUB</div>' +
    '<div class="ebook-cover-title">' + esc(title) + '</div>' +
    '<div class="ebook-cover-rule"></div>' +
    '<div class="ebook-cover-foot">' + esc(ebookCategory(ebook)) + ' · ' + esc(ebookLanguage(ebook)) + '</div>' +
    '</div>';
}

function ebookAllFilters(type) {
  return ['All'].concat(type === 'exam' ? getEbookExams() : getEbookLanguages());
}

function setEbookFilter(type, value) {
  if (type === 'category' && ebookAllFilters('exam').includes(value)) _ebookCategory = value;
  if (type === 'language' && ebookAllFilters('language').includes(value)) _ebookLanguage = value;
  renderEbook();
}

function clearEbookFilters() {
  _ebookCategory = 'All';
  _ebookLanguage = 'All';
  renderEbook();
}

function renderEbookFilterButtons(values, active, type) {
  return values.map(value => '<button type="button" class="ebook-filter-pill' + (active === value ? ' active' : '') + '" onclick="setEbookFilter(\'' + type + '\', \'' + value + '\')">' + esc(value) + '</button>').join('');
}

function renderEbook() {
  const container = document.getElementById('ebookList');
  if (!container) return;
  const ebooks = Array.isArray(data.ebooks) ? data.ebooks : [];
  if (!ebooks.length) {
    container.innerHTML = '<div class="empty-state ebook-library-empty"><i class="fas fa-book-open"></i><p>No e-books published yet.</p></div>';
    return;
  }
  const visible = ebooks.map((ebook, index) => ({ ebook, index })).filter(item => ebookFilterMatches(item.ebook));
  const total = visible.length;
  let html = '<div class="ebook-library">';
  html += '<div class="ebook-filter-panel"><div class="ebook-filter-block"><span class="ebook-filter-label">Exam</span><div class="ebook-filter-row">' + renderEbookFilterButtons(ebookAllFilters('exam'), _ebookCategory, 'category') + '</div></div>';
  html += '<div class="ebook-filter-block"><span class="ebook-filter-label">Language</span><div class="ebook-filter-row">' + renderEbookFilterButtons(ebookAllFilters('language'), _ebookLanguage, 'language') + '</div></div></div>';
  html += '<div class="ebook-results-head"><div><strong>' + esc(_ebookCategory) + '</strong> e-books</div><span>' + total + ' result' + (total === 1 ? '' : 's') + '</span></div>';

  if (!visible.length) {
    html += '<div class="ebook-empty-filter"><i class="fas fa-filter-circle-xmark"></i><p>No e-books in this filter yet.</p><button type="button" class="btn-secondary" onclick="clearEbookFilters()">Clear filters</button></div></div>';
    container.innerHTML = html;
    return;
  }

  html += '<div class="ebook-grid">';
  visible.forEach(({ ebook, index }) => {
    const meta = [ebookPagesText(ebook), ebookSizeText(ebook)].filter(Boolean).join(' · ');
    html += '<article class="ebook-shop-card"><div class="ebook-cover">' + ebookCoverHTML(ebook, 'card') + '</div>';
    html += '<div class="ebook-shop-body"><div class="ebook-card-tags"><span>' + esc(ebookCategory(ebook)) + '</span><span>' + esc(ebookLanguage(ebook)) + '</span></div>';
    html += '<h3 class="ebook-shop-title">' + esc(ebook.name) + '</h3>';
    html += '<div class="ebook-shop-meta">' + esc(meta || 'PDF e-book') + '</div>';
    html += '<button type="button" class="ebook-read-btn" onclick="openEbookModal(' + index + ')">Read more <i class="fas fa-arrow-right"></i></button></div></article>';
  });
  html += '</div></div>';
  container.innerHTML = html;
}

function openEbookModal(idx) {
  const ebook = data.ebooks[idx];
  if (!ebook) return;
  _selectedEbookIdx = idx;
  const modal = document.getElementById('ebookModal');
  const cover = document.getElementById('ebookModalCover');
  const chips = document.getElementById('ebookModalChips');
  const title = document.getElementById('ebookModalTitle');
  const meta = document.getElementById('ebookModalMeta');
  const description = document.getElementById('ebookModalDescription');
  const view = document.getElementById('ebookModalView');
  const download = document.getElementById('ebookModalDownload');
  if (!modal || !cover || !chips || !title || !meta || !description || !view || !download) return;

  cover.innerHTML = ebookCoverHTML(ebook, 'modal');
  chips.innerHTML = '<span>' + esc(ebookCategory(ebook)) + '</span><span>' + esc(ebookLanguage(ebook)) + '</span><span>PDF</span>';
  title.textContent = ebook.name;
  meta.textContent = [ebookPagesText(ebook), ebookSizeText(ebook), ebook.uploaded ? 'Added ' + ebook.uploaded : ''].filter(Boolean).join(' · ');
  description.textContent = (ebook.description || '').trim();
  description.hidden = !description.textContent;
  view.onclick = function () { openPdf(idx, false); };
  download.onclick = function () { openPdf(idx, true); };
  modal.classList.remove('hidden');
  document.body.classList.add('modal-open');
}

function closeEbookModal() {
  const modal = document.getElementById('ebookModal');
  if (modal) modal.classList.add('hidden');
  document.body.classList.remove('modal-open');
}

function renderAdminEbook(container) {
  const apiKey = localStorage.getItem('gdrive_api_key') || '';
  let html = '<div class="admin-section"><div class="admin-section-head"><div><h3>Exams &amp; Languages</h3><p>Control the filter categories shown in the public E-Book library.</p></div></div>';
  html += '<div class="admin-split">';

  html += '<div class="admin-subsection">';
  html += '<div class="admin-subsection-head"><div><h4>Exams</h4><span>' + getEbookExams().length + ' configured</span></div></div>';
  html += '<div class="admin-inline-add"><input type="text" id="adminExamInput" placeholder="Add exam (e.g. IBPS)"><button type="button" class="btn-secondary" id="adminAddExamBtn"><i class="fas fa-plus"></i> Add Exam</button></div>';
  html += '<div id="adminExamList" class="admin-option-list">' + renderEbookCollectionList('exam') + '</div>';
  html += '</div>';

  html += '<div class="admin-subsection">';
  html += '<div class="admin-subsection-head"><div><h4>Languages</h4><span>' + getEbookLanguages().length + ' configured</span></div></div>';
  html += '<div class="admin-inline-add"><input type="text" id="adminLanguageInput" placeholder="Add language (e.g. Marathi)"><button type="button" class="btn-secondary" id="adminAddLanguageBtn"><i class="fas fa-plus"></i> Add Language</button></div>';
  html += '<div id="adminLanguageList" class="admin-option-list">' + renderEbookCollectionList('language') + '</div>';
  html += '</div>';

  html += '</div></div>';
  html += '<div class="admin-section"><h3>Add E-Book</h3>';
  html += '<div class="admin-row" style="flex-wrap:wrap;gap:8px;"><input type="text" id="ebookName" placeholder="E-Book name" style="flex:2;min-width:220px;">';
  html += '<input type="text" id="ebookManualUrl" placeholder="Paste a Google Drive / direct PDF URL" style="flex:2;min-width:260px;"></div>';
  html += '<div class="admin-row" style="flex-wrap:wrap;gap:8px;"><div style="flex:1;min-width:135px;">' + ebookSelectHtml('ebookCategory', getEbookExams()) + '</div>';
  html += '<div style="flex:1;min-width:110px;">' + ebookLanguageSelectHtml('ebookLanguage') + '</div>';
  html += '<input type="number" id="ebookPages" min="1" placeholder="Pages" style="width:100px;"><input type="text" id="ebookSize" placeholder="Size (e.g. 2.02 MB)" style="flex:1;min-width:130px;"><input type="text" id="ebookCover" placeholder="Cover image URL (optional)" style="flex:2;min-width:220px;"><button class="btn-secondary" id="ebookAddUrlBtn"><i class="fas fa-plus"></i> Add E-Book</button></div>';
  html += '<div class="admin-row" style="flex-wrap:wrap;gap:8px;"><input type="text" id="ebookDescription" placeholder="Short description (optional)" style="flex:1;min-width:300px;"></div></div>';
  html += '<div class="admin-section"><h3>Linked Drive Folders</h3>';
  html += '<div class="admin-row" style="flex-wrap:wrap;gap:8px;">';
  html += '<input type="text" id="driveFolderName" placeholder="Label (e.g. Maths Books)" style="flex:1;min-width:140px;">';
  html += '<input type="text" id="driveFolderLink" placeholder="Google Drive folder URL or ID" style="flex:2;min-width:200px;">';
  html += '<input type="text" id="driveFolderApiKey" placeholder="API Key (one-time)" style="flex:1;min-width:140px;" value="' + esc(apiKey) + '">';
  html += '<button class="btn-secondary" id="linkDriveFolderBtn"><i class="fas fa-folder-plus"></i> Link Folder</button></div>';
  html += '<div id="driveFolderList"></div></div>';
  html += '<div class="admin-section"><h3>All E-Books <span style="font-weight:400;font-size:13px;color:var(--text2);">(' + (data.ebooks || []).length + ')</span></h3><div id="adminEbookList"></div></div>';
  container.innerHTML = html;
  document.getElementById('ebookAddUrlBtn').addEventListener('click', addEbookUrl);
  document.getElementById('linkDriveFolderBtn').addEventListener('click', linkDriveFolder);
  document.getElementById('adminAddExamBtn').addEventListener('click', () => addEbookCollectionItem('exam'));
  document.getElementById('adminAddLanguageBtn').addEventListener('click', () => addEbookCollectionItem('language'));
  document.getElementById('adminExamInput').addEventListener('keydown', event => { if (event.key === 'Enter') addEbookCollectionItem('exam'); });
  document.getElementById('adminLanguageInput').addEventListener('keydown', event => { if (event.key === 'Enter') addEbookCollectionItem('language'); });
  renderDriveFolders();
  renderEbookList(true, 'adminEbookList');
}

function linkDriveFolder() {
  const name = document.getElementById('driveFolderName').value.trim();
  const folderInput = document.getElementById('driveFolderLink').value.trim();
  let apiKey = document.getElementById('driveFolderApiKey').value.trim();
  if (apiKey) localStorage.setItem('gdrive_api_key', apiKey);
  if (!apiKey) apiKey = localStorage.getItem('gdrive_api_key');
  let folderId = folderInput;
  const m = folderInput.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (m) folderId = m[1];
  if (!name || !folderId) { alert('Enter a folder name and URL.'); return; }
  if (!apiKey) { alert('Enter your Google Drive API key first.'); return; }
  if (!data.driveFolders) data.driveFolders = [];
  if (data.driveFolders.some(f => f.folderId === folderId)) { alert('Folder already linked.'); return; }
  data.driveFolders.push({ id: Date.now(), name, folderId });
  saveData();
  document.getElementById('driveFolderName').value = '';
  document.getElementById('driveFolderLink').value = '';
  renderDriveFolders();
}

async function renderDriveFolders() {
  const container = document.getElementById('driveFolderList');
  const apiKey = localStorage.getItem('gdrive_api_key');
  if (!data.driveFolders || !data.driveFolders.length) {
    container.innerHTML = '<p style="color:var(--text2);font-size:13px;margin-top:8px;">No folders linked yet.</p>';
    return;
  }
  let html = '';
  for (const folder of data.driveFolders) {
    const idx = data.driveFolders.indexOf(folder);
    html += '<div class="admin-item" style="flex-direction:column;align-items:stretch;gap:6px;margin-top:8px;">';
    html += '<div style="display:flex;align-items:center;gap:8px;"><strong><i class="fas fa-folder"></i> ' + esc(folder.name) + '</strong>';
    html += '<button class="del-btn" onclick="unlinkDriveFolder(' + idx + ')" style="margin-left:auto;">Unlink</button></div>';
    if (apiKey) {
      try {
        const pdfs = await scanDriveFolder(folder.folderId, apiKey);
        if (pdfs.length) {
          const defaultCategory = ebookFallback('exam');
          const defaultLanguage = ebookFallback('language');
          const examOptions = ebookSelectOptionsHtml(getEbookExams(), defaultCategory);
          const languageOptions = ebookSelectOptionsHtml(getEbookLanguages(), defaultLanguage);
          html += '<div class="drive-folder-import">';
          html += '<div class="folder-import-toolbar"><label>Exam <select class="folder-default-category">' + ebookSelectOptionsHtml(getEbookExams(), defaultCategory) + '</select></label><label>Language <select class="folder-default-language">' + ebookSelectOptionsHtml(getEbookLanguages(), defaultLanguage) + '</select></label><button type="button" class="act-btn edit folder-apply-defaults" onclick="applyFolderImportDefaults(this)"><i class="fas fa-check-double"></i> Apply to rows</button></div>';
          html += '<div class="admin-import-list">';
          pdfs.forEach(f => {
            const defaultName = String(f.name || '').replace(/\.pdf$/i, '').trim() || 'Untitled E-Book';
            const exists = data.ebooks.some(e => e.url && e.url.includes(f.id));
            html += '<div class="admin-import-row' + (exists ? ' admin-import-row-locked' : '') + '" data-id="' + esc(f.id) + '">';
            html += '<div class="admin-import-source"><label><input type="checkbox" class="folder-pdf-check" data-id="' + esc(f.id) + '"' + (exists ? ' checked disabled' : '') + '> <span class="folder-pdf-source-name">' + esc(f.name) + '</span>' + (exists ? '<small>(added)</small>' : '') + '</label></div>';
            html += '<input type="text" class="folder-pdf-name" value="' + esc(defaultName) + '" placeholder="E-Book name"' + (exists ? ' disabled' : '') + '>';
            html += '<select class="folder-pdf-category"' + (exists ? ' disabled' : '') + '>' + examOptions + '</select>';
            html += '<select class="folder-pdf-language"' + (exists ? ' disabled' : '') + '>' + languageOptions + '</select>';
            html += '</div>';
          });
          html += '</div><div class="admin-import-footer"><button class="btn-primary" onclick="addSelectedFromFolder(this)"><i class="fas fa-plus"></i> Add Selected</button></div></div>';
        } else {
          html += '<p style="color:var(--text2);font-size:12px;margin-left:20px;margin-top:4px;">No PDFs found. Make sure the folder is shared publicly.</p>';
        }
      } catch (e) {
        html += '<p style="color:var(--danger);font-size:12px;margin-left:20px;margin-top:4px;">Error: ' + esc(e.message) + '</p>';
      }
    } else {
      html += '<p style="color:var(--text2);font-size:12px;margin-left:20px;margin-top:4px;">Enter your API key above and click Link Folder.</p>';
    }
    html += '</div>';
  }
  container.innerHTML = html;
}

async function scanDriveFolder(folderId, apiKey) {
  const pdfs = [];
  async function scan(id) {
    const res = await fetch('https://www.googleapis.com/drive/v3/files?q=\'' + id + '\'+in+parents&key=' + apiKey + '&fields=files(id,name,mimeType)');
    const d = await res.json();
    if (d.error) throw new Error(d.error.message);
    if (!d.files) return;
    for (const f of d.files) {
      if (f.mimeType === 'application/vnd.google-apps.folder') await scan(f.id);
      else if (f.mimeType === 'application/pdf') pdfs.push(f);
    }
  }
  await scan(folderId);
  return pdfs;
}

async function unlinkDriveFolder(idx) {
  if (!confirm('Unlink "' + data.driveFolders[idx].name + '"?')) return;
  data.driveFolders.splice(idx, 1);
  await saveData();
  renderDriveFolders();
}

function applyFolderImportDefaults(button) {
  const scope = button && button.closest('.drive-folder-import');
  if (!scope) return;
  const category = scope.querySelector('.folder-default-category')?.value;
  const language = scope.querySelector('.folder-default-language')?.value;
  scope.querySelectorAll('.admin-import-row:not(.admin-import-row-locked)').forEach(row => {
    const categorySelect = row.querySelector('.folder-pdf-category');
    const languageSelect = row.querySelector('.folder-pdf-language');
    if (category && categorySelect) categorySelect.value = category;
    if (language && languageSelect) languageSelect.value = language;
  });
}

async function addSelectedFromFolder(button) {
  const scope = button && button.closest('.drive-folder-import');
  const rows = Array.from((scope || document).querySelectorAll('.admin-import-row'));
  const selected = rows.filter(row => {
    const check = row.querySelector('.folder-pdf-check');
    return check && check.checked && !check.disabled && !row.classList.contains('admin-import-row-locked');
  });
  if (!selected.length) { alert('Select at least one new PDF.'); return; }

  const plans = [];
  for (const row of selected) {
    const id = row.dataset.id;
    const nameInput = row.querySelector('.folder-pdf-name');
    const name = nameInput ? nameInput.value.trim() : '';
    const category = row.querySelector('.folder-pdf-category')?.value || ebookFallback('exam');
    const language = row.querySelector('.folder-pdf-language')?.value || ebookFallback('language');
    if (!name) {
      alert('Enter an E-Book name for every selected PDF.');
      if (nameInput) nameInput.focus();
      return;
    }
    plans.push({ id, name, url: 'https://drive.google.com/uc?export=download&id=' + id, category, language });
  }

  plans.forEach((plan, index) => {
    data.ebooks.push({
      id: Date.now() + Math.floor(Math.random() * 10000) + index,
      name: plan.name,
      url: plan.url,
      uploaded: new Date().toLocaleDateString(),
      category: plan.category,
      language: plan.language,
      pages: '',
      size: '',
      cover: '',
      description: ''
    });
  });
  await saveData();
  renderAdmin();
  alert('Added ' + plans.length + ' E-Book' + (plans.length === 1 ? '' : 's') + ' from Drive.');
}

function addEbookUrl() {
  const name = document.getElementById('ebookName').value.trim();
  let url = document.getElementById('ebookManualUrl').value.trim();
  if (!name) { alert('Enter an e-book name.'); return; }
  if (!url) { alert('Paste a URL.'); return; }
  // Convert Google Drive share link to direct download
  const m = url.match(/drive\.google\.com\/.*[?&]id=([^&]+)/) || url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (m) url = 'https://drive.google.com/uc?export=download&id=' + m[1];
  data.ebooks.push({
    id: Date.now(),
    name,
    url,
    uploaded: new Date().toLocaleDateString(),
    category: document.getElementById('ebookCategory')?.value || 'Others',
    language: document.getElementById('ebookLanguage')?.value || 'English',
    pages: parseInt(document.getElementById('ebookPages')?.value, 10) || '',
    size: (document.getElementById('ebookSize')?.value || '').trim(),
    cover: (document.getElementById('ebookCover')?.value || '').trim(),
    description: (document.getElementById('ebookDescription')?.value || '').trim()
  });
  saveData();
  ['ebookName', 'ebookManualUrl', 'ebookPages', 'ebookSize', 'ebookCover', 'ebookDescription'].forEach(id => {
    const el = document.getElementById(id); if (el) el.value = '';
  });
  renderEbookList(true, 'adminEbookList');
}

function renderEbookList(showDelete, containerId) {
  const container = document.getElementById(containerId);
  if (!data.ebooks.length) {
    container.innerHTML = '<div class="empty-state" style="padding:20px;"><i class="fas fa-book-open"></i><p>No e-books uploaded yet.</p></div>';
    return;
  }
  container.innerHTML = data.ebooks.map((e, i) => {
    const meta = [ebookCategory(e), ebookLanguage(e), ebookPagesText(e), ebookSizeText(e)].filter(Boolean).join(' · ');
    const thumbnail = e.cover
      ? '<img class="ebook-admin-cover" src="' + esc(e.cover) + '" alt="">'
      : '<div class="ebook-admin-cover ebook-admin-cover-fallback"><i class="fas fa-file-pdf"></i></div>';
    let actions = '<button class="btn-secondary" onclick="openPdf(' + i + ',false)"><i class="fas fa-eye"></i> View</button>';
    if (showDelete) {
      actions += '<button class="act-btn edit" onclick="editEbook(' + i + ')" title="Edit details"><i class="fas fa-pen"></i></button>';
      actions += '<button class="act-btn del" onclick="delEbook(' + i + ')" title="Delete"><i class="fas fa-trash"></i></button>';
    }
    return '<div class="ebook-card"><div class="ebook-info">' + thumbnail + '<div><div class="ebook-name">' + esc(e.name) + '</div><div class="ebook-meta">' + esc(meta || e.uploaded) + '</div></div></div><div class="ebook-actions">' + actions + '</div></div>';
  }).join('');
}

function openPdf(idx, download) {
  const ebook = data.ebooks[idx];
  if (!ebook) return;
  if (download) {
    const a = document.createElement('a');
    a.href = ebook.url;
    a.download = ebook.name + '.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } else {
    window.open(viewUrl(ebook.url), '_blank');
  }
}

function viewUrl(url) {
  const m = url && url.match(/[?&]id=([^&]+)/);
  if (m) return 'https://drive.google.com/file/d/' + m[1] + '/preview';
  return url;
}

function delEbook(idx) {
  if (!confirm('Delete "' + data.ebooks[idx].name + '"?')) return;
  data.ebooks.splice(idx, 1);
  saveData();
  const activeTab = document.querySelector('.admin-tab.active');
  if (activeTab && activeTab.dataset.admin === 'ebook') renderAdmin();
  else renderEbook();
}

function editEbook(idx) {
  const ebook = data.ebooks[idx];
  if (!ebook) return;
  const name = prompt('E-Book title:', ebook.name);
  if (name === null) return;
  if (!name.trim()) { alert('Title cannot be empty.'); return; }
  const knownCategories = getEbookExams();
  const knownLanguages = getEbookLanguages();
  const category = prompt('Category (' + knownCategories.join(', ') + '):', ebookCategory(ebook));
  if (category === null) return;
  const language = prompt('Language (' + knownLanguages.join(', ') + '):', ebookLanguage(ebook));
  if (language === null) return;
  const pages = prompt('Number of pages:', ebook.pages || '');
  if (pages === null) return;
  const size = prompt('File size (e.g. 2.02 MB):', ebook.size || '');
  if (size === null) return;
  const cover = prompt('Cover image URL (leave blank for a generated cover):', ebook.cover || '');
  if (cover === null) return;
  const description = prompt('Short description (optional):', ebook.description || '');
  if (description === null) return;

  const normalizedCategoryValue = String(category || '').trim();
  const normalizedCategory = knownCategories.find(item => item.toLowerCase() === normalizedCategoryValue.toLowerCase()) || ebookFallback('exam');
  const normalizedLanguageValue = String(language || '').trim().toLowerCase();
  const normalizedLanguage = knownLanguages.find(item => item.toLowerCase() === normalizedLanguageValue) || ebookFallback('language');
  ebook.name = name.trim();
  ebook.category = normalizedCategory;
  ebook.language = normalizedLanguage;
  ebook.pages = parseInt(pages, 10) || '';
  ebook.size = String(size || '').trim();
  ebook.cover = String(cover || '').trim();
  ebook.description = String(description || '').trim();
  saveData();
  renderEbookList(true, 'adminEbookList');
  if (document.getElementById('ebookList')) renderEbook();
}

// ======================== ADMIN ========================
// Question types are user-defined under each topic:
// Category › Subcategory › Topic › Type › Questions
function getTopicTypes(topic) {
  return (topic && topic.types) || {};
}

function getTypeName(topic, typeId) {
  const t = getTopicTypes(topic)[typeId];
  return t ? t.name : '';
}

function getQuestionTypeLabel(q, topic) {
  return getTypeName(topic, q && q.type) || 'Untyped';
}

function questionTypeCounts(questions, topic) {
  const counts = {};
  (questions || []).forEach(q => {
    const t = getQuestionTypeLabel(q, topic);
    counts[t] = (counts[t] || 0) + 1;
  });
  return counts;
}

function nextTypeOrder(topic) {
  return Object.keys(getTopicTypes(topic)).reduce((m, k) => Math.max(m, getTopicTypes(topic)[k].order || 0), 0) + 1;
}

// Give every topic a types map and convert older free-text question types
// (e.g. "MCQ") into real per-topic types.
function normalizeQuestionTypes() {
  let changed = false;
  sortedKeys(data.categories).forEach(catId => {
    sortedKeys(data.categories[catId].subcategories || {}).forEach(subId => {
      const sub = data.categories[catId].subcategories[subId];
      sortedKeys(sub.topics || {}).forEach(topicId => {
        const topic = sub.topics[topicId];
        if (!topic.types || typeof topic.types !== 'object') { topic.types = {}; changed = true; }
        (topic.questions || []).forEach(q => {
          const legacy = q.type;
          if (typeof legacy !== 'string' || !legacy.trim()) {
            if (legacy !== undefined) { delete q.type; changed = true; }
            return;
          }
          const existingId = Object.keys(topic.types).find(k => topic.types[k].name === legacy);
          if (existingId) {
            if (q.type !== existingId) { q.type = existingId; changed = true; }
            return;
          }
          let id = legacy.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'type';
          let n = 2;
          while (topic.types[id]) id = id.replace(/-\d+$/, '') + '-' + n++;
          topic.types[id] = { id, name: legacy, order: nextTypeOrder(topic) };
          q.type = id;
          changed = true;
        });
      });
    });
  });
  return changed;
}

function renderAdmin() {
  const container = document.getElementById('adminContent');
  const activeTab = document.querySelector('.admin-tab.active');
  const tab = activeTab ? activeTab.dataset.admin : 'categories';
  const builderPane = document.getElementById('adminBuilderPane');
  if (builderPane) builderPane.classList.toggle('hidden', tab !== 'builder');
  if (container) container.classList.toggle('hidden', tab === 'builder');
  if (tab === 'builder') { renderBuilder(); return; }
  if (tab === 'categories') renderAdminCategories(container);
  else if (tab === 'subcategories') renderAdminSubcategories(container);
  else if (tab === 'topics') renderAdminTopics(container);
  else if (tab === 'types') renderAdminTopics(container);
  else if (tab === 'questions') renderAdminQuestions(container);
  else if (tab === 'ebook') renderAdminEbook(container);
}

function renderAdminCategories(container) {
  let html = '<div class="admin-section"><h3>Add Category</h3><div class="admin-row"><input type="text" id="adminCatName" placeholder="Category name"><input type="file" id="adminCatIconImg" accept="image/*" style="max-width:150px;"><input type="text" id="adminCatIcon" placeholder="Emoji (e.g. 🌍)" style="max-width:70px;"><button class="btn-primary" id="adminAddCatBtn">Add</button></div></div>';
  html += '<div class="admin-section"><h3>Existing Categories</h3>';
  html += '<div id="admin-cat-list">';
  const catKeys = sortedKeys(data.categories);
  catKeys.forEach((catId, idx) => {
    const c = data.categories[catId];
    const iconHtml = c.iconImage ? '<img src="' + imgUrl(c.iconImage) + '" style="width:20px;height:20px;vertical-align:middle;border-radius:4px;">' : (c.icon || '📂');
    html += `<div class="admin-item" data-id="${catId}"><span>${c.order || (idx+1)}. ${iconHtml} ${c.name}</span><span><button class="act-btn edit" onclick="editCat('${catId}')"><i class="fas fa-pen"></i> Edit</button><button class="act-btn del" onclick="delCat('${catId}')"><i class="fas fa-trash"></i> Del</button><span class="drag-handle" draggable="true"><i class="fas fa-grip-vertical"></i></span></span></div>`;
  });
  html += '</div></div>';
  container.innerHTML = html;
  document.getElementById('adminAddCatBtn').addEventListener('click', addCat);
  enableDragSort('admin-cat-list', () => data.categories, () => { saveData(); renderDashboard(); renderAdmin(); });
}

function enableDragSort(containerId, getListFn, saveFn) {
  const container = document.getElementById(containerId);
  if (!container) return;

  let dragSrc = null;

  container.addEventListener('dragstart', (e) => {
    const item = e.target.closest('.admin-item');
    const handle = e.target.closest('.drag-handle');
    if (!item || !handle) { e.preventDefault(); return; }
    dragSrc = item;
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', item.dataset.id);
  });

  container.addEventListener('dragend', (e) => {
    const item = e.target.closest('.admin-item');
    if (item) item.classList.remove('dragging');
    container.querySelectorAll('.admin-item').forEach(el => el.classList.remove('drag-over'));
  });

  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const item = e.target.closest('.admin-item');
    if (item && item !== dragSrc) {
      container.querySelectorAll('.admin-item').forEach(el => el.classList.remove('drag-over'));
      item.classList.add('drag-over');
    }
  });

  container.addEventListener('dragleave', (e) => {
    const item = e.target.closest('.admin-item');
    if (item) item.classList.remove('drag-over');
  });

  container.addEventListener('drop', (e) => {
    e.preventDefault();
    container.querySelectorAll('.admin-item').forEach(el => el.classList.remove('drag-over'));
    const target = e.target.closest('.admin-item');
    if (!target || !dragSrc || target === dragSrc) return;
    if (dragSrc.dataset.cat && dragSrc.dataset.cat !== target.dataset.cat) return;
    if (dragSrc.dataset.sub && dragSrc.dataset.sub !== target.dataset.sub) return;
    if (dragSrc.dataset.topic && dragSrc.dataset.topic !== target.dataset.topic) return;

    const list = getListFn(dragSrc);
    if (!list) return;

    const items = [...container.querySelectorAll('.admin-item')];
    const srcIdx = items.indexOf(dragSrc);
    const tgtIdx = items.indexOf(target);
    if (srcIdx === -1 || tgtIdx === -1) return;

    const keys = Object.keys(list).sort((a, b) => (list[a].order || 0) - (list[b].order || 0));
    const ordered = keys.map(k => ({ key: k, obj: list[k] }));
    const [moved] = ordered.splice(srcIdx, 1);
    ordered.splice(tgtIdx, 0, moved);
    ordered.forEach((item, i) => { item.obj.order = i + 1; });

    dragSrc.classList.remove('dragging');
    dragSrc = null;
    saveFn();
  });
}

async function addCat() {
  const name = document.getElementById('adminCatName').value.trim();
  const icon = document.getElementById('adminCatIcon').value.trim() || '📂';
  const iconImgFile = document.getElementById('adminCatIconImg').files[0];
  if (!name) { alert('Enter a name.'); return; }
  const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  if (data.categories[id]) { alert('Category already exists.'); return; }
  const iconImage = iconImgFile ? await uploadFile(iconImgFile, 'category-icons') : '';
  const nextOrder = Object.keys(data.categories).reduce((m, k) => Math.max(m, data.categories[k].order || 0), 0) + 1;
  data.categories[id] = { id, name, icon, iconImage, color: null, subcategories: {}, order: nextOrder };
  await saveData(); renderDashboard(); renderAdmin();
}

function editCat(catId) {
  const c = data.categories[catId];
  const name = prompt('Category name:', c.name);
  if (!name) return;
  c.name = name;
  saveData(); renderDashboard(); renderAdmin();
}

async function delCat(catId) {
  if (!confirm('Delete "' + data.categories[catId].name + '" and all its data?')) return;
  await deleteUploadedFile(data.categories[catId].iconImage);
  delete data.categories[catId];
  await saveData(); renderDashboard(); renderAdmin(); updateStats();
}

function renderAdminSubcategories(container) {
  let html = '<div class="admin-section"><h3>Add Subcategory</h3><div class="admin-row"><select id="adminSubCat"><option value="">Select category</option>';
  sortedKeys(data.categories).forEach(catId => { html += '<option value="' + catId + '">' + data.categories[catId].name + '</option>'; });
  html += '</select><input type="text" id="adminSubName" placeholder="Subcategory name"><button class="btn-primary" id="adminAddSubBtn">Add</button></div></div>';
  html += '<div class="admin-section"><h3>Existing Subcategories</h3>';
  html += '<div id="admin-sub-list">';
  let subNum = 0;
  sortedKeys(data.categories).forEach(catId => {
    const c = data.categories[catId];
    const subKeys = sortedKeys(c.subcategories || {});
    subKeys.forEach((subId, idx) => {
      const s = c.subcategories[subId];
      subNum++;
      html += '<div class="admin-item" data-id="' + subId + '" data-cat="' + catId + '"><span>' + subNum + '. ' + c.icon + ' ' + c.name + ' → ' + s.name + '</span><span><button class="act-btn edit" onclick="editSub(\'' + catId + '\',\'' + subId + '\')"><i class="fas fa-pen"></i> Edit</button><button class="act-btn del" onclick="delSub(\'' + catId + '\',\'' + subId + '\')"><i class="fas fa-trash"></i> Del</button><span class="drag-handle" draggable="true"><i class="fas fa-grip-vertical"></i></span></span></div>';
    });
  });
  html += '</div></div>';
  container.innerHTML = html;
  document.getElementById('adminAddSubBtn').addEventListener('click', addSub);
  enableDragSort('admin-sub-list', (item) => {
    const catId = item.dataset.cat;
    return data.categories[catId]?.subcategories;
  }, () => { saveData(); renderDashboard(); renderAdmin(); });
}

function addSub() {
  const catId = document.getElementById('adminSubCat').value;
  const name = document.getElementById('adminSubName').value.trim();
  if (!catId || !name) { alert('Select category and enter name.'); return; }
  if (!data.categories[catId].subcategories) data.categories[catId].subcategories = {};
  const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  if (data.categories[catId].subcategories[id]) { alert('Subcategory already exists.'); return; }
  const nextOrder = Object.keys(data.categories[catId].subcategories || {}).reduce((m, k) => Math.max(m, data.categories[catId].subcategories[k].order || 0), 0) + 1;
  data.categories[catId].subcategories[id] = { id, name, topics: {}, order: nextOrder };
  saveData(); renderDashboard(); renderAdmin();
}

function editSub(catId, subId) {
  const s = data.categories[catId].subcategories[subId];
  const name = prompt('Subcategory name:', s.name);
  if (!name) return;
  s.name = name;
  saveData(); renderDashboard(); renderAdmin();
}

function delSub(catId, subId) {
  if (!confirm('Delete "' + data.categories[catId].subcategories[subId].name + '" and all its topics?')) return;
  delete data.categories[catId].subcategories[subId];
  saveData(); renderDashboard(); renderAdmin();
}

function renderAdminTopics(container) {
  const prevCat = document.getElementById('atFilterCat')?.value || '';
  const prevSub = document.getElementById('atFilterSub')?.value || '';
  const prevSearch = document.getElementById('atFilterSearch')?.value || '';

  // Add topic
  let html = '<div class="admin-section"><h3>Add Topic</h3><div class="admin-row"><select id="adminTopicCat"><option value="">Category</option>';
  sortedKeys(data.categories).forEach(catId => { html += '<option value="' + catId + '">' + data.categories[catId].name + '</option>'; });
  html += '</select><select id="adminTopicSub"><option value="">Subcategory</option></select>';
  html += '<input type="text" id="adminTopicName" placeholder="Topic name"><button class="btn-primary" id="adminAddTopicBtn">Add Topic</button></div></div>';

  // Add type (same place as topics now)
  html += '<div class="admin-section"><h3>Add Type</h3><div class="admin-row"><select id="adminTypeCat"><option value="">Category</option>';
  sortedKeys(data.categories).forEach(catId => { html += '<option value="' + catId + '">' + data.categories[catId].name + '</option>'; });
  html += '</select><select id="adminTypeSub"><option value="">Subcategory</option></select>';
  html += '<select id="adminTypeTopic"><option value="">Topic</option></select>';
  html += '<input type="text" id="adminTypeName" placeholder="Type name (e.g. MCQ, True / False)"><button class="btn-primary" id="adminAddTypeBtn">Add Type</button></div></div>';

  // Excel import (structure only: categories, subcategories, topics and types)
  html += '<div class="admin-section"><h3>Import Topics &amp; Types from Excel</h3>';
  html += '<div class="admin-row"><input type="file" id="adminExcelFile" accept=".xlsx,.xls,.csv" style="flex:1;min-width:200px;"><button class="btn-secondary" id="adminExcelImportBtn"><i class="fas fa-file-excel"></i> Import Excel</button></div>';
  html += '<details class="admin-import-help"><summary>Show Excel format</summary><pre>Header row (any order):\nCategory | Subcategory | Topic | Type\n\nExample:\nQuantitative Aptitude | Arithmetic | Percentage | Basics\nQuantitative Aptitude | Arithmetic | Percentage | Advanced\nQuantitative Aptitude | Arithmetic | Average\nReasoning | Verbal | Series | Alpha\n\nNotes:\n- Category, Subcategory and Topic are required on every row.\n- Type is optional. Leave it empty to only create the topic.\n- Existing categories, subcategories, topics and types are reused.\n- Missing ones are created automatically.\n- Questions are not imported here. Use the Questions tab to add them.\n- Supports .xlsx, .xls and .csv files.</pre></details></div>';

  // Combined list
  html += '<div class="admin-section"><h3>Topics &amp; Types</h3>';
  html += '<div class="admin-row" style="flex-wrap:wrap;gap:6px;margin-bottom:10px;">';
  html += '<select id="atFilterCat" style="flex:1;min-width:120px;"><option value="">All Categories</option>';
  sortedKeys(data.categories).forEach(catId => { html += '<option value="' + catId + '"' + (catId === prevCat ? ' selected' : '') + '>' + data.categories[catId].name + '</option>'; });
  html += '</select>';
  html += '<select id="atFilterSub" style="flex:1;min-width:120px;"><option value="">All Subcategories</option>';
  if (prevCat && data.categories[prevCat]) {
    sortedKeys(data.categories[prevCat].subcategories || {}).forEach(sid => { html += '<option value="' + sid + '"' + (sid === prevSub ? ' selected' : '') + '>' + data.categories[prevCat].subcategories[sid].name + '</option>'; });
  }
  html += '</select>';
  html += '<input type="text" id="atFilterSearch" placeholder="Search topics or types..." value="' + esc(prevSearch) + '" style="flex:2;min-width:180px;"></div>';
  html += '<div id="atList">';
  let topicNum = 0;
  let hasAny = false;
  sortedKeys(data.categories).forEach(catId => {
    const c = data.categories[catId];
    if (prevCat && catId !== prevCat) return;
    sortedKeys(c.subcategories || {}).forEach(subId => {
      if (prevSub && subId !== prevSub) return;
      const s = c.subcategories[subId];
      sortedKeys(s.topics || {}).forEach(topicId => {
        const t = s.topics[topicId];
        const searchBlob = (t.name + ' ' + Object.values(getTopicTypes(t)).map(x => x.name).join(' ')).toLowerCase();
        if (prevSearch && !searchBlob.includes(prevSearch.toLowerCase())) return;
        topicNum++;
        hasAny = true;
        const topicQs = t.questions || [];
        const typeChips = sortedKeys(getTopicTypes(t)).map(typeId => {
          const type = getTopicTypes(t)[typeId];
          const qCount = topicQs.filter(q => q.type === typeId).length;
          return '<span class="admin-type-chip"><strong>' + esc(type.name) + '</strong><em>' + qCount + ' Q</em>' +
            '<button class="act-btn edit" title="Edit type" onclick="editType(\'' + catId + '\',\'' + subId + '\',\'' + topicId + '\',\'' + typeId + '\')"><i class="fas fa-pen"></i></button>' +
            '<button class="act-btn del" title="Delete type" onclick="delType(\'' + catId + '\',\'' + subId + '\',\'' + topicId + '\',\'' + typeId + '\')"><i class="fas fa-trash"></i></button></span>';
        }).join('');
        html += '<div class="admin-topic-block" data-id="' + topicId + '" data-cat="' + catId + '" data-sub="' + subId + '">';
        html += '<div class="admin-item" data-id="' + topicId + '" data-cat="' + catId + '" data-sub="' + subId + '"><span>' + topicNum + '. ' + c.icon + ' ' + c.name + ' → ' + s.name + ' → ' + t.name + ' (' + topicQs.length + ' Q)</span><span><button class="act-btn edit" onclick="editTopic(\'' + catId + '\',\'' + subId + '\',\'' + topicId + '\')"><i class="fas fa-pen"></i> Edit</button><button class="act-btn del" onclick="delTopic(\'' + catId + '\',\'' + subId + '\',\'' + topicId + '\')"><i class="fas fa-trash"></i> Del</button><span class="drag-handle" draggable="true"><i class="fas fa-grip-vertical"></i></span></span></div>';
        html += '<div class="admin-topic-types">' + (typeChips || '<span class="admin-type-empty">No types yet</span>') +
          '<button class="admin-type-add" onclick="focusAddTypeForm(\'' + catId + '\',\'' + subId + '\',\'' + topicId + '\')"><i class="fas fa-plus"></i> Add type</button></div>';
        html += '</div>';
      });
    });
  });
  if (!hasAny) html += '<p class="empty-state" style="padding:20px;">No topics match your filters.</p>';
  html += '</div></div>';
  container.innerHTML = html;

  document.getElementById('adminAddTopicBtn').addEventListener('click', addTopic);
  document.getElementById('adminExcelImportBtn').addEventListener('click', importFromExcel);

  document.getElementById('adminTopicCat').addEventListener('change', function () {
    const sel = document.getElementById('adminTopicSub');
    sel.innerHTML = '<option value="">Subcategory</option>';
    const cat = data.categories[this.value];
    if (cat) sortedKeys(cat.subcategories || {}).forEach(sid => { sel.innerHTML += '<option value="' + sid + '">' + cat.subcategories[sid].name + '</option>'; });
  });

  // Add-type selects
  document.getElementById('adminAddTypeBtn').addEventListener('click', addType);
  const catSel = document.getElementById('adminTypeCat');
  const subSel = document.getElementById('adminTypeSub');
  const topicSel = document.getElementById('adminTypeTopic');
  const fillSubs = (catId, selected) => {
    subSel.innerHTML = '<option value="">Subcategory</option>';
    const cat = data.categories[catId];
    if (cat) sortedKeys(cat.subcategories || {}).forEach(sid => { subSel.innerHTML += '<option value="' + sid + '"' + (sid === selected ? ' selected' : '') + '>' + cat.subcategories[sid].name + '</option>'; });
  };
  const fillTopics = (catId, subId, selected) => {
    topicSel.innerHTML = '<option value="">Topic</option>';
    if (catId && subId && data.categories[catId]?.subcategories[subId]) {
      sortedKeys(data.categories[catId].subcategories[subId].topics || {}).forEach(tid => { topicSel.innerHTML += '<option value="' + tid + '"' + (tid === selected ? ' selected' : '') + '>' + data.categories[catId].subcategories[subId].topics[tid].name + '</option>'; });
    }
  };
  catSel.addEventListener('change', function () { fillSubs(this.value); fillTopics('', ''); });
  subSel.addEventListener('change', function () { fillTopics(catSel.value, this.value); });

  // Filters
  document.getElementById('atFilterCat').addEventListener('change', function () {
    const fs = document.getElementById('atFilterSub');
    fs.innerHTML = '<option value="">All Subcategories</option>';
    const cat = data.categories[this.value];
    if (cat) sortedKeys(cat.subcategories || {}).forEach(sid => { fs.innerHTML += '<option value="' + sid + '">' + cat.subcategories[sid].name + '</option>'; });
    applyATFilters();
  });
  document.getElementById('atFilterSub').addEventListener('change', applyATFilters);
  document.getElementById('atFilterSearch').addEventListener('input', function () {
    const q = this.value.toLowerCase().trim();
    document.querySelectorAll('#atList .admin-topic-block').forEach(block => {
      block.style.display = !q || block.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });

  enableDragSort('atList', (item) => {
    const catId = item.dataset.cat;
    const subId = item.dataset.sub;
    return data.categories[catId]?.subcategories[subId]?.topics;
  }, () => { saveData(); renderDashboard(); renderAdmin(); });
}

function focusAddTypeForm(catId, subId, topicId) {
  const catSel = document.getElementById('adminTypeCat');
  const subSel = document.getElementById('adminTypeSub');
  const topicSel = document.getElementById('adminTypeTopic');
  const nameInput = document.getElementById('adminTypeName');
  if (!catSel || !subSel || !topicSel || !nameInput) return;
  catSel.value = catId;
  subSel.innerHTML = '<option value="">Subcategory</option>';
  const cat = data.categories[catId];
  if (cat) sortedKeys(cat.subcategories || {}).forEach(sid => { subSel.innerHTML += '<option value="' + sid + '">' + cat.subcategories[sid].name + '</option>'; });
  subSel.value = subId;
  topicSel.innerHTML = '<option value="">Topic</option>';
  if (cat && cat.subcategories[subId]) sortedKeys(cat.subcategories[subId].topics || {}).forEach(tid => { topicSel.innerHTML += '<option value="' + tid + '">' + cat.subcategories[subId].topics[tid].name + '</option>'; });
  topicSel.value = topicId;
  const section = nameInput.closest('.admin-section');
  nameInput.focus({ preventScroll: true });
  if (section) section.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function applyATFilters() {
  renderAdmin();
}



function addTopic() {
  const catId = document.getElementById('adminTopicCat').value;
  const subId = document.getElementById('adminTopicSub').value;
  const name = document.getElementById('adminTopicName').value.trim();
  if (!catId || !subId || !name) { alert('Fill all fields.'); return; }
  const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  if (data.categories[catId].subcategories[subId].topics[id]) { alert('Topic already exists.'); return; }
  const nextOrder = Object.keys(data.categories[catId].subcategories[subId].topics || {}).reduce((m, k) => Math.max(m, data.categories[catId].subcategories[subId].topics[k].order || 0), 0) + 1;
  data.categories[catId].subcategories[subId].topics[id] = { id, name, questions: [], order: nextOrder };
  saveData(); renderDashboard(); renderAdmin();
}

function editTopic(catId, subId, topicId) {
  const t = data.categories[catId].subcategories[subId].topics[topicId];
  const name = prompt('Topic name:', t.name);
  if (!name) return;
  t.name = name;
  saveData(); renderDashboard(); renderAdmin();
}

function delTopic(catId, subId, topicId) {
  if (!confirm('Delete this topic and all its questions?')) return;
  delete data.categories[catId].subcategories[subId].topics[topicId];
  saveData(); renderDashboard(); renderAdmin();
}

function renderAdminTypes(container) {
  const prevCat = document.getElementById('ayFilterCat')?.value || '';
  const prevSub = document.getElementById('ayFilterSub')?.value || '';
  const prevTopic = document.getElementById('ayFilterTopic')?.value || '';
  const prevSearch = document.getElementById('ayFilterSearch')?.value || '';

  let html = '<div class="admin-section"><h3>Add Type</h3><div class="admin-row"><select id="adminTypeCat"><option value="">Category</option>';
  sortedKeys(data.categories).forEach(catId => { html += '<option value="' + catId + '">' + data.categories[catId].name + '</option>'; });
  html += '</select><select id="adminTypeSub"><option value="">Subcategory</option></select>';
  html += '<select id="adminTypeTopic"><option value="">Topic</option></select>';
  html += '<input type="text" id="adminTypeName" placeholder="Type name (e.g. MCQ, True / False)"><button class="btn-primary" id="adminAddTypeBtn">Add</button></div></div>';

  html += '<div class="admin-section"><h3>Existing Types</h3>';
  html += '<div class="admin-row" style="flex-wrap:wrap;gap:6px;margin-bottom:10px;">';
  html += '<select id="ayFilterCat" style="flex:1;min-width:110px;"><option value="">All Categories</option>';
  sortedKeys(data.categories).forEach(catId => { html += '<option value="' + catId + '"' + (catId === prevCat ? ' selected' : '') + '>' + data.categories[catId].name + '</option>'; });
  html += '</select>';
  html += '<select id="ayFilterSub" style="flex:1;min-width:110px;"><option value="">All Subcategories</option>';
  if (prevCat && data.categories[prevCat]) {
    sortedKeys(data.categories[prevCat].subcategories || {}).forEach(sid => { html += '<option value="' + sid + '"' + (sid === prevSub ? ' selected' : '') + '>' + data.categories[prevCat].subcategories[sid].name + '</option>'; });
  }
  html += '</select>';
  html += '<select id="ayFilterTopic" style="flex:1;min-width:110px;"><option value="">All Topics</option>';
  if (prevCat && prevSub && data.categories[prevCat]?.subcategories[prevSub]) {
    sortedKeys(data.categories[prevCat].subcategories[prevSub].topics || {}).forEach(tid => { html += '<option value="' + tid + '"' + (tid === prevTopic ? ' selected' : '') + '>' + data.categories[prevCat].subcategories[prevSub].topics[tid].name + '</option>'; });
  }
  html += '</select>';
  html += '<input type="text" id="ayFilterSearch" placeholder="Search types..." value="' + esc(prevSearch) + '" style="flex:2;min-width:150px;"></div>';

  html += '<div id="ayList">';
  let rowNum = 0;
  let rows = '';
  sortedKeys(data.categories).forEach(catId => {
    const c = data.categories[catId];
    if (prevCat && catId !== prevCat) return;
    sortedKeys(c.subcategories || {}).forEach(subId => {
      if (prevSub && subId !== prevSub) return;
      const s = c.subcategories[subId];
      sortedKeys(s.topics || {}).forEach(topicId => {
        if (prevTopic && topicId !== prevTopic) return;
        const t = s.topics[topicId];
        sortedKeys(getTopicTypes(t)).forEach(typeId => {
          const type = getTopicTypes(t)[typeId];
          if (prevSearch && !type.name.toLowerCase().includes(prevSearch.toLowerCase())) return;
          rowNum++;
          const qCount = (t.questions || []).filter(q => q.type === typeId).length;
          rows += '<div class="admin-item" data-id="' + typeId + '" data-cat="' + catId + '" data-sub="' + subId + '" data-topic="' + topicId + '"><span>' + rowNum + '. ' + c.icon + ' ' + c.name + ' → ' + s.name + ' → ' + t.name + ' → <strong>' + esc(type.name) + '</strong> (' + qCount + ' Q)</span><span><button class="act-btn edit" onclick="editType(\'' + catId + '\',\'' + subId + '\',\'' + topicId + '\',\'' + typeId + '\')"><i class="fas fa-pen"></i> Edit</button><button class="act-btn del" onclick="delType(\'' + catId + '\',\'' + subId + '\',\'' + topicId + '\',\'' + typeId + '\')"><i class="fas fa-trash"></i> Del</button><span class="drag-handle" draggable="true"><i class="fas fa-grip-vertical"></i></span></span></div>';
        });
      });
    });
  });
  html += rows || '<p class="empty-state" style="padding:20px;">No types yet. Add one above.</p>';
  html += '</div></div>';
  container.innerHTML = html;

  document.getElementById('adminAddTypeBtn').addEventListener('click', addType);

  const catSel = document.getElementById('adminTypeCat');
  const subSel = document.getElementById('adminTypeSub');
  const topicSel = document.getElementById('adminTypeTopic');
  const fillSubs = (catId, selected) => {
    subSel.innerHTML = '<option value="">Subcategory</option>';
    const cat = data.categories[catId];
    if (cat) sortedKeys(cat.subcategories || {}).forEach(sid => { subSel.innerHTML += '<option value="' + sid + '"' + (sid === selected ? ' selected' : '') + '>' + cat.subcategories[sid].name + '</option>'; });
  };
  const fillTopics = (catId, subId, selected) => {
    topicSel.innerHTML = '<option value="">Topic</option>';
    if (catId && subId && data.categories[catId]?.subcategories[subId]) {
      sortedKeys(data.categories[catId].subcategories[subId].topics || {}).forEach(tid => { topicSel.innerHTML += '<option value="' + tid + '"' + (tid === selected ? ' selected' : '') + '>' + data.categories[catId].subcategories[subId].topics[tid].name + '</option>'; });
    }
  };
  catSel.addEventListener('change', function () { fillSubs(this.value); fillTopics('', ''); });
  subSel.addEventListener('change', function () { fillTopics(catSel.value, this.value); });

  document.getElementById('ayFilterCat').addEventListener('change', function () {
    const fs = document.getElementById('ayFilterSub');
    const ft = document.getElementById('ayFilterTopic');
    fs.innerHTML = '<option value="">All Subcategories</option>';
    ft.innerHTML = '<option value="">All Topics</option>';
    const cat = data.categories[this.value];
    if (cat) sortedKeys(cat.subcategories || {}).forEach(sid => { fs.innerHTML += '<option value="' + sid + '">' + cat.subcategories[sid].name + '</option>'; });
    renderAdmin();
  });
  document.getElementById('ayFilterSub').addEventListener('change', function () {
    const ft = document.getElementById('ayFilterTopic');
    ft.innerHTML = '<option value="">All Topics</option>';
    const catId = document.getElementById('ayFilterCat').value;
    if (catId && this.value && data.categories[catId]?.subcategories[this.value]) {
      sortedKeys(data.categories[catId].subcategories[this.value].topics || {}).forEach(tid => { ft.innerHTML += '<option value="' + tid + '">' + data.categories[catId].subcategories[this.value].topics[tid].name + '</option>'; });
    }
    renderAdmin();
  });
  document.getElementById('ayFilterTopic').addEventListener('change', renderAdmin);
  document.getElementById('ayFilterSearch').addEventListener('input', function () {
    const q = this.value.toLowerCase().trim();
    document.querySelectorAll('#ayList .admin-item').forEach(row => {
      row.style.display = !q || row.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
  });

  enableDragSort('ayList', (item) => {
    const catId = item.dataset.cat;
    const subId = item.dataset.sub;
    const topicId = item.dataset.topic;
    return data.categories[catId]?.subcategories[subId]?.topics[topicId]?.types;
  }, () => { saveData(); renderDashboard(); renderAdmin(); });
}

function addType() {
  const catId = document.getElementById('adminTypeCat').value;
  const subId = document.getElementById('adminTypeSub').value;
  const topicId = document.getElementById('adminTypeTopic').value;
  const name = document.getElementById('adminTypeName').value.trim();
  if (!catId || !subId || !topicId || !name) { alert('Fill all fields.'); return; }
  const topic = data.categories[catId]?.subcategories[subId]?.topics[topicId];
  if (!topic) { alert('Topic not found.'); return; }
  if (!topic.types) topic.types = {};
  if (Object.values(topic.types).some(t => t.name.toLowerCase() === name.toLowerCase())) { alert('This type already exists for the topic.'); return; }
  let id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'type';
  let n = 2;
  const base = id;
  while (topic.types[id]) id = base + '-' + n++;
  topic.types[id] = { id, name, order: nextTypeOrder(topic) };
  saveData(); renderDashboard(); renderAdmin();
}

function editType(catId, subId, topicId, typeId) {
  const type = data.categories[catId]?.subcategories[subId]?.topics[topicId]?.types?.[typeId];
  if (!type) return;
  const name = prompt('Type name:', type.name);
  if (!name || !name.trim()) return;
  type.name = name.trim();
  saveData(); renderDashboard(); renderAdmin();
}

function delType(catId, subId, topicId, typeId) {
  const topic = data.categories[catId]?.subcategories[subId]?.topics[topicId];
  const type = topic && topic.types && topic.types[typeId];
  if (!type) return;
  const affected = (topic.questions || []).filter(q => q.type === typeId).length;
  const msg = 'Delete type "' + type.name + '"?' + (affected ? ' ' + affected + ' question(s) will become Untyped.' : '');
  if (!confirm(msg)) return;
  delete topic.types[typeId];
  (topic.questions || []).forEach(q => { if (q.type === typeId) delete q.type; });
  saveData(); renderDashboard(); renderAdmin();
}

function renderAdminQuestions(container) {
  const prevFilterCat = document.getElementById('aqFilterCat')?.value || '';
  const prevFilterSub = document.getElementById('aqFilterSub')?.value || '';
  const prevFilterTopic = document.getElementById('aqFilterTopic')?.value || '';
  const prevFilterType = document.getElementById('aqFilterType')?.value || '';
  const prevFilterSearch = document.getElementById('aqFilterSearch')?.value || '';
  let html = '<div class="admin-section"><h3>Add Question</h3>';
  html += '<div class="admin-row"><select id="adminQCat"><option value="">Select Category</option>';
  sortedKeys(data.categories).forEach(catId => {
    html += '<option value="' + catId + '">' + data.categories[catId].name + '</option>';
  });
  html += '</select>';
  html += '<select id="adminQSub"><option value="">Select Subcategory</option></select>';
  html += '<select id="adminQTopic"><option value="">Select Topic</option></select>';
  html += '<select id="adminQType" title="Question type"><option value="">Type: None</option></select></div>';
  html += '<div class="admin-row"><input type="text" id="adminQQ" placeholder="Question text"></div>';
  html += '<div class="admin-row"><input type="file" id="adminQImg" accept="image/*" style="flex:1;"><span id="adminQImgName" style="font-size:12px;color:var(--text2);"></span></div>';
  html += '<div class="admin-row"><input type="text" id="adminQO0" placeholder="Option A"><input type="text" id="adminQO1" placeholder="Option B"></div>';
  html += '<div class="admin-row"><input type="text" id="adminQO2" placeholder="Option C"><input type="text" id="adminQO3" placeholder="Option D"></div>';
  html += '<div class="admin-row"><select id="adminQAns"><option value="0">Answer: A</option><option value="1">B</option><option value="2">C</option><option value="3">D</option></select>';
  html += '<input type="text" id="adminQExp" placeholder="Explanation" style="flex:2;"></div>';
  html += '<div class="admin-row"><input type="file" id="adminQExpImg" accept="image/*" style="flex:1;"><span id="adminQExpImgName" style="font-size:12px;color:var(--text2);"></span></div>';
  html += '<input type="hidden" id="adminQEditId"><input type="hidden" id="adminQEditCat"><input type="hidden" id="adminQEditSub"><input type="hidden" id="adminQEditTopic"><button class="btn-primary" id="adminAddQBtn">Add Question</button></div>';

  html += '<div class="admin-import">';
  html += '<div class="admin-import-head"><h4><i class="fas fa-file-word"></i> Import from Word</h4><span>Add many questions at once from a .docx file</span></div>';
  html += '<div class="admin-row"><input type="file" id="adminQImportFile" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" style="flex:1;"><button class="btn-secondary" id="adminQImportBtn"><i class="fas fa-file-import"></i> Import Questions</button></div>';
  html += '<details class="admin-import-help"><summary>Show supported Word format</summary><pre>Type: Arithmetic\n\nQ1. What is 12 + 8?\nA) 18\nB) 20\nC) 22\nD) 24\nAnswer: B\nExplanation: 12 + 8 = 20.\n\nQ2. What is 7 × 6?\nA) 36\nB) 40\nC) 42\nD) 48\nAnswer: C\nExplanation: 7 × 6 = 42.\n\nNotes:\n- Each question starts with Q1., Q2. or 1., 2.\n- Options use A), B), C), D) (2 to 6 options supported).\n- Answer can be A, B, C, D or 1, 2, 3, 4.\n- "Type: Name" applies to the questions that follow; "Type 1 - Name" section headers also work.\n- If a question has no Type line, the Type selected above is used.\n- Explanation is optional.</pre></details>';
  html += '</div>';

  html += '</div>';

  html += '<div class="admin-section"><h3>All Questions</h3>';
  html += '<div class="admin-row" style="flex-wrap:wrap;gap:6px;margin-bottom:10px;">';
  html += '<select id="aqFilterCat" style="flex:1;min-width:120px;"><option value="">Select Category</option>';
  sortedKeys(data.categories).forEach(catId => { html += '<option value="' + catId + '"' + (catId === prevFilterCat ? ' selected' : '') + '>' + data.categories[catId].name + '</option>'; });
  html += '</select>';
  html += '<select id="aqFilterSub" style="flex:1;min-width:120px;"><option value="">Select Subcategory</option>';
  if (prevFilterCat && data.categories[prevFilterCat]) {
    sortedKeys(data.categories[prevFilterCat].subcategories || {}).forEach(sid => { html += '<option value="' + sid + '"' + (sid === prevFilterSub ? ' selected' : '') + '>' + data.categories[prevFilterCat].subcategories[sid].name + '</option>'; });
  }
  html += '</select>';
  html += '<select id="aqFilterTopic" style="flex:1;min-width:120px;"><option value="">Select Topic</option>';
  if (prevFilterCat && prevFilterSub && data.categories[prevFilterCat]?.subcategories[prevFilterSub]) {
    sortedKeys(data.categories[prevFilterCat].subcategories[prevFilterSub].topics || {}).forEach(tid => { html += '<option value="' + tid + '"' + (tid === prevFilterTopic ? ' selected' : '') + '>' + data.categories[prevFilterCat].subcategories[prevFilterSub].topics[tid].name + '</option>'; });
  }
  html += '</select>';
  html += '<select id="aqFilterType" style="flex:1;min-width:120px;" title="Filter by question type"><option value="">All Types</option>' + typeFilterOptions(prevFilterCat, prevFilterSub, prevFilterTopic, prevFilterType) + '</select>';
  html += '<input type="text" id="aqFilterSearch" placeholder="Search questions..." value="' + esc(prevFilterSearch) + '" style="flex:2;min-width:180px;"></div>';
  html += '<div id="aqList"><p class="empty-state" style="padding:20px;">Select a filter to find questions.</p></div></div>';
  container.innerHTML = html;

  document.getElementById('adminAddQBtn').addEventListener('click', addAdminQ);
  document.getElementById('adminQImportBtn').addEventListener('click', importQuestionsFromWord);

  document.getElementById('adminQCat').addEventListener('change', function () {
    const subSel = document.getElementById('adminQSub');
    const topicSel = document.getElementById('adminQTopic');
    subSel.innerHTML = '<option value="">Select Subcategory</option>';
    topicSel.innerHTML = '<option value="">Select Topic</option>';
    const cat = data.categories[this.value];
    if (cat) sortedKeys(cat.subcategories || {}).forEach(sid => { subSel.innerHTML += '<option value="' + sid + '">' + cat.subcategories[sid].name + '</option>'; });
    populateAdminQType('', '', '');
  });
  document.getElementById('adminQSub').addEventListener('change', function () {
    const sel = document.getElementById('adminQTopic');
    sel.innerHTML = '<option value="">Select Topic</option>';
    const catId = document.getElementById('adminQCat').value;
    if (catId && this.value && data.categories[catId] && data.categories[catId].subcategories[this.value]) {
      sortedKeys(data.categories[catId].subcategories[this.value].topics || {}).forEach(tid => {
        sel.innerHTML += '<option value="' + tid + '">' + data.categories[catId].subcategories[this.value].topics[tid].name + '</option>';
      });
    }
    populateAdminQType('', '', '');
  });
  document.getElementById('adminQTopic').addEventListener('change', function () {
    populateAdminQType(document.getElementById('adminQCat').value, document.getElementById('adminQSub').value, this.value);
  });

  document.getElementById('aqFilterCat').addEventListener('change', function () {
    const subSel = document.getElementById('aqFilterSub');
    const topicSel = document.getElementById('aqFilterTopic');
    subSel.innerHTML = '<option value="">Select Subcategory</option>';
    topicSel.innerHTML = '<option value="">Select Topic</option>';
    const cat = data.categories[this.value];
    if (cat) sortedKeys(cat.subcategories || {}).forEach(sid => { subSel.innerHTML += '<option value="' + sid + '">' + cat.subcategories[sid].name + '</option>'; });
    refreshAQTypeFilter();
    applyAQFilters();
    syncFilterToAddForm();
  });
  document.getElementById('aqFilterSub').addEventListener('change', function () {
    const sel = document.getElementById('aqFilterTopic');
    sel.innerHTML = '<option value="">Select Topic</option>';
    const catId = document.getElementById('aqFilterCat').value;
    if (catId && this.value && data.categories[catId] && data.categories[catId].subcategories[this.value]) {
      sortedKeys(data.categories[catId].subcategories[this.value].topics || {}).forEach(tid => {
        sel.innerHTML += '<option value="' + tid + '">' + data.categories[catId].subcategories[this.value].topics[tid].name + '</option>';
      });
    }
    refreshAQTypeFilter();
    applyAQFilters();
    syncFilterToAddForm();
  });
  document.getElementById('aqFilterTopic').addEventListener('change', function () {
    refreshAQTypeFilter();
    applyAQFilters();
    syncFilterToAddForm();
  });
  document.getElementById('aqFilterSearch').addEventListener('input', applyAQFilters);
  document.getElementById('aqFilterType').addEventListener('change', applyAQFilters);
  if (prevFilterCat || prevFilterSub || prevFilterTopic || prevFilterType || prevFilterSearch) applyAQFilters();
}

function populateAdminQSub(catId) {
  const sel = document.getElementById('adminQSub');
  sel.innerHTML = '<option value="">Subcategory</option>';
  const cat = data.categories[catId];
  if (cat) sortedKeys(cat.subcategories || {}).forEach(sid => { sel.innerHTML += '<option value="' + sid + '">' + cat.subcategories[sid].name + '</option>'; });
}

function populateAdminQTopic(catId, subId) {
  const sel = document.getElementById('adminQTopic');
  sel.innerHTML = '<option value="">Topic</option>';
  if (catId && subId && data.categories[catId] && data.categories[catId].subcategories[subId]) {
    Object.keys(data.categories[catId].subcategories[subId].topics || {}).forEach(tid => {
      sel.innerHTML += '<option value="' + tid + '">' + data.categories[catId].subcategories[subId].topics[tid].name + '</option>';
    });
  }
}

function populateAdminQType(catId, subId, topicId) {
  const sel = document.getElementById('adminQType');
  if (!sel) return;
  const topic = data.categories[catId]?.subcategories[subId]?.topics[topicId];
  sel.innerHTML = '<option value="">Type: None</option>';
  if (topic) {
    const typeIds = sortedKeys(getTopicTypes(topic));
    typeIds.forEach(tid => {
      sel.innerHTML += '<option value="' + tid + '">Type: ' + esc(getTopicTypes(topic)[tid].name) + '</option>';
    });
    // Default to the first type so newly added questions are grouped automatically.
    if (typeIds.length) sel.value = typeIds[0];
  }
}

// Distinct type names within the selected filter scope.
function typeNamesInScope(cat, sub, topic) {
  const names = [];
  sortedKeys(data.categories).forEach(catId => {
    if (cat && catId !== cat) return;
    const c = data.categories[catId];
    sortedKeys(c.subcategories || {}).forEach(subId => {
      if (sub && subId !== sub) return;
      const s = c.subcategories[subId];
      sortedKeys(s.topics || {}).forEach(topicId => {
        if (topic && topicId !== topic) return;
        const t = s.topics[topicId];
        sortedKeys(getTopicTypes(t)).forEach(typeId => {
          const name = getTopicTypes(t)[typeId].name;
          if (!names.includes(name)) names.push(name);
        });
      });
    });
  });
  return names.sort((a, b) => a.localeCompare(b));
}

function typeFilterOptions(cat, sub, topic, selected) {
  return typeNamesInScope(cat, sub, topic).map(name => '<option value="' + esc(name) + '"' + (name === selected ? ' selected' : '') + '>' + esc(name) + '</option>').join('') +
    '<option value="__untyped__"' + (selected === '__untyped__' ? ' selected' : '') + '>Untyped</option>';
}

function refreshAQTypeFilter() {
  const sel = document.getElementById('aqFilterType');
  if (!sel) return;
  const cat = document.getElementById('aqFilterCat').value;
  const sub = document.getElementById('aqFilterSub').value;
  const topic = document.getElementById('aqFilterTopic').value;
  const prev = sel.value;
  sel.innerHTML = '<option value="">All Types</option>' + typeFilterOptions(cat, sub, topic, prev);
  if (Array.prototype.some.call(sel.options, o => o.value === prev)) sel.value = prev;
  else sel.value = '';
}

function syncFilterToAddForm() {
  const cat = document.getElementById('aqFilterCat').value;
  const sub = document.getElementById('aqFilterSub').value;
  const topic = document.getElementById('aqFilterTopic').value;
  document.getElementById('adminQCat').value = cat;
  const subSel = document.getElementById('adminQSub');
  subSel.innerHTML = '<option value="">Select Subcategory</option>';
  if (cat && data.categories[cat]) {
    sortedKeys(data.categories[cat].subcategories || {}).forEach(sid => { subSel.innerHTML += '<option value="' + sid + '"' + (sid === sub ? ' selected' : '') + '>' + data.categories[cat].subcategories[sid].name + '</option>'; });
  }
  const topicSel = document.getElementById('adminQTopic');
  topicSel.innerHTML = '<option value="">Select Topic</option>';
  if (cat && sub && data.categories[cat]?.subcategories[sub]) {
    sortedKeys(data.categories[cat].subcategories[sub].topics || {}).forEach(tid => { topicSel.innerHTML += '<option value="' + tid + '"' + (tid === topic ? ' selected' : '') + '>' + data.categories[cat].subcategories[sub].topics[tid].name + '</option>'; });
  }
  populateAdminQType(cat, sub, topic);
}

function applyAQFilters() {
  const cat = document.getElementById('aqFilterCat').value;
  const sub = document.getElementById('aqFilterSub').value;
  const topic = document.getElementById('aqFilterTopic').value;
  const type = document.getElementById('aqFilterType').value;
  const search = document.getElementById('aqFilterSearch').value.toLowerCase().trim();

  const container = document.getElementById('aqList');
  if (!cat && !sub && !topic && !type && !search) { container.innerHTML = '<p class="empty-state" style="padding:20px;">Select a filter or type to search.</p>'; return; }
  let html = '';
  let prevTopicKey = null;
  let topicCount = 0;
  forEachQ((q, i, catId, subId, topicId, catObj, subObj, topicObj) => {
    const matchCat = !cat || catId === cat;
    const matchSub = !sub || subId === sub;
    const matchTopic = !topic || topicId === topic;
    const typeLabel = getQuestionTypeLabel(q, topicObj);
    const matchType = !type || typeLabel === (type === '__untyped__' ? 'Untyped' : type);
    const matchSearch = !search || (q.question || '').toLowerCase().includes(search);
    if (!matchCat || !matchSub || !matchTopic || !matchType || !matchSearch) return;

    const topicKey = catId + '/' + subId + '/' + topicId;
    if (topicKey !== prevTopicKey) {
      if (prevTopicKey !== null) html += '</div></div>';
      html += '<div class="aq-topic-group" data-topic="' + topicKey + '">';
      html += '<div class="aq-topic-head" onclick="this.nextElementSibling.classList.toggle(\'aq-hidden\');this.querySelector(\'.aq-toggle\').classList.toggle(\'aq-open\');">';
      html += '<span class="aq-toggle">▶</span> <strong>' + esc(catObj.name) + ' › ' + esc(subObj.name) + ' › ' + esc(topicObj.name) + '</strong> <span class="aq-count">(' + (topicObj.questions || []).length + ' Q' + (function () {
        const tc = questionTypeCounts(topicObj.questions, topicObj);
        const ks = Object.keys(tc);
        return ks.length ? ' · ' + ks.map(k => k + ': ' + tc[k]).join(' · ') : '';
      })() + ')</span>';
      html += '</div><div class="aq-topic-body">';
      prevTopicKey = topicKey;
      topicCount = 0;
    }
    topicCount++;
    const qTypeLabel = getQuestionTypeLabel(q, topicObj);
    html += '<div class="admin-question-item" data-cat="' + catId + '" data-sub="' + subId + '" data-topic="' + topicId + '">';
    html += '<div class="aq-text">' + topicCount + '. ' + esc(q.question || '') + ' <span class="aq-type' + (qTypeLabel === 'Untyped' ? ' untyped' : '') + '">' + esc(qTypeLabel) + '</span></div>' + (q.image ? '<img class="aq-img" src="' + imgUrl(q.image) + '" alt="Question image">' : '');
    html += '<div class="aq-opts">' + (q.options || []).map((o, oi) => (oi === q.answer ? '✅ ' : '') + String.fromCharCode(65 + oi) + '. ' + esc(o)).join(' | ') + '</div>';
    html += '<div class="aq-ans">Answer: ' + String.fromCharCode(65 + q.answer) + ' | ' + esc(q.explanation || '') + '</div>' + (q.expImage ? '<img class="aq-img" src="' + imgUrl(q.expImage) + '" alt="Explanation image">' : '');
    html += '<div class="aq-actions"><button class="btn-secondary" onclick="event.stopPropagation();editAdminQ(\'' + catId + '\',\'' + subId + '\',\'' + topicId + '\',' + q.id + ')"><i class="fas fa-pen"></i> Edit</button>';
    html += '<button class="btn-danger" onclick="event.stopPropagation();delAdminQ(\'' + catId + '\',\'' + subId + '\',\'' + topicId + '\',' + q.id + ')"><i class="fas fa-trash"></i> Delete</button></div></div>';
  });
  if (prevTopicKey !== null) html += '</div></div>';
  if (!prevTopicKey) html = '<p class="empty-state" style="padding:20px;">No questions match your filters.</p>';
  container.innerHTML = html;
}

async function addAdminQ() {
  const catId = document.getElementById('adminQCat').value;
  const subId = document.getElementById('adminQSub').value;
  const topicId = document.getElementById('adminQTopic').value;
  const qText = document.getElementById('adminQQ').value.trim();
  const opts = [0, 1, 2, 3].map(i => document.getElementById('adminQO' + i).value.trim());
  const ans = parseInt(document.getElementById('adminQAns').value);
  const exp = document.getElementById('adminQExp').value.trim();
  const qType = document.getElementById('adminQType').value;
  const editId = document.getElementById('adminQEditId').value;
  const imgFile = document.getElementById('adminQImg').files[0];
  const expImgFile = document.getElementById('adminQExpImg').files[0];
  if (!catId || !subId || !topicId || !qText || opts.some(o => !o)) { alert('Fill all fields.'); return; }

  if ((imgFile && imgFile.size > 2 * 1024 * 1024) || (expImgFile && expImgFile.size > 2 * 1024 * 1024)) { alert('Image too large! Max 2 MB.'); return; }

  const btn = document.getElementById('adminAddQBtn');
  btn.disabled = true; btn.textContent = 'Saving...';

  try {
    if (editId) {
      const editCat = document.getElementById('adminQEditCat').value;
      const editSub = document.getElementById('adminQEditSub').value;
      const editTopic = document.getElementById('adminQEditTopic').value;
      const isMoved = editCat !== catId || editSub !== subId || editTopic !== topicId;
      let editQ;
      if (isMoved) {
        const oldTopic = data.categories[editCat]?.subcategories[editSub]?.topics[editTopic];
        if (oldTopic) {
          const idx = (oldTopic.questions || []).findIndex(q => q.id == editId);
          if (idx !== -1) editQ = oldTopic.questions.splice(idx, 1)[0];
        }
        if (!editQ) { alert('Could not find original question.'); btn.disabled = false; btn.textContent = 'Update Question'; return; }
        data.categories[catId].subcategories[subId].topics[topicId].questions.push(editQ);
      } else {
        editQ = (data.categories[catId]?.subcategories[subId]?.topics[topicId]?.questions || []).find(q => q.id == editId);
      }
      if (editQ) {
        editQ.question = qText; editQ.options = opts; editQ.answer = ans; editQ.explanation = exp;
        if (qType) editQ.type = qType; else delete editQ.type;
        if (imgFile) { await deleteUploadedFile(editQ.image); editQ.image = await uploadFile(imgFile, 'questions').catch(e => { alert('Image upload failed: ' + e.message); return editQ.image; }); }
        if (expImgFile) { await deleteUploadedFile(editQ.expImage); editQ.expImage = await uploadFile(expImgFile, 'explanations').catch(e => { alert('Image upload failed: ' + e.message); return editQ.expImage; }); }
      }
    } else {
      const q = { id: genId(), question: qText, options: opts, answer: ans, explanation: exp, image: '', expImage: '' };
      if (qType) q.type = qType;
      data.categories[catId].subcategories[subId].topics[topicId].questions.push(q);
      if (imgFile) {
        try { q.image = await uploadFile(imgFile, 'questions'); } catch (e) { alert('Image upload failed: ' + e.message); }
      }
      if (expImgFile) {
        try { q.expImage = await uploadFile(expImgFile, 'explanations'); } catch (e) { alert('Image upload failed: ' + e.message); }
      }
    }
    await saveData();
    renderDashboard(); updateStats(); renderAdmin();
  } catch (e) {
    btn.disabled = false; btn.textContent = editId ? 'Update Question' : 'Add Question';
  }
  btn.disabled = false; btn.textContent = editId ? 'Update Question' : 'Add Question';
}

// ======================== WORD IMPORT ========================
// Loaded on demand so the main app never waits for the CDN.
const MAMMOTH_URL = 'https://cdn.jsdelivr.net/npm/mammoth@1.8.0/mammoth.browser.min.js';
let _mammothPromise = null;

// Excel import shares the same on-demand approach (SheetJS).
const XLSX_URL = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
let _xlsxPromise = null;

function loadXLSX() {
  if (typeof XLSX !== 'undefined') return Promise.resolve(XLSX);
  if (_xlsxPromise) return _xlsxPromise;
  _xlsxPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = XLSX_URL;
    script.onload = function () {
      if (typeof XLSX !== 'undefined') resolve(XLSX);
      else reject(new Error('The Excel import library did not start.'));
    };
    script.onerror = function () {
      _xlsxPromise = null;
      reject(new Error('Could not load the Excel import library. Check your internet connection and try again.'));
    };
    document.head.appendChild(script);
  });
  return _xlsxPromise;
}

function loadMammoth() {
  if (typeof mammoth !== 'undefined') return Promise.resolve(mammoth);
  if (_mammothPromise) return _mammothPromise;
  _mammothPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = MAMMOTH_URL;
    script.onload = function () {
      if (typeof mammoth !== 'undefined') resolve(mammoth);
      else reject(new Error('The Word import library did not start.'));
    };
    script.onerror = function () {
      _mammothPromise = null;
      reject(new Error('Could not load the Word import library. Check your internet connection and try again.'));
    };
    document.head.appendChild(script);
  });
  return _mammothPromise;
}

function ensureTopicType(topic, name) {
  if (!topic) return '';
  if (!topic.types || typeof topic.types !== 'object') topic.types = {};
  const clean = String(name || '').trim();
  if (!clean) return '';
  const found = Object.keys(topic.types).find(k => String(topic.types[k].name || '').toLowerCase() === clean.toLowerCase());
  if (found) return found;
  let base = clean.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'type';
  let id = base;
  let n = 2;
  while (topic.types[id]) id = base + '-' + n++;
  topic.types[id] = { id, name: clean, order: nextTypeOrder(topic) };
  return id;
}

function parseAnswerIndex(raw, options) {
  const choices = options || [];
  const candidates = [String(raw || '').trim(), String(raw || '').replace(/^option\s+/i, '').trim()];
  for (const candidate of candidates) {
    if (!candidate) continue;
    let m = candidate.match(/^\(?([a-z])\)?(?:\s*[\).:\-–—]|\s|$)/i);
    if (m) {
      const i = m[1].toUpperCase().charCodeAt(0) - 65;
      if (i >= 0 && i < choices.length) return i;
    }
    m = candidate.match(/^(\d+)(?:\s*[\).:\-–—]|\s|$)/);
    if (m) {
      const i = parseInt(m[1], 10) - 1;
      if (i >= 0 && i < choices.length) return i;
    }
    const lower = candidate.toLowerCase();
    for (let i = 0; i < choices.length; i++) {
      if (String(choices[i] || '').trim().toLowerCase() === lower) return i;
    }
  }
  return -1;
}

// Reads a plain-text version of a Word document (from mammoth) and turns it
// into question objects. Expected shape is shown in the Admin panel.
function parseWordQuestions(text) {
  const lines = String(text || '')
    .replace(/\r/g, '')
    .split('\n')
    .map(l => l.replace(/\u00a0/g, ' ').trim())
    .filter(Boolean);

  const questions = [];
  let skipped = 0;
  let cur = null;
  let pendingType = '';
  let mode = '';

  function finish() {
    if (!cur) return;
    const options = (cur.options || []).map(o => o.trim()).filter(Boolean);
    if (cur.question && options.length >= 2 && cur.answered && cur.answer >= 0 && cur.answer < options.length) {
      questions.push({
        question: cur.question.replace(/\s+/g, ' ').trim(),
        options,
        answer: cur.answer,
        explanation: (cur.explanation || '').replace(/\s+/g, ' ').trim(),
        typeName: (cur.typeName || pendingType || '').trim()
      });
    } else {
      skipped++;
    }
    cur = null;
    mode = '';
  }

  lines.forEach(line => {
    const typeMatch = line.match(/^type\s*(?:\d+)?\s*[:\-–—]\s*(.+)$/i);
    if (typeMatch) {
      const name = typeMatch[1].trim();
      if (cur && !cur.answered) cur.typeName = name;
      else {
        if (cur) finish();
        pendingType = name;
      }
      return;
    }

    const answerMatch = line.match(/^(?:correct\s+)?(?:answer|ans)\s*[:\-–—.]?\s*(.*)$/i);
    if (answerMatch && cur) {
      cur.answer = parseAnswerIndex(answerMatch[1], cur.options || []);
      cur.answered = true;
      mode = 'answer';
      return;
    }

    const expMatch = line.match(/^(?:explanation|explain|solution)\s*[:\-–—.]?\s*(.*)$/i);
    if (expMatch && cur) {
      cur.explanation = expMatch[1].trim();
      mode = 'explanation';
      return;
    }

    const optMatch = line.match(/^\(([a-z])\)\s*(.*)$/i) || line.match(/^([a-z])[\).:\-–—]\s*(.*)$/i);
    if (optMatch && cur && !cur.answered) {
      cur.options.push(optMatch[2].trim());
      mode = 'option';
      return;
    }

    const qMatch = line.match(/^(?:q(?:uestion)?\s*[.\-:]?\s*)?(\d+)\s*[\).:\-]\s*(.+)$/i);
    if (qMatch && (!cur || cur.answered || (cur.options && cur.options.length))) {
      if (cur) finish();
      cur = { question: qMatch[2].trim(), options: [], answer: -1, answered: false, explanation: '', typeName: '' };
      mode = 'question';
      return;
    }

    if (!cur) return;
    if (mode === 'explanation') {
      cur.explanation += (cur.explanation ? ' ' : '') + line;
    } else if (mode === 'answer') {
      cur.explanation = (cur.explanation ? cur.explanation + ' ' : '') + line;
    } else if (mode === 'option' && cur.options.length) {
      cur.options[cur.options.length - 1] += ' ' + line;
    } else {
      cur.question += ' ' + line;
    }
  });

  finish();
  return { questions, skipped };
}

function addParsedQuestions(parsed, catId, subId, topicId, defaultTypeId) {
  const topic = data.categories[catId]?.subcategories[subId]?.topics[topicId];
  if (!topic) return { added: 0, createdTypes: 0 };
  if (!Array.isArray(topic.questions)) topic.questions = [];
  let createdTypes = 0;
  parsed.forEach(item => {
    let typeId = '';
    if (item.typeName) {
      const before = Object.keys(getTopicTypes(topic)).length;
      typeId = ensureTopicType(topic, item.typeName);
      if (Object.keys(getTopicTypes(topic)).length > before) createdTypes++;
    } else if (defaultTypeId && getTopicTypes(topic)[defaultTypeId]) {
      typeId = defaultTypeId;
    }
    const q = {
      id: genId(),
      question: item.question,
      options: item.options,
      answer: item.answer,
      explanation: item.explanation || '',
      image: '',
      expImage: ''
    };
    if (typeId) q.type = typeId;
    topic.questions.push(q);
  });
  return { added: parsed.length, createdTypes };
}

// ======================== EXCEL IMPORT ========================
function excelHeaderKey(value) {
  return String(value == null ? '' : value).toLowerCase().replace(/[^a-z0-9]/g, '');
}

const EXCEL_COLUMNS = {
  category: ['category', 'subject', 'cat'],
  subcategory: ['subcategory', 'subcat', 'section', 'unit'],
  topic: ['topic', 'chapter', 'lesson'],
  type: ['type', 'questiontype', 'typeofquestion']
};

function excelColumnIndexes(headerRow) {
  const idx = {};
  (headerRow || []).forEach((cell, i) => {
    const key = excelHeaderKey(cell);
    if (!key) return;
    Object.keys(EXCEL_COLUMNS).forEach(field => {
      if (idx[field] === undefined && EXCEL_COLUMNS[field].includes(key)) idx[field] = i;
    });
  });
  return idx;
}

function parseExcelSheets(XLSX, wb) {
  const rows = [];
  let skipped = 0;
  let headerFound = false;
  (wb.SheetNames || []).forEach(sheetName => {
    const ws = wb.Sheets[sheetName];
    if (!ws) return;
    const matrix = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '', blankrows: false });
    if (!matrix || !matrix.length) return;

    let headerAt = -1;
    let idx = null;
    for (let r = 0; r < Math.min(matrix.length, 8); r++) {
      const candidate = excelColumnIndexes(matrix[r]);
      if (candidate.category !== undefined && candidate.topic !== undefined) {
        headerAt = r;
        idx = candidate;
        break;
      }
    }
    if (headerAt === -1) return;
    headerFound = true;

    const cell = (row, field) => {
      const i = idx[field];
      if (i === undefined) return '';
      const v = row[i];
      return v == null ? '' : String(v).trim();
    };

    for (let r = headerAt + 1; r < matrix.length; r++) {
      const row = matrix[r] || [];
      if (!row.some(v => String(v == null ? '' : v).trim() !== '')) continue;
      const item = {
        category: cell(row, 'category'),
        subcategory: cell(row, 'subcategory'),
        topic: cell(row, 'topic'),
        type: cell(row, 'type')
      };
      if (!item.category || !item.subcategory || !item.topic) { skipped++; continue; }
      rows.push(item);
    }
  });
  return { rows, skipped, headerFound };
}

function findByNameIn(collection, name) {
  const target = String(name || '').trim().toLowerCase();
  if (!target) return '';
  return Object.keys(collection || {}).find(id => String((collection[id] || {}).name || '').trim().toLowerCase() === target) || '';
}

function uniqueImportId(collection, name) {
  const base = String(name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'item';
  let id = base;
  let n = 2;
  while (collection[id]) id = base + '-' + n++;
  return id;
}

function ensureImportCategory(name) {
  const clean = String(name || '').trim();
  const existing = findByNameIn(data.categories, clean);
  if (existing) return { id: existing, created: false };
  const id = uniqueImportId(data.categories, clean);
  const nextOrder = Object.keys(data.categories).reduce((m, k) => Math.max(m, data.categories[k].order || 0), 0) + 1;
  data.categories[id] = { id, name: clean, icon: '📂', iconImage: '', color: null, subcategories: {}, order: nextOrder };
  return { id, created: true };
}

function ensureImportSubcategory(cat, name) {
  const clean = String(name || '').trim();
  if (!cat.subcategories) cat.subcategories = {};
  const existing = findByNameIn(cat.subcategories, clean);
  if (existing) return { id: existing, created: false };
  const id = uniqueImportId(cat.subcategories, clean);
  const nextOrder = Object.keys(cat.subcategories).reduce((m, k) => Math.max(m, cat.subcategories[k].order || 0), 0) + 1;
  cat.subcategories[id] = { id, name: clean, topics: {}, order: nextOrder };
  return { id, created: true };
}

function ensureImportTopic(sub, name) {
  const clean = String(name || '').trim();
  if (!sub.topics) sub.topics = {};
  const existing = findByNameIn(sub.topics, clean);
  if (existing) return { id: existing, created: false };
  const id = uniqueImportId(sub.topics, clean);
  const nextOrder = Object.keys(sub.topics).reduce((m, k) => Math.max(m, sub.topics[k].order || 0), 0) + 1;
  sub.topics[id] = { id, name: clean, questions: [], types: {}, order: nextOrder };
  return { id, created: true };
}

function importExcelRows(rows) {
  const stats = { categories: 0, subcategories: 0, topics: 0, types: 0, rows: 0 };
  (rows || []).forEach(item => {
    stats.rows++;
    const catRes = ensureImportCategory(item.category);
    if (catRes.created) stats.categories++;
    const cat = data.categories[catRes.id];

    const subRes = ensureImportSubcategory(cat, item.subcategory);
    if (subRes.created) stats.subcategories++;
    const sub = cat.subcategories[subRes.id];

    const topicRes = ensureImportTopic(sub, item.topic);
    if (topicRes.created) stats.topics++;
    const topic = sub.topics[topicRes.id];

    if (item.type) {
      const before = Object.keys(getTopicTypes(topic)).length;
      ensureTopicType(topic, item.type);
      if (Object.keys(getTopicTypes(topic)).length > before) stats.types++;
    }
  });
  return stats;
}

async function importFromExcel() {
  const fileInput = document.getElementById('adminExcelFile');
  const btn = document.getElementById('adminExcelImportBtn');
  const file = fileInput && fileInput.files ? fileInput.files[0] : null;

  if (!file) { alert('Choose an Excel file (.xlsx, .xls or .csv) to import.'); return; }
  if (!/\.(xlsx|xls|csv)$/i.test(file.name)) { alert('Please choose an Excel file (.xlsx, .xls) or a .csv file.'); return; }

  if (btn) { btn.disabled = true; btn.innerHTML = 'Reading...'; }
  try {
    const XLSX = await loadXLSX();
    const buffer = await file.arrayBuffer();
    const wb = XLSX.read(buffer, { type: 'array' });
    const parsed = parseExcelSheets(XLSX, wb);

    if (!parsed.headerFound || !parsed.rows.length) {
      alert('No usable rows found.' +
        '\n\nThe first row must contain headers: Category, Subcategory, Topic, Type.' +
        (parsed.skipped ? '\n\n' + parsed.skipped + ' row(s) were skipped because Category, Subcategory or Topic was empty.' : ''));
      return;
    }

    let message = 'Found ' + parsed.rows.length + ' row' + (parsed.rows.length === 1 ? '' : 's') + ' in "' + file.name + '".';
    if (parsed.skipped) message += '\n' + parsed.skipped + ' row(s) will be skipped (missing Category, Subcategory or Topic).';
    message += '\n\nImport now? Missing categories, subcategories, topics and types will be created.';
    if (!confirm(message)) return;

    const stats = importExcelRows(parsed.rows);
    await saveData();
    renderDashboard();
    updateStats();
    renderAdmin();

    alert('Excel import complete.' +
      '\nRows processed: ' + stats.rows +
      '\nTopics created: ' + stats.topics +
      '\nTypes created: ' + stats.types +
      (stats.categories ? '\nCategories created: ' + stats.categories : '') +
      (stats.subcategories ? '\nSubcategories created: ' + stats.subcategories : ''));
  } catch (e) {
    alert(/Excel import library/.test(e.message || '') ? e.message : 'Could not read the Excel file: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-file-excel"></i> Import Excel'; }
  }
}

async function importQuestionsFromWord() {
  const catId = document.getElementById('adminQCat').value;
  const subId = document.getElementById('adminQSub').value;
  const topicId = document.getElementById('adminQTopic').value;
  const fileInput = document.getElementById('adminQImportFile');
  const btn = document.getElementById('adminQImportBtn');
  const file = fileInput && fileInput.files ? fileInput.files[0] : null;

  if (!catId || !subId || !topicId) { alert('Select Category, Subcategory and Topic first.'); return; }
  if (!file) { alert('Choose a Word (.docx) file to import.'); return; }
  if (!/\.docx$/i.test(file.name)) { alert('Please choose a .docx Word document (save older .doc files as .docx first).'); return; }

  const topic = data.categories[catId]?.subcategories[subId]?.topics[topicId];
  if (!topic) return;

  if (btn) { btn.disabled = true; btn.textContent = 'Reading...'; }
  try {
    const lib = await loadMammoth();
    const arrayBuffer = await file.arrayBuffer();
    const result = await lib.extractRawText({ arrayBuffer });
    const parsed = parseWordQuestions(result.value || '');
    if (!parsed.questions.length) {
      alert('No valid questions found in this document.' +
        (parsed.skipped ? '\n\n' + parsed.skipped + ' block(s) were skipped because options or an answer were missing.' : ''));
      return;
    }

    let message = 'Found ' + parsed.questions.length + ' question' + (parsed.questions.length === 1 ? '' : 's') + ' in "' + file.name + '".';
    if (parsed.skipped) message += '\n' + parsed.skipped + ' block(s) will be skipped (missing options or answer).';
    message += '\n\nImport into "' + topic.name + '"?';
    if (!confirm(message)) return;

    const defaultTypeId = document.getElementById('adminQType').value;
    const res = addParsedQuestions(parsed.questions, catId, subId, topicId, defaultTypeId);
    await saveData();
    renderDashboard();
    updateStats();
    renderAdmin();
    alert('Imported ' + res.added + ' question' + (res.added === 1 ? '' : 's') + ' into "' + topic.name + '"' +
      (res.createdTypes ? ' and created ' + res.createdTypes + ' new type' + (res.createdTypes === 1 ? '' : 's') : '') + '.');
  } catch (e) {
    alert(/Word import library/.test(e.message || '') ? e.message : 'Could not read the Word document: ' + e.message);
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-file-import"></i> Import Questions'; }
  }
}

function clearAdminQForm() {
  document.getElementById('adminQCat').value = '';
  document.getElementById('adminQSub').innerHTML = '<option value="">Select Subcategory</option>';
  document.getElementById('adminQTopic').innerHTML = '<option value="">Select Topic</option>';
  document.getElementById('adminQQ').value = '';
  [0, 1, 2, 3].forEach(i => document.getElementById('adminQO' + i).value = '');
  document.getElementById('adminQExp').value = '';
  document.getElementById('adminQAns').value = '0';
  populateAdminQType('', '', '');
  document.getElementById('adminQImg').value = '';
  document.getElementById('adminQImgName').innerHTML = '';
  document.getElementById('adminQExpImg').value = '';
  document.getElementById('adminQExpImgName').innerHTML = '';
  document.getElementById('adminQEditId').value = '';
  document.getElementById('adminQEditCat').value = '';
  document.getElementById('adminQEditSub').value = '';
  document.getElementById('adminQEditTopic').value = '';
}

function editAdminQ(catId, subId, topicId, qId) {
  const topic = data.categories[catId]?.subcategories[subId]?.topics[topicId];
  if (!topic) return;
  const q = (topic.questions || []).find(q => q.id == qId);
  if (!q) return;
  document.getElementById('adminQEditCat').value = catId;
  document.getElementById('adminQEditSub').value = subId;
  document.getElementById('adminQEditTopic').value = topicId;
  document.getElementById('adminQCat').value = catId;
  const subSel = document.getElementById('adminQSub');
  subSel.innerHTML = '<option value="">Select Subcategory</option>';
  const cat = data.categories[catId];
  if (cat) sortedKeys(cat.subcategories || {}).forEach(s => { subSel.innerHTML += '<option value="' + s + '"' + (s === subId ? ' selected' : '') + '>' + cat.subcategories[s].name + '</option>'; });
  const topicSel = document.getElementById('adminQTopic');
  topicSel.innerHTML = '<option value="">Select Topic</option>';
  if (cat && cat.subcategories[subId]) sortedKeys(cat.subcategories[subId].topics || {}).forEach(t => { topicSel.innerHTML += '<option value="' + t + '"' + (t === topicId ? ' selected' : '') + '>' + cat.subcategories[subId].topics[t].name + '</option>'; });
  document.getElementById('adminQQ').value = q.question;
  (q.options || []).forEach((o, oi) => document.getElementById('adminQO' + oi).value = o);
  document.getElementById('adminQAns').value = q.answer;
  document.getElementById('adminQExp').value = q.explanation || '';
  populateAdminQType(catId, subId, topicId);
  document.getElementById('adminQType').value = q.type || '';
  document.getElementById('adminQEditId').value = q.id;
  document.getElementById('adminAddQBtn').textContent = 'Update Question';
  document.getElementById('adminQImg').value = '';
  document.getElementById('adminQImgName').innerHTML = q.image ? '<img src="' + imgUrl(q.image) + '" style="max-width:80px;max-height:60px;vertical-align:middle;border-radius:4px;border:1px solid var(--border);">' : '';
  document.getElementById('adminQExpImg').value = '';
  document.getElementById('adminQExpImgName').innerHTML = q.expImage ? '<img src="' + imgUrl(q.expImage) + '" style="max-width:80px;max-height:60px;vertical-align:middle;border-radius:4px;border:1px solid var(--border);">' : '';
}

async function delAdminQ(catId, subId, topicId, qId) {
  if (!confirm('Delete this question?')) return;
  const qs = data.categories[catId].subcategories[subId].topics[topicId].questions;
  const idx = qs.findIndex(q => q.id == qId);
  if (idx !== -1) { await deleteUploadedFile(qs[idx].image); await deleteUploadedFile(qs[idx].expImage); qs.splice(idx, 1); }
  await saveData(); renderDashboard(); renderAdmin(); updateStats();
}

// ======================== TEST BUILDER ========================
let _builderFilterRows = [];
let _builderSelected = new Set();
let _builderQMeta = new Map();
let _builderMode = 'mock';

function applyBuilderModeUI() {
  const topicMode = _builderMode === 'topic';
  document.querySelectorAll('.builder-mode-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === _builderMode);
  });
  const subtitleRow = document.getElementById('builderSubtitleRow');
  if (subtitleRow) subtitleRow.classList.toggle('hidden', topicMode);
  const addCat = document.getElementById('builderAddCatBtn');
  if (addCat) addCat.classList.toggle('hidden', topicMode);
  const saveBtn = document.getElementById('builderSaveBtn');
  if (saveBtn) saveBtn.innerHTML = topicMode
    ? '<i class="fas fa-save"></i> Save Topic Test'
    : '<i class="fas fa-save"></i> Save Mock Test';
  const hint = document.getElementById('builderModeHint');
  if (hint) hint.textContent = topicMode
    ? 'Pick one topic and save it under Topic Tests. Only that topic\'s questions can be selected.'
    : 'Pick questions from one or more categories and save it under Mock Tests.';
}

function setBuilderMode(mode) {
  if (mode !== 'mock' && mode !== 'topic') return;
  _builderMode = mode;
  applyBuilderModeUI();
  const duration = document.getElementById('builderDuration');
  const marks = document.getElementById('builderMarks');
  if (duration) duration.value = mode === 'topic' ? '10' : '20';
  if (marks) marks.value = mode === 'topic' ? '10' : '25';
  const subtitle = document.getElementById('builderSubtitle');
  if (subtitle) subtitle.value = '';
  _builderSelected = new Set();
  _builderFilterRows = [{ cat: '', sub: '', topic: '' }];
  renderBuilderFilterRows();
  renderBuilderQList();
  renderExistingTests();
}

function renderBuilder() {
  applyBuilderModeUI();
  const topicMode = _builderMode === 'topic';
  document.getElementById('builderName').value = '';
  document.getElementById('builderSubtitle').value = '';
  document.getElementById('builderDuration').value = topicMode ? '10' : '20';
  document.getElementById('builderMarks').value = topicMode ? '10' : '25';
  _builderSelected = new Set();
  _builderQMeta = new Map();
  forEachQ((q, i, catId, subId, topicId, cat, sub, topic) => {
    _builderQMeta.set(q.id, {
      q,
      catId,
      subId,
      topicId,
      catName: cat ? cat.name : 'General'
    });
  });
  _builderFilterRows = [{ cat: '', sub: '', topic: '' }];
  renderBuilderFilterRows();
  renderBuilderQList();
  renderExistingTests();
}

function builderCatOptions(selected) {
  let html = '<option value="">Select Category</option>';
  sortedKeys(data.categories).forEach(catId => {
    html += '<option value="' + catId + '"' + (catId === selected ? ' selected' : '') + '>' + esc(data.categories[catId].name) + '</option>';
  });
  return html;
}

function builderSubOptions(state) {
  let html = '<option value="">Select Subcategory</option>';
  const cat = data.categories[state.cat];
  if (cat) {
    if (_builderMode !== 'topic') html += '<option value="__all__"' + (state.sub === '__all__' ? ' selected' : '') + '>All Subcategories</option>';
    sortedKeys(cat.subcategories || {}).forEach(sid => {
      html += '<option value="' + sid + '"' + (sid === state.sub ? ' selected' : '') + '>' + esc(cat.subcategories[sid].name) + '</option>';
    });
  }
  return html;
}

function builderTopicOptions(state) {
  let html = '<option value="">Select Topic</option>';
  const sub = state.cat && state.sub && state.sub !== '__all__'
    ? (data.categories[state.cat]?.subcategories || {})[state.sub]
    : null;
  if (sub) {
    if (_builderMode !== 'topic') html += '<option value="__all__"' + (state.topic === '__all__' ? ' selected' : '') + '>All Topics</option>';
    sortedKeys(sub.topics || {}).forEach(tid => {
      html += '<option value="' + tid + '"' + (tid === state.topic ? ' selected' : '') + '>' + esc(sub.topics[tid].name) + '</option>';
    });
  }
  return html;
}

function createBuilderFilterRow(state) {
  const row = document.createElement('div');
  row.className = 'builder-filter-row';

  const catSel = document.createElement('select');
  catSel.className = 'bf-cat';
  catSel.setAttribute('aria-label', 'Category');
  catSel.innerHTML = builderCatOptions(state.cat);

  const subSel = document.createElement('select');
  subSel.className = 'bf-sub';
  subSel.setAttribute('aria-label', 'Subcategory');
  subSel.innerHTML = builderSubOptions(state);
  subSel.disabled = !state.cat;

  const topicSel = document.createElement('select');
  topicSel.className = 'bf-topic';
  topicSel.setAttribute('aria-label', 'Topic');
  topicSel.innerHTML = builderTopicOptions(state);
  topicSel.disabled = !(state.cat && state.sub && state.sub !== '__all__');

  catSel.onchange = function () {
    state.cat = this.value;
    state.sub = '';
    state.topic = '';
    subSel.innerHTML = builderSubOptions(state);
    subSel.disabled = !state.cat;
    topicSel.innerHTML = builderTopicOptions(state);
    topicSel.disabled = true;
    renderBuilderQList();
  };

  subSel.onchange = function () {
    state.sub = this.value;
    state.topic = '';
    topicSel.innerHTML = builderTopicOptions(state);
    topicSel.disabled = !(state.cat && state.sub && state.sub !== '__all__');
    renderBuilderQList();
  };

  topicSel.onchange = function () {
    state.topic = this.value;
    renderBuilderQList();
  };

  const remove = document.createElement('button');
  remove.type = 'button';
  remove.className = 'bf-remove';
  remove.title = 'Remove this category';
  remove.setAttribute('aria-label', 'Remove this category');
  remove.innerHTML = '<i class="fas fa-xmark"></i>';
  remove.disabled = _builderFilterRows.length <= 1;
  if (_builderMode === 'topic') remove.classList.add('hidden');
  remove.addEventListener('click', function () { removeBuilderFilterRow(state); });

  row.appendChild(catSel);
  row.appendChild(subSel);
  row.appendChild(topicSel);
  row.appendChild(remove);
  return row;
}

function renderBuilderFilterRows() {
  const wrap = document.getElementById('builderFilterRows');
  if (!wrap) return;
  wrap.innerHTML = '';
  _builderFilterRows.forEach(state => wrap.appendChild(createBuilderFilterRow(state)));
}

function addBuilderFilterRow() {
  if (_builderMode === 'topic') return;
  _builderFilterRows.push({ cat: '', sub: '', topic: '' });
  renderBuilderFilterRows();
  renderBuilderQList();
}

function removeBuilderFilterRow(state) {
  if (_builderFilterRows.length <= 1) return;
  _builderFilterRows = _builderFilterRows.filter(s => s !== state);
  renderBuilderFilterRows();
  renderBuilderQList();
}

function builderMatches(state, meta) {
  if (!state.cat || state.cat !== meta.catId) return false;
  if (state.sub && state.sub !== '__all__' && state.sub !== meta.subId) return false;
  if (state.topic && state.topic !== '__all__' && state.topic !== meta.topicId) return false;
  return true;
}

function pruneBuilderSelection() {
  _builderSelected.forEach(id => {
    const meta = _builderQMeta.get(id);
    if (!meta || !_builderFilterRows.some(state => builderMatches(state, meta))) _builderSelected.delete(id);
  });
}

function renderBuilderQList() {
  const container = document.getElementById('builderQList');
  if (!container) return;
  container.innerHTML = '';
  pruneBuilderSelection();

  const topicReady = _builderFilterRows.some(s => s.cat && s.sub && s.sub !== '__all__' && s.topic && s.topic !== '__all__');
  const mockReady = _builderFilterRows.some(s => s.cat);
  const ready = _builderMode === 'topic' ? topicReady : mockReady;

  if (!ready) {
    container.innerHTML = '<p class="builder-empty">' + (_builderMode === 'topic'
      ? 'Select a category, subcategory and topic to see its questions.'
      : 'Select a category to see its questions. Use “Add Category” to include another subject in the same test.') + '</p>';
    updateBuilderSelectAll();
    return;
  }

  let shown = 0;
  forEachQ((q, i, catId, subId, topicId, cat, sub, topic) => {
    const meta = _builderQMeta.get(q.id);
    if (!meta) return;
    if (!_builderFilterRows.some(state => builderMatches(state, meta))) return;
    shown++;

    const div = document.createElement('div');
    div.className = 'builder-qitem';

    const check = document.createElement('input');
    check.type = 'checkbox';
    check.className = 'bq-check';
    check.value = q.id;
    check.checked = _builderSelected.has(q.id);
    check.addEventListener('change', function () {
      if (this.checked) _builderSelected.add(q.id);
      else _builderSelected.delete(q.id);
      updateBuilderSelectAll();
    });

    const text = document.createElement('div');
    text.className = 'bq-text';
    text.textContent = q.question;

    const metaEl = document.createElement('div');
    metaEl.className = 'bq-meta';
    metaEl.textContent = cat.name + ' → ' + sub.name + ' → ' + topic.name;

    div.appendChild(check);
    div.appendChild(text);
    div.appendChild(metaEl);
    container.appendChild(div);
  });

  if (!shown) container.innerHTML = '<p class="builder-empty">No questions match your filters.</p>';
  updateBuilderSelectAll();
}

function updateBuilderSelectAll() {
  const all = document.getElementById('builderSelectAll');
  const checks = Array.from(document.querySelectorAll('#builderQList .bq-check'));
  const selected = checks.filter(c => c.checked).length;
  if (all) {
    all.checked = checks.length > 0 && selected === checks.length;
    all.indeterminate = selected > 0 && selected < checks.length;
    all.disabled = checks.length === 0;
  }
  const shown = document.getElementById('builderShownCount');
  if (shown) shown.textContent = checks.length ? selected + ' of ' + checks.length + ' shown selected' : '';
  const total = document.getElementById('builderTotalSelected');
  if (total) total.textContent = _builderSelected.size + ' selected';
}

function renderExistingTests() {
  const mockContainer = document.getElementById('builderTestList');
  if (mockContainer) {
    if (!mockTests.length) {
      mockContainer.innerHTML = '<p style="color:var(--text2);font-size:13px;">No mock tests created yet.</p>';
    } else {
      mockContainer.innerHTML = mockTests.map((t, i) => `
        <div class="admin-item">
          <span><strong>${esc(t.name)}</strong> — ${t.duration} min, ${t.totalMarks} marks, ${(t.questionIds || []).length} questions</span>
          <button class="edit-btn" onclick="editMockTest(${i})">Edit</button>
          <button class="del-btn" onclick="delMockTest(${i})">Del</button>
        </div>`).join('');
    }
  }

  const topicContainer = document.getElementById('builderTopicTestList');
  if (topicContainer) {
    if (!topicTests.length) {
      topicContainer.innerHTML = '<p style="color:var(--text2);font-size:13px;">No topic tests created yet.</p>';
    } else {
      topicContainer.innerHTML = topicTests.map((test, i) => {
        const cat = data.categories[test.catId];
        const sub = cat && cat.subcategories[test.subId];
        const topic = sub && sub.topics[test.topicId];
        const path = [cat && cat.name, sub && sub.name, topic && topic.name].filter(Boolean).join(' › ') || 'Topic removed';
        return '<div class="admin-item">' +
          '<span><strong>' + esc(test.name) + '</strong> — ' + esc(path) + ', ' + test.duration + ' min, ' + test.totalMarks + ' marks, ' + (test.questionIds || []).length + ' questions</span>' +
          '<button class="edit-btn" onclick="editTopicTest(' + i + ')">Edit</button>' +
          '<button class="del-btn" onclick="delTopicTest(' + i + ')">Del</button>' +
          '</div>';
      }).join('');
    }
  }
}

document.getElementById('builderSaveBtn').addEventListener('click', function () {
  const name = document.getElementById('builderName').value.trim();
  const subtitle = document.getElementById('builderSubtitle').value.trim();
  const duration = parseInt(document.getElementById('builderDuration').value, 10);
  const totalMarks = parseInt(document.getElementById('builderMarks').value, 10);
  const ids = Array.from(_builderSelected);

  if (!name) { alert('Enter a test name.'); return; }
  if (!ids.length) { alert('Select at least one question.'); return; }

  if (_builderMode === 'topic') {
    const state = _builderFilterRows[0] || {};
    if (_builderFilterRows.length !== 1 || !state.cat || !state.sub || !state.topic || state.sub === '__all__' || state.topic === '__all__') {
      alert('Select a category, subcategory and topic.');
      return;
    }
    const cat = data.categories[state.cat];
    const sub = cat && cat.subcategories[state.sub];
    const topic = sub && sub.topics[state.topic];
    if (!cat || !sub || !topic) {
      alert('Select a valid category, subcategory and topic.');
      return;
    }

    topicTests.push({
      id: 'topiccustom:' + Date.now() + ':' + Math.floor(Math.random() * 10000),
      name,
      duration: duration || 10,
      totalMarks: totalMarks || ids.length,
      catId: state.cat,
      subId: state.sub,
      topicId: state.topic,
      subtitle: 'Topic-wise Test · ' + cat.name + ' › ' + sub.name + ' › ' + topic.name,
      questionIds: ids,
      custom: true
    });
    saveData();
    renderBuilder();
    renderTopicTests();
    alert('Topic test "' + name + '" created with ' + ids.length + ' question' + (ids.length === 1 ? '' : 's') + '!');
    return;
  }

  const catCount = new Set(ids.map(id => (_builderQMeta.get(id) || {}).catId).filter(Boolean)).size;
  mockTests.push({ id: Date.now(), name, subtitle, duration: duration || 20, totalMarks: totalMarks || ids.length, questionIds: ids });
  saveData();
  renderBuilder();
  renderMockList();
  alert('Mock test "' + name + '" created with ' + ids.length + ' questions' + (catCount > 1 ? ' from ' + catCount + ' categories' : '') + '!');
});

document.getElementById('builderAddCatBtn').addEventListener('click', addBuilderFilterRow);

document.getElementById('builderSelectAll').addEventListener('change', function () {
  const checks = document.querySelectorAll('#builderQList .bq-check');
  checks.forEach(cb => {
    cb.checked = this.checked;
    const id = Number(cb.value);
    if (this.checked) _builderSelected.add(id);
    else _builderSelected.delete(id);
  });
  updateBuilderSelectAll();
});

function editMockTest(idx) {
  const t = mockTests[idx];
  const name = prompt('Test name:', t.name);
  if (!name) return;
  t.name = name;
  saveData(); renderBuilder();
}

function delMockTest(idx) {
  if (!confirm('Delete "' + mockTests[idx].name + '"?')) return;
  clearExamSession(mockTests[idx].id);
  mockTests.splice(idx, 1);
  saveData(); renderBuilder(); renderMockList();
}

// ======================== MOCK TEST PLAYER ========================
let _mockState = null;
let _examToastTimer = null;

// In-progress attempts are saved so leaving the exam (e.g. going Home) does
// not lose answers. Keyed by mock test id.
const EXAM_SESSION_KEY = 'studyhub_exam_session';

function loadExamSessions() {
  try {
    const raw = localStorage.getItem(EXAM_SESSION_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch (e) { return {}; }
}

function persistExamSessions(all) {
  try { localStorage.setItem(EXAM_SESSION_KEY, JSON.stringify(all)); } catch (e) {}
}

function getExamSession(testId) {
  if (testId === undefined || testId === null) return null;
  return loadExamSessions()[testId] || null;
}

function saveExamSession() {
  if (!_mockState || _mockState.submitted) return;
  commitMockPending();
  const all = loadExamSessions();
  all[_mockState.test.id] = {
    answers: _mockState.answers,
    pending: _mockState.pending,
    marked: _mockState.marked,
    visited: _mockState.visited,
    idx: _mockState.idx,
    remaining: Math.max(0, _mockState.remaining),
    updatedAt: Date.now()
  };
  persistExamSessions(all);
}

function clearExamSession(testId) {
  const all = loadExamSessions();
  if (all[testId] !== undefined) {
    delete all[testId];
    persistExamSessions(all);
  }
}

function pruneExamSessions() {
  const all = loadExamSessions();
  const validIds = new Set(mockTests.map(t => String(t.id)));
  // Topic tests are generated from the current data, so include their ids too.
  forEachQ((q, i, catId, subId, topicId) => {
    validIds.add(topicTestId(catId, subId, topicId));
  });
  topicTests.forEach(t => validIds.add(String(t.id)));
  let changed = false;
  Object.keys(all).forEach(id => {
    if (!validIds.has(id)) { delete all[id]; changed = true; }
  });
  if (changed) persistExamSessions(all);
}

// Stable id for the auto-generated test of a single topic.
function topicTestId(catId, subId, topicId) {
  return 'topic:' + catId + '/' + subId + '/' + topicId;
}

function buildTopicTest(catId, subId, topicId) {
  const cat = data.categories[catId];
  const sub = cat && cat.subcategories[subId];
  const topic = sub && sub.topics[topicId];
  if (!topic) return null;
  const ids = (topic.questions || []).map(q => q.id);
  return {
    id: topicTestId(catId, subId, topicId),
    name: topic.name + ' — Topic Test',
    subtitle: 'Topic-wise Test · ' + cat.name + ' › ' + sub.name,
    duration: Math.max(5, ids.length),
    totalMarks: ids.length,
    questionIds: ids,
    topicRef: { catId, subId, topicId }
  };
}

function renderTopicTests() {
  populateTopicTestFilters();
  pruneExamSessions();
  renderTopicTestList();
}

function populateTopicTestFilters() {
  const catSel = document.getElementById('topicTestCat');
  const subSel = document.getElementById('topicTestSub');
  if (!catSel || !subSel) return;
  const prevCat = catSel.value;
  const prevSub = subSel.value;

  catSel.innerHTML = '<option value="">All Categories</option>';
  sortedKeys(data.categories).forEach(catId => {
    catSel.innerHTML += '<option value="' + catId + '">' + esc(data.categories[catId].name) + '</option>';
  });
  if (data.categories[prevCat]) catSel.value = prevCat;

  subSel.innerHTML = '<option value="">All Subcategories</option>';
  const cat = data.categories[catSel.value];
  if (cat) {
    sortedKeys(cat.subcategories || {}).forEach(subId => {
      subSel.innerHTML += '<option value="' + subId + '">' + esc(cat.subcategories[subId].name) + '</option>';
    });
  }
  if (Array.prototype.some.call(subSel.options, o => o.value === prevSub)) subSel.value = prevSub;
}

function populateTopicTestSubs() {
  const catSel = document.getElementById('topicTestCat');
  const subSel = document.getElementById('topicTestSub');
  if (!catSel || !subSel) return;
  const prevSub = subSel.value;
  subSel.innerHTML = '<option value="">All Subcategories</option>';
  const cat = data.categories[catSel.value];
  if (cat) {
    sortedKeys(cat.subcategories || {}).forEach(subId => {
      subSel.innerHTML += '<option value="' + subId + '">' + esc(cat.subcategories[subId].name) + '</option>';
    });
  }
  if (Array.prototype.some.call(subSel.options, o => o.value === prevSub)) subSel.value = prevSub;
}

function renderTopicTestList() {
  const container = document.getElementById('topicTestList');
  const customContainer = document.getElementById('topicTestCustomList');
  if (!container || !customContainer) return;
  const catId = document.getElementById('topicTestCat')?.value || '';
  const subId = document.getElementById('topicTestSub')?.value || '';
  const search = (document.getElementById('topicTestSearch')?.value || '').toLowerCase().trim();

  container.innerHTML = '';
  customContainer.innerHTML = '';
  let shown = 0;
  let total = 0;
  let autoShown = 0;
  let autoTotal = 0;
  let customShown = 0;

  const appendCard = (target, test, icon, path, title, note) => {
    const count = (test.questionIds || []).length;
    const saved = count ? getExamSession(test.id) : null;
    const answered = saved ? Object.keys(saved.answers || {}).length : 0;

    const div = document.createElement('div');
    div.className = 'mock-card topic-card' + (count ? '' : ' disabled');
    div.innerHTML =
      '<span class="topic-card-path">' + (icon ? esc(icon) + ' ' : '') + esc(path) + '</span>' +
      '<h3>' + esc(title) + '</h3>' +
      '<p><i class="fas fa-circle-question"></i> ' + count + ' question' + (count === 1 ? '' : 's') + '</p>' +
      '<p><i class="far fa-clock"></i> ' + (count ? test.duration + ' min' : '—') + '</p>' +
      (note ? '<p class="topic-card-types">' + esc(note) + '</p>' : '') +
      '<p class="mock-start">' + (count
        ? (saved
          ? '<i class="fas fa-rotate-left"></i> Resume saved attempt' + (answered ? ' · ' + answered + ' answered' : '')
          : '<i class="fas fa-play"></i> Start test')
        : '<i class="fas fa-circle-info"></i> No questions yet') + '</p>';

    if (count) {
      div.addEventListener('click', () => startExam(test, -1, 'topics'));
    }
    if (saved) {
      const reset = document.createElement('button');
      reset.type = 'button';
      reset.className = 'mock-restart';
      reset.textContent = 'Start over';
      reset.addEventListener('click', ev => {
        ev.stopPropagation();
        if (!confirm('Discard the saved answers for "' + title + '" and start again?')) return;
        clearExamSession(test.id);
        startExam(test, -1, 'topics');
      });
      div.appendChild(reset);
    }
    target.appendChild(div);
  };

  // Custom topic tests built in Admin → Test Builder.
  topicTests.forEach(test => {
    total++;
    const cat = data.categories[test.catId];
    const sub = cat && cat.subcategories[test.subId];
    const topic = sub && sub.topics[test.topicId];
    if (catId && test.catId !== catId) return;
    if (subId && test.subId !== subId) return;
    const hay = [test.name, cat && cat.name, sub && sub.name, topic && topic.name].join(' ').toLowerCase();
    if (search && !hay.includes(search)) return;
    customShown++;
    shown++;
    const path = [cat && cat.name, sub && sub.name, topic && topic.name].filter(Boolean).join(' › ');
    const icon = cat && !cat.iconImage ? (cat.icon || '📂') : '';
    appendCard(customContainer, test, icon, path, test.name, 'Custom test · ' + test.totalMarks + ' marks');
  });

  // Auto-generated quick test for every topic.
  sortedKeys(data.categories).forEach(c => {
    if (catId && c !== catId) return;
    const cat = data.categories[c];
    sortedKeys(cat.subcategories || {}).forEach(s => {
      if (subId && s !== subId) return;
      const sub = cat.subcategories[s];
      sortedKeys(sub.topics || {}).forEach(t => {
        autoTotal++;
        total++;
        const topic = sub.topics[t];
        if (search && !(topic.name + ' ' + sub.name + ' ' + cat.name).toLowerCase().includes(search)) return;
        autoShown++;
        shown++;

        const test = buildTopicTest(c, s, t);
        const typeCounts = questionTypeCounts(topic.questions, topic);
        const typeSummary = Object.keys(typeCounts).map(k => k + ': ' + typeCounts[k]).join(' · ');
        const icon = cat.iconImage ? '' : (cat.icon || '📂');
        appendCard(container, test, icon, cat.name + ' › ' + sub.name, topic.name, typeSummary);
      });
    });
  });

  if (!autoShown) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-list-check"></i><p>' +
      (autoTotal ? 'No quick topic tests match your filters.' : 'No topics with questions yet. Add questions in the Admin panel.') +
      '</p></div>';
  }
  const customHeading = document.getElementById('topicTestCustomHeading');
  if (customHeading) customHeading.classList.toggle('hidden', customShown === 0);
  const countEl = document.getElementById('topicTestCount');
  if (countEl) countEl.textContent = shown + ' of ' + total + ' test' + (total === 1 ? '' : 's');
}

// ======================== CUSTOM TOPIC TEST ACTIONS ========================
function editTopicTest(idx) {
  const t = topicTests[idx];
  if (!t) return;
  const name = prompt("Test name:", t.name);
  if (!name || !name.trim()) return;
  t.name = name.trim();
  saveData();
  renderExistingTests();
  renderMockList();
  renderTopicTests();
}

function delTopicTest(idx) {
  const t = topicTests[idx];
  if (!t) return;
  if (!confirm(`Delete "${t.name}"?`)) return;
  clearExamSession(t.id);
  topicTests.splice(idx, 1);
  saveData();
  renderExistingTests();
  renderMockList();
  renderTopicTests();
}

function renderMockList() {
  const container = document.getElementById('mockList');
  container.innerHTML = '';
  if (!mockTests.length) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><p>No mock tests yet. Create one in Admin → Test Builder.</p></div>';
    return;
  }
  pruneExamSessions();
  mockTests.forEach((t, i) => {
    const saved = getExamSession(t.id);
    const answered = saved ? Object.keys(saved.answers || {}).length : 0;
    const div = document.createElement('div'); div.className = 'mock-card';
    div.innerHTML = '<h3>' + esc(t.name) + '</h3><p><i class="far fa-clock"></i> ' + t.duration + ' min</p><p><i class="fas fa-star"></i> ' + t.totalMarks + ' marks</p><p style="color:var(--text2);">' + (t.questionIds || []).length + ' questions</p><p class="mock-start">' + (saved
      ? '<i class="fas fa-rotate-left"></i> Resume saved attempt' + (answered ? ' · ' + answered + ' answered' : '')
      : '<i class="fas fa-play"></i> Start test') + '</p>';
    div.addEventListener('click', () => startMockTest(i));
    if (saved) {
      const reset = document.createElement('button');
      reset.type = 'button';
      reset.className = 'mock-restart';
      reset.textContent = 'Start over';
      reset.addEventListener('click', ev => {
        ev.stopPropagation();
        if (!confirm('Discard the saved answers for "' + t.name + '" and start again?')) return;
        clearExamSession(t.id);
        startMockTest(i);
      });
      div.appendChild(reset);
    }
    container.appendChild(div);
  });
}

// Group the questions of a test into sections by their parent category.
function buildMockSections(questions) {
  const catName = new Map();
  forEachQ((q, i, catId, subId, topicId, cat) => { catName.set(q.id, cat ? cat.name : 'General'); });
  const byName = new Map();
  const sections = [];
  questions.forEach(q => {
    const name = catName.get(q.id) || 'General';
    let sec = byName.get(name);
    if (!sec) { sec = { name, ids: [] }; byName.set(name, sec); sections.push(sec); }
    sec.ids.push(q.id);
  });
  return sections.length ? sections : [{ name: 'General', ids: questions.map(q => q.id) }];
}

function startMockTest(idx) {
  startExam(mockTests[idx], idx, 'mocks');
}

function startExam(t, idx, returnPage) {
  stopMockTimer();
  if (!t) return;

  const qMap = new Map();
  forEachQ(q => { if ((t.questionIds || []).includes(q.id) && !qMap.has(q.id)) qMap.set(q.id, q); });
  const allQs = (t.questionIds || []).map(id => qMap.get(id)).filter(Boolean);
  if (!allQs.length) { alert('No questions found for this test.'); return; }

  switchPage('mocks');

  const saved = getExamSession(t.id);
  _mockState = {
    testIdx: idx,
    test: t,
    returnPage: returnPage || 'mocks',
    topicRef: t.topicRef || null,
    questions: allQs,
    idx: 0,
    answers: {},
    pending: {},
    marked: {},
    visited: {},
    sections: buildMockSections(allQs),
    activeSection: 0,
    submitted: false,
    paused: false,
    remaining: saved && typeof saved.remaining === 'number'
      ? Math.max(1, saved.remaining)
      : (t.duration || 20) * 60,
    _timer: null
  };

  if (saved) {
    const idMap = new Map(allQs.map(q => [String(q.id), q.id]));
    ['answers', 'pending', 'marked', 'visited'].forEach(key => {
      const src = saved[key];
      if (!src || typeof src !== 'object') return;
      Object.keys(src).forEach(id => {
        if (idMap.has(id)) _mockState[key][idMap.get(id)] = src[id];
      });
    });
    const savedIdx = Number(saved.idx);
    _mockState.idx = Number.isFinite(savedIdx)
      ? Math.max(0, Math.min(savedIdx, allQs.length - 1))
      : 0;
  }

  document.getElementById('mockListContainer').classList.add('hidden');
  document.getElementById('mockTestContainer').classList.remove('hidden');
  document.body.classList.add('exam-active');

  document.getElementById('mockTestTitle').textContent = t.name;
  const now = new Date();
  const defaultSubtitle =
    'Computer Based Test · ' +
    now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · Shift 1';
  document.getElementById('mockTestSubtitle').textContent = (t.subtitle || '').trim() || defaultSubtitle;

  const backBtn = document.getElementById('mockResultBackBtn');
  if (backBtn) backBtn.textContent = _mockState.returnPage === 'topics' ? 'Back to Topic Tests' : 'Back to Mock Tests';

  const langSel = document.getElementById('mockLanguage');
  if (langSel) langSel.value = localStorage.getItem('studyhub_exam_lang') || 'en';

  document.getElementById('mockResultContainer').classList.add('hidden');
  closeMockModal('mockPauseOverlay');
  closeMockModal('mockInstructionsModal');
  closeMockModal('mockPaperModal');
  closeMockModal('mockSubmitModal');

  setMockPauseUI(false);
  setExamThemeIcon();
  updateMockFullscreenIcon();

  renderMockQuestion();
  startMockTimer(t.duration, !!saved);
  if (saved) showExamToast('Resumed your saved attempt');
}

function mockCurrentSection() {
  if (!_mockState) return 0;
  const q = _mockState.questions[_mockState.idx];
  if (!q) return 0;
  const i = _mockState.sections.findIndex(s => s.ids.includes(q.id));
  return i < 0 ? 0 : i;
}

function renderMockSubjects() {
  const nav = document.getElementById('mockSubjectNav');
  if (!nav || !_mockState) return;
  const active = mockCurrentSection();
  _mockState.activeSection = active;
  nav.innerHTML = '';
  _mockState.sections.forEach((sec, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'exam-subject' + (i === active ? ' active' : '');
    b.textContent = sec.name;
    b.addEventListener('click', () => mockSwitchSection(i));
    nav.appendChild(b);
  });
}

function mockSwitchSection(i) {
  if (!_mockState || _mockState.submitted) return;
  const sec = _mockState.sections[i];
  if (!sec || !sec.ids.length) return;
  commitMockPending();
  const gi = _mockState.questions.findIndex(q => q.id === sec.ids[0]);
  if (gi >= 0) _mockState.idx = gi;
  renderMockQuestion();
}

// Move the tentative selection into the committed answers.
function commitMockPending() {
  if (!_mockState) return false;
  const q = _mockState.questions[_mockState.idx];
  if (!q) return false;
  if (_mockState.pending[q.id] !== undefined) {
    _mockState.answers[q.id] = _mockState.pending[q.id];
    delete _mockState.pending[q.id];
    return true;
  }
  return false;
}

function renderMockQuestion() {
  if (!_mockState || _mockState.submitted) return;
  const s = _mockState;
  const q = s.questions[s.idx];
  if (!q) return;

  const sec = s.sections[mockCurrentSection()];
  const localNo = sec ? sec.ids.indexOf(q.id) + 1 : s.idx + 1;
  const lang = localStorage.getItem('studyhub_exam_lang') || 'en';

  s.visited[q.id] = true;

  document.getElementById('mockQNumber').textContent = localNo;
  document.getElementById('mockQText').textContent =
    (lang === 'hi' && q.question_hi) ? q.question_hi : q.question;

  const qImg = document.getElementById('mockQImg');
  if (q.image) { qImg.src = imgUrl(q.image); qImg.classList.remove('hidden'); }
  else { qImg.removeAttribute('src'); qImg.classList.add('hidden'); }

  const opts = document.getElementById('mockQOpts');
  opts.innerHTML = '';
  const optionList = (lang === 'hi' && Array.isArray(q.options_hi) && q.options_hi.length)
    ? q.options_hi
    : (q.options || []);
  const chosen = s.pending[q.id] !== undefined ? s.pending[q.id] : s.answers[q.id];

  if (!optionList.length) {
    const empty = document.createElement('p');
    empty.className = 'exam-palette-empty';
    empty.textContent = 'This question has no options.';
    opts.appendChild(empty);
  }

  optionList.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'exam-option' + (chosen === i ? ' selected' : '');
    btn.setAttribute('aria-pressed', chosen === i ? 'true' : 'false');

    const radio = document.createElement('span');
    radio.className = 'radio';
    radio.setAttribute('aria-hidden', 'true');

    const label = document.createElement('span');
    label.className = 'opt-label';
    label.textContent = String.fromCharCode(65 + i) + '.';

    const text = document.createElement('span');
    text.className = 'opt-text';
    text.textContent = opt;

    btn.appendChild(radio);
    btn.appendChild(label);
    btn.appendChild(text);
    btn.addEventListener('click', () => selectMockAnswer(i));
    opts.appendChild(btn);
  });

  document.getElementById('mockQExp').classList.add('hidden');

  const prev = document.getElementById('mockPrevBtn');
  if (prev) prev.disabled = s.idx === 0;

  const next = document.getElementById('mockNextBtn');
  if (next) {
    const last = s.idx === s.questions.length - 1;
    next.innerHTML = last
      ? 'Save &amp; Submit <i class="fas fa-check"></i>'
      : 'Save &amp; Next <i class="fas fa-chevron-right"></i>';
  }

  renderMockSubjects();
  renderMockPalette();
}

function selectMockAnswer(i) {
  if (!_mockState || _mockState.submitted || _mockState.paused) return;
  const q = _mockState.questions[_mockState.idx];
  _mockState.pending[q.id] = i;
  renderMockQuestion();
}

function mockSaveCurrent() {
  if (!_mockState || _mockState.submitted) return;
  const saved = commitMockPending();
  renderMockQuestion();
  showExamToast(saved ? 'Response saved' : 'No new response to save');
}

function mockNext() {
  if (!_mockState || _mockState.submitted) return;
  commitMockPending();
  if (_mockState.idx >= _mockState.questions.length - 1) {
    openMockSubmit();
    return;
  }
  _mockState.idx++;
  renderMockQuestion();
}

function mockPrev() {
  if (!_mockState || _mockState.submitted) return;
  commitMockPending();
  if (_mockState.idx > 0) {
    _mockState.idx--;
    renderMockQuestion();
  }
}

function mockMarkForReview() {
  if (!_mockState || _mockState.submitted) return;
  const q = _mockState.questions[_mockState.idx];
  commitMockPending();
  _mockState.marked[q.id] = true;
  renderMockQuestion();
  showExamToast('Marked for review');
}

function mockClearResponse() {
  if (!_mockState || _mockState.submitted) return;
  const q = _mockState.questions[_mockState.idx];
  delete _mockState.answers[q.id];
  delete _mockState.pending[q.id];
  renderMockQuestion();
  showExamToast('Response cleared');
}

function mockReportQuestion() {
  if (!_mockState || _mockState.submitted) return;
  const q = _mockState.questions[_mockState.idx];
  _mockState.marked[q.id] = true;
  renderMockPalette();
  showExamToast('Question flagged for review');
}

function mockQuestionStatus(qid) {
  const s = _mockState;
  const answered = s.answers[qid] !== undefined;
  const marked = !!s.marked[qid];
  const visited = !!s.visited[qid];
  if (marked && answered) return 'marked-answered';
  if (marked) return 'marked';
  if (answered) return 'answered';
  if (visited) return 'not-answered';
  return 'not-visited';
}

function mockSummaryCounts() {
  const counts = { answered: 0, notAnswered: 0, notVisited: 0, marked: 0, markedAnswered: 0 };
  if (!_mockState) return counts;
  _mockState.questions.forEach(q => {
    const st = mockQuestionStatus(q.id);
    if (st === 'answered') counts.answered++;
    else if (st === 'not-answered') counts.notAnswered++;
    else if (st === 'not-visited') counts.notVisited++;
    else if (st === 'marked') counts.marked++;
    else if (st === 'marked-answered') counts.markedAnswered++;
  });
  return counts;
}

function renderMockPalette() {
  if (!_mockState) return;
  const s = _mockState;
  const secIdx = mockCurrentSection();
  s.activeSection = secIdx;
  const sec = s.sections[secIdx] || { name: '—', ids: [] };
  const grid = document.getElementById('mockPaletteGrid');
  grid.innerHTML = '';

  const currentId = s.questions[s.idx] ? s.questions[s.idx].id : null;

  if (!sec.ids.length) {
    const empty = document.createElement('p');
    empty.className = 'exam-palette-empty';
    empty.textContent = 'No questions in this section.';
    grid.appendChild(empty);
  }

  sec.ids.forEach((qid, i) => {
    const status = mockQuestionStatus(qid);
    const b = document.createElement('button');
    b.type = 'button';
    b.className = status;
    b.textContent = i + 1;
    if (qid === currentId) b.classList.add('current');
    b.title = 'Question ' + (i + 1) + ' — ' + status.replace(/-/g, ' ');
    b.addEventListener('click', () => {
      if (!_mockState || _mockState.submitted) return;
      commitMockPending();
      const gi = _mockState.questions.findIndex(x => x.id === qid);
      if (gi >= 0) { _mockState.idx = gi; renderMockQuestion(); }
    });
    grid.appendChild(b);
  });

  document.getElementById('mockSectionName').textContent = sec.name;

  const c = mockSummaryCounts();
  setText('legendAnswered', c.answered);
  setText('legendNotAnswered', c.notAnswered);
  setText('legendNotVisited', c.notVisited);
  setText('legendMarked', c.marked);
  setText('legendMarkedAnswered', c.markedAnswered);
}

function setText(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value;
}

function updateMockTimerUI() {
  if (!_mockState) return;
  const rem = Math.max(0, _mockState.remaining);
  setText('mockTimerHours', String(Math.floor(rem / 3600)).padStart(2, '0'));
  setText('mockTimerMinutes', String(Math.floor((rem % 3600) / 60)).padStart(2, '0'));
  setText('mockTimerSeconds', String(rem % 60).padStart(2, '0'));
  const clock = document.getElementById('examClock');
  if (clock) {
    clock.classList.toggle('warning', rem <= 300 && rem > 60);
    clock.classList.toggle('danger', rem <= 60);
  }
}

function startMockTimer(duration, keepRemaining) {
  stopMockTimer();
  if (!_mockState) return;
  if (!keepRemaining && duration) _mockState.remaining = duration * 60;
  updateMockTimerUI();
  _mockState._timer = setInterval(() => {
    if (!_mockState || _mockState.submitted || _mockState.paused) return;
    _mockState.remaining--;
    updateMockTimerUI();
    if (_mockState.remaining <= 0) {
      stopMockTimer();
      showExamToast('Time is up — submitting your test');
      setTimeout(() => submitMockTest(), 800);
    }
  }, 1000);
}

function stopMockTimer() {
  if (_mockState && _mockState._timer) {
    clearInterval(_mockState._timer);
    _mockState._timer = null;
  }
}

function setMockPauseUI(paused) {
  const btn = document.getElementById('mockPauseBtn');
  if (btn) {
    btn.innerHTML = paused
      ? '<i class="fas fa-play"></i><span>Resume</span>'
      : '<i class="fas fa-pause"></i><span>Pause</span>';
  }
  const overlay = document.getElementById('mockPauseOverlay');
  if (overlay) overlay.classList.toggle('hidden', !paused);
}

function toggleMockPause() {
  if (!_mockState || _mockState.submitted) return;
  _mockState.paused = !_mockState.paused;
  setMockPauseUI(_mockState.paused);
  showExamToast(_mockState.paused ? 'Test paused' : 'Test resumed');
}

function toggleMockFullscreen() {
  const el = document.documentElement;
  if (!document.fullscreenElement) {
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => showExamToast('Fullscreen is not available in this browser'));
    }
  } else if (document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
}

function updateMockFullscreenIcon() {
  const btn = document.getElementById('mockFullscreenBtn');
  if (!btn) return;
  btn.innerHTML = document.fullscreenElement
    ? '<i class="fas fa-compress"></i><span>Exit</span>'
    : '<i class="fas fa-expand"></i><span>Fullscreen</span>';
}

function setExamThemeIcon() {
  const btn = document.getElementById('examThemeToggle');
  if (!btn) return;
  btn.innerHTML = document.body.classList.contains('dark')
    ? '<i class="fas fa-sun"></i>'
    : '<i class="fas fa-moon"></i>';
}

function toggleExamTheme() {
  toggleTheme();
  setExamThemeIcon();
}

// Leave the exam and return to the dashboard. An unfinished attempt is saved
// so it can be resumed from the Mock Tests page.
function examGoHome() {
  if (!_mockState) { switchPage('dashboard'); return; }
  if (_mockState.submitted) {
    clearExamSession(_mockState.test.id);
    quitMockTest();
    switchPage('dashboard');
    return;
  }
  if (!confirm('Go to Home? Your answers will be saved, and you can resume this test later.')) return;
  saveExamSession();
  quitMockTest();
  switchPage('dashboard');
}

function closeMockModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('hidden');
}

function showMockInstructions() {
  if (!_mockState || _mockState.paused) return;
  document.getElementById('mockInstructionsModal').classList.remove('hidden');
}

function showMockQuestionPaper() {
  if (!_mockState || _mockState.paused) return;
  const s = _mockState;
  const body = document.getElementById('mockPaperBody');
  const statusLabel = {
    'answered': 'Answered',
    'not-answered': 'Not answered',
    'not-visited': 'Not visited',
    'marked': 'Marked',
    'marked-answered': 'Marked & answered'
  };
  let html = '';
  s.sections.forEach(sec => {
    html += '<div class="exam-paper-section"><h3>' + esc(sec.name) + '</h3>';
    sec.ids.forEach(qid => {
      const q = s.questions.find(x => x.id === qid);
      if (!q) return;
      const st = mockQuestionStatus(qid);
      const localNo = sec.ids.indexOf(qid) + 1;
      html += '<div class="exam-paper-row">' +
        '<span class="exam-paper-num ' + st + '">' + localNo + '</span>' +
        '<span class="exam-paper-text">' + esc(q.question) + '</span>' +
        '<span class="exam-paper-status">' + statusLabel[st] + '</span>' +
        '</div>';
    });
    html += '</div>';
  });
  body.innerHTML = html || '<p>No questions available.</p>';
  document.getElementById('mockPaperModal').classList.remove('hidden');
}

function openMockSubmit() {
  if (!_mockState || _mockState.submitted) return;
  commitMockPending();
  renderMockPalette();
  const c = mockSummaryCounts();
  document.getElementById('mockSubmitSummary').innerHTML =
    '<div>Answered <b>' + (c.answered + c.markedAnswered) + '</b></div>' +
    '<div>Not answered <b>' + c.notAnswered + '</b></div>' +
    '<div>Marked <b>' + (c.marked + c.markedAnswered) + '</b></div>' +
    '<div>Not visited <b>' + c.notVisited + '</b></div>';
  document.getElementById('mockSubmitModal').classList.remove('hidden');
}

function submitMockTest() {
  if (!_mockState || _mockState.submitted) return;
  commitMockPending();
  clearExamSession(_mockState.test.id);
  _mockState.submitted = true;
  _mockState.paused = false;
  stopMockTimer();
  closeMockModal('mockSubmitModal');
  closeMockModal('mockPauseOverlay');

  const total = _mockState.questions.length;
  let correct = 0;
  const details = [];
  _mockState.questions.forEach(q => {
    const userAns = _mockState.answers[q.id];
    const isCorrect = userAns === q.answer;
    if (isCorrect) correct++;
    details.push({ q, userAns, isCorrect });
  });

  const pct = total ? Math.round(correct / total * 100) : 0;
  const circle = document.getElementById('mockResultCircle');
  circle.style.background = pct >= 80 ? 'var(--exam-green)' : pct >= 50 ? 'var(--exam-orange)' : 'var(--exam-red)';
  document.getElementById('mockResultPct').textContent = pct + '%';
  document.getElementById('mockResultSummary').innerHTML =
    '<strong>Score:</strong> ' + correct + '/' + total + ' (' + pct + '%)';

  const c = mockSummaryCounts();
  const stats = document.getElementById('mockResultStats');
  if (stats) {
    stats.innerHTML =
      '<span>Answered <b>' + (c.answered + c.markedAnswered) + '</b></span>' +
      '<span>Not answered <b>' + c.notAnswered + '</b></span>' +
      '<span>Marked <b>' + (c.marked + c.markedAnswered) + '</b></span>' +
      '<span>Not visited <b>' + c.notVisited + '</b></span>' +
      '<span>Correct <b>' + correct + '</b></span>' +
      '<span>Wrong <b>' + (total - correct) + '</b></span>';
  }

  let detailHtml = '';
  details.forEach((d, i) => {
    const q = d.q;
    detailHtml += '<div class="q-item" style="text-align:left;"><div class="q-num">Q' + (i + 1) + ' <span style="float:right;">' + (d.isCorrect ? '✅' : '❌') + '</span></div>';
    detailHtml += q.image ? '<img class="q-img" src="' + imgUrl(q.image) + '" alt="Question image">' : '';
    detailHtml += '<div class="q-text" style="font-size:14px;">' + esc(q.question) + '</div>';
    detailHtml += '<div class="q-opts">' + (q.options || []).map((o, oi) => {
      let cls = 'q-opt';
      if (oi === q.answer) cls += ' correct';
      if (oi === d.userAns && oi !== q.answer) cls += ' wrong';
      return '<div class="' + cls + '">' + String.fromCharCode(65 + oi) + '. ' + esc(o) + '</div>';
    }).join('') + '</div>';
    if (q.explanation || q.expImage) {
      detailHtml += '<div class="q-exp"><strong>Explanation:</strong> ' + esc(q.explanation || '') + (q.expImage ? '<br><img class="q-img" src="' + imgUrl(q.expImage) + '" alt="Explanation image">' : '') + '</div>';
    }
    detailHtml += '</div>';
  });

  document.getElementById('mockResultDetails').innerHTML = detailHtml;
  const result = document.getElementById('mockResultContainer');
  result.classList.remove('hidden');
  result.scrollTop = 0;
}

function retryMockTest() {
  if (!_mockState) return;
  const t = _mockState.test;
  const idx = _mockState.testIdx;
  const returnPage = _mockState.returnPage || 'mocks';
  if (confirm('Restart this test? Your current answers will be cleared.')) {
    clearExamSession(t.id);
    startExam(t, idx, returnPage);
  }
}

function quitMockTest() {
  const returnPage = _mockState ? (_mockState.returnPage || 'mocks') : 'mocks';
  stopMockTimer();
  _mockState = null;
  document.body.classList.remove('exam-active');
  const shell = document.getElementById('mockTestContainer');
  if (shell) shell.classList.add('hidden');
  document.getElementById('mockListContainer').classList.remove('hidden');
  document.getElementById('mockResultContainer').classList.add('hidden');
  if (document.fullscreenElement && document.exitFullscreen) {
    document.exitFullscreen().catch(() => {});
  }
  updateMockFullscreenIcon();
  if (returnPage === 'topics') switchPage('topics');
  else renderMockList();
}

function showExamToast(message) {
  const shell = document.getElementById('mockTestContainer');
  if (!shell) return;
  let toast = shell.querySelector('.exam-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'exam-toast';
    shell.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(_examToastTimer);
  _examToastTimer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function onMockLanguageChange(e) {
  const val = e.target.value === 'hi' ? 'hi' : 'en';
  localStorage.setItem('studyhub_exam_lang', val);
  renderMockQuestion();
}

// ======================== THEME ========================
function setThemeToggleUI(isDark) {
  const el = document.getElementById('themeToggle');
  if (!el) return;
  el.innerHTML = isDark ? '<i class="fas fa-sun"></i> <span>Light mode</span>' : '<i class="fas fa-moon"></i> <span>Dark mode</span>';
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  setThemeToggleUI(isDark);
}

function loadTheme() {
  if (localStorage.getItem(THEME_KEY) === 'dark') {
    document.body.classList.add('dark');
    setThemeToggleUI(true);
  }
}

// ======================== UTILITIES ========================
function esc(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function updateStats() { document.getElementById('statsBadge').textContent = countQuestions() + ' questions'; updateHomeStats(); }

// ======================== EVENT BINDING ========================
async function init() {
  try {
    await loadData();
    loadTheme();
    await seedData();
  } catch (e) { console.error('Init error:', e); }
  renderDashboard();
  updateStats();
  initHeroCarousel();

  // Nav
  document.querySelectorAll('.nav-item').forEach(n => n.addEventListener('click', () => { if (n.dataset.page) switchPage(n.dataset.page); }));

  // Theme
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // Hamburger
  document.getElementById('hamburger').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));

  // Mock test controls
  const bindMock = (id, ev, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };
  bindMock('mockNextBtn', 'click', mockNext);
  bindMock('mockPrevBtn', 'click', mockPrev);
  bindMock('mockMarkBtn', 'click', mockMarkForReview);
  bindMock('mockClearBtn', 'click', mockClearResponse);
  bindMock('mockSaveBtn', 'click', mockSaveCurrent);
  bindMock('mockReportBtn', 'click', mockReportQuestion);
  bindMock('mockSubmitPaletteBtn', 'click', openMockSubmit);
  bindMock('mockQuestionPaperBtn', 'click', showMockQuestionPaper);
  bindMock('mockInstructionsBtn', 'click', showMockInstructions);
  bindMock('mockConfirmSubmitBtn', 'click', () => { closeMockModal('mockSubmitModal'); submitMockTest(); });
  bindMock('mockPauseBtn', 'click', toggleMockPause);
  bindMock('mockResumeBtn', 'click', toggleMockPause);
  bindMock('mockFullscreenBtn', 'click', toggleMockFullscreen);
  bindMock('examThemeToggle', 'click', toggleExamTheme);
  bindMock('examHomeBtn', 'click', examGoHome);
  bindMock('mockResultBackBtn', 'click', quitMockTest);
  bindMock('mockRetryBtn', 'click', retryMockTest);
  bindMock('mockLanguage', 'change', onMockLanguageChange);
  document.addEventListener('fullscreenchange', updateMockFullscreenIcon);

  // Topic Tests filters
  bindMock('topicTestCat', 'change', function () { populateTopicTestSubs(); renderTopicTestList(); });
  bindMock('topicTestSub', 'change', renderTopicTestList);
  bindMock('topicTestSearch', 'input', renderTopicTestList);

  // E-Book preview modal
  const ebookModal = document.getElementById('ebookModal');
  if (ebookModal) {
    ebookModal.addEventListener('click', function (event) {
      if (event.target === ebookModal) closeEbookModal();
    });
  }
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') closeEbookModal();
  });

  // Admin tabs
  document.querySelectorAll('.admin-tab').forEach(t => t.addEventListener('click', function () {
    document.querySelectorAll('.admin-tab').forEach(x => x.classList.remove('active'));
    this.classList.add('active');
    renderAdmin();
  }));
}

document.addEventListener('DOMContentLoaded', init);

// Keep the current attempt safe if the tab is closed or reloaded mid-test.
window.addEventListener('pagehide', function () {
  if (_mockState && !_mockState.submitted) saveExamSession();
});

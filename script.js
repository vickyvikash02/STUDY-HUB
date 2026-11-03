// ======================== DATA ========================
const THEME_KEY = 'studyhub_theme';

let data = { categories: {}, ebooks: [] };
let mockTests = [];
let qidCounter = 0;

async function loadData() {
  try {
    const r = localStorage.getItem('studyhub_data');
    if (r) { const d = JSON.parse(r); data = { categories: d.categories || {}, ebooks: d.ebooks || [] }; mockTests = d.mockTests || []; }
  } catch {}
  if (!data.categories) data.categories = {};
  if (!Array.isArray(data.ebooks)) data.ebooks = [];
  if (!Array.isArray(mockTests)) mockTests = [];
  if (normalizeQuestionTypes()) saveData();
  syncIds();
}

async function saveData() {
  try {
    localStorage.setItem('studyhub_data', JSON.stringify(data));
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
  const titles = { dashboard: 'Dashboard', questions: 'Question Bank', mocks: 'Mock Tests', topics: 'Topic Tests', builder: 'Test Builder', ebook: 'E-Book', admin: 'Admin' };
  document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
  document.getElementById('statsBadge').textContent = countQuestions() + ' questions';
  if (page === 'questions' && !_qbContext) renderQBTopics();
  if (page === 'dashboard') { _qbContext = null; renderDashboard(); }
  if (page === 'mocks') renderMockList();
  if (page === 'topics') renderTopicTests();
  if (page === 'builder') renderBuilder();
  if (page === 'ebook') renderEbook();
  if (page === 'admin') renderAdmin();
  document.getElementById('sidebar').classList.remove('open');
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

function openQuestionBank(catId, subId, topicId) {
  _qbContext = { catId, subId, topicId };
  switchPage('questions');
  const cat = data.categories[catId];
  const sub = cat.subcategories[subId];
  const topic = sub.topics[topicId];
  document.getElementById('qbBreadcrumb').innerHTML = '<a href="#" onclick="renderQBTopics(\'' + catId + '\');return false;">' + esc(cat.name) + '</a> › <a href="#" onclick="renderQBTopics(\'' + catId + '\',\'' + subId + '\');return false;">' + esc(sub.name) + '</a> › <span>' + esc(topic.name) + '</span>';
  const container = document.getElementById('qbContent');
  const qs = topic.questions || [];
  if (!qs.length) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>No questions in this topic yet.</p></div>';
    return;
  }
  container.innerHTML = '';
  let searchHtml = '<div style="margin-bottom:12px;"><input type="text" id="qbSearch" placeholder="Search questions..." style="width:100%;padding:10px 14px;border:2px solid var(--border);border-radius:var(--radius-sm);font-size:14px;background:var(--surface);color:var(--text);outline:none;" oninput="filterQBQuestions(this.value)"></div>';
  container.insertAdjacentHTML('beforeend', searchHtml);
  const list = document.createElement('div'); list.id = 'qbQuestionList';
  container.appendChild(list);

  window._qbAllQs = qs;

  window.buildQBItem = function buildQBItem(q, i, ctxCatId, ctxSubId, ctxTopicId) {
    const item = document.createElement('div'); item.className = 'q-item';
    item.dataset.qid = q.id;

    const head = document.createElement('div'); head.className = 'q-head';
    const num = document.createElement('div'); num.className = 'q-num';
    num.textContent = 'Question ' + (i + 1);
    head.appendChild(num);
    item.appendChild(head);
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
    list.innerHTML = '';
    qs.forEach((q, i) => {
      const item = buildQBItem(q, i, _qbContext.catId, _qbContext.subId, _qbContext.topicId);
      list.appendChild(item);
    });
    if (!qs.length) list.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>No questions match your search.</p></div>';
  }

  renderQBList(qs);
}

function filterQBQuestions(val) {
  const q = val.toLowerCase().trim();
  const qs = window._qbAllQs || [];
  const list = document.getElementById('qbQuestionList');
  if (!list) return;
  list.innerHTML = '';
  const filtered = qs.filter(x => x.question.toLowerCase().includes(q) || (x.explanation || '').toLowerCase().includes(q));
  const ctx = window._qbContext || {};
  filtered.forEach((x, i) => {
    const item = buildQBItem(x, i, ctx.catId, ctx.subId, ctx.topicId);
    list.appendChild(item);
  });
  if (!filtered.length) list.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>No questions match your search.</p></div>';
}

// ======================== E-BOOK ========================
function renderEbook() {
  renderEbookList(false, 'ebookList');
}

function renderAdminEbook(container) {
  const apiKey = localStorage.getItem('gdrive_api_key') || '';
  let html = '<div class="admin-section"><h3>Add E-Book</h3><div class="admin-row" style="flex-wrap:wrap;gap:8px;">';
  html += '<input type="text" id="ebookName" placeholder="E-Book name" style="flex:1;min-width:160px;">';
  html += '<input type="text" id="ebookManualUrl" placeholder="Paste a Google Drive / direct URL" style="flex:2;min-width:200px;">';
  html += '<button class="btn-secondary" id="ebookAddUrlBtn"><i class="fas fa-link"></i> Add URL</button></div></div>';
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
          html += '<div style="display:flex;flex-direction:column;gap:3px;margin-left:20px;margin-top:4px;">';
          pdfs.forEach(f => {
            const exists = data.ebooks.some(e => e.url && e.url.includes(f.id));
            html += '<label style="font-size:13px;cursor:pointer;"><input type="checkbox" class="folder-pdf-check" data-id="' + f.id + '" data-name="' + esc(f.name.replace(/\.pdf$/i, '')) + '"' + (exists ? ' checked disabled' : '') + '> ' + esc(f.name) + (exists ? ' <span style="color:var(--text2);font-size:11px;">(added)</span>' : '') + '</label>';
          });
          html += '</div>';
          html += '<button class="btn-primary" style="align-self:flex-start;font-size:12px;padding:5px 14px;margin-top:4px;" onclick="addSelectedFromFolder()"><i class="fas fa-plus"></i> Add Selected</button>';
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

async function addSelectedFromFolder() {
  const checks = document.querySelectorAll('.folder-pdf-check:checked:not(:disabled)');
  if (!checks.length) { alert('No new PDFs selected.'); return; }
  checks.forEach(c => {
    data.ebooks.push({
      id: Date.now() + Math.random(),
      name: c.dataset.name,
      url: 'https://drive.google.com/uc?export=download&id=' + c.dataset.id,
      uploaded: new Date().toLocaleDateString()
    });
  });
  await saveData();
  renderDriveFolders();
  renderEbookList(true, 'adminEbookList');
  alert('Added ' + checks.length + ' PDF(s).');
}

function addEbookUrl() {
  const name = document.getElementById('ebookName').value.trim();
  let url = document.getElementById('ebookManualUrl').value.trim();
  if (!name) { alert('Enter an e-book name.'); return; }
  if (!url) { alert('Paste a URL.'); return; }
  // Convert Google Drive share link to direct download
  const m = url.match(/drive\.google\.com\/.*[?&]id=([^&]+)/) || url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (m) url = 'https://drive.google.com/uc?export=download&id=' + m[1];
  data.ebooks.push({ id: Date.now(), name, url, uploaded: new Date().toLocaleDateString() });
  saveData();
  document.getElementById('ebookName').value = '';
  document.getElementById('ebookManualUrl').value = '';
  renderEbookList(true, 'adminEbookList');
}

function renderEbookList(showDelete, containerId) {
  const container = document.getElementById(containerId);
  if (!data.ebooks.length) {
    container.innerHTML = '<div class="empty-state" style="padding:20px;"><i class="fas fa-book-open"></i><p>No e-books uploaded yet.</p></div>';
    return;
  }
  container.innerHTML = data.ebooks.map((e, i) => {
    let actions = '<button class="btn-secondary" onclick="openPdf(' + i + ',false)"><i class="fas fa-eye"></i> View</button>';
    if (showDelete) {
      actions += '<button class="act-btn edit" onclick="renameEbook(' + i + ')"><i class="fas fa-pen"></i></button>';
      actions += '<button class="act-btn del" onclick="delEbook(' + i + ')"><i class="fas fa-trash"></i></button>';
    }
    return '<div class="ebook-card"><div class="ebook-info"><i class="fas fa-file-pdf ebook-icon"></i><div><div class="ebook-name">' + esc(e.name) + '</div><div class="ebook-meta">' + esc(e.uploaded) + '</div></div></div><div class="ebook-actions">' + actions + '</div></div>';
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

function renameEbook(idx) {
  const ebook = data.ebooks[idx];
  if (!ebook) return;
  const name = prompt('Rename e-book:', ebook.name);
  if (!name || name.trim() === ebook.name) return;
  ebook.name = name.trim();
  saveData();
  renderEbookList(true, 'adminEbookList');
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
  if (tab === 'categories') renderAdminCategories(container);
  else if (tab === 'subcategories') renderAdminSubcategories(container);
  else if (tab === 'topics') renderAdminTopics(container);
  else if (tab === 'types') renderAdminTypes(container);
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
  let html = '<div class="admin-section"><h3>Add Topic</h3><div class="admin-row"><select id="adminTopicCat"><option value="">Category</option>';
  sortedKeys(data.categories).forEach(catId => { html += '<option value="' + catId + '">' + data.categories[catId].name + '</option>'; });
  html += '</select><select id="adminTopicSub"><option value="">Subcategory</option></select>';
  html += '<input type="text" id="adminTopicName" placeholder="Topic name"><button class="btn-primary" id="adminAddTopicBtn">Add</button></div></div>';
  html += '<div class="admin-section"><h3>Existing Topics</h3>';
  html += '<div class="admin-row" style="flex-wrap:wrap;gap:6px;margin-bottom:10px;">';
  html += '<select id="atFilterCat" style="flex:1;min-width:120px;"><option value="">All Categories</option>';
  sortedKeys(data.categories).forEach(catId => { html += '<option value="' + catId + '"' + (catId === prevCat ? ' selected' : '') + '>' + data.categories[catId].name + '</option>'; });
  html += '</select>';
  html += '<select id="atFilterSub" style="flex:1;min-width:120px;"><option value="">All Subcategories</option>';
  if (prevCat && data.categories[prevCat]) {
    sortedKeys(data.categories[prevCat].subcategories || {}).forEach(sid => { html += '<option value="' + sid + '"' + (sid === prevSub ? ' selected' : '') + '>' + data.categories[prevCat].subcategories[sid].name + '</option>'; });
  }
  html += '</select>';
  html += '<input type="text" id="atFilterSearch" placeholder="Search topics..." value="' + esc(prevSearch) + '" style="flex:2;min-width:180px;"></div>';
  html += '<div id="atList">';
  let topicNum = 0;
  let hasAny = false;
  sortedKeys(data.categories).forEach(catId => {
    const c = data.categories[catId];
    if (prevCat && catId !== prevCat) return;
    sortedKeys(c.subcategories || {}).forEach(subId => {
      if (prevSub && subId !== prevSub) return;
      const s = c.subcategories[subId];
      const topicKeys = sortedKeys(s.topics || {});
      topicKeys.forEach((topicId, idx) => {
        const t = s.topics[topicId];
        if (prevSearch && !t.name.toLowerCase().includes(prevSearch.toLowerCase())) return;
        topicNum++;
        hasAny = true;
        const topicQs = t.questions || [];
        const typeCounts = questionTypeCounts(topicQs, t);
        const typeSummary = Object.keys(typeCounts).map(k => k + ': ' + typeCounts[k]).join(' · ');
        const countLabel = topicQs.length + ' Q' + (typeSummary ? ' · ' + typeSummary : '');
        html += '<div class="admin-item" data-id="' + topicId + '" data-cat="' + catId + '" data-sub="' + subId + '"><span>' + topicNum + '. ' + c.icon + ' ' + c.name + ' → ' + s.name + ' → ' + t.name + ' (' + countLabel + ')</span><span><button class="act-btn edit" onclick="editTopic(\'' + catId + '\',\'' + subId + '\',\'' + topicId + '\')"><i class="fas fa-pen"></i> Edit</button><button class="act-btn del" onclick="delTopic(\'' + catId + '\',\'' + subId + '\',\'' + topicId + '\')"><i class="fas fa-trash"></i> Del</button><span class="drag-handle" draggable="true"><i class="fas fa-grip-vertical"></i></span></span></div>';
      });
    });
  });
  if (!hasAny) html += '<p class="empty-state" style="padding:20px;">No topics match your filters.</p>';
  html += '</div></div>';
  container.innerHTML = html;

  document.getElementById('adminAddTopicBtn').addEventListener('click', addTopic);
  document.getElementById('adminTopicCat').addEventListener('change', function () {
    const sel = document.getElementById('adminTopicSub');
    sel.innerHTML = '<option value="">Subcategory</option>';
    const cat = data.categories[this.value];
    if (cat) sortedKeys(cat.subcategories || {}).forEach(sid => { sel.innerHTML += '<option value="' + sid + '">' + cat.subcategories[sid].name + '</option>'; });
  });

  document.getElementById('atFilterCat').addEventListener('change', function () {
    const subSel = document.getElementById('atFilterSub');
    subSel.innerHTML = '<option value="">All Subcategories</option>';
    const cat = data.categories[this.value];
    if (cat) sortedKeys(cat.subcategories || {}).forEach(sid => { subSel.innerHTML += '<option value="' + sid + '">' + cat.subcategories[sid].name + '</option>'; });
    applyATFilters();
  });
  document.getElementById('atFilterSub').addEventListener('change', applyATFilters);
  document.getElementById('atFilterSearch').addEventListener('input', applyATFilters);
  enableDragSort('atList', (item) => {
    const catId = item.dataset.cat;
    const subId = item.dataset.sub;
    return data.categories[catId]?.subcategories[subId]?.topics;
  }, () => { saveData(); renderDashboard(); renderAdmin(); });
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
    sortedKeys(getTopicTypes(topic)).forEach(tid => {
      sel.innerHTML += '<option value="' + tid + '">Type: ' + esc(getTopicTypes(topic)[tid].name) + '</option>';
    });
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

// ======================== MOCK TEST BUILDER ========================
let _builderFilterRows = [];
let _builderSelected = new Set();
let _builderQMeta = new Map();

function renderBuilder() {
  document.getElementById('builderName').value = '';
  document.getElementById('builderSubtitle').value = '';
  document.getElementById('builderDuration').value = '20';
  document.getElementById('builderMarks').value = '25';
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
    html += '<option value="__all__"' + (state.sub === '__all__' ? ' selected' : '') + '>All Subcategories</option>';
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
    html += '<option value="__all__"' + (state.topic === '__all__' ? ' selected' : '') + '>All Topics</option>';
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

  if (!_builderFilterRows.some(state => state.cat)) {
    container.innerHTML = '<p class="builder-empty">Select a category to see its questions. Use “Add Category” to include another subject in the same test.</p>';
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
  const container = document.getElementById('builderTestList');
  if (!mockTests.length) { container.innerHTML = '<p style="color:var(--text2);font-size:13px;">No tests created yet.</p>'; return; }
  container.innerHTML = mockTests.map((t, i) => `
    <div class="admin-item">
      <span><strong>${esc(t.name)}</strong> — ${t.duration} min, ${t.totalMarks} marks, ${(t.questionIds || []).length} questions</span>
      <button class="edit-btn" onclick="editMockTest(${i})">Edit</button>
      <button class="del-btn" onclick="delMockTest(${i})">Del</button>
    </div>`).join('');
}

document.getElementById('builderSaveBtn').addEventListener('click', function () {
  const name = document.getElementById('builderName').value.trim();
  const subtitle = document.getElementById('builderSubtitle').value.trim();
  const duration = parseInt(document.getElementById('builderDuration').value);
  const totalMarks = parseInt(document.getElementById('builderMarks').value);
  const ids = Array.from(_builderSelected);
  if (!name) { alert('Enter a test name.'); return; }
  if (!ids.length) { alert('Select at least one question.'); return; }
  const catCount = new Set(ids.map(id => (_builderQMeta.get(id) || {}).catId).filter(Boolean)).size;
  mockTests.push({ id: Date.now(), name, subtitle, duration: duration || 20, totalMarks: totalMarks || ids.length, questionIds: ids });
  saveData();
  renderBuilder();
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
  if (!container) return;
  const catId = document.getElementById('topicTestCat')?.value || '';
  const subId = document.getElementById('topicTestSub')?.value || '';
  const search = (document.getElementById('topicTestSearch')?.value || '').toLowerCase().trim();

  container.innerHTML = '';
  let shown = 0;
  let total = 0;

  sortedKeys(data.categories).forEach(c => {
    if (catId && c !== catId) return;
    const cat = data.categories[c];
    sortedKeys(cat.subcategories || {}).forEach(s => {
      if (subId && s !== subId) return;
      const sub = cat.subcategories[s];
      sortedKeys(sub.topics || {}).forEach(t => {
        total++;
        const topic = sub.topics[t];
        if (search && !(topic.name + ' ' + sub.name + ' ' + cat.name).toLowerCase().includes(search)) return;
        shown++;

        const test = buildTopicTest(c, s, t);
        const count = test.questionIds.length;
        const saved = count ? getExamSession(test.id) : null;
        const answered = saved ? Object.keys(saved.answers || {}).length : 0;
        const typeCounts = questionTypeCounts(topic.questions, topic);
        const typeSummary = Object.keys(typeCounts).map(k => k + ': ' + typeCounts[k]).join(' · ');

        const div = document.createElement('div');
        div.className = 'mock-card topic-card' + (count ? '' : ' disabled');
        div.innerHTML =
          '<span class="topic-card-path">' + (cat.iconImage ? '' : esc(cat.icon || '📂')) + ' ' + esc(cat.name) + ' › ' + esc(sub.name) + '</span>' +
          '<h3>' + esc(topic.name) + '</h3>' +
          '<p><i class="fas fa-circle-question"></i> ' + count + ' question' + (count === 1 ? '' : 's') + '</p>' +
          '<p><i class="far fa-clock"></i> ' + (count ? test.duration + ' min' : '—') + '</p>' +
          (typeSummary ? '<p class="topic-card-types">' + esc(typeSummary) + '</p>' : '') +
          '<p class="mock-start">' + (count
            ? (saved
              ? '<i class="fas fa-rotate-left"></i> Resume saved attempt' + (answered ? ' · ' + answered + ' answered' : '')
              : '<i class="fas fa-play"></i> Start test')
            : '<i class="fas fa-circle-info"></i> No questions yet') + '</p>';

        if (count) {
          div.addEventListener('click', () => startTopicTest(c, s, t));
        }
        if (saved) {
          const reset = document.createElement('button');
          reset.type = 'button';
          reset.className = 'mock-restart';
          reset.textContent = 'Start over';
          reset.addEventListener('click', ev => {
            ev.stopPropagation();
            if (!confirm('Discard the saved answers for "' + topic.name + '" and start again?')) return;
            clearExamSession(test.id);
            startTopicTest(c, s, t);
          });
          div.appendChild(reset);
        }
        container.appendChild(div);
      });
    });
  });

  if (!shown) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-list-check"></i><p>' +
      (total ? 'No topics match your filters.' : 'No topics with questions yet. Add questions in the Admin panel.') +
      '</p></div>';
  }
  const countEl = document.getElementById('topicTestCount');
  if (countEl) countEl.textContent = shown + ' of ' + total + ' topic' + (total === 1 ? '' : 's');
}

function startTopicTest(catId, subId, topicId) {
  const t = buildTopicTest(catId, subId, topicId);
  if (!t) return;
  if (!t.questionIds.length) { alert('This topic has no questions yet.'); return; }
  startExam(t, -1, 'topics');
}

function renderMockList() {
  const container = document.getElementById('mockList');
  container.innerHTML = '';
  if (!mockTests.length) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><p>No mock tests yet. Create one in the Test Builder.</p></div>';
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
  const idx = _mockState.testIdx;
  const ref = _mockState.topicRef;
  const testId = _mockState.test.id;
  if (confirm('Restart this test? Your current answers will be cleared.')) {
    clearExamSession(testId);
    if (ref) startTopicTest(ref.catId, ref.subId, ref.topicId);
    else startMockTest(idx);
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

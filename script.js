// ======================== DATA ========================
const THEME_KEY = 'studyhub_theme';
const DATA_REF = typeof db !== 'undefined' && db ? db.ref('/studyhub/data') : null;

// ======================== CLOUDINARY ========================
const CLOUD_NAME = 'dtltp3gez';
const UPLOAD_PRESET = 'studyhub';

let data = { categories: {} };
let mockTests = [];
let qidCounter = 0;

async function loadData() {
  try {
    const snap = await DATA_REF.once('value');
    const d = snap.val();
    if (d) {
      data = { categories: d.categories || {} };
      mockTests = d.mockTests || [];
    } else {
      data = { categories: {} };
      mockTests = [];
    }
  } catch {
    try {
      const r = localStorage.getItem('studyhub_data');
      if (r) { const d = JSON.parse(r); data = { categories: d.categories || {} }; mockTests = d.mockTests || []; }
    } catch {}
  }
  if (!data.categories) data.categories = {};
  if (!Array.isArray(mockTests)) mockTests = [];
  syncIds();
}

async function saveData() {
  try {
    localStorage.setItem('studyhub_data', JSON.stringify(data));
  } catch { }
  try {
    await DATA_REF.update({ categories: data.categories, mockTests });
  } catch { }
}

async function uploadFile(file, folder) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  if (folder) {
    formData.append('folder', folder);
    formData.append('asset_folder', folder);
  }
  const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: 'POST',
    body: formData
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error('Cloudinary ' + res.status + ': ' + text);
  }
  const data = await res.json();
  console.log('Cloudinary upload response:', data);
  return data.secure_url;
}

async function deleteUploadedFile(url) {
  // Cloudinary deletion requires a signed API call (not possible from browser-only app).
  // Images will be cleaned up periodically or via the Cloudinary console.
  if (!url || !url.includes('res.cloudinary.com')) return;
}

function imgUrl(url) {
  return url || '';
}

function syncIds() {
  qidCounter = 0;
  forEachQ(() => qidCounter++);
}

function genId() { return ++qidCounter; }

function sortedKeys(obj) {
  return Object.keys(obj).sort((a, b) => (obj[a].order || 0) - (obj[b].order || 0));
}

function swapOrder(a, b) {
  const t = a.order; a.order = b.order; b.order = t;
}

function moveItem(list, id, dir) {
  const keys = Object.keys(list);
  keys.forEach((k, i) => { if (list[k].order == null) list[k].order = i + 1; });
  const sorted = keys.sort((a, b) => (list[a].order || 0) - (list[b].order || 0));
  const idx = sorted.indexOf(id);
  const target = dir === 'up' ? idx - 1 : idx + 1;
  if (target < 0 || target >= sorted.length) return;
  swapOrder(list[sorted[idx]], list[sorted[target]]);
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
  const titles = { dashboard: 'Dashboard', questions: 'Question Bank', mocks: 'Mock Tests', builder: 'Test Builder', admin: 'Admin' };
  document.getElementById('pageTitle').textContent = titles[page] || 'Dashboard';
  document.getElementById('statsBadge').textContent = countQuestions() + ' questions';
  if (page === 'questions' && !_qbContext) renderQBTopics();
  if (page === 'dashboard') { _qbContext = null; renderDashboard(); }
  if (page === 'mocks') renderMockList();
  if (page === 'builder') renderBuilder();
  if (page === 'admin') renderAdmin();
  document.getElementById('sidebar').classList.remove('open');
}

// ======================== DASHBOARD ========================
function renderDashboard() {
  const grid = document.getElementById('dashboardGrid');
  grid.innerHTML = '';
  const catGrads = ['var(--grad1)', 'var(--grad2)', 'var(--grad3)', 'var(--grad4)', 'var(--grad5)', 'var(--grad6)'];
  let ci = 0;
  sortedKeys(data.categories).forEach(catId => {
    const cat = data.categories[catId];
    const card = document.createElement('div'); card.className = 'cat-card';
    const totalQ = countQInCat(catId);
    const iconHtml = cat.iconImage ? '<img src="' + imgUrl(cat.iconImage) + '" class="cat-icon-img">' : (cat.icon || '📂');
    card.innerHTML = `
      <div class="cat-head" style="background:${cat.color || catGrads[ci++ % catGrads.length]}">
        ${iconHtml} ${cat.name} <span style="margin-left:auto;font-size:12px;opacity:0.8;">${totalQ} Q</span>
      </div>
      <div class="cat-body" id="catBody-${catId}"></div>`;
    grid.appendChild(card);

    const body = card.querySelector('.cat-body');
    sortedKeys(cat.subcategories || {}).forEach(subId => {
      const sub = cat.subcategories[subId];
      const subDiv = document.createElement('div'); subDiv.className = 'subcat-item';
      subDiv.innerHTML = `
        <div class="subcat-head" onclick="toggleSubcat('${catId}','${subId}')">
          📁 ${sub.name} <span class="arrow" id="arrow-${catId}-${subId}"><i class="fas fa-chevron-down"></i></span>
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

// ======================== ADMIN ========================
function renderAdmin() {
  const container = document.getElementById('adminContent');
  const activeTab = document.querySelector('.admin-tab.active');
  const tab = activeTab ? activeTab.dataset.admin : 'categories';
  if (tab === 'categories') renderAdminCategories(container);
  else if (tab === 'subcategories') renderAdminSubcategories(container);
  else if (tab === 'topics') renderAdminTopics(container);
  else if (tab === 'questions') renderAdminQuestions(container);
}

function renderAdminCategories(container) {
  let html = '<div class="admin-section"><h3>Add Category</h3><div class="admin-row"><input type="text" id="adminCatName" placeholder="Category name"><input type="file" id="adminCatIconImg" accept="image/*" style="max-width:150px;"><input type="text" id="adminCatIcon" placeholder="Emoji (e.g. 🌍)" style="max-width:70px;"><button class="btn-primary" id="adminAddCatBtn">Add</button></div></div>';
  html += '<div class="admin-section"><h3>Existing Categories</h3>';
  const catKeys = sortedKeys(data.categories);
  catKeys.forEach((catId, idx) => {
    const c = data.categories[catId];
    const iconHtml = c.iconImage ? '<img src="' + imgUrl(c.iconImage) + '" style="width:20px;height:20px;vertical-align:middle;border-radius:4px;">' : (c.icon || '📂');
    const upBtn = idx > 0 ? '<button class="act-btn move-up" onclick="moveCatUp(\'' + catId + '\')"><i class="fas fa-chevron-up"></i></button>' : '';
    const downBtn = idx === 0 ? '<button class="act-btn move-down" onclick="moveCatDown(\'' + catId + '\')"><i class="fas fa-chevron-down"></i></button>' : '';
    html += `<div class="admin-item"><span>${c.order || (idx+1)}. ${iconHtml} ${c.name}</span><span>${upBtn}${downBtn}<button class="act-btn edit" onclick="editCat('${catId}')"><i class="fas fa-pen"></i> Edit</button><button class="act-btn del" onclick="delCat('${catId}')"><i class="fas fa-trash"></i> Del</button></span></div>`;
  });
  html += '</div>';
  container.innerHTML = html;
  document.getElementById('adminAddCatBtn').addEventListener('click', addCat);
}

function moveCatUp(catId) { moveItem(data.categories, catId, 'up'); saveData(); renderDashboard(); renderAdmin(); }
function moveCatDown(catId) { moveItem(data.categories, catId, 'down'); saveData(); renderDashboard(); renderAdmin(); }

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
  let subNum = 0;
  sortedKeys(data.categories).forEach(catId => {
    const c = data.categories[catId];
    const subKeys = sortedKeys(c.subcategories || {});
    subKeys.forEach((subId, idx) => {
      const s = c.subcategories[subId];
      subNum++;
      const upBtn = idx > 0 ? '<button class="act-btn move-up" onclick="moveSubUp(\'' + catId + '\',\'' + subId + '\')"><i class="fas fa-chevron-up"></i></button>' : '';
      const downBtn = idx === 0 ? '<button class="act-btn move-down" onclick="moveSubDown(\'' + catId + '\',\'' + subId + '\')"><i class="fas fa-chevron-down"></i></button>' : '';
      html += '<div class="admin-item"><span>' + subNum + '. ' + c.icon + ' ' + c.name + ' → ' + s.name + '</span><span>' + upBtn + downBtn + '<button class="act-btn edit" onclick="editSub(\'' + catId + '\',\'' + subId + '\')"><i class="fas fa-pen"></i> Edit</button><button class="act-btn del" onclick="delSub(\'' + catId + '\',\'' + subId + '\')"><i class="fas fa-trash"></i> Del</button></span></div>';
    });
  });
  html += '</div>';
  container.innerHTML = html;
  document.getElementById('adminAddSubBtn').addEventListener('click', addSub);
}

function moveSubUp(catId, subId) { moveItem(data.categories[catId].subcategories, subId, 'up'); saveData(); renderDashboard(); renderAdmin(); }
function moveSubDown(catId, subId) { moveItem(data.categories[catId].subcategories, subId, 'down'); saveData(); renderDashboard(); renderAdmin(); }

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
  let html = '<div class="admin-section"><h3>Add Topic</h3><div class="admin-row"><select id="adminTopicCat"><option value="">Category</option>';
  sortedKeys(data.categories).forEach(catId => { html += '<option value="' + catId + '">' + data.categories[catId].name + '</option>'; });
  html += '</select><select id="adminTopicSub"><option value="">Subcategory</option></select>';
  html += '<input type="text" id="adminTopicName" placeholder="Topic name"><button class="btn-primary" id="adminAddTopicBtn">Add</button></div></div>';
  html += '<div class="admin-section"><h3>Existing Topics</h3>';
  let topicNum = 0;
  sortedKeys(data.categories).forEach(catId => {
    const c = data.categories[catId];
    sortedKeys(c.subcategories || {}).forEach(subId => {
      const s = c.subcategories[subId];
      const topicKeys = sortedKeys(s.topics || {});
      topicKeys.forEach((topicId, idx) => {
        const t = s.topics[topicId];
        topicNum++;
        const upBtn = idx > 0 ? '<button class="act-btn move-up" onclick="moveTopicUp(\'' + catId + '\',\'' + subId + '\',\'' + topicId + '\')"><i class="fas fa-chevron-up"></i></button>' : '';
        const downBtn = idx === 0 ? '<button class="act-btn move-down" onclick="moveTopicDown(\'' + catId + '\',\'' + subId + '\',\'' + topicId + '\')"><i class="fas fa-chevron-down"></i></button>' : '';
        html += '<div class="admin-item"><span>' + topicNum + '. ' + c.icon + ' ' + c.name + ' → ' + s.name + ' → ' + t.name + ' (' + (t.questions || []).length + ' Q)</span><span>' + upBtn + downBtn + '<button class="act-btn edit" onclick="editTopic(\'' + catId + '\',\'' + subId + '\',\'' + topicId + '\')"><i class="fas fa-pen"></i> Edit</button><button class="act-btn del" onclick="delTopic(\'' + catId + '\',\'' + subId + '\',\'' + topicId + '\')"><i class="fas fa-trash"></i> Del</button></span></div>';
      });
    });
  });
  html += '</div>';
  container.innerHTML = html;

  document.getElementById('adminAddTopicBtn').addEventListener('click', addTopic);
  document.getElementById('adminTopicCat').addEventListener('change', function () {
    const sel = document.getElementById('adminTopicSub');
    sel.innerHTML = '<option value="">Subcategory</option>';
    const cat = data.categories[this.value];
    if (cat) sortedKeys(cat.subcategories || {}).forEach(sid => { sel.innerHTML += '<option value="' + sid + '">' + cat.subcategories[sid].name + '</option>'; });
  });
}

function moveTopicUp(catId, subId, topicId) { moveItem(data.categories[catId].subcategories[subId].topics, topicId, 'up'); saveData(); renderDashboard(); renderAdmin(); }
function moveTopicDown(catId, subId, topicId) { moveItem(data.categories[catId].subcategories[subId].topics, topicId, 'down'); saveData(); renderDashboard(); renderAdmin(); }

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

function renderAdminQuestions(container) {
  const prevFilterCat = document.getElementById('aqFilterCat')?.value || '';
  const prevFilterSub = document.getElementById('aqFilterSub')?.value || '';
  const prevFilterTopic = document.getElementById('aqFilterTopic')?.value || '';
  const prevFilterSearch = document.getElementById('aqFilterSearch')?.value || '';
  let html = '<div class="admin-section"><h3>Add Question</h3>';
  html += '<div class="admin-row"><select id="adminQCat"><option value="">Select Category</option>';
  sortedKeys(data.categories).forEach(catId => {
    html += '<option value="' + catId + '">' + data.categories[catId].name + '</option>';
  });
  html += '</select>';
  html += '<select id="adminQSub"><option value="">Select Subcategory</option></select>';
  html += '<select id="adminQTopic"><option value="">Select Topic</option></select></div>';
  html += '<div class="admin-row"><input type="text" id="adminQQ" placeholder="Question text"></div>';
  html += '<div class="admin-row"><input type="file" id="adminQImg" accept="image/*" style="flex:1;"><span id="adminQImgName" style="font-size:12px;color:var(--text2);"></span></div>';
  html += '<div class="admin-row"><input type="text" id="adminQO0" placeholder="Option A"><input type="text" id="adminQO1" placeholder="Option B"></div>';
  html += '<div class="admin-row"><input type="text" id="adminQO2" placeholder="Option C"><input type="text" id="adminQO3" placeholder="Option D"></div>';
  html += '<div class="admin-row"><select id="adminQAns"><option value="0">Answer: A</option><option value="1">B</option><option value="2">C</option><option value="3">D</option></select>';
  html += '<input type="text" id="adminQExp" placeholder="Explanation" style="flex:2;"></div>';
  html += '<div class="admin-row"><input type="file" id="adminQExpImg" accept="image/*" style="flex:1;"><span id="adminQExpImgName" style="font-size:12px;color:var(--text2);"></span></div>';
  html += '<input type="hidden" id="adminQEditId"><button class="btn-primary" id="adminAddQBtn">Add Question</button></div>';

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
  });

  document.getElementById('aqFilterCat').addEventListener('change', function () {
    const subSel = document.getElementById('aqFilterSub');
    const topicSel = document.getElementById('aqFilterTopic');
    subSel.innerHTML = '<option value="">Select Subcategory</option>';
    topicSel.innerHTML = '<option value="">Select Topic</option>';
    const cat = data.categories[this.value];
    if (cat) sortedKeys(cat.subcategories || {}).forEach(sid => { subSel.innerHTML += '<option value="' + sid + '">' + cat.subcategories[sid].name + '</option>'; });
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
    applyAQFilters();
    syncFilterToAddForm();
  });
  document.getElementById('aqFilterTopic').addEventListener('change', function () {
    applyAQFilters();
    syncFilterToAddForm();
  });
  document.getElementById('aqFilterSearch').addEventListener('input', applyAQFilters);
  if (prevFilterCat && prevFilterSub && prevFilterTopic) applyAQFilters();
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
}

function applyAQFilters() {
  const cat = document.getElementById('aqFilterCat').value;
  const sub = document.getElementById('aqFilterSub').value;
  const topic = document.getElementById('aqFilterTopic').value;
  const search = document.getElementById('aqFilterSearch').value.toLowerCase().trim();

  const container = document.getElementById('aqList');
  if (!cat && !sub && !topic && !search) { container.innerHTML = '<p class="empty-state" style="padding:20px;">Select a filter or type to search.</p>'; return; }
  let html = '';
  let prevTopicKey = null;
  let topicCount = 0;
  forEachQ((q, i, catId, subId, topicId, catObj, subObj, topicObj) => {
    const matchCat = !cat || catId === cat;
    const matchSub = !sub || subId === sub;
    const matchTopic = !topic || topicId === topic;
    const matchSearch = !search || (q.question || '').toLowerCase().includes(search);
    if (!matchCat || !matchSub || !matchTopic || !matchSearch) return;

    const topicKey = catId + '/' + subId + '/' + topicId;
    if (topicKey !== prevTopicKey) {
      if (prevTopicKey !== null) html += '</div></div>';
      html += '<div class="aq-topic-group" data-topic="' + topicKey + '">';
      html += '<div class="aq-topic-head" onclick="this.nextElementSibling.classList.toggle(\'aq-hidden\');this.querySelector(\'.aq-toggle\').classList.toggle(\'aq-open\');">';
      html += '<span class="aq-toggle">▶</span> <strong>' + esc(catObj.name) + ' › ' + esc(subObj.name) + ' › ' + esc(topicObj.name) + '</strong> <span class="aq-count">(' + (topicObj.questions || []).length + ' Q)</span>';
      html += '</div><div class="aq-topic-body">';
      prevTopicKey = topicKey;
      topicCount = 0;
    }
    topicCount++;
    html += '<div class="admin-question-item" data-cat="' + catId + '" data-sub="' + subId + '" data-topic="' + topicId + '">';
    html += '<div class="aq-text">' + topicCount + '. ' + esc(q.question || '') + '</div>' + (q.image ? '<img class="aq-img" src="' + imgUrl(q.image) + '" alt="Question image">' : '');
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
  const editId = document.getElementById('adminQEditId').value;
  const imgFile = document.getElementById('adminQImg').files[0];
  const expImgFile = document.getElementById('adminQExpImg').files[0];
  if (!catId || !subId || !topicId || !qText || opts.some(o => !o)) { alert('Fill all fields.'); return; }

  if ((imgFile && imgFile.size > 2 * 1024 * 1024) || (expImgFile && expImgFile.size > 2 * 1024 * 1024)) { alert('Image too large! Max 2 MB.'); return; }

  const btn = document.getElementById('adminAddQBtn');
  btn.disabled = true; btn.textContent = 'Saving...';

  try {
    if (editId) {
      let editQ = (data.categories[catId]?.subcategories[subId]?.topics[topicId]?.questions || []).find(q => q.id == editId);
      if (editQ) {
        editQ.question = qText; editQ.options = opts; editQ.answer = ans; editQ.explanation = exp;
        if (imgFile) { await deleteUploadedFile(editQ.image); editQ.image = await uploadFile(imgFile, 'questions').catch(e => { alert('Image upload failed: ' + e.message); return editQ.image; }); }
        if (expImgFile) { await deleteUploadedFile(editQ.expImage); editQ.expImage = await uploadFile(expImgFile, 'explanations').catch(e => { alert('Image upload failed: ' + e.message); return editQ.expImage; }); }
      }
    } else {
      const q = { id: genId(), question: qText, options: opts, answer: ans, explanation: exp, image: '', expImage: '' };
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
  document.getElementById('adminQImg').value = '';
  document.getElementById('adminQImgName').innerHTML = '';
  document.getElementById('adminQExpImg').value = '';
  document.getElementById('adminQExpImgName').innerHTML = '';
}

function editAdminQ(catId, subId, topicId, qId) {
  const topic = data.categories[catId]?.subcategories[subId]?.topics[topicId];
  if (!topic) return;
  const q = (topic.questions || []).find(q => q.id == qId);
  if (!q) return;
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
function renderBuilder() {
  document.getElementById('builderName').value = '';
  document.getElementById('builderDuration').value = '20';
  document.getElementById('builderMarks').value = '25';
  populateBuilderFilters();
  renderBuilderQList();
  renderExistingTests();
}

function populateBuilderFilters() {
  const catSel = document.getElementById('builderCatFilter');
  const subSel = document.getElementById('builderSubFilter');
  const topicSel = document.getElementById('builderTopicFilter');
  catSel.innerHTML = '<option value="">Select Category</option>';
  sortedKeys(data.categories).forEach(catId => { catSel.innerHTML += '<option value="' + catId + '">' + data.categories[catId].name + '</option>'; });
  catSel.onchange = function () {
    subSel.innerHTML = '<option value="">Select Subcategory</option>';
    topicSel.innerHTML = '<option value="">Select Topic</option>';
    const cat = data.categories[this.value];
    if (cat) sortedKeys(cat.subcategories || {}).forEach(sid => { subSel.innerHTML += '<option value="' + sid + '">' + cat.subcategories[sid].name + '</option>'; });
    renderBuilderQList();
  };
  subSel.onchange = function () {
    topicSel.innerHTML = '<option value="">Select Topic</option>';
    const catId = catSel.value;
    if (catId && this.value && data.categories[catId]?.subcategories[this.value]) {
      sortedKeys(data.categories[catId].subcategories[this.value].topics || {}).forEach(tid => {
        topicSel.innerHTML += '<option value="' + tid + '">' + data.categories[catId].subcategories[this.value].topics[tid].name + '</option>';
      });
    }
    renderBuilderQList();
  };
  topicSel.onchange = renderBuilderQList;
  topicSel.innerHTML = '<option value="">Select Topic</option>';
}

function renderBuilderQList() {
  const catF = document.getElementById('builderCatFilter').value;
  const subF = document.getElementById('builderSubFilter').value;
  const topicF = document.getElementById('builderTopicFilter').value;
  const container = document.getElementById('builderQList');
  container.innerHTML = '';
  if (!catF || !subF || !topicF) { container.innerHTML = '<p style="text-align:center;padding:20px;color:var(--text2);">Select Category, Subcategory, and Topic to see questions.</p>'; return; }
  forEachQ((q, i, catId, subId, topicId, cat, sub, topic) => {
    if (catF && catF !== catId) return;
    if (subF && subF !== subId) return;
    if (topicF && topicF !== topicId) return;
    const div = document.createElement('div'); div.className = 'builder-qitem';
    div.innerHTML = '<input type="checkbox" class="bq-check" value="' + q.id + '"><div class="bq-text">' + esc(q.question) + '</div><div class="bq-meta">' + cat.name + ' → ' + sub.name + ' → ' + topic.name + '</div>';
    container.appendChild(div);
  });
  if (!container.children.length) container.innerHTML = '<p style="text-align:center;padding:20px;color:var(--text2);">No questions match your filters.</p>';
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
  const duration = parseInt(document.getElementById('builderDuration').value);
  const totalMarks = parseInt(document.getElementById('builderMarks').value);
  const checked = document.querySelectorAll('#builderQList .bq-check:checked');
  const ids = Array.from(checked).map(c => parseInt(c.value));
  if (!name) { alert('Enter a test name.'); return; }
  if (!ids.length) { alert('Select at least one question.'); return; }
  mockTests.push({ id: Date.now(), name, duration: duration || 20, totalMarks: totalMarks || ids.length, questionIds: ids });
  saveData();
  renderBuilder();
  alert('Mock test "' + name + '" created with ' + ids.length + ' questions!');
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
  mockTests.splice(idx, 1);
  saveData(); renderBuilder(); renderMockList();
}

// ======================== MOCK TEST PLAYER ========================
let _mockState = null;

function renderMockList() {
  const container = document.getElementById('mockList');
  container.innerHTML = '';
  if (!mockTests.length) {
    container.innerHTML = '<div class="empty-state"><i class="fas fa-tasks"></i><p>No mock tests yet. Create one in the Test Builder.</p></div>';
    return;
  }
  mockTests.forEach((t, i) => {
    const div = document.createElement('div'); div.className = 'mock-card';
    div.innerHTML = '<h3>' + esc(t.name) + '</h3><p><i class="far fa-clock"></i> ' + t.duration + ' min</p><p><i class="fas fa-star"></i> ' + t.totalMarks + ' marks</p><p style="color:var(--text2);">' + (t.questionIds || []).length + ' questions</p>';
    div.addEventListener('click', () => startMockTest(i));
    container.appendChild(div);
  });
}

function startMockTest(idx) {
  const t = mockTests[idx];
  const allQs = [];
  forEachQ(q => { if ((t.questionIds || []).includes(q.id)) allQs.push(q); });
  if (!allQs.length) { alert('No questions found for this test.'); return; }
  _mockState = { testIdx: idx, questions: shuffle(allQs), idx: 0, answers: {}, submitted: false };
  document.getElementById('mockListContainer').classList.add('hidden');
  document.getElementById('mockTestContainer').classList.remove('hidden');
  document.getElementById('mockTestTitle').textContent = t.name;
  document.getElementById('mockResultContainer').classList.add('hidden');
  renderMockQuestion();
  renderMockPalette();
  startMockTimer(t.duration);
}

function renderMockQuestion() {
  if (!_mockState || _mockState.submitted) return;
  const s = _mockState;
  const q = s.questions[s.idx];
  document.getElementById('mockQNumber').textContent = 'Question ' + (s.idx + 1) + ' of ' + s.questions.length;
  document.getElementById('mockQText').textContent = q.question;
  const mockQImg = document.getElementById('mockQImg');
  if (q.image) { mockQImg.src = imgUrl(q.image); mockQImg.classList.remove('hidden'); }
  else mockQImg.classList.add('hidden');
  document.getElementById('mockProgressDisplay').textContent = (s.idx + 1) + '/' + s.questions.length;

  const answered = s.answers[q.id] !== undefined;
  const opts = document.getElementById('mockQOpts');
  opts.innerHTML = '';
  (q.options || []).forEach((o, i) => {
    const d = document.createElement('div'); d.className = 'opt-item';
    d.textContent = String.fromCharCode(65 + i) + '. ' + o;
    if (answered) {
      if (i === q.answer) d.classList.add('correct');
      if (i === s.answers[q.id] && i !== q.answer) d.classList.add('wrong');
    } else {
      d.addEventListener('click', () => selectMockAnswer(i));
    }
    opts.appendChild(d);
  });

  const exp = document.getElementById('mockQExp');
  const expImg = document.getElementById('mockQExpImg');
  if (answered && (q.explanation || q.expImage)) {
    document.getElementById('mockQExpText').textContent = q.explanation || '';
    exp.classList.remove('hidden');
    if (q.expImage) { expImg.src = imgUrl(q.expImage); expImg.classList.remove('hidden'); }
    else expImg.classList.add('hidden');
  } else {
    exp.classList.add('hidden');
  }

  document.getElementById('mockPrevBtn').style.visibility = s.idx === 0 ? 'hidden' : 'visible';
  document.getElementById('mockNextBtn').style.display = s.idx < s.questions.length - 1 ? '' : 'none';
  document.getElementById('mockSubmitBtn').classList.toggle('hidden', s.idx !== s.questions.length - 1);
  renderMockPalette();
}

function selectMockAnswer(idx) {
  if (!_mockState) return;
  const q = _mockState.questions[_mockState.idx];
  _mockState.answers[q.id] = idx;
  renderMockQuestion();
}

function mockNext() { if (_mockState && _mockState.idx < _mockState.questions.length - 1) { _mockState.idx++; renderMockQuestion(); } }
function mockPrev() { if (_mockState && _mockState.idx > 0) { _mockState.idx--; renderMockQuestion(); } }

function renderMockPalette() {
  if (!_mockState) return;
  const grid = document.getElementById('mockPaletteGrid');
  grid.innerHTML = '';
  _mockState.questions.forEach((q, i) => {
    const b = document.createElement('button'); b.className = 'palette-btn';
    b.textContent = i + 1;
    if (i === _mockState.idx) b.classList.add('current');
    if (_mockState.answers[q.id] !== undefined) b.classList.add('answered');
    b.addEventListener('click', () => { _mockState.idx = i; renderMockQuestion(); });
    grid.appendChild(b);
  });
  document.getElementById('mockProgressDisplay').textContent = (_mockState.idx + 1) + '/' + _mockState.questions.length;
}

function startMockTimer(duration) {
  if (_mockState._timer) clearInterval(_mockState._timer);
  _mockState._remaining = duration * 60;
  _mockState._timer = setInterval(() => {
    _mockState._remaining--;
    const m = Math.floor(_mockState._remaining / 60);
    const s = _mockState._remaining % 60;
    document.getElementById('mockTimerDisplay').innerHTML = '<i class="far fa-clock"></i> ' + String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
    if (_mockState._remaining <= 0) submitMockTest();
  }, 1000);
}

function submitMockTest() {
  if (!_mockState || _mockState.submitted) return;
  _mockState.submitted = true;
  if (_mockState._timer) clearInterval(_mockState._timer);
  const total = _mockState.questions.length;
  let correct = 0;
  let details = [];
  _mockState.questions.forEach((q, i) => {
    const userAns = _mockState.answers[q.id];
    const isCorrect = userAns === q.answer;
    if (isCorrect) correct++;
    details.push({ q, userAns, isCorrect });
  });
  const pct = Math.round(correct / total * 100);
  const circle = document.getElementById('mockResultCircle');
  circle.style.background = pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)';
  document.getElementById('mockResultPct').textContent = pct + '%';
  document.getElementById('mockResultSummary').textContent = correct + '/' + total + ' correct (' + pct + '%)';
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
    detailHtml += '<div class="q-exp"><strong>Explanation:</strong> ' + esc(q.explanation || '') + (q.expImage ? '<br><img class="q-img" src="' + imgUrl(q.expImage) + '" alt="Explanation image">' : '') + '</div></div>';
  });
  document.getElementById('mockResultDetails').innerHTML = detailHtml;
  document.getElementById('mockResultContainer').classList.remove('hidden');
}

function quitMockTest() {
  if (_mockState && _mockState._timer) clearInterval(_mockState._timer);
  _mockState = null;
  document.getElementById('mockListContainer').classList.remove('hidden');
  document.getElementById('mockTestContainer').classList.add('hidden');
  renderMockList();
}

// ======================== THEME ========================
function toggleTheme() {
  document.body.classList.toggle('dark');
  const isDark = document.body.classList.contains('dark');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  document.getElementById('themeToggle').innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
}

function loadTheme() {
  if (localStorage.getItem(THEME_KEY) === 'dark') { document.body.classList.add('dark'); document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>'; }
}

// ======================== UTILITIES ========================
function esc(s) { if (!s) return ''; const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; }
function updateStats() { document.getElementById('statsBadge').textContent = countQuestions() + ' questions'; }

// ======================== EVENT BINDING ========================
async function init() {
  try {
    await loadData();
    loadTheme();
    await seedData();
  } catch (e) { console.error('Init error:', e); }
  renderDashboard();
  updateStats();

  // Nav
  document.querySelectorAll('.nav-item').forEach(n => n.addEventListener('click', () => { if (n.dataset.page) switchPage(n.dataset.page); }));

  // Theme
  document.getElementById('themeToggle').addEventListener('click', toggleTheme);

  // Hamburger
  document.getElementById('hamburger').addEventListener('click', () => document.getElementById('sidebar').classList.toggle('open'));

  // Mock test controls
  document.getElementById('mockNextBtn').addEventListener('click', mockNext);
  document.getElementById('mockPrevBtn').addEventListener('click', mockPrev);
  document.getElementById('mockSubmitBtn').addEventListener('click', submitMockTest);
  document.getElementById('mockSubmitPaletteBtn').addEventListener('click', () => { if (confirm('Submit test?')) submitMockTest(); });
  document.getElementById('mockQuitBtn').addEventListener('click', () => { if (confirm('Quit test?')) quitMockTest(); });
  document.getElementById('mockResultBackBtn').addEventListener('click', quitMockTest);

  // Admin tabs
  document.querySelectorAll('.admin-tab').forEach(t => t.addEventListener('click', function () {
    document.querySelectorAll('.admin-tab').forEach(x => x.classList.remove('active'));
    this.classList.add('active');
    renderAdmin();
  }));
}

document.addEventListener('DOMContentLoaded', init);

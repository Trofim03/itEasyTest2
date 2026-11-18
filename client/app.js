const API_BASE = 'http://127.0.0.1:8000/api';

const createForm = document.getElementById('create-form');
const createStatus = document.getElementById('create-status');
const campaignSelect = document.getElementById('campaign-select');
const streamsContainer = document.getElementById('streams-container');
const refreshBtn = document.getElementById('refresh-campaigns');

createForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  createStatus.textContent = 'Создание...';
  createStatus.className = 'status';

  const name = document.getElementById('campaign-name').value.trim();
  const geo = document.getElementById('geo-code').value.trim().toUpperCase();
  const offerId = parseInt(document.getElementById('offer-id').value, 10);
  if (!name || !geo || !offerId) {
    createStatus.textContent = 'Заполните все поля.';
    createStatus.className = 'status error';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, geo, offer_id: offerId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Ошибка создания');
    }
    const data = await res.json();
    createStatus.textContent = `Кампания "${data.name}" создана (ID: ${data.id}).`;
    createStatus.className = 'status success';
    createForm.reset();
    await loadCampaigns();
  } catch (err) {
    createStatus.textContent = `Ошибка: ${err.message}`;
    createStatus.className = 'status error';
  }
});

async function loadCampaigns() {
  campaignSelect.innerHTML = '<option value="">-- Загрузка... --</option>';
  try {
    const res = await fetch(`${API_BASE}/campaigns`);
    if (!res.ok) throw new Error('Не удалось загрузить кампании');
    const campaigns = await res.json();
    campaignSelect.innerHTML = '<option value="">-- Выберите кампанию --</option>';
    campaigns.forEach(c => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.name} (ID: ${c.id})`;
      campaignSelect.appendChild(opt);
    });
  } catch (err) {
    campaignSelect.innerHTML = `<option value="">Ошибка: ${err.message}</option>`;
  }
}

refreshBtn.addEventListener('click', loadCampaigns);

campaignSelect.addEventListener('change', async () => {
  const id = campaignSelect.value;
  if (!id) {
    streamsContainer.innerHTML = '<p class="placeholder">Выберите кампанию.</p>';
    return;
  }
  await loadStreams(id);
});

async function loadStreams(campaignId) {
  streamsContainer.innerHTML = '<p>Загрузка потоков...</p>';
  try {
    const res = await fetch(`${API_BASE}/campaigns/${campaignId}/streams`);
    if (!res.ok) throw new Error('Не удалось загрузить потоки');
    const streams = await res.json();
    if (!streams.length) {
      streamsContainer.innerHTML = '<p class="placeholder">Нет потоков.</p>';
      return;
    }
    streamsContainer.innerHTML = '';
    streams.forEach(stream => renderStream(stream, streamsContainer));
  } catch (err) {
    streamsContainer.innerHTML = `<p class="status error">Ошибка: ${err.message}</p>`;
  }
}

function renderStream(stream, container) {
  const block = document.createElement('div');
  block.className = 'stream-block';

  const header = document.createElement('div');
  header.className = 'stream-header';
  header.innerHTML = `<strong>Поток: ${stream.name || '—'} (ID: ${stream.id})</strong><span>Тип: ${stream.type || 'regular'}</span>`;
  block.appendChild(header);

  const offerList = document.createElement('ul');
  offerList.className = 'offer-list';
  renderOffers(stream, offerList);
  block.appendChild(offerList);

  const addRow = document.createElement('div');
  addRow.className = 'add-offer-row';
  addRow.innerHTML = `<input type="number" placeholder="ID нового оффера" min="1"><button class="btn primary small">Добавить</button>`;
  const input = addRow.querySelector('input');
  addRow.querySelector('button').addEventListener('click', () => {
    const newId = parseInt(input.value, 10);
    if (!newId) return alert('Введите ID оффера');
    addOffer(stream, newId, offerList);
    input.value = '';
  });
  block.appendChild(addRow);

  container.appendChild(block);
}

function renderOffers(stream, offerList) {
  offerList.innerHTML = '';
  const offers = stream.offers || [];
  if (!offers.length) {
    offerList.innerHTML = '<li style="justify-content:center;color:#888;">Нет офферов</li>';
    return;
  }
  offers.forEach(offer => {
    const li = document.createElement('li');
    li.innerHTML = `<span>Оффер ID: ${offer.id}</span><button class="btn danger">Удалить</button>`;
    li.querySelector('button').addEventListener('click', () => {
      removeOffer(stream, offer.id, offerList);
    });
    offerList.appendChild(li);
  });
}

async function addOffer(stream, newOfferId, offerList) {
  const current = (stream.offers || []).map(o => o.id);
  if (current.includes(newOfferId)) return alert('Оффер уже есть');
  await saveOffers(stream, [...current, newOfferId], offerList);
}

async function removeOffer(stream, offerId, offerList) {
  const current = (stream.offers || []).map(o => o.id).filter(id => id !== offerId);
  await saveOffers(stream, current, offerList);
}

async function saveOffers(stream, ids, offerList) {
  try {
    const res = await fetch(`${API_BASE}/streams/${stream.id}/offers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offers: ids }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Ошибка обновления');
    }
    stream.offers = ids.map(id => ({ id }));
    renderOffers(stream, offerList);
  } catch (err) {
    alert(`Ошибка: ${err.message}`);
  }
}

loadCampaigns();
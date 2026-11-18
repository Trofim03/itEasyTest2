import 'dotenv/config';

const BASE = 'https://tlgk.host/admin_api/v1';
const KEY = process.env.KEITARO_API_KEY;

async function kfetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Api-Key': KEY,
      ...(options.headers || {}),
    },
  });
  const text = await res.text();
  let data;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    throw new Error(`Keitaro ${res.status}: ${typeof data === 'string' ? data : JSON.stringify(data)}`);
  } 
  return data;
}

export const getCampaigns = () => kfetch('/campaigns');

export const createCampaign = (payload) =>
  kfetch('/campaigns', { method: 'POST', body: JSON.stringify(payload) });

export const createStream = (payload) =>
  kfetch('/streams', { method: 'POST', body: JSON.stringify(payload) });

export const getStreams = (campaignId) =>
  kfetch(`/campaigns/${campaignId}/streams`);

export const updateStream = (streamId, payload) =>
  kfetch(`/streams/${streamId}`, { method: 'POST', body: JSON.stringify(payload) });
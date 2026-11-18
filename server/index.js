import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import * as kc from './keitaro.js';
import { insertCampaign, listCampaignLog } from './db.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/campaigns', async (req, res) => {
  try {
    res.json(await kc.getCampaigns());
  } catch (e) {
    res.status(502).json({ detail: e.message });
  }
});

app.post('/api/campaigns', async (req, res) => {
  const { name, geo, offer_id } = req.body || {};
  if (!name || !geo || !offer_id) {
    return res.status(400).json({ detail: 'Нужны name, geo, offer_id' });
  }
  try {
    const campaign = await kc.createCampaign({
      name,
      alias: name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      domain_id: Number(process.env.KEITARO_DOMAIN_ID),
      group_id: Number(process.env.KEITARO_GROUP_ID),
      traffic_source_id: Number(process.env.KEITARO_SOURCE_ID),
    });
    const cid = campaign.id;

    await kc.createStream(cid, {
      campaign_id: cid,
      name: 'Google (geo)',
      type: 'regular',
      action_type: 'redirect',
      action_payload: 'https://www.google.com',
      filters: [{ name: 'geo', mode: 'accept', payload: String(geo).toUpperCase() }],
    });

    await kc.createStream(cid, {
      campaign_id: cid,
      name: 'Offer',
      type: 'regular',
      schema: 'offers',
      offers: [{ id: Number(offer_id) }],
    });

    insertCampaign.run(cid, name, String(geo).toUpperCase(), Number(offer_id));

    res.json({ id: cid, name });
  } catch (e) {
    res.status(502).json({ detail: e.message });
  }
});

app.get('/api/campaigns/:id/streams', async (req, res) => {
  try {
    res.json(await kc.getStreams(Number(req.params.id)));
  } catch (e) {
    res.status(502).json({ detail: e.message });
  }
});

app.post('/api/streams/:id/offers', async (req, res) => {
  const offers = Array.isArray(req.body?.offers) ? req.body.offers : null;
  if (!offers) return res.status(400).json({ detail: 'Нужен массив offers' });
  try {
    const payload = { offers: offers.map(id => ({ id: Number(id) })) };
    res.json(await kc.updateStream(Number(req.params.id), payload));
  } catch (e) {
    res.status(502).json({ detail: e.message });
  }
});

app.get('/api/log', (req, res) => {
  res.json(listCampaignLog.all());
});

const port = Number(process.env.PORT || 8000);
app.listen(port, () => console.log(`Server on http://127.0.0.1:${port} → https://tlgk.host/admin_api/v1`));
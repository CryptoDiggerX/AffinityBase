const { getClaim, setClaim } = require('./_redis');

module.exports = async function handler(req, res) {
  if (req.method === 'GET') {
    const { fid, address } = req.query;
    if (!fid || !address) {
      return res.status(400).json({ error: 'fid and address are required' });
    }
    try {
      const claim = await getClaim(`claim:${fid}`);
      const claimed = !!(claim && claim.address.toLowerCase() === String(address).toLowerCase());
      return res.status(200).json({ claimed });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal error' });
    }
  }

  if (req.method === 'POST') {
    const { fid, username, address, tier, amount, score, txHash } = req.body || {};

    if (!fid || !address || !tier || !amount || !txHash) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
      const existing = await getClaim(`claim:${fid}`);
      if (existing) {
        return res.status(409).json({ error: 'Already claimed', claim: existing });
      }

      const record = {
        fid,
        username: username || null,
        address,
        tier,
        amount,
        score: typeof score === 'number' ? score : null,
        txHash,
        claimedAt: new Date().toISOString()
      };

      await setClaim(`claim:${fid}`, record);
      await setClaim(`claimtx:${txHash}`, record);

      return res.status(200).json({ ok: true, claim: record });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal error' });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
};

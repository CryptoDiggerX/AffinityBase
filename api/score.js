const NEYNAR_API_KEY = process.env.NEYNAR_API_KEY;

module.exports = async function handler(req, res) {
  const { fid } = req.query;

  if (!fid) {
    return res.status(400).json({ error: 'fid is required' });
  }

  if (!NEYNAR_API_KEY) {
    return res.status(500).json({ error: 'NEYNAR_API_KEY not configured' });
  }

  try {
    const response = await fetch(
      `https://api.neynar.com/v2/farcaster/user/bulk?fids=${fid}`,
      {
        headers: {
          accept: 'application/json',
          'x-api-key': NEYNAR_API_KEY
        }
      }
    );

    if (!response.ok) {
      const errBody = await response.text();
      console.error('Neynar error', response.status, errBody);
      return res.status(response.status).json({ error: 'Neynar lookup failed', detail: errBody });
    }

    const data = await response.json();
    const user = data.users && data.users[0];
    const score = user && user.experimental && typeof user.experimental.neynar_user_score === 'number'
      ? user.experimental.neynar_user_score
      : 0;

    return res.status(200).json({ fid, score });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal error' });
  }
};

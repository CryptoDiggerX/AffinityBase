const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

async function redisCall(command) {
  const path = command.map((part) => encodeURIComponent(part)).join('/');
  const res = await fetch(`${REDIS_URL}/${path}`, {
    headers: { Authorization: `Bearer ${REDIS_TOKEN}` }
  });
  if (!res.ok) {
    throw new Error(`Redis error: ${res.status}`);
  }
  const data = await res.json();
  return data.result;
}

async function getClaim(key) {
  const result = await redisCall(['get', key]);
  return result ? JSON.parse(result) : null;
}

async function setClaim(key, value) {
  return redisCall(['set', key, JSON.stringify(value)]);
}

module.exports = { redisCall, getClaim, setClaim };


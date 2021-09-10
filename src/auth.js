const Iron = require('@hapi/iron');
const authcookies = require('./auth-cookies');
const TOKEN_SECRET =
    process.env.TOKEN_SECRET || 'ooF0d52*FzqNZiztnD0M%OykScdwvAwA&umRE#w3AiDR9';

async function setLoginSession (res, session) {
    const createdAt = Date.now();
    const obj = { ...session, createdAt, maxAge: authcookies.MAX_AGE };
    const token = await Iron.seal(obj, TOKEN_SECRET, Iron.defaults);
    authcookies.setTokenCookie(res, token);
}

async function getLoginSession (req) {
    const token = authcookies.getTokenCookie(req);
    if (!token) {
        return;
    }
    const session = await Iron.unseal(token, TOKEN_SECRET, Iron.defaults);
    const expiresAt = session.createdAt + session.maxAge;

    if (Date.now() > expiresAt) {
        throw new Error('Session expired');
    }
    return session;
}

module.exports = {
    setLoginSession,
    getLoginSession
};

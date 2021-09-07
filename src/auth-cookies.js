const cookie = require('cookie');

const TOKEN_NAME = "token";
const MAX_AGE = 60 * 60 * 8*1000;

function setTokenCookie(res, token) {
    const kookie = cookie.serialize(TOKEN_NAME,token,{
        maxAge:MAX_AGE,
        expires:new Date(Date.now()+MAX_AGE),
        httpOnly:false,
        secure:process.env.NODE_ENV ==='production',
        path:'/',
        sameSite:'lax'
    });
    res.setHeader('Set-Cookie',kookie);
}

function removeTokenCookie(res){
    const kookie = cookie.serialize(TOKEN_NAME,'',{
        maxAge:-1,
        path:'/',
    })
    res.setHeader('Set-Cookie',kookie);
}

function parseCookies(req){
    //api routes
    if(req.cookies){return req.cookies}
    //pages
    const kookie = req.headers.cookie;
    return cookie.parse(kookie||'');
}

function getTokenCookie(req){
    const kookies = parseCookies(req);
    return kookies[TOKEN_NAME];
}

module.exports={
    MAX_AGE,
    setTokenCookie,
    removeTokenCookie,
    parseCookies,
    getTokenCookie
}


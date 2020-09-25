const fs = require('fs');
const request = require("request");
const APIkey = "test";

function RandomString(length) {
    let radom13chars = function () {
        return Math.random().toString(16).substring(2, 15)
    }
    let loops = Math.ceil(length / 13)
    return new Array(loops).fill(radom13chars).reduce((string, func) => {
        return string + func()
    }, '').substring(0, length)
}

function getEmail(callback) {
    request.get('http://localhost:1337/api/getemail', {
        headers: {
            'x-api-key' : APIkey
        }
    }, (err, res, body) => {
        if (res.statusCode == 200) {
            callback(JSON.parse(body).email);
        } else {
            callback(0);
        }
    });
}

function createAccount(username, password, verify, verificationtype)
{
    getEmail((email) => {
        request.get(`http://localhost:1337/discord/api/createaccount?username=${username}&password=${password}&email=${email}`, {
            headers: {
                'x-api-key' : APIkey
            }
        }, (err, res, body) => {
            if (res.statusCode == 200) {
                if (!verify) {
                    console.log("[GEN] Created Account, saved to tokens.txt");
                    fs.writeFileSync("./data/tokens.txt", JSON.parse(body).token);
                } else {
                    if (verificationtype == undefined) {
                        console.log(`[GEN] Created Account, verifying with both email and phone methods..`);
                        var token = JSON.parse(body).token;
                        request.get(`http://localhost:1337/discord/api/verifyaccount?token=${token}&type=1`, {
                            headers: {
                                'x-api-key' : APIkey
                            }
                        }, (err, res, body) => {
                            if (res.statusCode == 200) {
                                console.log(`[GEN] Verified token: ${token}`);
                                request.get(`http://localhost:1337/discord/api/verifyaccount?token=${token}&type=2`, {
                                headers: {
                                    'x-api-key' : APIkey
                                }
                            }, (err, res, body) => {
                                console.log(body);
                                console.log(res);
                                if (res.statusCode == 200) {
                                    console.log(`[GEN] Phone verified token: ${token} -> Saving to verifiedtokens.txt`);
                                    fs.writeFileSync("verifiedtokens.txt", JSON.stringify({token: token, verification: 3}));
                                }
                              });
                            }
                        });
                    } else {
                        console.log(`[GEN] Created Account, verifying by ${verificationtype == 1 ? "email" : "phone"}`);
                        var token = JSON.parse(body).token;
                        request.get(`http://localhost:1337/discord/api/verifyaccount?token=${token}&type=${verificationtype}`, {
                            headers: {
                                'x-api-key' : APIkey
                            }
                        }, (err, res, body) => {
                            if (res.statusCode == 200) {
                                console.log(`[GEN] ${verificationtype == 1 ? "Email" : "Phone"} verified token: ${token} -> Saving to verifiedtokens.txt`);
                                fs.writeFileSync("verifiedtokens.txt", JSON.stringify({token: token, verification: verificationtype}));
                            }
                        });
                    }
                }
            }
        });
    });
}

function startAccountCreator()
{
    console.log("[GEN] Creating Accounts..");
    createAccount(RandomString(15), RandomString(15), false);
}

startAccountCreator();
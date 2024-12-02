import { OAuth2Client } from "google-auth-library";
import { promises as fs } from "node:fs";
import path from "node:path";

const __dirname = import.meta.dirname

const CREDENTIALS_PATH = path.join(__dirname, 'API-cred.json');
//const CREDENTIALS_PATH = process.env.CREDENTIALS_PATH;


export default async function authorize(api = '_all') {
    const apis = ['storage', 'database', 'mailer'];
    if (api === '_all') {
        const authapis = Array(3);
        apis.forEach(async (api) => {
            authapis.push(await auth(api))
        });
        return authapis
    } else if (apis.includes(api)) {
        return await auth(api)
    } else {
        console.warn(`The api: ${api} wan not found`);
        return null
    }
   
}

async function auth(api) {
     const content = await fs.readFile(CREDENTIALS_PATH, 'utf-8');
    const { client_id, client_secret, refresh_token } = JSON.parse(content)[api];

    const oAuth2Client = new OAuth2Client(client_id, client_secret);
    oAuth2Client.setCredentials({ refresh_token });

    const tokenInfo = await oAuth2Client.getAccessToken();
    console.log('Access token fetched:', tokenInfo.token);

    return oAuth2Client;
}

//authorize()
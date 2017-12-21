import { Issuer } from 'openid-client';
import Debug from 'debug';

let debug = Debug('pdk:clientauthenticator');

//FIXME: Remove this default http options setter after 'got' library will release new version
Issuer.defaultHttpOptions = {form: true};

export async function authenticateclient({ client_id, client_secret, issuer = 'https://accounts.pdk.io' }) {
  debug(`Authenticating as client_id: ${client_id}`);

  const pdkIssuer = await Issuer.discover(issuer);
  const client = new pdkIssuer.Client({ client_id, client_secret });
  client.CLOCK_TOLERANCE = 20;

  debug(`Got configured oidc client`);

  let token_set = { };

  // This must conform to the token_set interface
  // see session.js for usage
  const oauthtoken_set = async () => {
    if(!token_set.id_token) {
      debug(`Initial fetch of oauthtoken`);
      await oauthtoken_set.refresh()
    }

    //TODO: Check expiration time of token and optimistically renew it

    return token_set;
  };

  oauthtoken_set.refresh = async () => {
    debug(`Getting token with client credentials`);

    token_set = await client.grant({ grant_type: 'client_credentials' });

    debug(`Got fresh token: ${JSON.stringify(token_set)}`);
  };

  oauthtoken_set.revoke = async () => {
    if(token_set.id_token) {
      client.revoke(token_set.id_token);
    }
  };

  // Force initial load of the oauthtoken_set
  await oauthtoken_set.refresh();
  return oauthtoken_set;
}

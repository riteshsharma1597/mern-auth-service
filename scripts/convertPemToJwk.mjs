import fs from 'fs';
import rsaPemToJwk from 'rsa-pem-to-jwk';

const privateKey = fs.readFileSync('./certs/private.pem');

rsaPemToJwk(privateKey, { use: 'sig' }, 'public');

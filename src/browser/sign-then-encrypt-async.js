import browser from 'bowser';
import CryptoWorkerApi from './crypto-worker-api';
import { signThenEncrypt } from './sign-then-encrypt';
import { toBase64, base64ToBuffer } from './utils/crypto-utils';
import { throwVirgilError, checkIsBuffer } from './utils/crypto-errors';
import { makePrivateKey } from './utils/makePrivateKey';
import { makePublicKey } from './utils/makePublicKey';

/**
 * Signs and encrypts the data asynchronously (in a Web Worker if that is
 * supported, otherwise just defers the execution in a Promise).
 *
 * @param {Buffer} data
 * @param {Buffer|PrivateKeyInfo} privateKey - The `privateKey` can be an
 * 		object or a Buffer. If `privateKey` is a Buffer, it is treated as a
 * 		raw key without password. If it is an object, it is interpreted as a
 * 		hash containing three properties: `privateKey`, optional `recipientId`
 * 		and optional `password`.
 * @param {Buffer|PublicKeyInfo} recipientId -
 * 		Recipient ID if encrypting for single recipient OR
 * 		Array of recipientId - publicKey pairs if encrypting for multiple recipients
 * @param {Buffer} [publicKey] - Public key if encrypting for single recipient.
 * 		Ignored if encrypting for multiple recipients.
 *
 * @returns {Promise<Buffer>} Signed and encrypted data.
 */
export function signThenEncryptAsync (data, privateKey, recipientId, publicKey) {
	if (browser.msie || browser.msedge) {
		return new Promise((resolve, reject) => {
			try {
				resolve(signThenEncrypt(data, privateKey, recipientId, publicKey));
			} catch (e) {
				reject(e.message);
			}
		});
	} else {
		checkIsBuffer(data, 'data');

		let signingKey = makePrivateKey(privateKey);
		let recipients = Array.isArray(recipientId) ?
			// don't pass `makePublicKey` function directly to `map`
			// because `map` passes an index as the second argument, which
			// might be interpreted as recipientId by `makePublicKey`
			recipientId.map(pubkey => makePublicKey(pubkey)) :
			[ makePublicKey(publicKey, recipientId) ];

		let recipientsMarshalled = recipients.map(r => r.marshall());

		return CryptoWorkerApi.signThenEncrypt(
			toBase64(data),
			signingKey.marshall(),
			recipientsMarshalled)
			.then(base64ToBuffer)
			.catch((e) => throwVirgilError('10000', { error: e }));
	}
}

export default signThenEncryptAsync;


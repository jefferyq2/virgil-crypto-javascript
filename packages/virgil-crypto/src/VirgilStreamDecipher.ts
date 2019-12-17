import { dataToUint8Array, toBuffer } from '@virgilsecurity/data-utils';

import { DATA_SIGNATURE_KEY } from './constants';
import { getFoundationModules } from './foundationModules';
import { Data } from './types';
import { validatePrivateKey } from './validators';
import { VirgilPrivateKey } from './VirgilPrivateKey';

export class VirgilStreamDecipher {
  private _isFinished = false;
  private isDisposed = false;
  private recipientCipher: FoundationModules.RecipientCipher;
  private privateKey: VirgilPrivateKey;

  get isFinished() {
    return this._isFinished;
  }

  constructor(privateKey: VirgilPrivateKey) {
    const foundationModules = getFoundationModules();

    validatePrivateKey(privateKey);
    this.privateKey = privateKey;

    this.recipientCipher = new foundationModules.RecipientCipher();

    try {
      this.recipientCipher.startDecryptionWithKey(
        privateKey.identifier,
        this.privateKey.lowLevelPrivateKey,
        new Uint8Array(0),
      );
    } catch (error) {
      this.recipientCipher.delete();
      throw error;
    }
  }

  getSignature() {
    if (!this._isFinished) {
      throw new Error(
        'Illegal state. Cannot get signature before the `final` method has been called.',
      );
    }
    if (this.isDisposed) {
      throw new Error(
        'Illegal state. Cannot get signature after the `dispose` method has been called.',
      );
    }
    const messageInfoCustomParams = this.recipientCipher.customParams();
    try {
      return toBuffer(messageInfoCustomParams.findData(DATA_SIGNATURE_KEY));
    } finally {
      messageInfoCustomParams.delete();
    }
  }

  update(data: Data) {
    this.ensureLegalState();
    const myData = dataToUint8Array(data, 'utf8');
    return toBuffer(this.recipientCipher.processDecryption(myData));
  }

  final(dispose = true) {
    this.ensureLegalState();
    try {
      return toBuffer(this.recipientCipher.finishDecryption());
    } finally {
      this._isFinished = true;
      if (dispose) {
        this.dispose();
      }
    }
  }

  dispose() {
    this.recipientCipher.delete();
    this.isDisposed = true;
  }

  private ensureLegalState() {
    if (this._isFinished) {
      throw new Error('Illegal state. Cannot use cipher after the `final` method has been called.');
    }
    if (this.isDisposed) {
      throw new Error(
        'Illegal state. Cannot use cipher after the `dispose` method has been called.',
      );
    }
  }
}
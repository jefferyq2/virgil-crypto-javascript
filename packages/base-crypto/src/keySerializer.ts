import { getFoundationModules } from './foundationModules';
import { LowLevelPrivateKey, LowLevelPublicKey, KeyAsn1Serializer } from './types';

let keySerializer: KeyAsn1Serializer | undefined;

export const getKeySerializer = () => {
  if (keySerializer) {
    return keySerializer;
  }
  const foundationModules = getFoundationModules();
  keySerializer = new foundationModules.KeyAsn1Serializer() as KeyAsn1Serializer;
  keySerializer.setupDefaults();
  return keySerializer;
};

export const serializePrivateKey = (lowLevelPrivateKey: LowLevelPrivateKey) =>
  getKeySerializer().serializePrivateKey(lowLevelPrivateKey);

export const serializePublicKey = (lowLevelPublicKey: LowLevelPublicKey) =>
  getKeySerializer().serializePublicKey(lowLevelPublicKey);

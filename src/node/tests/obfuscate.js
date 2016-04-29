"use strict";
var VirgilCrypto = require('../');
var expect = require('expect');

describe('obfuscate', () => {
	it('it obfuscates strings', () => {
		var o1 = VirgilCrypto.obfuscate('asfasfas', 'qwqeqwe');
		var o2 = VirgilCrypto.obfuscate('asfasfas', 'qwqeqwe');
		expect(typeof o1).toEqual('string');
		expect(o1).toEqual(o2);
	});

	it('different salt -> different result', () => {
		var o1 = VirgilCrypto.obfuscate('asfasfas', 'qwqeqwe');
		var o2 = VirgilCrypto.obfuscate('asfasfas', 'qwqeqwe2');
		expect(typeof o1).toEqual('string');
		expect(typeof o2).toEqual('string');
		expect(o1).toNotEqual(o2);
	});
});
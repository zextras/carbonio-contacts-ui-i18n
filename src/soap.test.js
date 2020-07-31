/*
 * *** BEGIN LICENSE BLOCK *****
 * Copyright (C) 2011-2020 ZeXtras
 *
 * The contents of this file are subject to the ZeXtras EULA;
 * you may not use this file except in compliance with the EULA.
 * You may obtain a copy of the EULA at
 * http://www.zextras.com/zextras-eula.html
 * *** END LICENSE BLOCK *****
 */

import {
	normalizeContactMailsToSoapOp,
	normalizeContactPhonesToSoapOp,
	normalizeContactAddressesToSoapOp,
	normalizeContactUrlsToSoapOp
} from './soap';
import {ContactAddressType, ContactPhoneType, ContactUrlType} from './db/contact';

describe('SOAP Utils', () => {
	test('Normalize Contact Mails for SOAP Operation', () => {
		expect(
			normalizeContactMailsToSoapOp({
				0: { mail: 'mail@example.com' },
				1: { mail: 'mail1@example.com' },
				2: { mail: 'mail2@example.com' }
			})
		).toStrictEqual(
			{
				0: 'mail@example.com',
				1: 'mail1@example.com',
				2: 'mail2@example.com'
			}
		);
	});

	test('Normalize Contact Phones for SOAP Operation', () => {
		expect(
			normalizeContactPhonesToSoapOp({
				0: { number: 'o0', name: ContactPhoneType.OTHER },
				1: { number: 'o1', name: ContactPhoneType.OTHER },
				2: { number: 'o2', name: ContactPhoneType.OTHER },
				3: { number: 'm', name: ContactPhoneType.MOBILE },
				4: { number: 'h', name: ContactPhoneType.HOME },
				5: { number: 'w', name: ContactPhoneType.WORK }
			})
		).toStrictEqual(
			{
				0: 'o0',
				1: 'o1',
				2: 'o2',
				3: 'm',
				4: 'h',
				5: 'w'
			}
		);
	});

	test('Normalize Contact Urls for SOAP Operation', () => {
		expect(
			normalizeContactUrlsToSoapOp({
				0: { url: 'o0', name: ContactUrlType.OTHER },
				1: { url: 'o1', name: ContactUrlType.OTHER },
				2: { url: 'o2', name: ContactUrlType.OTHER },
				3: { url: 'h', name: ContactUrlType.HOME },
				4: { url: 'w', name: ContactUrlType.WORK }
			})
		).toStrictEqual(
			{
				0: 'o0',
				1: 'o1',
				2: 'o2',
				3: 'h',
				4: 'w'
			}
		);
	});

	test('Normalize Contact Addresses for SOAP Operation', () => {
		expect(
			normalizeContactAddressesToSoapOp({
				otherAddress: {
					street: 'os0',
					postalCode: 'op0',
					city: 'oc0',
					state: 'ost0',
					country: 'oco0',
					type: ContactAddressType.OTHER
				}/*,
				otherAddress1: {
					street: 'os2',
					postalCode: 'op2',
					city: 'oc2',
					state: 'ost2',
					country: 'oco2',
					type: ContactAddressType.OTHER
				},
				homeAddress: {
					street: 'hs',
					postalCode: 'hp',
					city: 'hc',
					state: 'hst',
					country: 'hco',
					type: ContactAddressType.HOME
				},
				workAddress: {
					street: 'ws',
					postalCode: 'wp',
					city: 'wc',
					state: 'wst',
					country: 'wco',
					type: ContactAddressType.WORK
				}*/
			})
		).toStrictEqual(
			{
				otherStreet: 'os0',
				otherPostalCode: 'op0',
				otherCity: 'oc0',
				otherState: 'ost0',
				otherCountry: 'oco0',
				/*otherStreet2: 'os2',
				otherPostalCode2: 'op2',
				otherCity2: 'oc2',
				otherState2: 'ost2',
				otherCountry2: 'oco2',
				homeStreet: 'hs',
				homePostalCode: 'hp',
				homeCity: 'hc',
				homeState: 'hst',
				homeCountry: 'hco',
				workStreet: 'ws',
				workPostalCode: 'wp',
				workCity: 'wc',
				workState: 'wst',
				workCountry: 'wco'*/
			}
		);
	});
});

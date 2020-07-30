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
	normalizeContactAddressesToSoapOp
} from './soap';
import { ContactAddressType, ContactPhoneType } from './db/contact';

describe('SOAP Utils', () => {

	test('Normalize Contact Mails for SOAP Operation', () => {
		expect(
			normalizeContactMailsToSoapOp([
				{ mail: 'mail@example.com' },
				{ mail: 'mail1@example.com' },
				{ mail: 'mail2@example.com' }
			])
		).toStrictEqual(
			{
				'0': 'mail@example.com',
				'1': 'mail1@example.com',
				'2': 'mail2@example.com'
			}
		);
	});

	test('Normalize Contact Phones for SOAP Operation', () => {
		expect(
			normalizeContactPhonesToSoapOp([
				{ number: 'o0', name: ContactPhoneType.OTHER },
				{ number: 'o1', name: ContactPhoneType.OTHER },
				{ number: 'o2', name: ContactPhoneType.OTHER },
				{ number: 'm', name: ContactPhoneType.MOBILE },
				{ number: 'h', name: ContactPhoneType.HOME },
				{ number: 'w', name: ContactPhoneType.WORK }
			])
		).toStrictEqual(
			{
				'0': 'o0',
				'1': 'o1',
				'2': 'o2',
				'3': 'm',
				'4': 'h',
				'5': 'w'
			}
		);
	});

	test.skip('Normalize Contact Addresses for SOAP Operation', () => {
		expect(
			normalizeContactAddressesToSoapOp([
				{
					street: 'os0',
					postalCode: 'op0',
					city: 'oc0',
					state: 'ost0',
					country: 'oco0',
					type: ContactAddressType.OTHER
				},
				{
					street: 'os1',
					postalCode: 'op1',
					city: 'oc1',
					state: 'ost1',
					country: 'oco1',
					type: ContactAddressType.OTHER
				},
				{
					street: 'hs',
					postalCode: 'hp',
					city: 'hc',
					state: 'hst',
					country: 'hco',
					type: ContactAddressType.HOME
				},
				{
					street: 'ws',
					postalCode: 'wp',
					city: 'wc',
					state: 'wst',
					country: 'wco',
					type: ContactAddressType.WORK
				}
			])
		).toStrictEqual(
			{
				otherStreet: 'os0',
				otherPostalCode: 'op0',
				otherCity: 'oc0',
				otherState: 'ost0',
				otherCountry: 'oco0',
				otherStreet1: 'os1',
				otherPostalCode1: 'op1',
				otherCity1: 'oc1',
				otherState1: 'ost1',
				otherCountry1: 'oco1',
				homeStreet: 'hs',
				homePostalCode: 'hp',
				homeCity: 'hc',
				homeState: 'hst',
				homeCountry: 'hco',
				workStreet: 'ws',
				workPostalCode: 'wp',
				workCity: 'wc',
				workState: 'wst',
				workCountry: 'wco'
			}
		);
	});
});

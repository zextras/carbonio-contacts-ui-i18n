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
	normalizeChangeMailsToSoapOp,
	normalizeChangePhonesToSoapOp,
	normalizeChangeAddressesToSoapOp,
	normalizeChangeUrlsToSoapOp
} from './soap';
import { ContactAddressType, ContactPhoneType } from './db/contact';

describe('SOAP Utils', () => {
	test('Normalize Contact Mails for SOAP Operation', () => {
		expect(
			normalizeContactMailsToSoapOp({
				email: { mail: 'mail@example.com' },
				email2: { mail: 'mail1@example.com' },
				email3: { mail: 'mail2@example.com' }
			})
		).toStrictEqual(
			{
				email: 'mail@example.com',
				email2: 'mail1@example.com',
				email3: 'mail2@example.com'
			}
		);
	});

	test('Normalize Contact Phones for SOAP Operation', () => {
		expect(
			normalizeContactPhonesToSoapOp({
				otherPhone: { number: 'o0', type: ContactPhoneType.OTHER },
				otherPhone2: { number: 'o1', type: ContactPhoneType.OTHER },
				otherPhone3: { number: 'o2', type: ContactPhoneType.OTHER },
				mobilePhone: { number: 'm', type: ContactPhoneType.MOBILE },
				homePhone: { number: 'h', type: ContactPhoneType.HOME },
				workPhone: { number: 'w', type: ContactPhoneType.WORK }
			})
		).toStrictEqual(
			{
				otherPhone: 'o0',
				otherPhone2: 'o1',
				otherPhone3: 'o2',
				mobilePhone: 'm',
				homePhone: 'h',
				workPhone: 'w'
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
				},
				otherAddress2: {
					street: 'os1',
					postalCode: 'op1',
					city: 'oc1',
					state: 'ost1',
					country: 'oco1',
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
				}
			})
		).toStrictEqual(
			{
				otherStreet: 'os0',
				otherPostalCode: 'op0',
				otherCity: 'oc0',
				otherState: 'ost0',
				otherCountry: 'oco0',
				otherStreet2: 'os1',
				otherPostalCode2: 'op1',
				otherCity2: 'oc1',
				otherState2: 'ost1',
				otherCountry2: 'oco1',
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

	test('Normalize Mail Changes for SOAP Operation', () => {
		expect(
			normalizeChangeMailsToSoapOp({
				'email.email': { mail: 'mail@example.com' },
				'email.email2': { mail: 'mail1@example.com' },
				'email.email3': { mail: 'mail2@example.com' },
				'email.email4': null
			})
		).toStrictEqual(
			{
				email: 'mail@example.com',
				email2: 'mail1@example.com',
				email3: 'mail2@example.com',
				email4: ''
			}
		);
	});

	test('Normalize Phone Changes for SOAP Operation', () => {
		expect(
			normalizeChangePhonesToSoapOp({
				'phone.otherPhone': { number: 'o0', type: ContactPhoneType.OTHER },
				'phone.mobilePhone': null,
			})
		).toStrictEqual(
			{
				otherPhone: 'o0',
				mobilePhone: ''
			}
		);
	});

	test('Normalize Address Changes for SOAP Operation', () => {
		expect(
			normalizeChangeAddressesToSoapOp({
				'address.otherAddress': {
					street: 'os0',
					postalCode: 'op0',
					city: 'oc0',
					state: 'ost0',
					country: 'oco0',
					type: ContactAddressType.OTHER
				},
				'address.otherAddress2': null
			})
		).toStrictEqual(
			{
				otherStreet: 'os0',
				otherPostalCode: 'op0',
				otherCity: 'oc0',
				otherState: 'ost0',
				otherCountry: 'oco0',
				otherStreet2: '',
				otherPostalCode2: '',
				otherCity2: '',
				otherState2: '',
				otherCountry2: ''
			}
		);
	});
});

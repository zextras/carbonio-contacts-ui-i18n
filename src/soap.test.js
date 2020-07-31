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
	normalizeContactUrlsToSoapOp, normalizeContactAttrsToSoapOp
} from './soap';
import {
	Contact, ContactAddressType, ContactPhoneType, ContactUrlType
} from './db/contact';

describe('SOAP Utils', () => {
	test('Normalize Contact Mails for SOAP Operation', () => {
		expect(
			normalizeContactMailsToSoapOp({
				mail: { mail: 'mail@example.com' },
				mail2: { mail: 'mail1@example.com' },
				mail3: { mail: 'mail2@example.com' }
			})
		).toStrictEqual(
			{
				mail: 'mail@example.com',
				mail2: 'mail1@example.com',
				mail3: 'mail2@example.com'
			}
		);
	});

	test('Normalize Contact Phones for SOAP Operation', () => {
		expect(
			normalizeContactPhonesToSoapOp({
				otherPhone: { number: 'o0', name: ContactPhoneType.OTHER },
				otherPhone2: { number: 'o1', name: ContactPhoneType.OTHER },
				otherPhone3: { number: 'o2', name: ContactPhoneType.OTHER },
				mobilePhone: { number: 'm', name: ContactPhoneType.MOBILE },
				homePhone: { number: 'h', name: ContactPhoneType.HOME },
				workPhone: { number: 'w', name: ContactPhoneType.WORK }
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

	test('Normalize Contact Urls for SOAP Operation', () => {
		expect(
			normalizeContactUrlsToSoapOp({
				otherUrl: { url: 'o0', name: ContactUrlType.OTHER },
				otherUrl2: { url: 'o1', name: ContactUrlType.OTHER },
				otherUrl3: { url: 'o2', name: ContactUrlType.OTHER },
				homeUrl: { url: 'h', name: ContactUrlType.HOME },
				workUrl: { url: 'w', name: ContactUrlType.WORK }
			})
		).toStrictEqual(
			{
				otherUrl: 'o0',
				otherUrl2: 'o1',
				otherUrl3: 'o2',
				homeUrl: 'h',
				workUrl: 'w'
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
				}
			})
		).toStrictEqual(
			{
				otherStreet: 'os0',
				otherPostalCode: 'op0',
				otherCity: 'oc0',
				otherState: 'ost0',
				otherCountry: 'oco0',
				otherStreet2: 'os2',
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
				workCountry: 'wco'
			}
		);
	});

	test('Normalize Contact Attributes for SOAP Operation', () => {
		expect(
			normalizeContactAttrsToSoapOp(new Contact(
				{
					nameSuffix: 'nameSuffix',
					namePrefix: 'namePrefix',
					firstName: 'firstName',
					lastName: 'lastName',
					middleName: 'middleName',
					image: 'image',
					jobTitle: 'jobTitle',
					department: 'department',
					company: 'company',
					notes: 'notes',
				}
			))
		).toStrictEqual(
			[
				{
					_content: 'nameSuffix',
					n: 'nameSuffix'
				},
				{
					_content: 'namePrefix',
					n: 'namePrefix'
				},
				{
					_content: 'firstName',
					n: 'firstName'
				},
				{
					_content: 'lastName',
					n: 'lastName'
				},
				{
					_content: 'middleName',
					n: 'middleName'
				},
				{
					_content: 'image',
					n: 'image'
				},
				{
					_content: 'jobTitle',
					n: 'jobTitle'
				},
				{
					_content: 'department',
					n: 'department'
				},
				{
					_content: 'company',
					n: 'company'
				},
				{
					_content: 'notes',
					n: 'notes'
				}
			]
		);
	});
});

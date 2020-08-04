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
	normalizeContactUrlsToSoapOp,
	normalizeContactAttrsToSoapOp,
	normalizeContactChangesToSoapOp
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

	test('Normalize Contact Urls for SOAP Operation', () => {
		expect(
			normalizeContactUrlsToSoapOp({
				otherUrl: { url: 'o0', type: ContactUrlType.OTHER },
				otherUrl2: { url: 'o1', type: ContactUrlType.OTHER },
				otherUrl3: { url: 'o2', type: ContactUrlType.OTHER },
				homeUrl: { url: 'h', type: ContactUrlType.HOME },
				workUrl: { url: 'w', type: ContactUrlType.WORK }
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
					nickName: 'nickName',
					email: {
						email: {
							mail: 'mail@example.com'
						},
						email2: {
							mail: 'mail2@example.com'
						}
					},
					phone: {
						otherPhone: {
							type: ContactAddressType.OTHER,
							number: 'number'
						}
					},
					address: {
						otherAddress: {
							street: 'os0',
							postalCode: 'op0',
							city: 'oc0',
							state: 'ost0',
							country: 'oco0',
							type: ContactAddressType.OTHER
						}
					},
					URL: {
						otherUrl: {
							url: 'o0',
							type: ContactUrlType.OTHER
						}
					}
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
				},
				{
					_content: 'nickName',
					n: 'nickname'
				},
				{
					_content: 'mail@example.com',
					n: 'email'
				},
				{
					_content: 'mail2@example.com',
					n: 'email2'
				},
				{
					_content: 'number',
					n: 'otherPhone'
				},
				{
					_content: 'os0',
					n: 'otherStreet'
				},
				{
					_content: 'op0',
					n: 'otherPostalCode'
				},
				{
					_content: 'oc0',
					n: 'otherCity'
				},
				{
					_content: 'ost0',
					n: 'otherState'
				},
				{
					_content: 'oco0',
					n: 'otherCountry'
				},
				{
					_content: 'o0',
					n: 'otherUrl'
				}
			]

		);
	});

	test('Normalize Contact Changes for SOAP Operation', () => {
		expect(
			normalizeContactChangesToSoapOp({
				'email.email2': {
					mail: 'mail2@mail.com'
				},
				'email.email.mail': 'mail@mail.com',
				'phone.workPhone': {
					type: ContactAddressType.WORK,
					number: 'number'
				},
				'URL.workURL2': {
					type: ContactAddressType.WORK,
					url: 'newURL'
				},
				'address.otherAddress': {
					street: 'os0',
					postalCode: 'op0',
					city: 'oc0',
					state: 'ost0',
					country: 'oco0',
					type: ContactAddressType.OTHER
				}
			})
		).toStrictEqual([
			{ _content: 'mail2@mail.com', n: 'email2' },
			{ _content: 'mail@mail.com', n: 'email' },
			{ _content: 'number', n: 'workPhone' },
			{ _content: 'newURL', n: 'workURL2' },
			{ _content: 'os0', n: 'otherStreet' },
			{ _content: 'op0', n: 'otherPostalCode' },
			{ _content: 'oc0', n: 'otherCity' },
			{ _content: 'ost0', n: 'otherState' },
			{ _content: 'oco0', n: 'otherCountry' },


		]);
	});
});

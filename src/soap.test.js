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
				otherPhone: { number: 'otherPhone', type: ContactPhoneType.OTHER },
				otherPhone2: { number: 'otherPhone2', type: ContactPhoneType.OTHER },
				otherPhone3: { number: 'otherPhone3', type: ContactPhoneType.OTHER },
				mobilePhone: { number: 'mobilePhone', type: ContactPhoneType.MOBILE },
				homePhone: { number: 'homePhone', type: ContactPhoneType.HOME },
				workPhone: { number: 'workPhone', type: ContactPhoneType.WORK }
			})
		).toStrictEqual(
			{
				otherPhone: 'otherPhone',
				otherPhone2: 'otherPhone2',
				otherPhone3: 'otherPhone3',
				mobilePhone: 'mobilePhone',
				homePhone: 'homePhone',
				workPhone: 'workPhone'
			}
		);
	});

	test('Normalize Contact Urls for SOAP Operation', () => {
		expect(
			normalizeContactUrlsToSoapOp({
				otherUrl: { url: 'otherUrl', type: ContactUrlType.OTHER },
				otherUrl2: { url: 'otherUrl2', type: ContactUrlType.OTHER },
				otherUrl3: { url: 'otherUrl3', type: ContactUrlType.OTHER },
				homeUrl: { url: 'homeUrl', type: ContactUrlType.HOME },
				workUrl: { url: 'workUrl', type: ContactUrlType.WORK }
			})
		).toStrictEqual(
			{
				otherUrl: 'otherUrl',
				otherUrl2: 'otherUrl2',
				otherUrl3: 'otherUrl3',
				homeUrl: 'homeUrl',
				workUrl: 'workUrl'
			}
		);
	});

	test('Normalize Contact Addresses for SOAP Operation', () => {
		expect(
			normalizeContactAddressesToSoapOp({
				otherAddress: {
					street: 'otherStreet',
					postalCode: 'otherPostalCode',
					city: 'otherCity',
					state: 'otherState',
					country: 'otherCountry',
					type: ContactAddressType.OTHER
				},
				otherAddress2: {
					street: 'otherStreet2',
					postalCode: 'otherPostalCode2',
					city: 'otherCity2',
					state: 'otherState2',
					country: 'otherCountry2',
					type: ContactAddressType.OTHER
				},
				homeAddress: {
					street: 'homeStreet',
					postalCode: 'homePostalCode',
					city: 'homeCity',
					state: 'homeState',
					country: 'homeCountry',
					type: ContactAddressType.HOME
				},
				workAddress: {
					street: 'workStreet',
					postalCode: 'workPostalCode',
					city: 'workCity',
					state: 'workState',
					country: 'workCountry',
					type: ContactAddressType.WORK
				}
			})
		).toStrictEqual(
			{
				otherStreet: 'otherStreet',
				otherPostalCode: 'otherPostalCode',
				otherCity: 'otherCity',
				otherState: 'otherState',
				otherCountry: 'otherCountry',
				otherStreet2: 'otherStreet2',
				otherPostalCode2: 'otherPostalCode2',
				otherCity2: 'otherCity2',
				otherState2: 'otherState2',
				otherCountry2: 'otherCountry2',
				homeStreet: 'homeStreet',
				homePostalCode: 'homePostalCode',
				homeCity: 'homeCity',
				homeState: 'homeState',
				homeCountry: 'homeCountry',
				workStreet: 'workStreet',
				workPostalCode: 'workPostalCode',
				workCity: 'workCity',
				workState: 'workState',
				workCountry: 'workCountry'
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
							number: 'otherPhone'
						}
					},
					address: {
						otherAddress: {
							street: 'otherStreet',
							postalCode: 'otherPostalCode',
							city: 'otherCity',
							state: 'otherState',
							country: 'otherCountry',
							type: ContactAddressType.OTHER
						}
					},
					URL: {
						otherUrl: {
							url: 'otherUrl',
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
					_content: 'otherPhone',
					n: 'otherPhone'
				},
				{
					_content: 'otherStreet',
					n: 'otherStreet'
				},
				{
					_content: 'otherPostalCode',
					n: 'otherPostalCode'
				},
				{
					_content: 'otherCity',
					n: 'otherCity'
				},
				{
					_content: 'otherState',
					n: 'otherState'
				},
				{
					_content: 'otherCountry',
					n: 'otherCountry'
				},
				{
					_content: 'otherUrl',
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
					number: 'workPhone'
				},
				'phone.workPhone2.number': 'workPhone2',
				'URL.workURL2': {
					type: ContactAddressType.WORK,
					url: 'workUrl2'
				},
				'URL.workUrl.url': 'workUrl',
				'address.workAddress': {
					city: 'workCity',
					country: 'workCountry',
					postalCode: 'workPostalCode',
					state: 'workState',
					street: 'workStreet',
					type: 'work'
				},
				'address.otherAddress.city': 'otherCity',
				'address.otherAddress.country': 'otherCountry',
				'address.otherAddress.street': 'otherStreet',
				'address.otherAddress.postalCode': 'otherPostalCode',
				'address.otherAddress.state': 'otherState',
				notes: 'notes'
			})
		).toStrictEqual([
			{ _content: 'notes', n: 'notes' },
			{ _content: 'mail2@mail.com', n: 'email2' },
			{ _content: 'mail@mail.com', n: 'email' },
			{ _content: 'workPhone', n: 'workPhone' },
			{ _content: 'workPhone2', n: 'workPhone2' },
			{ _content: 'workUrl2', n: 'workURL2' },
			{ _content: 'workUrl', n: 'workUrl' },
			{ _content: 'workCity', n: 'workCity' },
			{ _content: 'workCountry', n: 'workCountry' },
			{ _content: 'workPostalCode', n: 'workPostalCode' },
			{ _content: 'workState', n: 'workState' },
			{ _content: 'workStreet', n: 'workStreet' },
			{ _content: 'otherCity', n: 'otherCity' },
			{ _content: 'otherCountry', n: 'otherCountry' },
			{ _content: 'otherStreet', n: 'otherStreet' },
			{ _content: 'otherPostalCode', n: 'otherPostalCode' },
			{ _content: 'otherState', n: 'otherState' },
		]);
	});
});

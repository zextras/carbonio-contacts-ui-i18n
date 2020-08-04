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
	normalizeContactsFolders, contactPhoneTypeFromString, contactUrlTypeFromString, normalizeContactAddresses, normalizeContactMails, normalizeContactPhones, normalizeContactUrls, normalizeContact
} from './contacts-db-utils';
import { ContactsFolder } from './contacts-folder';
import {ContactAddressMap, ContactAddressType, ContactPhoneType, ContactUrlType} from './contact';
describe('DB Utils', () => {
	test('Normalize Contact Folder, no children', () => {
		const f = normalizeContactsFolders({
			n: 1,
			name: 'Folder Name',
			id: '1000',
			absFolderPath: '/Folder Name',
			u: 0,
			s: 1,
			l: '1',
			view: 'contact'
		});
		expect(f.length).toBe(1);
		expect(f[0]).toBeInstanceOf(ContactsFolder);
		expect(f[0].id).toBe('1000');
		expect(f[0].itemsCount).toBe(1);
		expect(f[0].name).toBe('Folder Name');
		expect(f[0].path).toBe('/Folder Name');
		expect(f[0].unreadCount).toBe(0);
		expect(f[0].size).toBe(1);
		expect(f[0].parent).toBe('1');
	});
	test.skip('Contact Phone Type', () => {
		const g1 = contactPhoneTypeFromString('mobilePhone');
		const g2 = contactPhoneTypeFromString('workPhone1');
		const g3 = contactPhoneTypeFromString('homePhone');
		const g4 = contactPhoneTypeFromString('otherPhone');
		const g5 = contactPhoneTypeFromString(' ');
		expect(g1).toBe('mobile');
		expect(g2).toBe('work');
		expect(g3).toBe('home');
		expect(g4).toBe('other');
		expect(g5).toBe('other');
	});
	test.skip('Contact Url Type', () => {
		const h1 = contactUrlTypeFromString('workURL');
		const h2 = contactUrlTypeFromString('homeURL');
		const h3 = contactUrlTypeFromString('otherURL2');
		const h4 = contactUrlTypeFromString(' ');
		expect(h1).toBe('work');
		expect(h2).toBe('home');
		expect(h3).toBe('other');
		expect(h4).toBe('other');
	});
	test.skip('Normalize Contact Addresses', () => {
		const i = normalizeContactAddresses({
			d: 1,
			fileAsStr: 'lastName, firstName',
			id: 'id',
			l: 'l',
			rev: 1,
			_attrs: {
				homeCity: 'homeCity',
				homeCountry: 'homeCountry',
				homePostalCode: 'homePostalCode',
				homeState: 'homeState',
				homeStreet: 'homeStreet',
				otherCity: 'otherCity',
				otherCountry: 'otherCountry',
				otherPostalCode: 'otherPostalCode',
				otherState: 'otherState',
				otherStreet: 'otherStreet',
				workCity: 'workCity',
				workCountry: 'workCountry',
				workPostalCode: 'workPostalCode',
				workState: 'workState',
				workStreet: 'workStreet',
			}
		});
		expect(i.d).toBe(1);
		expect(i[0].fileAsStr).toBe('lastName, firstName');
		expect(i[0].id).toBe('id');
		expect(i[0].l).toBe('l');
		expect(i[0].rev).toBe(1);
		expect(i[0].homeCity).toBe('homeCity');
		expect(i[0].homeCountry).toBe('homeCountry');
		expect(i[0].homePostalCode).toBe('homePostalCode');
		expect(i[0].homeState).toBe('homeState');
		expect(i[0].homeStreet).toBe('homeStreet');
		expect(i[0].otherCity).toBe('otherCity');
		expect(i[0].otherCountry).toBe('otherCountry');
		expect(i[0].otherPostalCode).toBe('otherPostalCode');
		expect(i[0].otherState).toBe('otherState');
		expect(i[0].otherStreet).toBe('otherStreet');
		expect(i[0].workCity).toBe('workCity');
		expect(i[0].workCountry).toBe('workCountry');
		expect(i[0].workPostalCode).toBe('workPostalCode');
		expect(i[0].workState).toBe('workState');
		expect(i[0].workStreet).toBe('workStreet');
	});
	test.skip('Normalize Contact Mails', () => {
		const jj = normalizeContactMails({
			d: 1,
			fileAsStr: 'lastName, firstName',
			id: 'id',
			l: 'l',
			rev: 1,
			_attrs: {
				email: 'email',
				email2: 'email2',
			}
		});
		expect(jj[0].email).toBe('email');
		expect(jj[0].email2).toBe('email2');
	});
	test.skip('Normalize Contact Phones', () => {
		const kk = normalizeContactPhones({
			d: 1,
			fileAsStr: 'lastName, firstName',
			id: 'id',
			l: 'l',
			rev: 1,
			_attrs: {
				homePhone: 'homePhone',
				mobilePhone: 'mobilePhone',
				otherPhone: 'otherPhone',
				workPhone: 'workPhone',
			}
		});
		expect(kk[0].homePhone).toBe('homePhone');
		expect(kk[0].mobilePhone).toBe('mobilePhone');
		expect(kk[0].otherPhone).toBe('otherPhone');
		expect(kk[0].workPhone).toBe('workPhone');
	});
	test.skip('Normalize Contact Url', () => {
		const ll = normalizeContactUrls({
			d: 1,
			fileAsStr: 'lastName, firstName',
			id: 'id',
			l: 'l',
			rev: 1,
			_attrs: {
				homeURL: 'homeURL',
				otherURL: 'otherURL',
				workURL: 'workURL'
			}
		});
		expect(ll[0].homeURL).toBe('homeURL');
		expect(ll[0].otherURL).toBe('otherURL');
		expect(ll[0].workURL).toBe('workURL');
	});
	test('Normalize Contact', () => {
		const mm = normalizeContact({
			d: 1,
			fileAsStr: 'lastName, firstName',
			id: 'id',
			l: 'l',
			rev: 1,
			_attrs: {
				image: {
					part: 'part',
					ct: 'ct',
					s: 1,
					filename: 'filename'
				} || '',
				company: 'company' || '',
				department: 'department' || '',
				email: 'email',
				email2: 'email2',
				firstName: 'firstName' || '',
				homeCity: 'homeCity',
				homeCountry: 'homeCountry',
				homePhone: 'homePhone',
				homePostalCode: 'homePostalCode',
				homeState: 'homeState',
				homeStreet: 'homeStreet',
				homeURL: 'homeURL',
				jobTitle: 'jobTitle' || '',
				lastName: 'lastName' || '',
				middleName: 'middleName' || '',
				mobilePhone: 'mobilePhone',
				namePrefix: 'namePrefix' || '',
				nameSuffix: 'nameSuffix' || '',
				notes : 'notes' || '',
				nickname: 'nickName' || '',
				otherCity: 'otherCity',
				otherCountry: 'otherCountry',
				otherPhone: 'otherPhone',
				otherPostalCode: 'otherPostalCode',
				otherState: 'otherState',
				otherStreet: 'otherStreet',
				otherURL: 'otherURL',
				workCity: 'workCity',
				workCountry: 'workCountry',
				workPhone: 'workPhone',
				workPostalCode: 'workPostalCode',
				workState: 'workState',
				workStreet: 'workStreet',
				workURL: 'workURL'
			}
		});
		expect(mm.parent).toBe('l');
		expect(mm.id).toBe('id');
		expect(mm.address).toStrictEqual({
			homeAddress: {
				city: "homeCity",
				country: "homeCountry",
				postalCode: "homePostalCode",
				state: "homeState",
				street: "homeStreet",
				type: "home"
			},
			otherAddress: {
				city: "otherCity",
				country: "otherCountry",
				postalCode: "otherPostalCode",
				state: "otherState",
				street: "otherStreet",
				type: "other"
			},
			workAddress: {
				city: "workCity",
				country: "workCountry",
				postalCode: "workPostalCode",
				state: "workState",
				street: "workStreet",
				type: "work"
			}
		});
		expect(mm.company).toBe('company' || '');
		expect(mm.department).toBe('department' || '');
		expect(mm.email).toStrictEqual({
			email: {
				mail: "email"
			},
			email2: {
				mail: "email2"
			}
		});
		expect(mm.firstName).toBe('firstName' || '');
		expect(mm.middleName).toBe('middleName' || '');
		expect(mm.lastName).toBe('lastName' || '');
		expect(mm.nickName).toBe('nickName' || '');
		expect(mm.image).toBe('/service/home/~/?auth=co&id=id&part=part&max_width=32&max_height=32');
		expect(mm.jobTitle).toBe('jobTitle' || '');
		expect(mm.notes).toBe('notes' || '');
		expect(mm.phone).toStrictEqual({
			homePhone: {
				number: "homePhone",
				type: "home"
			},
			mobilePhone: {
				number: "mobilePhone",
				type: "mobile"
			},
			otherPhone: {
				number: "otherPhone",
				type: "other"
			},
			workPhone: {
				number: "workPhone",
				type: "work"
			}
		});
		expect(mm.nameSuffix).toBe('nameSuffix' || '');
		expect(mm.namePrefix).toBe('namePrefix' || '');
		expect(mm.URL).toStrictEqual({
			homeURL: {
				type: "home",
				url: "homeURL"
			},
			otherURL: {
				type: "other",
				url: "otherURL"
			},
			workURL: {
				type: "work",
				url: "workURL"
			}
		});
	});
});

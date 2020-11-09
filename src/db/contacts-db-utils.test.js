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
	normalizeContactsFolders, normalizeContact
} from './contact';
import { ContactsFolder } from './contacts-folder';

describe('DB Utils', () => {
	test('Normalize Contact Folder, no children', () => {
		const d = normalizeContactsFolders({
			n: 1,
			name: 'Folder Name',
			id: '1000',
			absFolderPath: '/Folder Name',
			u: 0,
			s: 1,
			l: '1',
			view: 'contact'
		});
		expect(d.length).toBe(1);
		expect(d[0]).toBeInstanceOf(ContactsFolder);
		expect(d[0].id).toBe('1000');
		expect(d[0].itemsCount).toBe(1);
		expect(d[0].name).toBe('Folder Name');
		expect(d[0].path).toBe('/Folder Name');
		expect(d[0].unreadCount).toBe(0);
		expect(d[0].size).toBe(1);
		expect(d[0].parent).toBe('1');
	});

	test('Normalize Contact Folder, one child', () => {
		const e = normalizeContactsFolders({
			n: 1,
			name: 'Folder Name',
			id: '1000',
			absFolderPath: '/Folder Name',
			u: 0,
			s: 1,
			l: '1',
			view: 'contact',
			folder: [{
				n: 1,
				name: 'Child Folder Name',
				id: '1001',
				absFolderPath: '/Child Folder Name',
				u: 0,
				s: 1,
				l: '1',
				view: 'contact'
			}]
		});
		expect(e.length).toBe(2);
		expect(e[0]).toBeInstanceOf(ContactsFolder);
		expect(e[0].id).toBe('1000');
		expect(e[0].itemsCount).toBe(1);
		expect(e[0].name).toBe('Folder Name');
		expect(e[0].path).toBe('/Folder Name');
		expect(e[0].unreadCount).toBe(0);
		expect(e[0].size).toBe(1);
		expect(e[0].parent).toBe('1');
	});

	test('Normalize Contact Folder, children', () => {
		const ff = normalizeContactsFolders({
			n: 1,
			name: 'Folder Name',
			id: '1000',
			absFolderPath: '/Folder Name',
			u: 0,
			s: 1,
			l: '1',
			view: 'cont',
			folder: [{
				n: 1,
				name: 'Child Folder Name',
				id: '1001',
				absFolderPath: '/Child Folder Name',
				u: 0,
				s: 1,
				l: '1',
				view: 'cont'
			}]
		});
		expect(ff).toStrictEqual([]);
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
				},
				company: 'company',
				department: 'department',
				email: 'email',
				email2: 'email2',
				firstName: 'firstName',
				homeCity: 'homeCity',
				homeCountry: 'homeCountry',
				homePhone: 'homePhone',
				homePostalCode: 'homePostalCode',
				homeState: 'homeState',
				homeStreet: 'homeStreet',
				homeURL: 'homeURL',
				jobTitle: 'jobTitle',
				lastName: 'lastName',
				middleName: 'middleName',
				mobilePhone: 'mobilePhone',
				namePrefix: 'namePrefix',
				nameSuffix: 'nameSuffix',
				notes: 'notes',
				nickname: 'nickName',
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
				workURL: 'workURL',
			}
		});
		expect(mm.parent).toBe('l');
		expect(mm.id).toBe('id');
		expect(mm.address).toStrictEqual({
			homeAddress: {
				city: 'homeCity',
				country: 'homeCountry',
				postalCode: 'homePostalCode',
				state: 'homeState',
				street: 'homeStreet',
				type: 'home'
			},
			otherAddress: {
				city: 'otherCity',
				country: 'otherCountry',
				postalCode: 'otherPostalCode',
				state: 'otherState',
				street: 'otherStreet',
				type: 'other'
			},
			workAddress: {
				city: 'workCity',
				country: 'workCountry',
				postalCode: 'workPostalCode',
				state: 'workState',
				street: 'workStreet',
				type: 'work'
			}
		});
		expect(mm.company).toBe('company');
		expect(mm.department).toBe('department');
		expect(mm.email).toStrictEqual({
			email: {
				mail: 'email'
			},
			email2: {
				mail: 'email2'
			}
		});
		expect(mm.firstName).toBe('firstName');
		expect(mm.middleName).toBe('middleName');
		expect(mm.lastName).toBe('lastName');
		expect(mm.nickName).toBe('nickName');
		expect(mm.image).toBe('/service/home/~/?auth=co&id=id&part=part&max_width=32&max_height=32');
		expect(mm.jobTitle).toBe('jobTitle');
		expect(mm.notes).toBe('notes');
		expect(mm.phone).toStrictEqual({
			homePhone: {
				number: 'homePhone',
				type: 'home'
			},
			mobilePhone: {
				number: 'mobilePhone',
				type: 'mobile'
			},
			otherPhone: {
				number: 'otherPhone',
				type: 'other'
			},
			workPhone: {
				number: 'workPhone',
				type: 'work'
			}
		});
		expect(mm.nameSuffix).toBe('nameSuffix');
		expect(mm.namePrefix).toBe('namePrefix');
		expect(mm.URL).toStrictEqual({
			homeURL: {
				type: 'home',
				url: 'homeURL'
			},
			otherURL: {
				type: 'other',
				url: 'otherURL'
			},
			workURL: {
				type: 'work',
				url: 'workURL'
			}
		});
	});
	test('Normalize Contact With Empty String ', () => {
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
				},
				department: '',
				email: '',
				email2: '',
				firstName: '',
				homeCity: '',
				homeCountry: '',
				homePhone: '',
				homePostalCode: '',
				homeState: '',
				homeStreet: '',
				homeURL: '',
				jobTitle: '',
				lastName: '',
				middleName: '',
				mobilePhone: '',
				namePrefix: '',
				nameSuffix: '',
				notes: '',
				nickname: '',
				otherCity: '',
				otherCountry: '',
				otherPhone: '',
				otherPostalCode: '',
				otherState: '',
				otherStreet: '',
				otherURL: '',
				workCity: '',
				workCountry: '',
				workPhone: '',
				workPostalCode: '',
				workState: '',
				workStreet: '',
				workURL: ''
			}
		});
		expect(mm.parent).toBe('l');
		expect(mm.id).toBe('id');
		expect(mm.address).toStrictEqual({
			homeAddress: {
				city: '',
				country: '',
				postalCode: '',
				state: '',
				street: '',
				type: 'home'
			},
			otherAddress: {
				city: '',
				country: '',
				postalCode: '',
				state: '',
				street: '',
				type: 'other'
			},
			workAddress: {
				city: '',
				country: '',
				postalCode: '',
				state: '',
				street: '',
				type: 'work'
			}
		});
		expect(mm.company).toBe('');
		expect(mm.department).toBe('');
		expect(mm.email).toStrictEqual({
			email: {
				mail: ''
			},
			email2: {
				mail: ''
			}
		});
		expect(mm.firstName).toBe('');
		expect(mm.middleName).toBe('');
		expect(mm.lastName).toBe('');
		expect(mm.nickName).toBe('');
		expect(mm.image).toBe('/service/home/~/?auth=co&id=id&part=part&max_width=32&max_height=32');
		expect(mm.jobTitle).toBe('');
		expect(mm.notes).toBe('');
		expect(mm.phone).toStrictEqual({
			homePhone: {
				number: '',
				type: 'home'
			},
			mobilePhone: {
				number: '',
				type: 'mobile'
			},
			otherPhone: {
				number: '',
				type: 'other'
			},
			workPhone: {
				number: '',
				type: 'work'
			}
		});
		expect(mm.nameSuffix).toBe('');
		expect(mm.namePrefix).toBe('');
		expect(mm.URL).toStrictEqual({
			homeURL: {
				type: 'home',
				url: ''
			},
			otherURL: {
				type: 'other',
				url: ''
			},
			workURL: {
				type: 'work',
				url: ''
			}
		});
	});
});

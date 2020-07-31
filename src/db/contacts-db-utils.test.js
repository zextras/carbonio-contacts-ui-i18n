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
	normalizeContactsFolders, contactPhoneTypeFromString, contactUrlTypeFromString, normalizeContactAddresses } from './contacts-db-utils';
import { ContactsFolder } from './contacts-folder';

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
	test('Contact Phone Type', () => {
		const g1 = contactPhoneTypeFromString('mobilePhone');
		const g2 = contactPhoneTypeFromString('workPhone');
		const g3 = contactPhoneTypeFromString('homePhone');
		const g4 = contactPhoneTypeFromString('otherPhone');
		expect(g1).toBe('mobile');
		expect(g2).toBe('work');
		expect(g3).toBe('home');
		expect(g4).toBe('other');
	});
	/*test('Numbered Contact Phone Type', () => {
		const g01 = contactPhoneTypeFromString(1);
		const g02 = contactPhoneTypeFromString(' ');
		expect(g01).toBe(1);
		expect(g02).toBe(' ');
	});*/
	test('Contact Url Type', () => {
		const h1 = contactUrlTypeFromString('workURL');
		const h2 = contactUrlTypeFromString('homeURL');
		const h3 = contactUrlTypeFromString('otherURL');
		expect(h1).toBe('work');
		expect(h2).toBe('home');
		expect(h3).toBe('other');
	});
	/*test('Numbered Contact Url Type', () => {
		const h01 = contactUrlTypeFromString(URL1);
		const h02 = contactUrlTypeFromString(' ');
		expect(h01).toBe(1);
		expect(h02).toBe(' ');
	});*/
});
/*test('Normalize Contact Addresses', () => {
	const i = normalizeContactAddresses({
		d: 0,
		fileAsStr: 'fileAs',
		id: '1000',
		l: '1',
		rev: 1,
		_attrs: {
			firstName: 'Pippo',
			fullName: 'Pippotamo',
			lastName: 'Rossi',
			jobTitle: 'pittore',
			middleName: 'Secco',
			nickname: 'Pippino',
			nameSuffix: 'III',
			namePrefix: 'Dr',
			mobilePhone: '0444',
			workPhone: '0444',
			otherPhone: '0444',
			department: 'Leisure',
			email: 'pp@hot.it',
			notes: ' ',
			company: 'Pippos',
			otherStreet: 'via Pinco',
			otherPostalCode: '55547',
			otherCity: 'Toronto',
			otherState: 'Alabama',
			otherCountry: 'France'
		}
	});
	expect(i[0].d).toBe(0);
	expect(i[0].fileAsStr).toBe('fileAs');
	expect(i[0].id).toBe('5000');
	expect(i[0].l).toBe('1');
	expect(i[0].rev).toBe(1);
	expect(i[0]._attrs).toBe('string');
});*/

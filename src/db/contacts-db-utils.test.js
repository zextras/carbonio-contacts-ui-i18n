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
import {ContactAddressMap, ContactAddressType} from './contact';
/*-CAMBIA TUTTI I NOMI COSI CHE KEY & VALUE COINCIDANO
	homeCity: 'homeCity',
	homeCountry: 'homeCountry',
	homePostalCode: 'homePostalCode',
	homeState: 'homeState',
	homeStreet: 'homeStreet',*/
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
	test('Contact Url Type', () => {
		const h1 = contactUrlTypeFromString('workURL');
		const h2 = contactUrlTypeFromString('homeURL');
		const h3 = contactUrlTypeFromString('otherURL2');
		const h4 = contactUrlTypeFromString(' ');
		expect(h1).toBe('work');
		expect(h2).toBe('home');
		expect(h3).toBe('other');
		expect(h4).toBe('other');
	});
});
/*-METTI A POSTO GLI UNDEFINED*/
test('Normalize Contact Addresses', () => {
	const i = normalizeContactAddresses({
		d: 1596461915000,
		fileAsStr: 'pogo, sofia',
		id: '688',
		l: '7',
		rev: 1616,
		_attrs: {
			homeCity: 'Paris',
			homeCountry: 'France',
			homePostalCode: '555874',
			homeState: 'Pariss',
			homeStreet: 'chauvignon',
			otherCity: 'Berlin',
			otherCountry: 'Deutschland',
			otherPostalCode: '55485',
			otherState: 'Berliner',
			otherStreet: 'german',
			workCity: 'vicenza',
			workCountry: 'Italia',
			workPostalCode: '33658',
			workState: 'Veneto',
			workStreet: 'via fauci 2',
		}
	});
	expect(i[0].d).toBe(1596461915000);                 //TypeError: Cannot read property 'd' of undefined
	expect(i[0].fileAsStr).toBe('Cracco, Pippo');
	expect(i[0].id).toBe('687');
	expect(i[0].l).toBe('7');
	expect(i[0].rev).toBe(1613);
	expect(i[0].homeCity).toBe('Vicenza');
	expect(i[0].homeCountry).toBe('italia');
	expect(i[0].homePostalCode).toBe('360547');
	expect(i[0].homeState).toBe('Pariss');
	expect(i[0].homeStreet).toBe('via chauvignon');
	expect(i[0].otherCity).toBe('veneto');
	expect(i[0].otherCountry).toBe('via Rossi');
	expect(i[0].otherPostalCode).toBe('veneto');
	expect(i[0].otherState).toBe('via Rossi');
	expect(i[0].otherStreet).toBe('veneto');
	expect(i[0].workCity).toBe('via Rossi');
	expect(i[0].workCountry).toBe('veneto');
	expect(i[0].workPostalCode).toBe('via Rossi');
	expect(i[0].workState).toBe('veneto');
	expect(i[0].workStreet).toBe('via Rossi');
});
test('Normalize Contact Mails', () => {
	const jj = normalizeContactMails({
		d: 1596461915000,
		fileAsStr: 'pogo, sofia',
		id: '688',
		l: '7',
		rev: 1616,
		_attrs: {
			email: 'sofi99@gmail.com',
			email2: 's.pogo@gmail.com',
		}
	});
	expect(jj[0].email).toBe('pippo@hot.com');                   //TypeError: Cannot read property 'email' of undefined
	expect(jj[0].email2).toBe('s.pogo@gmail.com');
});
test('Normalize Contact Phones', () => {
	const kk = normalizeContactPhones({
		d: 1596461915000,
		fileAsStr: 'pogo, sofia',
		id: '688',
		l: '7',
		rev: 1616,
		_attrs: {
			homePhone: '3355455',
			mobilePhone: '5556985',
			otherPhone: '3334875',
			workPhone: '3336924',
		}
	});
	expect(kk[0].homePhone).toBe('0444741852');                 //TypeError: Cannot read property 'homePhone' of undefined
	expect(kk[0].mobilePhone).toBe('3452226698');
	expect(kk[0].otherPhone).toBe('0444963258');
	expect(kk[0].workPhone).toBe('0444528693');
});
test('Normalize Contact Url', () => {
	const ll = normalizeContactUrls({
		d: 1596461915000,
		fileAsStr: 'pogo, sofia',
		id: '688',
		l: '7',
		rev: 1616,
		_attrs: {
			homeURL: 'www.sophieschoice.com',
			otherURL: 'www.crazy.com',
			workURL: 'www.sofisworl.it'
		}
	});
	expect(ll[0].homeURL).toBe('www.headhunters.it');             //TypeError: Cannot read property 'homeURL' of undefined
	expect(ll[0].otherURL).toBe('www.headhunters.it');
	expect(ll[0].workURL).toBe('www.headhunters.it');
});
/*-FAI IL RESTO DELLE FUNZIONI COME expect(mm.address).toStrictEqual*/
test('Normalize Contact', () => {
	const mm = normalizeContact({
		d: 1596461915000,
		fileAsStr: 'pogo, sofia',
		id: '688',
		l: '7',
		rev: 1616,
		_attrs: {
			image: {
				part: 'string',
				ct: 'string',
				s: 0,
				filename: 'string'
			},
			company: 'svt',
			department: 'locomotive',
			email: 'sofi99@gmail.com',
			email2: 's.pogo@gmail.com',
			firstName: 'sofia',
			homeCity: 'Paris',
			homeCountry: 'France',
			homePhone: '3355455',
			homePostalCode: '555874',
			homeState: 'Pariss',
			homeStreet: 'chauvignon',
			homeURL: 'www.sophieschoice.com',
			jobTitle: 'impiegata',
			lastName: 'pogo',
			middleName: 'lucia',
			mobilePhone: '5556985',
			namePrefix: 'dr',
			nameSuffix: 'III',
			nickName: 'sofi',
			otherCity: 'Berlin',
			otherCountry: 'Deutschland',
			otherPhone: '3334875',
			otherPostalCode: '55485',
			otherState: 'Berliner',
			otherStreet: 'german',
			otherURL: 'www.crazy.com',
			workCity: 'vicenza',
			workCountry: 'Italia',
			workPhone: '3336924',
			workPostalCode: '33658',
			workState: 'Veneto',
			workStreet: 'via fauci 2',
			workURL: 'www.sofisworl.it'
		}
	});
	expect(mm.parent).toBe('7');
	expect(mm.id).toBe('688');
	expect(mm.address).toStrictEqual({
		"homeAddress": {
			"city": "Paris",
			"country": "France",
			"postalCode": "555874",
			"state": "Pariss",
			"street": "chauvignon",
			"type": "home"
		},
		"otherAddress": {
			"city": "Berlin",
			"country": "Deutschland",
			"postalCode": "55485",
			"state": "Berliner",
			"street": "german",
			"type": "other"
		},
		"workAddress": {
			"city": "vicenza",
			"country": "Italia",
			"postalCode": "33658",
			"state": "Veneto",
			"street": "via fauci 2",
			"type": "work"
		}
	}); //DOPO
	expect(mm.company).toBe('svt');
	expect(mm.department).toBe('locomotive');
	//expect(mm.email).toBe(email); //DOPO
	expect(mm.firstName).toBe('sofia');
	expect(mm.middleName).toBe('lucia');
	expect(mm.lastName).toBe('pogo');
	expect(mm.nickName).toBe('sofi');
	expect(mm.part).toBe('string');
	expect(mm.ct).toBe('string');
	expect(mm.s).toBe(23);
	expect(mm.filename).toBe('string');
	expect(mm.jobTitle).toBe('impiegata');
	expect(mm.notes).toBe('nothing');
	expect(mm.phone).toBe(normalizeContactPhones); //DOPO
	expect(mm.nameSuffix).toBe('III');
	expect(mm.namePrefix).toBe('dr');
	expect(mm.URL).toBe(normalizeContactUrls); //DOPO

});

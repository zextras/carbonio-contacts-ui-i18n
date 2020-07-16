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
	forEach, map, pickBy, lowerFirst, parseInt, reduce, flatMap, words
} from 'lodash';
import { ISoapFolderObj } from '@zextras/zapp-shell/lib/network/ISoap';
import { ContactsFolder } from './contacts-folder';
import {
	ContactAddress,
	ContactUrlType,
	ContactPhoneType,
	ContactEmail,
	ContactPhone,
	Contact, ContactUrl
} from './contact';
import { SoapContact, SyncResponseContactFolder } from '../soap';

const MAIL_REG = /^email(\d*)$/;
const PHONE_REG = /^(.*)Phone(\d*)$/;
const URL_REG = /^(.*)URL(\d*)$/;
const ADDR_PART_REG = /^(.*)(City|Country|PostalCode|State|Street)(\d*)$/;

function normalizeFolder(soapFolderObj: ISoapFolderObj): ContactsFolder {
	return new ContactsFolder({
		itemsCount: soapFolderObj.n,
		name: soapFolderObj.name,
		// _id: soapFolderObj.uuid,
		id: soapFolderObj.id,
		path: soapFolderObj.absFolderPath,
		unreadCount: soapFolderObj.u || 0,
		size: soapFolderObj.s,
		parent: soapFolderObj.l
	});
}

export function normalizeContactsFolders(f: SyncResponseContactFolder): ContactsFolder[] {
	if (!f) return [];
	let children: ContactsFolder[] = [];
	if (f.folder) {
		forEach(f.folder, (c: SyncResponseContactFolder) => {
			const child = normalizeContactsFolders(c);
			children = [...children, ...child];
		});
	}
	if (f.id === '3' || (f.view && f.view === 'contact')) {
		return [normalizeFolder(f), ...children];
	}

	return children;
}

function contactPhoneTypeFromString(s: string): ContactPhoneType {
	if (!PHONE_REG.test(s)) return ContactPhoneType.OTHER;
	switch (s.match(PHONE_REG)![1]) {
		case 'mobile':
			return ContactPhoneType.MOBILE;
		case 'work':
			return ContactPhoneType.WORK;
		case 'home':
			return ContactPhoneType.HOME;
		default:
			return ContactPhoneType.OTHER;
	}
}

export function contactUrlTypeFromString(s: string): ContactUrlType {
	if (!URL_REG.test(s)) return ContactUrlType.OTHER;
	switch (s.match(URL_REG)![1]) {
		case 'work':
			return ContactUrlType.WORK;
		case 'home':
			return ContactUrlType.HOME;
		default:
			return ContactUrlType.OTHER;
	}
}

const getParts: (key: string) => [string, string, number] = (key) => {
	const [type, subType, index, opt]: string[] = words(key);
	return [
		type,
		lowerFirst(subType === 'Postal' ? 'postalCode' : subType),
		(parseInt(index === 'Code' ? opt : index) || 1) - 1
	];
};

function normalizeContactAddresses(c: SoapContact): ContactAddress[] {
	return flatMap(
		reduce(
			c._attrs,
			(acc, attr, key) => {
				if (ADDR_PART_REG.test(key)) {
					const [type, subType, index] = getParts(key);
					if (typeof acc[type][index] === 'undefined') {
						acc[type][index] = { [subType]: attr, type };
					}
					else {
						acc[type][index][subType] = attr;
					}
				}
				return acc;
			},
			{
				work: [],
				home: [],
				other: []
			}
		)
	);
}

function normalizeContactMails(c: SoapContact): ContactEmail[] {
	return map(
		pickBy<string>(c._attrs, (v, k) => MAIL_REG.test(k)),
		(v, k) => ({
			mail: v
		})
	);
}

function normalizeContactPhones(c: SoapContact): ContactPhone[] {
	return map(
		pickBy<string>(c._attrs, (v, k) => PHONE_REG.test(k)),
		(v, k) => ({
			number: v,
			type: contactPhoneTypeFromString(k)
		})
	);
}

function normalizeContactUrls(c: SoapContact): ContactUrl[] {
	return map(
		pickBy<string>(c._attrs, (v, k) => URL_REG.test(k)),
		(v, k) => ({
			url: v,
			type: contactUrlTypeFromString(k)
		})
	);
}

export function normalizeContact(c: SoapContact): Contact {
	return new Contact({
		parent: c.l,
		id: c.id,
		address: normalizeContactAddresses(c),
		company: c._attrs.company || '',
		department: c._attrs.department || '',
		mail: normalizeContactMails(c),
		firstName: c._attrs.firstName || '',
		middleName: c._attrs.middleName || '',
		lastName: c._attrs.lastName || '',
		image: (c._attrs.image)
			? `/service/home/~/?auth=co&id=${c.id}&part=${c._attrs.image.part}&max_width=32&max_height=32`
			: '',
		jobTitle: c._attrs.jobTitle || '',
		notes: c._attrs.notes || '',
		phone: normalizeContactPhones(c),
		nameSuffix: c._attrs.nameSuffix || '',
		namePrefix: c._attrs.namePrefix || '',
		url: normalizeContactUrls(c)
	});
}

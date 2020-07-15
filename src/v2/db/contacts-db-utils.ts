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

import { forEach, map, pickBy } from 'lodash';
import { ISoapFolderObj } from '@zextras/zapp-shell/lib/network/ISoap';
import { ContactsFolder } from './contacts-folder';
import {
	ContactAddress,
	ContactAddressType,
	ContactPhoneType,
	ContactEmail,
	ContactPhone,
	Contact
} from './contact';
import { SyncResponseContactFolder } from '../soap';

const MAIL_REG = /^email(\d*)$/;
const PHONE_REG = /^(.*)Phone(\d*)$/;

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

function normalizeContactAddresses(c: ISoapContactObj): ContactAddress[] {
	if (
		c._attrs.hasOwnProperty('otherStreet')
		|| c._attrs.hasOwnProperty('otherPostalCode')
		|| c._attrs.hasOwnProperty('otherCity')
		|| c._attrs.hasOwnProperty('otherState')
		|| c._attrs.hasOwnProperty('otherCountry')
	) {
		return [{
			type: ContactAddressType.OTHER,
			street: c._attrs.otherStreet || '',
			postalCode: c._attrs.otherPostalCode || '',
			city: c._attrs.otherCity || '',
			state: c._attrs.otherState || '',
			country: c._attrs.otherCountry || ''
		}];
	}
	else {
		return [];
	}
}

function normalizeContactMails(c: ISoapContactObj): ContactEmail[] {
	return map(
		pickBy<string>(c._attrs, (v, k) => MAIL_REG.test(k)),
		(v, k) => ({
			mail: v
		})
	);
}

function normalizeContactPhones(c: ISoapContactObj): ContactPhone[] {
	return map(
		pickBy<string>(c._attrs, (v, k) => PHONE_REG.test(k)),
		(v, k) => ({
			number: v,
			name: contactPhoneTypeFromString(k)
		})
	);
}

export function normalizeContact(c: ISoapContactObj): Contact {
	return new Contact({
		parent: c.l,
		id: c.id,
		address: normalizeContactAddresses(c),
		company: c._attrs.company || '',
		department: c._attrs.department || '',
		mail: normalizeContactMails(c),
		firstName: c._attrs.firstName || '',
		lastName: c._attrs.lastName || '',
		image: (c._attrs.image)
			? `/service/home/~/?auth=co&id=${c.id}&part=${c._attrs.image.part}&max_width=32&max_height=32`
			: '',
		jobTitle: c._attrs.jobTitle || '',
		notes: c._attrs.notes || '',
		phone: normalizeContactPhones(c),
		nameSuffix: c._attrs.nameSuffix || '',
		namePrefix: c._attrs.namePrefix || '',
	});
}

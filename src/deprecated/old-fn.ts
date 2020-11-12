/*
 * *** BEGIN LICENSE BLOCK *****
 * Copyright (C) 2011-2020 Zextras
 *
 * The contents of this file are subject to the ZeXtras EULA;
 * you may not use this file except in compliance with the EULA.
 * You may obtain a copy of the EULA at
 * http://www.zextras.com/zextras-eula.html
 * *** END LICENSE BLOCK *****
 */

import { ContactsFolder } from '../types/contact';
import {
	CreateContactRequestAttr,
	ISoapFolderObj,
	ModifyContactRequestAttr,
	SyncResponseContactFolder,
} from '../types/soap';
import { forEach, map, merge, pick, reduce, replace, split, startsWith } from 'lodash';

function normalizeChangeMailsToSoapOp(c: { [key: string]: any }) {
	return reduce(
		c,
		(acc, v, k) => {
			if (startsWith(k, 'email')) {
				const keyparts = split(k, '.');
				let value;
				if (typeof (v) !== 'string') {
					value = v.mail;
				}
				else {
					value = v;
				}
				return {
					...acc,
					[keyparts[1]]: v ? value : undefined
				};
			}
			return acc;
		},
		{}
	);
}

function normalizeChangePhonesToSoapOp(c: { [key: string]: any }) {
	return reduce(
		c,
		(acc, v, k) => {
			if (startsWith(k, 'phone')) {
				if (!v) return acc;
				const keyparts = split(k, '.');
				let value;
				if (typeof (v) !== 'string') {
					value = v.number;
				}
				else {
					value = v;
				}
				return {
					...acc,
					[keyparts[1]]: v ? value : undefined
				};
			}
			return acc;
		},
		{}
	);
}

function normalizeChangeUrlsToSoapOp(c: { [key: string]: any }) {
	return reduce(
		c,
		(acc, v, k) => {
			if (startsWith(k, 'URL')) {
				const keyparts = split(k, '.');
				let value;
				if (typeof (v) !== 'string') {
					value = v.url;
				}
				else {
					value = v;
				}
				return {
					...acc,
					[keyparts[1]]: v ? value : undefined
				};
			}
			return acc;
		},
		{}
	);
}

const capitalize = (lower: string) => lower.replace(/^\w/, (c: string) => c.toUpperCase());

function normalizeChangeAddressesToSoapOp(c: { [key: string]: any }) {
	return reduce(
		c,
		(acc, v, k) => {
			if (startsWith(k, 'address')) {
				const keyparts = k.split('.');
				if (typeof (v) === 'string') {
					return {
						...acc,
						[replace(keyparts[1], 'Address', capitalize(keyparts[2]))]: v
					};
				}
				return {
					...acc,
					...reduce(
						v,
						(acc2, v2, k2) => (k2 !== 'type'
							? ({
								...acc2,
								[replace(keyparts[1], 'Address', capitalize(String(k2)))]: v2
							})
							: acc2),
						{}
					)
				};
			}
			return acc;
		},
		{}
	);
}

function normalizeContactChangesToSoapOp(c: { [key: string]: string }): Array<CreateContactRequestAttr|ModifyContactRequestAttr> {
	const obj: any = pick(c, [
		'nameSuffix',
		'namePrefix',
		'firstName',
		'lastName',
		'middleName',
		'image',
		'jobTitle',
		'department',
		'company',
		'notes',
	]);
	if (c.nickName) obj.nickname = c.nickName;
	merge(obj, normalizeChangeMailsToSoapOp(c));
	merge(obj, normalizeChangePhonesToSoapOp(c));
	merge(obj, normalizeChangeUrlsToSoapOp(c));
	merge(obj, normalizeChangeAddressesToSoapOp(c));
	return map<any, any>(
		obj,
			(v: any, k: any) => ({ n: k, _content: v })
	);
}

function normalizeFolder(soapFolderObj: ISoapFolderObj): ContactsFolder {
	return {
		itemsCount: soapFolderObj.n,
		name: soapFolderObj.name,
		id: soapFolderObj.id,
		path: soapFolderObj.absFolderPath,
		unreadCount: soapFolderObj.u || 0,
		size: soapFolderObj.s,
		parent: soapFolderObj.l
	};
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

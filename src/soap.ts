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
	map, merge, pick, reduce, startsWith, split, replace,
} from 'lodash';
import {
	Contact, ContactAddress, ContactAddressMap,
	ContactEmailMap, ContactPhoneMap,
	ContactUrlMap
} from './db/contact';

export type IFolderView =
	'search folder'
	| 'tag'
	| 'conversation'
	| 'message'
	| 'contact'
	| 'document'
	| 'appointment'
	| 'virtual conversation'
	| 'remote folder'
	| 'wiki'
	| 'task'
	| 'chat';

export type ISoapFolderObj = {
	absFolderPath: string;
	activesyncdisabled: boolean;
	deletable: boolean;
	folder?: Array<ISoapFolderObj>;
	i4ms: number;
	i4next: number;
	id: string;
	/** Parent ID */ l: string;
	luuid: string;
	ms: number;
	/** Count of non-folder items */ n: number;
	name: string;
	rev: number;
	/** Size */ s: number;
	/** Count of unread messages */ u?: number;
	uuid: string;
	view: IFolderView;
	webOfflineSyncDays: number;
}

export type ISoapSyncFolderObj = {
	absFolderPath: string;
	acl: {};
	activesyncdisabled: boolean;
	color: number;
	deletable: boolean;
	f: string;
	i4ms: number;
	i4next: number;
	id: string;
	l: string;
	luuid: string;
	md: number;
	mdver: number;
	meta: Array<{}>;
	ms: number;
	n: number;
	name: string;
	retentionPolicy: Array<{}>;
	rev: number;
	s: number;
	u: number;
	url: string;
	uuid: string;
	view: IFolderView;
	webOfflineSyncDays: number;
};

export type SyncResponseContactFolder = ISoapSyncFolderObj & {
	cn: Array<{
		ids: string; // Comma-separated values
	}>;
	folder: Array<SyncResponseContactFolder>;
};

export type SyncResponseContact = {
	d: number;
	id: string;
	l: string;
	md: number;
	ms: number;
	rev: number;
};

type SyncResponseDeletedMapRow = {
	ids: string;
};

export type SyncResponseDeletedMap = SyncResponseDeletedMapRow & {
	folder?: Array<SyncResponseDeletedMapRow>;
	cn?: Array<SyncResponseDeletedMapRow>;
};

export type SyncResponse = {
	token: string;
	md: number;
	folder?: Array<SyncResponseContactFolder>;
	cn?: Array<SyncResponseContact>;
	deleted?: Array<SyncResponseDeletedMap>;
};

export type FolderActionRequest = {
	action: FolderActionRename |FolderActionMove | FolderActionDelete;
};

type FolderActionRename = {
	op: 'rename';
	id: string;
	name: string;
};

type FolderActionMove = {
	op: 'move';
	id: string;
	l: string;
};

type FolderActionDelete = {
	op: 'delete';
	id: string;
};

export type CreateFolderRequest = {};

export type CreateFolderResponse = {
	folder: Array<SyncResponseContactFolder>;
};

export type CreateContactRequestAttr =
	{ n: 'firstName'; _content: string }
	| { n: 'lastName'; _content: string }
	| { n: 'fullName'; _content: string }
	| { n: 'nameSuffix'; _content: string }
	| { n: 'image'; aid?: string }
	| { n: 'jobTitle'; _content: string }
	| { n: 'department'; _content: string }
	| { n: 'company'; _content: string }
	| { n: 'notes'; _content: string }
	| { n: 'email'; _content: string };
export type CreateContactRequest = {
	cn: {
		m: unknown[];
		l: string;
		a: Array<CreateContactRequestAttr>;
	};
};

export type ModifyContactRequestAttr = CreateContactRequestAttr;

export type ModifyContactRequest = {
	force: '0'|'1'; // Default to '1'
	replace: '0'|'1'; // Default to '0'
	cn: {
		a: Array<ModifyContactRequestAttr>;
		id: string;
		m: unknown[];
	};
};

export type ContactActionRequest = {
	action: ContactActionMove | ContactActionDelete;
};

type ContactActionMove = {
	op: 'move';
	id: string;
	l: string;
};

type ContactActionDelete = {
	op: 'delete';
	id: string;
};

export type CreateContactResponse = {
	cn: Array<SoapContact>;
};

export type BatchedRequest = {
	_jsns: 'urn:zimbraMail';
	requestId: string;
};

export type BatchedResponse = {
	requestId: string;
};

export type BatchRequest = {
	_jsns: 'urn:zimbra';
	onerror: 'continue';
	CreateFolderRequest?: Array<BatchedRequest & CreateFolderRequest>;
	FolderActionRequest?: Array<BatchedRequest & FolderActionRequest>;
	CreateContactRequest?: Array<BatchedRequest & CreateContactRequest>;
	ModifyContactRequest?: Array<BatchedRequest & ModifyContactRequest>;
	ContactActionRequest?: Array<BatchedRequest & ContactActionRequest>;
};

export type GetContactRequest = {
	_jsns: 'urn:zimbraMail';
	cn: Array<{
		id: string;
	}>;
};

export type GetContactsResponse = {
	cn: Array<SoapContact>;
};

export type SoapContact = {
	d: number;
	fileAsStr: string;
	id: string;
	l: string;
	rev: number;
	_attrs: {
		firstName?: string;
		fullName?: string;
		lastName?: string;
		jobTitle?: string;
		middleName?: string;
		nickname?: string;
		nameSuffix?: string;
		namePrefix?: string;
		mobilePhone?: string;
		workPhone?: string;
		otherPhone?: string;
		department?: string;
		email?: string;
		notes?: string;
		company?: string;
		otherStreet?: string;
		otherPostalCode?: string;
		otherCity?: string;
		otherState?: string;
		otherCountry?: string;
		image?: {
			part: string;
			ct: string;
			s: number;
			filename: string;
		};
	};
};

export function normalizeContactMailsToSoapOp(mails: ContactEmailMap): any {
	return reduce(
		mails,
		(c, v, k) => ({
			...c,
			[k]: v.mail
		}),
		{}
	);
}

export function normalizeContactPhonesToSoapOp(phones: ContactPhoneMap): any {
	return reduce(
		phones,
		(acc, v, k) => (k === 'type' ? acc : ({
			...acc,
			[k]: v.number
		})),
		{}
	);
}

export function normalizeContactUrlsToSoapOp(urls: ContactUrlMap): any {
	return reduce(
		urls,
		(acc, v, k) => (k === 'type' ? acc : ({
			...acc,
			[k]: v.url
		})),
		{}
	);
}

const capitalize = (lower: string) => lower.replace(/^\w/, (c: string) => c.toUpperCase());

const getKey: (k: string, v: ContactAddress, field: string) => string = (k, v, field) => {
	const index = k.match(/(\d+)$/);
	return `${
		v.type
	}${
		capitalize(field)
	}${
		(index && index.length > 0) ? parseInt(index[0], 10) : ''
	}`;
};

export function normalizeContactAddressesToSoapOp(addresses: ContactAddressMap): any {
	return reduce(
		addresses,
		(acc, v, k) => ({
			...acc,
			...reduce(
				v,
				(acc2, v2, k2) => (k2 === 'type' ? acc2 : ({
					...acc2,
					[getKey(k, v, k2)]: v2
				})),
				{}
			)
		}),
		{}
	);
}

export function normalizeContactAttrsToSoapOp(c: Contact): Array<CreateContactRequestAttr|ModifyContactRequestAttr> {
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
	if (c.email) merge(obj, normalizeContactMailsToSoapOp(c.email));
	if (c.phone) merge(obj, normalizeContactPhonesToSoapOp(c.phone));
	if (c.address) merge(obj, normalizeContactAddressesToSoapOp(c.address));
	if (c.URL) merge(obj, normalizeContactUrlsToSoapOp(c.URL));
	return map<any, any>(
		obj,
		(v: any, k: any) => ({ n: k, _content: v })
	);
}


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
				else{
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
				else{
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
				else {
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
			}
			return acc;
		},
		{}
	);
}

export function normalizeContactChangesToSoapOp(c: { [key: string]: string }): Array<CreateContactRequestAttr|ModifyContactRequestAttr> {
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

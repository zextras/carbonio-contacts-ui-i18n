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
	map, merge, omit, pick, reduce
} from 'lodash';
import { ISoapSyncDeletedMap, ISoapSyncFolderObj } from '@zextras/zapp-shell/lib/network/ISoap';
import {
	Contact, ContactAddress, ContactEmail, ContactPhone
} from './db/contact';

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
	};
};

export function normalizeContactMailsToSoapOp(mails: ContactEmail[]): any {
	return reduce(
		mails,
		(c, v, k) => ({
			...c,
			...{
				[`email${k > 0 ? k : ''}`]: v.mail
			}
		}),
		{}
	);
}

export function normalizeContactPhonesToSoapOp(phones: ContactPhone[]): any {
	return reduce(
		reduce(
			phones,
			(a: {[k: string]: any[]}, v, k) => {
				if (a[v.name]) return { ...a, ...{ [v.name]: [...a[v.name], v.number] } };
				return { ...a, ...{ [v.name]: [v.number] } };
			},
			{}
		),
		(a, v, k) => reduce(
			v,
			(a1, v1, k1) => ({ ...a1, [`${k}Phone${k1 > 0 ? k1 : ''}`]: v1 }),
			a
		),
		{}
	);
}

const capitalize = (lower: string) => lower.replace(/^\w/, (c: string) => c.toUpperCase());

export function normalizeContactAddressesToSoapOp(addresses: ContactAddress[]): any {
	return reduce(
		reduce(
			addresses,
			(a: {[k: string]: any[]}, v, k) => {
				if (a[v.type]) return { ...a, ...{ [v.type]: [...a[v.type], v] } };
				return { ...a, ...{ [v.type]: [v] } };
			},
			{}
		),
		(a, v, k) => reduce(
			v,
			(a1, v1, k1: number) => reduce(
				omit<any>(v1, ['type']),
				(a2, v2, k2) => ({ ...a2, [`${k}${capitalize(k2)}${k1 > 0 ? k1 : ''}`]: v2 }),
				a1
			),
			a
		),
		{}
	);
}

export function normalizeContactAttrsToSoapOp(c: Contact): Array<CreateContactRequestAttr|ModifyContactRequestAttr> {
	const obj: any = pick(c, [
		'nameSuffix',
		'firstName',
		'lastName',
		'image',
		'jobTitle',
		'department',
		'company',
		'notes',
	]);
	if (c.mail) merge(obj, normalizeContactMailsToSoapOp(c.mail));
	if (c.phone) merge(obj, normalizeContactPhonesToSoapOp(c.phone));
	if (c.address) merge(obj, normalizeContactAddressesToSoapOp(c.address));
	return map<any, any>(
		obj,
		(v: any, k: any) => ({ n: k, _content: v })
	);
}

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
	map,
	pick,
	merge,
	reduce,
	omit
} from 'lodash';
import { IFolderSchmV1 } from '@zextras/zapp-shell/lib/sync/IFolderSchm';
import { ISoapSyncDeletedMap, ISoapSyncFolderObj, ISoapSyncResponse } from '@zextras/zapp-shell/lib/network/ISoap';
import {
	ContactAddress,
	ContactData,
	ContactEmail,
	ContactPhone
} from '../idb/IContactsIdb';

export type ISoapSyncContactFolderObj = ISoapSyncFolderObj & {
	cn: Array<{ids: string}>;
	folder: Array<ISoapSyncContactFolderObj>;
};

export type ISoapSyncContactResponse = ISoapSyncResponse<ISoapSyncDeletedMap, ISoapSyncContactFolderObj> & {
	cn: Array<ISoapContactObj>;
};

type SoapContactObjAttrs = {
	jobTitle?: string;
	firstName?: string;
	lastName?: string;
	nameSuffix?: string;
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
	fullName?: string;
};

export type ISoapContactObj = {
	id: string;
	l: string;
	rev: number;
	_attrs: SoapContactObjAttrs;
};

type ContactCreationAttr = {
	n: keyof SoapContactObjAttrs;
	_content: string;
};

export type CreateContactOpReq = {
	cn: {
		l: string;
		a: ContactCreationAttr[];
	};
};

export type CreateContactOpResp = {
	CreateContactResponse: {
		cn: Array<{
			id: string;
		}>;
	};
};

export type ModifyContactOpReq = {
	replace: 0 | 1;
	force: 1;
	cn: {
		id: string;
		a: ContactCreationAttr[];
		m: Array<unknown>;
	};
};

export type ModifyContactOpResp = {
	ModifyContactResponse: {
		cn: Array<{
			id: string;
		}>;
	};
};

export type ContactActionOpReq = {
	action: {
		op: 'move' | 'delete';
	};
};

export type MoveContactActionOpReq = {
	action: {
		op: 'move';
		l: string;
		id: string;
	};
};

export type MoveContactActionOpResp = {
	ContactActionResponse: {
		action: {
			id: string;
		};
	};
};

export type DeleteContactActionOpReq = {
	action: {
		op: 'delete';
		id: string;
	};
};

export type DeleteContactActionOpResp = {
	ContactActionResponse: {
		action: {
			op: 'delete';
			id: string;
		};
	};
};

export type CreateContactFolderOpReq = {
	folder: {
		view: 'contact';
		l: string;
		name: string;
	};
};

export type MoveContactFolderActionOpReq = {
	action: {
		l: string;
		id: string;
		op: 'move';
	};
};

export type RenameContactFolderActionOpReq = {
	action: {
		name: string;
		id: string;
		op: 'rename';
	};
};

export type DeleteContactFolderActionOpReq = {
	action: {
		id: string;
		op: 'delete';
	};
};

export type EmptyContactFolderActionOpReq = {
	action: {
		id: string;
		op: 'empty';
		recursive: true;
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

export function normalizeContactAttrsToSoapOp(c: ContactData): ContactCreationAttr[] {
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

export function calculateAbsPath(
	id: string,
	name: string,
	fMap: {[id: string]: IFolderSchmV1},
	parentId?: string
): string {
	let mName = name;
	let mParentId = parentId;
	if (fMap[id]) {
		mName = fMap[id].name;
		mParentId = fMap[id].parent;
	}

	if (!mParentId || mParentId === '1' || !fMap[mParentId]) {
		return `/${mName}`;
	}

	return `${calculateAbsPath(mParentId, fMap[mParentId].name, fMap, fMap[mParentId].parent)}/${mName}`;
}

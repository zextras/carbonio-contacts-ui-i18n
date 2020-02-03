import {
	map,
	pick,
	merge,
	reduce,
	omit
} from 'lodash';
import {
	ContactAddress,
	ContactData,
	ContactEmail,
	ContactPhone
} from './idb/IContactsIdb';

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

export type ModifyContactOpReq = {
	replace: 0;
	force: 1;
	cn: {
		id: string;
		a: ContactCreationAttr[];
		m: Array<unknown>;
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

export type DeleteContactActionOpReq = {
	action: {
		op: 'delete';
		id: string;
	};
};

export function normalizeContactMailsToSoapOp(mails: ContactEmail[]): any {
	return reduce(
		mails,
		(c, v, k) => ({
			...c,
			...{
				[`mail${k > 0 ? k : ''}`]: v.mail
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
			(a1, v1, k1) => ({ ...a1, [`${k}Phone${k1 > 0 ? k1 : ''}`]: v1}),
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
		(a, v, k) => {
			return reduce(
				v,
				(a1, v1, k1: number) => reduce(
					omit<any>(v1, ['type']),
					(a2, v2, k2) => {
						return { ...a2, [`${k}${capitalize(k2)}${k1 > 0 ? k1 : ''}`]: v2 };
					},
					a1
				),
				a
			);
		},
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

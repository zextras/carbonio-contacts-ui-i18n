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
// eslint-disable-next-line no-shadow
export enum ContactPhoneType {
	MOBILE = 'mobile',
	WORK = 'work',
	HOME = 'home',
	OTHER = 'other'
}

// eslint-disable-next-line no-shadow
export enum ContactAddressType {
	OTHER = 'other',
	WORK = 'work',
	HOME = 'home'
}

// eslint-disable-next-line no-shadow
export enum ContactUrlType {
	OTHER = 'other',
	WORK = 'work',
	HOME = 'home'
}

export type ContactAddress = {
	type: ContactAddressType;
	street?: string;
	city?: string;
	postalCode?: string;
	country?: string;
	state?: string;
}

export type ContactEmail = {
	mail: string;
};

export type ContactPhone = {
	number: string;
	type: ContactPhoneType;
};

export type ContactUrl = {
	url: string;
	type: ContactUrlType;
}

export type ContactAddressMap = { [key: string]: ContactAddress };
export type ContactEmailMap = { [key: string]: ContactEmail };
export type ContactPhoneMap = { [key: string]: ContactPhone };
export type ContactUrlMap = { [key: string]: ContactUrl };

export type ContactsFolder = {
	/** Internal UUID */ _id?: string;
	/** Zimbra ID */ id?: string;
	itemsCount: number;
	name: string;
	path: string;
	unreadCount: number;
	size: number;
	parent: string;
}

export type Contact = {
	/* Internal UUID */ _id?: string; // todo: delete this param?
	/* Zimbra ID */ id?: string;
	firstName: string;
	middleName: string;
	lastName: string;
	nickName: string;
	parent: string;
	address: ContactAddressMap;
	company: string;
	department: string;
	email: ContactEmailMap;
	image: string;
	jobTitle: string;
	notes: string;
	phone: ContactPhoneMap;
	nameSuffix: string;
	namePrefix: string;
	URL: ContactUrlMap;
}

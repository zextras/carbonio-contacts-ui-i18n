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

import { DBSchema } from 'idb';
import { IFolderSchmV1 } from '@zextras/zapp-shell/lib/sync/IFolderSchm';
import { ContactaddressType, ContactPhoneType } from './ContactEnums';

export interface IContactsIdb extends DBSchema {
	contacts: {
		key: string;
		value: Contact;
		indexes: {
			parent: string;
		};
	};
	folders: {
		key: string;
		value: IFolderSchmV1;
		indexes: {
			parent: string;
			path: string;
		};
	};
}

export type ContactData = {
	_revision?: number;
	id?: string;
	parent: string;
	nameSuffix: string;
	firstName: string;
	lastName: string;
	image: string;
	jobTitle: string;
	department: string;
	company: string;
	address: ContactAddress[];
	notes: string;
	mail: ContactEmail[];
	phone: ContactPhone[];
};

export type Contact = ContactData & {
	_revision: number;
	id: string;
};

export type ContactAddress = {
	type: ContactaddressType;
	street: string;
	city: string;
	postalCode: string;
	country: string;
	state: string;
}

export type ContactEmail = {
	mail: string;
};

export type ContactPhone = {
	number: string;
	name: ContactPhoneType;
};

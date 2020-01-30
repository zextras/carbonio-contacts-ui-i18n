import { DBSchema } from 'idb';
import { ContactaddressType, ContactPhoneType } from './ContactEnums';
import { IFolderSchmV1 } from '@zextras/zapp-shell/lib/sync/IFolderSchm';

export interface IContactsIdb extends DBSchema {
	contacts: {
		key: string;
		value: Contact;
		indexes: {
			parent: string;
		}
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

export type Contact = {
	_revision: number;
	parent: string;
	id: string;
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

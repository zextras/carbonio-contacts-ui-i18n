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

import Dexie from 'dexie';
import { ContactsFolder } from './contacts-folder';
import { Contact } from './contact';

export class ContactsDb extends Dexie {
	contacts: Dexie.Table<Contact, string>; // number = type of the primkey

	folders: Dexie.Table<ContactsFolder, string>; // number = type of the primkey

	constructor() {
		super('contacts');
		this.version(1).stores({
			contacts: '$$_id, id, *mail, parent',
			folders: '$$_id, id, parent',
		});
		this.contacts = this.table('contacts');
		this.contacts.mapToClass(Contact);
		this.folders = this.table('folders');
		this.folders.mapToClass(ContactsFolder);
	}

	public getFolderChildren(folder: ContactsFolder): Promise<ContactsFolder[]> {
		return this.folders.where({ parent: folder.id }).sortBy('name');
	}
}

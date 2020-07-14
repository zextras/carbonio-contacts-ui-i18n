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
	contacts: Dexie.Table<Contact, string>; // string = type of the primary key

	folders: Dexie.Table<ContactsFolder, string>; // string = type of the primary key

	// string = type of the primary key
	remappedIds: Dexie.Table<{ _?: string; _id: string; id: string }, string>;

	constructor() {
		super('contacts');
		this.version(1).stores({
			contacts: '$$_id, &id, *mail, parent',
			folders: '$$_id, &id, parent',
			remappedIds: '$$_, &_id, &id'
		});
		this.on('changes', (changes) => {
			changes.forEach((change) => {
				switch (change.type) {
					case 1: // CREATED
						// console.log('An object was created: ' + JSON.stringify(change.obj));
						break;
					case 2: // UPDATED
						// console.log(
						// 	'An object with key ' + change.key
						// 	+ ' was updated with modifications: ' + JSON.stringify(change.mods)
						// );
						break;
					case 3: // DELETED
						if (change.table !== 'contacts' /* && change.table !== 'folders' */) break;
						if (change.oldObj.id) {
							this.remappedIds.put({
								_id: change.oldObj._id,
								id: change.oldObj.id
							}).then(() => null);
						}
						break;
					default:
				}
			});
		});
		this.contacts = this.table('contacts');
		this.contacts.mapToClass(Contact);
		this.folders = this.table('folders');
		this.folders.mapToClass(ContactsFolder);
		this.remappedIds = this.table('remappedIds');
	}

	public getFolderChildren(folder: ContactsFolder): Promise<ContactsFolder[]> {
		return this.folders.where({ parent: folder.id }).sortBy('name');
	}
}

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

import Dexie, { PromiseExtended } from 'dexie';
import { db } from '@zextras/zapp-shell';
import { ContactsFolder } from './contacts-folder';
import { Contact } from './contact';
import { report } from '../commons/report-exception';

export type DeletionData = {
	_id: string;
	id: string;
	table: 'contacts'|'folders';
	rowId?: string;
};

export class ContactsDb extends db.Database {
	contacts: Dexie.Table<Contact, string>; // string = type of the primary key

	folders: Dexie.Table<ContactsFolder, string>; // string = type of the primary key

	deletions: Dexie.Table<DeletionData, string>;

	constructor() {
		super('contacts');
		this.version(1).stores({
			contacts: '$$_id, id, *email, parent',
			folders: '$$_id, id, parent',
			deletions: '$$rowId, _id, id'
		});
		this.contacts = this.table('contacts');
		this.contacts.mapToClass(Contact);
		this.folders = this.table('folders');
		this.folders.mapToClass(ContactsFolder);
		this.deletions = this.table('deletions');
	}

	public open(): PromiseExtended<ContactsDb> {
		return super.open().then((_db) => _db as unknown as ContactsDb).catch(report);
	}

	public getFolderChildren(folder: ContactsFolder): Promise<ContactsFolder[]> {
		// TODO: For locally created folders we should resolve the internal id, we should ALWAYS to that.
		if (!folder.id) return Promise.resolve([]);
		return this.folders.where({ parent: folder.id }).sortBy('name').catch(report);
	}

	public deleteContact(c: Contact): Promise<void> {
		if (!c._id) return Promise.reject(new Error('Contact must have id'));
		return this.folders.get(c._id).then((_c) => {
			if (_c) {
				return this.deletions.add({ _id: _c._id, id: _c.id, table: 'contacts' } as DeletionData)
					.then(() => this.contacts.delete(_c._id as string).then(() => undefined))
					.catch(report);
			}
			return undefined;
		});
	}

	public deleteFolder(f: ContactsFolder): Promise<void> {
		if (!f._id) return Promise.reject(new Error('Folder must have id'));
		return this.folders.get(f._id).then((_f) => {
			if (_f) {
				console.log({ _id: _f._id, id: _f.id, table: 'folders' });

				return this.deletions.add({
					rowId: this.createUUID(), _id: _f._id, id: _f.id, table: 'folders'
				} as DeletionData)
					.then(() => this.folders.delete(_f._id as string).then(() => undefined))
					.catch(report);
			}
			return undefined;
		});
	}
}

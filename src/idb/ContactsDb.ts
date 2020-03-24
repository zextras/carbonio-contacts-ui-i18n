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
import 'dexie-observable';
import 'dexie-syncable';
import { ISyncProtocol } from 'dexie-syncable/api';
import { Subject } from 'rxjs';

interface IContact {
	id?: string;
	_id: string;
	firstName: string;
	lastName: string;
	email: string[];
	parent: string;
}

interface IFolder {
	id?: string;
	_id: string;
	parent: string;
	name: string;
	path: string;
}

export class Contact implements IContact {
	id?: string;

	_id: string;

	email: string[];

	firstName: string;

	lastName: string;

	parent: string;
}

export class Folder implements IFolder {
	id?: string;

	_id: string;

	parent: string;

	name: string;

	path: string;
}

export class ContactsDb extends Dexie {
	// Declare implicit table properties.
	// (just to inform Typescript. Instanciated by Dexie in stores() method)
	contacts: Dexie.Table<IContact, string>; // number = type of the primkey

	folders: Dexie.Table<IFolder, string>; // number = type of the primkey
	// ...other tables goes here...

	constructor() {
		super('DexieContacts');
		this.version(1).stores({
			contacts: '$$_id, id, email, parent',
			folders: '$$_id, id, name, path, parent',
		});
		// The following line is needed if your typescript
		// is compiled using babel instead of tsc:
		this.contacts = this.table('contacts');
		this.contacts.mapToClass(Contact);
		this.folders = this.table('folders');
		this.folders.mapToClass(Folder);
	}

	public registerSyncProtocol(name: string, protocol: ISyncProtocol): void {
		Dexie.Syncable.registerSyncProtocol(name, protocol);
	}

	public observe(comparator: () => Promise<any>): Subject<any> {
		const subject = new Subject();
		comparator().then((r) => subject.next(r));
		this.on('changes', (changes) => {
			comparator().then((r) => subject.next(r));
		});
		return subject;
	}
}

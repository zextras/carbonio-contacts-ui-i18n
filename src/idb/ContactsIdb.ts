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

import { IDBPDatabase, IDBPTransaction } from 'idb';
import { IContactsIdb } from './IContactsIdb';

export const schemaVersion = 1;

function createDb(database: IDBPDatabase<IContactsIdb>): void {
	const foldersStore = database.createObjectStore<'folders'>('folders', {
		keyPath: 'id'
	});
	foldersStore.createIndex('parent', 'parent');
	foldersStore.createIndex('path', 'path');
	const contactsStore = database.createObjectStore<'contacts'>('contacts', {
		keyPath: 'id'
	});
	contactsStore.createIndex('parent', 'parent');
}

export function upgradeFn(database: IDBPDatabase<IContactsIdb>, oldVersion: number, newVersion: number | null, transaction: IDBPTransaction<IContactsIdb>): void {
	if (oldVersion < 1) {
		createDb(database);
	} else {
		switch (oldVersion) {
			case 1: {
				// Upgrade from version 1
			}
		}
	}
}

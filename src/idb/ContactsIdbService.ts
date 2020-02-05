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

import { IDBPDatabase, openDB } from 'idb';
import { IFolderSchmV1 } from '@zextras/zapp-shell/lib/sync/IFolderSchm';
import { map, reduce } from 'lodash';
import { Contact, IContactsIdb } from './IContactsIdb';
import { schemaVersion, upgradeFn } from './ContactsIdb';
import { IContactsIdbService } from './IContactsIdbService';

/* eslint-disable class-methods-use-this */

export default class ContactsIdbService implements IContactsIdbService {
	private static _IDB_NAME = 'com_zextras_zapp_contacts';

	private static _openDb(): Promise<IDBPDatabase<IContactsIdb>> {
		return openDB<IContactsIdb>(
			ContactsIdbService._IDB_NAME,
			schemaVersion,
			{
				upgrade: upgradeFn
			}
		);
	}

	public getContact(id: string): Promise<Contact|undefined> {
		return ContactsIdbService._openDb()
			.then((idb) => idb.get<'contacts'>('contacts', id));
	}

	public getAllContacts(): Promise<{[id: string]: Contact}> {
		return new Promise(((resolve, reject) => {
			ContactsIdbService._openDb()
				.then(
					(idb) => idb.getAll<'contacts'>('contacts')
						.then((contacts) => reduce<Contact, {[id: string]: Contact}>(
							contacts,
							(r, v, k) => {
								// eslint-disable-next-line no-param-reassign
								r[v.id] = v;
								return r;
							},
							{}
						))
				)
				.then((folders) => resolve(folders))
				.catch((e) => reject(e));
		}));
	}

	public saveContactData(c: Contact): Promise<Contact> {
		return new Promise(((resolve, reject) => {
			ContactsIdbService._openDb()
				.then((idb) => idb.put<'contacts'>('contacts', c))
				.then((_) => resolve(c))
				.catch((e) => reject(e));
		}));
	}

	public saveContactsData(c: Contact[]): Promise<string[]> {
		if (c.length < 1) return Promise.resolve([]);
		const cCopy = [...c];
		const contact = cCopy.shift();
		return this.saveContactData(contact!)
			.then((c1) => new Promise((resolve, reject) => {
				if (cCopy.length === 0) resolve([c1.id]);
				else {
					this.saveContactsData(cCopy)
						.then((r) => resolve([c1.id].concat(r)))
						.catch((e) => reject(e));
				}
			}));
	}

	public deleteContacts(ids: string[]): Promise<string[]> {
		if (ids.length < 1) return Promise.resolve([]);
		const cCopy = [...ids];
		const id = cCopy.shift();
		return ContactsIdbService._openDb()
			.then((idb) => idb.delete<'contacts'>('contacts', id!))
			.then((_) => new Promise((resolve, reject) => {
				if (cCopy.length === 0) resolve([id!]);
				else {
					this.deleteContacts(cCopy)
						.then((r) => resolve([id!].concat(r)))
						.catch((e) => reject(e));
				}
			}));
	}

	public getFolder(id: string): Promise<IFolderSchmV1|void> {
		return ContactsIdbService._openDb()
			.then((idb) => idb.get<'folders'>('folders', id));
	}

	public getAllFolders(): Promise<{[id: string]: IFolderSchmV1}> {
		return new Promise(((resolve, reject) => {
			ContactsIdbService._openDb()
				.then(
					(idb) => idb.getAll<'folders'>('folders')
						.then((folders) => reduce<IFolderSchmV1, {[id: string]: IFolderSchmV1}>(
							folders,
							(r, v, k) => {
								// eslint-disable-next-line no-param-reassign
								r[v.id] = v;
								return r;
							},
							{}
						))
				)
				.then((folders) => resolve(folders))
				.catch((e) => reject(e));
		}));
	}

	public saveFolderData(f: IFolderSchmV1): Promise<IFolderSchmV1> {
		return new Promise(((resolve, reject) => {
			ContactsIdbService._openDb()
				.then((idb) => idb.put<'folders'>('folders', f))
				.then((_) => resolve(f))
				.catch((e) => reject(e));
		}));
	}

	public deleteFolders(ids: string[]): Promise<string[]> {
		if (ids.length < 1) return Promise.resolve([]);
		const cCopy = [...ids];
		const id = cCopy.shift();
		return ContactsIdbService._openDb()
			.then((idb) => idb.delete<'folders'>('folders', id!))
			.then((_) => new Promise((resolve, reject) => {
				// TODO: Remove the children
				if (cCopy.length === 0) resolve([id!]);
				else {
					this.deleteFolders(cCopy)
						.then((r) => resolve([id!].concat(r)))
						.catch((e) => reject(e));
				}
			}));
	}

	public moveFolder(id: string, parent: string): Promise<void> {
		return new Promise(((resolve, reject) => {
			ContactsIdbService._openDb()
				.then((idb) => new Promise((resolve1, reject1) => {
					idb.get<'folders'>('folders', id)
						.then((f) => {
							if (!f) resolve1();
							idb.put<'folders'>('folders', { ...f!, parent })
								// TODO: Update the path and the children paths
								.then(
									() => idb.getAllFromIndex<'folders', 'parent'>(
										'folders',
										'parent',
										id
									)
										.then((folders) => Promise.all(
											map(
												folders,
												(f1) => idb.put<'folders'>(
													'folders',
													{ ...f1 }
												)
											)
										))
										.then(() => resolve1())
								)
								.catch((e) => reject1(e));
						});
				}))
				.then(() => resolve())
				.catch((e) => reject(e));
		}));
	}

	public renameFolder(id: string, name: string): Promise<void> {
		return new Promise(((resolve, reject) => {
			ContactsIdbService._openDb()
				.then((idb) => new Promise((resolve1, reject1) => {
					idb.get<'folders'>('folders', id)
						.then((f) => {
							if (!f) resolve1();
							idb.put<'folders'>('folders', { ...f!, name })
								// TODO: Update the path and the children paths
								.then(() => resolve1())
								.catch((e) => reject1(e));
						});
				}))
				.then(() => resolve())
				.catch((e) => reject(e));
		}));
	}
}

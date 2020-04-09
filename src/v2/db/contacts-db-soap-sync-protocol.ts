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

import {
	IPersistedContext,
	ISyncProtocol,
	PollContinuation,
	ReactiveContinuation
} from 'dexie-syncable/api';
import { ICreateChange, IDatabaseChange } from 'dexie-observable/api';
import {
	forEach,
	map,
	reduce,
	difference,
	includes,
	find
} from 'lodash';
import { normalizeContact, normalizeFolder } from './contacts-db-utils';
import { ContactsFolder } from './contacts-folder';
import { ISoapSyncContactFolderObj, ISoapSyncContactResponse } from '../soap';
import { ContactsDb } from './contacts-db';
import { Contact } from './contact';

const POLL_INTERVAL = 20000;

type SyncChainContainer = {
	newOrUpdatedFolders: ContactsFolder[];
	newOrUpdatesContactIds: string[];
	deletedFolders: string[];
	deletedContacts: string[];
	syncChanges: IDatabaseChange[];
	syncToken: string;
	isInitialSync: boolean;
};

export class ContactsDbSoapSyncProtocol implements ISyncProtocol {
	private static _normalizeContactsFolders(f: ISoapSyncContactFolderObj): [ContactsFolder[], string[]] {
		if (!f) return [[], []];
		let children: ContactsFolder[] = [];
		let cnIds: string[] = [];
		if (f.folder) {
			forEach(f.folder, (c: ISoapSyncContactFolderObj) => {
				const [child, childCns] = ContactsDbSoapSyncProtocol._normalizeContactsFolders(c);
				children = [...children, ...child];
				cnIds = [...cnIds, ...childCns];
			});
		}
		if (f.id === '3' || (f.view && f.view === 'contact')) {
			return [[normalizeFolder(f), ...children], [...(f.cn ? f.cn[0].ids.split(',') : []), ...cnIds]];
		}

		return [children, cnIds];
	}

	private static _calculateContactMods(oldC: Contact, newC: Contact): {[keyPath: string]: any | undefined} {
		const mods: {[keyPath: string]: any | undefined} = {};
		if (oldC.parent !== newC.parent) mods.parent = newC.parent;
		if (oldC.company !== newC.company) mods.company = newC.company;
		if (oldC.department !== newC.department) mods.department = newC.department;
		if (oldC.firstName !== newC.firstName) mods.firstName = newC.firstName;
		if (oldC.lastName !== newC.lastName) mods.lastName = newC.lastName;
		if (oldC.image !== newC.image) mods.image = newC.image;
		if (oldC.jobTitle !== newC.jobTitle) mods.jobTitle = newC.jobTitle;
		if (oldC.notes !== newC.notes) mods.notes = newC.notes;
		if (oldC.nameSuffix !== newC.nameSuffix) mods.nameSuffix = newC.nameSuffix;
		if (JSON.stringify(oldC.address) !== JSON.stringify(newC.address)) mods.address = newC.address;
		if (JSON.stringify(oldC.mail) !== JSON.stringify(newC.mail)) mods.mail = newC.mail;
		if (JSON.stringify(oldC.phone) !== JSON.stringify(newC.phone)) mods.phone = newC.phone;
		return mods;
	}

	private static _calculateContactFolderMods(oldf: ContactsFolder, newf: ContactsFolder): {[keyPath: string]: any | undefined} {
		const mods: {[keyPath: string]: any | undefined} = {};
		if (oldf.itemsCount !== newf.itemsCount) mods.itemsCount = newf.itemsCount;
		if (oldf.unreadCount !== newf.unreadCount) mods.unreadCount = newf.unreadCount;
		if (oldf.path !== newf.path) mods.path = newf.path;
		if (oldf.name !== newf.name) mods.name = newf.name;
		if (oldf.size !== newf.size) mods.size = newf.size;
		if (oldf.parent !== newf.parent) mods.parent = newf.parent;
		return mods;
	}

	private static _createContact(
		c: ICreateChange,
		applyRemoteChanges: (changes: IDatabaseChange[], lastRevision: any, partial?: boolean, clear?: boolean) => Promise<void>,
		baseRevision: any
	): Promise<void> {
		const createContactReq = {
			Body: {
				CreateContactRequest: {
					_jsns: 'urn:zimbraMail',
					cn: {
						l: c.obj.parent,
						a: map<any, any>(
							{
								email: c.obj.email,
							},
							(v: any, k: any) => ({ n: k, _content: v })
						)
					}
				}
			}
		};
		return fetch(
			'/service/soap/CreateContactRequest',
			{
				method: 'POST',
				body: JSON.stringify(createContactReq)
			}
		)
			.then((response) => response.json())
			.then((r) => {
				if (r.Body.Fault) throw new Error(r.Body.Fault.Reason.Text);
				else return r.Body.CreateContactResponse;
			})
			.then(
				({ cn }) => applyRemoteChanges(
					[{
						type: 2,
						table: 'contacts',
						key: c.key,
						mods: {
							id: cn[0].id
						}
					}],
					baseRevision
				)
			);
	}

	private static _createRequestForChange(
		c: IDatabaseChange,
		applyRemoteChanges: (changes: IDatabaseChange[], lastRevision: any, partial?: boolean, clear?: boolean) => Promise<void>,
		baseRevision: any
	): Promise<void> {
		// TODO: Implement here!
		// TODO: Concatenate changes?
		switch (c.table) {
			case 'contacts': {
				switch (c.type) {
					case 1: {
						return ContactsDbSoapSyncProtocol._createContact(c as ICreateChange, applyRemoteChanges, baseRevision);
					}
					default:
						return Promise.resolve();
				}
			}
			case 'folders':
			default:
				return Promise.resolve();
		}
	}

	constructor(
		private _db: ContactsDb
	) {}

	public sync(
		context: IPersistedContext,
		url: string,
		options: any,
		baseRevision: any,
		syncedRevision: any,
		changes: IDatabaseChange[],
		partial: boolean,
		applyRemoteChanges: (changes: IDatabaseChange[], lastRevision: any, partial?: boolean, clear?: boolean) => Promise<void>,
		onChangesAccepted: () => void,
		onSuccess: (continuation: (PollContinuation | ReactiveContinuation)) => void,
		onError: (error: any, again?: number) => void
	): void {
		Promise.resolve()
			// () => {
			// if (changes.length > 0) {
			// 	return Promise.all(
			// 		reduce<IDatabaseChange, Promise<void>[]>(
			// 			changes,
			// 			(r, c) => {
			// 				// r.push(ContactsDbSoapSyncProtocol._createRequestForChange(c, applyRemoteChanges, baseRevision));
			// 				return r;
			// 			},
			// 			[]
			// 		)
			// 	)
			// 		.then(() => onChangesAccepted());
			// }
			// return null;
			// })
			.then(
				() => fetch(
					'/service/soap/SyncRequest',
					{
						method: 'POST',
						body: JSON.stringify({
							Body: {
								SyncRequest: {
									_jsns: 'urn:zimbraMail',
									typed: true,
									token: syncedRevision
								}
							}
						})
					}
				)
					.then((response) => response.json())
					.then((r) => {
						// TODO: Handle "mail.MUST_RESYNC" fault
						if (r.Body.Fault) throw new Error(r.Body.Fault.Reason.Text);
						else return r.Body.SyncResponse as ISoapSyncContactResponse;
					})
					.then(
						({
							token,
							folder,
							cn,
							deleted
						}) => {
							const syncChanges: IDatabaseChange[] = [];
							const newOrUpdatedFolders: ContactsFolder[] = [];
							const newOrUpdatesContactIds: string[] = [];
							const deletedFolders: string[] = [];
							const deletedContacts: string[] = [];

							// Collect folders, new and updated.
							// If initial sync collect contacts inside the folders
							reduce(
								folder || [],
								(r: [ContactsFolder[], string[]], f) => {
									const [folders, cnIds] = ContactsDbSoapSyncProtocol._normalizeContactsFolders(f);
									r[0].push(...folders);
									r[1].push(...cnIds);
									return r;
								},
								[newOrUpdatedFolders, newOrUpdatesContactIds]
							);

							// Collect the contact ids, new and updated.
							reduce(
								cn || [],
								(r, c) => {
									r.push(c.id);
									return r;
								},
								newOrUpdatesContactIds
							);

							if (deleted && deleted.length > 0) {
								if (deleted[0].folder) {
									// Collect deleted folders
									deletedFolders.push(
										...deleted[0].folder[0].ids.split(',')
									);
								}
								if (deleted[0].cn) {
									// Collect deleted contacts
									deletedContacts.push(
										...deleted[0].cn[0].ids.split(',')
									);
								}
							}
							return {
								newOrUpdatedFolders,
								newOrUpdatesContactIds,
								deletedFolders,
								deletedContacts,
								syncChanges,
								syncToken: `${token}`,
								isInitialSync: !syncedRevision
							} as SyncChainContainer;
						}
					)
					.then((container) => this._createInsertOrUpdateContactFoldersOperations(container))
					.then((container) => this._createInsertOrUpdateContactOperations(container))
					.then((container) => this._createDeleteContactOperations(container))
					.then((container) => this._createDeleteContactFoldersOperations(container))
					.then(({ syncChanges, syncToken }) => {
						console.log('Sync Changes', syncChanges);
						return applyRemoteChanges(syncChanges as IDatabaseChange[], syncToken, false);
					})
					.then(() => {
						console.log('Remote changes applied');
						onSuccess({ again: POLL_INTERVAL });
					})
			)
			.catch((e) => {
				console.error(e);
				onError(e, POLL_INTERVAL);
			});
	}

	private _createInsertOrUpdateContactOperations(container: SyncChainContainer): PromiseLike<SyncChainContainer> {
		const {
			newOrUpdatesContactIds,
			syncChanges,
			isInitialSync
		} = container;
		return (
			isInitialSync ? Promise.resolve<Contact[]>([])
				: this._db.contacts.where('id').anyOf(newOrUpdatesContactIds).toArray()
		)
			.then((oldContacts) => {
				const newContactIds = difference(
					newOrUpdatesContactIds,
					map(oldContacts, 'id')
				) as string[];

				return [
					newContactIds,
					oldContacts
				];
			})
			.then(([newContactIds, oldContacts]) => {
				// Fetch new or updated contacts
				if (newContactIds.length > 0 || oldContacts.length > 0) {
					return fetch(
						'/service/soap/GetContactsRequest',
						{
							method: 'POST',
							body: JSON.stringify({
								Body: {
									GetContactsRequest: {
										_jsns: 'urn:zimbraMail',
										sync: 1,
										cn: map([...newContactIds, ...map(oldContacts as Contact[], 'id')], (id: string) => ({ id }))
									}
								}
							})
						}
					)
						.then((response) => response.json())
						.then((r2) => {
							if (r2.Body.Fault) throw new Error(r2.Body.Fault.Reason.Text);
							else return r2.Body.GetContactsResponse;
						})
						.then(({ cn }) => {
							reduce(
								cn,
								(r, c) => {
									const contact = normalizeContact(c);
									if (includes(newContactIds, c.id)) {
										// New Contact
										r.push({
											type: 1,
											table: 'contacts',
											key: undefined,
											obj: contact,
										});
									}
									else {
										// Updated contact
										const oldContact: Contact = find(oldContacts as Contact[], ['id', c.id])!;
										const mods = ContactsDbSoapSyncProtocol._calculateContactMods(oldContact, contact);
										r.push({
											type: 2,
											table: 'contacts',
											key: oldContact._id,
											mods
										});
									}
									return r;
								},
								syncChanges
							);
							return container;
						});
				}
				return container;
			});
	}

	private _createInsertOrUpdateContactFoldersOperations(container: SyncChainContainer): PromiseLike<SyncChainContainer> {
		const {
			newOrUpdatedFolders,
			syncChanges,
			isInitialSync
		} = container;
		const newOrUpdatedFoldersIds = map(newOrUpdatedFolders, 'id') as string[];
		return (
			isInitialSync ? Promise.resolve<ContactsFolder[]>([])
				: this._db.folders.where('id').anyOf(newOrUpdatedFoldersIds).toArray()
		)
			.then((oldFolders) => {
				const newFoldersIds = difference(
					newOrUpdatedFoldersIds,
					map(oldFolders, 'id')
				);
				reduce(
					newOrUpdatedFolders,
					(r, v, k) => {
						if (includes(newFoldersIds, v.id)) {
							// New Folder
							r.push({
								type: 1,
								table: 'folders',
								key: undefined,
								obj: v
							});
						}
						else {
							// Updated folder
							const oldContactFolder: ContactsFolder = find(oldFolders as ContactsFolder[], ['id', v.id])!;
							const mods = ContactsDbSoapSyncProtocol._calculateContactFolderMods(oldContactFolder, v);
							r.push({
								type: 2,
								table: 'folders',
								key: oldContactFolder._id,
								mods
							});
						}
						return r;
					},
					syncChanges
				);

				return container;
			});
	}

	private _createDeleteContactOperations(container: SyncChainContainer): PromiseLike<SyncChainContainer> {
		const {
			deletedContacts,
			syncChanges,
			isInitialSync
		} = container;
		return (
			isInitialSync ? Promise.resolve<Contact[]>([])
				: this._db.contacts.where('id').anyOf(deletedContacts).toArray()
		)
			.then((c) => {
				reduce(
					c,
					(r, c1) => {
						r.push({
							type: 3,
							table: 'contacts',
							key: c1._id
						});
						return r;
					},
					syncChanges
				);
				return container;
			});
	}

	private _createDeleteContactFoldersOperations(container: SyncChainContainer): PromiseLike<SyncChainContainer> {
		const {
			deletedFolders,
			syncChanges,
			isInitialSync
		} = container;
		return (
			isInitialSync ? Promise.resolve<ContactsFolder[]>([])
				: this._db.folders.where('id').anyOf(deletedFolders).toArray()
		)
			.then((f) => {
				reduce(
					f,
					(r, f1) => {
						r.push({
							type: 3,
							table: 'folders',
							key: f1._id
						});
						return r;
					},
					syncChanges
				);
				return container;
			});
	}
}

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
import { ICreateChange, IDatabaseChange, IDeleteChange, IUpdateChange } from 'dexie-observable/api';
import {
	forEach,
	map,
	reduce,
	difference,
	includes,
	find,
	values,
	keys,
	filter
} from 'lodash';
import { normalizeContact, normalizeFolder } from './contacts-db-utils';
import { ContactsFolder } from './contacts-folder';
import { ISoapSyncContactFolderObj, ISoapSyncContactResponse } from '../soap';
import { ContactsDb } from './contacts-db';
import { Contact } from './contact';

const POLL_INTERVAL = 20000;

type SyncChainContainer = {
	changesSentContainer: ChangesSentContainer;
	newOrUpdatedFolders: ContactsFolder[];
	newOrUpdatesContactIds: string[];
	deletedFolders: string[];
	deletedContacts: string[];
	syncChanges: IDatabaseChange[];
	syncToken: string;
	isInitialSync: boolean;
};

type ChangesSentContainer = {
	zimbraToInternalIds: {[id: string]: string};
	deletedRemappedRowId: string[];
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
		if (oldC.id !== newC.id) mods.id = newC.id;
		if (oldC.parent !== newC.parent) mods.parent = newC.parent;
		if (oldC.company !== newC.company) mods.company = newC.company;
		if (oldC.department !== newC.department) mods.department = newC.department;
		if (oldC.firstName !== newC.firstName) mods.firstName = newC.firstName;
		if (oldC.lastName !== newC.lastName) mods.lastName = newC.lastName;
		if (oldC.image !== newC.image) mods.image = newC.image;
		if (oldC.jobTitle !== newC.jobTitle) mods.jobTitle = newC.jobTitle;
		if (oldC.notes !== newC.notes) mods.notes = newC.notes;
		if (oldC.nameSuffix !== newC.nameSuffix) mods.nameSuffix = newC.nameSuffix;
		if (oldC.namePrefix !== newC.namePrefix) mods.namePrefix = newC.namePrefix;
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
		changesSentContainer: ChangesSentContainer,
	): Promise<ChangesSentContainer> {
		return fetch(
			'/service/soap/CreateContactRequest',
			{
				method: 'POST',
				body: JSON.stringify({
					Body: {
						CreateContactRequest: {
							_jsns: 'urn:zimbraMail',
							cn: {
								l: c.obj.parent,
								a: map<any, any>( // TODO: Add more fields here
									{
										firstName: c.obj.firstName,
										lastName: c.obj.lastName,
									},
									(v: any, k: any) => ({ n: k, _content: v })
								),
								m: []
							}
						}
					}
				})
			}
		)
			.then((response) => response.json())
			.then((r) => {
				if (r.Body.Fault) throw new Error(r.Body.Fault.Reason.Text);
				else return r.Body.CreateContactResponse;
			})
			.then(
				({ cn }) => (
					{
						...changesSentContainer,
						zimbraToInternalIds: {
							...changesSentContainer.zimbraToInternalIds,
							[cn[0].id]: c.key
						}
					}
				)
			);
	}

	private static _updateContact(
		change: IUpdateChange,
		changesSentContainer: ChangesSentContainer,
	): Promise<ChangesSentContainer> {
		return Promise.resolve(changesSentContainer);
	}

	private _deleteContact(
		change: IDeleteChange,
		changesSentContainer: ChangesSentContainer,
	): Promise<ChangesSentContainer> {
		return this._db.remapped_ids
			.where({ _id: change.key })
			.limit(1)
			.toArray()
			.then((remapped: Array<{ _?: string; _id: string; id: string }>) => {
				if (remapped.length === 0) return Promise.resolve(changesSentContainer);
				return fetch(
					'/service/soap/ContactActionRequest',
					{
						method: 'POST',
						body: JSON.stringify({
							Body: {
								ContactActionRequest: {
									_jsns: 'urn:zimbraMail',
									action: {
										op: 'delete',
										id: remapped[0].id
									}
								}
							}
						})
					}
				)
					.then((response) => response.json())
					.then((r) => {
						if (r.Body.Fault) throw new Error(r.Body.Fault.Reason.Text);
						else return r.Body.SyncResponse as ISoapSyncContactResponse;
					})
					.then(
						() => {
							// console.log('Adding a deleted remapped row with id: ', remapped[0]);
							return (
								{
									...changesSentContainer,
									deletedRemappedRowId: [...changesSentContainer.deletedRemappedRowId, remapped[0]._!]
								}
							);
						}
					);
			});
	}

	private _consumeContactChange(
		change: IDatabaseChange,
		changesSentContainer: ChangesSentContainer,
	): Promise<ChangesSentContainer> {
		switch (change.type) {
			case 1: { // DatabaseChangeType.Create
				return ContactsDbSoapSyncProtocol._createContact(change as ICreateChange, changesSentContainer);
			}
			case 2: { // DatabaseChangeType.Update
				return ContactsDbSoapSyncProtocol._updateContact(change as IUpdateChange, changesSentContainer);
			}
			case 3: { // DatabaseChangeType.Delete
				return this._deleteContact(change as IDeleteChange, changesSentContainer);
			}
			default:
		}
		return Promise.resolve(changesSentContainer);
	}

	private static _consumeFolderChange(
		change: IDatabaseChange,
		changesSentContainer: ChangesSentContainer,
	): Promise<ChangesSentContainer> {
		switch (change.type) {
			case 1: // DatabaseChangeType.Create
			case 2: // DatabaseChangeType.Update
			case 3: // DatabaseChangeType.Delete
			default:
				return Promise.resolve(changesSentContainer);
		}
	}

	private _consumeSingleChange(
		change: IDatabaseChange,
		changesSentContainer: ChangesSentContainer,
	): Promise<ChangesSentContainer> {
		console.log('Consume a change', change);
		switch (change.table) {
			case 'contacts': {
				return this._consumeContactChange(change, changesSentContainer);
			}
			case 'folders': {
				return ContactsDbSoapSyncProtocol._consumeFolderChange(change, changesSentContainer);
			}
			case 'remapped_ids':
			default:
				return Promise.resolve(changesSentContainer);
		}
	}

	private _consumeChanges(
		changes: IDatabaseChange[],
		changesSentContainer: ChangesSentContainer,
	): Promise<ChangesSentContainer> {
		if (changes.length === 0) return Promise.resolve(changesSentContainer);

		// TODO: Try to use the batch request to prevent the DoS filter to kick in.
		const [c0, ...otherChanges] = changes;
		return this._consumeSingleChange(c0, changesSentContainer)
			.then(
				(chCont) => this._consumeChanges(otherChanges, chCont)
			);
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
			.then(() => this._consumeChanges(changes, { zimbraToInternalIds: {}, deletedRemappedRowId: [] }))
			.then(
				(changesSentContainer) => fetch(
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
								isInitialSync: !syncedRevision,
								changesSentContainer
							} as SyncChainContainer;
						}
					)
					.then((container) => this._createInsertOrUpdateContactFoldersOperations(container))
					.then((container) => this._createInsertOrUpdateContactOperations(container))
					.then((container) => this._createDeleteContactOperations(container))
					.then((container) => this._createDeleteContactFoldersOperations(container))
					.then((container) => this._createCleanupRemappedDeletedContactsOperations(container))
					.then(({ syncChanges, syncToken }) => {
						if (!context.clientIdentity) {
							// eslint-disable-next-line no-param-reassign
							context.clientIdentity = '';
							return context.save().then(
								() => applyRemoteChanges(syncChanges as IDatabaseChange[], syncToken, false)
									.then(() => {
										onChangesAccepted();
										onSuccess({ again: POLL_INTERVAL });
									})
							).catch((e) => {
								onError(e, Infinity);
							});
						}
						return applyRemoteChanges(syncChanges as IDatabaseChange[], syncToken, false)
							.then(() => {
								onChangesAccepted();
								onSuccess({ again: POLL_INTERVAL });
							});
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
			isInitialSync,
			changesSentContainer
		} = container;
		return (
			isInitialSync ? Promise.resolve<Contact[]>([])
				: this._db.contacts.where('id').anyOf(newOrUpdatesContactIds).toArray()
		)
			.then(
				(oldContacts) => (
					isInitialSync ? Promise.resolve<Contact[]>([])
						: this._db.contacts.where('_id')
							.anyOf(values(changesSentContainer.zimbraToInternalIds))
							.toArray()
				)
					.then((toRemap) => ([...oldContacts, ...toRemap]))
			)
			.then((oldContacts) => {
				const oldContactsId = [
					...map(oldContacts, 'id'),
					...keys(changesSentContainer.zimbraToInternalIds)
				];
				const newContactIds = difference(
					newOrUpdatesContactIds,
					oldContactsId
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
										cn: map(
											[
												...newContactIds,
												...map(
													filter(
														oldContacts as Contact[],
														(c) => !!c.id
													),
													'id'
												)
											], (id: string) => ({ id })
										)
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
										// New Contact (remote)
										r.push({
											type: 1,
											table: 'contacts',
											key: undefined,
											obj: contact,
										});
									}
									else {
										// Updated contact or New Contact (local)
										const oldContact: Contact|undefined = find(oldContacts as Contact[], ['id', c.id])
											|| find(oldContacts as Contact[], ['_id', changesSentContainer.zimbraToInternalIds[c.id]]);
										if (!oldContact) return r;
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

	private _createCleanupRemappedDeletedContactsOperations(container: SyncChainContainer): PromiseLike<SyncChainContainer> {
		const {
			changesSentContainer,
			syncChanges
		} = container;

		console.log('Cleanup', changesSentContainer);

		reduce(
			changesSentContainer.deletedRemappedRowId,
			(r, v, k) => {
				r.push({
					type: 3,
					table: 'remapped_ids',
					key: v
				});
				return r;
			},
			syncChanges
		);

		return Promise.resolve(container);
	}
}

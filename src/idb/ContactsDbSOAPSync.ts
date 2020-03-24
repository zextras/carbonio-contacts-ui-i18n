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
import { forEach, map, reduce } from 'lodash';
import { normalizeContact } from './IdbContactsUtils';

const POLL_INTERVAL = 20000;

export class ContactsDbSOAPSync implements ISyncProtocol {

	private static _normalizeFolder(f: any): [any, string[]] {
		return [{
			id: f.id,
			name: f.name,
			path: f.absFolderPath,
			parent: f.l
		}, f.cn ? f.cn[0].ids.split(',') : []];
	}

	private static _getContactsFolders(f: any): [any[], string[]] {
		if (!f) return [[], []];
		let children: any[] = [];
		let cnIds: string[] = [];
		if (f.folder) {
			forEach(f.folder, (c: any) => {
				const [child, childCns] = ContactsDbSOAPSync._getContactsFolders(c);
				children = [...children, ...child];
				cnIds = [...cnIds, ...childCns];
			});
		}
		if (f.id === '3' || (f.view && f.view === 'contact')) {
			const [thisF, thisCns] = ContactsDbSOAPSync._normalizeFolder(f);
			return [[thisF, ...children], [...thisCns, ...cnIds]];
		}
		else {
			return [children, cnIds];
		}
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
			.then(({ cn }) => {
				return applyRemoteChanges(
					[{
						type: 2,
						table: 'contacts',
						key: c.key,
						mods: {
							id: cn[0].id
						}
					}],
					baseRevision
				);
			});
	}

	private static _createRequestForChange(
		c: IDatabaseChange,
		applyRemoteChanges: (changes: IDatabaseChange[], lastRevision: any, partial?: boolean, clear?: boolean) => Promise<void>,
		baseRevision: any
	): Promise<void> {
		switch (c.table) {
			case 'contacts': {
				switch (c.type) {
					case 1: {
						return ContactsDbSOAPSync._createContact(c as ICreateChange, applyRemoteChanges, baseRevision);
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

	private _firstRound = true;

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
		Promise.resolve((() => {
			if (changes.length > 0) {
				return Promise.all(
					reduce<IDatabaseChange, Promise<void>[]>(
						changes,
						(r, c) => {
							r.push(ContactsDbSOAPSync._createRequestForChange(c, applyRemoteChanges, baseRevision));
							return r;
						},
						[]
					)
				)
					.then(() => onChangesAccepted());
			}
			return null;
		})())
			.then(() => {
				const syncReq = {
					Body: {
						SyncRequest: {
							_jsns: 'urn:zimbraMail',
							typed: true,
							token: syncedRevision
						}
					}
				};
				fetch(
					'/service/soap/SyncRequest',
					{
						method: 'POST',
						body: JSON.stringify(syncReq)
					}
				)
					.then((response) => response.json())
					.then((r) => {
						if (r.Body.Fault) throw new Error(r.Body.Fault.Reason.Text);
						else return r.Body.SyncResponse;
					})
					.then(({ token, folder, cn, deleted }: { token: string; folder: any[]; cn?: any[]; deleted?: any[] }) => {
						let c: IDatabaseChange[] = [];
						let cnIds: string[] = [];
						if (!syncedRevision) {
							// First sync, download
							const root = folder[0];
							const [folders, contactIds] = ContactsDbSOAPSync._getContactsFolders(root);
							c = reduce(folders, (r, f) => ([...r, {
								type: 1,
								table: 'folders',
								key: f.id,
								obj: f,
							}]), c);
							cnIds = contactIds;
						}
						if (cn) {
							cnIds = [...cnIds, ...map(cn, 'id')];
						}
						if (deleted && deleted[0].cn) {
							c = reduce(
								deleted[0].cn[0].ids.split(','),
								(r, delCnId) => ([...r, {
									type: 3,
									table: 'contacts',
									key: delCnId
								}]),
								c
							);
						}
						if (deleted && deleted[0].folder) {
							c = reduce(
								deleted[0].folder[0].ids.split(','),
								(r, delFId) => ([...r, {
									type: 3,
									table: 'folders',
									key: delFId
								}]),
								c
							);
						}
						return [c, cnIds, token];
					})
					.then(([c, cnIds, syncToken]) => {
						if (cnIds.length > 0) {
							const searchReq: {} = {
								Body: {
									GetContactsRequest: {
										_jsns: 'urn:zimbraMail',
										sync: 1,
										cn: map(cnIds, (id) => ({ id }))
									}
								}
							};
							return fetch(
								'/service/soap/GetContactsRequest',
								{
									method: 'POST',
									body: JSON.stringify(searchReq)
								}
							)
								.then((response) => response.json())
								.then((r2) => {
									if (r2.Body.Fault) throw new Error(r2.Body.Fault.Reason.Text);
									else return r2.Body.GetContactsResponse;
								})
								.then(({ cn }) => ([
									reduce(
										cn,
										(r, contact) => {
											const contactNorm = normalizeContact(contact);
											return [...r, {
												type: 1,
												table: 'contacts',
												key: contactNorm.id,
												obj: contactNorm,
											}];
										},
										c
									),
									syncToken
								]));
						}
						return [c, syncToken];
					})
					.then(([c, syncToken]) => applyRemoteChanges(c, syncToken))
					.then(() => {
						if (this._firstRound) {
							this._firstRound = false;
							onSuccess({ again: POLL_INTERVAL });
						}
					});
			});
	}
}

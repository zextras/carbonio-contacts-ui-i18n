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

import { ICreateChange, IDatabaseChange } from 'dexie-observable/api';
import { reduce, map, omit } from 'lodash';
import { ContactsDb } from './contacts-db';
import { Contact } from './contact';
import { normalizeContact } from './contacts-db-utils';
import {
	GetContactRequest,
	GetContactsResponse,
	SoapContact,
	SyncResponse,
	SyncResponseContact,
	SyncResponseContactFolder
} from '../soap';
import { SoapFetch } from '@zextras/zapp-shell';

/**
 * Extract all contact ids inside a given folder and all his subfolder.
 * This function will walk through all the folder tree starting from the given folder.
 * @param r Accumulator array where all ids will be pushed into.
 * @param f The root folder.
 * @private
 */
function _folderReducer(r: string[], f: SyncResponseContactFolder): string[] {
	if (f.id === '3' || (f.view && f.view === 'contact')) {
		if (f.cn) {
			r.push(...f.cn[0].ids.split(','));
		}
	}
	if (f.folder) {
		reduce<SyncResponseContactFolder, string[]>(
			f.folder,
			_folderReducer,
			r
		);
	}
	return r;
}

export function fetchContacts(
	_fetch: SoapFetch,
	ids: string[]
): Promise<Contact[]> {
	if (ids.length < 1) return Promise.resolve([]);
	const getContactRequest: GetContactRequest = {
		_jsns: 'urn:zimbraMail',
		cn: reduce<string, Array<{id: string}>>(
			ids,
			(r, v) => {
				r.push({ id: v });
				return r;
			},
			[]
		)
	};

	return _fetch<GetContactRequest, GetContactsResponse>(
		'GetContacts',
		getContactRequest
	)
		.then((response) => {
			return reduce<SoapContact, Contact[]>(
				response.cn,
				(r, c) => {
					if ((c._attrs as any).type && (c._attrs as any).type === 'group') return r;
					r.push(
						normalizeContact(c)
					);
					return r;
				},
				[]
			);
		});
}

function extractAllContactsForInitialSync(
	_fetch: SoapFetch,
	folders: Array<SyncResponseContactFolder>
): Promise<ICreateChange[]> {
	const cnIds = reduce<SyncResponseContactFolder, string[]>(
		folders,
		_folderReducer,
		[]
	);
	return fetchContacts(
		_fetch,
		cnIds
	)
		.then((contacts) => reduce<Contact, ICreateChange[]>(
			contacts,
			(r, c) => {
				r.push({
					type: 1,
					table: 'contacts',
					key: undefined,
					obj: c
				});
				return r;
			},
			[]
		));
}

function searchLocalContacts(db: ContactsDb, ids: string[]): Promise<{[key: string]: string}> {
	return db.contacts.where('id').anyOf(ids).toArray()
		.then((localContacts) => reduce<Contact, {[key: string]: string}>(
			localContacts,
			(r, f) => {
				// @ts-ignore
				r[f.id] = f._id;
				return r;
			},
			{}
		));
}

export default function processRemoteContactsNotification(
	_fetch: SoapFetch,
	db: ContactsDb,
	isInitialSync: boolean,
	changes: IDatabaseChange[],
	localChangesFromRemote: IDatabaseChange[],
	{ cn, deleted, folder }: SyncResponse
): Promise<IDatabaseChange[]> {
	if (isInitialSync) {
		// Extract all contacts form all the folders
		return extractAllContactsForInitialSync(_fetch, folder!);
	}

	const ids = map<SyncResponseContact>(cn || [], 'id');

	return fetchContacts(
		_fetch,
		ids
	)
		.then((contacts) => searchLocalContacts(
			db,
			ids
		)
			.then((idToLocalUUIDMap) => {
				const isLocallyCreated: {[key: string]: string} = {};
				return { idToLocalUUIDMap, isLocallyCreated };
			})
			.then(({ idToLocalUUIDMap, isLocallyCreated }) => {
				const dbChanges = reduce<Contact, IDatabaseChange[]>(
					contacts,
					(r, c) => {
						// @ts-ignore
						if (idToLocalUUIDMap.hasOwnProperty(c.id)) {
							// @ts-ignore
							c._id = idToLocalUUIDMap[c.id];
							r.push({
								type: 2,
								table: 'contacts',
								key: c._id,
								mods: omit(c, ['_id', 'id'])
							});
						}
						else if (!isLocallyCreated[c.id!]) {
							r.push({
								type: 1,
								table: 'contacts',
								key: undefined,
								obj: c
							});
						}
						return r;
					},
					[]
				);

				if (deleted && deleted[0] && deleted[0].cn) {
					return searchLocalContacts(
						db,
						deleted[0].cn[0].ids.split(','),
					)
						.then((deletedIdToLocalUUIDMap) => {
							reduce<{[key: string]: string}, IDatabaseChange[]>(
								deletedIdToLocalUUIDMap,
								(r, _id, id) => {
									r.push({
										type: 3,
										table: 'contacts',
										key: _id,
									});
									return r;
								},
								dbChanges
							);
							return dbChanges;
						});
				}

				return dbChanges;
			}));
}

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
	ICreateChange, IDatabaseChange, IDeleteChange, IUpdateChange
} from 'dexie-observable/api';
import { filter, map, reduce } from 'lodash';
import { ContactsDb, DeletionData } from './contacts-db';
import { Contact } from './contact';
import {
	BatchedRequest, BatchedResponse,
	BatchRequest, ContactActionRequest,
	CreateContactRequest,
	CreateContactResponse,
	ModifyContactRequest,
	normalizeContactAttrsToSoapOp,
	normalizeContactChangesToSoapOp
} from '../soap';

function processInserts(
	db: ContactsDb,
	changes: ICreateChange[],
	batchRequest: BatchRequest,
	localChanges: IDatabaseChange[],
): Promise<[BatchRequest, IDatabaseChange[]]> {
	if (changes.length < 1) return Promise.resolve([batchRequest, localChanges]);
	const createContactRequest: Array<BatchedRequest & CreateContactRequest> = [];
	reduce<ICreateChange, Array<BatchedRequest & CreateContactRequest>>(
		changes,
		(r, c) => {
			r.push({
				_jsns: 'urn:zimbraMail',
				requestId: c.key,
				cn: {
					m: [],
					l: c.obj.parent,
					a: normalizeContactAttrsToSoapOp(c.obj)
				}
			});
			return r;
		},
		createContactRequest
	);
	if (createContactRequest.length > 0) {
		batchRequest.CreateContactRequest = [
			...(batchRequest.CreateContactRequest || []),
			...createContactRequest
		];
	}
	return Promise.resolve([batchRequest, localChanges]);
}

function processUpdates(
	db: ContactsDb,
	changes: IUpdateChange[],
	batchRequest: BatchRequest,
	localChanges: IDatabaseChange[],
): Promise<[BatchRequest, IDatabaseChange[]]> {
	if (changes.length < 1) return Promise.resolve([batchRequest, localChanges]);

	return db.contacts.where('_id').anyOf(map(changes, 'key')).toArray().then((contacts) => {
		const uuidToId = reduce<Contact, {[key: string]: string}>(
			contacts,
			(r, f) => {
				r[f._id!] = f.id;
				return r;
			},
			{}
		);
		const modifyContactRequest: Array<BatchedRequest & ModifyContactRequest> = [];
		const moveContactRequest: Array<BatchedRequest & ContactActionRequest> = [];
		reduce<IUpdateChange, [Array<BatchedRequest & ModifyContactRequest>, Array<BatchedRequest & ContactActionRequest>]>(
			changes,
			([_modifyContactRequest, _moveContactRequest], c) => {
				if (c.mods.parent) {
					_moveContactRequest.push({
						_jsns: 'urn:zimbraMail',
						requestId: c.key,
						action: {
							op: 'move',
							id: uuidToId[c.key],
							l: c.mods.parent
						}
					});
				}
				else {
					_modifyContactRequest.push({
						_jsns: 'urn:zimbraMail',
						requestId: c.key,
						force: '1',
						replace: '0',
						cn: {
							id: uuidToId[c.key],
							m: [],
							a: normalizeContactChangesToSoapOp(c.mods) // Smelly code
						}
					});
				}
				return [_modifyContactRequest, _moveContactRequest];
			},
			[modifyContactRequest, moveContactRequest]
		);

		if (modifyContactRequest.length > 0) {
			batchRequest.ModifyContactRequest =	[
				...(batchRequest.ModifyContactRequest || []),
				...modifyContactRequest
			];
		}
		if (moveContactRequest.length > 0) {
			batchRequest.ContactActionRequest =	[
				...(batchRequest.ContactActionRequest || []),
				...moveContactRequest
			];
		}

		return [batchRequest, localChanges];
	});
}

function processDeletions(
	db: ContactsDb,
	changes: IDeleteChange[],
	batchRequest: BatchRequest,
	localChanges: IDatabaseChange[],
): Promise<[BatchRequest, IDatabaseChange[]]> {
	if (changes.length < 1) return Promise.resolve([batchRequest, localChanges]);
	return db.deletions.where('_id').anyOf(map(changes, 'key')).toArray().then((deletedIds) => {
		const uuidToId = reduce<DeletionData, {[key: string]: {id: string; rowId: string}}>(
			filter(deletedIds, ['table', 'contacts']),
			(r, d) => {
				r[d._id] = { id: d.id, rowId: d.rowId! };
				return r;
			},
			{}
		);
		const contactActionRequest: Array<BatchedRequest & ContactActionRequest> = [];
		reduce(
			changes,
			(r, c) => {
				r.push({
					_jsns: 'urn:zimbraMail',
					requestId: c.key,
					action: {
						op: 'delete',
						id: uuidToId[c.key].id,
					}
				});
				localChanges.push({
					type: 3,
					table: 'deletions',
					key: uuidToId[c.key].rowId
				});
				return r;
			},
			contactActionRequest
		);
		if (contactActionRequest.length > 0) {
			batchRequest.ContactActionRequest =	[
				...(batchRequest.ContactActionRequest || []),
				...contactActionRequest
			];
		}
		return Promise.resolve([batchRequest, localChanges]);
	});
}

function processCreationResponse(r: BatchedResponse & CreateContactResponse): IUpdateChange {
	const folder = r.cn[0];
	return {
		type: 2,
		table: 'contacts',
		key: r.requestId,
		mods: {
			id: folder.id
		}
	};
}

export default function processLocalContactChange(
	db: ContactsDb,
	changes: IDatabaseChange[],
	_fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>
): Promise<IDatabaseChange[]> {
	if (changes.length < 1) return Promise.resolve([]);

	const contactChanges = filter(changes, ['table', 'contacts']);
	const batchRequest: BatchRequest = {
		_jsns: 'urn:zimbra',
		onerror: 'continue'
	};

	return processInserts(
		db,
		filter(contactChanges, ['type', 1]) as ICreateChange[],
		batchRequest,
		[]
	).then(([_batchRequest, _dbChanges]) => processUpdates(
		db,
		filter(contactChanges, ['type', 2]) as IUpdateChange[],
		_batchRequest,
		_dbChanges
	))
		.then(([_batchRequest, _dbChanges]) => processDeletions(
			db,
			filter(contactChanges, ['type', 3]) as IDeleteChange[],
			_batchRequest,
			_dbChanges
		))
		.then(([_batchRequest, _dbChanges]) => {
			if (
				!_batchRequest.CreateContactRequest
				&& !_batchRequest.ModifyContactRequest
				&& !_batchRequest.ContactActionRequest
			) {
				return _dbChanges;
			}
			return _fetch(
				'/service/soap/BatchRequest',
				{
					method: 'POST',
					body: JSON.stringify({
						Body: {
							BatchRequest: _batchRequest
						}
					})
				}
			)
				.then((response) => response.json())
				.then((r) => {
					if (r.Body.Fault) throw new Error(r.Body.Fault.Reason.Text);
					else return r.Body.BatchResponse;
				})
				.then((BatchResponse) => {
					if (BatchResponse.CreateContactResponse) {
						const creationChanges = reduce<any, IUpdateChange[]>(
							BatchResponse.CreateContactResponse,
							(r, response) => {
								r.push(processCreationResponse(response));
								return r;
							},
							[]
						);
						_dbChanges.unshift(...creationChanges);
					}
					return _dbChanges;
				});
		});
}

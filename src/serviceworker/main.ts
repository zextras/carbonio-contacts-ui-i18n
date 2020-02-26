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
/* eslint-env serviceworker */
/* eslint-disable @typescript-eslint/camelcase,@typescript-eslint/no-misused-promises */

// import { precacheAndRoute } from 'workbox-precaching/precacheAndRoute';
// precacheAndRoute(self.__WB_MANIFEST);

import { forEach, map } from 'lodash';
import { filter } from 'rxjs/operators';
import { fc, fcSink } from '@zextras/zapp-shell/fc';
import { IFCPartialEvent } from '@zextras/zapp-shell/lib/fc/IFiberChannel';
import {
	CreateContactOpResp,
	DeleteContactActionOpResp,
	ISoapContactObj,
	ISoapSyncContactFolderObj,
	ISoapSyncContactResponse,
	ModifyContactOpResp,
	MoveContactActionOpResp
} from '../ISoap';
import {
	CreateContactOp,
	DeleteContactOp,
	ModifyContactOp,
	MoveContactOp
} from '../IContactsService';
import { Contact } from '../idb/IContactsIdb';
import ContactsIdbService from '../idb/ContactsIdbService';
import { normalizeContact, normalizeFolder } from '../idb/IdbContactsUtils';
import ContactsNetworkService from '../network/ContactsNetworkService';

const _idbSrvc = new ContactsIdbService();
const _networkSrvc = new ContactsNetworkService();

// function _fetchSoapContactsByFolder(f) {
// 	if (f.n === 0) return Promise.resolve([false, []]);
// 	return new Promise((resolve, reject) => {
// 		// console.log(`fetch Contacts`, ids);
// 		const searchReq = {
// 			Body: {
// 				SearchRequest: {
// 					_jsns: 'urn:zimbraMail',
// 					types: 'contact',
// 					query: `in:"${f.absFolderPath}"`,
// 					needExp: 1,
// 					fetch: 1,
// 					limit: 1000,
// 					offset: 0
// 				}
// 			}
// 		};
// 		fetch(
// 			'/service/soap/SearchRequest',
// 			{
// 				method: 'POST',
// 				body: JSON.stringify(searchReq)
// 			}
// 		)
// 			.then(r => r.json())
// 			.then(r => {
// 				if (r.Body.Fault) throw new Error(r.Body.Fault.Reason.Text);
// 				const srcResp = r.Body.SearchResponse;
// 				resolve([srcResp.more, map(srcResp.cn, c => normali zeContact(c))]);
// 			})
// 			.catch(e => reject(e));
// 	});
// }

function _walkSOAPContactsFolder(folders: Array<ISoapSyncContactFolderObj>): Promise<void> {
	return Promise.all(
		map(folders, (f: ISoapSyncContactFolderObj): Promise<void> => {
			const promises: Array<Promise<void>> = [];
			if (f.folder) {
				promises.push(
					_walkSOAPContactsFolder(f.folder)
				);
			}
			if (f.view && f.view === 'contact') {
				// console.log('Processing folder', f);
				// Store the folder data
				promises.push(
					_idbSrvc.saveFolderData(normalizeFolder(f))
						.then(() => {
							if (!f.cn) return [];
							return _networkSrvc.fetchSoapContacts(f.cn[0].ids.split(','));
						})
						.then((r: Array<Contact>): Promise<void> => _idbSrvc.saveContactsData(r)
							.then((): void => {
								forEach(
									r,
									(c: Contact): void =>
										fcSink<{id: string}>('contacts:updated:contact', { id: c.id })
								);
							}))
						.then((): void => {
							fcSink<{id: string}>('contacts:updated:folder', { id: f.id });
						})
				);
			}
			return Promise.all(promises).then((_) => undefined);
		})
	).then((_) => undefined);
}

function _handleSOAPChanges(changes: Array<ISoapContactObj>): Promise<void> {
	return _networkSrvc.fetchSoapContacts(map(changes, (c: ISoapContactObj): string => c.id))
		.then((r: Array<Contact>): Promise<void> => _idbSrvc.saveContactsData(r)
			.then((): void => {
				forEach(
					r,
					(c: Contact): void =>
						fcSink<{id: string}>('contacts:updated:contact', { id: c.id })
				);
			}));
}

function _removeContacts(ids: Array<string>): Promise<void> {
	return _idbSrvc.deleteContacts(ids)
		.then((ids1): void => {
			forEach(
				ids1,
				(id: string): void =>
					fcSink<{id: string}>('contacts:deleted:contact', { id })
			);
		});
}

function _removeFolders(ids: Array<string>): Promise<void> {
	return _idbSrvc.deleteFolders(ids)
		.then((ids1): void => {
			forEach(
				ids1,
				(id: string): void =>
					fcSink<{id: string}>('contacts:deleted:folder', { id })
			);
		});
}

function _processSOAPNotifications(syncResponse: ISoapSyncContactResponse): Promise<void> {
	const promises: Array<Promise<void>> = [];
	console.log('Qua:', syncResponse);
	// First sync will have the folders
	if (syncResponse.folder) {
		promises.push(
			_walkSOAPContactsFolder(syncResponse.folder)
		);
	}
	// Other syncs will have the 'cn' field populated.
	if (syncResponse.cn) {
		promises.push(
			_handleSOAPChanges(syncResponse.cn)
		);
	}
	// Handle the deleted items
	if (syncResponse.deleted && syncResponse.deleted[0].cn) {
		promises.push(
			_removeContacts(syncResponse.deleted[0].cn[0].ids.split(','))
		);
	}
	// Handle the deleted folders
	if (syncResponse.deleted && syncResponse.deleted[0].folder) {
		promises.push(
			_removeFolders(syncResponse.deleted[0].folder[0].ids.split(','))
		);
	}
	return Promise.all(promises).then((_) => undefined);
}

function _processContactCreated(operation: CreateContactOp, response: CreateContactOpResp): Promise<void> {
	return _networkSrvc.fetchSoapContacts([response.CreateContactResponse.cn[0].id])
		.then((r: Array<Contact>) => _idbSrvc.saveContactsData(r)
			.then(() => {
				forEach(
					r,
					(c: Contact): void =>
						fcSink<{id: string}>('contacts:updated:contact', { id: c.id })
				);
			}));
}

function _processContactDeleted(operation: DeleteContactOp, response: DeleteContactActionOpResp): Promise<void> {
	return _removeContacts([response.ContactActionResponse.action.id]);
}

function _processContactModified(operation: ModifyContactOp, response: ModifyContactOpResp): Promise<void> {
	return _networkSrvc.fetchSoapContacts([response.ModifyContactResponse.cn[0].id])
		.then((r: Array<Contact>): Promise<void> => _idbSrvc.saveContactsData(r)
			.then((): void => {
				forEach(
					r,
					(c: Contact): void =>
						fcSink<{id: string}>('contacts:updated:contact', { id: c.id })
				);
			}));
}

function _processContactMoved(operation: MoveContactOp, response: MoveContactActionOpResp): Promise<void> {
	return _networkSrvc.fetchSoapContacts([response.ContactActionResponse.action.id])
		.then((r: Array<Contact>): Promise<void> => _idbSrvc.saveContactsData(r)
			.then((): void => {
				forEach(
					r,
					(c: Contact): void =>
						fcSink<{id: string}>('contacts:updated:contact', { id: c.id })
				);
			}));
}

function _sendFolderUpdatedOnBC(id: string): void {
	fcSink<{id: string}>('contacts:updated:folder', { id });
}

function _processOperationCompleted(data: any): Promise<void> {
	// console.log(data.action, data.data);
	return new Promise((resolve, reject) => {
		const promises: Array<Promise<void>> = [];
		if (data.action === 'sync:operation:completed') {
			// Fetch the updated information for edited objects
			const { operation, result } = data.data.data;
			switch (operation.opData.operation) {
				case 'create-contact':
					promises.push(_processContactCreated(operation, result.Body));
					break;
				case 'delete-contact':
					promises.push(_processContactDeleted(operation, result.Body));
					break;
				case 'modify-contact':
					promises.push(_processContactModified(operation, result.Body));
					break;
				case 'move-contact':
					promises.push(_processContactMoved(operation, result.Body));
					break;
				case 'create-contact-folder':
					promises.push(
						_idbSrvc.saveFolderData(normalizeFolder(result.Body.CreateFolderResponse.folder[0]))
							.then(() => _sendFolderUpdatedOnBC(result.Body.CreateFolderResponse.folder[0].id))
					);
					break;
				case 'delete-contact-folder':
					promises.push(_removeFolders([operation.opData.id]));
					break;
				case 'move-contact-folder':
					promises.push(
						_idbSrvc.moveFolder(operation.opData.id, operation.opData.parent)
							.then(() => _sendFolderUpdatedOnBC(operation.opData.id))
					);
					break;
				case 'rename-contact-folder':
					promises.push(
						_idbSrvc.renameFolder(operation.opData.id, operation.opData.name)
							.then(() => _sendFolderUpdatedOnBC(operation.opData.id))
					);
					break;
				default:
			}
		}
		// Proxy the information to the shell to update the Operation queue.
		Promise.all(promises).then((): void => {
			fcSink<IFCPartialEvent<any>>({
				to: 'com_zextras_zapp_shell',
				event: data.action,
				data: data.data
			});
			resolve();
		});
	});
}

fc.pipe(filter(({ event }) => event === 'SOAP:notification:handle'))
	.subscribe((e) => _processSOAPNotifications(e.data).then().catch((e1) => console.error(e1)));
fc.pipe(filter(({ event }) => event === 'sync:operation:completed' || event === 'sync:operation:error'))
	.subscribe((e) => _processOperationCompleted(e.data).then().catch((e1) => console.error(e1)));

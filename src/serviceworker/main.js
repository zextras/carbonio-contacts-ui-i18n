/*
 * *** BEGIN LICENSE BLOCK *****
 * Copyright (C) 2011-2019 ZeXtras
 *
 * The contents of this file are subject to the ZeXtras EULA;
 * you may not use this file except in compliance with the EULA.
 * You may obtain a copy of the EULA at
 * http://www.zextras.com/zextras-eula.html
 * *** END LICENSE BLOCK *****
 */
/* eslint-env serviceworker */

// import { precacheAndRoute } from 'workbox-precaching/precacheAndRoute';
// precacheAndRoute(self.__WB_MANIFEST);

import { forEach, map } from 'lodash';
import ContactsIdbService from '../idb/ContactsIdbService';
import { normalizeContact, normalizeFolder } from '../idb/IdbContactsUtils';

const _sharedBC = new BroadcastChannel('com_zextras_zapp_shell_sw');
const _idbSrvc = new ContactsIdbService();

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
// 				resolve([srcResp.more, map(srcResp.cn, c => normalizeContact(c))]);
// 			})
// 			.catch(e => reject(e));
// 	});
// }

function _fetchSoapContacts(ids) {
	return new Promise((resolve, reject) => {
		const searchReq = {
			Body: {
				GetContactsRequest: {
					_jsns: 'urn:zimbraMail',
					sync: 1,
					cn: map(ids, id => ({ id }))
				}
			}
		};
		fetch(
			'/service/soap/GetContactsRequest',
			{
				method: 'POST',
				body: JSON.stringify(searchReq)
			}
		)
			.then(r => r.json())
			.then(r => {
				if (r.Body.Fault) throw new Error(r.Body.Fault.Reason.Text);
				resolve(map(r.Body.GetContactsResponse.cn, c => normalizeContact(c)));
			})
			.catch(e => reject(e));
	});
}

function _walkSOAPContactsFolder(folders) {
	return Promise.all(
		map(
			folders,
			(f) => {
				const promises = [];
				if (f.folder)
					promises.push(
						_walkSOAPContactsFolder(f.folder)
					);
				if (f.view && f.view === 'contact') {
					// console.log('Processing folder', f);
					// Store the folder data
					promises.push(
						_idbSrvc.saveFolderData(
							normalizeFolder(f)
						)
						.then(_ => new Promise((resolve, reject) => {
							if (!f.cn) resolve([]);
							_fetchSoapContacts(f.cn[0].ids.split(','))
								.then((contacts) => resolve(contacts))
								.catch(e => reject(e)); // TODO: If has more handle it!
						}))
						.then(r => new Promise((resolve, reject) => {
							_idbSrvc.saveContactsData(r)
								.then(() => {
									forEach(r, (c) => _sharedBC.postMessage({
										action: 'app:fiberchannel',
										data: {
											event: 'contacts:updated:contact',
											data: {
												id: c.id
											}
										}
									}));
								})
								.then(_ => resolve())
								.catch(e => reject(e));
						}))
						.then(_ => {
							_sharedBC.postMessage({
								action: 'app:fiberchannel',
								data: {
									event: 'contacts:updated:folder',
									data: {
										id: f.id
									}
								}
							});
						})
					);
				}
				return Promise.all(promises);
			}
	));
}

function _handleSOAPChanges(changes) {
	return new Promise(((resolve, reject) => {
		_fetchSoapContacts(
			map(
				changes,
				c => c.id
			)
		)
			.then(r => new Promise((resolve, reject) => {
				_idbSrvc.saveContactsData(r)
					.then(() => {
						forEach(r, (c) => _sharedBC.postMessage({
							action: 'app:fiberchannel',
							data: {
								event: 'contacts:updated:contact',
								data: {
									id: c.id
								}
							}
						}));
					})
					.then(_ => resolve())
					.catch(e => reject(e));
			}))
			.then(_ => resolve())
			.catch(e => reject(e))
	}));
}

function _removeContacts(ids) {
	return _idbSrvc.removeContacts(ids)
		.then((ids) => {
			forEach(ids, (id) => _sharedBC.postMessage({
				action: 'app:fiberchannel',
				data: {
					event: 'contacts:deleted:contact',
					data: {
						id
					}
				}
			}));
		});
}

function _removeFolders(ids) {
	return _idbSrvc.removeFolders(ids)
		.then((ids) => {
			forEach(ids, (id) => _sharedBC.postMessage({
				action: 'app:fiberchannel',
				data: {
					event: 'contacts:deleted:folder',
					data: {
						id
					}
				}
			}));
		});
}

function _processSOAPNotifications(syncResponse) {
	const promises = [];
	// First sync will have the folders
	if (syncResponse.folder) promises.push(
		_walkSOAPContactsFolder(syncResponse.folder)
	);
	// Other syncs will have the 'cn' field populated.
	if (syncResponse.cn) promises.push(
		_handleSOAPChanges(syncResponse.cn)
	);
	// Handle the deleted items
	if (syncResponse.deleted && syncResponse.deleted[0].cn) promises.push(
		_removeContacts(syncResponse.deleted[0].cn[0].ids.split(','))
	);
	// Handle the deleted folders
	if (syncResponse.deleted && syncResponse.deleted[0].folder) promises.push(
		_removeFolders(syncResponse.deleted[0].folder[0].ids.split(','))
	);
	return Promise.all(promises);
}

_sharedBC.addEventListener('message', function onMessageOnBC(e) {
	if (!e.data || !e.data.action) return;
	switch(e.data.action) {
		case 'SOAP:notification:handle':
			_processSOAPNotifications(e.data.data)
				.catch(e => console.error(e));
			break;
		case 'sync:operation:completed':
			console.log('sync:operation:completed', e.data.data);
			break;
		case 'sync:operation:error':
			console.log('sync:operation:error', e.data.data);
			break;
	}
});

console.log(`Hello from contacts-sw.js`);

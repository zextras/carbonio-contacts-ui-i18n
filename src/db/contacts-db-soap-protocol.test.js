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
jest.mock('./contacts-db');

import { Contact } from './contact';
import { ContactsDb } from './contacts-db';

import { ContactsDbSoapSyncProtocol } from './contacts-db-soap-sync-protocol';
import { ContactsFolder } from './contacts-folder';

describe('Contacts DB Sync Protocol', () => {
	test('Sync - Empty response', (done) => {
		const dbContext = {
			save: jest.fn().mockImplementation(() => Promise.resolve())
		};
		const response = {
			json: jest.fn().mockImplementation(() => Promise.resolve({
				Body: {
					SyncResponse: {
						md: 1,
						token: 0
					}
				}
			}))
		};
		const fetch = jest.fn().mockImplementation(() => Promise.resolve(response));
		const applyRemoteChanges = jest.fn().mockImplementation(() => Promise.resolve());
		const onChangesAccepted = jest.fn();

		const onError = jest.fn().mockImplementation((error) => {
			done(error);
		});

		const onSuccess = jest.fn().mockImplementation((continuation) => {
			expect(continuation.again).toBeDefined();
			expect(fetch).toHaveBeenCalled();
			expect(applyRemoteChanges).toHaveBeenCalledWith([], 0, false);
			done();
		});

		const db = new ContactsDb();
		const protocol = new ContactsDbSoapSyncProtocol(db, fetch, false);
		protocol.sync(
			dbContext,
			'https://mail.example.com/sync',
			{},
			0,
			1,
			[],
			false,
			applyRemoteChanges,
			onChangesAccepted,
			onSuccess,
			onError
		);
	});

	test('Sync - Error response', (done) => {
		const dbContext = {
			save: jest.fn().mockImplementation(() => Promise.resolve())
		};
		const response = {
			json: jest.fn().mockImplementation(() => Promise.resolve({
				Body: {
					Fault: {
						Reason: {
							Text: 'A generic error.'
						}
					}
				}
			}))
		};
		const fetch = jest.fn().mockImplementation(() => Promise.resolve(response));
		const applyRemoteChanges = jest.fn().mockImplementation(() => Promise.resolve());
		const onChangesAccepted = jest.fn();

		const onError = jest.fn().mockImplementation((error, retry) => {
			expect(fetch).toHaveBeenCalled();
			expect(dbContext.syncDate).toBeUndefined();
			expect(dbContext.save).not.toHaveBeenCalled();
			expect(error.message).toBe('A generic error.');
			expect(retry).toBeDefined();
			done();
		});

		const onSuccess = jest.fn().mockImplementation((continuation) => {
			done(new Error('onSuccess should not have been called.'));
		});

		const db = new ContactsDb();
		const protocol = new ContactsDbSoapSyncProtocol(db, fetch, false);
		protocol.sync(
			dbContext,
			'https://mail.example.com/sync',
			{},
			0,
			1,
			[],
			false,
			applyRemoteChanges,
			onChangesAccepted,
			onSuccess,
			onError
		);
	});

	test('Sync - Initial Sync', (done) => {
		const dbContext = {
			save: jest.fn().mockImplementation(() => Promise.resolve())
		};
		const response = {
			json: jest.fn()
				.mockImplementationOnce(() => Promise.resolve({
					Body: {
						SyncResponse: {
							md: 1,
							token: 1,
							folder: [{
								id: '11',
								folder: [{
									absFolderPath: '/',
									folder: [{
										absFolderPath: '/Contacts',
										cn: [{
											ids: '1000'
										}
										],
										id: '7',
										l: '1',
										name: 'Contacts',
										view: 'contact'
									}
									],
									id: '1',
									l: '11',
									name: 'USER_ROOT'
								}
								]
							}
							],
						}
					}
				}))
				.mockImplementationOnce(() => Promise.resolve({
					Body: {
						GetContactsResponse: {
							cn: [{
								id: '1000',
								l: '7',
								_attrs: {}
							}
							],
						}
					}
				}))
		};
		const fetch = jest.fn().mockImplementation(() => Promise.resolve(response));
		const applyRemoteChanges = jest.fn().mockImplementation(() => Promise.resolve());
		const onChangesAccepted = jest.fn();

		const onError = jest.fn().mockImplementation((error) => {
			done(error);
		});

		const onSuccess = jest.fn().mockImplementation((continuation) => {
			expect(continuation.again).toBeDefined();
			expect(dbContext.save).toHaveBeenCalled();
			expect(fetch).toHaveBeenCalledTimes(2);
			expect(applyRemoteChanges).toHaveBeenCalledWith([{
				type: 1,
				table: 'folders',
				key: undefined,
				obj: new ContactsFolder({
					id: '7',
					name: 'Contacts',
					itemsCount: 0,
					parent: '1',
					path: '/Contacts',
					size: 0,
					unreadCount: 0,
				})
			}, {
				type: 1,
				table: 'contacts',
				key: undefined,
				obj: new Contact({
					parent: '7',
					id: '1000',
					address: {},
					company: '',
					department: '',
					firstName: '',
					image: '',
					jobTitle: '',
					lastName: '',
					email: {},
					nameSuffix: '',
					notes: '',
					namePrefix: '',
					phone: {},
					middleName: '',
					nickName: '',
					URL: {}
				})
			}], 1, false);
			done();
		});

		const db = new ContactsDb();
		const protocol = new ContactsDbSoapSyncProtocol(db, fetch, false);
		protocol.sync(
			dbContext,
			'https://mail.example.com/sync',
			{},
			null,
			null,
			[],
			false,
			applyRemoteChanges,
			onChangesAccepted,
			onSuccess,
			onError
		);
	});

	test('Sync - Create Folder Locally', (done) => {
		const dbContext = {
			save: jest.fn().mockImplementation(() => Promise.resolve())
		};
		const response = {
			json: jest.fn()
				.mockImplementationOnce(() => Promise.resolve({
					Body: {
						BatchResponse: {
							CreateFolderResponse: [{
								requestId: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
								folder: [{
									id: '1000',
									name: 'New Folder',
									absFolderPath: '/New Folder',
									l: '1'
								}
								]
							}
							]
						}
					}
				}))
				.mockImplementationOnce(() => Promise.resolve({
					Body: {
						SyncResponse: {
							md: 1,
							token: 1,
							folder: [{
								absFolderPath: '/New Folder',
								id: '1000',
								l: '1',
								name: 'New Folder',
								view: 'contact'
							}
							],
						}
					}
				}))
		};
		const fetch = jest.fn().mockImplementation(() => Promise.resolve(response));
		const applyRemoteChanges = jest.fn().mockImplementation(() => Promise.resolve());
		const onChangesAccepted = jest.fn();

		const onError = jest.fn().mockImplementation((error) => {
			done(error);
		});

		const onSuccess = jest.fn().mockImplementation((continuation) => {
			expect(continuation.again).toBeDefined();
			expect(dbContext.save).toHaveBeenCalled();
			expect(fetch).toHaveBeenCalledTimes(2);
			expect(applyRemoteChanges).toHaveBeenCalledWith([{
				type: 2,
				table: 'folders',
				key: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
				mods: {
					id: '1000',
					name: 'New Folder',
					parent: '1',
					path: '/New Folder',
				}
			}
			], 1, false);
			done();
		});

		const changes = [{
			type: 1,
			table: 'folders',
			key: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
			obj: {
				name: 'Folder Name',
				parent: '1'
			}
		}];

		const db = new ContactsDb();
		const protocol = new ContactsDbSoapSyncProtocol(db, fetch, false);
		protocol.sync(
			dbContext,
			'https://mail.example.com/sync',
			{},
			2,
			1,
			changes,
			false,
			applyRemoteChanges,
			onChangesAccepted,
			onSuccess,
			onError
		);
	});
});

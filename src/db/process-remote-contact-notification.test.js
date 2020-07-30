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

import processRemoteContactsNotification, { fetchContacts } from './process-remote-contact-notification';
import { ContactsDb } from './contacts-db';
import { Contact } from './contact';

jest.mock('./contacts-db');

describe('Notifications - Contact', () => {
	test('Fetch Contacts', (done) => {
		const _fetch = jest.fn().mockImplementation(() => Promise.resolve({
			json: jest.fn().mockImplementation(() => Promise.resolve({
				Body: {
					GetContactsResponse: {
						cn: [{
							id: '1000',
							_attrs: {}
						}]
					}
				}
			}))
		}));
		fetchContacts(
			_fetch,
			['1000']
		)
			.then((contacts) => {
				expect(_fetch).toHaveBeenCalledTimes(1);
				expect(contacts.length).toBe(1);
				expect(contacts[0]).toBeInstanceOf(Contact);
				expect(contacts[0].id).toBe('1000');
				done();
			})
			.catch((e) => done(e));
	});

	test('Initial Sync', (done) => {
		const db = new ContactsDb();
		const _fetch = jest.fn().mockImplementation(() => Promise.resolve({
			json: jest.fn().mockImplementation(() => Promise.resolve({
				Body: {
					GetContactsResponse: {
						cn: [{
							id: '1000',
							_attrs: {}
						}]
					}
				}
			}))
		}));
		const SyncResponse = {
			md: 1,
			token: 1,
			folder: [{
				id: '11',
				folder: [{
					absFolderPath: '/',
					folder: [{
						absFolderPath: '/Contacts',
						cn: [{
							ids: '1000' // Comma-separated values
						}],
						id: '7',
						l: '1',
						name: 'Contacts',
						view: 'contact'
					}],
					id: '1',
					l: '11',
					name: 'USER_ROOT'
				}]
			}],
		};
		processRemoteContactsNotification(
			_fetch,
			db,
			true,
			[],
			[],
			SyncResponse
		)
			.then((changes) => {
				expect(_fetch).toHaveBeenCalledTimes(1);
				expect(changes.length).toBe(1);
				expect(changes[0].type).toBe(1);
				expect(changes[0].table).toBe('contacts');
				expect(changes[0].key).toBeUndefined();
				expect(changes[0].obj).toBeInstanceOf(Contact);
				done();
			});
	});

	test('Created Contact', (done) => {
		const db = new ContactsDb();
		const _fetch = jest.fn().mockImplementation(() => Promise.resolve({
			json: jest.fn().mockImplementation(() => Promise.resolve({
				Body: {
					GetContactsResponse: {
						cn: [{
							id: '1000',
							_attrs: {}
						}]
					}
				}
			}))
		}));
		const SyncResponse = {
			md: 1,
			token: 1,
			cn: [{
				d: 1,
				id: '1000',
				l: '7',
				md: 1,
				ms: 1,
				rev: 1,
			}],
		};
		processRemoteContactsNotification(
			_fetch,
			db,
			false,
			[],
			[],
			SyncResponse
		)
			.then((changes) => {
				expect(_fetch).toHaveBeenCalledTimes(1);
				expect(changes.length).toBe(1);
				expect(changes[0].type).toBe(1);
				expect(changes[0].table).toBe('contacts');
				expect(changes[0].key).toBeUndefined();
				expect(changes[0].obj).toBeInstanceOf(Contact);
				done();
			});
	});

	test('Updated Contact - Name Updated', (done) => {
		const db = new ContactsDb();
		db.contacts.where.mockImplementation(() => ({
			anyOf: jest.fn().mockImplementation(() => ({
				toArray: jest.fn().mockImplementation(() => Promise.resolve([
					new Contact({
						_id: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
						id: '1000',
						parent: '7',
						firstName: 'Test',
						lastName: 'User'
					}),
				]))
			}))
		}));
		const _fetch = jest.fn().mockImplementation(() => Promise.resolve({
			json: jest.fn().mockImplementation(() => Promise.resolve({
				Body: {
					GetContactsResponse: {
						cn: [{
							id: '1000',
							l: '7',
							_attrs: {
								firstName: 'Updated Test',
								fullName: 'Updated Test, User',
								lastName: 'User'
							}
						}]
					}
				}
			}))
		}));
		const SyncResponse = {
			md: 2,
			token: 2,
			cn: [{
				d: 1,
				id: '1000',
				l: '7',
				md: 2,
				ms: 2,
				rev: 2,
			}],
		};
		processRemoteContactsNotification(
			_fetch,
			db,
			false,
			[],
			[],
			SyncResponse
		)
			.then((changes) => {
				expect(_fetch).toHaveBeenCalledTimes(1);
				expect(changes.length).toBe(1);
				expect(changes[0].type).toBe(2);
				expect(changes[0].table).toBe('contacts');
				expect(changes[0].key).toBe('xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx');
				expect(changes[0].mods).toStrictEqual({
					address: {},
					company: '',
					department: '',
					firstName: 'Updated Test',
					image: '',
					jobTitle: '',
					lastName: 'User',
					email: {},
					namePrefix: '',
					nameSuffix: '',
					notes: '',
					parent: '7',
					phone: {},
					middleName: '',
					nickName: '',
					URL: {}
				});
				done();
			});
	});

	test('Updated Contact - Moved', (done) => {
		const db = new ContactsDb();
		db.contacts.where.mockImplementation(() => ({
			anyOf: jest.fn().mockImplementation(() => ({
				toArray: jest.fn().mockImplementation(() => Promise.resolve([
					new Contact({
						_id: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
						id: '1000',
						parent: '7',
						firstName: 'Test',
						lastName: 'User'
					}),
				]))
			}))
		}));
		const _fetch = jest.fn().mockImplementation(() => Promise.resolve({
			json: jest.fn().mockImplementation(() => Promise.resolve({
				Body: {
					GetContactsResponse: {
						cn: [{
							id: '1000',
							l: '1001',
							_attrs: {}
						}]
					}
				}
			}))
		}));
		const SyncResponse = {
			md: 2,
			token: 2,
			cn: [{
				d: 1,
				id: '1000',
				l: '1001',
				md: 2,
				ms: 2,
				rev: 2,
			}],
		};
		processRemoteContactsNotification(
			_fetch,
			db,
			false,
			[],
			[],
			SyncResponse
		)
			.then((changes) => {
				expect(_fetch).toHaveBeenCalledTimes(1);
				expect(changes.length).toBe(1);
				expect(changes[0].type).toBe(2);
				expect(changes[0].table).toBe('contacts');
				expect(changes[0].key).toBe('xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx');
				expect(changes[0].mods).toStrictEqual({
					address: {},
					company: '',
					department: '',
					firstName: '',
					image: '',
					jobTitle: '',
					lastName: '',
					email: {},
					namePrefix: '',
					nameSuffix: '',
					notes: '',
					parent: '1001',
					phone: {},
					middleName: '',
					nickName: '',
					URL: {}
				});
				done();
			});
	});

	test('Deleted Contact', (done) => {
		const db = new ContactsDb();
		db.contacts.where.mockImplementation(() => ({
			anyOf: jest.fn().mockImplementation(() => ({
				toArray: jest.fn().mockImplementation(() => Promise.resolve([
					new Contact({
						_id: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
						id: '1000',
						parent: '7',
						firstName: 'Test',
						lastName: 'User'
					}),
				]))
			}))
		}));
		const _fetch = jest.fn().mockImplementation(() => Promise.resolve({
			json: jest.fn().mockImplementation(() => Promise.resolve({}))
		}));
		const SyncResponse = {
			md: 2,
			token: 2,
			deleted: [{
				ids: '1000',
				cn: [{
					ids: '1000',
				}]
			}],
		};
		processRemoteContactsNotification(
			_fetch,
			db,
			false,
			[],
			[],
			SyncResponse
		)
			.then((changes) => {
				expect(_fetch).toHaveBeenCalledTimes(0);
				expect(changes.length).toBe(1);
				expect(changes[0].type).toBe(3);
				expect(changes[0].table).toBe('contacts');
				expect(changes[0].key).toBe('xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx');
				done();
			});
	});
});

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

import { ContactsDb } from './contacts-db';
import { ContactsFolder } from './contacts-folder';
import processRemoteFolderNotifications from './process-remote-folder-notifications';

describe('Notifications - Folder', () => {

	test('Initial Sync', (done) => {
		const db = new ContactsDb();
		processRemoteFolderNotifications(
			db,
			true,
			[],
			[],
			{
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
			}
		)
			.then((changes) => {
				expect(changes.length).toBe(1);
				expect(changes[0].type).toBe(1);
				expect(changes[0].table).toBe('folders');
				expect(changes[0].key).toBeUndefined();
				expect(changes[0].obj).toStrictEqual(new ContactsFolder({
					id: '7',
					name: 'Contacts',
					parent: '1',
					path: '/Contacts'
				}));
				done();
			});
	});

	test('New Folder', (done) => {
		const db = new ContactsDb();
		processRemoteFolderNotifications(
			db,
			false,
			[],
			[],
			{
				md: 1,
				token: 1,
				folder: [{
					absFolderPath: '/New Folder',
					id: '1000',
					l: '1',
					name: 'New Folder',
					view: 'contact'
				}],
			}
		)
			.then((changes) => {
				expect(changes.length).toBe(1);
				expect(changes[0].type).toBe(1);
				expect(changes[0].table).toBe('folders');
				expect(changes[0].key).toBeUndefined();
				expect(changes[0].obj).toStrictEqual(new ContactsFolder({
					id: '1000',
					name: 'New Folder',
					parent: '1',
					path: '/New Folder'
				}));
				done();
			});
	});

	test('Updated Folder - Name Changed', (done) => {
		const db = new ContactsDb();
		db.folders.where.mockImplementation(() => {
			return {
				anyOf: jest.fn().mockImplementation(() => {
					return {
						toArray: jest.fn().mockImplementation(() => Promise.resolve([
							new ContactsFolder({
								_id: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
								id: '1000',
								name: 'Folder Name',
								parent: '1',
								path: '/Folder Name'
							}),
						]))
					};
				})
			};
		});
		processRemoteFolderNotifications(
			db,
			false,
			[],
			[],
			{
				md: 1,
				token: 1,
				folder: [{
					absFolderPath: '/New Folder Name',
					id: '1000',
					l: '1',
					name: 'New Folder Name',
					view: 'contact'
				}],
			}
		)
			.then((changes) => {
				expect(changes.length).toBe(1);
				expect(changes[0].type).toBe(2);
				expect(changes[0].table).toBe('folders');
				expect(changes[0].key).toBe('xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx');
				expect(changes[0].mods).toEqual({
					id: '1000',
					itemsCount: 0,
					name: 'New Folder Name',
					parent: '1',
					path: '/New Folder Name',
					size: 0,
					unreadCount: 0
				});
				done();
			});
	});

	test('Deleted Folder - Found locally', (done) => {
		const db = new ContactsDb();
		db.deletions.where.mockImplementation(() => {
			return {
				anyOf: jest.fn().mockImplementation(() => {
					return {
						toArray: jest.fn().mockImplementation(() => Promise.resolve([
							new ContactsFolder({
								_id: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
								id: '1000',
								name: 'Folder Name',
								parent: '1',
								path: '/Folder Name'
							}),
						]))
					};
				})
			};
		});
		processRemoteFolderNotifications(
			db,
			false,
			[],
			[],
			{
				md: 1,
				token: 1,
				deleted: [{
					folder: [{
						ids: '1000'
					}],
					ids: '1000'
				}],
			}
		)
			.then((changes) => {
				expect(changes.length).toBe(1);
				expect(changes[0].type).toBe(3);
				expect(changes[0].table).toBe('folders');
				expect(changes[0].key).toBe('xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx');
				done();
			});
	});

});

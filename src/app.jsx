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

import React, { lazy } from 'react';
import {
	setMainMenuItems,
	setRoutes,
	setCreateOptions,
	setAppContext
} from '@zextras/zapp-shell';
import { ContactsDb } from './v2/db/contacts-db';
import { ContactsDbSoapSyncProtocol } from './v2/db/contacts-db-soap-sync-protocol';
import mainMenuItems from './v2/main-menu-items';

const lazyFolderView = lazy(() => (import(/* webpackChunkName: "folder-view" */ './v2/folder-view')));
const lazyEditView = lazy(() => (import(/* webpackChunkName: "edit-view" */ './v2/edit-view')));
// import { Contact } from './v2/db/contact';
// import { ContactsFolder } from './v2/db/contacts-folder';

export default function app() {
	console.log('Hello from contacts');

	setMainMenuItems([{
		id: 'contacts-main',
		icon: 'PeopleOutline',
		to: '/',
		label: 'Contacts',
		children: []
	}]);

	const db = new ContactsDb();
	const syncProtocol = new ContactsDbSoapSyncProtocol(db, fetch);
	db.registerSyncProtocol('soap-contacts', syncProtocol);
	db.syncable.connect('soap-contacts', '/service/soap/SyncRequest');

	setAppContext({
		db
	});

	db
		.observe(() => db.folders.where({ parent: '1' }).sortBy('name'))
		.subscribe((folders) => mainMenuItems(folders, db));

	// Create a folder
	// setTimeout(
	// 	() => {
	// 		db.open().then((_db) => {
	// 			_db.folders.add(new ContactsFolder({
	// 				parent: '7',
	// 				name: 'TEST',
	// 			})).then((r) => {
	// 				console.log('Added', r);
	// 			});
	// 		});
	// 	},
	// 	5000
	// );

	// Rename a folder
	// setTimeout(
	// 	() => {
	// 		db.open().then((_db) => {
	// 			_db.folders.update(
	// 				"95521c73-3e43-4244-b039-8f2a9bca6cfc",
	// 				{ name: 'TEST 4' }
	// 			).then((r) => {
	// 				console.log('Updated', r);
	// 			});
	// 		});
	// 	},
	// 	5000
	// );

	// Delete a folder
	// setTimeout(
	// 	() => {
	// 		db.open().then((_db) => {
	// 			_db.deleteFolder(new ContactsFolder({
	// 				_id: "d6e6f23d-7434-43cf-b904-c150ea8da748",
	// 				id: '1023043'
	// 			})).then((r) => {
	// 				console.log('Removed', r);
	// 			});
	// 		});
	// 	},
	// 	5000
	// );

	// const toAdd = [];
	// for (let i = 0; i < 10000; i += 1) {
	// 	toAdd.push(new Contact({
	// 		parent: '277',
	// 		address: [],
	// 		company: '',
	// 		department: '',
	// 		mail: [{ mail: `user.${i}@example.com` }],
	// 		firstName: `User ${i}`,
	// 		lastName: '',
	// 		image: '',
	// 		jobTitle: '',
	// 		notes: '',
	// 		phone: [],
	// 		nameSuffix: ''
	// 	}));
	// }
	// db.contacts.bulkAdd(toAdd).then(console.log);

	setRoutes([
		{
			route: '/folder/:folderId',
			view: lazyFolderView
		},
		{
			route: '/',
			view: lazyFolderView
		},
		{
			route: '/edit/:id',
			view: lazyEditView
		},
		{
			route: '/new',
			view: lazyEditView
		}
	]);

	setCreateOptions([{
		id: 'create-contact',
		label: 'New Contact',
		panel: { path: '/new' }
	}]);
}

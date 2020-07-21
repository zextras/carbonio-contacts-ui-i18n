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

const lazyFolderView = lazy(() => (import(/* webpackChunkName: "folder-view" */ './v2/folder/folder-view')));
const lazyEditView = lazy(() => (import(/* webpackChunkName: "edit-view" */ './v2/edit/edit-view')));

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

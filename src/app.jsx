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
	setAppContext,
	network
} from '@zextras/zapp-shell';
import { ContactsDb } from './db/contacts-db';
import { ContactsDbSoapSyncProtocol } from './db/contacts-db-soap-sync-protocol';
import mainMenuItems from './main-menu-items';
import { report } from './commons/report-exception';

const lazyFolderView = lazy(() => (import(/* webpackChunkName: "folder-view" */ './folder/folder-view')));
const lazyEditView = lazy(() => (import(/* webpackChunkName: "edit-view" */ './edit/edit-view')));

export default function app() {
	console.log('Hello from contacts');
	window.onerror = (msg, url, lineNo, columnNo, error) => {
		report(error);
	};
	setMainMenuItems([{
		id: 'contacts-main',
		icon: 'PeopleOutline',
		to: '/',
		label: 'Contacts',
		children: []
	}
	]);

	const db = new ContactsDb();
	const syncProtocol = new ContactsDbSoapSyncProtocol(db, network.soapFetch);
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
		app: {
			boardPath: '/new',
			getPath: () => {
				const splittedLocation = window.top.location.pathname.split('/folder');
				return `${splittedLocation[1] ? `/folder${splittedLocation[1]}` : ''}?edit=new`;
			},
		}
	}
	]);
}

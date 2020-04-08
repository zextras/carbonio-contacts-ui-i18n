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

// import React from 'react';
// import { registerRoute, addMainMenuItem, addCreateMenuItem } from '@zextras/zapp-shell/router';

// import { filter as loFilter, reduce } from 'lodash';
// import { BehaviorSubject } from 'rxjs';
// import App, { ROUTE as mainRoute } from './components/App';
// import ContactsService from './ContactsService';
// import ContactsIdbService from './idb/ContactsIdbService';
// import { registerTranslations } from './i18n/i18n';
// import { ContactsDb } from './idb/ContactsDb';
// import { ContactsDbSOAPSync } from './idb/ContactsDbSOAPSync';

import { setMainMenuItems, setRoutes, setCreateOptions } from '@zextras/zapp-shell';
import { lazy } from 'react';
import { ContactsDb } from './v2/db/contacts-db';
import { ContactsDbSoapSyncProtocol } from './v2/db/contacts-db-soap-sync-protocol';

/*
function _subfolders(
	folders,
	parentId
) {
	return reduce(
		loFilter(
			folders,
			(folder) => folder.parent === parentId
		),
		(acc, folder) => {
			acc.push(
				{
					id: folder._id,
					label: folder.name,
					to: `/contacts/folder/${folder.id}`,
					children: _subfolders(folders, folder.id)
				}
			);
			return acc;
		},
		[]
	);
}

function _foldersToIMainMenuItem(folders) {
	return reduce(
		loFilter(folders, (folder) => folder.parent === '1'),
		(acc, folder) => {
			acc.push(
				{
					icon: 'PeopleOutline',
					id: folder._id,
					label: folder.name,
					to: `/contacts/folder/${folder.id}`,
					children: _subfolders(folders, folder.id)
				}
			);
			return acc;
		},
		[]
	);
}
*/

const lazyFolderView = lazy(() => (import(/* webpackChunkName: "folder-view" */ './v2/folder-view')));
const lazyEditView = lazy(() => (import(/* webpackChunkName: "edit-view" */ './v2/edit-view')));

export default function app() {
	console.log('Hello from contacts');

	const db = new ContactsDb();
	const syncProtocol = new ContactsDbSoapSyncProtocol(db);
	db.registerSyncProtocol('soap-contacts', syncProtocol);
	db.syncable.connect('soap-contacts', '/service/soap/SyncRequest');
	// db.syncable.on('statusChanged', (newStatus, url) => {
	// 	console.log ("Sync Status changed: " + Dexie.Syncable.StatusTexts[newStatus]);
	// });

	setMainMenuItems([{
		id: 'contacts-main',
		icon: 'PeopleOutline',
		to: '/',
		label: 'Contacts',
		children: [
			{
				id: 'folder-7',
				label: 'Contacts',
				to: '/folder/7'
			},
			{
				id: 'folder-4',
				label: 'Mailed Contacts',
				to: '/folder/4'
			},
			{
				id: 'folder-3',
				label: 'Trash',
				to: '/folder/3'
			}
		]
	}]);

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

	/*
	const idbSrvc = new ContactsIdbService();
	const contactSrvc = new ContactsService(
		idbSrvc
	);

	registerTranslations();

	const menuFolders = new BehaviorSubject([]);
	db.observe(() => db.folders.toArray()).subscribe((f) => {
		menuFolders.next(_foldersToIMainMenuItem(f));
	});

	addMainMenuItem(
		'PeopleOutline',
		'Contacts',
		'/contacts/folder/7',
		menuFolders
	);
	// addCreateMenuItem(
	// 	'PersonOutline',
	// 	'Contact',
	// 	'/contacts/folder/Contacts?edit=new'
	// );
	registerRoute(mainRoute, App, { contactSrvc, db });
	*/
}

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

import React from 'react';
import { registerRoute, addMainMenuItem, addCreateMenuItem } from '@zextras/zapp-shell/router';

import { filter as loFilter, reduce } from 'lodash';
import { BehaviorSubject } from 'rxjs';
import App, { ROUTE as mainRoute } from './components/App';
import ContactsService from './ContactsService';
import ContactsIdbService from './idb/ContactsIdbService';
import { registerTranslations } from './i18n/i18n';
import { ContactsDb } from './idb/ContactsDb';
import { ContactsDbSOAPSync } from './idb/ContactsDbSOAPSync';

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

export default function app() {
	const db = new ContactsDb();
	const soapSync = new ContactsDbSOAPSync();
	db.registerSyncProtocol('soap-contacts', soapSync);
	db.syncable.connect('soap-contacts', '/service/soap/SyncRequest');

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
}

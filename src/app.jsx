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
import { serviceWorkerSrvc } from '@zextras/zapp-shell/service';

import App, { ROUTE as mainRoute } from './components/App';
import ContactsService from './ContactsService';
import ContactsIdbService from './idb/ContactsIdbService';
import { registerTranslations } from './i18n/i18n';

export default function app() {
	const idbSrvc = new ContactsIdbService();
	const contactSrvc = new ContactsService(
		idbSrvc
	);
	registerTranslations();
	addMainMenuItem(
		'PeopleOutline',
		'Contacts',
		'/contacts/folder/Contacts',
		contactSrvc.menuFolders
	);
	addCreateMenuItem(
		'PersonOutline',
		'Contact',
		'/contacts/folder/Contacts?edit=new'
	);
	registerRoute(mainRoute, App, { contactSrvc });
	serviceWorkerSrvc.registerAppServiceWorker(
		'contacts-sw.js'
	);
}

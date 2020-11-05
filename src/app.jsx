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

import React, { lazy, useEffect } from 'react';
import {
	setRoutes,
	setCreateOptions,
	store
} from '@zextras/zapp-shell';
import { combineReducers } from '@reduxjs/toolkit';
import syncSliceReducer, { startSync } from './store/sync-slice';
import foldersSliceReducer from './store/folders-slice';
import contactsSliceReducer from './store/contacts-slice';
import mainMenuItems from './main-menu-items';

const lazyFolderView = lazy(() => (import(/* webpackChunkName: "folder-view" */ './folder/folder-view')));
const lazyEditView = lazy(() => (import(/* webpackChunkName: "edit-view" */ './edit/edit-view')));

export default function App() {
	console.log('Hello from contacts');

	useEffect(() => {
		store.setReducer(
			combineReducers({
				folders: foldersSliceReducer,
				sync: syncSliceReducer,
				contacts: contactsSliceReducer
			})
		);
	}, []);

	useEffect(() => {
		store.store.dispatch(startSync());

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
		}]);
	}, []);
	mainMenuItems(store);

	return null;
}

/*
 * *** BEGIN LICENSE BLOCK *****
 * Copyright (C) 2011-2020 Zextras
 *
 * The contents of this file are subject to the ZeXtras EULA;
 * you may not use this file except in compliance with the EULA.
 * You may obtain a copy of the EULA at
 * http://www.zextras.com/zextras-eula.html
 * *** END LICENSE BLOCK *****
 */

import { configureStore } from '@reduxjs/toolkit';
import reducers from './reducers';
import { addContact, fetchContactsByFolderId } from './contacts-slice';

describe('Contact Slice', () => {
	test('Create Contact', async () => {
		const store = configureStore({
			reducer: reducers
		});
		const contact = {
			firstName: 'firstName',
			lastName: 'lastName',
			nickName: 'nickName',
			parent: 7,
			address: '',
			company: 'company',
			department: 'department',
			email: '',
			image: '',
			jobTitle: 'jobTitle',
			notes: 'notes',
			phone: 'phone',
			nameSuffix: 'nameSuffix',
			namePrefix: 'namePrefix',
			URL: ''
		};
		expect(store.getState().sync.status).toEqual('init');
		expect(store.getState().sync.token).toBeUndefined();
		expect(store.getState().contacts.contacts[7]).toBeUndefined();
		await store.dispatch(
			fetchContactsByFolderId(contact.parent)
		);
		//console.log(store.getState().contacts.contacts);
		expect(store.getState().contacts.contacts[7]).toBeDefined();
		expect(store.getState().contacts.contacts[7]).toHaveLength(1);
		await store.dispatch(
			addContact(contact)
		);
		//console.log(store.getState().contacts.contacts);
		expect(store.getState().contacts.contacts[7]).toBeDefined();
		expect(store.getState().contacts.contacts[7]).toHaveLength(2);
	});
});

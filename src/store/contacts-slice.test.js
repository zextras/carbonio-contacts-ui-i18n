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
import faker from 'faker';
import { network } from '@zextras/zapp-shell';
import { useSelector } from 'react-redux';
import reducers from './reducers';
import {
	addContact,
	fetchContactsByFolderId,
	deleteContact,
	modifyContact,
	fetchAndUpdateContacts,
} from './contacts-slice';

describe('Contact Slice', () => {
	describe('Add new Contact', () => {
		test('From App', async () => {
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
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[7]).toHaveLength(1);
			await store.dispatch(
				addContact(contact)
			);
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[7]).toHaveLength(2);
		});

		test('From Board Panel', async () => {
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

			await store.dispatch(
				addContact(contact)
			);
			expect(store.getState().contacts.contacts[7]).toBeUndefined();
		});
	});

	describe('Fetch Contact', () => {
		test('Fetch Contact from Soap - unknown folder', async () => {
			const store = configureStore({
				reducer: reducers
			});
			const ids = ['2982', '2983'];
			const contacts = await store.dispatch(
				fetchAndUpdateContacts(ids)
			);
			expect(contacts.payload).toBeDefined();
			expect(contacts.payload).toHaveLength(2);
			expect(store.getState().contacts.contacts[7]).toBeUndefined();
			expect(store.getState().contacts.contacts).toMatchObject({});
		});

		test('Fetch Contact from Soap - known folder', async () => {
			const store = configureStore({
				reducer: reducers
			});
			const ids = ['2821'];
			await store.dispatch(
				fetchContactsByFolderId('7')
			);
			const previousState = store.getState().contacts.contacts[7][0];
			await store.dispatch(
				fetchAndUpdateContacts(ids)
			);
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[7]).toHaveLength(1);
			expect(previousState).not.toMatchObject(store.getState().contacts.contacts[7][0]);
		});
	});

	describe('Modify Contact', () => {
		test('Update simple fields', async () => {
			const store = configureStore({
				reducer: reducers
			});
			expect(store.getState().contacts.contacts[7]).toBeUndefined();
			await store.dispatch(
				fetchContactsByFolderId('7')
			);
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[7]).toHaveLength(1);
			const prevContact = store.getState().contacts.contacts[7][0];
			const updatedContact = {
				...prevContact,
				company: faker.company.companyName(),
				firstName: faker.name.firstName(),
				lastName: faker.name.lastName(),
			};
			await store.dispatch(
				modifyContact({ prevContact, updatedContact })
			);
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[7]).toHaveLength(1);
			expect(prevContact).not.toMatchObject(store.getState().contacts.contacts[7][0]);
		});

		test('Update complex fields', async () => {
			const store = configureStore({
				reducer: reducers
			});
			expect(store.getState().contacts.contacts[7]).toBeUndefined();
			await store.dispatch(
				fetchContactsByFolderId('7')
			);
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[7]).toHaveLength(1);
			const prevContact = store.getState().contacts.contacts[7][0];
			const updatedContact = {
				...prevContact,
				company: faker.company.companyName(),
				firstName: faker.name.firstName(),
				lastName: faker.name.lastName(),
				address: {
					workAddress: {
						city: faker.address.city(),
						country: faker.address.country(),
						postalCode: faker.address.zipCode(),
						state: faker.address.state(),
						street: faker.address.streetName(),
						type: 'work'
					},
					homeAddress: {
						city: faker.address.city(),
						country: faker.address.country(),
						postalCode: faker.address.zipCode(),
						state: faker.address.state(),
						street: faker.address.streetName(),
						type: 'home'
					}
				},
				phone: {
					homePhone: {
						number: faker.phone.phoneNumber(),
						type: 'home'
					},
					mobilePhone: {
						number: faker.phone.phoneNumber(),
						type: 'mobile'
					},
					mobilePhone2: {
						number: faker.phone.phoneNumber(),
						type: 'mobile'
					}
				},
				URL: {
					homeURL: {
						type: 'home',
						url: faker.internet.url()
					},
					otherURL: {
						type: 'other',
						url: faker.internet.url()
					}
				},
				email: {
					email: {
						mail: faker.internet.email()
					},
					email2: {
						mail: faker.internet.email()
					}
				}
			};
			await store.dispatch(
				modifyContact({ prevContact, updatedContact })
			);
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[7]).toHaveLength(1);
			expect(prevContact).not.toMatchObject(store.getState().contacts.contacts[7][0]);
		});
	});

	describe('Delete Contact', () => {
		test('Move in trash - trash folder unknown', async () => {
			const store = configureStore({
				reducer: reducers
			});
			expect(store.getState().contacts.contacts[7]).toBeUndefined();
			await store.dispatch(
				fetchContactsByFolderId('7')
			);
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[7]).toHaveLength(1);
			const contact = store.getState().contacts.contacts[7][0];
			await store.dispatch(
				deleteContact({ contact, parent: contact.parent })
			);
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[3]).toBeUndefined();
			expect(store.getState().contacts.contacts[7]).toHaveLength(0);
		});

		test('Move in trash - trash folder known', async () => {
			const store = configureStore({
				reducer: reducers
			});

			expect(store.getState().contacts.contacts[7]).toBeUndefined();
			expect(store.getState().contacts.contacts[3]).toBeUndefined();
			await store.dispatch(
				fetchContactsByFolderId('7')
			);
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[3]).toBeUndefined();
			await store.dispatch(
				fetchContactsByFolderId('3')
			);
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[3]).toBeDefined();
			expect(store.getState().contacts.contacts[7]).toHaveLength(1);
			expect(store.getState().contacts.contacts[3]).toHaveLength(0);
			await store.dispatch(
				deleteContact({ contact: store.getState().contacts.contacts[7][0], parent: store.getState().contacts.contacts[7][0].parent })
			);
			expect(store.getState().contacts.contacts[7]).toHaveLength(0);
			expect(store.getState().contacts.contacts[3]).toHaveLength(1);
		});

		test('Delete permanently', async () => {
			const store = configureStore({
				reducer: reducers
			});
			expect(store.getState().contacts.contacts[7]).toBeUndefined();
			expect(store.getState().contacts.contacts[3]).toBeUndefined();

			await store.dispatch(
				fetchContactsByFolderId('7')
			);
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[3]).toBeUndefined();

			await store.dispatch(
				fetchContactsByFolderId('3')
			);
			expect(store.getState().contacts.contacts[7]).toBeDefined();
			expect(store.getState().contacts.contacts[3]).toBeDefined();
			expect(store.getState().contacts.contacts[7]).toHaveLength(1);
			expect(store.getState().contacts.contacts[3]).toHaveLength(0);
			const contact = store.getState().contacts.contacts[7][0]
			await store.dispatch(
				deleteContact({ contact, parent: contact.parent })
			);
			expect(store.getState().contacts.contacts[7]).toHaveLength(0);
			expect(store.getState().contacts.contacts[3]).toHaveLength(1);

			await store.dispatch(
				deleteContact({ contact: store.getState().contacts.contacts[3][0], parent: store.getState().contacts.contacts[3][0].parent })
			);
			expect(store.getState().contacts.contacts[7]).toHaveLength(0);
			expect(store.getState().contacts.contacts[3]).toHaveLength(0);
		});
	});
});

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
import processLocalContactChange from './process-local-contact-change';
import { Contact } from './contact';

describe('Local Changes - Contact', () => {
	test('Create a Contact', (done) => {
		const db = new ContactsDb();
		const response = {
			json: jest.fn()
				.mockImplementationOnce(() => Promise.resolve({
					Body: {
						BatchResponse: {
							CreateContactResponse: [{
								requestId: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
								cn: [{
									id: '1000',
									l: '7',
									_attrs: {
										firstName: 'Test',
										lastName: 'User'
									}
								}]
							}]
						}
					}
				}))
				.mockImplementationOnce({
					Body: {
						SyncResponse: { // TODO: FixMe!
							md: 1,
							token: 1,
							cn: [{
								id: '1000',
							}],
						}
					}
				})
		};
		const fetch = jest.fn().mockImplementation(() => Promise.resolve(response));
		processLocalContactChange(
			db,
			[{
				type: 1,
				table: 'contacts',
				key: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
				obj: {
					parent: '7',
					firstName: 'Test',
					lastName: 'User'
				}
			}],
			fetch
		).then(
			(additionalChanges) => {
				expect(additionalChanges.length).toBe(1);
				expect(additionalChanges[0]).toStrictEqual({
					key: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
					mods: {
						id: '1000',
					},
					table: 'contacts',
					type: 2
				});
				expect(fetch).toHaveBeenCalledTimes(1);
				expect(fetch).toHaveBeenCalledWith(
					'/service/soap/BatchRequest',
					{
						method: 'POST',
						body: JSON.stringify({
							Body: {
								BatchRequest: {
									_jsns: 'urn:zimbra',
									onerror: 'continue',
									CreateContactRequest: [{
										_jsns: 'urn:zimbraMail',
										requestId: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
										cn: {
											m: [],
											l: '7',
											a: [
												{ n: 'firstName', _content: 'Test' },
												{ n: 'lastName', _content: 'User' }
											]
										}
									}]
								}
							}
						})
					}
				);
				done();
			}
		);
	});

	test('Modify a Contact', (done) => {
		const db = new ContactsDb();
		db.contacts.where.mockImplementation(() => ({
			anyOf: jest.fn().mockImplementation(() => ({
				toArray: jest.fn().mockImplementation(() => Promise.resolve([
					new Contact({
						_id: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
						id: '1000'
					})
				]))
			}))
		}));
		const response = {
			json: jest.fn()
				.mockImplementationOnce(() => Promise.resolve({
					Body: {
						BatchResponse: {
							ModifyContactResponse: [{
								requestId: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
								cn: [{
									id: '1000',
									l: '7',
									d: 1,
									fileAsStr: 'Updated User, Test',
									rev: 1,
								}]
							}]
						}
					}
				}))
				.mockImplementationOnce({
					Body: {
						SyncResponse: { // TODO: FixMe!
							md: 1,
							token: 1,
							cn: [{
								id: '1000',
							}],
						}
					}
				})
		};
		const fetch = jest.fn().mockImplementation(() => Promise.resolve(response));
		processLocalContactChange(
			db,
			[{
				type: 2,
				table: 'contacts',
				key: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
				mods: {
					firstName: 'Updated Test',
					lastName: 'User'
				}
			}],
			fetch
		).then(
			(additionalChanges) => {
				expect(additionalChanges.length).toBe(0);
				expect(fetch).toHaveBeenCalledTimes(1);
				expect(fetch).toHaveBeenCalledWith(
					'/service/soap/BatchRequest',
					{
						method: 'POST',
						body: JSON.stringify({
							Body: {
								BatchRequest: {
									_jsns: 'urn:zimbra',
									onerror: 'continue',
									ModifyContactRequest: [{
										_jsns: 'urn:zimbraMail',
										requestId: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
										force: '1',
										replace: '0',
										cn: {
											id: '1000',
											m: [],
											a: [
												{ n: 'firstName', _content: 'Updated Test' },
												{ n: 'lastName', _content: 'User' }
											]
										}
									}]
								}
							}
						})
					}
				);
				done();
			}
		);
	});

	test('Move a Contact', (done) => {
		const db = new ContactsDb();
		db.contacts.where.mockImplementation(() => ({
			anyOf: jest.fn().mockImplementation(() => ({
				toArray: jest.fn().mockImplementation(() => Promise.resolve([
					new Contact({
						_id: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
						id: '1000'
					})
				]))
			}))
		}));
		const response = {
			json: jest.fn()
				.mockImplementationOnce(() => Promise.resolve({
					Body: {
						BatchResponse: {
							ContactActionResponse: [{
								requestId: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
								action: {
									id: '1000',
									op: 'move'
								}
							}]
						}
					}
				}))
				.mockImplementationOnce({
					Body: {
						SyncResponse: { // TODO: FixMe!
							md: 1,
							token: 1,
							cn: [{
								id: '1000',
							}],
						}
					}
				})
		};
		const fetch = jest.fn().mockImplementation(() => Promise.resolve(response));
		processLocalContactChange(
			db,
			[{
				type: 2,
				table: 'contacts',
				key: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
				mods: {
					parent: '1001',
				}
			}],
			fetch
		).then(
			(additionalChanges) => {
				expect(additionalChanges.length).toBe(0);
				expect(fetch).toHaveBeenCalledTimes(1);
				expect(fetch).toHaveBeenCalledWith(
					'/service/soap/BatchRequest',
					{
						method: 'POST',
						body: JSON.stringify({
							Body: {
								BatchRequest: {
									_jsns: 'urn:zimbra',
									onerror: 'continue',
									ContactActionRequest: [{
										_jsns: 'urn:zimbraMail',
										requestId: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
										action: {
											op: 'move',
											id: '1000',
											l: '1001'
										}
									}]
								}
							}
						})
					}
				);
				done();
			}
		);
	});

	test('Delete a Contact', (done) => {
		const db = new ContactsDb();
		const anyOf = jest.fn().mockImplementation(() => ({
			toArray: jest.fn().mockImplementation(() => Promise.resolve([{
				rowId: 'yyyyyyyy-yyyy-Myyy-Nyyy-yyyyyyyyyyyy',
				_id: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
				id: '1000',
				table: 'contacts',
			}]))
		}));
		db.deletions.where.mockImplementation(() => ({
			anyOf
		}));
		const response = {
			json: jest.fn()
				.mockImplementationOnce(() => Promise.resolve({
					Body: {
						BatchResponse: {
							ContactActionResponse: [{
								requestId: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
								action: {
									op: 'delete',
									id: '1000'
								}
							}]
						}
					}
				}))
				.mockImplementationOnce({
					Body: {
						SyncResponse: { // TODO: FixMe!
							md: 1,
							token: 1,
							cn: [{
								id: '1000',
							}],
						}
					}
				})
		};
		const fetch = jest.fn().mockImplementation(() => Promise.resolve(response));
		processLocalContactChange(
			db,
			[{
				type: 3,
				table: 'contacts',
				key: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
			}],
			fetch
		).then(
			(additionalChanges) => {
				expect(anyOf).toHaveBeenCalledWith(['xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx']);
				expect(additionalChanges.length).toBe(1);
				expect(additionalChanges[0]).toStrictEqual({
					key: 'yyyyyyyy-yyyy-Myyy-Nyyy-yyyyyyyyyyyy',
					table: 'deletions',
					type: 3
				});
				expect(fetch).toHaveBeenCalledTimes(1);
				expect(fetch).toHaveBeenCalledWith(
					'/service/soap/BatchRequest',
					{
						method: 'POST',
						body: JSON.stringify({
							Body: {
								BatchRequest: {
									_jsns: 'urn:zimbra',
									onerror: 'continue',
									ContactActionRequest: [{
										_jsns: 'urn:zimbraMail',
										requestId: 'xxxxxxxx-xxxx-Mxxx-Nxxx-xxxxxxxxxxxx',
										action: {
											op: 'delete',
											id: '1000',
										}
									}]
								}
							}
						})
					}
				);
				done();
			}
		);
	});
});

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

import React from 'react';
import { act, screen, getByTestId } from '@testing-library/react';
import { testUtils } from '@zextras/zapp-shell';
import FolderView from './folder-view';
import reducers from '../store/reducers';
import { populateContactSlice } from '../mocks/populate-contacts-slice';

jest.mock('react-virtualized', () => {
	const ReactVirtualized = jest.requireActual('react-virtualized');
	return {
		...ReactVirtualized,
		AutoSizer: ({
			children,
		}) => children({ height: 1000, width: 1000 }),
	};
});

describe('Folder view', () => {
	test('Render an empty list', async () => {
		const ctxt = {};
		testUtils.render(
			<FolderView
				folderId={'7'}
			/>,
			{
				ctxt,
				reducer: reducers,
				preloadedState: {
					folders: {
						status: 'succeeded',
						folders: {
							7: {
								name: 'Contacts',
								id: '7',
								path: '/Contacts',
								unreadCount: 0,
								parent: '1'
							}
						}
					},
					sync: {
						status: 'idle',
						intervalId: 5,
						token: '1'
					},
					contacts: {
						status: 'succeeded',
						contacts: populateContactSlice(7, 0)
					}
				}
			}
		);
		// screen.debug();
		expect(ctxt.current.store.getState()).toMatchSnapshot();
	});

	test('Render populated folder list ', async () => {
		const ctxt = {};
		const folderId = 7;
		const itemsCount = 10;

		testUtils.render(
			<FolderView
				folderId={folderId}
			/>,
			{
				ctxt,
				reducer: reducers,
				preloadedState: {
					folders: {
						status: 'succeeded',
						folders: {
							[folderId]: {
								id: folderId,
								itemsCount,
								name: 'Contacts',
								parent: '1',
								path: '/Contacts',
								size: 0,
								unreadCount: 0
							}
						}
					},
					sync: {
						status: 'idle',
						intervalId: 5,
						token: '1'
					},
					contacts: {
						status: 'succeeded',
						contacts: populateContactSlice(folderId, itemsCount)
					}
				}
			}
		);
		for (let i = 0; i < itemsCount; i += 1) {
			const contact = ctxt.current.store.getState().contacts.contacts[folderId][i];

			expect(screen.getByTestId(contact.id)).toBeInTheDocument();
			expect(screen.getByTestId(contact.id)).toBeVisible();
			expect(screen.getByTestId(contact.id)).not.toBeEmptyDOMElement();
			expect(screen.getByTestId(contact.id)).toHaveTextContent(contact.firstName);
			expect(screen.getByTestId(contact.id)).toHaveTextContent(contact.lastName);
			expect(screen.getByTestId(contact.id)).not.toHaveTextContent(contact.company);
		}
	});
});

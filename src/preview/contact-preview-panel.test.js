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

import { test as shellTestEnv } from '@zextras/zapp-shell';
import React from 'react';
import { screen } from '@testing-library/react';
import reducers from '../store/reducers';
import { populateContactSlice } from '../mocks/populate-contacts-slice';
import ContactPreviewPanel from './contact-preview-panel';

describe('Preview Panel', () => {
	test('Render preview', async () => {
		const ctxt = {};
		const folderId = 7;
		const itemsCount = 1;

		shellTestEnv.render(
			<ContactPreviewPanel
				contactInternalId='2000'
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
						contacts: populateContactSlice(7, 1, '2000')
					}
				}
			}
		);

		const contact = ctxt.current.store.getState().contacts.contacts[folderId][0];

		expect(screen.getByTestId('PreviewPanel')).toBeInTheDocument();
		expect(screen.getByTestId('PreviewPanel')).toBeVisible();
		expect(screen.getByTestId('PreviewPanel')).not.toBeEmptyDOMElement();
		expect(screen.getByTestId('PreviewPanel')).toHaveTextContent(contact.firstName);
		expect(screen.getByTestId('PreviewPanel')).toHaveTextContent(contact.lastName);
		expect(screen.getByTestId('PreviewPanel')).toHaveTextContent(contact.company);
		expect(screen.getByTestId('PreviewPanel')).toHaveTextContent(contact.department);
		expect(screen.getByTestId('PreviewPanel')).toHaveTextContent(contact.nameSuffix);
		expect(screen.getByTestId('PreviewPanel')).toHaveTextContent(contact.namePrefix);
	});
});

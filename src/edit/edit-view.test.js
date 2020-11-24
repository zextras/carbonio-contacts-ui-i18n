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
import { screen } from '@testing-library/react';
import { test as shellTestEnv } from '@zextras/zapp-shell';
import reducers from '../store/reducers';
import ContactEditPanel from './contact-edit-panel';
import { populateContactSlice } from '../mocks/populate-contacts-slice';



jest.mock('react-i18next', () => ({
	// this mock makes sure any components using the translate hook can use it without a warning being shown
	useTranslation: () => {
		return {
			t: (str) => str,
			i18n: {
				changeLanguage: () => new Promise(() => {}),
			},
		};
	}
}));

describe('Edit view', () => {
	test('Render editView', async () => {
		const ctxt = {};
		const folderId = 7;
		const itemsCount = 1;

		shellTestEnv.render(
			<ContactEditPanel
				editPanelId='2000'
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
						contacts: populateContactSlice(7,1)
					}
				}
			}
		);
		screen.debug();
	});
});

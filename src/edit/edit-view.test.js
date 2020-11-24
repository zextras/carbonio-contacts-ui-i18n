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
import { test as shellTestEnv } from '@zextras/zapp-shell';
import faker from 'faker';
import reducers from '../store/reducers';

import ContactEditPanel from './contact-edit-panel';

jest.mock('react-virtualized', () => {
	const ReactVirtualized = jest.requireActual('react-virtualized');
	return {
		...ReactVirtualized,
		AutoSizer: ({
			children,
		}) => children({ height: 1000, width: 1000 }),
	};
});

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
						contacts: {
							7: [
								{
									parent: '7',
									id: '2000',
									address: {},
									company: faker.company.companyName(),
									department: faker.commerce.department(),
									email: faker.internet.email(),
									firstName: faker.name.firstName(),
									middleName: '',
									lastName: faker.name.lastName(),
									nickName: faker.internet.userName(),
									image: '',
									jobTitle: faker.name.jobTitle(),
									notes: '',
									phone: {},
									nameSuffix: faker.name.suffix(),
									namePrefix: faker.name.prefix(),
									URL: {}
								}
							]
						}
					}
				}
			}
		);
		screen.debug();
	});
});

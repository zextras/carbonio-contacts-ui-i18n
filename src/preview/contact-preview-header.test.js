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
import faker from 'faker';
import { screen } from '@testing-library/react';
import { test as shellTestEnv } from '@zextras/zapp-shell';
import ContactPreviewHeader from './contact-preview-header';

describe('Contact Preview Header', () => {
	test('Render a contact header', async () => {
		const displayName = `${faker.name.firstName()} ${faker.name.lastName()}`;
		const ctxt = {};
		shellTestEnv.render(
			<ContactPreviewHeader
				displayName={displayName}
			/>,
			{ ctxt }
		);
		// Uncomment this line to see the DOM content.
		// screen.debug();
		expect(screen.getByText(displayName)).toBeInTheDocument();
	});
});

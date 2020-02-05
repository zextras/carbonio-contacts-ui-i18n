/*
 * *** BEGIN LICENSE BLOCK *****
 * Copyright (C) 2011-2019 ZeXtras
 *
 * The contents of this file are subject to the ZeXtras EULA;
 * you may not use this file except in compliance with the EULA.
 * You may obtain a copy of the EULA at
 * http://www.zextras.com/zextras-eula.html
 * *** END LICENSE BLOCK *****
 */

import React from 'react';
import { Container, Text, useScreenMode, Responsive } from '@zextras/zapp-ui';
import { useLocation } from 'react-router-dom';
import ContactList from './contactList/ContactList';

export const ROUTE = '/contacts/folder/:path*';

function useQuery() {
	return new URLSearchParams(useLocation().search);
}

export default function App({ contactSrvc }) {
	const screenMode = useScreenMode();
	const query = useQuery();
	const view = query.get('view');
	const edit = query.get('edit');
	return (
		<Container
			orientation="horizontal"
			width="fill"
			height="fill"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
		>
			<Container
				orientation="vertical"
				width={screenMode === 'desktop' ? '50%' : 'fill'}
				height="fill"
				mainAlignment="flex-start"
			>
				<ContactList contactSrvc={contactSrvc} />
			</Container>
			<Responsive mode="desktop">
				<Container orientation="vertical" width="50%" height="fill" mainAlignment="flex-start">
					<Text>
						{`viewing: ${view}, `}
						{`editing: ${edit}`}
					</Text>
				</Container>
			</Responsive>
		</Container>
	);
};

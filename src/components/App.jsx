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

import React from 'react';
import {
	Container,
	Text,
	useScreenMode,
	Responsive
} from '@zextras/zapp-ui';
import { useLocation } from 'react-router-dom';
import ContactList from './list/ContactList';
import ContactPreview from './preview/ContactPreview';

export const ROUTE = '/contacts/folder/:path*';

function useQuery() {
	return new URLSearchParams(useLocation().search);
}

export default function App({ contactSrvc }) {
	const query = useQuery();
	const view = query.get('view');
	const edit = query.get('edit');
	const mobileView = () => {
		if (edit) {
			return <Text>{`Edit: ${edit}`}</Text>;
		}
		if (view) {
			return <ContactPreview contactSrvc={contactSrvc} id={view} />;
		}
		return <ContactList contactSrvc={contactSrvc} />;
	};
	const sideView = () => {
		if (edit) {
			return <Text>{`Edit: ${edit}`}</Text>;
		}
		if (view) {
			return <ContactPreview contactSrvc={contactSrvc} id={view} />;
		}
		return <Text>Nothing</Text>;
	};
	return (
		<Container
			orientation="horizontal"
			width="fill"
			height="fill"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
		>
			<Responsive mode="desktop">
				<Container
					orientation="vertical"
					width="50%"
					height="fill"
					mainAlignment="flex-start"
				>
					<ContactList contactSrvc={contactSrvc} />
				</Container>
				<Container
					orientation="vertical"
					width="50%"
					height="fill"
					mainAlignment="flex-start"
					padding={{ horizontal: 'medium' }}
					background="bg_9"
				>
					{ sideView() }
				</Container>
			</Responsive>

			<Responsive mode="mobile">
				{ mobileView() }
			</Responsive>
		</Container>
	);
};

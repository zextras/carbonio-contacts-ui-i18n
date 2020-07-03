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

import React, { useMemo } from 'react';
import {
	Container,
	Text,
	useScreenMode,
	Responsive
} from '@zextras/zapp-ui';
import { useLocation } from 'react-router-dom';
import ContactList from './list/ContactList';
import ContactPreview from './preview/ContactPreview';
import ContactEditor from './edit/ContactEditor';
import ContactContextProvider from '../contact/ContactContextProvider';
import DexieContactList from './list/DexieContactList';
import DexieContactPreview from './preview/DexieContactPreview';
import useQueryParam from '../hooks/getQueryParam';

export const ROUTE = '/contacts/folder/:id*';

function useQuery() {
	return new URLSearchParams(useLocation().search);
}

export default function App({ contactSrvc, db }) {
	const query = useQuery();
	const view = query.get('view');
	const edit = query.get('edit');

	const previewId = useQueryParam('preview');

	return (
		<ContactContextProvider
			contactSrvc={contactSrvc}
			id={edit || view}
		>
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
						<DexieContactList db={db} />
					</Container>
					<Container
						orientation="vertical"
						width="50%"
						height="fill"
						mainAlignment="flex-start"
						padding={{ horizontal: 'medium' }}
						background="bg_9"
					>
						<SecondaryView edit={edit} view={view} contactSrvc={contactSrvc} db={db} previewId={previewId} />
					</Container>
				</Responsive>
				<Responsive mode="mobile">
					<SecondaryView edit={edit} view={view} contactSrvc={contactSrvc} />
				</Responsive>
			</Container>
		</ContactContextProvider>
	);
};

const SecondaryView = ({ contactSrvc, view, edit, db, previewId }) => {
	const screenMode = useScreenMode();
	const panel = useMemo(() => {
		if (edit) {
			return <ContactEditor contactSrvc={contactSrvc} id={edit} />;
		}
		if (previewId) {
			return <DexieContactPreview db={db} id={previewId} />;
		}
		if (screenMode === 'mobile') {
			return <ContactList contactSrvc={contactSrvc} />;
		}
		return null;
	}, [screenMode, edit, view, contactSrvc]);
	return <>{ panel }</>;
};

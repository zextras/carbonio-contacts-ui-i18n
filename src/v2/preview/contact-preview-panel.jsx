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

import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { hooks } from '@zextras/zapp-shell';
import { useTranslation } from 'react-i18next';
import {
	Container,
	Divider,
	Icon,
	IconButton,
	Padding,
	Text,
	Row
} from '@zextras/zapp-ui';
import { generateDisplayName } from '../contact-list-item';
import ContactPreviewHeader from './contact-preview-header';
import ContactPreviewContent from "./contact-preview-content";
import {useDisplayName} from "../commons/use-display-name";

const _toolbar = styled.div`
	min-height: 50px;
	max-height: 50px;
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
	padding-left: 16px;
	padding-right: 16px;
	
	p {
		margin: 8px;
	}
`;

const _content = styled.div`
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	padding-left: 16px;
	padding-right: 16px;
	padding-bottom: 16px;
`;

export default function ContactPreviewPanel({ contactInternalId, folderId }) {
	const onEdit = hooks.useAddPanelCallback(`/edit/${contactInternalId}`);
	const replaceHistory = hooks.useReplaceHistoryCallback();
	const { db } = hooks.useAppContext();
	const query = useMemo(
		() => () => db.contacts
			.where({ _id: contactInternalId })
			.toArray()
			.then(
				(c) => Promise.resolve(c[0])
			),
		[db, contactInternalId]
	);
	// TODO: Add the sort by
	const [contact, contactLoaded] = hooks.useObserveDb(query, db);
	const onDelete = useCallback(() => {
		db.contacts
			.delete(contactInternalId)
			.then(() => replaceHistory(`/folder/${folderId}`));
	}, [db, contactInternalId, folderId, replaceHistory]);
	const onClose = useCallback(
		() => replaceHistory(`/folder/${folderId}`),
		[folderId, replaceHistory]
	);
	const displayName = useDisplayName(contact);
	return (
		<Container
			width="calc(50% - 4px)"
			mainAlignment="flex-start"
		>
			{contactLoaded && (
				<>
					<ContactPreviewHeader displayName={displayName} onClose={onClose} />
					<ContactPreviewContent
						contact={contact}
						onEdit={onEdit}
						onDelete={onDelete}
					/>
					<Divider />
				</>
			)}
		</Container>
	);
}

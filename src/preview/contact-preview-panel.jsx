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

import React, { useCallback } from 'react';
import { hooks } from '@zextras/zapp-shell';
import { Divider } from '@zextras/zapp-ui';
import { useSelector } from 'react-redux';
import ContactPreviewHeader from './contact-preview-header';
import ContactPreviewContent from './contact-preview-content';
import { useDisplayName } from '../commons/use-display-name';
import { selectContact } from '../store/contacts-slice';

export default function ContactPreviewPanel({ contactInternalId, folderId }) {
	const replaceHistory = hooks.useReplaceHistoryCallback();
	const contact = useSelector((state) => selectContact(state, folderId, contactInternalId));

	const onEdit = useCallback(
		() => replaceHistory(`/folder/${folderId}?edit=${contactInternalId}`),
		[contactInternalId, folderId, replaceHistory]
	);

	const onDelete = useCallback(() => {
		// todo: implement delete
	}, [contactInternalId, folderId, replaceHistory]);

	const onClose = useCallback(
		() => replaceHistory(`/folder/${folderId}`),
		[folderId, replaceHistory]
	);

	const displayName = useDisplayName(contact);

	if (contact && displayName) {
		return (
			<>
				<ContactPreviewHeader displayName={displayName} onClose={onClose} />
				<ContactPreviewContent
					contact={contact}
					onEdit={onEdit}
					onDelete={onDelete}
				/>
				<Divider />
			</>
		);
	}
	return null;
}

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
import { hooks } from '@zextras/zapp-shell';
import { Divider } from '@zextras/zapp-ui';
import ContactPreviewHeader from './contact-preview-header';
import ContactPreviewContent from './contact-preview-content';
import { useDisplayName } from '../commons/use-display-name';

export default function ContactPreviewPanel({ contactInternalId, folderId }) {
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
	const onEdit = useCallback(
		() => replaceHistory(`/edit/${contactInternalId}`),
		[contactInternalId, replaceHistory]
	);
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
	if (contactLoaded) {
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

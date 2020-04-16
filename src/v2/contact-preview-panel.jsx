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
import styled from 'styled-components';
import { hooks } from '@zextras/zapp-shell';
import { reduce } from 'lodash';

const _PreviewPanel = styled.div`
	flex-grow: 1;
	display: flex;
	flex-direction: column;
`;

const _toolbar = styled.div`
	min-height: 50px;
	max-height: 50px;
	display: flex;
	flex-direction: row;
	justify-content: flex-end;
	padding-left: 16px;
	padding-right: 16px;
`;

const _content = styled.div`
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	padding-left: 16px;
	padding-right: 16px;
	padding-bottom: 16px;
`;

export default function ContactPreviewPanel({ contactInternalId }) {
	const onEdit = hooks.useAddPanelCallback(`/edit/${contactInternalId}`);
	const { db } = hooks.useAppContext();
	const query = useMemo(() =>
		() => db.contacts
			.where({ _id: contactInternalId })
			.toArray()
			.then(
				(c) => Promise.resolve(c[0])
			),
		[db, contactInternalId]
	);
	// TODO: Add the sort by
	const [contact, contactLoaded] = hooks.useObserveDb(query, db);

	return (
		<_PreviewPanel>
			<_toolbar>
				<p onClick={onEdit} style={{ cursor: 'pointer' }}>Edit</p>
			</_toolbar>
			{contactLoaded && <_content>
				<div>
					First Name: {contact.firstName}
				</div>
				<div>
					Last Name: {contact.lastName}
				</div>
				<div>
					Mail addresses:
				</div>
				{ reduce(
						contact.mail,
					(r, v, k) => {
							r.push((<div key={v.mail}>{v.mail}</div>));
							return r;
					},
					[]
				)}
			</_content>}
		</_PreviewPanel>
	);
}

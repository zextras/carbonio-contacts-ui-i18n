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

import React, { useCallback, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { hooks } from '@zextras/zapp-shell';
import styled from 'styled-components';
import {
	AutoSizer,
	CellMeasurerCache,
	List
} from 'react-virtualized';
import ContactListItem from './contact-list-item';
import useQueryParam from '../hooks/getQueryParam';
import ContactPreviewPanel from './preview/contact-preview-panel';
import {Container, Divider, Text} from "@zextras/zapp-ui";
import Row from "@zextras/zapp-ui/dist/components/layout/Row";
import {VerticalDivider} from "./commons/vertical-divider";

const cache = new CellMeasurerCache({
	fixedWidth: true,
	defaultHeight: 57
});

function Breadcrumbs({ folderId }) {
	const { db } = hooks.useAppContext();
	const query = useMemo(
		() => () => db.folders.where({ id: folderId }).toArray()
			.then((folders) => Promise.resolve(folders[0])),
		[db, folderId]
	);
	// TODO: Add the sort by
	const [folder, folderLoaded] = hooks.useObserveDb(query, db);

	return (
		<Container
			background="gray5"
			height={49}
			crossAlignment="flex-start"
		>
			<Row
				height={48}
				padding={{ all: 'medium' }}
			>
				<Text size="large">{ folderLoaded && folder && folder.path }</Text>
			</Row>
			<Divider />
		</Container>
	);
}
Breadcrumbs.propTypes = {
	folderId: PropTypes.string.isRequired
};

export default function FolderView() {
	let { folderId } = useParams();
	if (!folderId) {
		folderId = '7'; // '/Contacts'
	}

	const previewId = useQueryParam('preview');

	const { db } = hooks.useAppContext();
	const query = useMemo(
		() => () =>
			db.contacts
				.where({ parent: folderId })
				.sortBy('firstName'),
		[db, folderId]
	);
	// TODO: Add the sort by
	const [contacts, contactsLoaded] = hooks.useObserveDb(query, db);

	const rowRenderer = useCallback(
		({
			index,
			key,
			style
		}) => (
			<ContactListItem
				key={key}
				style={style}
				contact={contacts[index]}
			/>
		),
		[contacts, cache]
	);

	console.log('Contacts', contactsLoaded, (contacts || []).length, contacts || []);

	return (
		<Container
			orientation="row"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			width="fill"
			height="fill"
			background="gray5"
			borderRadius="none"
		>
			<Container
				width="calc(50% - 4px)"
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				borderRadius="none"
			>
				<Breadcrumbs folderId={folderId} />
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					borderRadius="none"
				>
					<AutoSizer>
						{({ height, width }) => (
							<List
								height={height}
								width={width}
								rowCount={(contacts || []).length}
								overscanRowCount={10}
								rowHeight={57}
								rowRenderer={rowRenderer}
							/>
						)}
					</AutoSizer>
				</Container>
			</Container>
			<VerticalDivider />
			{ typeof previewId !== 'undefined' && (
				<ContactPreviewPanel contactInternalId={previewId} folderId={folderId} />
			)}
		</Container>
	);
}

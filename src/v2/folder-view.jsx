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
import ContactPreviewPanel from './contact-preview-panel';

const ViewContainer = styled.div`
	flex-grow: 1;
	display: flex;
	flex-direction: row;
`;

const SecondaryBar = styled.div`
	display: flex;
	flex-direction: column;
	height: 100%;
	flex-grow: 1;
`;

const ListContainer = styled.div`
	flex-grow: 1;
`;

const cache = new CellMeasurerCache({
	fixedWidth: true,
	defaultHeight: 68
});

function Breadcrumbs({ folderId }) {
	const { db } = hooks.useAppContext();
	const query = useMemo(() => () => db.folders.where({ id: folderId }).toArray().then((folders) => Promise.resolve(folders[0])), [db, folderId]);
	// TODO: Add the sort by
	const [folder, folderLoaded] = hooks.useObserveDb(query, db);

	return (
		<div>
			{ folderLoaded && folder.path }
		</div>
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
		<ViewContainer>
			<SecondaryBar>
				<Breadcrumbs folderId={folderId} />
				<ListContainer>
					<AutoSizer>
						{({ height, width }) => (
							<List
								height={height}
								width={width}
								rowCount={(contacts || []).length}
								overscanRowCount={10}
								rowHeight={68}
								rowRenderer={rowRenderer}
							/>
						)}
					</AutoSizer>
				</ListContainer>
			</SecondaryBar>
			{ typeof previewId !== 'undefined' && (
				<ContactPreviewPanel contactInternalId={previewId} />
			)}
		</ViewContainer>
	);
}

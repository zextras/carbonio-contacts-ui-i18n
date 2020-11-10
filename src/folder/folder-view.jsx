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

import React, { useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import {
	AutoSizer,
	CellMeasurerCache,
	List
} from 'react-virtualized';
import {
	Container,
	Divider,
	Text,
	useScreenMode
} from '@zextras/zapp-ui';
import Row from '@zextras/zapp-ui/dist/components/layout/Row';
import Responsive from '@zextras/zapp-ui/dist/components/utilities/Responsive';
import { useDispatch, useSelector } from 'react-redux';
import ContactListItem from './contact-list-item';
import useQueryParam from '../hooks/getQueryParam';
import ContactPreviewPanel from '../preview/contact-preview-panel';
import { VerticalDivider } from '../commons/vertical-divider';
import ContactEditPanel from '../edit/contact-edit-panel';
import { fetchContactsByFolderId, selectAllContactsInFolder } from '../store/contacts-slice';
import { selectFolder } from '../store/folders-slice';

const cache = new CellMeasurerCache({
	fixedWidth: true,
	defaultHeight: 57
});

function Breadcrumbs({ folderId }) {
	const folder = useSelector((state) => selectFolder(state, folderId));
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
				<Text size="large">{ folder && folder.path }</Text>
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
		folderId = '7';
	}

	const screen = useScreenMode();
	const previewId = useQueryParam('preview');
	const editId = useQueryParam('edit');
	const MemoPanel = useMemo(() => {
		if (editId) {
			return (
				<ContactEditPanel
					key={`contactEdit-${editId}`}
					editPanelId={editId}
					folderId={folderId}
				/>
			);
		}
		if (previewId) {
			return (
				<ContactPreviewPanel
					key={`contactPreview-${previewId}`}
					contactInternalId={previewId}
					folderId={folderId}
				/>
			);
		}
		if (screen === 'mobile') {
			return (
				<ContactList
					key={`contactList-${folderId}`}
					folderId={folderId}
				/>
			);
		}
		return <Container />;
	}, [editId, folderId, previewId, screen]);

	return (
		<Container
			orientation="row"
			crossAlignment="flex-start"
			mainAlignment="flex-start"
			width="fill"
			height="fill"
			background="gray5"
			borderRadius="none"
			style={{
				maxHeight: '100%',
				overflowY: 'auto'
			}}
		>
			<Responsive mode="desktop" target={window.top}>
				<Container
					width="calc(50% - 4px)"
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					borderRadius="none"
				>
					<ContactList
						key={`contactList-${folderId}`}
						folderId={folderId}
					/>
				</Container>
				<VerticalDivider />
				<Container
					width="calc(50% - 4px)"
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					borderRadius="none"
				>
					{MemoPanel}
				</Container>
			</Responsive>
			<Responsive mode="mobile" target={window.top}>
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					borderRadius="none"
					height="fill"
				>
					{MemoPanel}
				</Container>
			</Responsive>
		</Container>
	);
}

const ContactList = ({ folderId }) => {
	const dispatch = useDispatch();
	const contacts = useSelector((state) => selectAllContactsInFolder(state, folderId));

	useEffect(() => {
		if (!contacts) {
			dispatch(fetchContactsByFolderId(folderId));
		}
	}, [contacts, folderId]);

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
		[contacts]
	);

	if ((contacts || []).length) {
		return (
			<>
				<Breadcrumbs folderId={folderId} />
				<Container
					mainAlignment="flex-start"
					crossAlignment="flex-start"
					borderRadius="none"
				>
					<AutoSizer>
						{ ({ height, width }) => (
							<List
								height={height}
								width={width}
								rowCount={(contacts || []).length}
								overscanRowCount={10}
								rowHeight={57}
								rowRenderer={rowRenderer}
								style={{ outline: 'none' }}
							/>
						) }
					</AutoSizer>
				</Container>
			</>
		);
	}
	return <Container />;
};

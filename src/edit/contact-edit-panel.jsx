import React, { useCallback } from 'react';
import { hooks } from '@zextras/zapp-shell';
import {
	Container,
	Divider,
	Icon,
	IconButton,
	Padding,
	Row,
	Text
} from '@zextras/zapp-ui';
import { useTranslation } from 'react-i18next';
import EditView from './edit-view';

function ContactEditHeader({ editPanelId, folderId }) {
	const { t } = useTranslation();
	const replaceHistory = hooks.useReplaceHistoryCallback();

	const onClose = useCallback(
		() => replaceHistory(`/folder/${folderId}`),
		[folderId, replaceHistory]
	);

	return (
		<Container
			height={49}
		>
			<Container
				orientation="horizontal"
				mainAlignment="flex-start"
				height={48}
				padding={{ left: 'large', right: 'large' }}
			>
				<Padding right="medium">
					<Icon size="medium" icon="EditOutline" />
				</Padding>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="medium">
						{ t(editPanelId && editPanelId !== 'new' ? 'Edit Contact' : 'New Contact') }
					</Text>
				</Row>
				<IconButton icon="Close" size="small" onClick={onClose} />
			</Container>
			<Divider />
		</Container>
	);
}

export default function ContactEditPanel({ editPanelId, folderId }) {
	return (
		<>
			<ContactEditHeader editPanelId={editPanelId} folderId={folderId} />
			<Container height="fit" style={{ maxHeight: '100%', overflowY: 'auto' }}>
				<EditView panel editPanelId={editPanelId} folderId={folderId} />
			</Container>
		</>
	);
}

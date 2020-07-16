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
import EditView from './edit-view';
import {useTranslation} from "react-i18next";

export default function ContactEditPanel({ editPanelId, folderId }) {

	return (
		<>
			<ContactEditHeader folderId={folderId} />
				<Container height="fit" style={{ maxHeight: '100%', overflowY: 'auto' }}>
					<EditView panel editPanelId={editPanelId} folderId={folderId} />
				</Container>
		</>
	)
};

const ContactEditHeader = ({ folderId }) => {
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
			>
				<Padding all="medium"><Icon size="large" icon="EditOutline"/></Padding>
				<Row takeAvailableSpace mainAlignment="flex-start">
					<Text size="large">
						{t('Edit Contact')}
					</Text>
				</Row>
				<IconButton icon="Close" size="large" onClick={onClose}/>
			</Container>
			<Divider/>
		</Container>
	);
}

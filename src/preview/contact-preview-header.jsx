import React from 'react';
import {
	Container, Divider, Icon, IconButton, Padding, Text, Row
} from '@zextras/zapp-ui';

const ContactPreviewHeader = ({ displayName, onClose }) => (
	<Container
		height={49}
	>
		<Container
			orientation="horizontal"
			mainAlignment="flex-start"
			height={48}
		>
			<Padding all="medium"><Icon size="large" icon="PersonOutline" /></Padding>
			<Row takeAvailableSpace mainAlignment="flex-start"><Text size="large">{displayName}</Text></Row>
			<IconButton icon="Close" size="large" onClick={onClose} />
		</Container>
		<Divider />
	</Container>
);

export default ContactPreviewHeader;

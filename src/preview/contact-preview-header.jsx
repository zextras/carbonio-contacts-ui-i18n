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
			padding={{ left: 'large', right: 'large' }}
		>
			<Padding right="medium"><Icon size="medium" icon="PeopleOutline" /></Padding>
			<Row takeAvailableSpace mainAlignment="flex-start"><Text size="medium">{displayName}</Text></Row>
			<IconButton icon="Close" size="small" onClick={onClose} />
		</Container>
		<Divider />
	</Container>
);

export default ContactPreviewHeader;

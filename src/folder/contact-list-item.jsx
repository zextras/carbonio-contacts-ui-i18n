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
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import {
	Avatar,
	Container,
	Text,
	Row,
	Divider,
	Padding
} from '@zextras/zapp-ui';
import { trim } from 'lodash';
import { useDisplayName } from '../commons/use-display-name';

const InvisibleLink = styled(Link)`
	text-decoration: none; /* no underline */
	width: 100%;
	height: 100%;
`;

export default function ContactListItem({ contact, style }) {
	const displayName = useDisplayName(contact);
	const secondaryRow = useMemo(
		() => trim(`${
			Object.values(contact.email).length > 0
				? Object.values(contact.email)[0].mail
				: ''
		}, ${
			Object.values(contact.phone).length > 0
				? Object.values(contact.phone)[0].number
				: ''
		}`, ', '),
		[contact]
	);
	return (
		<Container style={style}>
			<InvisibleLink to={`/folder/${contact.parent}?preview=${contact.id}`}>
				<Container
					borderRadius="none"
					height="fill"
					background="gray6"
					orientation="horizontal"
					data-testid={contact.id}
				>
					<Padding all="medium">
						<Avatar
							label={`${contact.firstName} ${contact.lastName}`}
							picture={contact.image}
						/>
					</Padding>
					<Container
						width="fill"
						mainAlignment="center"
						crossAlignment="flex-start"
					>
						<Row width="fill" mainAlignment="flex-start" padding={{ vertical: 'extrasmall' }}>
							<Text size="large">{displayName}</Text>
						</Row>
						<Row width="fill" mainAlignment="flex-start">
							<Text color="secondary">
								{secondaryRow}
							</Text>
						</Row>
					</Container>
				</Container>
			</InvisibleLink>
			<Divider />
		</Container>
	);
}

ContactListItem.propTypes = {
	// eslint-disable-next-line react/forbid-prop-types,react/require-default-props
	style: PropTypes.any,
	// eslint-disable-next-line react/forbid-prop-types
	contact: PropTypes.any.isRequired /* instanceOf(Contact) */ // todo: modify this
};

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
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Contact } from './db/contact';
import { Link } from 'react-router-dom';

const Container = styled.div`
	height: 68px;
	cursor: pointer;
	a {
		padding: 16px;
		display: flex;
		flex-direction: row;
	}
`;

const Avatar = styled.div`
	min-width: 24px;
	max-width: 24px;
	min-height: 24px;
	max-height: 24px;
	border-radius: 50%;
	background-color: coral;
	display: flex;
	align-content: center;
	justify-content: center;
	margin-right: 8px;
`;

const Data = styled.div`
	flex-grow: 1;
	display: flex;
	flex-direction: column;
`;

const NameContainer = styled.div``;
const MailContainer = styled.div``;

export default function ContactListItem({ contact, style }) {
	return (
		<Container
			style={style}
		>
			<Link to={`/folder/${contact.parent}?preview=${contact._id}`}>
				<Avatar>
					{ (contact.firstName || '  ').substr(0, 2).toUpperCase() }
				</Avatar>
				<Data>
					<NameContainer>
						<span>{ contact.firstName }</span> <span>{ contact.lastName }</span>
					</NameContainer>
					<MailContainer>
						{ (contact.mail || []).length > 0 && contact.mail[0].mail }
					</MailContainer>
				</Data>
			</Link>
		</Container>
	);
}

ContactListItem.propTypes = {
	className: PropTypes.string,
	style: PropTypes.any,
	contact: PropTypes.instanceOf(Contact).isRequired
};

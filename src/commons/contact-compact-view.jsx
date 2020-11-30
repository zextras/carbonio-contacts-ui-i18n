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

import {
	Avatar, IconButton, Row, Text
} from '@zextras/zapp-ui';
import { trim } from 'lodash';
import React, { useMemo } from 'react';
import { useDisplayName } from './use-display-name';

export const CompactView = ({ contact, toggleOpen, open }) => {
	const displayName = useDisplayName(contact);
	const displayMailAndPhone = useMemo(
		() => trim(`${
			Object.values(contact.email).length > 0
				? Object.values(contact.email)[0].mail
				: ''
		}, ${
			Object.values(contact.phone).length > 0
				? Object.values(contact.phone)[0].number
				: ''
		}`, ', '),
		[contact.email, contact.phone]
	);
	return (
		<Row
			width="fill"
			height="fit"
			mainAlignment="flex-start"
		>
			<Avatar
				label={`${contact.firstName} ${contact.lastName}`}
				picture={contact.image}
				size="large"
				fallbackIcon="EmailOutline"
			/>
			<Row
				orientation="vertical"
				takeAvailableSpace
				mainAlignment="center"
				crossAlignment="flex-start"
				padding={{ horizontal: 'large', vertical: 'small' }}
				height="fill"
			>
				<Text
					size="large"
					weight="bold"
				>
					{displayName}
				</Text>
				<Text
					weight="bold"
					color="secondary"
				>
					{
						trim(`${
							contact.jobTitle && `${contact.jobTitle}, `
						} ${
							contact.department && `${contact.department}, `
						} ${
							contact.company && `${contact.company}, `
						}`, ', ')
					}
				</Text>
				<Text
					color="secondary"
				>
					{displayMailAndPhone}
				</Text>
			</Row>
			{toggleOpen && (
				<IconButton
					size="medium"
					onClick={toggleOpen}
					icon={open ? 'ArrowIosUpward' : 'ArrowIosDownward'}
				/>
			)}
		</Row>
	);
};

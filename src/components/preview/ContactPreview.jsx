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

import React, {
	useContext,
	useEffect,
	useState
} from 'react';
import { distinctUntilChanged } from 'rxjs/operators';
import { map, pick } from 'lodash';
import { useHistory } from 'react-router-dom';
import {
	Container,
	IconButton,
	Text,
	Avatar,
	Divider,
	Padding
} from '@zextras/zapp-ui';
import { I18nCtxt } from '@zextras/zapp-shell/context';
import { addToQuery, deleteFromQuery } from '../../utils/utils';
import ContactContext from '../../contact/ContactContext';

function useObservable(observable) {
	const [value, setValue] = useState(observable.value);
	useEffect(() => {
		const sub = observable.pipe(distinctUntilChanged()).subscribe(setValue);
		return () => sub.unsubscribe();
	}, [observable]);
	return value;
}

export default function ContactPreview({ contactSrvc, id }) {
	const history = useHistory();
	const { t } = useContext(I18nCtxt);
	const { contact } = useContext(ContactContext);
	const actions = [
		{
			label: 'Edit',
			icon: 'Edit',
			click: () => history.push({
				search: addToQuery(history.location.search, 'edit', contact.id)
			})
		},
		{
			label: 'Delete',
			icon: 'TrashOutline',
			click: () => {
				history.push({
					search: deleteFromQuery(history.location.search, 'view')
				});
				contactSrvc.moveContactToTrash(contact.id);
			}
		},
	];
	return (
		<Container
			background="bg_7"
			mainAlignment="flex-start"
			height="fit"
		>
			<Container
				orientation="horizontal"
				padding={{ horizontal: 'large', vertical: 'small' }}
				width="fill"
				mainAlignment="space-between"
			>
				<Avatar
					label={`${contact.firstName} ${contact.lastName}`}
					picture={contact.image}
					size="medium"
				/>
				<Container
					width="fill"
					padding={{
						left: 'medium'
					}}
					orientation="horizontal"
					mainAlignment="space-between"
				>
					<Text
						size="large"
						weight="medium"
					>
						{`${
							contact.nameSuffix ? contact.nameSuffix : ''
						} ${
							contact.firstName
						} ${
							contact.lastName
						}`}
					</Text>
					<IconButton
						icon="Close"
						onClick={() => history.push({
							search: deleteFromQuery(history.location.search, 'view')
						})}
					/>
				</Container>
			</Container>
			<Divider style={{ minHeight: '1px' }} />
			<Container
				padding={{ all: 'large' }}
				orientation="vertical"
				mainAlignment="flex-start"
				crossAlignment="flex-start"
			>
				<Container
					orientation="horizontal"
					padding={{ bottom: 'large' }}
					mainAlignment="flex-start"
				>
					<Avatar
						label={`${contact.firstName} ${contact.lastName}`}
						picture={contact.image}
						size="large"
					/>
					<Container
						width={`calc(100% - 64px - ${actions.length * 40}px)`}
						padding={{ horizontal: 'large' }}
						crossAlignment="flex-start"
						style={{
							maxWidth: `calc(100% + 64px + ${actions.length * 40}px)`
						}}
					>
						<Text size="large">
							{`${
								contact.nameSuffix ? contact.nameSuffix : ''
							} ${
								contact.firstName
							} ${
								contact.lastName
							}`}
						</Text>
						<Text size="medium">
							{contact.jobTitle}
						</Text>
						<Text size="medium">
							{contact.company}
						</Text>
					</Container>
					<Container mainAlignment="flex-end" orientation="horizontal" width="fit">
						{ map(
							actions,
							(action, index) => (
								<IconButton
									key={`${index}-${action.label}`}
									onClick={action.click}
									icon={action.icon}
									label={action.label}
									iconColor="txt_2"
								/>
							)
						)}
					</Container>
				</Container>
				{ map(
					pick(
						contact,
						[
							'nameSuffix',
							'firstName',
							'lastName',
							'jobTitle',
							'department',
							'company'
						]
					),
					(value, key) => {
						if (value) {
							return (<DataField translator={t} key={key} label={key} value={value} />);
						}
						return null;
					}
				)}
				{
					contact.mail.length > 0 && (
						<Container
							orientation="horizontal"
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							width="fill"
							padding={{ all: 'extrasmall' }}
						>
							<Container
								width="80px"
								height="16px"
								orientation="horizontal"
								mainAlignment="flex-end"
								crossAlignment="flex-end"
								padding={{ right: 'small' }}
							>
								<Text color="txt_4">{t('contact.label.mail.main')}</Text>
							</Container>
							<Container
								width="fit"
								orientation="vertical"
								mainAlignment="flex-start"
								crossAlignment="flex-start"
							>
								{
									map(contact.mail, (mail, key) => (
										<Container
											key={key}
											width="fit"
											orientation="horizontal"
											mainAlignment="flex-start"
											padding={{ bottom: 'extrasmall' }}
										>
											<Text size="large">{mail.mail}</Text>
										</Container>
									))
								}
							</Container>
						</Container>
					)
				}
				{
					contact.phone.length > 0 && (
						<Container
							orientation="horizontal"
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							width="fill"
							padding={{ all: 'extrasmall' }}
						>
							<Container
								width="80px"
								height="16px"
								orientation="horizontal"
								mainAlignment="flex-end"
								crossAlignment="flex-end"
								padding={{ right: 'small' }}
							>
								<Text color="txt_4">{t('contact.label.phone.main')}</Text>
							</Container>
							<Container
								width="fit"
								orientation="vertical"
								mainAlignment="flex-start"
								crossAlignment="flex-start"
							>
								{
									map(contact.phone, (phone, key) => (
										<Container
											key={key}
											width="fit"
											orientation="horizontal"
											mainAlignment="flex-start"
											padding={{ bottom: 'extrasmall' }}
										>
											<Container width="40px" mainAlignment="flex-end" crossAlignment="flex-end">
												<Text color="txt_4">
													{t(`contact.label.phone.${phone.name}`)}
												</Text>
											</Container>
											<Padding horizontal="small">
												<Text size="large">{phone.number}</Text>
											</Padding>
										</Container>
									))
								}
							</Container>
						</Container>
					)
				}
				{
					contact.address.length > 0
					&& map(
						contact.address,
						(address, key) => (
							<Container
								key={key}
								orientation="horizontal"
								mainAlignment="flex-start"
								crossAlignment="flex-start"
								width="fill"
								padding={{ all: 'extrasmall' }}
							>
								<Container
									width="80px"
									height="16px"
									orientation="horizontal"
									mainAlignment="flex-end"
									crossAlignment="flex-end"
									padding={{ right: 'small' }}
								>
									<Text color="txt_4">{t('contact.label.address.main')}</Text>
								</Container>
								<Container
									width="fit"
									orientation="vertical"
									mainAlignment="flex-start"
									crossAlignment="flex-start"
								>
									{
										map(address, (field, fieldKey) => (
											<Container
												key={`${key}-${fieldKey}`}
												width="fit"
												orientation="horizontal"
												mainAlignment="flex-start"
												padding={{ bottom: 'extrasmall' }}
											>
												<Container
													width="40px"
													mainAlignment="flex-end"
													crossAlignment="flex-end"
												>
													<Text color="txt_4">
														{t(`contact.label.address.${fieldKey}`)}
													</Text>
												</Container>
												<Padding horizontal="small">
													<Text size="large">{field}</Text>
												</Padding>
											</Container>
										))
									}
								</Container>
							</Container>
						)
					)
				}
				{
					contact.notes
					&& <DataField translator={t} label="notes" value={contact.notes} />
				}
			</Container>
		</Container>

	);
};

const DataField = ({ label, value, translator }) => (
	<Container
		orientation="horizontal"
		mainAlignment="flex-start"
		crossAlignment="flex-end"
		width="fill"
		padding={{ vertical: 'extrasmall' }}
	>
		<Container
			width="80px"
			orientation="horizontal"
			mainAlignment="flex-end"
			crossAlignment="flex-end"
			padding={{ right: 'small' }}
		>
			<Text color="txt_4">
				{translator(`contact.label.${label}`, label)}
			</Text>
		</Container>
		<Container
			width="fit"
			orientation="horizontal"
			mainAlignment="flex-start"
			crossAlignment="flex-end"
		>
			<Text size="large">
				{value}
			</Text>
		</Container>
	</Container>
);

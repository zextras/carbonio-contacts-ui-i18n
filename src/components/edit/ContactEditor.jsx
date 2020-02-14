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
	useContext, useEffect, useMemo, useRef
} from 'react';
import { useHistory } from 'react-router-dom';
import {
	Button,
	Container,
	IconButton,
	Text,
	Avatar,
	Divider,
	Select,
	Input,
	FormSection,
	FormRow,
	Padding
} from '@zextras/zapp-ui';
import { map, find } from 'lodash';
import { I18nCtxt } from '@zextras/zapp-shell/context';
import { deleteFromQuery } from '../../utils/utils';
import ContactContext from '../../contact/ContactContext';
import { suffixItems, phoneTypeItems } from './editorSelectItems';

export default function ContactEditor() {
	const history = useHistory();
	const { t } = useContext(I18nCtxt);
	const phoneTypes = useMemo(() => phoneTypeItems(t), [t]);
	const suffixes = useMemo(() => suffixItems(t), [t]);
	const {
		contact,
		editContact,
		dispatch,
		save
	} = useContext(ContactContext);
	return (
		<Container
			background="bg_7"
			mainAlignment="flex-start"
			height="fit"
			style={{ maxHeight: '100%' }}
		>
			<Container
				orientation="horizontal"
				padding={{ horizontal: 'large', vertical: 'small' }}
				width="fill"
				height="fit"
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
							search: deleteFromQuery(history.location.search, 'edit')
						})}
					/>
				</Container>
			</Container>
			<Divider style={{ minHeight: '1px' }} />
			<Container
				height="fit"
				style={{ overflowY: 'auto' }}
				padding={{ all: 'large' }}
				orientation="vertical"
				mainAlignment="flex-start"
				crossAlignment="flex-start"
			>
				<Container padding={{ bottom: 'medium' }}>
					<Input
						label={t('contact.label.firstName')}
						backgroundColor="bg_9"
						value={editContact.firstName}
						onChange={(ev) => dispatch({ type: 'edit', next: { firstName: ev.target.value } })}
					/>
				</Container>
				<Container padding={{ bottom: 'medium' }}>
					<Input
						label={t('contact.label.lastName')}
						backgroundColor="bg_9"
						value={editContact.lastName}
						onChange={(ev) => dispatch({ type: 'edit', next: { lastName: ev.target.value } })}
					/>
				</Container>
				<Container padding={{ bottom: 'medium' }} width="50%">
					<Select
						background="bg_9"
						label={t('contact.label.nameSuffix')}
						onChange={(newSuffix) => dispatch({ type: 'edit', next: { nameSuffix: newSuffix } })}
						items={suffixes}
						defaultSelection={find(suffixes, ['value', editContact.nameSuffix])}
					/>
				</Container>
				<Container padding={{ bottom: 'medium' }}>
					<Input
						label={t('contact.label.jobTitle')}
						backgroundColor="bg_9"
						value={editContact.jobTitle}
						onChange={(ev) => dispatch({ type: 'edit', next: { jobTitle: ev.target.value } })}
					/>
				</Container>
				<Container padding={{ bottom: 'medium' }}>
					<Input
						label={t('contact.label.department')}
						backgroundColor="bg_9"
						value={editContact.department}
						onChange={(ev) => dispatch({ type: 'edit', next: { department: ev.target.value } })}
					/>
				</Container>
				<Container padding={{ bottom: 'medium' }}>
					<Input
						label={t('contact.label.company')}
						backgroundColor="bg_9"
						value={editContact.company}
						onChange={(ev) => dispatch({ type: 'edit', next: { company: ev.target.value } })}
					/>
				</Container>
				<FormSection label={t('contact.label.mail.main')} style={{ height: '100%' }}>
					{ map(
						editContact.mail,
						(mail, index) => {
							return (
								<FormRow key={index}>
									<Input
										backgroundColor="bg_9"
										label={t('contact.label.mail.address')}
										value={mail.mail}
										onChange={(ev) => dispatch({type: 'editMail', index, next: {mail: ev.target.value}})}
									/>
									<IconButton icon="TrashOutline" onClick={() => dispatch({type: 'deleteMail', index})}/>
								</FormRow>
							);
						}
					)}
					<FormRow>
						<Input
							backgroundColor="bg_9"
							label={t('contact.label.mail.address')}
							value={editContact.tempMail.mail}
							onChange={(ev) => dispatch({ type: 'editTempMail', temp: { mail: ev.target.value } })}
						/>
						<IconButton icon="Plus" onClick={() => dispatch({ type: 'addMail' })} />
					</FormRow>
				</FormSection>
				<FormSection label={t('contact.label.phone.main')}>
					{ map(
						editContact.phone,
						(phone, index) => (
							<FormRow key={index}>
								<Container width="40%" padding={{ right: 'medium' }}>
									<Select
										background="bg_9"
										label={t('contact.label.phone.type')}
										items={phoneTypes}
										onChange={(value) => dispatch({ type: 'editPhone', index, next: { number: phone.number, name: value } })}
										defaultSelection={find(phoneTypes, ['value', phone.name])}
									/>
								</Container>
								<Input
									backgroundColor="bg_9"
									label={t('contact.label.phone.number')}
									value={phone.number}
									onChange={(ev) => dispatch({ type: 'editPhone', index, next: { number: ev.target.value, name: phone.name } })}
								/>
								<IconButton icon="TrashOutline" onClick={() => dispatch({ type: 'deletePhone', index })} />
							</FormRow>
						)
					)}
					<FormRow>
						<Container width="40%" padding={{ right: 'medium' }}>
							<Select
								background="bg_9"
								label={t('contact.label.phone.type')}
								items={phoneTypes}
								defaultSelection={find(phoneTypes, ['value', editContact.tempPhone.name])}
								onChange={(value) => dispatch({ type: 'editTempPhone', temp: { number: editContact.tempPhone.number, name: value } })}
							/>
						</Container>
						<Input
							backgroundColor="bg_9"
							label={t('contact.label.phone.number')}
							value={editContact.tempPhone.number}
							onChange={(ev) => dispatch({ type: 'editTempPhone', temp: { number: ev.target.value, name: editContact.tempPhone.name } })}
						/>
						<IconButton icon="Plus" onClick={() => dispatch({ type: 'addPhone' })} />
					</FormRow>
				</FormSection>
				{	editContact.address.length > 0
					? (
						<FormSection label={t('contact.label.address.main')}>
							<FormRow>
								<Input
									label={t('contact.label.address.street')}
									backgroundColor="bg_9"
									value={editContact.address[0].street}
									onChange={(ev) => dispatch({type: 'editAddress', next: {street: ev.target.value}})}
								/>
							</FormRow>
							<FormRow>
								<Input
									label={t('contact.label.address.city')}
									backgroundColor="bg_9"
									value={editContact.address[0].city}
									onChange={(ev) => dispatch({type: 'editAddress', next: {city: ev.target.value}})}
								/>
							</FormRow>
							<FormRow>
								<Input
									label={t('contact.label.address.postalCode')}
									backgroundColor="bg_9"
									value={editContact.address[0].postalCode}
									onChange={(ev) => dispatch({type: 'editAddress', next: {postalCode: ev.target.value}})}
								/>
							</FormRow>
							<FormRow>
								<Input
									label={t('contact.label.address.country')}
									backgroundColor="bg_9"
									value={editContact.address[0].country}
									onChange={(ev) => dispatch({type: 'editAddress', next: {country: ev.target.value}})}
								/>
							</FormRow>
							<FormRow>
								<Input
									label={t('contact.label.address.state')}
									backgroundColor="bg_9"
									value={editContact.address[0].state}
									onChange={(ev) => dispatch({type: 'editAddress', next: {state: ev.target.value}})}
								/>
							</FormRow>
						</FormSection>
					)
					: (
						<FormSection label={t('contact.label.address.main')}>
							<FormRow>
								<IconButton icon="Plus" onClick={() => dispatch({ type: 'addAddress' })} />
							</FormRow>
						</FormSection>
					)
				}
				<Container padding={{ bottom: 'medium' }}>
					<Input
						label={t('contact.label.notes')}
						backgroundColor="bg_9"
						value={editContact.notes}
						onChange={(ev) => dispatch({ type: 'edit', next: { notes: ev.target.value } })}
					/>
				</Container>
			</Container>
			<Divider />
			<Container
				mainAlignment="flex-end"
				orientation="horizontal"
				height="fit"
				padding={{
					all: 'medium'
				}}
			>
				<Button
					backgroundColor="bg_4"
					label={t('contact.cancel')}
					onClick={() => history.push({
						search: deleteFromQuery(history.location.search, 'edit')
					})}
				/>
				<Padding left="medium">
					<Button label={t('contact.save')} onClick={save} />
				</Padding>
			</Container>
		</Container>
	);
};

// Hook
function useWhyDidYouUpdate(name, props) {
	// Get a mutable ref object where we can store props ...
	// ... for comparison next time this hook runs.
	const previousProps = useRef();

	useEffect(() => {
		if (previousProps.current) {
			// Get all keys from previous and current props
			const allKeys = Object.keys({ ...previousProps.current, ...props });
			// Use this object to keep track of changed props
			const changesObj = {};
			// Iterate through keys
			allKeys.forEach(key => {
				// If previous is different from current
				if (previousProps.current[key] !== props[key]) {
					// Add to changesObj
					changesObj[key] = {
						from: previousProps.current[key],
						to: props[key]
					};
				}
			});

			// If changesObj not empty then output to console
			if (Object.keys(changesObj).length) {
				console.log('[why-did-you-update]', name, changesObj);
			}
		}

		// Finally update previousProps with current props for next hook call
		previousProps.current = props;
	});
}

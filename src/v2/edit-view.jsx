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
	useCallback,
	useEffect,
	useState
} from 'react';
import { useParams } from 'react-router-dom';
import { hooks } from '@zextras/zapp-shell';
import {
	Formik,
	Field,
	useField,
} from 'formik';
import { useTranslation } from 'react-i18next';
import { map, filter, trim } from 'lodash';
import {
	Button,
	Container,
	Input,
	Row,
	IconButton,
	Padding,
	FormSection,
	Text, Avatar
} from '@zextras/zapp-ui';
import { Contact, ContactAddressType } from './db/contact';
import { CompactView } from './commons/contact-compact-view';

export default function FolderView() {
	const { id } = useParams();
	const { t } = useTranslation();
	const { db } = hooks.useAppContext();
	const pushHistory = hooks.usePushHistoryCallback();

	const [initialContact, setInitialContact] = useState(id
		? null
		: new Contact({
			parent: '7',
			address: [],
			company: '',
			department: '',
			mail: [],
			firstName: '',
			lastName: '',
			image: '',
			jobTitle: '',
			notes: '',
			phone: [],
			nameSuffix: '',
			namePrefix: ''
		}));

	useEffect(() => {
		let canSet = true;
		if (id && db) {
			db.contacts
				.where({ _id: id })
				.toArray()
				.then(
					(c) => canSet && c.length > 0 && setInitialContact(c[0])
				);
		}
		return () => {
			canSet = false;
		};
	}, [id, db, setInitialContact]);

	const onSubmit = useCallback((values, { setSubmitting }) => {
		const contact = new Contact(values);
		console.log('OnSubmit', contact);
		if (!contact._id) {
			db.contacts
				.add(contact)
				.then((cid) => {
					setSubmitting(false);
					return cid;
				})
				.then((cid) => pushHistory(`/edit/${cid}`));
		}
		else {
			db.contacts.update(contact._id, contact)
				.then(() => setSubmitting(false));
		}
	}, [db, pushHistory]);

	const formFactory = useCallback(({ isSubmitting, submitForm }) => (
		<Container padding={{ all: 'medium' }} height="fit">
			<Row
				orientation="horizontal"
				mainAlignment="space-between"
				width="fill"
				wrap="nowrap"
			>
				<Text>{t('This contact will be created in the \'Contacts\' folder')}</Text>
				<Button label={t('Save')} onClick={submitForm} disabled={isSubmitting} />
			</Row>
			<CompactView contact={initialContact} />
			<Row
				orientation="horizontal"
				mainAlignment="space-between"
				width="fill"
				wrap="nowrap"
			>
				<CustomStringField name="namePrefix" label={t('prefix')} />
				<CustomStringField name="firstName" label={t('firstName')} />
				<CustomStringField name="lastName" label={t('lastName')} />
				<CustomStringField name="nameSuffix" label={t('suffix')} />
			</Row>
			<Row
				orientation="horizontal"
				mainAlignment="space-between"
				width="fill"
				wrap="nowrap"
			>
				<CustomStringField name="jobTitle" label={t('jobTitle')} />
				<CustomStringField name="department" label={t('department')} />
				<CustomStringField name="company" label={t('company')} />
			</Row>
			<Row
				orientation="horizontal"
				mainAlignment="space-between"
				width="fill"
				wrap="nowrap"
			>
				<CustomStringField name="notes" label={t('notes')} />
			</Row>
			<CustomMultivalueField
				editInputLabel={t('edit the email address')}
				newInputLabel={t('insert email address')}
				label={t('email address')}
				name="mail"
				subFields="mail"
			/>
			<CustomMultivalueField
				editInputLabel={t('edit the phone contact')}
				newInputLabel={t('insert phone contact')}
				label={t('phone contact')}
				name="phone"
				subFields="number"
			/>
			<CustomMultivalueField
				editInputLabel={t('edit the phone contact')}
				newInputLabel={t('insert phone contact')}
				label={t('addresses')}
				name="address"
				subField="street"
			/>
		</Container>
	), [initialContact, t]);

	return initialContact
		? (
			<Container
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				background="gray6"
				height="fill"
			>
				<Formik
					initialValues={initialContact.toMap()}
					onSubmit={onSubmit}
				>
					{formFactory}
				</Formik>
			</Container>
		)
		: null;
}

const CustomStringField = ({ name, label }) => (
	<Container padding={{ all: 'small' }}>
		<Field name={name} id={name}>
			{
				({ field: { value }, form: { setFieldValue } }) => (
					<Input
						backgroundColor="gray5"
						label={label}
						value={value}
						onChange={(ev) => setFieldValue(name, ev.target.value)}
					/>
				)
			}
		</Field>
	</Container>
);

const CustomMultivalueField = ({
	name, label, subField, editInputLabel, newInputLabel
}) => {
	const [field, meta, helpers] = useField({ name });

	const addValue = useCallback(
		() => {
			helpers.setValue([...field.value, { [subField]: '' }]);
		},
		[helpers, field.value, subField]
	);

	const removeValue = useCallback(
		(index) => {
			helpers.setValue(filter(field.value, (v, i) => i !== index));
		},
		[helpers, field]
	);

	const updateValue = useCallback(
		(newString, index) => {
			if (index >= field.value.length) {
				helpers.setValue([...field.value, { [subField]: newString }]);
				return;
			}
			if (newString === '') {
				removeValue(index);
				return;
			}
			helpers.setValue(
				map(
					field.value,
					(v, i) => (i === index ? { [subField]: newString } : v)
				)
			);
		},
		[field.value, helpers, subField, removeValue]
	);

	if (field.value.length === 0) {
		addValue();
	}

	return (
		<FormSection label={label}>
			{map(
				field.value,
				(item, index) => (
					<Row
						key={index}
						orientation="horizontal"
						mainAlignment="space-between"
						width="fill"
						wrap="nowrap"
					>
						<Input
							backgroundColor="gray5"
							label={item[subField] === '' ? newInputLabel : editInputLabel}
							value={item[subField]}
							onChange={(ev) => updateValue(ev.target.value, index)}
						/>
						<Padding all="small">
							{ index >= field.value.length - 1
								? (
									<Container
										orientation="horizontal"
									>
										<Padding right="small">
											<IconButton
												icon="Plus"
												iconColor="gray6"
												backgroundColor="primary"
												onClick={() => addValue()}
											/>
										</Padding>
										<IconButton
											icon="Minus"
											iconColor="gray6"
											backgroundColor="secondary"
											onClick={() => removeValue(index)}
										/>
									</Container>
								)
								: (
									<IconButton
										icon="Minus"
										iconColor="gray6"
										backgroundColor="secondary"
										onClick={() => removeValue(index)}
									/>
								)}
						</Padding>
					</Row>
				)
			)}
		</FormSection>
	);
};

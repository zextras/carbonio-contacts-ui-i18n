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
	useMemo,
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
import {
	map, filter, reduce, set
} from 'lodash';
import {
	Button,
	Container,
	Input,
	Row,
	IconButton,
	Padding,
	FormSection,
	Text, Select
} from '@zextras/zapp-ui';
import { Contact, ContactAddressType } from '../db/contact';
import { CompactView } from '../commons/contact-compact-view';

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
			mail: [],
			phone: [],
			url: [],
			jobTitle: '',
			department: '',
			namePrefix: '',
			company: '',
			firstName: '',
			middleName: '',
			lastName: '',
			nameSuffix: '',
			image: '',
			notes: ''
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
			<ContactEditorRow>
				<Text>{t('This contact will be created in the \'Contacts\' folder')}</Text>
				<Button label={t('Save')} onClick={submitForm} disabled={isSubmitting} />
			</ContactEditorRow>
			<CompactView contact={initialContact} />
			<ContactEditorRow>
				<CustomStringField name="namePrefix" label={t('prefix')} />
				<CustomStringField name="firstName" label={t('firstName')} />
				<CustomStringField name="middleName" label={t('middleName')} />
			</ContactEditorRow>
			<ContactEditorRow>
				<CustomStringField name="nickName" label={t('nickName')} />
				<CustomStringField name="lastName" label={t('lastName')} />
				<CustomStringField name="nameSuffix" label={t('suffix')} />
			</ContactEditorRow>
			<ContactEditorRow>
				<CustomStringField name="jobTitle" label={t('jobTitle')} />
				<CustomStringField name="department" label={t('department')} />
				<CustomStringField name="company" label={t('company')} />
			</ContactEditorRow>
			<CustomMultivalueField
				name="mail"
				label={t('email address')}
				subFields={['mail']}
				fieldLabels={[t('mail')]}
			/>
			<CustomMultivalueField
				name="phone"
				label={t('phone contact')}
				typeLabel={t('name')}
				typeField="name"
				types={[
					{ label: t('mobile'), value: 'mobile' },
					{ label: t('work'), value: 'work' },
					{ label: t('home'), value: 'home' },
					{ label: t('other'), value: 'other' },
				]}
				subFields={['number']}
				fieldLabels={[t('number')]}
			/>
			<CustomMultivalueField
				name="url"
				label={t('url')}
				typeLabel={t('type')}
				typeField="type"
				types={[
					{ label: t('work'), value: 'work' },
					{ label: t('home'), value: 'home' },
					{ label: t('other'), value: 'other' },
				]}
				subFields={['url']}
				fieldLabels={[t('url')]}
			/>
			<CustomMultivalueField
				name="address"
				label={t('address')}
				typeField="type"
				typeLabel={t('type')}
				types={[
					{ label: t('work'), value: 'work' },
					{ label: t('home'), value: 'home' },
					{ label: t('other'), value: 'other' },
				]}
				subFields={['street', 'city', 'postalCode', 'country', 'state']}
				fieldLabels={[t('street'), t('city'), t('postalCode'), t('country'), t('state')]}
				wrap
			/>
			<ContactEditorRow>
				<CustomStringField name="notes" label={t('notes')} />
			</ContactEditorRow>
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

const ContactEditorRow = ({ children, wrap }) => (
	<Row
		orientation="horizontal"
		mainAlignment="space-between"
		width="fill"
		wrap={wrap || 'nowrap'}
	>
		{children}
	</Row>
);

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
	name,
	label,
	types,
	typeField,
	typeLabel,
	subFields,
	fieldLabels,
	wrap
}) => {
	const [field, meta, helpers] = useField({ name });
	const emptyValue = useMemo(
		() => reduce(
			subFields,
			(acc, val) => set(acc, val, ''),
			typeField ? { [typeField]: types[0].value } : {}
		),
		[subFields]
	);
	const addValue = useCallback(
		() => {
			helpers.setValue([...field.value, emptyValue]);
		},
		[helpers, field.value, emptyValue]
	);

	const removeValue = useCallback(
		(index) => {
			helpers.setValue(filter(field.value, (v, i) => i !== index));
		},
		[helpers, field]
	);

	const updateValue = useCallback(
		(newString, subField, index) => {
			if ((subField === typeField) && (newString === field.value[index][typeField])) {
				return;
			}
			if (index >= field.value.length) {
				if (subField !== typeField) {
					helpers.setValue([...field.value, { ...emptyValue, [subField]: newString }]);
				}
				return;
			}
			if (newString === '' && filter(subFields, (sf) => field.value[sf] !== '').length === 0 && field.value.length > 1) {
				removeValue(index);
				return;
			}
			helpers.setValue(
				map(
					field.value,
					(v, i) => (i === index ? { ...v, [subField]: newString } : v)
				)
			);
		},
		[emptyValue, field.value, helpers, removeValue, subFields, typeField]
	);

	if (field.value.length === 0) {
		addValue();
	}

	return (
		<FormSection label={label}>
			{map(
				field.value,
				(item, index) => (
					<ContactEditorRow wrap={wrap ? 'wrap' : 'nowrap'} key={`${label}${index}`}>
						{map(
							subFields,
							(subField, subIndex) => (
								<Padding
									right="small"
									top="small"
									key={`${fieldLabels[subIndex]}${index}`}
									style={{ width: wrap ? '32%' : '100%', flexGrow: 1 }}
								>
									<Input
										backgroundColor="gray5"
										label={fieldLabels[subIndex]}
										value={item[subField]}
										onChange={(ev) => updateValue(ev.target.value, subField, index)}
									/>
								</Padding>
							)
						)}
						<Container
							style={{ flexGrow: 1 }}
							width="calc(32% + 8px)"
							orientation="horizontal"
							mainAlignment="space-between"
							padding={{ top: 'small', right: 'small' }}
						>
							<Padding
								right="small"
								style={{ width: 'calc(100% - 88px)' }}
							>
								{typeField && typeLabel && types && types.length > 0
								&& (
									<Select
										items={types}
										label={typeLabel}
										onChange={(val) => updateValue(val, typeField, index)}
										defaultSelection={types[0]}
									/>
								)}
							</Padding>
							<Container
								orientation="horizontal"
								mainAlignment="flex-end"
								width="88px"
								style={{ minWidth: '88px' }}
							>
								{ index >= field.value.length - 1
									? (
										<>
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
										</>
									)
									: (
										<IconButton
											icon="Minus"
											iconColor="gray6"
											backgroundColor="secondary"
											onClick={() => removeValue(index)}
										/>
									)}
							</Container>
						</Container>
					</ContactEditorRow>
				)
			)}
		</FormSection>
	);
};

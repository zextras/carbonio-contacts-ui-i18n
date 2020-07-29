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
import { Contact } from '../db/contact';
import { CompactView } from '../commons/contact-compact-view';

const filterEmptyValues = (values) => filter(
	values,
	(value) => filter(
		value,
		(field, key) => key !== 'name' && key !== 'type' && field !== ''
	).length > 0
);

const cleanMultivalueFields = (contact) => ({
	...contact,
	address: filterEmptyValues(contact.address),
	mail: filterEmptyValues(contact.mail),
	phone: filterEmptyValues(contact.phone),
	url: filterEmptyValues(contact.url)
});

export default function EditView({ panel, editPanelId, folderId }) {
	const { id } = useParams();
	const editId = useMemo(() => {
		if (id) return id;
		if (editPanelId) return editPanelId;
		return undefined;
	}, [id, editPanelId]);

	const { t } = useTranslation();
	const { db } = hooks.useAppContext();
	const pushHistory = hooks.usePushHistoryCallback();
	const replaceHistory = hooks.useReplaceHistoryCallback();

	const [initialContact, setInitialContact] = useState(editId && editId !== 'new'
		? null
		: new Contact({
			parent: folderId || '7',
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
		if (editId && editId !== 'new' && db) {
			db.contacts
				.where({ _id: editId })
				.toArray()
				.then(
					(c) => canSet && c.length > 0 && setInitialContact(c[0])
				);
		}
		return () => {
			canSet = false;
		};
	}, [editId, db, setInitialContact]);

	const onSubmit = useCallback((values, { setSubmitting }) => {
		const contact = new Contact(cleanMultivalueFields(values));
		if (!contact._id) {
			db.contacts
				.add(contact)
				.then((cid) => {
					setSubmitting(false);
					return cid;
				})
				.then((cid) => {
					if (panel) {
						replaceHistory(`/folder/${folderId}?preview=${cid}`);
					}
					else {
						pushHistory(`/edit/${cid}`);
					}
				});
		}
		else {
			db.contacts.update(contact._id, contact)
				.then(() => {
					setSubmitting(false);
					if (panel) {
						replaceHistory(`/folder/${folderId}?preview=${contact._id}`);
					}
				});
		}
	}, [db, pushHistory]);

	const defaultTypes = useMemo(() => [
		{ label: t('work'), value: 'work' },
		{ label: t('home'), value: 'home' },
		{ label: t('other'), value: 'other' },
	], [t]);

	const mobileTypes = useMemo(() => [
		{ label: t('mobile'), value: 'mobile' },
		{ label: t('work'), value: 'work' },
		{ label: t('home'), value: 'home' },
		{ label: t('other'), value: 'other' },
	], [t]);

	const formFactory = useCallback(({ isSubmitting, submitForm }) => (
		<Container padding={{ all: 'medium' }} height="fit" crossAlignment="flex-start" background="gray6">
			<Row
				orientation="horizontal"
				mainAlignment="space-between"
				width="fill"
			>
				<Container height="fit" width="fit">{!editId && <Text>{t('This contact will be created in the \'Contacts\' folder')}</Text> }</Container>
				<Button label={t('Save')} onClick={submitForm} disabled={isSubmitting} />
			</Row>
			<Padding all="medium">
				<CompactView contact={initialContact} />
			</Padding>
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
				types={mobileTypes}
				subFields={['number']}
				fieldLabels={[t('number')]}
			/>
			<CustomMultivalueField
				name="url"
				label={t('url')}
				typeLabel={t('type')}
				typeField="type"
				types={defaultTypes}
				subFields={['url']}
				fieldLabels={[t('url')]}
			/>
			<CustomMultivalueField
				name="address"
				label={t('address')}
				typeField="type"
				typeLabel={t('type')}
				types={defaultTypes}
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
			if (subField === typeField && newString === field.value[index][typeField]
			) {
				return;
			}
			if (index >= field.value.length) {
				if (subField !== typeField) {
					helpers.setValue([...field.value, { ...emptyValue, [subField]: newString }]);
				}
				return;
			}
			if (
				newString === ''
				&& filter(subFields, (sf) => sf !== subField && field.value[index][sf] !== '').length === 0
				&& index < field.value.length - 1
			) {
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

	const defaultSelection = useMemo(() => {
		return types && types.length > 0 && types[0];
	}, [types]);

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
							style={{ flexGrow: 1, minWidth: typeField ? '200px' : '104px' }}
							width={typeField ? 'calc(32% + 8px)' : '104px'}
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
										defaultSelection={defaultSelection}
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

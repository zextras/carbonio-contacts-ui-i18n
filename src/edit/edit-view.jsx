import React, {
	useCallback,
	useEffect,
	useMemo,
	useReducer,
	useState,
} from 'react';
import { useParams } from 'react-router-dom';
import { hooks } from '@zextras/zapp-shell';
import { useTranslation } from 'react-i18next';
import {
	map, filter, reduce, set, omit, find
} from 'lodash';
import {
	Button,
	Container,
	Input,
	Row,
	IconButton,
	Padding,
	FormSection,
	Text,
	Select
} from '@zextras/zapp-ui';
import { useDispatch, useSelector } from 'react-redux';
import { nanoid } from '@reduxjs/toolkit';
import { CompactView } from '../commons/contact-compact-view';
import { report } from '../commons/report-exception';
import { addContact, selectContact, modifyContact } from '../store/contacts-slice';

const filterEmptyValues = (values) => reduce(
	values,
	(acc, v, k) => ((
		filter(
			v,
			(field, key) => key !== 'name' && key !== 'type' && field !== ''
		).length > 0
	)
		? { ...acc, [k]: v }
		: acc),
	{}
);

const cleanMultivalueFields = (contact) => ({
	...contact,
	address: filterEmptyValues(contact.address),
	email: filterEmptyValues(contact.email),
	phone: filterEmptyValues(contact.phone),
	URL: filterEmptyValues(contact.URL)
});

const ContactEditorRow = ({ children, wrap }) => (
	<Row
		orientation="horizontal"
		mainAlignment="space-between"
		crossAlignment="flex-start"
		width="fill"
		wrap={wrap || 'nowrap'}
	>
		{children}
	</Row>
);

const CustomStringField = ({ label, value, dispatch }) => (
	<Container padding={{ all: 'small' }}>
		<Input
			backgroundColor="gray5"
			label={label}
			value={value}
			onChange={(ev) => dispatch({ type: 'update', payload: ev.target })}
		/>
	</Container>
);

const capitalize = (lower) => lower.replace(/^\w/, (c) => c.toUpperCase());

const CustomMultivalueField = ({
	name,
	label,
	types,
	typeField,
	typeLabel,
	subFields,
	fieldLabels,
	wrap,
	value,
	dispatch
}) => {
	const [field, setField] = useState({ name, label, types, typeField, typeLabel, subFields, fieldLabels, wrap, value });
	const typeCounts = useMemo(() => reduce(
		types,
		(acc, type, k) => ({
			...acc,
			[type.value]: filter(field.value, (v) => v[typeLabel] === type.value).length
		}),
		{}
	), [field.value, typeLabel, types]);
	console.log(name, field.value, typeCounts);
	const emptyValue = useMemo(
		() => reduce(
			subFields,
			(acc, val) => set(acc, val, ''),
			typeField ? { [typeField]: types[0].value } : {}
		),
		[subFields, typeField, types]
	);

	const generateNewId = useCallback((type) => {
		const substring = `${type}${capitalize(name)}`;
		const recursiveIdIncrement = (candidateId, increment) => {
			if (field.value[candidateId]) {
				return recursiveIdIncrement(`${substring}${increment}`, increment + 1);
			}
			return candidateId;
		};
		return recursiveIdIncrement(`${substring}${typeCounts[type] > 0 ? typeCounts[type] + 1 : ''}`, 2);
	}, [field.value, name, typeCounts]);

	const addValue = useCallback(
		() => {
			setField(
				{
					...field.value,
					[(types && types[0].value)
						? generateNewId(types[0].value)
						: `${name}${Object.values(field.value).length > 0 ? Object.values(field.value).length + 1 : ''}`
					]: emptyValue
				}
			);
		},
		[types, name, typeCounts, setField, field.value, emptyValue]
	);
	const removeValue = useCallback(
		(index) => {
			setField(omit(field.value, [index]));
		},
		[setField, field]
	);
	const updateValue = useCallback(
		(newString, subField, id) => {
			if (newString === field.value[id][subField]) return;
			if (subField === typeField) {
				setField(
					{
						...omit(field.value, [id]),
						[generateNewId(newString)]: {
							...field.value[id],
							type: newString
						}
					}
				);
			}
			else {
				setField({ ...field.value, [id]: { ...field.value[id], [subField]: newString } });
			}
		},
		[field.value, generateNewId, setField, typeField]
	);

	if (Object.values(field.value).length === 0) {
		addValue();
	}

	return (
		<FormSection label={label}>
			{map(
				Object.entries(field.value),
				([id, item], index) => (
					<ContactEditorRow wrap={wrap ? 'wrap' : 'nowrap'} key={`${label}${id}`}>
						{map(
							subFields,
							(subField, subIndex) => (
								<Padding
									right="small"
									top="small"
									key={`${fieldLabels[subIndex]}${id}`}
									style={{ width: wrap ? '32%' : '100%', flexGrow: 1 }}
								>
									<Input
										backgroundColor="gray5"
										label={fieldLabels[subIndex]}
										value={item[subField]}
										onChange={(ev) => updateValue(ev.target.value, subField, id)}
									/>
								</Padding>
							)
						)}
						<Container
							style={{ flexGrow: 1, minWidth: typeField ? '200px' : '104px' }}
							width={typeField ? 'calc(32% + 8px)' : '104px'}
							orientation="horizontal"
							mainAlignment="space-between"
							crossAlignment="flex-start"
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
										onChange={(val) => updateValue(val, typeField, id)}
										defaultSelection={find(types, ['value', field.value[id][typeField]])}
									/>
								)}
							</Padding>
							<Container
								orientation="horizontal"
								mainAlignment="flex-end"
								height="fit"
								width="88px"
								style={{ minWidth: '88px' }}
							>
								{ index >= Object.entries(field.value).length - 1
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
												onClick={() => removeValue(id)}
											/>
										</>
									)
									: (
										<IconButton
											icon="Minus"
											iconColor="gray6"
											backgroundColor="secondary"
											onClick={() => removeValue(id)}
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
function reducer(state, action) {
	switch (action.type) {
		case 'setState':
			return {
				...state,
				...action.payload.editContact
			};
		default:
			return {
				...state,
				[action.payload.name]: action.payload.value
			};
	}
}

export default function EditView({ panel, editPanelId, folderId }) {
	const { id } = useParams();
	const storeDispatch = useDispatch();
	const editContact = useSelector((state) => selectContact(state, folderId, editPanelId));
	const editId = useMemo(() => {
		if (id) return id;
		if (editPanelId) return editPanelId;
		return undefined;
	}, [id, editPanelId]);
	const [contact, dispatch] = useReducer(reducer);
	const { t } = useTranslation();
	const pushHistory = hooks.usePushHistoryCallback();
	const replaceHistory = hooks.useReplaceHistoryCallback();

	const [initialContact, setInitialContact] = useState(editId && editId !== 'new'
		? null
		: {
			parent: folderId || '7',
			address: {},
			email: {},
			phone: {},
			URL: {},
			jobTitle: '',
			department: '',
			namePrefix: '',
			company: '',
			firstName: '',
			middleName: '',
			nickName: '',
			lastName: '',
			nameSuffix: '',
			image: '',
			notes: ''
		});

	useEffect(() => {
		let canSet = true;
		if (editId && editId !== 'new' && editContact) {
			canSet && setInitialContact(editContact);
			dispatch({ type: 'setState', payload: { editContact } });
		}
		return () => {
			canSet = false;
		};
	}, [editId, setInitialContact, editContact]);

	const onSubmit = useCallback(() => {
		const updatedContact = cleanMultivalueFields(contact);
		if (!updatedContact.id) {
			storeDispatch(addContact({
				...updatedContact,
				_id: nanoid()
			}))
				.then((res) => {
					if (panel) {
						replaceHistory(`/folder/${folderId}?preview=${res.payload[0].id}`);
					}
					else {
						pushHistory(`/edit/${res.payload[0].id}`);
					}
				})
				.catch(report);
		}
		else {
			storeDispatch(modifyContact(
				{
					updatedContact,
					editContact
				}
			))
				.then((res) => {
					if (panel) {
						replaceHistory(`/folder/${folderId}?preview=${res.payload[0].id}`);
					}
				})
				.catch(report);
		}
	}, [folderId, panel, pushHistory, replaceHistory, editContact, contact]);

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
	console.log(contact);
	return initialContact && contact
		? (
			<Container
				mainAlignment="flex-start"
				crossAlignment="flex-start"
				background="gray6"
				height="fill"
			>
				<Container padding={{ all: 'medium' }} height="fit" crossAlignment="flex-start" background="gray6" data-testid="EditContact">
					<Row
						orientation="horizontal"
						mainAlignment="space-between"
						width="fill"
					>
						<Container height="fit" width="fit">{!editId && <Text>{t('This contact will be created in the \'Contacts\' folder')}</Text> }</Container>
						<Button label={t('Save')} onClick={onSubmit} disabled={false} />
					</Row>
					<Padding value="medium small">
						<CompactView contact={initialContact} />
					</Padding>
					<ContactEditorRow>
						<CustomStringField name="namePrefix" label={t('namePrefix')} value={contact.namePrefix} dispatch={dispatch}/>
						<CustomStringField name="firstName" label={t('firstName')} value={contact.firstName} dispatch={dispatch}/>
						<CustomStringField name="middleName" label={t('middleName')} value={contact.middleName} dispatch={dispatch}/>
					</ContactEditorRow>
					<ContactEditorRow>
						<CustomStringField name="nickName" label={t('nickName')} value={contact.nickName} dispatch={dispatch}/>
						<CustomStringField name="lastName" label={t('lastName')} value={contact.lastName} dispatch={dispatch}/>
						<CustomStringField name="nameSuffix" label={t('suffix')} value={contact.nameSuffix} dispatch={dispatch}/>
					</ContactEditorRow>
					<ContactEditorRow>
						<CustomStringField name="jobTitle" label={t('jobTitle')} value={contact.jobTitle} dispatch={dispatch}/>
						<CustomStringField name="department" label={t('department')} value={contact.department} dispatch={dispatch}/>
						<CustomStringField name="company" label={t('company')} value={contact.company} dispatch={dispatch}/>
					</ContactEditorRow>
					<CustomMultivalueField
						name="email"
						label={t('email address')}
						subFields={['mail']}
						fieldLabels={[t('mail')]}
						value={contact.email}
						dispatch={dispatch}
					/>
					<CustomMultivalueField
						name="phone"
						label={t('phone contact')}
						typeLabel={t('name')}
						typeField="type"
						types={mobileTypes}
						subFields={['number']}
						fieldLabels={[t('number')]}
						value={contact.phone}
						dispatch={dispatch}
					/>
					<CustomMultivalueField
						name="URL"
						label={t('url')}
						typeLabel={t('type')}
						typeField="type"
						types={defaultTypes}
						subFields={['url']}
						fieldLabels={[t('url')]}
						value={contact.URL}
						dispatch={dispatch}
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
						value={contact.address}
						dispatch={dispatch}
					/>
					<ContactEditorRow>
						<CustomStringField name="notes" label={t('notes')} value={contact.notes} dispatch={dispatch}/>
					</ContactEditorRow>
				</Container>
			</Container>
		)
		: null;
}

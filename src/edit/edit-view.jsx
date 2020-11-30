import React, {
	useCallback,
	useEffect,
	useMemo,
	useReducer
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
import reducer, { op } from '../commons/form-reducer';

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

const CustomStringField = ({ name, label, value, dispatch }) => (
	<Container padding={{ all: 'small' }}>
		<Input
			backgroundColor="gray5"
			inputName={name}
			label={label}
			value={value}
			onChange={(ev) => dispatch({ type: op.setInput, payload: ev.target })}
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
	const typeCounts = useMemo(() => reduce(
		types,
		(acc, type, k) => ({
			...acc,
			[type.value]: filter(value, (v) => v[typeLabel] === type.value).length
		}),
		{}
	), [value, typeLabel, types]);

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
			if (value[candidateId]) {
				return recursiveIdIncrement(`${substring}${increment}`, increment + 1);
			}
			return candidateId;
		};
		return recursiveIdIncrement(`${substring}${typeCounts[type] > 0 ? typeCounts[type] + 1 : ''}`, 2);
	}, [value, name, typeCounts]);

	const addValue = useCallback(
		() => {
			dispatch({
				type: op.updateField,
				payload: {
					...value,
					[(types && types[0].value)
						? generateNewId(types[0].value)
						: `${name}${Object.values(value).length > 0 ? Object.values(value).length + 1 : ''}`
					]: emptyValue
				},
				name
			});
		},
		[types, name, typeCounts, dispatch, value, emptyValue]
	);

	const removeValue = useCallback(
		(index) => {
			dispatch({
				type: op.updateField,
				payload: { ...omit(value, [index]) },
				name
			});
		},
		[dispatch, value]
	);

	const updateValue = useCallback(
		(newString, subField, id) => {
			if (newString === value[id][subField]) return;
			if (subField === typeField) {
				dispatch({
					type: op.updateField,
					payload: {
						...omit(value, [id]),
						[generateNewId(newString)]: {
							...value[id],
							type: newString
						}
					},
					name
				});
			}
			else {
				dispatch({
					type: op.updateField,
					payload: {
						...value,
						[id]: { ...value[id], [subField]: newString }
					},
					name
				});
			}
		},
		[value, generateNewId, dispatch, typeField]
	);
	if (Object.values(value).length === 0) {
		addValue();
	}
	return (
		<FormSection label={label}>
			{map(
				Object.entries(value),
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
										onChange={
											(ev) => dispatch({
												type: op.setSelect,
												payload: {
													ev: ev.target,
													id,
													fieldLabels,
													name,
													subFields
												}
											})
										}
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
										defaultSelection={find(types, ['value', value[id][typeField]])}
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
								{ index >= Object.entries(value).length - 1
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
	const [ t ] = useTranslation();
	const pushHistory = hooks.usePushHistoryCallback();
	const replaceHistory = hooks.useReplaceHistoryCallback();

	useEffect(() => {
		let canSet = true;
		if (editId && editId !== 'new' && editContact) {
			canSet &&	dispatch({ type: op.setEditContact, payload: { editContact } });
		}
		else {
			canSet && dispatch({ type: op.setEmptyContact, payload: {} });
		}
		return () => {
			canSet = false;
		};
	}, [editId, editContact]);

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
		{ label: t('types.work'), value: 'work' },
		{ label: t('types.home'), value: 'home' },
		{ label: t('types.other'), value: 'other' },
	], [t]);

	const mobileTypes = useMemo(() => [
		{ label: t('types.mobile'), value: 'mobile' },
		{ label: t('types.work'), value: 'work' },
		{ label: t('types.home'), value: 'home' },
		{ label: t('types.other'), value: 'other' },
	], [t]);

	return contact
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
						<Button label={t('label.save')} onClick={onSubmit} disabled={false} />
					</Row>
					<Padding value="medium small">
						<CompactView contact={contact} />
					</Padding>
					<ContactEditorRow>
						<CustomStringField name="namePrefix" label={t('name.prefix')} value={contact.namePrefix} dispatch={dispatch}/>
						<CustomStringField name="firstName" label={t('name.first_name')} value={contact.firstName} dispatch={dispatch}/>
						<CustomStringField name="middleName" label={t('name.middle_name')} value={contact.middleName} dispatch={dispatch}/>
					</ContactEditorRow>
					<ContactEditorRow>
						<CustomStringField name="nickName" label={t('name.nickName')} value={contact.nickName} dispatch={dispatch}/>
						<CustomStringField name="lastName" label={t('name.last_name')} value={contact.lastName} dispatch={dispatch}/>
						<CustomStringField name="nameSuffix" label={t('name.suffix')} value={contact.nameSuffix} dispatch={dispatch}/>
					</ContactEditorRow>
					<ContactEditorRow>
						<CustomStringField name="jobTitle" label={t('job.title')} value={contact.jobTitle} dispatch={dispatch}/>
						<CustomStringField name="department" label={t('job.department')} value={contact.department} dispatch={dispatch}/>
						<CustomStringField name="company" label={t('job.company')} value={contact.company} dispatch={dispatch}/>
					</ContactEditorRow>
					<CustomMultivalueField
						name="email"
						label={t('section.title.mail')}
						subFields={['mail']}
						fieldLabels={[t('mail', { count: Object.entries(contact.email).length })]}
						value={contact.email}
						dispatch={dispatch}
					/>
					<CustomMultivalueField
						name="phone"
						label={t('section.title.phone_number')}
						typeLabel={t('select.default')}
						typeField="type"
						types={mobileTypes}
						subFields={['number']}
						fieldLabels={[t('section.field.number'), { count: Object.entries(contact.phone).length }]}
						value={contact.phone}
						dispatch={dispatch}
					/>
					<CustomMultivalueField
						name="URL"
						label={t('section.title.url')}
						typeLabel={t('select.default')}
						typeField="type"
						types={defaultTypes}
						subFields={['url']}
						fieldLabels={[t('section.field.url'), { count: Object.entries(contact.URL).length }]}
						value={contact.URL}
						dispatch={dispatch}
					/>
					<CustomMultivalueField
						name="address"
						label={t('section.title.address')}
						typeField="type"
						typeLabel={t('select.default')}
						types={defaultTypes}
						subFields={['street', 'city', 'postalCode', 'country', 'state']}
						fieldLabels={[t('section.field.street'), t('section.field.city'), t('section.field.postalCode'), t('section.field.country'), t('section.field.state'), { count: Object.entries(contact.address).length }]}
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

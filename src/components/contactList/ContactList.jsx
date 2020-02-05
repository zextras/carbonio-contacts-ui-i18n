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

import React, {useCallback, useEffect, useReducer, useState} from 'react';
import { Container, ListHeader, List } from '@zextras/zapp-ui';
import ContactListItem from './ContactListItem';
import { findIndex, map, reduce, filter, forEach } from 'lodash';
import {useParams, useHistory} from 'react-router-dom';

const addToQuery = (location, param, value) => {
	const query = new URLSearchParams(location.search);
	if (query.has(param)) {
		query.set(param, value);
	}
	else {
		query.append(param, value);
	}
	return query.toString();
};

export default function ContactList({ contactSrvc }) {
	const history = useHistory();
	const { path } = useParams();
	const splitPath = path.split('/');
	const folderId = contactSrvc.getFolderIdByPath(path);
	const breadcrumbs = reduce(splitPath, (acc, crumb, index) => {
		acc.push({
			label: crumb,
			click: () => history.push(`/contacts/folder${
				reduce(splitPath, (to, part, index2) => `${to}${(index2 <= index) ? `/${part}` : ''}`
					, '')}`)
		});
		return acc;
	}, []);

	const filterByPath = (incomingContacts) => filter(
		incomingContacts,
		contact => contact.parent === folderId
	);

	const [amountSelected, setAmountSelected] = useState(0);
	const cReducer = (state, action) => {
		const newState = [...state];
		switch (action.type) {
			case 'update':
				return action.contacts;
			case 'selectAll':
				forEach(newState, c => c.selected = true);
				setAmountSelected(newState.length);
				return newState;
			case 'deselectAll':
				forEach(newState, c => {
					c.selected = false;
				});
				setAmountSelected(0);
				return newState;
			default: break;
		}
		const cIndex = findIndex(state, [['data', 'id'], action.id]);
		switch (action.type) {
			case 'select':
				if (!(newState[cIndex].selected)) {
					newState[cIndex].selected = true;
					setAmountSelected(amountSelected + 1);
				}
				return newState;
			case 'deselect':
				if (newState[cIndex].selected) {
					newState[cIndex].selected = false;
					setAmountSelected(amountSelected - 1);
				}
				return newState;
			default: return state;
		}
	};
	const [contacts, dispatch] = useReducer(cReducer, []);

	const extendList = useCallback((baseContacts) => map(baseContacts, (baseContact) => {
		const index = findIndex(contacts, ['id', baseContact.id]);
		if (index >= 0) {
			return {
				...contacts[index],
				data: {
					...contacts[index].data,
					...baseContact,
				}
			};
		}
		return {
			data: { ...baseContact },
			selected: false,
			actions: [
				{
					label: 'Edit',
					icon:	'EditOutline',
					click: (ev) => {
						ev.stopPropagation();
						history.push({
							search: addToQuery(history.location, 'edit', baseContact.id)
						});
					}
				},
				{
					label: 'Delete',
					icon: 'Trash2Outline',
					click: (ev) => {
						ev.stopPropagation();
						contactSrvc.moveContactToTrash(baseContact.id);
					}
				}
			],
			onSelect: () => dispatch({ type: 'select', id: baseContact.id }),
			onDeselect: () => dispatch({ type: 'deselect', id: baseContact.id }),
		};
	}), [contacts]);

	useEffect(() => {
		const sub = contactSrvc.contacts.subscribe((newContacts) => {
			dispatch({ type: 'update', contacts: extendList(filterByPath(newContacts)) });
		});
		return () => {
			sub.unsubscribe();
		};
	}, [contactSrvc.contacts]);

	const itemFactory = c => ({index}) => {
		return (
			<>
				{ c && c.length > 0
				&& <ContactListItem
					contact={c[index].data}
					actions={c[index].actions}
					selected={c[index].selected}
					onSelect={c[index].onSelect}
					onDeselect={c[index].onDeselect}
					onClick={() => history.push({
						search: addToQuery(history.location, 'view', c[index].data.id)
					})}
				/>}
			</>
		);
	};

	const groupActions = [
		{
			label: 'Edit',
			icon:	'EditOutline',
			click: console.log
		},
		{
			label: 'Delete',
			icon: 'Trash2Outline',
			click: console.log
		}
	];
	return (
		<Container
			orientation="vertical"
			width="fill"
			height="fill"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
		>
			<Container
				orientation="vertical"
				width="fill"
				height="40px"
				background="bg_9"
				style={{
					minHeight: '40px'
				}}
			>
				<ListHeader
					breadCrumbs={breadcrumbs}
					actionStack={amountSelected > 0 ? groupActions : []}
					selecting={amountSelected > 0}
					onSelectAll={() => dispatch({type: 'selectAll'})}
					onDeselectAll={() => dispatch({type: 'deselectAll'})}
					onBackClick={() => history.goBack()}
					allSelected={amountSelected === contacts.length}
				/>
			</Container>
			{
				contacts.length > 0 &&
				<List
					Factory={itemFactory(contacts)}
					amount={contacts.length}
				/>
			}
		</Container>
	);
};

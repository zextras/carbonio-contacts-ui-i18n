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

import React, { useCallback, useEffect, useState } from 'react';
import { Container, List, ListHeader } from '@zextras/zapp-ui';
import { useParams } from 'react-router-dom';
import { find } from 'lodash';
import DexieContactListItem from './DexieContactListItem';

function generateBreadCrumbData(f) {
	return {
		id: f._id,
		label: f.name,
		click: () => history.push(`/contacts/folder/${f.id}`)
	};
}

function calculateBreadcrumbs(folders, currentId) {
	if (!currentId || currentId === '1') return [];
	const current = find(folders, ['id', currentId]);
	if (!current) return [];
	return [...calculateBreadcrumbs(folders, current.parent), generateBreadCrumbData(current)];
}

export default function DexieContactList({ db }) {
	const { id } = useParams();
	const [contacts, setContacts] = useState([]);
	const [breadCrumbs, setBreadCrumbs] = useState([]);

	useEffect(() => {
		setContacts([]);
		let s = db.observe(
			() => db.contacts
				.where({ parent: id })
				.sortBy('email')
		)
			.subscribe((cns) => {
				setContacts(cns);
			});
		return () => {
			s.unsubscribe();
		};
	}, [db, id, setContacts]);

	useEffect(() => {
		setBreadCrumbs([]);
		let s = db.observe(
			() => db.folders.toArray()
		)
			.subscribe((folders) => {
				setBreadCrumbs(calculateBreadcrumbs(folders, id));
			});
		return () => {
			s.unsubscribe();
		};
	}, [db, id, setBreadCrumbs]);

	// const breadcrumbs = reduce(splitPath, (acc, crumb, index) => {
	// 	acc.push({
	// 		id: `${index}-${crumb}`,
	// 		label: crumb,
	// 		click: () => history.push(`/contacts/folder${
	// 			reduce(
	// 				splitPath,
	// 				(to, part, index2) => `${to}${(index2 <= index) ? `/${part}` : ''}`,
	// 				''
	// 			)}`)
	// 	});
	// 	return acc;
	// }, []);
	//
	// const filterByPath = (incomingContacts) => filter(
	// 	incomingContacts,
	// 	(contact) => contact.parent === folderId
	// );
	//
	// const [amountSelected, setAmountSelected] = useState(0);
	// const cReducer = (state, action) => {
	// 	const newState = [...state];
	// 	switch (action.type) {
	// 		case 'update':
	// 			return action.contacts;
	// 		case 'selectAll':
	// 			forEach(newState, c => c.selected = true);
	// 			setAmountSelected(newState.length);
	// 			return newState;
	// 		case 'deselectAll':
	// 			forEach(newState, c => {
	// 				c.selected = false;
	// 			});
	// 			setAmountSelected(0);
	// 			return newState;
	// 		default: break;
	// 	}
	// 	const cIndex = findIndex(state, [['data', 'id'], action.id]);
	// 	switch (action.type) {
	// 		case 'select':
	// 			if (!(newState[cIndex].selected)) {
	// 				newState[cIndex].selected = true;
	// 				setAmountSelected(amountSelected + 1);
	// 			}
	// 			return newState;
	// 		case 'deselect':
	// 			if (newState[cIndex].selected) {
	// 				newState[cIndex].selected = false;
	// 				setAmountSelected(amountSelected - 1);
	// 			}
	// 			return newState;
	// 		default: return state;
	// 	}
	// };
	// const [contacts, dispatch] = useReducer(cReducer, []);
	//
	// const extendList = useCallback((baseContacts) => map(baseContacts, (baseContact) => {
	// 	const index = findIndex(contacts, ['id', baseContact.id]);
	// 	if (index >= 0) {
	// 		return {
	// 			...contacts[index],
	// 			data: {
	// 				...contacts[index].data,
	// 				...baseContact,
	// 			}
	// 		};
	// 	}
	// 	return {
	// 		data: { ...baseContact },
	// 		selected: false,
	// 		actions: [
	// 			{
	// 				id: 'edit',
	// 				label: 'Edit',
	// 				icon:	'EditOutline',
	// 				click: (ev) => {
	// 					ev.stopPropagation();
	// 					history.push({
	// 						search: addToQuery(history.location.search, 'edit', baseContact.id)
	// 					});
	// 				}
	// 			},
	// 			{
	// 				id: 'delete',
	// 				label: 'Delete',
	// 				icon: 'Trash2Outline',
	// 				click: (ev) => {
	// 					ev.stopPropagation();
	// 					contactSrvc.moveContactToTrash(baseContact.id);
	// 				}
	// 			}
	// 		],
	// 		onSelect: () => dispatch({ type: 'select', id: baseContact.id }),
	// 		onDeselect: () => dispatch({ type: 'deselect', id: baseContact.id }),
	// 	};
	// }), [contacts]);
	//
	// useEffect(() => {
	// 	const sub = contactSrvc.contacts.subscribe((newContacts) => {
	// 		dispatch({ type: 'update', contacts: extendList(filterByPath(newContacts)) });
	// 	});
	// 	return () => {
	// 		sub.unsubscribe();
	// 	};
	// }, [contactSrvc.contacts, path]);
	//

	const itemFactory = useCallback(({ index }) => (
		<DexieContactListItem
			key={contacts[index]._id}
			contact={contacts[index]}
		/>
	), [contacts]);

	const groupActions = [];
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
					breadCrumbs={breadCrumbs}
					actionStack={[] /* amountSelected > 0 ? groupActions : [] */}
					selecting={false /* amountSelected > 0 */}
					onSelectAll={() => null /* () => dispatch({type: 'selectAll'}) */}
					onDeselectAll={() => null /* () => dispatch({type: 'deselectAll'}) */}
					onBackClick={() => null /* () => history.goBack() */}
					allSelected={false /* amountSelected === contacts.length */}
				/>
			</Container>
			<List
				key={id}
				Factory={itemFactory}
				amount={contacts.length}
			/>
		</Container>
	);
};

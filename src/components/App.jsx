/*
 * *** BEGIN LICENSE BLOCK *****
 * Copyright (C) 2011-2019 ZeXtras
 *
 * The contents of this file are subject to the ZeXtras EULA;
 * you may not use this file except in compliance with the EULA.
 * You may obtain a copy of the EULA at
 * http://www.zextras.com/zextras-eula.html
 * *** END LICENSE BLOCK *****
 */

import React, {useCallback, useEffect, useReducer, useState} from 'react';
import { Container, Text } from '@zextras/zapp-ui';
import { findIndex, map } from 'lodash';

export default function App({ contactSrvc }) {
	const [amountSelected, setAmountSelected] = useState(0);

	const cReducer = (state, action) => {
		if (action.type === 'update') {
			return action.contacts;
		}
		const cIndex = findIndex(state, [['data', 'id'], action.id]);
		const newState = [...state];
		switch (action.type) {
			case 'select':
				newState[cIndex].selected = true;
				setAmountSelected(amountSelected + 1);
				return state;
			case 'deselect':
				newState[cIndex].selected = false;
				setAmountSelected(amountSelected - 1);
				return state;
			default: return state;
		}
	};
	const [contacts, dispatch] = useReducer(cReducer, []);

	const extendList = useCallback((baseContacts) => map(baseContacts, (baseContact) => {
		const index = findIndex(contacts, ['id', baseContact.id]);
		if (index >= 0) {
			return { ...contacts[index], data: { ...contacts[index].data, ...baseContact } };
		}
		return { data: { ...baseContact }, selected: false, actions: [] };
	}), [contacts]);

	useEffect(() => {
		const sub = contactSrvc.contacts.subscribe((newContacts) => {
			dispatch({ type: 'update', contacts: extendList(newContacts) });
		});
		return () => {
			sub.unsubscribe();
		};
	}, [contactSrvc.contacts]);

	return (
		<Container
			orientation="horizontal"
			width="fill"
			height="fill"
			mainAlignment="flex-start"
			crossAlignment="flex-start"
		>
			<Container orientation="vertical" width="50%" height="fill" mainAlignment="flex-start">
				{map(
					contacts,
					(c, index) => (
						<Text
							key={index}
							size="large"
							onClick={() => dispatch({ type: c.selected ? 'deselect' : 'select', id: c.data.id })}
						>
							{`${c.data.firstName} ${c.data.lastName}: ${c.selected ? 'S' : 'X'}`}
						</Text>
					)
				)}
			</Container>
		</Container>
	);
};

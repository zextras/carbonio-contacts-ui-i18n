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

import React, { useEffect, useState, useReducer } from 'react';
import { distinctUntilChanged } from 'rxjs/operators';
import ContactContext from './ContactContext';
import { ContactPhoneType, ContactaddressType } from '../idb/ContactEnums';
import {ContactAddress, ContactEmail, ContactPhone} from "../idb/IContactsIdb";

function useObservable(observable) {
	const [value, setValue] = useState(observable.value);
	useEffect(() => {
		const sub = observable.pipe(distinctUntilChanged()).subscribe(setValue);
		return () => sub.unsubscribe();
	}, [observable]);
	return value;
}

const reducer = (state, action) => {
	switch (action.type) {
		case 'init':
			return {
				...action.contact,
				tempMail: { mail: '' },
				tempPhone: { number: '', name: ContactPhoneType.OTHER }
			};
		case 'edit':
			return {
				...state,
				...action.next
			};
		case 'editAddress':
			return {
				...state,
				address: [
					{
						...state.address[0],
						...action.next
					}
				]
			};
		case 'editTempMail':
			return {
				...state,
				tempMail: action.temp
			};
		case 'editTempPhone':
			return {
				...state,
				tempPhone: action.temp
			};
		case 'editMail':
			const nextMail = [...state.mail];
			nextMail[action.index] = action.next;
			return {
				...state,
				mail: nextMail
			};
		case 'deleteMail':
			const nextMail2 = [].concat(state.mail);
			nextMail2.splice(action.index, 1);
			return {
				...state,
				mail: nextMail2
			};
		case 'addAddress':
			return {
				...state,
				address: [{
					type: ContactaddressType.OTHER,
					street: '',
					city: '',
					postalCode: '',
					country: '',
					state: ''
				}],
			};
		case 'addMail':
			return {
				...state,
				mail: [...state.mail, state.tempMail],
				tempMail: { mail: '' }
			};
		case 'editPhone':
			const nextPhone = [].concat(state.phone);
			nextPhone[action.index] = action.next;
			return {
				...state,
				phone: [...nextPhone]
			};
		case 'deletePhone':
			const nextPhone2 = [].concat(state.phone);
			nextPhone2.splice(action.index, 1);
			return {
				...state,
				phone: nextPhone2
			};
		case 'addPhone':
			return {
				...state,
				phone: [...state.phone, state.tempPhone],
				tempPhone: { number: '', name: ContactPhoneType.OTHER }
			};
		default:
			throw new Error('unsupported operation');
	}
};

const emptyContact = {
	_revision: 0,
	id: 'new',
	parent: '7',
	nameSuffix: '',
	firstName: '',
	lastName: '',
	image: '',
	jobTitle: '',
	department: '',
	company: '',
	address: [],
	notes: '',
	mail: [],
	phone: []
};

const ContactContextProvider = ({ contactSrvc, id, children }) => {
	const contact = useObservable(contactSrvc.getContact(id));

	const [editContact, dispatch] = useReducer(reducer, {
		...contact,
		tempMail: { mail: '' },
		tempPhone: { number: '', name: ContactPhoneType.OTHER }
	});
	useEffect(() => dispatch(
		{
			type: 'init',
			contact: contact || emptyContact
		}
	), [contact]);
	return (
		<ContactContext.Provider
			value={{
				contact: contact || emptyContact,
				editContact,
				save: () => {
					if (id === 'new') {
						contactSrvc.createContact(editContact);
					}
					else {
						contactSrvc.modifyContact(editContact);
					}
				},
				dispatch,
			}}
		>
			{ children }
		</ContactContext.Provider>
	);
};

export default ContactContextProvider;

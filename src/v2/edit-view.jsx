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
	useReducer, useState
} from 'react';
import { useParams } from 'react-router-dom';
import { hooks } from '@zextras/zapp-shell';
import {
	Formik,
	Form,
	Field,
	ErrorMessage
} from 'formik';
import styled from 'styled-components';
import { Contact } from './db/contact';

const _Form = styled(Form)`
	display: flex;
	flex-direction: column;
	
	> p {
		margin: 0;
	}
`;

const _Toolbar = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: end;
`;

export default function FolderView() {
	const { id } = useParams();
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

	const formFactory = useCallback(({ isSubmitting }) => (
		<_Form>
			<p>
				First name:
				<Field name="firstName" />
			</p>
			<p>
				Last name:
				<Field name="lastName" />
			</p>
			<_Toolbar>
				<button type="submit" disabled={isSubmitting}>
					Submit
				</button>
			</_Toolbar>
		</_Form>
	), []);

	return initialContact
		? (
			<Formik
				initialValues={initialContact.toMap()}
				onSubmit={onSubmit}
			>
				{formFactory}
			</Formik>
		)
		: null;
}

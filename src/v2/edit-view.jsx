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
import { useHistory, useParams } from 'react-router-dom';
import { hooks } from '@zextras/zapp-shell';
import { Contact } from './db/contact';

export default function FolderView() {
	const { id } = useParams();
	const { db } = hooks.useAppContext();
	const pushHistory = hooks.usePushHistoryCallback();
	const [contact, setContact] = useState(id ? null : new Contact({ parent: '7' }));

	useEffect(() => {
		let canSet = true;
		if (id && db) {
			db.contacts
				.where({ _id: id })
				.toArray()
				.then(
					(c) => canSet && setContact(c[0])
				);
		}
		return () => {
			canSet = false;
		};
	}, [id, db]);

	const doSave = useCallback(() => {
		if (!id) {
			db.contacts
				.add(contact)
				.then((cid) => pushHistory(`/edit/${cid}`));
		}
		db.contacts.update(contact._id, contact);
	}, [contact, id, db, pushHistory]);

	return (
		<div>
			Edit contact:
			{ id }
			<br />
			<br />
			<button onClick={doSave}>Save</button>
		</div>
	);
}

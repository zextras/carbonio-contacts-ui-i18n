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

import React, { useCallback, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { hooks } from '@zextras/zapp-shell';
import { Virtuoso } from 'react-virtuoso';

export default function FolderView() {
	let { folderId } = useParams();
	if (!folderId) {
		folderId = '7'; // '/Contacts'
	}

	const { db } = hooks.useAppContext();
	const query = useMemo(() => () => db.contacts.where({ parent: folderId }).toArray(), [db, folderId]);
	// TODO: Add the sort by
	const [contacts, contactsLoaded] = hooks.useObserveDb(query, db);

	const factory = useCallback((index) => {
		console.log('Factory called with index', index);
		return (
			<div>
				<div>
					Name:
					&nbsp;
					<span>First { /* contacts[0].firstName */}</span>
					&nbsp;
					<span>Last { /* contacts[0].lastName */ }</span>
				</div>
			</div>
		);
	}, [contacts]);

	console.log('Contacts', contactsLoaded, (contacts || []).length, contacts || []);

	return (
		<div>
			Folder view:
			{ folderId }
			<Virtuoso
				style={{ width: '200px', height: '400px' }}
				totalCount={100000}
				overscan={200}
				item={index => <div>Item {index}</div>}
			/>
		</div>
	);
}

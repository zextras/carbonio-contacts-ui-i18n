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
import { setMainMenuItems } from '@zextras/zapp-shell';
import { reduce, find } from 'lodash';
import { ContactsFolder } from './db/contacts-folder';
import { ContactsDb } from './db/contacts-db';

type MainMenuItem = {
	id: string;
	label: string;
	to: string;
	children?: MainMenuItem[];
};

function buildMenuItem(folder: ContactsFolder, db: ContactsDb): Promise<MainMenuItem> {
	return db.getFolderChildren(folder)
		.then(
			(children) => Promise.all(
				reduce<ContactsFolder, Promise<MainMenuItem>[]>(
					children,
					(r, v, k) => {
						r.push(buildMenuItem(v, db));
						return r;
					},
					[]
				)
			)
		)
		.then((children) => {
			if (children.length > 0) {
				return {
					id: `contacts-folder-${folder._id}`,
					label: folder.name,
					to: `/folder/${folder._id}`,
					children
				};
			}
			return {
				id: `contacts-folder-${folder._id}`,
				label: folder.name,
				to: `/folder/${folder._id}`
			};
		});
}

export default function mainMenuItems(folders: ContactsFolder[], db: ContactsDb): void {
	const contacts = find(folders, ['id', '7']);
	if (!contacts || !contacts._id) return;
	Promise.all(
		reduce<ContactsFolder, Promise<MainMenuItem>[]>(
			folders,
			(r, v, k) => {
				r.push(buildMenuItem(v, db));
				return r;
			},
			[]
		),
	)
		.then((children) => {
			setMainMenuItems([{
				id: 'contacts-main',
				icon: 'PeopleOutline',
				to: `/folder/${contacts._id}`,
				label: 'Contacts',
				children
			}]);
		});
}

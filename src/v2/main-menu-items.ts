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
import { reduce } from 'lodash';
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
		.then((childrn) => {
			if (childrn.length > 0) {
				return {
					id: `contacts-folder-${folder.id}`,
					label: folder.name,
					to: `/folder/${folder.id}`,
					children: childrn
				};
			}
			return {
				id: `contacts-folder-${folder.id}`,
				label: folder.name,
				to: `/folder/${folder.id}`
			};
		});
}

export default function mainMenuItems(folders: ContactsFolder[], db: ContactsDb): void {
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
				to: '/',
				label: 'Contacts',
				children
			}]);
		});
}

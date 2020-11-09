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
import {
	reduce,
	map,
	filter,
	remove
} from 'lodash';

const nest = (foldersList, id) => {
	let children;
	const childrenFolders = filter(foldersList, (item) => item.parent === id);
	(childrenFolders.length > 0
		? children = map(
			childrenFolders,
			(item) => ({
				id: `mails-folder-${item.id}`,
				zid: item.id,
				label: item.name,
				to: `/folder/${item.id}`,
				children: nest(foldersList, item.id)
			})
		)
		: children = []);
	return children;
};

export function buildMenuItem(folders, foldersList) {
	return {
		id: `mails-folder-${folders.id}`,
		zid: folders.id,
		label: folders.name,
		to: `/folder/${folders.id}`,
		children: nest(foldersList, folders.id)
	};
}

export default function mainMenuItems({ store }) {
	let foldersList = null;
	store.subscribe(() => {
		const newFoldersList = store.getState().folders.folders;
		if (newFoldersList === foldersList) {
			return;
		}
		foldersList = newFoldersList;
		Promise.all(
			reduce(
				foldersList,
				(r, v) => {
					if (v.parent === '1') {
						r.push(buildMenuItem(v, foldersList));
					}
					return r;
				},
				[]
			)
		)
			.then((children) => {
				const trashItem = remove(children, (c) => c.zid === '3');
				const allItems = children.concat(trashItem);
				setMainMenuItems([{
					id: 'contact-main',
					icon: 'PeopleOutline',
					to: '/folder/15',
					label: 'Contacts',
					children: allItems
				}]);
			});
	});
}

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
	const childrenFolders = filter(foldersList, (item) => item.parentZid === id);
	(childrenFolders.length > 0
		? children = map(
			childrenFolders,
			(item) => ({
				id: `mails-folder-${item.zid}`,
				zid: item.zid,
				label: item.name,
				to: `/folder/${item.zid}`,
				children: nest(foldersList, item.zid)
			})
		)
		: children = []);
	return children;
};

export function buildMenuItem(folders, foldersList) {
	return {
		id: `mails-folder-${folders.zid}`,
		zid: folders.zid,
		label: folders.name,
		to: `/folder/${folders.zid}`,
		children: nest(foldersList, folders.zid)
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
				(r, v, k) => {
					if (v.parentZid === '1') {
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

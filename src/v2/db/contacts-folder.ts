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

import { ContactsDb } from './contacts-db';

export interface IContactsFolder {
	/** Internal UUID */ _id?: string;
	/** Zimbra ID */ id?: string;
	itemsCount: number;
	name: string;
	path: string;
	unreadCount: number;
	size: number;
	parent: string;
}

export class ContactsFolder implements IContactsFolder {
	itemsCount: number;

	name: string;

	_id?: string;

	id?: string;

	path: string;

	unreadCount: number;

	size: number;

	parent: string;

	constructor({
		itemsCount,
		name,
		id,
		path,
		unreadCount,
		size,
		parent,
		_id
	}: IContactsFolder) {
		this._id = _id;
		this.itemsCount = itemsCount;
		this.name = name;
		this.id = id;
		this.path = path;
		this.unreadCount = unreadCount;
		this.size = size;
		this.parent = parent;
	}

	public getChildren(db: ContactsDb): Promise<ContactsFolder[]> {
		return db.folders.where({ parent: this.id }).sortBy('name');
	}
}

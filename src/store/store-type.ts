/*
 * *** BEGIN LICENSE BLOCK *****
 * Copyright (C) 2011-2020 Zextras
 *
 * The contents of this file are subject to the ZeXtras EULA;
 * you may not use this file except in compliance with the EULA.
 * You may obtain a copy of the EULA at
 * http://www.zextras.com/zextras-eula.html
 * *** END LICENSE BLOCK *****
 */

import { Contact } from '../db/contact';
import { ContactsFolder } from '../db/contacts-folder';

export interface IState {
	sync: ISyncSlice;
	folders: IFoldersSlice;
	contacts: IContactsSlice;
}

export interface IContactsSlice {
	status: string;
	contacts: {[k: string]: Contact[]};
}

export interface ISyncSlice {
	status: string;
	intervalId: number;
	token: string;
}

export interface IFoldersSlice {
	status: string;
	folders: {[k: string]: ContactsFolder[]};
}

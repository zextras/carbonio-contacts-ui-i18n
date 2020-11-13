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

import { ContactsFolder, Contact } from './contact';

export type State = {
	sync: SyncSlice;
	folders: FoldersSlice;
	contacts: ContactsSlice;
}

export type ContactsSlice = {
	status: string;
	contacts: {[k: string]: Contact[]};
}

export type SyncSlice = {
	status: string;
	intervalId: number;
	token: string;
}

export type FoldersSlice = {
	status: string;
	folders: {[k: string]: ContactsFolder};
}

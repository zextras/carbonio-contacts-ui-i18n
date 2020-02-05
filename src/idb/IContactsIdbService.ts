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

import { IFolderSchmV1 } from '@zextras/zapp-shell/lib/sync/IFolderSchm';
import { Contact } from './IContactsIdb';

export interface IContactsIdbService {
	getContact(id: string): Promise<Contact|undefined>;
	getAllContacts(): Promise<{[id: string]: Contact}>;
	saveContactData(c: Contact): Promise<Contact>;
	saveContactsData(c: Contact[]): Promise<string[]>;
	deleteContacts(ids: string[]): Promise<string[]>;
	getFolder(id: string): Promise<IFolderSchmV1|void>;
	getAllFolders(): Promise<{[id: string]: IFolderSchmV1}>;
	saveFolderData(f: IFolderSchmV1): Promise<IFolderSchmV1>;
	deleteFolders(ids: string[]): Promise<string[]>;
	moveFolder(id: string, parent: string): Promise<void>;
	renameFolder(id: string, name: string): Promise<void>;
}

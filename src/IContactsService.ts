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

import { Contact, ContactData } from './idb/IContactsIdb';

export interface IContactsService {
	createContact(c: ContactData): void;
	modifyContact(c: Contact): void;
	moveContact(contactId: string, folderId: string): void;
	moveContactToTrash(contactId: string): void;
	deleteContact(contactId: string): void;
	createFolder(name: string, parent: string): void;
	moveFolder(id: string, newParent: string): void;
	renameFolder(id: string, name: string): void;
	deleteFolder(id: string): void;
	emptyFolder(id: string): void;
}

export type ContactOp = CreateContactOp | ModifyContactOp | MoveContactOp | DeleteContactOp;

export type ContactFolderOp = CreateContactFolderOp
	| MoveContactFolderOp
	| RenameContactFolderOp
	| DeleteContactFolderOp
	| EmptyContactFolderOp;

export type CreateContactFolderOp = {
	operation: 'create-contact-folder';
	parent: string;
	name: string;
	id: string;
};

export type MoveContactFolderOp = {
	operation: 'move-contact-folder';
	parent: string;
	id: string;
};

export type RenameContactFolderOp = {
	operation: 'rename-contact-folder';
	name: string;
	id: string;
};

export type DeleteContactFolderOp = {
	operation: 'delete-contact-folder';
	id: string;
};

export type EmptyContactFolderOp = {
	operation: 'empty-contact-folder';
	id: string;
};

export type CreateContactOp = {
	operation: 'create-contact';
	contactData: Contact;
};

export type ModifyContactOp = {
	operation: 'modify-contact';
	contactData: Contact;
};

export type MoveContactOp = {
	operation: 'move-contact';
	contactId: string;
	folderId: string;
};

export type DeleteContactOp = {
	operation: 'delete-contact';
	contactId: string;
};

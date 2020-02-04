import { Contact, ContactData } from './idb/IContactsIdb';

export interface IContactsService {
	createContact(c: ContactData): void;
	modifyContact(c: Contact): void;
	moveContact(contactId: string, folderId: string): void;
	moveContactToTrash(contactId: string): void;
	deleteContact(contactId: string): void;
}

export type ContactOp = CreateContactOp | ModifyContactOp | MoveContactOp | DeleteContactOp;

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

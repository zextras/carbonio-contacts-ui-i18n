import { IDBPDatabase } from 'idb';
import { Contact, IContactsIdb } from './IContactsIdb';
import { IFolderSchmV1 } from '@zextras/zapp-shell/lib/sync/IFolderSchm';

export interface IContactsIdbService {
	openDb(): Promise<IDBPDatabase<IContactsIdb>>;
	saveFolderData(f: IFolderSchmV1): Promise<IFolderSchmV1>;
	saveContactData(c: Contact): Promise<Contact>;
	saveContactsData(c: Contact[]): Promise<string[]>;
	removeContacts(ids: string[]): Promise<string[]>;
	removeFolders(ids: string[]): Promise<string[]>;
}

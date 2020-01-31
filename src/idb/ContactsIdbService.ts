import { IDBPDatabase, openDB } from 'idb';
import { Contact, IContactsIdb } from './IContactsIdb';
import { schemaVersion, upgradeFn } from './ContactsIdb';
import { IFolderSchmV1 } from '@zextras/zapp-shell/lib/sync/IFolderSchm';
import { IContactsIdbService } from './IContactsIdbService';

export default class ContactsIdbService implements IContactsIdbService {
	private static _IDB_NAME = 'com_zextras_zapp_contacts';

	public openDb(): Promise<IDBPDatabase<IContactsIdb>> {
		return openDB<IContactsIdb>(
			ContactsIdbService._IDB_NAME,
			schemaVersion,
			{
				upgrade: upgradeFn
			}
		);
	}

	public saveFolderData(f: IFolderSchmV1): Promise<IFolderSchmV1> {
		return new Promise(((resolve, reject) => {
			this.openDb()
				.then(idb => idb.put<'folders'>('folders', f))
				.then(_ => resolve(f))
				.catch(e => reject(e));
		}));
	}

	public saveContactData(c: Contact): Promise<Contact> {
		return new Promise(((resolve, reject) => {
			this.openDb()
				.then(idb => idb.put<'contacts'>('contacts', c))
				.then(_ => resolve(c))
				.catch(e => reject(e));
		}));
	}

	public saveContactsData(c: Contact[]): Promise<string[]> {
		if (c.length < 1) return Promise.resolve([]);
		const cCopy = [...c];
		const contact = cCopy.shift();
		return this.saveContactData(contact!)
			.then(c => new Promise((resolve, reject) => {
				if (cCopy.length === 0) resolve([c.id]);
				else {
					this.saveContactsData(cCopy)
						.then(r => resolve([c.id].concat(r)))
						.catch(e => reject(e))
				}
			}));
	}

	public removeContacts(ids: string[]): Promise<string[]> {
		if (ids.length < 1) return Promise.resolve([]);
		const cCopy = [...ids];
		const id = cCopy.shift();
		return this.openDb()
			.then(idb => idb.delete<'contacts'>('contacts', id!))
			.then(_ => new Promise((resolve, reject) => {
				if (cCopy.length === 0) resolve([id!]);
				else {
					this.removeContacts(cCopy)
						.then(r => resolve([id!].concat(r)))
						.catch(e => reject(e))
				}
			}));
	}

	public removeFolders(ids: string[]): Promise<string[]> {
		if (ids.length < 1) return Promise.resolve([]);
		const cCopy = [...ids];
		const id = cCopy.shift();
		return this.openDb()
			.then(idb => idb.delete<'folders'>('folders', id!))
			.then(_ => new Promise((resolve, reject) => {
				if (cCopy.length === 0) resolve([id!]);
				else {
					this.removeFolders(cCopy)
						.then(r => resolve([id!].concat(r)))
						.catch(e => reject(e))
				}
			}));
	}
}

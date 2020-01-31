import { fc } from '@zextras/zapp-shell/fc';
import { IFolderSchmV1 } from '@zextras/zapp-shell/lib/sync/IFolderSchm';
import { filter } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { reduce } from 'lodash';
import { Contact } from './idb/IContactsIdb';
import { IContactsIdbService } from './idb/IContactsIdbService';

const _CONTACT_UPDATED_EV_REG = /contacts:updated:contact/;
const _CONTACT_DELETED_EV_REG = /contacts:deleted:contact/;
const _FOLDER_UPDATED_EV_REG = /contacts:updated:folder/;
const _FOLDER_DELETED_EV_REG = /contacts:deleted:folder/;

export default class ContactsService {

	public contacts = new BehaviorSubject<{[id: string]: Contact}>({});
	public folders = new BehaviorSubject<{[id: string]: IFolderSchmV1}>({});

	constructor(private _idbSrvc: IContactsIdbService) {
		fc
			.pipe(
				filter((e) => e.event === 'app:all-loaded')
			)
			.subscribe(() => this._loadAllContactsAndFolders());
		fc
			.pipe(filter(e => _CONTACT_UPDATED_EV_REG.test(e.event)))
			.subscribe(({ data }) => this._updateContact(data.id));
		fc
			.pipe(filter(e => _CONTACT_DELETED_EV_REG.test(e.event)))
			.subscribe(({ data }) => this._deleteContact(data.id));
		fc
			.pipe(filter(e => _FOLDER_UPDATED_EV_REG.test(e.event)))
			.subscribe(({ data }) => this._updateFolder(data.id));
		fc
			.pipe(filter(e => _FOLDER_DELETED_EV_REG.test(e.event)))
			.subscribe(({ data }) => this._deleteFolder(data.id));
	}

	private _loadAllContactsAndFolders(): void {
		this._idbSrvc.openDb()
			.then(idb => idb.getAll<'contacts'>('contacts'))
			.then((c: Contact[]) => {
				this.contacts.next(
					reduce<Contact, {[id: string]: Contact}>(
						c,
						(result, c) => {
							result[c.id] = c;
							return result;
						},
						{}
					)
				);
			});
		this._idbSrvc.openDb()
			.then(idb => idb.getAll<'folders'>('folders'))
			.then(c => {
				this.folders.next(
					reduce<IFolderSchmV1, {[id: string]: IFolderSchmV1}>(
						c,
						(result, f) => {
							result[f.id] = f;
							return result;
						},
						{}
					)
				);
			});
	}

	private _updateContact(id: string): void {
		this._idbSrvc.openDb()
			.then(idb => idb.get<'contacts'>('contacts', id))
			.then(c => {
				if (c) this.contacts.next({ ...this.contacts.value, [id]: c });
			})
	}

	private _deleteContact(id: string): void {
		const newVal = { ...this.contacts.getValue() };
		try {
			delete newVal[id];
		} catch (e) {}
		this.contacts.next(newVal);
	}

	private _updateFolder(id: string): void {
		this._idbSrvc.openDb()
			.then(idb => idb.get<'folders'>('folders', id))
			.then(f => {
				if (f) this.folders.next({ ...this.folders.value, [id]: f });
			})
	}

	private _deleteFolder(id: string): void {
		const newVal = { ...this.folders.getValue() };
		try {
			delete newVal[id];
		} catch (e) {}
		this.folders.next(newVal);
	}

}

import { fc, fcSink } from '@zextras/zapp-shell/fc';
import { IFolderSchmV1 } from '@zextras/zapp-shell/lib/sync/IFolderSchm';
import { IMainSubMenuItemData } from "@zextras/zapp-shell/lib/router/IRouterService";
import { filter } from 'rxjs/operators';
import { reduce, filter as loFilter, cloneDeep, find } from 'lodash';
import { Contact, ContactData } from './idb/IContactsIdb';
import { syncOperations } from '@zextras/zapp-shell/sync';
import { ISyncOperation, ISyncOpRequest, ISyncOpSoapRequest } from '@zextras/zapp-shell/lib/sync/ISyncService';
import { BehaviorSubject, combineLatest, Subject, Subscription } from 'rxjs';
import { IContactsIdbService } from './idb/IContactsIdbService';
import {
	ContactOp,
	CreateContactOp,
	DeleteContactOp,
	IContactsService,
	ModifyContactOp,
	MoveContactOp
} from './IContactsService';
import {
	CreateContactOpReq,
	DeleteContactActionOpReq,
	ModifyContactOpReq,
	MoveContactActionOpReq,
	normalizeContactAttrsToSoapOp
} from './ISoap';

const _CONTACT_UPDATED_EV_REG = /contacts:updated:contact/;
const _CONTACT_DELETED_EV_REG = /contacts:deleted:contact/;
const _FOLDER_UPDATED_EV_REG = /contacts:updated:folder/;
const _FOLDER_DELETED_EV_REG = /contacts:deleted:folder/;

const subfolders: (
	folders: {[id: string]: IFolderSchmV1},
	parentId: string
) => Array<IMainSubMenuItemData> =(folders, parentId) =>
	reduce<IFolderSchmV1, Array<IMainSubMenuItemData>>(
		loFilter(
			folders,
			(folder: IFolderSchmV1): boolean => folder.parent === parentId
		),
		(acc: Array<IMainSubMenuItemData>, folder: IFolderSchmV1) => {
			acc.push(
				{
					id: folder.id,
					label: folder.name,
					to: `/contacts/folder${folder.path}`,
					children: subfolders(folders, folder.id)
				}
			);
			return acc;
		},
		[]
	);

export default class ContactsService implements IContactsService {
	public contacts = new BehaviorSubject<{[id: string]: Contact}>({});

	public folders = new BehaviorSubject<{[id: string]: IFolderSchmV1}>({});

	private _contacts = new BehaviorSubject<{[id: string]: Contact}>({});

	private _folders = new BehaviorSubject<{[id: string]: IFolderSchmV1}>({});

	public menuFolders = new BehaviorSubject<Array<IMainSubMenuItemData>>([]);

	private _menuFoldersSub: Subscription;

	private _createId = 0;

	constructor(private _idbSrvc: IContactsIdbService) {
		fc
			.pipe(
				filter((e) => e.event === 'app:all-loaded')
			)
			.subscribe(() => this._loadAllContactsAndFolders());
		fc
			.pipe(filter((e) => _CONTACT_UPDATED_EV_REG.test(e.event)))
			.subscribe(({ data }) => this._updateContact(data.id));
		fc
			.pipe(filter((e) => _CONTACT_DELETED_EV_REG.test(e.event)))
			.subscribe(({ data }) => this._deleteContact(data.id));
		fc
			.pipe(filter((e) => _FOLDER_UPDATED_EV_REG.test(e.event)))
			.subscribe(({ data }) => this._updateFolder(data.id));
		fc
			.pipe(filter((e) => _FOLDER_DELETED_EV_REG.test(e.event)))
			.subscribe(({ data }) => this._deleteFolder(data.id));

		this._menuFoldersSub = this.folders.subscribe(
			(folders: {[id: string]: IFolderSchmV1}): void => {
				this.menuFolders.next(
					reduce<IFolderSchmV1, Array<IMainSubMenuItemData>>(
						loFilter(folders, (folder: IFolderSchmV1): boolean => folder.parent === '1'),
						(acc: Array<IMainSubMenuItemData>, folder: IFolderSchmV1) => {
							acc.push(
								{
									icon: 'PeopleOutline',
									id: folder.id,
									label: folder.name,
									to: `/contacts/folder${folder.path}`,
									children: subfolders(folders, folder.id)
								}
							);
							return acc;
						},
						[]
					)
				);
			}
		);

		combineLatest([
			syncOperations as BehaviorSubject<Array<ISyncOperation<ContactOp, ISyncOpRequest<unknown>>>>,
			this._contacts
		]).subscribe(this._mergeContactsAndOperations);

		this.contacts.subscribe((v) => console.log('Contact list', v));
		syncOperations.subscribe((v) => console.log('Operations', v));

		combineLatest([
			syncOperations,
			this._folders
		]).subscribe(this._mergeFoldersAndOperations);
	}

	public getFolderIdByPath(path: string): string {
		const folder = find(this.folders.value, ['path', `/${path}`]);
		if (folder) {
			return folder.id;
		}
		return '';
	}

	public createContact(c: ContactData): void {
		fcSink<ISyncOperation<CreateContactOp, ISyncOpSoapRequest<CreateContactOpReq>>>(
			'sync:operation:push',
			{
				description: 'Creating a new contact',
				opData: {
					operation: 'create-contact',
					contactData: { ...c, id: `${this._createId -= 1}`, _revision: -1 },
				},
				opType: 'soap',
				request: {
					command: 'CreateContact',
					urn: 'urn:zimbraMail',
					data: {
						cn: {
							l: c.parent,
							a: normalizeContactAttrsToSoapOp(c)
						}
					}
				}
			}
		);
	}

	public modifyContact(c: Contact): void {
		fcSink<ISyncOperation<ModifyContactOp, ISyncOpSoapRequest<ModifyContactOpReq>>>(
			'sync:operation:push',
			{
				description: 'Saving a contact',
				opData: {
					operation: 'modify-contact',
					contactData: c,
				},
				opType: 'soap',
				request: {
					command: 'ModifyContact',
					urn: 'urn:zimbraMail',
					data: {
						replace: 0,
						force: 1,
						cn: {
							id: c.id,
							a: normalizeContactAttrsToSoapOp(c),
							m: []
						}
					}
				}
			}
		);
	}

	public moveContact(contactId: string, folderId: string): void {
		fcSink<ISyncOperation<MoveContactOp, ISyncOpSoapRequest<MoveContactActionOpReq>>>(
			'sync:operation:push',
			{
				description: 'Moving a contact',
				opData: {
					operation: 'move-contact',
					contactId,
					folderId,
				},
				opType: 'soap',
				request: {
					command: 'ContactAction',
					urn: 'urn:zimbraMail',
					data: {
						action: {
							op: 'move',
							l: folderId,
							id: contactId
						}
					}
				}
			}
		);
	}

	public moveContactToTrash(contactId: string): void {
		fcSink<ISyncOperation<MoveContactOp, ISyncOpSoapRequest<MoveContactActionOpReq>>>(
			'sync:operation:push',
			{
				description: 'Moving a contact',
				opData: {
					operation: 'move-contact',
					contactId,
					folderId: '3',
				},
				opType: 'soap',
				request: {
					command: 'ContactAction',
					urn: 'urn:zimbraMail',
					data: {
						action: {
							op: 'move',
							l: '3',
							id: contactId
						}
					}
				}
			}
		);
	}

	public deleteContact(contactId: string): void {
		fcSink<ISyncOperation<DeleteContactOp, ISyncOpSoapRequest<DeleteContactActionOpReq>>>(
			'sync:operation:push',
			{
				description: 'Deleting a contact',
				opData: {
					operation: 'delete-contact',
					contactId,
				},
				opType: 'soap',
				request: {
					command: 'ContactAction',
					urn: 'urn:zimbraMail',
					data: {
						action: {
							op: 'delete',
							id: contactId
						}
					}
				}
			}
		);
	}

	private _loadAllContactsAndFolders(): void {
		this._idbSrvc.openDb()
			.then((idb) => idb.getAll<'contacts'>('contacts'))
			.then((c: Contact[]) => {
				this._contacts.next(
					reduce<Contact, {[id: string]: Contact}>(
						c,
						(result, c1) => {
							result[c1.id] = c1;
							return result;
						},
						{}
					)
				);
			});
		this._idbSrvc.openDb()
			.then((idb) => idb.getAll<'folders'>('folders'))
			.then((c) => {
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
			.then((idb) => idb.get<'contacts'>('contacts', id))
			.then((c) => {
				if (c) this._contacts.next({ ...this._contacts.getValue(), [id]: c });
			});
	}

	private _deleteContact(id: string): void {
		const newVal = { ...this._contacts.getValue() };
		try {
			delete newVal[id];
		}
		catch (e) {}
		this._contacts.next(newVal);
	}

	private _updateFolder(id: string): void {
		this._idbSrvc.openDb()
			.then((idb) => idb.get<'folders'>('folders', id))
			.then((f) => {
				if (f) this.folders.next({ ...this._folders.getValue(), [id]: f });
			});
	}

	private _deleteFolder(id: string): void {
		const newVal = { ...this._folders.getValue() };
		try {
			delete newVal[id];
		}
		catch (e) {}
		this.folders.next(newVal);
	}

	private _mergeContactsAndOperations: ([
		_syncOperations,
		contacts
	]: [
		Array<ISyncOperation<ContactOp, ISyncOpRequest<unknown>>>,
		{[id: string]: Contact}
	]) => void =
		([
			_syncOperations,
			contacts
		]) => {
			this.contacts.next(
				reduce(
					_syncOperations,
					(r, v, k) => {
						switch (v.opData.operation) {
							case 'create-contact':
								// eslint-disable-next-line no-param-reassign
								r[v.opData.contactData.id] = v.opData.contactData;
								return r;
							case 'delete-contact':
								// eslint-disable-next-line no-param-reassign
								delete r[v.opData.contactId];
								return r;
							case 'modify-contact':
								// eslint-disable-next-line no-param-reassign
								r[v.opData.contactData.id] = v.opData.contactData;
								return r;
							case 'move-contact':
								// eslint-disable-next-line no-param-reassign
								r[v.opData.contactId] = { ...r[v.opData.contactId], parent: v.opData.folderId };
								return r;
							default:
								return r;
						}
					},
					cloneDeep(contacts)
				)
			);
		};

	private _mergeFoldersAndOperations: ([
		_syncOperations,
		folders
	]: [
		Array<ISyncOperation<unknown, ISyncOpRequest<unknown>>>,
		{[id: string]: IFolderSchmV1}
	]) => void =
		([
			_syncOperations,
			folders
		]) => {
			this.folders.next(folders);
		};
}

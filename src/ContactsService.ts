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

import { BehaviorSubject, combineLatest, Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import {
	reduce,
	filter as loFilter,
	cloneDeep,
	find
} from 'lodash';
import { fc, fcSink } from '@zextras/zapp-shell/fc';
import { syncOperations } from '@zextras/zapp-shell/sync';
import { IFolderSchmV1 } from '@zextras/zapp-shell/lib/sync/IFolderSchm';
import { IMainSubMenuItemData } from '@zextras/zapp-shell/lib/router/IRouterService';
import { ISyncOperation, ISyncOpRequest, ISyncOpSoapRequest } from '@zextras/zapp-shell/lib/sync/ISyncService';
import { Contact, ContactData } from './idb/IContactsIdb';
import { IContactsIdbService } from './idb/IContactsIdbService';
import {
	ContactFolderOp,
	ContactOp,
	CreateContactFolderOp,
	CreateContactOp,
	DeleteContactFolderOp,
	DeleteContactOp,
	EmptyContactFolderOp,
	IContactsService,
	ModifyContactOp,
	MoveContactFolderOp,
	MoveContactOp,
	RenameContactFolderOp
} from './IContactsService';
import {
	calculateAbsPath,
	CreateContactFolderOpReq,
	CreateContactOpReq,
	DeleteContactActionOpReq,
	DeleteContactFolderActionOpReq,
	EmptyContactFolderActionOpReq,
	ModifyContactOpReq,
	MoveContactActionOpReq,
	MoveContactFolderActionOpReq,
	normalizeContactAttrsToSoapOp,
	RenameContactFolderActionOpReq
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

		combineLatest([
			syncOperations as BehaviorSubject<Array<ISyncOperation<ContactFolderOp, ISyncOpRequest<unknown>>>>,
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
					contactData: { ...c, id: `${this._createId -= 1}`, _revision: 0 },
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

	public createFolder(name: string, parent = '7'): void {
		fcSink<ISyncOperation<CreateContactFolderOp, ISyncOpSoapRequest<CreateContactFolderOpReq>>>(
			'sync:operation:push',
			{
				description: 'Creating a contact folder',
				opData: {
					operation: 'create-contact-folder',
					id: `${this._createId -= 1}`,
					name,
					parent
				},
				opType: 'soap',
				request: {
					command: 'CreateFolder',
					urn: 'urn:zimbraMail',
					data: {
						folder: {
							l: parent,
							name,
							view: 'contact'
						}
					}
				}
			}
		);
	}

	public moveFolder(id: string, newParent: string): void {
		fcSink<ISyncOperation<MoveContactFolderOp, ISyncOpSoapRequest<MoveContactFolderActionOpReq>>>(
			'sync:operation:push',
			{
				description: 'Moving a contact folder',
				opData: {
					operation: 'move-contact-folder',
					parent: newParent,
					id
				},
				opType: 'soap',
				request: {
					command: 'FolderAction',
					urn: 'urn:zimbraMail',
					data: {
						action: {
							op: 'move',
							id,
							l: newParent
						}
					}
				}
			}
		);
	}

	public renameFolder(id: string, name: string): void {
		fcSink<ISyncOperation<RenameContactFolderOp, ISyncOpSoapRequest<RenameContactFolderActionOpReq>>>(
			'sync:operation:push',
			{
				description: 'Renaming a contact folder',
				opData: {
					operation: 'rename-contact-folder',
					name,
					id
				},
				opType: 'soap',
				request: {
					command: 'FolderAction',
					urn: 'urn:zimbraMail',
					data: {
						action: {
							op: 'rename',
							id,
							name
						}
					}
				}
			}
		);
	}

	public deleteFolder(id: string): void {
		fcSink<ISyncOperation<DeleteContactFolderOp, ISyncOpSoapRequest<DeleteContactFolderActionOpReq>>>(
			'sync:operation:push',
			{
				description: 'Deleting a contact folder',
				opData: {
					operation: 'delete-contact-folder',
					id
				},
				opType: 'soap',
				request: {
					command: 'FolderAction',
					urn: 'urn:zimbraMail',
					data: {
						action: {
							op: 'delete',
							id
						}
					}
				}
			}
		);
	}

	public emptyFolder(id: string): void {
		fcSink<ISyncOperation<EmptyContactFolderOp, ISyncOpSoapRequest<EmptyContactFolderActionOpReq>>>(
			'sync:operation:push',
			{
				description: 'Cleaning a contact folder',
				opData: {
					operation: 'empty-contact-folder',
					id
				},
				opType: 'soap',
				request: {
					command: 'FolderAction',
					urn: 'urn:zimbraMail',
					data: {
						action: {
							op: 'empty',
							id,
							recursive: true
						}
					}
				}
			}
		);
	}

	private _loadAllContactsAndFolders(): void {
		this._idbSrvc.getAllContacts()
			.then((contacts) => this._contacts.next(contacts));
		this._idbSrvc.getAllFolders()
			.then((folders) => this._folders.next(folders));
	}

	private _updateContact(id: string): void {
		this._idbSrvc.getContact(id)
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
		this._idbSrvc.getFolder(id)
			.then((f) => {
				if (f) this._folders.next({ ...this._folders.getValue(), [id]: f });
			});
	}

	private _deleteFolder(id: string): void {
		const newVal = { ...this._folders.getValue() };
		try {
			delete newVal[id];
		}
		catch (e) {}
		this._folders.next(newVal);
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
		Array<ISyncOperation<ContactFolderOp, ISyncOpRequest<unknown>>>,
		{[id: string]: IFolderSchmV1}
	]) => void =
		([
			_syncOperations,
			folders
		]) => {
			this.folders.next(
				reduce(
					_syncOperations,
					(r, v, k) => {
						switch (v.opData.operation) {
							case 'create-contact-folder':
								// eslint-disable-next-line no-param-reassign
								r[v.opData.id] = {
									_revision: 0,
									id: v.opData.id,
									name: v.opData.name,
									parent: v.opData.parent,
									itemsCount: 0,
									unreadCount: 0,
									size: 0,
									path: calculateAbsPath(
										v.opData.id,
										v.opData.name,
										r,
										v.opData.parent,
									)
								};
								return r;
							case 'delete-contact-folder':
								// eslint-disable-next-line no-param-reassign
								delete r[v.opData.id];
								// TODO: Remove the children
								return r;
							case 'move-contact-folder':
								// eslint-disable-next-line no-param-reassign
								r[v.opData.id] = { ...r[v.opData.id], parent: v.opData.parent };
								// TODO: Update the path and the children paths
								return r;
							case 'rename-contact-folder':
								// eslint-disable-next-line no-param-reassign
								r[v.opData.id] = { ...r[v.opData.id], name: v.opData.name };
								// TODO: Update the path and the children paths
								return r;
							default:
								return r;
						}
					},
					cloneDeep(folders)
				)
			);
		};
}

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

import {
	IPersistedContext,
	ISyncProtocol,
	PollContinuation,
	ReactiveContinuation
} from 'dexie-syncable/api';
import { IDatabaseChange } from 'dexie-observable/api';
import { ISoapSyncContactResponse } from '../soap';
import { ContactsDb } from './contacts-db';

import processLocalFolderChange from './process-local-folder-change';
import processRemoteFolderNotifications from './process-remote-folder-notifications';

const POLL_INTERVAL = 20000;

interface IContactsDexieContext extends IPersistedContext {
	clientIdentity?: '';
	changeDate?: number;
}

export class ContactsDbSoapSyncProtocol implements ISyncProtocol {
	constructor(
		private _db: ContactsDb,
		private _fetch: (input: RequestInfo, init?: RequestInit) => Promise<Response>
	) {}

	public sync(
		context: IContactsDexieContext,
		url: string,
		options: any,
		baseRevision: any,
		syncedRevision: any,
		changes: IDatabaseChange[],
		partial: boolean,
		applyRemoteChanges: (changes: IDatabaseChange[], lastRevision: any, partial?: boolean, clear?: boolean) => Promise<void>,
		onChangesAccepted: () => void,
		onSuccess: (continuation: (PollContinuation | ReactiveContinuation)) => void,
		onError: (error: any, again?: number) => void
	): void {
		processLocalFolderChange(
			this._db,
			changes,
			this._fetch
		)
			.then((localChangesFromRemote) => {
				this._fetch(
					'/service/soap/SyncRequest',
					{
						method: 'POST',
						body: JSON.stringify({
							Body: {
								SyncRequest: {
									_jsns: 'urn:zimbraMail',
									typed: true,
									token: syncedRevision
								}
							}
						})
					}
				)
					.then((response) => response.json())
					.then((r) => {
						// TODO: Handle "mail.MUST_RESYNC" fault
						if (r.Body.Fault) throw new Error(r.Body.Fault.Reason.Text);
						else return r.Body.SyncResponse as ISoapSyncContactResponse;
					})
					.then(
						({
							token,
							folder,
							cn,
							deleted,
							md
						}) => new Promise<{token: string; remoteChanges: IDatabaseChange[]; md: number}>((resolve, reject) => {
							processRemoteFolderNotifications(
								this._db,
								!baseRevision,
								changes,
								localChangesFromRemote,
								{
									folder,
									deleted
								}
							)
								.then((remoteChanges) => resolve({ token, md, remoteChanges }));
						})
					)
					.then(({ token, md, remoteChanges }) => {
						if (context.clientIdentity !== '' || context.changeDate !== md) {
							context.clientIdentity = '';
							context.changeDate = md;
							return context.save()
								.then(() => ({
									token,
									remoteChanges
								}));
						}

						return {
							token,
							remoteChanges
						};
					})
					.then(
						({ token, remoteChanges }) =>
							applyRemoteChanges([...localChangesFromRemote, ...remoteChanges], token, false)
					)
					.then(() => {
						onChangesAccepted();
						onSuccess({ again: POLL_INTERVAL });
					})
					.catch((e) => {
						onError(e, POLL_INTERVAL);
					});
			})
			.catch((e) => {
				onError(e, POLL_INTERVAL);
			});
	}
}

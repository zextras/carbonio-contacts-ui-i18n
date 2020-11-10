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
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import produce from 'immer';
import { network } from '@zextras/zapp-shell';
import { reduce, isEmpty, forEach } from 'lodash';
import { ContactsFolder } from '../db/contact';
import { ISoapFolderObj } from '../soap';
import { IFoldersSlice } from './store-type';

export function findFolders(soapFolderObj: ISoapFolderObj): {[k: string]: ContactsFolder} {
	const toRet: {[k: string]: ContactsFolder} = {};
	if (soapFolderObj.view === 'contact' || soapFolderObj.id === '3') {
		toRet[soapFolderObj.id] = {
			itemsCount: soapFolderObj.n,
			name: soapFolderObj.name,
			id: soapFolderObj.id,
			path: soapFolderObj.absFolderPath,
			unreadCount: soapFolderObj.u || 0,
			size: soapFolderObj.s,
			parent: soapFolderObj.l
		};
	}
	return reduce(
		soapFolderObj.folder || [],
		(r, f) => ({
			...r,
			...findFolders(f)
		}),
		toRet
	);
}

export const fetchFolders = createAsyncThunk('folders/fetchFolders', async () => {
	const { folder } = await network.soapFetch(
		'Sync',
		{
			_jsns: 'urn:zimbraMail',
			typed: 1,
		}
	);
	return findFolders(folder[0]);
});

function fetchFoldersPending(state: IFoldersSlice) {
	state.status = 'syncing';
}

function fetchFoldersFullFilled(state: IFoldersSlice) {
	state.status = 'succeeded';
}

function fetchFoldersRejected(state: IFoldersSlice) {
	state.status = 'failed';
}

export const handleSyncData = createAsyncThunk('folders/handleSyncData', async ({
	firstSync, token, folder, deleted
}: any, { dispatch }) => {
	if (firstSync) {
		await dispatch({
			type: 'folders/setFolders',
			payload: findFolders(folder[0])
		});
	}
	else {
		if (!isEmpty(folder)) {
			const updatedFolders: ContactsFolder[] = reduce(
				folder,
				(acc, v, k) => {
					acc.push({
						itemsCount: v.n,
						name: v.name,
						id: v.id,
						path: v.absFolderPath,
						unreadCount: v.u || 0,
						size: v.s,
						parent: v.l
					});
					return acc;
				},
				[] as ContactsFolder[]
			);
			await dispatch({
				type: 'folders/updateFolders',
				payload: updatedFolders,
			});
		}
		if (deleted) {
			await dispatch({
				type: 'folders/deleteFolders',
				payload: deleted[0].ids.split(',')
			});
		}
	}
});

function setFoldersReducer(state: IFoldersSlice, { payload }: any) {
	state.folders = {};
	reduce(
		payload,
		(r, v, k) => {
			r[k] = v;
			return r;
		},
		state.folders
	);
}

function updateFoldersReducer(state: IFoldersSlice, { payload }: any) {
	reduce(
		payload,
		(acc, v, k) => {
			acc[v.zid] = v;
			return acc;
		},
		state.folders
	);
}

function deleteFoldersReducer(state: IFoldersSlice, { payload }: any) {
	forEach(
		payload,
		(id) => state.folders[id] && delete state.folders[id]
	);
}

export const foldersSlice = createSlice({
	name: 'folders',
	initialState: {
		status: 'idle',
		folders: {}
	},
	reducers: {
		setFolders: produce(setFoldersReducer),
		updateFolders: produce(updateFoldersReducer),
		deleteFolders: produce(deleteFoldersReducer)
	},
	extraReducers: (builder) => {
		builder.addCase(handleSyncData.pending, produce(fetchFoldersPending));
		builder.addCase(handleSyncData.fulfilled, produce(fetchFoldersFullFilled));
		builder.addCase(handleSyncData.rejected, produce(fetchFoldersRejected));
	}
});

export default foldersSlice.reducer;

export function selectFolder(state: IFoldersSlice, id: number) {
	return state.folders.folders[id];
}

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

export function findFolders(folder) {
	const toRet = {};
	if (folder.view === 'contact' || folder.id === '3') {
		toRet[folder.id] = {
			zid: folder.id,
			name: folder.name,
			parentZid: folder.l,
			checked: false,
			synced: true,
			owner: folder.owner
		};
	}
	return reduce(
		folder.folder || [],
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

function fetchFoldersPending(state, action) {
	state.status = 'syncing';
}

function fetchFoldersFullFilled(state, action) {
	state.status = 'succeeded';
}

function fetchFoldersRejected(state, action) {
	state.status = 'failed';
}

export const handleSyncData = createAsyncThunk('folders/handleSyncData', async ({
	firstSync, token, folder, deleted
}, { dispatch }) => {
	if (firstSync) {
		await dispatch({
			type: 'folders/setFolders',
			payload: findFolders(folder[0])
		});
	}
	else {
		if (!isEmpty(folder)) {
			const updatedFolders = reduce(
				folder,
				(acc, v, k) => {
					acc.push({
						zid: v.id,
						name: v.name,
						parentZid: v.l,
						tasks: {},
						checked: false,
						synced: true
					});
					return acc;
				},
				[]
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

function setFoldersReducer(state, { payload }) {
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

function updateFoldersReducer(state, { payload }) {
	reduce(
		payload,
		(acc, v, k) => {
			acc[v.zid] = v;
			return acc;
		},
		state.folders
	);
}

function deleteFoldersReducer(state, { payload }) {
	forEach(
		payload,
		(id) => {
			return state.folders[id] && delete state.folders[id];
		}
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
	extraReducers: {
		[handleSyncData.pending]: produce(fetchFoldersPending),
		[handleSyncData.fulfilled]: produce(fetchFoldersFullFilled),
		[handleSyncData.rejected]: produce(fetchFoldersRejected),
	}
});

export default foldersSlice.reducer;

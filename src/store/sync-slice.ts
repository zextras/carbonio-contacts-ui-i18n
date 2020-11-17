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
import { SyncSlice } from '../types/store';
import { handleSyncData as handleFoldersSyncData } from './folders-slice';
import { handleSyncData as handleContactsSyncData } from './contacts-slice';

export const performSync = createAsyncThunk('sync/performSync', async (arg, { getState, dispatch }: any) => {
	const { status, token } = getState().sync;

	if (status === 'syncing') {
		const {
			token: _token, folder, deleted, cn
		} = await network.soapFetch(
			'Sync',
			{
				_jsns: 'urn:zimbraMail',
				typed: 1,
				token
			}
		);
		if (!token || token !== _token) {
			await dispatch(handleFoldersSyncData({
				firstSync: !token, token: _token, folder, deleted
			}));
			await dispatch(handleContactsSyncData({
				firstSync: !token, cn
			}));
		}
		return ({
			token: `${_token}`
		});
	}

	return ({
		token
	});
});

function performSyncPending(state: SyncSlice) {
	if (state.status === 'idle' || state.status === 'init') {
		state.status = 'syncing';
	}
}

function performSyncFulfilled(state: SyncSlice, { payload }: any) {
	const { token } = payload;
	state.token = token;
	state.status = state.intervalId > 0 ? 'idle' : 'stopped';
}

function performSyncRejected(state: SyncSlice) {
	console.warn('performSyncRejected');
}

export const startSync = createAsyncThunk('sync/start', async (arg, { getState, dispatch }: any) => {
	const { status, intervalId } = getState().sync;
	if (status === 'init' || status === 'stopped') {
		await dispatch(performSync());
		const interval = setInterval((_dispatch) => {
			_dispatch(performSync());
		}, 20000, dispatch);
		return ({
			status: 'idle',
			intervalId: interval
		});
	}
	return ({
		status,
		intervalId
	});
});

export const stopSync = createAsyncThunk('sync/stop', (arg, { getState }: any) => {
	const { status, intervalId } = getState().sync;
	if (status === 'idle') {
		clearInterval(intervalId);
		return ({
			status: 'stopped',
			intervalId: -1
		});
	}
	if (status === 'syncing') {
		clearInterval(intervalId);
		return ({
			status,
			intervalId: -1
		});
	}
	return ({
		status,
		intervalId
	});
});

function startStopSyncFulfilled(state: SyncSlice, { payload }: any) {
	const { status, intervalId } = payload;
	state.status = status;
	state.intervalId = intervalId;
}

function setStatusR(state: SyncSlice, { payload }: any) {
	state.status = payload.status;
}

export const syncSlice = createSlice({
	name: 'sync',
	initialState: {
		status: 'init',
		intervalId: -1,
		token: undefined
	} as SyncSlice,
	reducers: {
		setStatus: produce(setStatusR)
	},
	extraReducers: (builder) => {
		builder.addCase(performSync.pending, produce(performSyncPending));
		builder.addCase(performSync.fulfilled, produce(performSyncFulfilled));
		builder.addCase(performSync.rejected, produce(performSyncRejected));
		builder.addCase(startSync.fulfilled, produce(startStopSyncFulfilled));
		builder.addCase(stopSync.fulfilled, produce(startStopSyncFulfilled));
	}
});

// export const {  } = syncSlice.actions;

export default syncSlice.reducer;

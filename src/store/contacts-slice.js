import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { network } from '@zextras/zapp-shell';
import { isEmpty, reduce } from 'lodash';
import produce from 'immer';
import { normalizeContact } from '../db/contacts-db-utils';

export function findContacts(contacts) {
	const accValue = [];
	return reduce(
		contacts || [],
		(acc, v) => acc.concat(v.id),
		accValue
	);
}

export const fetchContacts = createAsyncThunk('contacts/fetchContacts', async (ids) => {
	const currentContacts = [];
	reduce(
		ids,
		(acc, v) => {
			acc.push({ id: v });
			return acc;
		},
		currentContacts,
	);

	const { cn } = await network.soapFetch(
		'GetContacts',
		{
			_jsns: 'urn:zimbraMail',
			cn: currentContacts
		}
	);

	return reduce(
		cn,
		(r, c) => {
			if ((c._attrs).type && (c._attrs).type === 'group') return r;
			r.push(
				normalizeContact(c)
			);
			return r;
		},
		[]
	);
});

function syncContactsPending(state, action) {
	state.status = 'syncing';
}

function syncContactsFullFilled(state, action) {
	state.status = 'succeeded';
}

function syncContactsRejected(state, action) {
	state.status = 'failed';
}

function fetchContactsPending(state, action) {

}

function fetchContactsFullFilled(state, { payload }) {
	reduce(
		payload,
		(acc, v) => {
			if (!acc[v.parent]) {
				acc[v.parent] = [];
			}
			acc[v.parent].push(v);
			return acc;
		},
		state.contacts,
	);
}

function fetchContactsRejected(state, action) {
	console.log('failed');
}

export const handleSyncData = createAsyncThunk('contacts/handleSyncData', async ({
	firstSync, cn
}, { dispatch }) => {
	if (!firstSync) {
		const updatedContacts = findContacts(cn || []);
		if (!isEmpty(updatedContacts)) {
			await dispatch(fetchContacts(updatedContacts));
		}
	}
});

export const contactsSlice = createSlice({
	name: 'contacts',
	initialState: {
		status: 'idle',
		contacts: {}
	},
	reducers: { },
	extraReducers: {
		[handleSyncData.pending]: produce(syncContactsPending),
		[handleSyncData.fulfilled]: produce(syncContactsFullFilled),
		[handleSyncData.rejected]: produce(syncContactsRejected),
		[fetchContacts.pending]: produce(fetchContactsPending),
		[fetchContacts.fulfilled]: produce(fetchContactsFullFilled),
		[fetchContacts.rejected]: produce(fetchContactsRejected),
	}
});

export default contactsSlice.reducer;

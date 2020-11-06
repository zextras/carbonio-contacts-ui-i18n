import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { network } from '@zextras/zapp-shell';
import { isEmpty, reduce, filter } from 'lodash';
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

export const fetchContactsInFolder = createAsyncThunk('contacts/fetchContactsInFolder', async (ids) => {
	const { cn } = await network.soapFetch(
		'Search',
		{
			_jsns: 'urn:zimbraMail',
			limit: '500',
			offset: 0,
			sortBy: 'none',
			types: 'contact',
			query: {
				_content: `inid:"${ids}"`
			}
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

export const fetchContact = createAsyncThunk('contacts/fetchContact', async (ids) => {
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
			const el = filter(acc[v.parent], (item) => item.id === v.id);
			if (el.length > 0) {
				return acc;
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
			await dispatch(fetchContact(updatedContacts));
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
		[fetchContact.pending]: produce(fetchContactsPending),
		[fetchContact.fulfilled]: produce(fetchContactsFullFilled),
		[fetchContact.rejected]: produce(fetchContactsRejected),
		[fetchContactsInFolder.pending]: produce(fetchContactsPending),
		[fetchContactsInFolder.fulfilled]: produce(fetchContactsFullFilled),
		[fetchContactsInFolder.rejected]: produce(fetchContactsRejected),
	}
});

export default contactsSlice.reducer;

export function selectAllContactsInFolder({ contacts }, id) {
	if (contacts && contacts.contacts[id]) {
		return contacts.contacts[id];
	}
	return [];
}

import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { network } from '@zextras/zapp-shell';
import { isEmpty, reduce, filter } from 'lodash';
import produce from 'immer';
import { Contact } from '../db/contact';
import { normalizeContact } from '../db/contacts-db-utils';
import { ContactsFolder } from '../db/contacts-folder';
import { SoapContact } from '../soap';

export function findContacts(contacts: SoapContact[]): string[] {
	const accValue: string[] = [];
	return reduce(
		contacts || [],
		(acc, v) => acc.concat(v.id),
		accValue
	);
}

export const fetchContactsByFolderId = createAsyncThunk('contacts/fetchContactsByFolderId', async (id) => {
	const { cn } = await network.soapFetch(
		'Search',
		{
			_jsns: 'urn:zimbraMail',
			limit: '500',
			offset: 0,
			sortBy: 'nameAsc',
			types: 'contact',
			query: {
				_content: `inid:"${id}"`
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

export const fetchContact = createAsyncThunk('contacts/fetchContact', async (ids: string[]) => {
	const currentContacts: {[k: string]: string}[] = [];
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

function syncContactsPending(state: IContactsSlice) {
	state.status = 'syncing';
}

function syncContactsFullFilled(state: IContactsSlice) {
	state.status = 'succeeded';
}

function syncContactsRejected(state: IContactsSlice) {
	state.status = 'failed';
}

function fetchContactsPending() {
	console.log('Pending');
}

function fetchContactsFullFilled(state: IContactsSlice, { payload }) {
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

function fetchContactsRejected() {
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
		contacts: {},
	},
	reducers: { },
	extraReducers: {
		[handleSyncData.pending]: produce(syncContactsPending),
		[handleSyncData.fulfilled]: produce(syncContactsFullFilled),
		[handleSyncData.rejected]: produce(syncContactsRejected),
		[fetchContact.pending]: produce(fetchContactsPending),
		[fetchContact.fulfilled]: produce(fetchContactsFullFilled),
		[fetchContact.rejected]: produce(fetchContactsRejected),
		[fetchContactsByFolderId.pending]: produce(fetchContactsPending),
		[fetchContactsByFolderId.fulfilled]: produce(fetchContactsFullFilled),
		[fetchContactsByFolderId.rejected]: produce(fetchContactsRejected),
	}
});

export default contactsSlice.reducer;

export function selectAllContactsInFolder({ contacts }: IState, id: string) {
	if (contacts && contacts.contacts[id]) {
		return contacts.contacts[id];
	}
	return [];
}

export interface IState {
	sync: ISyncSlice;
	folders: IFoldersSlice;
	contacts: IContactsSlice;
}

export interface IContactsSlice {
	status: string;
	contacts: {[k: string]: Contact[]};
}

export interface ISyncSlice {
	status: string;
	intervalId: number;
	token: string;
}

export interface IFoldersSlice {
	status: string;
	folders: {[k: string]: ContactsFolder[]};
}

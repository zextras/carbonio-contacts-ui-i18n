import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { network } from '@zextras/zapp-shell';
import { isEmpty, reduce, filter } from 'lodash';
import produce from 'immer';
import { Contact, normalizeContact, GetIdsFromContacts } from '../db/contact';
import { normalizeContactAttrsToSoapOp } from '../soap';
import { IContactsSlice, IState } from './store-type';

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
	const contacts = reduce(
		cn || [],
		(r, c) => {
			if ((c._attrs).type && (c._attrs).type === 'group') return r;
			r.push(
				normalizeContact(c)
			);
			return r;
		},
		[] as Contact[]
	);
	return {
		contacts,
		folderId: id
	};
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
		[] as Contact[]
	);
});

export const addContact = createAsyncThunk('contacts/addContact', async (contact: Contact) => {
	const { cn } = await network.soapFetch(
		'CreateContact',
		{
			_jsns: 'urn:zimbraMail',
			cn: {
				m: [],
				l: contact.parent,
				a: normalizeContactAttrsToSoapOp(contact)
			}
		}
	);
	return cn;
});

export const updateContact = createAsyncThunk('contacts/updateContact', async (contact: Contact) => {
	const { cn } = await network.soapFetch(
		'ModifyContact',
		{
			_jsns: 'urn:zimbraMail',
			force: '1',
			replace: '0',
			cn: {
				m: [],
				id: contact.id,
				a: normalizeContactAttrsToSoapOp(contact)
			}
		}
	);
	return cn;
});

export const handleSyncData = createAsyncThunk('contacts/handleSyncData', async ({
	firstSync, cn
}: any, { dispatch }) => {
	if (!firstSync) {
		const updatedContacts = GetIdsFromContacts(cn || []);
		if (!isEmpty(updatedContacts)) {
			await dispatch(fetchContact(updatedContacts));
		}
	}
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

function fetchContactsPending(state: IContactsSlice) {
	console.log('Pending');
}

function fetchContactsFullFilled(state: IContactsSlice, { payload }: any) {
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

function fetchContactsByFolderIdFullFilled(state: IContactsSlice, { payload }: any) {
	const { contacts, folderId } = payload;
	if (contacts.length > 0) {
		reduce(
			contacts,
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
	else {
		state.contacts[folderId] = [];
	}
}

function fetchContactsRejected(state: IContactsSlice) {
	console.log('failed');
}

function addContactPending(state: IContactsSlice) {
	console.log('pending');
}

function addContactFullFilled(state: IContactsSlice, { payload }: any) {
	state.contacts[payload[0].l].push(normalizeContact(payload[0]));
}

function addContactRejected(state: IContactsSlice) {
	console.log('failed');
}

function updateContactPending(state: IContactsSlice) {
	console.log('pending');
}

function updateContactFullFilled(state: IContactsSlice, { payload }: any) {
	//state.contacts[payload[0].l].push(normalizeContact(payload[0]));
	console.log(payload);
}

function updateContactRejected(state: IContactsSlice) {
	console.log('failed');
}

export const contactsSlice = createSlice({
	name: 'contacts',
	initialState: {
		status: 'idle',
		contacts: {},
	},
	reducers: { },
	extraReducers: (builder) => {
		builder.addCase(handleSyncData.pending, produce(syncContactsPending));
		builder.addCase(handleSyncData.fulfilled, produce(syncContactsFullFilled));
		builder.addCase(handleSyncData.rejected, produce(syncContactsRejected));
		builder.addCase(fetchContact.pending, produce(fetchContactsPending));
		builder.addCase(fetchContact.fulfilled, produce(fetchContactsFullFilled));
		builder.addCase(fetchContact.rejected, produce(fetchContactsRejected));
		builder.addCase(fetchContactsByFolderId.pending, produce(fetchContactsPending));
		builder.addCase(fetchContactsByFolderId.fulfilled, produce(fetchContactsByFolderIdFullFilled));
		builder.addCase(fetchContactsByFolderId.rejected, produce(fetchContactsRejected));
		builder.addCase(addContact.pending, produce(addContactPending));
		builder.addCase(addContact.fulfilled, produce(addContactFullFilled));
		builder.addCase(addContact.rejected, produce(addContactRejected));
		builder.addCase(updateContact.pending, produce(updateContactPending));
		builder.addCase(updateContact.fulfilled, produce(updateContactFullFilled));
		builder.addCase(updateContact.rejected, produce(updateContactRejected));
	}
});

export default contactsSlice.reducer;

export function selectAllContactsInFolder({ contacts }: IState, id: string) {
	if (contacts && contacts.contacts[id]) {
		return contacts.contacts[id];
	}
	return undefined;
}

export function selectContact({ contacts }: IState, folderId: number, id: string) {
	if (contacts && contacts.contacts[folderId]) {
		return contacts.contacts[folderId].find((item) => item.id === id);
	}
	return undefined;
}

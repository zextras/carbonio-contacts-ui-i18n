import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { network } from '@zextras/zapp-shell';
import {
	isEmpty,
	reduce,
	filter,
	findIndex,
	remove
} from 'lodash';
import produce from 'immer';
import { Contact } from '../types/contact';
import { SoapContact } from '../types/soap';
import { ContactsSlice, State } from '../types/store';
import { normalizeContact } from './normalize-contact-from-soap';
import { normalizeContactAttrsToSoapOp } from './normalize-contact-to-soap';

function GetIdsFromContacts(contacts: SoapContact[]): string[] {
	const accValue: string[] = [];
	return reduce(
		contacts || [],
		(acc, v) => acc.concat(v.id), // todo: check if already in state (if in state no need to fetch)
		accValue
	);
}

function removeContactFromStore(state: ContactsSlice, id: string): void {
	reduce(
		state.contacts,
		(acc, v) => {
			const filtered = filter(v, (item) => item.id === id);
			if (filtered.length > 0) {
				remove(v, filtered[0]);
			}
			return acc;
		},
		{},
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

export const fetchAndUpdateContacts = createAsyncThunk('contacts/fetchAndUpdateContacts', async (ids: string[]) => {
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

export const modifyContact = createAsyncThunk('contacts/modifyContact', async (contact: Contact) => {
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

export const deleteContact = createAsyncThunk('contacts/deleteContact', async (contact: Contact) => {
	if (contact.parent === '3') {
		const { cn } = await network.soapFetch(
			'ContactAction',
			{
				_jsns: 'urn:zimbraMail',
				action: {
					id: contact.id,
					op: 'delete'
				}
			}
		);
		return cn;
	}
	const { cn } = await network.soapFetch(
		'ContactAction',
		{
			_jsns: 'urn:zimbraMail',
			action: {
				id: contact.id,
				l: '3',
				op: 'move'
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
			await dispatch(fetchAndUpdateContacts(updatedContacts));
		}
	}
});

function syncContactsPending(state: ContactsSlice): void {
	state.status = 'syncing';
}

function syncContactsFullFilled(state: ContactsSlice): void {
	state.status = 'succeeded';
}

function syncContactsRejected(state: ContactsSlice): void {
	state.status = 'failed';
}

function fetchContactsPending(state: ContactsSlice): ContactsSlice {
	return state;
}

function fetchContactsFullFilled(state: ContactsSlice, { payload }: any): void {
	removeContactFromStore(state, payload[0].id);
	// add updated contact
	reduce(
		payload,
		(acc, v) => {
			if (!acc[v.parent]) {
				return acc;
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

function fetchContactsByFolderIdFullFilled(state: ContactsSlice, { payload }: any): void {
	const { contacts, folderId } = payload;
	if (contacts.length > 0) {
		reduce(
			contacts,
			(r, v) => {
				if (!r[v.parent]) {
					r[v.parent] = [];
				}
				const el = filter(r[v.parent], (item) => item.id === v.id);
				if (el.length > 0) {
					return r;
				}
				r[v.parent].push(v);
				return r;
			},
			state.contacts,
		);
	}
	else {
		state.contacts[folderId] = [];
	}
}

function fetchContactsRejected(state: ContactsSlice): ContactsSlice {
	return state;
}

function addContactPending(state: ContactsSlice): ContactsSlice {
	return state;
}

function addContactFullFilled(state: ContactsSlice, { payload }: any): void {
	if (state && state.contacts && state.contacts[payload[0].l]) {
		state.contacts[payload[0].l].push(normalizeContact(payload[0]));
	}
}

function addContactRejected(state: ContactsSlice): ContactsSlice {
	return state;
}

function updateContactPending(state: ContactsSlice): ContactsSlice {
	return state;
}

function updateContactFullFilled(state: ContactsSlice, { payload, meta }: any): void {
	const folderId = payload[0].l;
	const contactId = payload[0].id;
	const index = findIndex(state.contacts[folderId], ['id', contactId]);
	state.contacts[folderId][index] = meta.arg;
}

function updateContactRejected(state: ContactsSlice): ContactsSlice {
	return state;
}

function deleteContactPending(state: ContactsSlice): ContactsSlice {
	return state;
}

function deleteContactFullFilled(state: ContactsSlice, { meta }: any): void {
	const { id, parent } = meta.arg;
	removeContactFromStore(state, id);
	if (parent !== '3' && state.contacts[3]) {
		const obj = {
			...meta.arg,
			parent: '3'
		};
		state.contacts[3].push(obj);
	}
}

function deleteContactRejected(state: ContactsSlice): ContactsSlice {
	return state;
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
		builder.addCase(fetchAndUpdateContacts.pending, produce(fetchContactsPending));
		builder.addCase(fetchAndUpdateContacts.fulfilled, produce(fetchContactsFullFilled));
		builder.addCase(fetchAndUpdateContacts.rejected, produce(fetchContactsRejected));
		builder.addCase(fetchContactsByFolderId.pending, produce(fetchContactsPending));
		builder.addCase(fetchContactsByFolderId.fulfilled, produce(fetchContactsByFolderIdFullFilled));
		builder.addCase(fetchContactsByFolderId.rejected, produce(fetchContactsRejected));
		builder.addCase(addContact.pending, produce(addContactPending));
		builder.addCase(addContact.fulfilled, produce(addContactFullFilled));
		builder.addCase(addContact.rejected, produce(addContactRejected));
		builder.addCase(modifyContact.pending, produce(updateContactPending));
		builder.addCase(modifyContact.fulfilled, produce(updateContactFullFilled));
		builder.addCase(modifyContact.rejected, produce(updateContactRejected));
		builder.addCase(deleteContact.pending, produce(deleteContactPending));
		builder.addCase(deleteContact.fulfilled, produce(deleteContactFullFilled));
		builder.addCase(deleteContact.rejected, produce(deleteContactRejected));
	}
});

export default contactsSlice.reducer;

export function selectAllContactsInFolder({ contacts }: State, id: string): Contact[] | undefined {
	if (contacts && contacts.contacts[id]) {
		return contacts.contacts[id];
	}
	return undefined;
}

export function selectContact({ contacts }: State, folderId: number, id: string): Contact | undefined {
	if (contacts && contacts.contacts[folderId]) {
		return contacts.contacts[folderId].find((item) => item.id === id);
	}
	return undefined;
}

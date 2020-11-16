import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { network } from '@zextras/zapp-shell';
import {
	isEmpty,
	reduce,
	filter,
	find,
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
		(acc, v) => acc.concat(v.id),
		accValue
	);
}

function removeTempIdAndAssignItsOwn(state: ContactsSlice, folderId: string, id: string): void {
	reduce(
		state.contacts,
		(acc, v) => {
			const contact = find(v, (item: any) => !item.id);
			if (contact && contact._id) {
				delete contact._id;
				contact.id = id;
			}
			return acc;
		},
		{},
	);
}

function removeTemporaryContactsFromStore(state: ContactsSlice): void {
	reduce(
		state.contacts,
		(acc, v) => {
			const filteredWithoutId = filter(v, (item) => !item.id);
			console.log(filteredWithoutId.length);
			if (filteredWithoutId.length) {
				remove(v, (item) => !item.id);
			}
			return acc;
		},
		{},
	);
}

function removeContactsFromStore(state: ContactsSlice, id: string): void {
	reduce(
		state.contacts,
		(acc, v) => {
			/*			const filteredWithoutId = filter(v, (item) => !item.id);
			console.log(filteredWithoutId.length);
			if (filteredWithoutId.length) {
				remove(v, (item) => !item.id);
			} */
			const filteredWithId = filter(v, (item) => item.id === id);
			console.log(filteredWithId.length);
			if (filteredWithId.length) {
				remove(v, (item) => item.id === id);
			}
			return acc;
		},
		{},
	);
}

function addContactToStore(state: ContactsSlice, payload: any) {
	reduce(
		payload,
		(acc, v) => {
			if (!acc[v.parent]) {
				return acc;
			}
			acc[v.parent].push(v);
			return acc;
		},
		state.contacts,
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
	const currentContacts: {[id: string]: string}[] = [];
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

export const modifyContact = createAsyncThunk('contacts/modifyContact', async ({ updatedContact }: {[k: string]: Contact}) => {
	const { cn } = await network.soapFetch(
		'ModifyContact',
		{
			_jsns: 'urn:zimbraMail',
			force: '1',
			replace: '0',
			cn: {
				m: [],
				id: updatedContact.id,
				a: normalizeContactAttrsToSoapOp(updatedContact)
			}
		}
	);
	return cn;
});

export const deleteContact = createAsyncThunk('contacts/deleteContact', async ({ contact }: any) => {
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

function fetchContactsPending(state: ContactsSlice): void {
	state.status = 'fetching';
}

function fetchContactsFullFilled(state: ContactsSlice, { payload }: any): void {
	removeTemporaryContactsFromStore(state);
	removeContactsFromStore(state, payload[0].id);
	addContactToStore(state, payload);
}

function fetchContactsByFolderIdFullFilled(state: ContactsSlice, { payload }: any): void {
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

function fetchContactsRejected(state: ContactsSlice): ContactsSlice {
	return state;
}

function addContactPending(state: ContactsSlice, { meta }: any): void {
	if (state && state.contacts && state.contacts[meta.arg.parent]) {
		state.contacts[meta.arg.parent].push(meta.arg);
	}
}

function addContactFullFilled(state: ContactsSlice, { payload }: any): void {
	removeTempIdAndAssignItsOwn(state, payload[0].l, payload[0].id);
}

function addContactRejected(state: ContactsSlice, { meta }: any): void {
	removeContactsFromStore(state, meta.arg._id);
}

function updateContactPending(state: ContactsSlice, { meta }: any): void {
	const folderId = meta.arg.updatedContact.parent;
	const contactId = meta.arg.updatedContact.id;
	const index = findIndex(state.contacts[folderId], ['id', contactId]);
	state.contacts[folderId][index] = meta.arg.updatedContact;
}

function updateContactFullFilled(state: ContactsSlice): void {
}

function updateContactRejected(state: ContactsSlice, { meta }: any): void {
	const folderId = meta.arg.prevContact.parent;
	const contactId = meta.arg.prevContact.id;
	const index = findIndex(state.contacts[folderId], ['id', contactId]);
	state.contacts[folderId][index] = meta.arg.prevContact;
}

function deleteContactPending(state: ContactsSlice, { meta }: any): void {
	console.log(meta);
	const { id, parent } = meta.arg.contact;
	removeContactsFromStore(state, id);
	if (parent !== '3' && state.contacts[3]) {
		const obj = {
			...meta.arg,
			parent: '3'
		};
		state.contacts[3].push(obj);
	}
}

function deleteContactFullFilled(state: ContactsSlice): void {
}

function deleteContactRejected(state: ContactsSlice, { meta }: any): void {
	state.contacts[meta.arg.parent].push(meta.arg.contact);
}
export const contactsSlice = createSlice({
	name: 'contacts',
	initialState: {
		status: 'idle',
		contacts: {},
	},
	reducers: { },
	extraReducers: (builder) => {
		builder
			.addCase(handleSyncData.pending, produce(syncContactsPending))
			.addCase(handleSyncData.fulfilled, produce(syncContactsFullFilled))
			.addCase(handleSyncData.rejected, produce(syncContactsRejected))
			.addCase(fetchAndUpdateContacts.pending, produce(fetchContactsPending))
			.addCase(fetchAndUpdateContacts.fulfilled, produce(fetchContactsFullFilled))
			.addCase(fetchAndUpdateContacts.rejected, produce(fetchContactsRejected))
			.addCase(fetchContactsByFolderId.pending, produce(fetchContactsPending))
			.addCase(fetchContactsByFolderId.fulfilled, produce(fetchContactsByFolderIdFullFilled))
			.addCase(fetchContactsByFolderId.rejected, produce(fetchContactsRejected))
			.addCase(addContact.pending, produce(addContactPending))
			.addCase(addContact.fulfilled, produce(addContactFullFilled))
			.addCase(addContact.rejected, produce(addContactRejected))
			.addCase(modifyContact.pending, produce(updateContactPending))
			.addCase(modifyContact.fulfilled, produce(updateContactFullFilled))
			.addCase(modifyContact.rejected, produce(updateContactRejected))
			.addCase(deleteContact.pending, produce(deleteContactPending))
			.addCase(deleteContact.fulfilled, produce(deleteContactFullFilled))
			.addCase(deleteContact.rejected, produce(deleteContactRejected));
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

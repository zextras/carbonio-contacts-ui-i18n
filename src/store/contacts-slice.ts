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
import {
	AddContactRequest,
	AddContactAction,
	ContactsSlice,
	DeleteContactAction,
	FetchContactsByFolderId,
	GetContactAction,
	State, ModifyContactAction,
} from '../types/store';
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
			const contact = find(v, (item) => !item.id);
			if (contact && contact._id) {
				delete contact._id;
				contact.id = id;
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
			const filteredWithId = filter(v, (item) => item.id === id);
			if (filteredWithId.length) {
				remove(v, (item) => item.id === id);
			}
			return acc;
		},
		{},
	);
}

function addContactToStore(state: ContactsSlice, payload: Contact[]): void {
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

export const fetchContactsByFolderId = createAsyncThunk('contacts/fetchContactsByFolderId', async (id: string) => {
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

export const modifyContact = createAsyncThunk('contacts/modifyContact', async ({ updatedContact, editContact }: { updatedContact: Contact; editContact: Contact }) => {
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

export const deleteContact = createAsyncThunk('contacts/deleteContact', async ({ contact, parent }: { contact: Contact; parent: string }) => {
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
}: { firstSync: boolean; cn: SoapContact[]}, { dispatch }) => {
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

function fetchContactsFullFilled(state: ContactsSlice, { payload }: GetContactAction): void {
	if (payload[0].id) {
		removeContactsFromStore(state, payload[0].id);
	}
	addContactToStore(state, payload);
	state.status = 'succeeded';
}

function fetchContactsByFolderIdFullFilled(state: ContactsSlice, { payload }: FetchContactsByFolderId): void {
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

function fetchContactsRejected(state: ContactsSlice): void {
	state.status = 'rejected';
}

function addContactPending(state: ContactsSlice, { meta }: AddContactRequest): void {
	if (state && state.contacts && state.contacts[meta.arg.parent]) {
		state.contacts[meta.arg.parent].push(meta.arg);
	}
}

function addContactFullFilled(state: ContactsSlice, { payload }: AddContactAction): void {
	removeTempIdAndAssignItsOwn(state, payload[0].l, payload[0].id);
}

function addContactRejected(state: ContactsSlice, { meta }: AddContactRequest): void {
	if (meta.arg._id) {
		removeContactsFromStore(state, meta.arg._id);
	}
}

function updateContactPending(state: ContactsSlice, { meta }: ModifyContactAction): void {
	const { parent } = meta.arg.updatedContact;
	const { id } = meta.arg.updatedContact;
	const index = findIndex(state.contacts[parent], ['id', id]);
	state.contacts[parent][index] = meta.arg.updatedContact;
}

function updateContactFullFilled(state: ContactsSlice): ContactsSlice {
	return state;
}

function updateContactRejected(state: ContactsSlice, { meta }: ModifyContactAction): void {
	const { parent } = meta.arg.editContact;
	const { id } = meta.arg.editContact;
	const index = findIndex(state.contacts[parent], ['id', id]);
	state.contacts[parent][index] = meta.arg.editContact;
}

function deleteContactPending(state: ContactsSlice, { meta }: DeleteContactAction): void {
	const { id, parent } = meta.arg.contact;
	if (id) {
		removeContactsFromStore(state, id);
	}
	if (parent !== '3' && state.contacts[3]) {
		const obj = {
			...meta.arg.contact,
			parent: '3'
		};
		state.contacts[3].push(obj);
	}
}

function deleteContactFullFilled(state: ContactsSlice): ContactsSlice {
	return state;
}

function deleteContactRejected(state: ContactsSlice, { meta }: DeleteContactAction): void {
	state.contacts[meta.arg.parent].push(meta.arg.contact);
}
export const contactsSlice = createSlice({
	name: 'contacts',
	initialState: {
		status: 'idle',
		contacts: {} as { [k: string]: Contact[]},
	}as ContactsSlice,
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

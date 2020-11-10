import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { network } from '@zextras/zapp-shell';
import { isEmpty, reduce, filter, findIndex, remove } from 'lodash';
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
	const obj = {
		...contact,
		parent: '3'
	};
	const { cn } = await network.soapFetch(
		'ContactAction',
		{
			_jsns: 'urn:zimbraMail',
			action: {
				id: obj.id,
				l: obj.parent,
				op: 'move'
			}
		}
	);
	return cn;
});

export const handleSyncData = createAsyncThunk('contacts/handleSyncData', async ({
	firstSync, cn, deleted
}: any, { dispatch, getState }) => {
	if (!firstSync) {
		const updatedContacts = GetIdsFromContacts(cn || []);
		if (!isEmpty(updatedContacts)) {
			await dispatch(fetchAndUpdateContacts(updatedContacts));
		}
		if (!isEmpty(deleted)) {
			console.log(deleted);
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
	// delete old contact
	reduce(
		state.contacts,
		(acc, v, k) => {
			const filtered = filter(v, (item) => item.id === payload[0].id);
			if (filtered.length > 0) {
				remove(v, filtered[0]);
			}
			return acc;
		},
		{},
	);
	// add new contact
	reduce(
		payload,
		(acc, v) => {
			console.log(v);
			if (!acc[v.parent]) {
				return acc;
			}
			const el = filter(acc[v.parent], (item) => item.id === v.id);
			if (el.length > 0) {
				console.log(el);
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

function updateContactFullFilled(state: IContactsSlice, { payload, meta }: any) {
	const folderId = payload[0].l;
	const contactId = payload[0].id;
	const index = findIndex(state.contacts[folderId], ['id', contactId]);
	state.contacts[folderId][index] = meta.arg;
}

function updateContactRejected(state: IContactsSlice) {
	console.log('failed');
}

function deleteContactPending(state: IContactsSlice) {
	console.log('pending');
}

function deleteContactFullFilled(state: IContactsSlice) {

}

function deleteContactRejected(state: IContactsSlice) {
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

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
import { rest } from 'msw';
import { handleGetContactsRequest } from './handle-get-contacts-request';
import { handleContactActionRequest } from './handle-contact-action-request';
import { handleCreateContactRequest } from './handle-create-contact-request';
import { handleModifyContactRequest } from './handle-modify-contact-request';
import { handleSearchRequest } from './handle-search-request';
import { handleSyncRequest } from './handle-sync-request';

const handlers = [
	rest.post('/service/soap/SyncRequest', handleSyncRequest),
	rest.post('/service/soap/GetContactsRequest', handleGetContactsRequest),
	rest.post('/service/soap/SearchRequest', handleSearchRequest),
	rest.post('/service/soap/CreateContactRequest', handleCreateContactRequest),
	rest.post('/service/soap/ModifyContactRequest', handleModifyContactRequest),
	rest.post('/service/soap/ContactActionRequest', handleContactActionRequest)
];

export default handlers;

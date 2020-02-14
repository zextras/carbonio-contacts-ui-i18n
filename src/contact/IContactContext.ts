/*
 * *** BEGIN LICENSE BLOCK *****
 * Copyright (C) 2011-2020 ZeXtras
 *
 * The contents of this file are subject to the ZeXtras EULA;
 * you may not use this file except in compliance with the EULA.
 * You may obtain a copy of the EULA at
 * http://www.zextras.com/zextras-eula.html
 * *** END LICENSE BLOCK *****
 */


import { Contact } from '../idb/IContactsIdb';
import { ContactPhoneType } from '../idb/ContactEnums';

export interface EditContact extends Contact {
    tempMail: {
        mail: string;
    };
    tempPhone: {
        number: string;
        name: ContactPhoneType;
    };
}

export default interface IContactContext {
    contact: Contact;
    editContact: EditContact;
    dispatch: (action: object) => void;
    save: () => void;
};

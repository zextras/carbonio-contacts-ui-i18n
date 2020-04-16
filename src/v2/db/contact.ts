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

export enum ContactPhoneType {
	MOBILE = 'mobile',
	WORK = 'work',
	HOME = 'home',
	OTHER = 'other'
}

export enum ContactAddressType {
	OTHER = 'other',
	WORK = 'work',
	HOME = 'home'
}

export type ContactAddress = {
	type: ContactAddressType;
	street: string;
	city: string;
	postalCode: string;
	country: string;
	state: string;
}

export type ContactEmail = {
	mail: string;
};

export type ContactPhone = {
	number: string;
	name: ContactPhoneType;
};

export interface IContact {
	/** Internal UUID */ _id?: string;
	/** Zimbra ID */ id?: string;
	firstName: string;
	lastName: string;
	parent: string;
	address: ContactAddress[];
	company: string;
	department: string;
	mail: ContactEmail[];
	image: string;
	jobTitle: string;
	notes: string;
	phone: ContactPhone[];
	nameSuffix: string;
}

export class Contact implements IContact {
	parent: string;

	id?: string;

	_id?: string;

	address: ContactAddress[];

	company: string;

	department: string;

	mail: ContactEmail[];

	firstName: string;

	lastName: string;

	image: string;

	jobTitle: string;

	notes: string;

	phone: ContactPhone[];

	nameSuffix: string;

	constructor({
		parent,
		id,
		address,
		company,
		department,
		mail,
		firstName,
		lastName,
		image,
		jobTitle,
		notes,
		phone,
		nameSuffix
	}: IContact) {
		this.parent = parent;
		this.id = id;
		this.address = address;
		this.company = company;
		this.department = department;
		this.mail = mail;
		this.firstName = firstName;
		this.lastName = lastName;
		this.image = image;
		this.jobTitle = jobTitle;
		this.notes = notes;
		this.phone = phone;
		this.nameSuffix = nameSuffix;
	}
}

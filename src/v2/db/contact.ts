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

export enum ContactUrlType {
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
	type: ContactPhoneType;
};

export type ContactUrl = {
	url: string;
	type: ContactUrlType;
}

export interface IContact {
	/** Internal UUID */ _id?: string;
	/** Zimbra ID */ id?: string;
	firstName: string;
	middleName: string;
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
	namePrefix: string;
	url: ContactUrl[];
}

export class Contact implements IContact {
	parent: string;

	id?: string;

	_id?: string;

	address: ContactAddress[];

	company: string;

	department: string;

	mail: ContactEmail[];

	namePrefix: string;

	firstName: string;

	middleName: string;

	lastName: string;

	nameSuffix: string;

	image: string;

	jobTitle: string;

	notes: string;

	phone: ContactPhone[];

	url: ContactUrl[];

	constructor({
		_id,
		parent,
		id,
		address,
		company,
		department,
		mail,
		namePrefix,
		firstName,
		middleName,
		lastName,
		nameSuffix,
		image,
		jobTitle,
		notes,
		phone,
		url
	}: IContact) {
		this._id = _id;
		this.parent = parent;
		this.id = id;
		this.address = address;
		this.company = company;
		this.department = department;
		this.mail = mail;
		this.namePrefix = namePrefix;
		this.firstName = firstName;
		this.middleName = middleName;
		this.lastName = lastName;
		this.nameSuffix = nameSuffix;
		this.image = image;
		this.jobTitle = jobTitle;
		this.notes = notes;
		this.phone = phone;
		this.url = url;
	}

	public toMap() {
		return {
			_id: this._id,
			id: this.id,
			parent: this.parent,
			address: this.address,
			company: this.company,
			department: this.department,
			mail: this.mail,
			firstName: this.firstName,
			lastName: this.lastName,
			image: this.image,
			jobTitle: this.jobTitle,
			notes: this.notes,
			phone: this.phone,
			nameSuffix: this.nameSuffix,
			namePrefix: this.namePrefix
		};
	}
}

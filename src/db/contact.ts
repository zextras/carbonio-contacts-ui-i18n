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
	street?: string;
	city?: string;
	postalCode?: string;
	country?: string;
	state?: string;
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

export type ContactAddressMap = { [key: string]: ContactAddress };
export type ContactEmailMap = { [key: string]: ContactEmail };
export type ContactPhoneMap = { [key: string]: ContactPhone };
export type ContactUrlMap = { [key: string]: ContactUrl };

export interface IContact {
	/** Internal UUID */ _id?: string;
	/** Zimbra ID */ id?: string;
	firstName: string;
	middleName: string;
	lastName: string;
	nickName: string;
	parent: string;
	address: ContactAddressMap;
	company: string;
	department: string;
	email: ContactEmailMap;
	image: string;
	jobTitle: string;
	notes: string;
	phone: ContactPhoneMap;
	nameSuffix: string;
	namePrefix: string;
	URL: ContactUrlMap;
}

export class Contact implements IContact {
	parent: string;

	id?: string;

	_id?: string;

	address: { [key: string]: ContactAddress };

	company: string;

	department: string;

	email: { [key: string]: ContactEmail };

	namePrefix: string;

	firstName: string;

	middleName: string;

	lastName: string;

	nickName: string;

	nameSuffix: string;

	image: string;

	jobTitle: string;

	notes: string;

	phone: { [key: string]: ContactPhone };

	URL: { [key: string]: ContactUrl };

	constructor({
		_id,
		parent,
		id,
		address,
		company,
		department,
		email,
		namePrefix,
		firstName,
		middleName,
		lastName,
		nickName,
		nameSuffix,
		image,
		jobTitle,
		notes,
		phone,
		URL
	}: IContact) {
		this._id = _id;
		this.parent = parent;
		this.id = id;
		this.address = address;
		this.company = company;
		this.department = department;
		this.email = email;
		this.namePrefix = namePrefix;
		this.firstName = firstName;
		this.middleName = middleName;
		this.lastName = lastName;
		this.nickName = nickName;
		this.nameSuffix = nameSuffix;
		this.image = image;
		this.jobTitle = jobTitle;
		this.notes = notes;
		this.phone = phone;
		this.URL = URL;
	}

	public toMap(): IContact {
		return {
			_id: this._id,
			id: this.id,
			parent: this.parent,
			address: this.address,
			company: this.company,
			department: this.department,
			email: this.email,
			nameSuffix: this.nameSuffix,
			firstName: this.firstName,
			middleName: this.middleName,
			lastName: this.lastName,
			nickName: this.nickName,
			namePrefix: this.namePrefix,
			image: this.image,
			jobTitle: this.jobTitle,
			notes: this.notes,
			phone: this.phone,
			URL: this.URL,
		};
	}
}

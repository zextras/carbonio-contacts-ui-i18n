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

import {ContactPhoneType} from "../../idb/ContactEnums";

interface SelectItem {
	id: string;
	label: string;
	value: string;
}

export const suffixItems = (t: (label: string) => string): Array<SelectItem> => [
	{
		id: 'suffix.Mr',
		label: t('contact.label.suffix.Mr'),
		value: 'Mr.',
	},
	{
		id: 'suffix.Miss',
		label: t('contact.label.suffix.Miss'),
		value: 'Miss',
	},
	{
		id: 'suffix.Mrs',
		label: t('contact.label.suffix.Mrs'),
		value: 'Mrs.',
	},
	{
		id: 'suffix.Ms',
		label: t('contact.label.suffix.Ms'),
		value: 'Ms.',
	},
	{
		id: 'suffix.Mx',
		label: t('contact.label.suffix.Mx'),
		value: 'Mx.',
	},
	{
		id: 'suffix.Sir',
		label: t('contact.label.suffix.Sir'),
		value: 'Sir',
	},
	{
		id: 'suffix.Dr',
		label: t('contact.label.suffix.Dr'),
		value: 'Dr.',
	},
	{
		id: 'suffix.Lady',
		label: t('contact.label.suffix.Lady'),
		value: 'Lady',
	},
	{
		id: 'suffix.Lord',
		label: t('contact.label.suffix.Lord'),
		value: 'Lord',
	}
];

export const phoneTypeItems = (t: (label: string) => string): Array<SelectItem> => [
	{
		id: ContactPhoneType.OTHER,
		label: t(`contact.label.phone.${ContactPhoneType.OTHER}`),
		value: ContactPhoneType.OTHER
	},
	{
		id: ContactPhoneType.WORK,
		label: t(`contact.label.phone.${ContactPhoneType.WORK}`),
		value: ContactPhoneType.WORK
	},
	{
		id: ContactPhoneType.HOME,
		label: t(`contact.label.phone.${ContactPhoneType.HOME}`),
		value: ContactPhoneType.HOME
	},
	{
		id: ContactPhoneType.MOBILE,
		label: t(`contact.label.phone.${ContactPhoneType.MOBILE}`),
		value: ContactPhoneType.MOBILE
	},
];

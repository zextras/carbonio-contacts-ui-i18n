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
	label: string;
	value: string;
}

export const suffixItems = (t: (label: string) => string): Array<SelectItem> => [
	{
		label: t('contact.label.suffix.Mr'),
		value: 'Mr.',
	},
	{
		label: t('contact.label.suffix.Miss'),
		value: 'Miss',
	},
	{
		label: t('contact.label.suffix.Mrs'),
		value: 'Mrs.',
	},
	{
		label: t('contact.label.suffix.Ms'),
		value: 'Ms.',
	},
	{
		label: t('contact.label.suffix.Mx'),
		value: 'Mx.',
	},
	{
		label: t('contact.label.suffix.Sir'),
		value: 'Sir',
	},
	{
		label: t('contact.label.suffix.Dr'),
		value: 'Dr.',
	},
	{
		label: t('contact.label.suffix.Lady'),
		value: 'Lady',
	},
	{
		label: t('contact.label.suffix.Lord'),
		value: 'Lord',
	}
];

export const phoneTypeItems = (t: (label: string) => string): Array<SelectItem> => [
	{
		label: t(`contact.label.phone.${ContactPhoneType.OTHER}`),
		value: ContactPhoneType.OTHER
	},
	{
		label: t(`contact.label.phone.${ContactPhoneType.WORK}`),
		value: ContactPhoneType.WORK
	},
	{
		label: t(`contact.label.phone.${ContactPhoneType.HOME}`),
		value: ContactPhoneType.HOME
	},
	{
		label: t(`contact.label.phone.${ContactPhoneType.MOBILE}`),
		value: ContactPhoneType.MOBILE
	},
];

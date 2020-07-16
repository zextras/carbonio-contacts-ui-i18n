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

import React from 'react';
import { renderHook, act } from '@testing-library/react-hooks';

import { useDisplayName } from './use-display-name';

const contacts = {
	empty: {
		firstName: '',
		middleName: '',
		lastName: '',
		mail: [],
		nameSuffix: '',
		namePrefix: '',
	},
	example: {
		firstName: 'Parker',
		middleName: 'Averill',
		lastName: 'Swindlehurst',
		mail: [{
			mail: 'swindlehurst@gmail.com'
		}],
		nameSuffix: 'Junior',
		namePrefix: 'Sir',
	},
	mailOnly: {
		mail: [{
			mail: 'swindlehurst@gmail.com'
		}]
	},
	undefined: {},
	partial: {
		firstName: 'Parker',
	},
	partial2: {
		lastName: 'Swindlehurst',
	},
}

describe('useDisplayName', () => {

	test('useDisplayName', () => {
		const { result, rerender } = renderHook(
			({ contact }) => useDisplayName(contact),
			{ initialProps: { contact: contacts.example}}
		);
		expect(result.current).toBe('Sir Parker Averill Swindlehurst Junior');

		rerender({ contact: contacts.mailOnly});
		expect(result.current).toBe('<No Name> swindlehurst@gmail.com');

		rerender({ contact: contacts.empty});
		expect(result.current).toBe('<No Data>');

		rerender({});
		expect(result.current).toBe('<No Data>');

		rerender({ contact: contacts.empty});
		expect(result.current).toBe('<No Data>');

		rerender({ contact: contacts.partial});
		expect(result.current).toBe('Parker');

		rerender({ contact: contacts.partial2});
		expect(result.current).toBe('Swindlehurst');
	});
});

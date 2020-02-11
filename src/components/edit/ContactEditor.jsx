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

import React, {
	useContext,
	useEffect,
	useState
} from 'react';
import { distinctUntilChanged } from 'rxjs/operators';
import { map, pick } from 'lodash';
import { useHistory } from 'react-router-dom';
import {
	Container,
	IconButton,
	Text,
	Avatar,
	Divider,
	Padding,
	Input
} from '@zextras/zapp-ui';
import { I18nCtxt } from '@zextras/zapp-shell/context';
import { addToQuery, deleteFromQuery } from '../../utils/utils';

function useObservable(observable) {
	const [value, setValue] = useState(observable.value);
	useEffect(() => {
		const sub = observable.pipe(distinctUntilChanged()).subscribe(setValue);
		return () => sub.unsubscribe();
	}, [observable]);
	return value;
}

export default function ContactEditor({ contactSrvc, id }) {
	const history = useHistory();
	const { t } = useContext(I18nCtxt);
	const contact = useObservable(contactSrvc.getContact(id));

	return (
		<Container
			background="bg_7"
			mainAlignment="flex-start"
			height="fit"
		>
			<Container
				orientation="horizontal"
				padding={{ horizontal: 'large', vertical: 'small' }}
				width="fill"
				mainAlignment="space-between"
			>
				<Avatar
					label={`${contact.firstName} ${contact.lastName}`}
					picture={contact.image}
					size="medium"
				/>
				<Container
					width="fill"
					padding={{
						left: 'medium'
					}}
					orientation="horizontal"
					mainAlignment="space-between"
				>
					<Text
						size="large"
						weight="medium"
					>
						{`${
							contact.nameSuffix ? contact.nameSuffix : ''
						} ${
							contact.firstName
						} ${
							contact.lastName
						}`}
					</Text>
					<IconButton
						icon="Close"
						onClick={() => history.push({
							search: deleteFromQuery(history.location.search, 'edit')
						})}
					/>
				</Container>
			</Container>
			<Divider style={{ minHeight: '1px' }} />
			<Container
				padding={{ all: 'large' }}
				orientation="vertical"
				mainAlignment="flex-start"
				crossAlignment="flex-start"
			>
				{ map(
					pick(
						contact,
						[
							'nameSuffix',
							'firstName',
							'lastName',
							'jobTitle',
							'department',
							'company'
						]
					),
					(value, key) => {
						if (value) {
							return (
								<Container padding={{ bottom:'medium' }}>
									<Input
										label={t(`contact.preview.label.${key}`)}
										backgroundColor="bg_9"
									/>
								</Container>
							);
						}
						return null;
					}
				)}
			</Container>
		</Container>

	);
};

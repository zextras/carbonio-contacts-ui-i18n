/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useMemo, useContext, useState, useEffect } from 'react';
import { Container, Input, Row, Button, Text, Icon } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { useDomainStore } from '../../../../../store/domain/store';
import { AccountContext } from './account-context';

const AccountOtpSection: FC = () => {
	const conext = useContext(AccountContext);
	const { accountDetail } = conext;
	const domainName = useDomainStore((state) => state.domain?.name);
	const cosList = useDomainStore((state) => state.cosList);
	const [cosItems, setCosItems] = useState<any[]>([]);
	const [t] = useTranslation();
	useEffect(() => {
		if (!!cosList && cosList.length > 0) {
			const arrayItem: any[] = [];
			cosList.forEach((item: any) => {
				arrayItem.push({
					label: item.name,
					value: item.id
				});
			});
			setCosItems(arrayItem);
		}
	}, [cosList]);
	return (
		<Container
			mainAlignment="flex-start"
			padding={{ left: 'large', right: 'extralarge', bottom: 'large' }}
		>
			<Row mainAlignment="flex-start" padding={{ left: 'small' }} width="100%">
				<Button
					label={t('domain.i_want_to_generate_an_otp_code', 'I WANT TO GENERATE AN OTP CODE')}
					// onClick={(): void => {}}
				/>
			</Row>
		</Container>
	);
};

export default AccountOtpSection;

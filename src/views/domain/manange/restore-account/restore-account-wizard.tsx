/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, ReactElement, useCallback, useMemo, useState } from 'react';
import { Container, Button } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { Section } from '../../../app/component/section';
import { HorizontalWizard } from '../../../app/component/hwizard';
import { RestoreAccountContext } from './restore-account-context';
import RestoreSelectAccountSection from './restore-select-account-section';
import RestoreAccountStartSection from './restore-account-start-section';
import RestoreAccountConfigSection from './restore-account-config-section';

const WizardInSection: FC<any> = ({ wizard, wizardFooter, setToggleWizardSection }) => {
	const { t } = useTranslation();
	return (
		<Section
			title={t('label.restore_account', 'Restore Account')}
			padding={{ all: '0' }}
			footer={wizardFooter}
			divider
			showClose
			onClose={(): void => {
				setToggleWizardSection(false);
			}}
		>
			{wizard}
		</Section>
	);
};

const RestoreAccountWizard: FC<{
	setShowRestoreAccountWizard: any;
	restoreAccountRequest: any;
}> = ({ setShowRestoreAccountWizard, restoreAccountRequest }) => {
	const { t } = useTranslation();
	const [wizardData, setWizardData] = useState();
	const onComplete = useCallback(() => {
		console.log('Completed');
	}, []);
	const [restoreAccountDetail, setRestoreAccountDetail] = useState<any>();
	const wizardSteps = useMemo(
		() => [
			{
				name: 'details',
				label: t('label.mailing_list', 'Mailing List'),
				icon: 'ListOutline',
				view: RestoreSelectAccountSection,
				CancelButton: (props: any): ReactElement => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={'CANCEL'}
						color="secondary"
						icon="CloseOutline"
						iconPlacement="right"
						onClick={(): void => {
							setShowRestoreAccountWizard(false);
						}}
					/>
				),
				PrevButton: (props: any) => (
					<Button
						{...props}
						label={t('label.next', 'NEXT')}
						icon="ChevronRightOutline"
						iconPlacement="right"
					/>
				),
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('label.next', 'NEXT')}
						icon="ChevronRightOutline"
						iconPlacement="right"
					/>
				)
			},
			{
				name: 'members',
				label: t('label.members', 'Members'),
				icon: 'PeopleOutline',
				view: RestoreAccountConfigSection,
				CancelButton: (props: any): ReactElement => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={'CANCEL'}
						color="secondary"
						icon="CloseOutline"
						iconPlacement="right"
						onClick={(): void => {
							setShowRestoreAccountWizard(false);
						}}
					/>
				),
				PrevButton: (props: any) => (
					<Button
						{...props}
						label={t('label.back', 'BACK')}
						icon="ChevronLeftOutline"
						color="secondary"
						iconPlacement="left"
					/>
				),
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('label.next', 'NEXT')}
						icon="ChevronRightOutline"
						iconPlacement="right"
					/>
				)
			},
			{
				name: 'create',
				label: t('label.create', 'Create'),
				icon: 'PowerOutline',
				view: RestoreAccountStartSection,
				CancelButton: (props: any): ReactElement => (
					<Button
						{...props}
						type="outlined"
						key="wizard-cancel"
						label={'CANCEL'}
						color="secondary"
						icon="CloseOutline"
						iconPlacement="right"
						onClick={(): void => {
							setShowRestoreAccountWizard(false);
						}}
					/>
				),
				PrevButton: (props: any) => (
					<Button
						{...props}
						label={t('label.back', 'BACK')}
						icon="ChevronLeftOutline"
						color="secondary"
						iconPlacement="left"
					/>
				),
				NextButton: (props: any) => (
					<Button
						{...props}
						label={t('label.create', 'CREATE')}
						icon="PowerOutline"
						iconPlacement="right"
					/>
				)
			}
		],
		[t, setShowRestoreAccountWizard]
	);

	return (
		<Container background="gray5" mainAlignment="flex-start">
			<RestoreAccountContext.Provider value={{ restoreAccountDetail, setRestoreAccountDetail }}>
				<HorizontalWizard
					steps={wizardSteps}
					Wrapper={WizardInSection}
					onChange={setWizardData}
					onComplete={onComplete}
					setToggleWizardSection={setShowRestoreAccountWizard}
				/>
			</RestoreAccountContext.Provider>
		</Container>
	);
};

export default RestoreAccountWizard;

/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Row,
	Button,
	Padding,
	Text,
	Divider,
	Switch,
	Input,
	Table
} from '@zextras/carbonio-design-system';
import { Trans, useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	getSoapFetchRequest
} from '@zextras/carbonio-shell-ui';
import { fetchSoap } from '../../../services/bucket-service';
import ListRow from '../../list/list-row';
import CreateHsmPolicy from './create-hsm-policy/create-hsm-policy';
import EditHsmPolicy from './edit-hsm-policy/edit-hsm-policy';
import DeleteHsmPolicy from './delete-policy/delete-hsm-policy';
import { useServerStore } from '../../../store/server/store';

const HSMsettingPanel: FC = () => {
	const { operation, server }: { operation: string; server: string } = useParams();
	const [t] = useTranslation();
	const [isDirty, setIsDirty] = useState<boolean>(false);
	const [policies, setPolicies] = useState<any>([]);
	const [showCreateHsmPolicyView, setShowCreateHsmPolicyView] = useState<boolean>(false);
	const [showEditHsmPolicyView, setShowEditHsmPolicyView] = useState<boolean>(false);
	const [showDeletePolicyView, setShowDeletePolicyView] = useState<boolean>(false);
	const serverList = useServerStore((state) => state.serverList);
	const [isPowerstoreMoveSchedulerEnabled, setIsPowerstoreMoveSchedulerEnabled] =
		useState<boolean>(false);
	const [powerstoreMoveSchedulerValue, setPowerstoreMoveSchedulerValue] = useState<string>('');
	const [powerstoreSpaceThreshold, setPowerstoreSpaceThreshold] = useState<number>(0);
	const [deduplicateAfterScheduledMoveBlobs, setDeduplicateAfterScheduledMoveBlobs] =
		useState<boolean>(false);
	const headers = useMemo(
		() => [
			{
				id: 'plicy',
				label: t('hsm.policy_name', 'Policy Name'),
				width: '100%',
				bold: true
			}
		],
		[t]
	);
	const getHSMList = useCallback(() => {
		fetchSoap('zextras', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxPowerstore',
			action: 'getHSMPolicy',
			targetServer: server
		}).then((res: any) => {
			if (res?.Body?.response?.content) {
				const content = JSON.parse(res?.Body?.response?.content);
			}
		});
	}, [server]);

	const getZxPowerStoreServers = useCallback(() => {
		getSoapFetchRequest(
			`/service/extension/zextras_admin/core/getAllServers?module=zxpowerstore`
		).then((data: any) => {
			const serv = data?.servers;
			if (serv && serv.length > 0) {
				serverList.forEach((item: any) => {
					const id = item?.id;
					const selectedServer = serv.find((sItem: any) => sItem[id]);
					if (selectedServer && selectedServer[id]) {
						const values = selectedServer[id];
						if (values) {
							const attributes = values?.ZxPowerstore?.attributes;
							if (attributes) {
								if (attributes?.powerstoreMoveScheduler) {
									const schedulerEnabled =
										attributes?.powerstoreMoveScheduler?.value?.['cron-enabled'];
									if (schedulerEnabled) {
										setIsPowerstoreMoveSchedulerEnabled(true);
									} else {
										setIsPowerstoreMoveSchedulerEnabled(false);
									}

									const schedulePattern =
										attributes?.powerstoreMoveScheduler?.value?.['cron-pattern'];
									if (schedulePattern) {
										setPowerstoreMoveSchedulerValue(schedulePattern);
									} else {
										setPowerstoreMoveSchedulerValue('');
									}
								}
								if (attributes?.ZxPowerstore_SpaceThreshold) {
									const spaceThreshold = attributes?.ZxPowerstore_SpaceThreshold?.value;
									if (spaceThreshold) {
										setPowerstoreSpaceThreshold(spaceThreshold);
									} else {
										setPowerstoreSpaceThreshold(0);
									}
								}

								if (attributes?.deduplicateAfterScheduledMoveBlobs) {
									const duplicate = attributes?.deduplicateAfterScheduledMoveBlobs;
									if (duplicate) {
										setDeduplicateAfterScheduledMoveBlobs(true);
									} else {
										setDeduplicateAfterScheduledMoveBlobs(false);
									}
								}
							}
						}
					}
				});
			}
		});
	}, [serverList]);

	useEffect(() => {
		if (server && serverList && serverList.length > 0) {
			getZxPowerStoreServers();
		}
	}, [server, getZxPowerStoreServers, serverList]);

	useEffect(() => {
		getHSMList();
	}, [getHSMList]);

	const onCancel = useCallback(() => {
		setIsDirty(false);
	}, []);

	const onSave = useCallback(() => {
		setIsDirty(false);
	}, []);

	return (
		<Container mainAlignment="flex-start" width="100%">
			<Row
				takeAvwidth="fill"
				mainAlignment="flex-start"
				width="100%"
				padding={{ left: 'large', right: 'large', bottom: 'medium', top: 'medium' }}
			>
				<Container orientation="vertical" mainAlignment="space-around" background="gray6">
					<Row orientation="horizontal" width="100%" padding={{ all: 'extrasmall' }}>
						<Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
							<Text size="medium" weight="bold" color="gray0">
								{
									<Trans
										i18nKey="hsm.name_hsm_policies"
										defaults="<bold>{{serverName}} HSM Policies</bold>"
										components={{ bold: <strong />, serverName: server }}
									/>
								}
							</Text>
						</Row>
						<Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
							<Padding right="small">
								{isDirty && (
									<Button
										label={t('label.cancel', 'Cancel')}
										color="secondary"
										onClick={onCancel}
									/>
								)}
							</Padding>
							{isDirty && (
								<Button label={t('label.save', 'Save')} color="primary" onClick={onSave} />
							)}
						</Row>
					</Row>
				</Container>
			</Row>

			<ListRow>
				<Divider />
			</ListRow>
			<Container
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				width="100%"
				padding={{ all: 'large' }}
			>
				<ListRow>
					<Padding bottom="large">
						<Text size="medium" weight="regular">
							{t('hsm.scheduling', 'Scheduling')}
						</Text>
					</Padding>
				</ListRow>
				<ListRow>
					<Padding bottom="large">
						<Switch
							label={t('hsm.enable_scheduler', 'Enable Scheduler')}
							value={isPowerstoreMoveSchedulerEnabled}
							onClick={(): void =>
								setIsPowerstoreMoveSchedulerEnabled(!isPowerstoreMoveSchedulerEnabled)
							}
						/>
					</Padding>
				</ListRow>
				<ListRow>
					<Container padding={{ bottom: 'large' }}>
						<Input
							label={t('hsm.schedule', 'Schedule')}
							background="gray5"
							value={powerstoreMoveSchedulerValue}
							onChange={(e: any): void => {
								setPowerstoreMoveSchedulerValue(e.target.value);
							}}
						/>
					</Container>
				</ListRow>
				<ListRow>
					<Switch
						label={t(
							'hsm.apply_duplication_after_scheduledhsm',
							'Apply Deduplication after scheduled HSM'
						)}
						value={deduplicateAfterScheduledMoveBlobs}
						onClick={(): void =>
							setDeduplicateAfterScheduledMoveBlobs(!deduplicateAfterScheduledMoveBlobs)
						}
					/>
				</ListRow>
				<ListRow>
					<Container
						padding={{ left: 'extralarge' }}
						crossAlignment="flex-start"
						mainAlignment="flex-start"
					>
						<Padding left="small">
							<Text size="extrasmall" weight="regular" color="secondary">
								{t(
									'hsm.this_function_allow_save_disk_copy_msg',
									'This function allows you to save disk space by storing a single copy of an item.'
								)}
							</Text>
						</Padding>
					</Container>
				</ListRow>

				<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
					<Container
						orientation="vertical"
						mainAlignment="space-around"
						background="gray6"
						padding={{ top: 'large', bottom: 'large' }}
					>
						<Row orientation="horizontal" width="100%" padding={{ all: 'extrasmall' }}>
							<Row mainAlignment="flex-start" width="50%" crossAlignment="flex-start">
								<Text size="medium" weight="bold" color="gray0">
									{t('hsm.hsm_policies_list', 'HSM Policies List')}
								</Text>
							</Row>
							<Row width="50%" mainAlignment="flex-end" crossAlignment="flex-end">
								<Padding right="small">
									<Button
										label={t('hsm.delete', 'Delete')}
										color="error"
										type="outlined"
										icon="CloseOutline"
										height={36}
										onClick={(): void => {
											setShowDeletePolicyView(true);
										}}
									/>
								</Padding>
								<Padding right="small">
									<Button
										label={t('hsm.edit', 'Edit')}
										type="outlined"
										icon="EditOutline"
										color="secondary"
										height={36}
										onClick={(): void => {
											setShowEditHsmPolicyView(true);
										}}
									/>
								</Padding>
								<Button
									label={t('hsm.new_policy', 'New Policy')}
									icon="Plus"
									type="outlined"
									color="primary"
									height={36}
									onClick={(): void => {
										setShowCreateHsmPolicyView(true);
									}}
								/>
							</Row>
						</Row>
					</Container>
				</Row>

				<ListRow>
					<Table rows={policies} headers={headers} />
				</ListRow>

				<ListRow>
					<Container padding={{ top: 'large' }}>
						<Input
							label={t('hsm.minimum_space_threshold', 'Minimum Space Threshold')}
							background="gray5"
							value={powerstoreSpaceThreshold}
							onChange={(e: any): void => {
								setPowerstoreSpaceThreshold(e.target.value);
							}}
						/>
					</Container>
				</ListRow>
			</Container>
			{showCreateHsmPolicyView && (
				<CreateHsmPolicy setShowCreateHsmPolicyView={setShowCreateHsmPolicyView} />
			)}
			{showEditHsmPolicyView && (
				<EditHsmPolicy setShowEditHsmPolicyView={setShowEditHsmPolicyView} />
			)}
			{showDeletePolicyView && (
				<DeleteHsmPolicy
					showDeletePolicyView={showDeletePolicyView}
					setShowDeletePolicyView={setShowDeletePolicyView}
				/>
			)}
		</Container>
	);
};

export default HSMsettingPanel;

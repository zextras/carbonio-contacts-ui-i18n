/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import React, { FC, useCallback, useMemo, useState } from 'react';
import {
	Container,
	Row,
	Text,
	Divider,
	Button,
	useSnackbar
} from '@zextras/carbonio-design-system';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { OperationsTable } from './operations-table';
import { OperationsHeader } from '../utility/utils';
import { AbsoluteContainer } from '../components/styled';
import OperationsWizardDetailPanel from './operations-wizard-detail-panel';
import DeleteOpearationsModel from './delete-operations-model';
import { useOperationStore } from '../../store/operation/store';
import { stopOperations } from '../../services/stop-operation';
import { useServerStore } from '../../store/server/store';

const RelativeContainer = styled(Container)`
	position: relative;
`;

const RunningDetailPanel: FC<{ getAllOperationAPICallHandler: any }> = ({
	getAllOperationAPICallHandler
}) => {
	const [t] = useTranslation();
	const createSnackbar = useSnackbar();
	const serverList = useServerStore((state) => state.serverList)[0]?.name;
	const { runningData } = useOperationStore((state) => state);
	const operationsHeader = useMemo(() => OperationsHeader(t), [t]);
	const [wizardDetailToggle, setWizardDetailToggle] = useState(false);
	const [open, setOpen] = useState(false);
	const [selectedData, setSelectedData] = useState<any>();
	const [isSelectedRow, setIsSelectedRow] = useState([]);
	const stopOperationAPICall = useCallback(() => {
		stopOperations(selectedData?.id)
			.then((res) => {
				const result = JSON.parse(res?.Body?.response?.content);
				if (result?.response?.[`${serverList}`]?.ok) {
					createSnackbar({
						key: '1',
						type: 'success',
						label: t(
							'label.stop_operation_sucess',
							'The {{name}} operation has been stopped successfully',
							{
								name: selectedData?.name
							}
						)
					});
					setOpen(false);
					setWizardDetailToggle(false);
					getAllOperationAPICallHandler();
				} else {
					createSnackbar({
						key: '1',
						type: 'error',
						label: t('label.stop_operation_helperText', '{{message}}', {
							message: result?.response?.[`${serverList}`]?.error?.message
						})
					});
					setOpen(false);
					setWizardDetailToggle(false);
				}
			})
			.catch((err) => {
				createSnackbar({
					key: '1',
					type: 'error',
					label: t('label.operation.stop_operation_error', '{{name}}', {
						name: err
					})
				});
			});
	}, [
		createSnackbar,
		getAllOperationAPICallHandler,
		selectedData?.id,
		selectedData?.name,
		serverList,
		t
	]);

	const closeHandler = (): any => {
		setOpen(false);
	};

	const stopHandler = (modelHandler: boolean): any => {
		if (!modelHandler) {
			stopOperationAPICall();
		}
	};

	const handleClick = (i: any): any => {
		const volumeObject: any = runningData.find((s: any, index: any) => index === i);
		setSelectedData(volumeObject);
		setWizardDetailToggle(true);
	};

	return (
		<>
			{wizardDetailToggle && (
				<AbsoluteContainer orientation="vertical" background="gray5">
					<OperationsWizardDetailPanel
						setWizardDetailToggle={setWizardDetailToggle}
						setOpen={setOpen}
						selectedData={selectedData}
					/>
				</AbsoluteContainer>
			)}
			<RelativeContainer
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				style={{ overflowY: 'auto' }}
				background="white"
			>
				<DeleteOpearationsModel
					open={open}
					closeHandler={closeHandler}
					saveHandler={stopHandler}
					operationMessage={t(
						'operations.stopping_operation_model_title',
						'You are stopping {{OperationName}}',
						{
							OperationName: selectedData?.name
						}
					)}
					modelHandler={false}
				/>
				<Row mainAlignment="flex-start" padding={{ all: 'large' }}>
					<Text size="extralarge" weight="bold">
						{t('operations.running_panel_heading', 'Running Operations')}
					</Text>
				</Row>
				<Divider />
				<Container
					orientation="column"
					crossAlignment="flex-start"
					mainAlignment="flex-start"
					width="100%"
					height="calc(100vh - 200px)"
					padding={{ all: 'large' }}
				>
					<Row takeAvwidth="fill" mainAlignment="flex-end" crossAlignment="flex-end" width="100%">
						<Button
							type="outlined"
							label={t('operations.stop_opearation_btn', 'STOP OPERATION')}
							color="error"
							icon="StopCircleOutline"
							iconPlacement="right"
							// onClick={stopOperationAPICall}
							// disabled={toggleStopBtn}
						/>
					</Row>
					<Row width="100%" padding={{ top: 'large' }}>
						{runningData && (
							<OperationsTable
								operations={runningData}
								headers={operationsHeader}
								donePanel={false}
								selectedRows={isSelectedRow}
								// eslint-disable-next-line @typescript-eslint/no-empty-function
								onSelectionChange={(selected: any): any => {
									setIsSelectedRow(selected);
								}}
								onClick={(i: any): any => {
									handleClick(i);
								}}
							/>
						)}
					</Row>
				</Container>
			</RelativeContainer>
		</>
	);
};

export default RunningDetailPanel;

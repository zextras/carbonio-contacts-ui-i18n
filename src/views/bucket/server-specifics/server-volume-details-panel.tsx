/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useState } from 'react';
import {
	Container,
	Input,
	Row,
	IconButton,
	Button,
	Divider,
	Padding,
	Text,
	Switch
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import { fetchSoap } from '../../../services/bucket-service';
import { INDEXERES, PRIMARIES, SECONDARIES } from '../../../constants';

const ServerVolumeDetailsPanel: FC<{
	setToggleDetailPage: any;
	volumeDetail: any;
	modifyVolumeToggle: any;
	setmodifyVolumeToggle: any;
	setOpen: any;
}> = ({
	setToggleDetailPage,
	volumeDetail,
	modifyVolumeToggle,
	setmodifyVolumeToggle,
	setOpen
}) => {
	const { t } = useTranslation();
	const [detailData, setDetailData] = useState({
		name: '',
		id: 0,
		compressBlobs: false,
		isCurrent: false,
		rootpath: '',
		compressionThreshold: ''
	});
	const [type, setType] = useState('');

	const getVolumeDetailData = useCallback((): void => {
		fetchSoap('GetVolumeRequest', {
			_jsns: 'urn:zimbraAdmin',
			module: 'ZxPowerstore',
			id: volumeDetail?.id
		}).then((response) => {
			if (response) {
				if (response.GetVolumeResponse.volume[0].type === 1) {
					setType(PRIMARIES);
				} else if (response.GetVolumeResponse.volume[0].type === 2) {
					setType(SECONDARIES);
				} else if (response.GetVolumeResponse.volume[0].type === 10) {
					setType(INDEXERES);
				}
				setDetailData({
					name: response.GetVolumeResponse.volume[0].name,
					id: response.GetVolumeResponse.volume[0].id,
					compressBlobs: response.GetVolumeResponse.volume[0].compressBlobs,
					isCurrent: response.GetVolumeResponse.volume[0].isCurrent,
					rootpath: response.GetVolumeResponse.volume[0].rootpath,
					compressionThreshold: response.GetVolumeResponse.volume[0].compressionThreshold
				});
			}
		});
	}, [volumeDetail]);

	useEffect(() => {
		getVolumeDetailData();
	}, [getVolumeDetailData, volumeDetail, modifyVolumeToggle]);

	return (
		<>
			{detailData && (
				<Container background="gray6">
					<Row mainAlignment="flex-start" crossAlignment="center" width="100%" height="auto">
						<Row mainAlignment="flex-start" padding={{ all: 'large' }} takeAvailableSpace>
							<Text size="extralarge" weight="bold">
								{detailData.name} Details
							</Text>
						</Row>
						<Row padding={{ horizontal: 'small' }}>
							<IconButton
								icon="CloseOutline"
								color="gray1"
								onClick={(): void => setToggleDetailPage(false)}
							/>
						</Row>
					</Row>
					<Divider />
					<Container
						orientation="horizontal"
						mainAlignment="flex-end"
						crossAlignment="flex-end"
						background="gray6"
						padding={{ all: 'extralarge' }}
						style={{ height: 'fit-content' }}
					>
						<Padding right="large">
							<Button
								type="outlined"
								iconColor="gray6"
								icon="EditAsNewOutline"
								height={36}
								label=""
								width={36}
								style={{ padding: '8px 8px 8px 6px', display: 'block' }}
								onClick={(): void => {
									setmodifyVolumeToggle(true);
								}}
								disabled={!detailData?.id || volumeDetail.id !== detailData?.id}
								loading={!detailData?.id || volumeDetail.id !== detailData?.id}
							/>
						</Padding>
						<Container width="fit" height="fit">
							<Button
								type="outlined"
								color="error"
								icon="Trash2Outline"
								height={36}
								label=""
								width={36}
								onClick={(): any => setOpen(true)}
								style={{
									padding: '8px 8px 8px 6px',
									display: 'block'
								}}
								disabled={!detailData?.id || volumeDetail.id !== detailData?.id}
								loading={!detailData?.id || volumeDetail.id !== detailData?.id}
							/>
							{/* <Button
								iconColor="error"
								backgroundColor="gray6"
								icon="Trash2Outline"
								height={36}
								width={36}
								onClick={(): any => setOpen(true)}
							/> */}
						</Container>
					</Container>
					<Container
						padding={{ horizontal: 'large', top: 'extralarge', bottom: 'large' }}
						mainAlignment="flex-start"
						crossAlignment="flex-start"
					>
						<Row padding={{ top: 'small' }} width="100%">
							<Input
								label={t('label.volume_name', 'Volume Name')}
								value={detailData?.name}
								backgroundColor="gray5"
								readyOnly
							/>
						</Row>
						<Row padding={{ top: 'large' }} width="100%">
							<Input
								label={t('label.type', 'Type')}
								backgroundColor="gray6"
								value={type}
								readOnly
							/>
						</Row>
						<Row padding={{ top: 'large' }} width="100%">
							<Input
								label={t('label.volume_id', 'Volume ID')}
								value={detailData?.id}
								backgroundColor="gray6"
								readyOnly
							/>
						</Row>
						<Row padding={{ top: 'large' }} width="100%">
							<Input
								label={t('label.path', 'Path')}
								value={detailData?.rootpath}
								backgroundColor="gray5"
								readyOnly
							/>
						</Row>
						<Row mainAlignment="flex-start" padding={{ top: 'large' }} width="100%">
							<Row width="48%" mainAlignment="flex-start">
								<Switch
									value={detailData?.compressBlobs}
									label={t('label.enable_compression', 'Enable Compression')}
								/>
							</Row>
							<Padding width="4%" />
							<Row width="48%" mainAlignment="flex-start">
								<Switch value={detailData?.isCurrent} label={t('label.current', 'Current')} />
							</Row>
						</Row>
						<Row padding={{ top: 'small' }} width="50%">
							<Input
								label={t('label.compression_threshold', 'Compression Threshold')}
								value={detailData?.compressionThreshold}
								backgroundColor="gray6"
								readOnly
								color="secondary"
							/>
						</Row>
					</Container>
				</Container>
			)}
		</>
	);
};

export default ServerVolumeDetailsPanel;

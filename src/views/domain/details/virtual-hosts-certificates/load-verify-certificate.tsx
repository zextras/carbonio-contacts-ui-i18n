/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import {
	SnackbarManagerContext,
	Button,
	FileLoader,
	Input,
	Text,
	Padding,
	Row,
	Select,
	Container
} from '@zextras/carbonio-design-system';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { postSoapFetchRequest, soapFetch } from '@zextras/carbonio-shell-ui';
import React, { FC, useCallback, useContext, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ICertificateContent } from '../../../../../types';
import {
	DOMAIN_CERTIFICATE,
	DOMAIN_CERTIFICATE_CA_CHAIN,
	DOMAIN_CERTIFICATE_PRIVATE_KEY
} from '../../../../constants';
import Textarea from '../../../components/textarea';
import ListRow from '../../../list/list-row';

const LoadAndVerifyCert: FC<any> = () => {
	let fileReader: FileReader;
	const { t } = useTranslation();
	const [selectedCertType, setSelectedCertType] = useState<string>('');
	const [verifyBtnLoading, setVerifyBtnLoading] = useState(false);
	const createSnackbar: any = useContext(SnackbarManagerContext);
	const [objDomainCertificate, setObjDomainCertificate] = useState<ICertificateContent>({
		fileName: '',
		content: ''
	});
	const [objDomainCertificateCaChain, setObjDomainCertificateCaChain] =
		useState<ICertificateContent>({
			fileName: '',
			content: ''
		});

	const [objDomainCertificatePrivateKey, setObjDomainCertificatePrivateKey] =
		useState<ICertificateContent>({
			fileName: '',
			content: ''
		});

	const certificateTypes = useMemo(
		() => [
			{
				label: t(
					'domain.certificate_type_use_letsencrypt',
					'I want to use a Let’s Encrypt Certificate'
				),
				value: '1'
			},
			{
				label: t('domain.certificate_type_use_custom', 'I want to use a Custom Certificate'),
				value: '2'
			}
		],
		[t]
	);

	const setStatesForFileContent = (fieldName: string, fileName: string, content: any): void => {
		switch (fieldName) {
			case DOMAIN_CERTIFICATE:
				setObjDomainCertificate({
					content,
					fileName
				});

				break;
			case DOMAIN_CERTIFICATE_CA_CHAIN:
				setObjDomainCertificateCaChain({
					content,
					fileName
				});

				break;
			case DOMAIN_CERTIFICATE_PRIVATE_KEY:
				setObjDomainCertificatePrivateKey({
					content,
					fileName
				});

				break;

			default:
				break;
		}
	};

	const readFileContentHandler = (file: File, fieldName: string): any => {
		fileReader = new FileReader();
		fileReader.onload = (evt): any => {
			setStatesForFileContent(fieldName, file.name, evt.target?.result);
		};
		fileReader.readAsText(file);
	};

	const verifyCertificateHandler = useCallback((): void => {
		setVerifyBtnLoading(true);
		// if (
		// 	objDomainCertificate.content === '' ||
		// 	objDomainCertificateCaChain.content === '' ||
		// 	objDomainCertificatePrivateKey.content === ''
		// ) {
		// 	createSnackbar({
		// 		key: 'error',
		// 		type: 'error',
		// 		label: t(
		// 			'domain.certificate_content_error',
		// 			'Domain certificate , CA Chain or Private key is invalid'
		// 		),
		// 		autoHideTimeout: 3000,
		// 		hideButton: true,
		// 		replace: true
		// 	});
		// } else {
		soapFetch(`VerifyCertKey`, {
			_jsns: 'urn:zimbraAdmin',
			ca: objDomainCertificateCaChain.content,
			cert: objDomainCertificate.content,
			privkey: objDomainCertificatePrivateKey.content
		}).then((data: any) => {
			console.log('_dd responseData', data?.verifyRe);
		});
		// }
	}, [
		objDomainCertificate.content,
		objDomainCertificateCaChain.content,
		objDomainCertificatePrivateKey.content
	]);

	return (
		<Container padding={{ all: 'small' }}>
			<ListRow>
				<Padding vertical="small" horizontal="small" width="100%">
					<Select
						items={certificateTypes}
						background="gray5"
						label={t('label.certificate_type', 'Certificate Type')}
						onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => {
							setSelectedCertType(e.target?.value);
						}}
						defaultSelection={{
							label: t('domain.certificate_type_use_custom', 'I want to use a Custom Certificate'),
							value: '2'
						}}
						showCheckbox={false}
					/>
				</Padding>
			</ListRow>
			<Container>
				<ListRow>
					<Padding vertical="large" horizontal="small" width="100%">
						<Text weight="bold" size="medium">
							{t('label.domain_certificate', 'Domain Certificate')}
						</Text>
					</Padding>
				</ListRow>
				<ListRow>
					<Padding vertical="small" horizontal="small" width="100%">
						<Textarea
							backgroundColor="gray5"
							value={objDomainCertificate.content || ''}
							size="medium"
							inputName="zimbraNotes"
							readOnly
						/>
					</Padding>
				</ListRow>
				<ListRow>
					<Padding vertical="small" horizontal="small" width="100%">
						<Input
							label={t('label.load_your_cert_file', 'Load your certificate file')}
							type="text"
							backgroundColor="gray5"
							value={objDomainCertificate.fileName || ''}
							readOnly
						/>
					</Padding>
					<Padding vertical="small" horizontal="small">
						<FileLoader
							label="LOAD FILE"
							size="large"
							type="outlined"
							color="primary"
							onChange={(e: any): any =>
								readFileContentHandler(e.target.files[0], DOMAIN_CERTIFICATE)
							}
						/>
					</Padding>
				</ListRow>
			</Container>
			<Container>
				<ListRow>
					<Padding vertical="large" horizontal="small" width="100%">
						<Text weight="bold" size="medium">
							{t('label.domain_certificate_ca_chain', 'Domain Certificate CA Chain')}
						</Text>
					</Padding>
				</ListRow>
				<ListRow>
					<Padding vertical="small" horizontal="small" width="100%">
						<Textarea
							backgroundColor="gray5"
							value={objDomainCertificateCaChain.content || ''}
							size="medium"
							inputName="zimbraNotes"
							readOnly
						/>
					</Padding>
				</ListRow>
				<ListRow>
					<Padding vertical="small" horizontal="small" width="100%">
						<Input
							label={t('label.load_your_cert_file', 'Load your certificate file')}
							type="text"
							backgroundColor="gray5"
							value={objDomainCertificateCaChain.fileName || ''}
							readOnly
						/>
					</Padding>
					<Padding vertical="small" horizontal="small">
						<FileLoader
							label="LOAD FILE"
							size="large"
							type="outlined"
							color="primary"
							onChange={(e: any): any =>
								readFileContentHandler(e.target.files[0], 'domain_certificate_ca_chain')
							}
						/>
					</Padding>
				</ListRow>
			</Container>
			<Container>
				<ListRow>
					<Padding vertical="large" horizontal="small" width="100%">
						<Text weight="bold" size="medium">
							{t('label.domain_certificate_ca_chain', 'Domain Certificate CA Chain')}
						</Text>
					</Padding>
				</ListRow>
				<ListRow>
					<Padding vertical="small" horizontal="small" width="100%">
						<Textarea
							backgroundColor="gray5"
							value={objDomainCertificatePrivateKey.content || ''}
							size="medium"
							inputName="zimbraNotes"
							readOnly
						/>
					</Padding>
				</ListRow>
				<ListRow>
					<Padding vertical="small" horizontal="small" width="100%">
						<Input
							label={t('label.load_your_private_file', 'Load your certificate file')}
							type="text"
							backgroundColor="gray5"
							value={objDomainCertificatePrivateKey.fileName || ''}
							readOnly
						/>
					</Padding>
					<Padding vertical="small" horizontal="small">
						<FileLoader
							label="LOAD FILE"
							size="large"
							type="outlined"
							color="primary"
							onChange={(e: any): any =>
								readFileContentHandler(e.target.files[0], 'domain_certificate_private_key')
							}
						/>
					</Padding>
				</ListRow>
			</Container>
			<Container>
				<ListRow>
					<Padding vertical="large" horizontal="small" width="100%">
						<Button
							width="fill"
							label={t('label.verify', 'Verify')}
							onClick={verifyCertificateHandler}
							loading={verifyBtnLoading}
						/>
					</Padding>
				</ListRow>
			</Container>
		</Container>
	);
};

export default LoadAndVerifyCert;

/* eslint-disable react-hooks/rules-of-hooks */
/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useEffect, useState } from 'react';
import { Container, Row, Padding, Text, Divider, Switch } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import ListRow from '../list/list-row';
import { getConfig } from '../../services/get-config';
import { modifyConfig } from '../../services/modify-config';
import { FALSE, TRUE } from '../../constants';

const PrivacyView: FC = () => {
	const [t] = useTranslation();
	const [carbonioAllowFeedback, setCarbonioAllowFeedback] = useState<boolean>(false);
	const [carbonioSendAnalytics, setCarbonioSendAnalytics] = useState<boolean>(false);
	const [carbonioSendFullErrorStack, setCarbonioSendFullErrorStack] = useState<boolean>(false);
	const CARBONIO_SEND_ANALYTICS = 'carbonioSendAnalytics';
	const CARBONIO_SEND_FULL_ERROR_STACK = 'carbonioSendFullErrorStack';
	const CARBONIO_ALLOW_FEEDBACK = 'carbonioAllowFeedback';

	const getConfigData = useCallback((): void => {
		const feedback: any = { a: { n: CARBONIO_SEND_ANALYTICS } };
		getConfig(feedback)
			.then((response) => response.json())
			.then((data) => {
				if (data?.Body?.GetConfigResponse?.a && Array.isArray(data?.Body?.GetConfigResponse?.a)) {
					const allAttributes = data?.Body?.GetConfigResponse?.a;
					allAttributes.forEach((item: any) => {
						if (item?.n === CARBONIO_SEND_ANALYTICS) {
							setCarbonioSendAnalytics(item?._content === 'TRUE');
						}
					});
				}
			});

		const errorStack: any = { a: { n: CARBONIO_SEND_FULL_ERROR_STACK } };
		getConfig(errorStack)
			.then((response) => response.json())
			.then((data) => {
				if (data?.Body?.GetConfigResponse?.a && Array.isArray(data?.Body?.GetConfigResponse?.a)) {
					const allAttributes = data?.Body?.GetConfigResponse?.a;
					allAttributes.forEach((item: any) => {
						if (item?.n === CARBONIO_SEND_FULL_ERROR_STACK) {
							setCarbonioSendFullErrorStack(item?._content === 'TRUE');
						}
					});
				}
			});

		const analytics: any = { a: { n: CARBONIO_ALLOW_FEEDBACK } };
		getConfig(analytics)
			.then((response) => response.json())
			.then((data) => {
				if (data?.Body?.GetConfigResponse?.a && Array.isArray(data?.Body?.GetConfigResponse?.a)) {
					const allAttributes = data?.Body?.GetConfigResponse?.a;
					allAttributes.forEach((item: any) => {
						if (item?.n === CARBONIO_ALLOW_FEEDBACK) {
							setCarbonioAllowFeedback(item?._content === 'TRUE');
						}
					});
				}
			});
	}, []);

	useEffect(() => {
		getConfigData();
	}, [getConfigData]);

	const savePrivacySettings = useCallback((key, value) => {
		const attributes: any[] = [];
		attributes.push({
			n: key,
			_content: value ? TRUE : FALSE
		});

		modifyConfig(attributes)
			.then((response) => response.json())
			.then((data) => {
				if (data?.Body?.ModifyConfigResponse) {
					if (key === CARBONIO_ALLOW_FEEDBACK) {
						setCarbonioAllowFeedback(value);
					}
					if (key === CARBONIO_SEND_ANALYTICS) {
						setCarbonioSendAnalytics(value);
					}
					if (key === CARBONIO_SEND_FULL_ERROR_STACK) {
						setCarbonioSendFullErrorStack(value);
					}
				}
			});
	}, []);

	return (
		<Container mainAlignment="flex-start" background="gray6">
			<Row takeAvwidth="fill" mainAlignment="flex-start" width="100%">
				<Row mainAlignment="flex-start" crossAlignment="flex-start" padding={{ all: 'large' }}>
					<Text size="medium" weight="bold" color="gray0">
						{t('label.privacy', 'Privacy')}
					</Text>
				</Row>
			</Row>
			<Row orientation="horizontal" width="100%" background="gray6">
				<Divider />
			</Row>

			<Container
				orientation="column"
				crossAlignment="flex-start"
				mainAlignment="flex-start"
				style={{ overflow: 'auto' }}
				width="100%"
				height="calc(100vh - 200px)"
			>
				<Container height="fit" background="gray6" padding={{ left: 'small', right: 'small' }}>
					<ListRow>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ all: 'small' }}
						>
							<Switch
								value={carbonioSendFullErrorStack}
								label={t(
									'privacy.send_full_error_data_to_zextras',
									'Send full error data to Zextras'
								)}
								onClick={(): void => {
									savePrivacySettings(CARBONIO_SEND_FULL_ERROR_STACK, !carbonioSendFullErrorStack);
								}}
							/>
						</Container>
					</ListRow>
					<ListRow>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ left: 'extralarge' }}
						>
							<Padding left="large">
								<Text size="small" weight="regular" color="gray1">
									{t(
										'privacy.full_error_sub_1',
										'We all make errors, but it’s how you deal with them that changes everything! Make errors work for you, let us know how we can fix them.'
									)}
								</Text>
							</Padding>
						</Container>
					</ListRow>
					<ListRow>
						<Container
							orientation="horizontal"
							mainAlignment="space-between"
							crossAlignment="flex-start"
							padding={{ all: 'small' }}
						>
							<Switch
								value={carbonioSendAnalytics}
								label={t('privacy.allow_data_analytics', 'Allow data analytics')}
								onClick={(): void => {
									savePrivacySettings(CARBONIO_SEND_ANALYTICS, !carbonioSendAnalytics);
								}}
							/>
						</Container>
					</ListRow>
					<ListRow>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ left: 'extralarge' }}
						>
							<Padding left="large">
								<Text size="small" weight="regular" color="gray1">
									{t(
										'privacy.analytics_sub_1',
										'Your data is safe. All information we gather is and will stay anonymous. It will be used by our team to understand how can we improve Carbonio.'
									)}
								</Text>
							</Padding>
						</Container>
					</ListRow>
					<ListRow>
						<Container
							orientation="horizontal"
							mainAlignment="space-between"
							crossAlignment="flex-start"
							padding={{ all: 'small' }}
						>
							<Switch
								value={carbonioAllowFeedback}
								label={t('privacy.allow_live_survey_feedbacks', 'Allow live survey feedbacks')}
								onClick={(): void => {
									savePrivacySettings(CARBONIO_ALLOW_FEEDBACK, !carbonioAllowFeedback);
								}}
							/>
						</Container>
					</ListRow>
					<ListRow>
						<Container
							mainAlignment="flex-start"
							crossAlignment="flex-start"
							padding={{ left: 'extralarge' }}
						>
							<Padding left="large">
								<Text size="small" weight="regular" color="gray1">
									{t(
										'privacy.survey_feedback_sub_1',
										'We promise they will be fast, easy and very useful to understand  how are we doing.'
									)}
								</Text>
							</Padding>
						</Container>
					</ListRow>
				</Container>
			</Container>
		</Container>
	);
};

export default PrivacyView;

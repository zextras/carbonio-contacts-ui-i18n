/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { ReactElement, useState } from 'react';
import { Row, Container, Text, Padding, Button } from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import logo from '../../../../assets/ninja_robo.svg';
import NewBucket from '../../../bucket/new-bucket';

const RelativeContainer = styled(Container)`
	position: relative;
`;
const AbsoluteContainer = styled(Container)`
	position: absolute;
	max-width: 630px;
	right: 0;
	z-index: 1;
	box-shadow: 0 0 12px -1px #888;
`;

export const ColumnFull = ({
	children,
	mainAlignment,
	takeAvailableSpace
}: {
	children: any;
	mainAlignment: string;
	takeAvailableSpace: any;
}): ReactElement => (
	<Row width="100%" height="100%" mainAlignment={mainAlignment} takeAvailableSpace>
		{children}
	</Row>
);
export const ColumnLeft = ({
	width,
	children,
	padding
}: {
	width: string;
	children: any;
	padding: any;
}): ReactElement => {
	const [t] = useTranslation();
	const [selected, setSelected]: any = useState(4);
	const [toggleBucket, setToggleBucket] = useState(false);

	return (
		<Row width={width} height="100%" padding={padding}>
			<Container
				orientation="column"
				crossAlignment="center"
				mainAlignment="flex-start"
				style={{ overflowY: 'hidden' }}
				background="gray6"
			>
				<Container
					padding={{ all: 'large' }}
					mainAlignment="flex-start"
					background="gray6"
					style={{ maxWidth: '982px' }}
				>
					{children}
					<RelativeContainer
						orientation="column"
						crossAlignment="flex-start"
						mainAlignment="flex-start"
						style={{ overflowY: 'auto' }}
						background="grey6"
					>
						{toggleBucket && (
							<AbsoluteContainer orientation="vertical" background="gray5">
								<NewBucket setToggleBucket={setToggleBucket} title="Bucket Connection" />
							</AbsoluteContainer>
						)}
						<Container>
							<Text
								overflow="break-word"
								weight="normal"
								size="large"
								style={{ whiteSpace: 'pre-line', textAlign: 'center', 'font-family': 'roboto' }}
							>
								<img src={logo} alt="logo" />
							</Text>
							<Padding all="medium" width="47%">
								<Text
									color="gray1"
									overflow="break-word"
									weight="normal"
									size="large"
									width="60%"
									style={{ whiteSpace: 'pre-line', textAlign: 'center', 'font-family': 'roboto' }}
								>
									{t(
										'select_bucket_or_create_new_bucket',
										"It seems like you haven't setup a bucket type. Click NEW BUCKET button to create a new one."
									)}
								</Text>
							</Padding>
							<Padding all="medium">
								<Text
									size="small"
									overflow="break-word"
									style={{ whiteSpace: 'pre-line', textAlign: 'center' }}
								>
									<Button
										type="outlined"
										label={t('label.create_new_bucket', 'NEW BUCKET')}
										icon="Plus"
										color="info"
										onClick={(): any => setToggleBucket(!toggleBucket)}
									/>
								</Text>
							</Padding>
						</Container>
					</RelativeContainer>
				</Container>
			</Container>
		</Row>
	);
};

// export function ColumnRight({ width = '40%', children, ...rest }) {
// 	return (
// 		<ShellRightWrapper width={width} height="100%" {...rest}>
// 			{children}
// 		</ShellRightWrapper>
// 	);
// }

export const ShellBody = ({ children }: { children: any }): ReactElement => (
	<Row width="100%" height="100%" mainAlignment="space-between" crossAlignment="flex-start">
		{children}
	</Row>
);

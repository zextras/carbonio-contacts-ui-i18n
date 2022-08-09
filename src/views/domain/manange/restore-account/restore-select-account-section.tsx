/*
 * SPDX-FileCopyrightText: 2022 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import React, { FC, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
	Container,
	Text,
	Input,
	Row,
	Switch,
	Icon,
	Table,
	Padding
} from '@zextras/carbonio-design-system';
import { useTranslation } from 'react-i18next';

import ListRow from '../../../list/list-row';
import { searchDirectory } from '../../../../services/search-directory-service';
import { isValidLdapQuery } from '../../../utility/utils';

const RestoreSelectAccountSection: FC<any> = () => (
	<Container>
		<Container>111111111</Container>
	</Container>
);
export default RestoreSelectAccountSection;

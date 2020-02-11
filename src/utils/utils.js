
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

export const addToQuery = (search, param, value) => {
	const query = new URLSearchParams(search);
	if (query.has(param)) {
		query.set(param, value);
	}
	else {
		query.append(param, value);
	}
	return query.toString();
};

export const deleteFromQuery = (search, param) => {
	const query = new URLSearchParams(search);
	if (query.has(param)) {
		query.delete(param);
	}
	return query.toString();
};

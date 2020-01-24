/*
 * *** BEGIN LICENSE BLOCK *****
 * Copyright (C) 2011-2019 ZeXtras
 *
 * The contents of this file are subject to the ZeXtras EULA;
 * you may not use this file except in compliance with the EULA.
 * You may obtain a copy of the EULA at
 * http://www.zextras.com/zextras-eula.html
 * *** END LICENSE BLOCK *****
 */
/* eslint-env serviceworker */

// import { precacheAndRoute } from 'workbox-precaching/precacheAndRoute';
// precacheAndRoute(self.__WB_MANIFEST);

async function _processSOAPNotifications(syncResponse) {
	console.log('Processing Notifications! :D', syncResponse);
}

const _sharedBC = new BroadcastChannel('com_zextras_zapp_shell_sw');
_sharedBC.addEventListener('message', function onMessageOnBC(e) {
	if (!e.data || !e.data.action) return;
	switch(e.data.action) {
		case 'SOAP:notification:handle':
			_processSOAPNotifications(e.data.data).then();
			break;
		case 'sync:operation:completed':
			console.log('sync:operation:completed', e.data.data);
			break;
		case 'sync:operation:error':
			console.log('sync:operation:error', e.data.data);
			break;
	}
});

console.log(`Hello from contacts-sw.js`);

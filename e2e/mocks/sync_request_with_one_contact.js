module.exports = {
	request: {
		input: '/service/soap/SyncRequest'
	},
	response: {
		Body: {
			SyncResponse: {
				token: '0',
				folder: [
					{
						id: "11",
						folder: [
							{
								id: '1',
								l: "11",
								absFolderPath: "/",
								name: "USER_ROOT",
								folder: [
									{
										id: "7",
										l: "1",
										absFolderPath: "/Contacts",
										name: "Contacts",
										cn: [{
											ids: "1000" /* Comma separated ids */
										}],
										view: "contact"
									}
								]
							}
						]
					}
				]
			}
		}
	}
};

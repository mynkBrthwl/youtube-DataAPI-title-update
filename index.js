const { google } = require('googleapis');
const OAuth2 = google.auth.OAuth2;

require('dotenv').config();

function getAuth() {
	const credentials = JSON.parse(process.env.CLIENT_DATA);
	const clientSecret = credentials.installed.client_secret;
	const clientId = credentials.installed.client_id;
	const redirectUrl = credentials.installed.redirect_uris[0];
	const oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);
	oauth2Client.credentials = JSON.parse(process.env.OAUTH_DATA);
	return oauth2Client;
}

function getViews(auth) {
	const service = google.youtube('v3');
	return new Promise((resolve, reject) => {
		service.videos.list({
			auth,
			part: 'statistics',
			id: process.env.VIDEO_ID
		}, (err, res) => {
			if (err) return reject(err);
			resolve(res.data.items[0].statistics.viewCount);
		});
	});
}

function updateTitle(auth, views) {
	const service = google.youtube('v3');
	return new Promise((resolve, reject) => {
		service.videos.update({
			auth,
			part: 'snippet',
			resource: {
				id: process.env.VIDEO_ID,
				snippet: {
					title: `This video has ${views} views`,
					categoryId: process.env.CATEGORY_ID,
					description: `The title of this video will be in sync with it's total number of views`
				}
			}
		}, (err, res) => {
			if(err) return reject(err);
			resolve(res.data.snippet.title);
		});
	});
}

(async function() {
	try {
		const auth = getAuth();
		const views = await getViews(auth);
		const data = await updateTitle(auth, views);
		console.log('this video has views-', views);
		console.log('title-', data);
	} catch(err) {
		console.log(err);
	}
})();

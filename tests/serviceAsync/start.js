exports.init = function(app, callback) {
	app.Services['serviceAsync'].processor = function(data) {
		console.log('processor got the ' + data);
	};
	setTimeout(callback, 100);
};
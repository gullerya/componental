exports.init = function(app, callback) {
	app.Services['serviceAsync'].processor('data I dependent on');
	callback();
};
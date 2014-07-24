var fs = require('fs'),
	path = require('path'),
	events = require('events'),
	express = require('express'),
	eApp = express(),
	utils = require('./textUtil/main.js');
	
var modulesList = [
	{id:'service', path:'service/init.js'},
	{id:'serviceDep', path:'serviceDependent/startDpnd.js', deps: ['serviceAsync']},
	{id:'serviceAsync', path:'serviceAsync/start.js'}
];
	
var App = {
	Events: new events.EventEmitter(),
	Services: {}
}

function loadModules(callback) {
	var initChain = [], i, l, k, j, current, tmp;

	modulesList.forEach(function(module) {
		App.Services[module.id] = require(path.resolve(__dirname, module.path));
		if(typeof App.Services[module.id].init === 'function'){
			initChain.push({
				id: module.id,
				deps: module.deps,
				init: App.Services[module.id].init,
				depsDone: false
			});
		}
	});

	for(i = 0, l = initChain.length; i < l; i++) {
		current = initChain[i];
		if((!current.deps || !current.deps.length) && !current.depsDone) {
			initChain.unshift(initChain.splice(i, 1)[0]);
		} else {
			current.deps.forEach(function(e, ind) {
				for(k = 0, j = initChain.length; k < j; k++) {
					if(initChain[k].id === current.id) {continue;} else if(initChain[k].id === e) {
						current.deps.splice(ind, 1);
						if(!current.deps.length){
							tmp = initChain.splice(i, 1)[0];
							if(k < initChain.length) {initChain.splice(k, 0, tmp);} else {initChain.push(tmp);}
							current.depsDone = true;
						}
					}
				}
				if(current.deps.length) {throw new Error('the dependencies of "' + current.id + '" were not found: ' + current.deps);}
			});
		}
	}
	
	(function iterate() {
		var nextInit = initChain.shift();
		if(nextInit) {
			nextInit.init(App, iterate);
		} else {
			callback();
		}
	})()
}

function start() {
	console.log('App started and running');
	
	//	Async started modules should be used from here on
	App.Services.serviceAsync.processor('passed to processor');
}

loadModules(start);

//	Util usage, immediate
utils.textFunc('some text to see from util');

//	Service usage, immediate
App.Services.service.service('data passed to service');

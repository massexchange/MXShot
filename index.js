var page = require('webpage').create();

page.viewportSize = {
  width: 1366,
  height: 768
};

page.onLoadFinished = function(status) {
	page.evaluate(function() {
		require(["app/hub"], function(hub) {
			hub.sub("app/renderer/rendered", function(view) {
				window.callPhantom(view);
			});
		});
		return document.getElementById("btnLogin");
	});
};

page.onCallback = function(view) {
	console.log(view);
	var viewActions = {
		login: function() {
			console.log("login form rendered!");
			var btnLogin = page.evaluate(function() {
				document.getElementById("txtUser").value = "pub";
				document.getElementById("txtPass").value = "test";
				document.getElementById("btnLogin").click();
			});
			// page.sendEvent("click", btnLogin.offsetLeft+5, btnLogin.offsetTop+5);
		},
		profile: function() {
			while(!page.render('mx.png')) {}
			phantom.exit();
		}
	};
	
	if(viewActions[view])
		viewActions[view]();
};



page.open('http://localhost/profile');
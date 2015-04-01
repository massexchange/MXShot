var page = require('webpage').create();

page.viewportSize = {
  width: 1366,
  height: 768
};

page.onLoadFinished = function(status) {
	page.evaluate(function() {
		require(["app/hub"], function(hub) {
			hub.sub("app/renderer/rendered", function(view) {
				if(view == "login")
					window.callPhantom();
			});
		});
		return document.getElementById("btnLogin");
	});
};
page.onCallback = function() {
	console.log("login form rendered!");
	var btnLogin = page.evaluate(function() {
		document.getElementById("txtUser").value = "pub";
		document.getElementById("txtPass").value = "test";
		return document.getElementById("btnLogin");
	});
	
	page.sendEvent("click", btnLogin.offsetLeft, btnLogin.offsetTop);

	while(!page.render('mx.png')) {}
	phantom.exit();
};


page.open('http://localhost/profile');
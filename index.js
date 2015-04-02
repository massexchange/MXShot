var page = require('webpage').create();

page.viewportSize = {
  width: 1366,
  height: 768
};

page.onLoadFinished = function(status) {
    page.injectJs("bower_components/zepto/zepto.js");
    page.evaluate(function() {
        require(["app/hub"], function(hub) {
            hub.sub("app/renderer/rendered", function(view) {
                window.callPhantom(view);
            });
        });
    });
};

var viewActions = {
    login: function() {
        var btnLogin = page.evaluate(function() {
            $("#txtUser").val("pub");
            $("#txtPass").val("test");
            $("#btnLogin").click();
        });
        // page.sendEvent("click", btnLogin.offsetLeft+5, btnLogin.offsetTop+5);
    },
    profile: function() {
        screenshot("profile");

        traverseSite();
    }
};

var screenshot = function(name) {
    while(!page.render(name + ".png")) {}
};

/*
scrape list of links
reduce links: a, b
    get view name from a.data
    register view.onRender callback
        take screenshot
        if b present
        recurse with b
    click link

*/
var traverseSite = function() {
    var selectLinks = function($) {
        return $("#navbar").children("ul").children("li");
    };
    var links = page.evaluate(function() {
        var links = $("#navbar").children("ul").children("li");
        return links.map(function() {
            return $(this).data("name");
        }).get();
    });
    console.log(JSON.stringify(links));

    var traverser = {
        links: links,
        current: 1,
        step: function() {
            var view = this.links[this.current];
            var cb = this.current < (this.links.length-1)
                ? this.step
                : phantom.exit;
            viewActions[view] = function() {
                screenshot(view);
                cb();
            };
            page.evaluate(function() {
                $("#navbar").children("ul").children("li")
                    .eq(this.current).click();
            });
            this.current++;
        }
    };
    traverser.step();
};

page.onCallback = function(view) {
    console.log("Rendered: ", view);
    
    if(viewActions[view])
        viewActions[view]();
};

page.open('http://localhost/profile');
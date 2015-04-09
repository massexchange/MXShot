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
        page.evaluate(function() {
            $("#txtUser").val("pub");
            $("#txtPass").val("test");
            $("#btnLogin").click();
        });
    },
    profile: function() {
        screenshot("profile");

        traverseSite();
    }
};

var screenshot = function(name) {
    console.log("taking screenshot of: ", name);
    while(!page.render(name + ".png")) {}
    console.log("done screenshotting");
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
            console.log("on link: ", view);
            var cb = this.current < (this.links.length-1)
                ? this.step
                : phantom.exit;
            viewActions[view] = function() {
                console.log("view " + view + " rendered");
                screenshot(view);
                cb();
            };
            console.log("about to click link");
            page.evaluate(function(linkIndex) {
                var link = $("#navbar").children("ul").children("li").eq(linkIndex);
                console.log(link);
                link.click();
            }, this.current);
            console.log("link clicked");
            this.current++;
        }
    };
    console.log("starting traversal");
    traverser.step();
};

page.onCallback = function(view) {
    console.log("Rendered: ", view);
    
    if(viewActions[view])
        viewActions[view]();
};

page.open('http://localhost/profile');
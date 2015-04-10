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
    console.log("links: ", JSON.stringify(links));

    var traverser = {
        links: links,
        current: 1
    };
    var step = function() {
        console.log("current step: ", traverser.current);
        console.log("traverser: ", JSON.stringify(traverser));
        var view = traverser.links[traverser.current];
        console.log("on link: ", view);
        var cb = traverser.current < (traverser.links.length-1)
            ? step
            : phantom.exit;
        viewActions[view] = function() {
            console.log("view " + view + " rendered");
            screenshot(view);
            cb();
        };
        console.log("about to click link");
        page.evaluate(function(linkIndex) {
            var link = $("#navbar").children("ul").children("li").eq(linkIndex);
            link.children("a").click();
        }, traverser.current);
        console.log("link clicked");
        traverser.current++;
    }
    console.log("starting traversal");
    step();
};

page.onCallback = function(view) {
    console.log("Rendered: ", view);
    
    if(viewActions[view])
        viewActions[view]();
};
page.onConsoleMessage = function(msg, lineNum, sourceId) {
    console.log("CONSOLE: ", JSON.stringify(msg));
};
page.onError = function(msg, trace) {
    var msgStack = ['ERROR: ' + msg];

    if (trace && trace.length) {
        msgStack.push('TRACE:');
        trace.forEach(function(t) {
            msgStack.push(' -> ' + t.file + ': ' + t.line + (t.function ? ' (in function "' + t.function +'")' : ''));
        });
    }
    
    console.error(msgStack.join('\n'));
};



page.open('http://localhost/profile');
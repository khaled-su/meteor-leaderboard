describe('Chimp Mocha', function() {
    describe('Page title', function () {
        it('should be set by the Meteor method @watch', function () {
            browser.url('http://www.google.com');
            //var result = server.call(getMeteorSettings, 'mySetting');
            console.log(result);
            expect(browser.getTitle()).to.equal('Google');
        });
    });
});

var getMeteorSettings = function(setting) {
    return Meteor.settings[setting]
};

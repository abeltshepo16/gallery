window.GoogleAPI = (function($) {

    function injectLib() {
        return $.Deferred(function(defer) {
            var script = document.createElement('script');
            script.setAttribute('async', '');
            script.setAttribute('defer', '');
            script.setAttribute('src', 'https://apis.google.com/js/api.js');
            script.onload = function() {
                this.onload = function() {};
                defer.resolve();
            };
            script.onreadystatechange = function() {
                if (this.readyState === 'complete') this.onload();
            };

            document.body.appendChild(script);
        });
    }

    function loadClient() {
        return $.Deferred(function(defer) {
            gapi.load('client:auth2', function() {
                gapi.client.load('plus', 'v1').then(function() {
                    defer.resolve();
                });
            });
        });
    }

    function initClient() {
        var CLIENT_ID = '564241055409-ln5568pf48njq7vtb11dff0hdpoum000.apps.googleusercontent.com',
            API_KEY = 'AIzaSyCgR9Ci3wocS1wbH0kN-dfG2SfSodQlJdE';

        return $.Deferred(function (defer) {
            gapi.client.init({
                apiKey: API_KEY,
                clientId: CLIENT_ID,
                discoveryDocs: ["https://people.googleapis.com/$discovery/rest?version=v1"],
                scope: 'https://www.googleapis.com/auth/plus.login'
            }).then(defer.resolve.bind(defer), defer.reject.bind(defer));
        });
    }

    function init() {
        return injectLib().then(loadClient).then(initClient);
    }

    function isSignedIn() {
        return gapi.auth2.getAuthInstance().isSignedIn.get();
    }

    function signIn() {
        return $.Deferred(function (defer) {
            if (isSignedIn()) {
                return defer.resolve(isSignedIn());
            }

            gapi.auth2.getAuthInstance().signIn();
            gapi.auth2.getAuthInstance().isSignedIn.listen(function(isSigned) {
                defer.resolve(isSigned);
            })
        });
    }

    function signOut() {
       return gapi.auth2.getAuthInstance().signOut();
    }

    function userInfo() {
        return $.Deferred(function (defer) {
            gapi.client.plus.people.get({
                'userId' : 'me'
            }).then(defer.resolve.bind(defer), defer.fail.bind(defer));
        });
    }


    return {
        init: init,
        isSignedIn: isSignedIn,
        signIn: signIn,
        signOut: signOut,
        userInfo: userInfo
    }
}(jQuery));
var isWebkitBrowser = function() {
    var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    var isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);
    return isChrome || isSafari;
};

var goToHashtag = function(hashtag){
    if ( !isWebkitBrowser() ) {
        window.location.hash = hashtag;
    } else {
        window.location.href = hashtag;
    }
};

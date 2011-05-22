var LP = new LyricsPlugin();
LP.init();

chrome.extension.sendRequest({
  'action': 'showPageActionIcon'
});

chrome.extension.onRequest.addListener(function(request, sender, callback) {
  switch(request.action){
    case 'onPageActionClicked':
      LP.onPageActionClicked();
    break;
  }
});
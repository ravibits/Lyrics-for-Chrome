var LP = new LyricsPlugin();
LP.init();

chrome.extension.sendRequest({
  'action': 'showPageActionIcon'
});

chrome.extension.onRequest.addListener(function(request, sender, callback) {
  switch(request.action){
    case 'showLyricsOnPage':
      LP.onPageActionClicked();
    break;
    case 'getLyricsTitle':
      // Send the title of song to the background page
      callback({title: LP.setTitleFromPage()});
    break;
  }
});
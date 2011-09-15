function getLyricsFromRawHtml(data){
  var filter = function(){
    // filters all text nodes and some inline elements out
    return this.nodeType === Node.TEXT_NODE || $(this).is('p, br, i, b, strong, em');
  };
  
  // create a div,
  // append .lyricsbox's direct children to it
  // and filter all unnecessary elements out
  // get the html and remove the div.
  return $('<div>').append($(data).find('.lyricbox').contents().filter(filter)).remove().html();
}

function getSongInfoFromRawHtml(data){
  return $(data).find('#WikiaPageHeader h1').text();
}

function getLyrics(title, callback) {
  var startPos, 
      endPos, 
      lyrics,
      url = 'http://google.com/search?sourceid=navclient&btnI=1&q=site%3Alyrics.wikia.com+' + encodeURIComponent(' -"Page Ranking Information" ' + title);
  
  $.ajax({
    url: url,
    type: 'GET',
    success: function(data, status){
      try {
      
        // Check if XHR completed succesfully
        if(status !== 'success'){
          throw('Could not connect with LyricWiki');
        }
        
        lyrics = getLyricsFromRawHtml(data);
        
        if(lyrics.length === 0){
          throw('No lyrics found');
        }
        
        // Send info to Google Analytics
        _gaq.push(['_trackEvent', 'Lyrics', 'Found']);
        
        // Send lyrics back
        callback({
          success: true,
          lyrics: lyrics,
          providerTitle: getSongInfoFromRawHtml(data)
        });
      } catch(err) {
      
        // Send info to Google Analytics
        _gaq.push(['_trackEvent', 'Lyrics', 'Not found']);
        
        // Error in request
        callback({
          success: false,
          errorMsg: err
        });            
      }
    }
  });
}
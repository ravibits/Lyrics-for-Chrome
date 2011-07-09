LyricsPlugin.prototype.getTitleFromPage = function(){
  // Set the video's title
  var song = $('#radioTrackMeta .track').text(),
      artist = $('#radioTrackMeta .artist').text();
      
  if(song.length === 0 && artist.length === 0){
    this.currentLyrics.title = "";
  } else {
    this.currentLyrics.title = $('#radioTrackMeta .track').text() + ' - ' + $('#radioTrackMeta .artist').text();
  }
  
  return this.currentLyrics._title;
};

LyricsPlugin.prototype.init = function(){
  var lyricsHTML, lyricsObj, self = this;

  // Set the video's title
  this.getTitleFromPage();
  
  this.hasMaxHeight = true;
  this.maxHeight = 426;
  
  lyricsHTML = [
    '<div id="lfc-outerwrapper" class="items">',
      '<h2 class="heading"><span class="h2Wrapper">',
        'Lyrics <a href="#" id="lfc-change-lyrics">(',
          chrome.i18n.getMessage('changeLyrics'),
        ')</a>',
        '<img id="lfc-remove-lyrics" src="http://cdn.last.fm/flatness/global/icon_delete.2.png" ',
          'alt="', chrome.i18n.getMessage('removeLyrics'), '"',
          'title="', chrome.i18n.getMessage('removeLyrics'), '"',
        '/>',
      '</span></h2>',
      '<div id="lfc-innerwrapper" class="itemContent">',
        
        '<div id="lfc-flash-wrap">',
          '<strong id="lfc-flash-message"></strong>',
          '<p id="lfc-flash-description"></p>',
        '</div>',
          
        '<div id="lfc-loading-message">',
          chrome.i18n.getMessage('loadingMessage'),
        '</div>',
        
        '<div id="lfc-lyrics" class="lfc-scrollbar-enabled">',
          // this is where the lyrics goes
        '</div>',
        
        // this form will show up when no lyrics were found
        '<form id="lfc-search-form" action="#">',
          '<p><input type="text" id="lfc-search-lyrics" name="lfc-search-lyrics" /></p>',
        '</form>',
      '</div>',
    '</div>'
  ].join('');
  
  // The div that holds everything
  this.elements.outerWrapper = lyricsObj = $(lyricsHTML);
  
  // The div that holds the actual content (no headers)
  this.elements.innerWrapper = $('#lfc-innerwrapper', lyricsObj);
  
  // Loading message wrapper
  this.elements.loadingMessage = $('#lfc-loading-message', lyricsObj);
  
  // The div that holds the lyrics itself
  this.elements.lyricsContent = $('#lfc-lyrics', lyricsObj);
  
  // The form which you can use to search manually for lyrics
  this.elements.searchForm = $('#lfc-search-form', lyricsObj);
  
  // The input field for manual search
  this.elements.searchInput = $('#lfc-search-lyrics', lyricsObj);
  
  // Create a remove from page button
  this.elements.removeEl = $('#lfc-remove-lyrics', lyricsObj);
  
  this.elements.changeLyrics = $('#lfc-change-lyrics', lyricsObj);
  
  this.elements.flashMessage = $('#lfc-flash-message', lyricsObj);
  this.elements.flashDescription = $('#lfc-flash-description', lyricsObj);
  this.elements.flashWrap = $('#lfc-flash-wrap', lyricsObj);
  
  // Make sure you hide the outer wrapper in first instance
  this.hide();
  
  // And also hide the lyrics and form div
  this.elements.searchForm.hide();
  this.elements.lyricsContent.hide();
  
  // Add it to the side bar
  $('#recentTracks').before(lyricsObj);
  
  // Change lyrics button
  this.elements.changeLyrics.click(function(){
    self.showSearchForm('searchTitle', 'searchHelp');
    
    return false;
  });
  
  // Set the click event for removing the lyrics from the page
  this.elements.removeEl.click(function(){
    self.hide();
    return false;
  });
  
  this.elements.searchForm.submit(function() {
    
    // Set the title and try to get the lyrics again
    self.currentLyrics.title = self.elements.searchInput.val();
    self.queryLyrics();
    
    return false;
  });
};

// override the show function
LyricsPlugin.prototype.show = function(){
  this.getTitleFromPage();
  this.elements.outerWrapper.show();
  this.isVisible = true;
};
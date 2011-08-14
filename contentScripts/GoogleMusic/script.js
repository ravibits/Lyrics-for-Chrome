LyricsPlugin.prototype.getTitleFromPage = function(){
  // Set the video's title
  var song = $('#playerSongTitle').text(),
      artist = $('#playerArtist').text();
      
  if(song.length === 0 && artist.length === 0){
    return false;
  }
  
  return song + ' - ' + artist;
};

LyricsPlugin.prototype.setTitleFromPage = function(){
  // Set the video's title
  var song = $('#playerSongTitle').text(),
      artist = $('#playerArtist').text();
      
  if(song.length === 0 && artist.length === 0){
    this.currentLyrics.title = "";
  } else {
    this.currentLyrics.title = song + ' - ' + artist;
    this.currentLyrics.originalTitle = song + ' - ' + artist;
  }
  
  return this.currentLyrics._title;
};

LyricsPlugin.prototype.init = function(){
  var lyricsHTML, lyricsObj, self = this;

  // Set the video's title
  this.setTitleFromPage();
  
  this.hasMaxHeight = false;
  
  lyricsHTML = [
    '<div id="lfc-outerwrapper">',
      '<div class="nav-section-header">',
        '<div id="lfc-minimize-lyrics" class="newPlaylistBtn target" title="',
          chrome.i18n.getMessage('minimizeLyrics'),
        '" style="background-image: url(', 
          chrome.extension.getURL('contentScripts/GoogleMusic/minimize.png'), 
        ');"></div>',
        '<div id="lfc-refresh-lyrics" class="newPlaylistBtn target" title="',
          chrome.i18n.getMessage('refreshLyrics'),
        '" style="background-image: url(', 
          chrome.extension.getURL('contentScripts/GoogleMusic/refresh.png'), 
        ');"></div>',
        '<div id="lfc-change-lyrics" class="newPlaylistBtn target" title="',
          chrome.i18n.getMessage('changeLyrics'),
        '" style="background-image: url(', 
          chrome.extension.getURL('contentScripts/GoogleMusic/edit.png'), 
        ');"></div>',
        'LYRICS',
      '</div>',
      '<div id="lfc-innerwrapper">',
        
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
  this.elements.minimizeLyrics = $('#lfc-minimize-lyrics', lyricsObj);
  this.elements.refreshLyrics = $('#lfc-refresh-lyrics', lyricsObj);
  
  this.elements.flashMessage = $('#lfc-flash-message', lyricsObj);
  this.elements.flashDescription = $('#lfc-flash-description', lyricsObj);
  this.elements.flashWrap = $('#lfc-flash-wrap', lyricsObj);
  
  // Make sure you hide the outer wrapper in first instance
  this.hide();
  
  // And also hide the lyrics and form div
  this.elements.searchForm.hide();
  this.elements.lyricsContent.hide();
  
  // Add it to the side bar
  $('#nav_collections').after(lyricsObj);
  
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
  
  this.elements.minimizeLyrics.click(function(){
    self.elements.innerWrapper.slideToggle('fast', function(){
      self.elements.outerWrapper.toggleClass('minimized')
    });
  });
  
  this.elements.refreshLyrics.click(function(){
    self.setTitleFromPage();
    self.queryLyrics();
    
    return false;
  });
  
  this.elements.searchForm.submit(function() {
    
    // Set the title and try to get the lyrics again
    self.currentLyrics.title = self.elements.searchInput.val();
    self.queryLyrics();
    
    return false;
  });
  
  this.searchIntervalCallback = function(){
    var titleFromPage = self.getTitleFromPage();
    
    if(titleFromPage && titleFromPage !== self.currentLyrics.originalTitle){
      self.setTitleFromPage();
      self.queryLyrics();
    }
  };
};
/**
 * Override the .show function
 */
LyricsPlugin.prototype.show = function(){
  this.startSearchInterval(2000);
  this.setTitleFromPage();
  this.elements.outerWrapper.show();
  this.isVisible = true;
};

LyricsPlugin.prototype.hide = function(){
  this.stopSearchInterval(2000);
  this.hideSections();
  this.elements.outerWrapper.hide();
  this.isVisible = false;
};
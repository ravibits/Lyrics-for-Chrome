LyricsPlugin.prototype.getTitleFromPage = function(){
  // Set the video's title
  this.currentLyrics.title = $('#watch-headline-title').text();
  
  return this.currentLyrics._title;
};

LyricsPlugin.prototype.init = function(){
  var lyricsHTML, lyricsObj, self = this;

  // Set the video's title
  this.getTitleFromPage();
  
  this.hasMaxHeight = true;
  this.maxHeight = 426;
  
  lyricsHTML = [
    '<div id="ytl-outerwrapper" class="watch-module">',
      '<div class="watch-module-body">',
      
        // clicking this image will hide the lyrics from the page
        '<img src="//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif" id="ytl-remove-lyrics" class="master-sprite img-php-close-button" ',
          'alt="', chrome.i18n.getMessage('removeLyrics'), '"',
          'title="', chrome.i18n.getMessage('removeLyrics'), '"',
        '/>',
        
        '<h4 class="first">Lyrics <a href="#" id="lfc-change-lyrics">(',
          chrome.i18n.getMessage('changeLyrics'),
        ')</a></h4>',
        
        '<div id="ytl-innerwrapper">',
          '<div id="ytl-loading-message">',
            chrome.i18n.getMessage('loadingMessage'),
          '</div>',
          
          '<div id="ytl-lyrics" class="ytl-scrollbar-enabled">',
            // this is where the lyrics goes
          '</div>',
          
          // this form will show up when no lyrics were found
          '<form id="ytl-search-form" action="#">',
            '<p id="ytl-no-lyrics-found">',
              chrome.i18n.getMessage('notFound'),
            '</p>',
            '<p id="ytl-form-help">',
              chrome.i18n.getMessage('notFoundHelp'),
            '</p>',
            '<p><input type="text" id="ytl-search-lyrics" name="ytl-search-lyrics" /></p>',
          '</form>',
        '</div>',
      '</div>',
    '</div>'
  ].join('');
  
  // The div that holds everything
  this.elements.outerWrapper = lyricsObject = $(lyricsHTML);
  
  // The div that holds the actual content (no headers)
  this.elements.innerWrapper = $('#ytl-innerwrapper', lyricsObject);
  
  // Loading message wrapper
  this.elements.loadingMessage = $('#ytl-loading-message', lyricsObject);
  
  // The div that holds the lyrics itself
  this.elements.lyricsContent = $('#ytl-lyrics', lyricsObject);
  
  // The form which you can use to search manually for lyrics
  this.elements.searchForm = $('#ytl-search-form', lyricsObject);
  
  // The input field for manual search
  this.elements.searchInput = $('#ytl-search-lyrics', lyricsObject);
  
  // Create a remove from page button
  this.elements.removeEl = $('#ytl-remove-lyrics', lyricsObject);
  
  this.elements.changeLyrics = $('#lfc-change-lyrics', lyricsObject);
  
  // Make sure you hide the outer wrapper in first instance
  this.hide();
  
  // And also hide the lyrics and form div
  this.elements.searchForm.hide();
  this.elements.lyricsContent.hide();
  
  // Change lyrics button
  this.elements.changeLyrics.click(function(){
    self.showSearchForm();
    self.setFlashMessage('searchTitle', 'searchHelp');
    
    return false;
  });
  
  // Add it to the side bar
  $('#watch-sidebar').prepend(lyricsObject);
  
  // Set the click event for removing the lyrics from the page
  this.elements.removeEl.click(function(){
    self.hide();
    
    return false;
  });
  
  this.elements.searchForm.submit(function(e) {
    // Set the title and try to get the lyrics again
    self.currentLyrics.title = self.elements.searchInput.val();
    self.queryLyrics();
    
    return false;
  });
};
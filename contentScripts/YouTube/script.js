// since v1.3: make it work for the NEW YouTube
LyricsPlugin.prototype.newYouTube = false;

LyricsPlugin.prototype.getTitleFromPage = function(){
  // Set the video's title
  if(this.newYouTube){
    this.currentLyrics.title = $('#eow-title').text();
  } else {
    this.currentLyrics.title = $('#watch-headline-title').text();
  }
  
  return this.currentLyrics._title;
};

LyricsPlugin.prototype.init = function(){
  var lyricsHTML, lyricsObj, self = this;
  
  // Check if you are currently on the NEW YouTube
  this.newYouTube = $('.watch-sidecol').length !== 0;

  // Set the video's title
  this.getTitleFromPage();
  
  this.hasMaxHeight = true;
  this.maxHeight = 426;
  
  lyricsHTML = [
    '<div id="ytl-outerwrapper" class="watch-module">',
      '<div class="watch-module-body">',
      
        // clicking this image will hide the lyrics from the page
        '<img src="//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif" id="ytl-remove-lyrics" ',
          'alt="', chrome.i18n.getMessage('removeLyrics'), '"',
          'title="', chrome.i18n.getMessage('removeLyrics'), '"',
        '/>',
        
        '<h4 class="first clearfix">',
          '<a href="#" id="lfc-open-in-new-tab">Lyrics</a> ',
          '<a href="#" id="lfc-change-lyrics">(',
            chrome.i18n.getMessage('changeLyrics'),
          ')</a>',
        '</h4>',
        
        '<div id="ytl-innerwrapper">',
        
          '<div id="lfc-flash-wrap">',
            '<strong id="lfc-flash-message"></strong>',
            '<p id="lfc-flash-description"></p>',
          '</div>',
          
          '<div id="ytl-loading-message">',
            chrome.i18n.getMessage('loadingMessage'),
          '</div>',
          
          '<div id="ytl-lyrics" class="ytl-scrollbar-enabled">',
            // this is where the lyrics goes
          '</div>',
          
          // this form will show up when no lyrics were found
          '<form id="ytl-search-form" action="#">',
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
  
  this.elements.flashMessage = $('#lfc-flash-message', lyricsObject);
  this.elements.flashDescription = $('#lfc-flash-description', lyricsObject);
  this.elements.flashWrap = $('#lfc-flash-wrap', lyricsObject);
  
  // Make sure you hide the outer wrapper in first instance
  this.hide();
  
  // And also hide the lyrics and form div
  this.elements.searchForm.hide();
  this.elements.lyricsContent.hide();
  
  // Change lyrics button
  this.elements.changeLyrics.click(function(){
    self.hideSections();
    self.showSearchForm('searchTitle', 'searchHelp');
    
    return false;
  });
  
  // Add it to the side bar
  if(this.newYouTube){
    // New youtube
    lyricsObject.addClass('newYouTube watch-panel-section');
    this.elements.removeEl.attr('src', '//s.ytimg.com/yt/img/watch6-icon-close-vflZt2x4c.png');
    $('.watch-sidecol:first').prepend(lyricsObject);
  } else {
    // Old youtube
    this.elements.removeEl.addClass('master-sprite img-php-close-button');
    $('#watch-sidebar').prepend(lyricsObject);
  }
  
  $('#lfc-open-in-new-tab', lyricsObject).click(function(){
    chrome.extension.sendRequest({
      'action': 'currentLyricsToTab',
      'title': self.currentLyrics.title
    });
    
    return false;
  });
  
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
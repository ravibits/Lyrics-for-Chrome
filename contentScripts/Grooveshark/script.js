LyricsPlugin.prototype.getTitleFromPage = function(){
  // Set the video's title
  var song = $('#playerDetails_nowPlaying .song').text(),
      artist = $('#playerDetails_nowPlaying .artist').text();
      
  if(song.length === 0 && artist.length === 0){
    return false;
  }
  
  return song + ' - ' + artist;
};

LyricsPlugin.prototype.setTitleFromPage = function(){
  // Set the video's title
  var song = $('#playerDetails_nowPlaying .song').text(),
      artist = $('#playerDetails_nowPlaying .artist').text();
      
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
  var imageUrl = chrome.extension.getURL("contentScripts/Grooveshark/grooveshark-lyrics.png");
  var li = $('<li id="lfc_header_nav_lyrics" class="lyrics" />');
  var link = $('<a href="/#/user" id="lfc-lyrics-menu-button"></a></li>').css('background-image', 'url(' + imageUrl + ')');
  
  li.append(link);
  
  // Add a lyrics button to the menu
  $('#nav').bind("DOMSubtreeModified", function(){
    if($('#lfc_header_nav_lyrics').length === 0 && $(this).children().length > 0){
      $(this).append(li);
    }
  });

  // Set the video's title
  this.setTitleFromPage();
  
  // The height is controlled by Grooveshark itself
  this.hasMaxHeight = false;
  
  this.setSongTitleInFlashMessage = true;
  
  lyricsHTML = [
    '<div id="page" class="gs_page_popular">',
      '<div id="page_header">',
        '<div class="meta">',
          '<h3 id="lfc-flash-message">',
            
          '</h3>',
        '</div>',
        '<div class="page_options">',
          '<button id="lfc-refresh-lyrics" class="btn btn_style2" type="button"><div><span class="label">',
            chrome.i18n.getMessage('refreshLyrics'),
          '</span></div></button>',
          '<button id="lfc-change-lyrics" class="btn btn_style2" type="button"><div><span class="label">',
            chrome.i18n.getMessage('changeLyrics'),
          '</span></div></button>',
        '</div>',
        '<div class="clear"></div>',
        '<div class="highlight"></div>',
        '<div class="shadow"></div>',
      '</div>',
      '<div id="page_content">',
        '<div id="lfc-flash-wrap">',
          '<p id="lfc-flash-description"></p>',
        '</div>',
        
        '<div id="lfc-loading-message">',
          chrome.i18n.getMessage('loadingMessage'),
        '</div>',
        
        '<div id="lfc-lyrics">',
          
        '</div>',
        
        '<form id="lfc-search-form" class="search">',
          '<div class="field">',
            '<div class="textarea_wrapper clear">',
              '<div class="top"><div class="cap"></div></div>',
              '<div class="inner">',
                '<div class="cap">',
                  '<input type="text" id="lfc-search-lyrics" class="search"/>',
                '</div>',
              '</div>',
              '<div class="bottom"><div class="cap"></div></div>',
            '</div>',
          '</div>',

          '<button type="submit" id="lfc-search-button" class="btn btn_style4"><div><span>',
            chrome.i18n.getMessage('find'),
          '</span></div></button>',
          '<div class="clear"></div>',
        '</form>',
    '</div>'
  ].join('');
  
  // The div that holds everything
  this.elements.outerWrapper = lyricsObject = $(lyricsHTML);
  
  // The div that holds the actual content (no headers)
  this.elements.innerWrapper = $('#page_content', lyricsObject);
  
  // Loading message wrapper
  this.elements.loadingMessage = $('#lfc-loading-message', lyricsObject);
  
  // The div that holds the lyrics itself
  this.elements.lyricsContent = $('#lfc-lyrics', lyricsObject);
  
  // The form which you can use to search manually for lyrics
  this.elements.searchForm = $('#lfc-search-form', lyricsObject);
  
  // The input field for manual search
  this.elements.searchInput = $('#lfc-search-lyrics', lyricsObject);
  
  this.elements.changeLyrics = $('#lfc-change-lyrics', lyricsObject);
  this.elements.refreshLyrics = $('#lfc-refresh-lyrics', lyricsObject);
  
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
  
  // Refresh lyrics button
  this.elements.refreshLyrics.click(function(){
    self.setTitleFromPage();
    self.queryLyrics();
    
    return false;
  });
  
  this.addToPage = function(){
    document.title = chrome.i18n.getMessage('extName') + ' - Grooveshark';
    $('#page').html('').append(lyricsObject);
    $('#page_content').height($('#page_wrapper').height() - $('#theme_page_header').height() - $('#page_header').height());
  }
  
  // Add it to the page
  $('#lfc-lyrics-menu-button').live('click', function(){
    self.show();
    self.showSearchForm('searchTitle', 'searchHelp');
    
    if(self.currentLyrics.title.length > 0) {
      self.queryLyrics();
    }
    
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
  
  $('#lfc-search-button').live('click', function(){
    self.elements.searchForm.submit();
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
  this.addToPage();
  this.elements.outerWrapper.show();
  this.isVisible = true;
};

LyricsPlugin.prototype.hide = function(){
  this.stopSearchInterval();
  this.hideSections();
  this.elements.outerWrapper.hide();
  this.animateHeight(this.elements.innerWrapper, 0);
  this.isVisible = false;
  $('#headerSearchBtn').click();
};
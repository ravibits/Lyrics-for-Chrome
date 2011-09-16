function LyricsPlugin(){
  var self = this;
  
  this.currentLyrics = {
    _title: "",
    filter: true
  };

  this.elements = {
    innerWrapper: $(), 
    outerWrapper: $(), 
    lyricsContent: $(),
    removeEl: $(),
    searchForm: $(),
    searchInput: $(),
    loadingMessage: $(),
    flashMessage: $(),
    flashDescription: $(),
    flashWrap: $()
  };
  
  this.searchInterval = null;
  this.searchIntervalCallback = function(){};
  
  this.startSearchInterval = function(time){
    this.searchInterval = setInterval(this.searchIntervalCallback, time);
  };
  
  this.stopSearchInterval = function(){
    clearInterval(this.searchInterval);
    this.searchInterval = null;
  };
  
  /**
   * A getter for the title
   */
  this.currentLyrics.__defineGetter__('title', function(){
    return this._title;
  });
  
  /**
   * A setter for the title, which automatically filters the title if set so
   */
  this.currentLyrics.__defineSetter__('title', function(val){
    this._title = (this.filter ? self.filterTitle(val) : val);
  });
}

/**
 * A check if the plugin is active on the page (search form or lyrics)
 */
LyricsPlugin.prototype.isVisible = false;

LyricsPlugin.prototype.setSongTitleInFlashMessage = false;

/**
 * Hide all sections (loading message, lyrics and search form) from the page
 */
LyricsPlugin.prototype.hideSections = function(){
  this.elements.searchForm.hide();
  this.elements.lyricsContent.hide();
  this.elements.loadingMessage.hide();
  this.elements.flashMessage.html('');
  this.elements.flashDescription.html('');
};

/**
 * Show a certain section on the page
 * Animates the height of the inner wrapper
 */
LyricsPlugin.prototype.showSection = function(section){
  this.elements[section].show();
  
  // Animate the height of the content div
  this.animateHeight(this.elements.innerWrapper, this.elements[section].height() + this.elements.flashWrap.height());
};

/**
 * Hide the plugin from the page
 */
LyricsPlugin.prototype.hide = function(){
  this.hideSections();
  this.elements.outerWrapper.hide();
  this.animateHeight(this.elements.innerWrapper, 0);
  this.isVisible = false;
};

/**
 * Show the plugin on the page
 */
LyricsPlugin.prototype.show = function(){
  this.elements.outerWrapper.show();
  this.isVisible = true;
};



/**
 * Handle the page action click event
 */
LyricsPlugin.prototype.onPageActionClicked = function(onlyRequery){
  
  if(!onlyRequery && this.isVisible){
  
    // If the lyrics div is on the page, hide it
    this.hide();
  } else {
    
    // Show the lyrics div on the page
    this.show();
    
    // Fetch and display the lyrics
    this.queryLyrics();
  }
};

/**
 * Can be used to show error messages
 */
LyricsPlugin.prototype.setFlashMessage = function(message, description, i18n){
  this.elements.flashMessage.html(i18n ? chrome.i18n.getMessage(message) : message);
  this.elements.flashDescription.html(i18n ? chrome.i18n.getMessage(description) : description);
};
  
/**
 * Set the lyrics for the current song
 * or add a search form if no lyrics were found
 */
LyricsPlugin.prototype.lyricsCallback = function(data) {
  var lyrics = $('<div/>');
  
  function hideNewPopupNotification(notification){
    notification.slideUp();
    
    chrome.extension.sendRequest({
      'action': 'hideNewPopupNotification'
    });
    localStorage['showNewPopupNotification'] = 'false';
  }
  
  if (data.success) {
  
    if(data.showNewPopupNotification){
      var notification = $([
        '<span class="lfc-notification">',
          chrome.i18n.getMessage('tryThePopup'),
          ' ',
          '<span class="lfc-notification-hide">',
          chrome.i18n.getMessage('hide'),
          '</span>',
        '</span>'
      ].join(''));
      notification.click(function(){
        chrome.extension.sendRequest({
          'action': 'openSettings',
        }, function(){
          hideNewPopupNotification(notification)
        });
        return false;
      });
      
      notification.find('span').click(function(){
        hideNewPopupNotification(notification);
        return false;
      });
      
      lyrics.append(notification).html();
    }
    
    // We've found the lyrics successfully, so show it
    this.showLyrics(lyrics.append(data.lyrics));
  } else {
  
    // No lyrics found
    // Make sure that the next lyrics will be searched manually
    // so no filters are applied
    this.currentLyrics.filter = false;
    this.showSearchForm('notFound', 'notFoundHelp');
    
  }
};

/**
 * Get the lyrics for the current song
 */
LyricsPlugin.prototype.queryLyrics = function() {
  
  // Keep a reference for the callback
  var self = this;
  
  // Display loading message
  this.hideSections();
  this.showSection('loadingMessage');

  // Fetch and display the lyrics
  chrome.extension.sendRequest({
    'action': 'getLyrics',
    'title': this.currentLyrics.title
  }, function(request){
    self.lyricsCallback(request);
  });
};

/**
 * Initialize the lyricsplugin on the page
 * This is overriden by a website specific script
 */
LyricsPlugin.prototype.init = function(){};

/**
 * Get the song title from the page
 * This is overriden by a website specific script
 */
LyricsPlugin.prototype.getTitleFromPage = function(){};

/**
 * Show lyrics and copyright info on the page
 */
LyricsPlugin.prototype.showLyrics = function(lyrics){
  // Hide all content
  this.hideSections();
  
  // Insert the lyrics
  this.elements.lyricsContent.html('').append(lyrics.contents());
  this.elements.lyricsContent.append(['<br/><br/>', chrome.i18n.getMessage("copyrightInfo"), '<br/>', chrome.i18n.getMessage("copyrightCourtesy")].join(''));
  this.showSection('lyricsContent');
  
  if(this.setSongTitleInFlashMessage){
    this.setFlashMessage('Lyrics', this.currentLyrics.title, false);
  }
};

/**
 * Places a search form in the lyrics div
 * to search manually for lyrics
 */
LyricsPlugin.prototype.showSearchForm = function(flashMessage, flashText){

  // Hide everything
  this.hideSections();
  
  this.setFlashMessage(flashMessage, flashText, true);
  
  // Show the search form
  this.showSection('searchForm');
  
  // Set the input value
  this.elements.searchInput.val(this.currentLyrics.title);
  
  // Set the focus on the search input field
  this.elements.searchInput.focus();
};

/**
 * Trims the string and removes additional info 
 * like "(video)" and "(original)" at the end of the song title
 */
LyricsPlugin.prototype.filterTitle = function(t){
  return t
    .replace(/\s+/gm, ' ')        // Remove all white spaces with a single space
    .trim()                       // Trim it
    .replace(/( \(.+\))+$/g, '')  // Remove additional info like (video)
    .replace(/( \[.+\])+$/g, '')  // Remove additional info like [video]
    .replace(/-(?=[^\s])/g, '- ') // Change -something to - something, so Google includes it in search
    .trim();                      // Trim it once more.
};

/**
 * This function sets the height of an element
 * but the height will not exceed the maximum value if set so
 */
LyricsPlugin.prototype.animateHeight = function(el, currentHeight){
  if(!this.hasMaxHeight) return;
  
  var height = currentHeight > this.maxHeight ? this.maxHeight : currentHeight;
  
  el.css('height', height + 'px');
};
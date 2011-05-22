function LyricsPlugin(){
  var that = this;
  
  this.currentLyrics = {
    _title: "",
    filter: true
  };

  this.elements = {
    innerWrapper: null, 
    outerWrapper: null, 
    lyricsContent: null,
    removeEl: null,
    searchForm: null,
    searchInput: null,
    loadingMessage: null
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
    this._title = (this.filter ? that.filterTitle(val) : val);
  });
}

/**
 * A check if the plugin is active on the page (search form or lyrics)
 */
LyricsPlugin.prototype.isVisible = false;

/**
 * Hide all sections (loading message, lyrics and search form) from the page
 */
LyricsPlugin.prototype.hideSections = function(){
  this.elements.searchForm.hide();
  this.elements.lyricsContent.hide();
  this.elements.loadingMessage.hide();
};

/**
 * Show a certain section on the page
 * Animates the height of the inner wrapper
 */
LyricsPlugin.prototype.showSection = function(section){
  this.elements[section].show();
  
  // Animate the height of the content div
  this.animateHeight(this.elements.innerWrapper, this.elements[section].height(), 426);
};

/**
 * Hide the plugin from the page
 */
LyricsPlugin.prototype.hide = function(){
  this.hideSections();
  this.elements.outerWrapper.hide();
  this.animateHeight(this.elements.innerWrapper, 0, 426);
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
LyricsPlugin.prototype.onPageActionClicked = function(){
  
  if(this.isVisible){
  
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
 * Set the lyrics for the current song
 * or add a search form if no lyrics were found
 */
LyricsPlugin.prototype.lyricsCallback = function(data) {
  
  if (data.success) {
    
    // We've found the lyrics successfully, so show it
    this.showLyrics(data.lyrics);
  } else {
  
    // No lyrics found
    // Make sure that the next lyrics will be searched manually
    // so no filters are applied
    this.currentLyrics.filter = false;
    this.showSearchForm();
  }
};

/**
 * Get the lyrics for the current song
 */
LyricsPlugin.prototype.queryLyrics = function() {
  
  // Keep a reference for the callback
  var that = this;
  
  // Display loading message
  this.hideSections();
  this.showSection('loadingMessage');

  // Fetch and display the lyrics
  chrome.extension.sendRequest({
    'action': 'getLyrics',
    'title': this.currentLyrics.title
  }, function(request){
    that.lyricsCallback(request);
  });
};

/**
 * Initialize the lyricsplugin on the page
 * This is overriden by a website specific script
 */
LyricsPlugin.prototype.init = function(){};

/**
 * Show lyrics and copyright info on the page
 */
LyricsPlugin.prototype.showLyrics = function(lyrics){
  // Hide all content
  this.hideSections();
  
  // Insert the lyrics
  this.elements.lyricsContent.html([lyrics, '<br/><br/>', chrome.i18n.getMessage("copyrightInfo"), '<br/>', chrome.i18n.getMessage("copyrightCourtesy")].join(''));
  
  this.showSection('lyricsContent');
};

/**
 * Places a search form in the lyrics div
 * to search manually for lyrics
 */
LyricsPlugin.prototype.showSearchForm = function(){

  // Hide everything
  this.hideSections();
  
  // Show the search form
  this.showSection('searchForm');
  
  // Set the focus on the search input field
  this.elements.searchInput.get(0).focus();
};

/**
 * Removes additional info like "(video)" and "(original)" at the end of the song title
 */
LyricsPlugin.prototype.filterTitle = function(t){
  return t.replace(/( \(.+\))+$/, '');
};

/**
 * This function sets the height of an element
 * but the height will not exceed the maximum value
 */
LyricsPlugin.prototype.animateHeight = function(el, currentHeight, max){
  el.css('height', (currentHeight > max ? max : currentHeight) + 'px');
};
LyricsPlugin.prototype.init = function(){
  var that = this;
  
  this.hasMaxHeight = false;
  
  // The div that holds everything
  this.elements.outerWrapper = $('#lfc-outerwrapper');
  
  // The div that holds the actual content (no headers)
  this.elements.innerWrapper = $('#lfc-innerwrapper');
  
  // Loading message wrapper
  this.elements.loadingMessage = $('#lfc-loading');
  
  // The div that holds the lyrics itself
  this.elements.lyricsContent = $('#lfc-lyrics-content');
  
  // The form which you can use to search manually for lyrics
  this.elements.searchForm = $('#lfc-search-form');
  
  // The input field for manual search
  this.elements.searchInput = $('#lfc-search-lyrics');
  
  // There is no remove button
  this.elements.removeEl = $(null);
  
  // Make sure you hide the outer wrapper in first instance
  this.hide();
  
  $('#lfc-title').text(this.currentLyrics.title);
  
  // And also hide the lyrics and form div
  this.elements.searchForm.hide();
  this.elements.lyricsContent.hide();
  
  this.elements.searchForm.bind('submit', function(e) {
    e.preventDefault();
    
    // Set the title and try to get the lyrics again
    that.currentLyrics.title = that.elements.searchInput.val();
    that.queryLyrics();
    
    $('#lfc-title').text(that.currentLyrics.title);
  });
};

LyricsPlugin.prototype.handleTitleFromBackground = function(title){
  this.currentLyrics.title = title;
  document.title = [title, ' \u2014 ', chrome.i18n.getMessage('extName')].join('');
};

var LP = new LyricsPlugin();

chrome.extension.onRequest.addListener(function(request, sender, callback) {
  switch(request.action){
    case 'initNewTab':
      LP.handleTitleFromBackground(request.title);
      LP.init();
      LP.onPageActionClicked();
    break;
    case 'showLyricsOnPage':
      LP.onPageActionClicked();
    break;
  }
});
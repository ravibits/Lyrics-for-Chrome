LyricsPlugin.prototype.init = function(){
  var self = this;
  
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
  this.elements.searchInput = $('#lfc-search-input');
  
  this.elements.flashMessage = $('#lfc-flash-message');
  this.elements.flashDescription = $('#lfc-flash-description');
  
  // There is no remove button
  this.elements.removeEl = $(null);
  
  this.elements.changeLyrics = $('#lfc-changeLyrics');
  
  this.hideSections();
  this.showSection('searchForm');
  this.setFlashMessage('searchTitle', 'searchHelp');
  
  this.elements.changeLyrics.bind('click', function(e){
    e.preventDefault();
    self.showSearchForm();
    self.setFlashMessage('searchTitle', 'searchHelp');
  });
  
  this.elements.searchForm.bind('submit', function(e) {
    e.preventDefault();
    
    // Set the title and try to get the lyrics again
    self.handleNewTitle(self.elements.searchInput.val());
    self.queryLyrics();
  });
};

LyricsPlugin.prototype.handleNewTitle = function(title){
  this.currentLyrics.title = title;
  document.title = [title, ' \u2014 ', chrome.i18n.getMessage('extName')].join('');
  
  $('#lfc-title').text(this.currentLyrics.title);
};

var LP = new LyricsPlugin();
LP.init();

chrome.extension.onRequest.addListener(function(request, sender, callback) {
  switch(request.action){
    case 'initNewTab':
      LP.handleNewTitle(request.title);
      LP.onPageActionClicked(request.onlyRequery);
    break;
    case 'showLyricsOnPage':
      LP.onPageActionClicked(request.onlyRequery);
    break;
  }
});
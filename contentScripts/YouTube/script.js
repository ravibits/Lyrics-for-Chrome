LyricsPlugin.prototype.init = function(){
  var html, $html, that = this;

  // Set the video's title
  this.currentLyrics.title = $('#watch-headline-title').text();
  
  html = [
    '<div id="ytl-outerwrapper" class="watch-module">',
      '<div class="watch-module-body">',
      
        // clicking this image will hide the lyrics from the page
        '<img src="//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif" id="ytl-remove-lyrics" class="master-sprite img-php-close-button" ',
          'alt="', chrome.i18n.getMessage('removeLyrics'), '"',
          'title="', chrome.i18n.getMessage('removeLyrics'), '"',
        '/>',
        
        '<h4 class="first">Lyrics</h4>',
        
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
  this.elements.outerWrapper = $html = $(html);
  
  // The div that holds the actual content (no headers)
  this.elements.innerWrapper = $('#ytl-innerwrapper', $html);
  
  // Loading message wrapper
  this.elements.loadingMessage = $('#ytl-loading-message', $html);
  
  // The div that holds the lyrics itself
  this.elements.lyricsContent = $('#ytl-lyrics', $html);
  
  // The form which you can use to search manually for lyrics
  this.elements.searchForm = $('#ytl-search-form', $html);
  
  // The input field for manual search
  this.elements.searchInput = $('#ytl-search-lyrics', $html);
  
  // Create a remove from page button (Youtube style)
  this.elements.removeEl = $('#ytl-remove-lyrics', $html);
  
  // Make sure you hide the outer wrapper in first instance
  this.hide();
  
  // And also hide the lyrics and form div
  this.elements.searchForm.hide();
  this.elements.lyricsContent.hide();
  
  // Add it to the side bar
  $('#watch-sidebar').prepend($html);
  
  // Set the click event for removing the lyrics from the page
  this.elements.removeEl.bind('click', function(){
    that.hide();
  });
  
  this.elements.searchForm.bind('submit', function(e) {
    e.preventDefault();
    
    // Set the title and try to get the lyrics again
    that.currentLyrics.title = that.elements.searchInput.val();
    that.queryLyrics();
  });
};
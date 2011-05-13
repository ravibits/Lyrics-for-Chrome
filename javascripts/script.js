var YouTubeLyrics = (function(){
  var currentLyrics = {
    _title: "",
    filter: true
  };

  var elements = {
    lyricsWrapper: null, 
    lyricsContent: null
  };
  
  /**
   * Removes additional info like "(video)" and "(original)" at the end of the YouTube title
   */
  function filterTitle(t){
    return t.replace(/( \(.+\))+$/, '');
  }
  
  /**
   * A getter for the title
   */
  currentLyrics.__defineGetter__('title', function(){
    return this._title;
  });
  
  /**
   * A setter for the title, which automatically filters the title if set so
   */
  currentLyrics.__defineSetter__('title', function(val){
    this._title = (this.filter ? filterTitle(val) : val);
  });
  
  /**
   * This function sets the height of an element
   * but the height will not exceed the maximum value
   */
  function animateHeight(el, max){
    var height = el.attr('scrollHeight');
    
    if(height > max){
      el.css({
        'overflow-y': 'scroll',
        'height': max + 'px'
      });
    } else {
      el.css({
        'overflow-y': 'hidden',
        'height': height + 'px'
      });
    }
  }
  
  /**
   * Show lyrics and copyright info on the page
   */
  function showLyrics(lyrics){
    // Show the lyrics
    elements.lyricsContent.html([lyrics, '<br/><br/>', chrome.i18n.getMessage("copyrightInfo"), '<br/>', chrome.i18n.getMessage("copyrightCourtesy")].join(''));
    animateHeight(elements.lyricsContent, 426);
  }
  
  /**
   * Places a search form in the lyrics div
   * to search manually for lyrics
   */
  function showSearchForm(){
    var requeryForm, requeryInput;
    
    // Creates a search field for searching manually
    requeryInput = $('<input autofocus/>').attr({
      'type': 'text',
      'id': 'ytl-search-lyrics',
      'name': 'ytl-search-lyrics',
      'value': currentLyrics.title
    });
    
    // Creates a form for searching manually
    requeryForm = 
    $('<form/>')
    
      // Provide "not found" information and help
      .html(
        [
          chrome.i18n.getMessage('notFound'), 
          '<br/><br/>', 
          chrome.i18n.getMessage('notFoundHelp')
        ].join('')
      )
      
      // Add the search field
      .append(requeryInput)
      
      // Add a submit event handler
      .bind('submit', function(e) {
        e.preventDefault();
        
        // Set the title and try to get the lyrics again
        currentLyrics.title = requeryInput.val();
        queryLyrics();
      });
    
    // Replace the content of the lyrics <div> with the form
    elements.lyricsContent.html('').prepend(requeryForm);
    
    // Animate the height of the lyrics div
    animateHeight(elements.lyricsContent, 426);
  }
  
  /**
   * Set the lyrics for the current song
   * or add a search form if no lyrics were found
   */
  function lyricsCallback(data) {

    if (data.success) {
      
      // We've found the lyrics successfully, so show it
      showLyrics(data.lyrics);
    } else {
    
      // No lyrics found
      // Make sure that the next lyrics will be searched manually
      // so no filters are applied
      currentLyrics.filter = false;
      showSearchForm();
    }
  }
  
  /**
   * Get the lyrics for the current song
   */
  function queryLyrics() {
    //Display loading message
    elements.lyricsContent.html(chrome.i18n.getMessage("loadingMessage"));

    //Fetch and display the lyrics
    chrome.extension.sendRequest({
      'action': 'getLyrics',
      'title': currentLyrics.title
    }, lyricsCallback);
  }
  
  /**
   * Initialize the lyricsplugin on the YouTube page
   */
  function init(){
    var removeImage;
    
    // Try to get the lyrics wrapper
    elements.lyricsWrapper = $('#ytl-sb-section');
    
    // Remove the <div> if YouTube Lyrics had already been added to the page
    if(elements.lyricsWrapper.length === 1){
      elements.lyricsWrapper.remove();
      return;
    }
  
    // Set the video's title
    currentLyrics.title = $('#watch-headline-title').text();
    
    // Create a remove from page button (Youtube style)
    removeImage = $('<img/>').attr({
      'src': '//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif',
      'id': 'ytl-remove-lyrics',
      'class': 'master-sprite img-php-close-button',
      'alt': chrome.i18n.getMessage('removeLyrics'),
      'title': chrome.i18n.getMessage('removeLyrics')
    });
    
    // Create a div that holds the lyrics
    elements.lyricsWrapper = 
      $('<div id="ytl-sb-section" class="watch-module"/>')
        .append(
          $('<div class="watch-module-body"/>')
            .html(
              [
                '<h4 class="first">Lyrics</h4>',
                '<div id="ytl-lyrics" class="ytl-scrollbar-enabled">',
                  chrome.i18n.getMessage('loadingMessage'),
                '</div>'
              ].join('')
            )
            .prepend(removeImage)
        );
    
    // Add it to the side bar
    $('#watch-sidebar').prepend(elements.lyricsWrapper);
    
    // Set the click event for removing the lyrics from the page
    removeImage.bind('click', function(){
      elements.lyricsWrapper.remove();
    });
    
    // Get the lyrics content <div>
    elements.lyricsContent = $('#ytl-lyrics');
    
    // Set the height of the div
    animateHeight(elements.lyricsContent, 426);

    // Fetch and display the lyrics
    queryLyrics();
  }
  
  return {
    init: init
  };
  
})();

YouTubeLyrics.init();
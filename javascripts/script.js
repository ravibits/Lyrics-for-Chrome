var YoutubeLyrics = (function(){
  var title, lyricsWrapper, lyricsContent;
  
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
    lyricsContent.html([lyrics, '<br/><br/>', chrome.i18n.getMessage("copyrightInfo"), '<br/>', chrome.i18n.getMessage("copyrightCourtesy")].join(''));
    animateHeight(lyricsContent, 426);
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
      'id': 'ytl_search_lyrics',
      'name': 'ytl_search_lyrics',
      'value': title.replace('"', '')
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
        title = requeryInput.val();
        queryLyrics(true);
      });
    
    // Replace the content of the lyrics <div> with the form
    lyricsContent.html('').prepend(requeryForm);
    
    // Animate the height of the lyrics div
    animateHeight(lyricsContent, 426);
  }
  
  /**
   * Set the lyrics for the current song
   * or add a search form if no lyrics were found
   */
  function lyricsCallback(data) {

    if (data.success) {
      showLyrics(data.lyrics);
    } else {
      showSearchForm();
    }
  }
  
  /**
   * Get the lyrics for the current song
   */
  function queryLyrics(requeue) {
    //Display loading message
    lyricsContent.html(chrome.i18n.getMessage("loadingMessage"));

    //Fetch and display the lyrics
    chrome.extension.sendRequest({
      'action': 'getLyrics',
      'title': title,
      'requeue': requeue
    }, lyricsCallback);
  }
  
  /**
   * Initialize the lyricsplugin on the Youtube page
   */
  function init(){
    var removeImage;
    
    // Try to get the lyrics wrapper
    lyricsWrapper = $('#ytl_sb_section');
    
    // Remove the <div> if Youtube Lyrics had already been added to the page
    if(lyricsWrapper.length === 1){
      lyricsWrapper.remove();
      return;
    }
  
    // Get the video's title
    title = $('#watch-headline-title').text();
    
    // Create a remove from page button (Youtube style)
    removeImage = $('<img/>').attr({
      'src': '//s.ytimg.com/yt/img/pixel-vfl3z5WfW.gif',
      'id': 'ytl_remove_lyrics',
      'class': 'master-sprite img-php-close-button',
      'alt': chrome.i18n.getMessage('removeLyrics'),
      'title': chrome.i18n.getMessage('removeLyrics')
    });
    
    // Create a div that holds the lyrics
    lyricsWrapper = 
      $('<div id="ytl_sb_section" class="watch-module"/>')
        .append(
          $('<div class="watch-module-body"/>')
            .html(
              [
                '<h4 class="first">Lyrics</h4>',
                '<div id="ytl_lyrics" class="ytl_scrollbar_enabled">',
                  chrome.i18n.getMessage('loadingMessage'),
                '</div>'
              ].join('')
            )
            .prepend(removeImage)
        );
    
    // Add it to the side bar
    $('#watch-sidebar').prepend(lyricsWrapper);
    
    // Set the click event for removing the lyrics from the page
    removeImage.bind('click', function(){
      lyricsWrapper.remove();
    });
    
    // Get the lyrics content <div>
    lyricsContent = $('#ytl_lyrics');
    
    // Set the height of the div
    animateHeight(lyricsContent, 426);

    // Fetch and display the lyrics
    queryLyrics(false);
  }
  
  return {
    init: init
  };
  
})();

YoutubeLyrics.init();
/* -----------------------
01 – Auto-Generate Nav
----------------------- */
Webflow.push(function() {
  setTimeout(function() {
    var $subnavRow = $('[class*="fg-nav_row"][class*="is-subnav"]');

    if ($subnavRow.length) {
      /* -----------------------
      01.1 – Create Subnav
      ----------------------- */
      console.log("Subnav row found, generating subnav...");
      console.log("Initial subnav content:", $subnavRow.html());
      
      // Store the first item before removing others
      var $firstItem = $subnavRow.children().first();
      console.log("First item saved:", $firstItem.prop('outerHTML'));
      
      // Remove all OTHER nav items except the first one
      $subnavRow.children().not($firstItem).remove();
      
      var navItems = [];

      $('[class*="fg-title_heading"]').each(function() {
        var $heading = $(this);
        var headingText = $heading.text().trim();
        var sectionId = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        var $section = $heading.closest('[class*="section"]');
        if ($section.length) {
          $section.attr('id', sectionId);
        } else {
          console.warn("No section found for:", headingText);
          return;
        }

        if ($heading.attr('fg-show-menu')?.toLowerCase() !== 'false') {
          var customText = $heading.attr('fg-nav-title') || headingText;
          
          var $navItem = $('<a>', {
            class: 'fg-nav_item is-subnav',
            href: '#' + sectionId
          }).text(customText);

          navItems.push($navItem);
          console.log("Created nav item:", $navItem.prop('outerHTML'));
        }
      });

      // Insert after the first item (which we kept)
      console.log("Inserting after first item");
      $firstItem.after(navItems);
      
      console.log("Subnav generated successfully.");
    } else {
      /* -----------------------
      01.2 – Create Nav (onepage)
      ----------------------- */
      console.log("Subnav row not found, generating primary nav...");

      var $primaryNavRow = $('[class*="fg-nav_row"][class*="is-primary"]');
      if (!$primaryNavRow.length) return console.warn("Primary nav row not found.");

      // Only remove .fg-nav_item elements that are direct children
      $primaryNavRow.children('[class*="fg-nav_item"]').remove();

      var navIndex = 1;
      var $firstChild = $primaryNavRow.children().first();
      var navItems = [];

      $('[class*="fg-title_heading"]').each(function() {
        var $heading = $(this);
        var headingText = $heading.text().trim();
        var sectionId = headingText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        
        var $section = $heading.closest('[class*="section"]');
        if ($section.length) {
          $section.attr('id', sectionId);
        } else {
          return console.warn("No section found for:", headingText);
        }

        if ($heading.attr('fg-show-menu')?.toLowerCase() !== 'false') {
          var customText = $heading.attr('fg-nav-title') || headingText;

          // Create the primary nav item with exact structure
          var $navItem = $('<a>', {
            class: 'fg-nav_item w-inline-block',
            href: '#' + sectionId
          });

          var $navBrackets = $('<div>', { class: 'fg-nav_item-brackets' });
          var $bracketOpen = $('<div>', { class: 'fg-nav_item-bracket', text: '[' });
          var $navNumber = $('<div>', { class: 'fg-nav_item-number', text: navIndex++ });
          var $bracketClose = $('<div>', { class: 'fg-nav_item-bracket', text: ']' });

          var $navTitle = $('<div>', {
            class: 'fg-nav_item-title',
            text: customText
          });

          // Assemble elements
          $navBrackets.append($bracketOpen, $navNumber, $bracketClose);
          $navItem.append($navBrackets, $navTitle);
          navItems.push($navItem);
        }
      });

      $firstChild.after(navItems);

      console.log("Primary nav generated successfully.");
    }
  }, 200);
});

// Smooth scroll for anchor links
$('a[href^="#"]').on('click', function (e) {
    e.preventDefault();

    var target = $(this.getAttribute('href'));

    if (target.length) {
        $('html, body').animate({
            scrollTop: target.offset().top
        }, 500);
    }
});

/* -----------------------
02 – Auto-Generate Pagination
----------------------- */
$(document).ready(function() {
    // Get all visible menu items (these are <a> tags)
    const menuItems = $('[class*="fg-nav_row"][class*="is-primary"] [class*="fg-nav_item"]:visible');
    
    // Find the index of current page in menu items
    let currentIndex = -1;
    menuItems.each(function(index) {
        if ($(this).hasClass('w--current')) {
            currentIndex = index;
            return false;
        }
    });
    
    // If we couldn't find the current page, exit
    if (currentIndex === -1) return;
    
    // Handle previous page elements
    const prevLink = '[fg-pagination="prev-link"]';
    const prevChapter = '[fg-pagination="prev-chapter"]';
    const prevNumber = '[fg-pagination="prev-number"]';
    
    // Handle next page elements
    const nextLink = '[fg-pagination="next-link"]';
    const nextChapter = '[fg-pagination="next-chapter"]';
    const nextNumber = '[fg-pagination="next-number"]';
    
    // Remove any existing click handlers
    $(prevLink).off('click');
    $(nextLink).off('click');
    
    // Handle previous page
    if (currentIndex > 0) {
        const prevItem = menuItems.eq(currentIndex - 1);
        const prevUrl = prevItem.attr('href');
        const prevTitle = prevItem.find('[class*="fg-nav_item-title"]').text().trim();
        const prevNum = prevItem.find('[class*="fg-nav_item-number"]').text().trim();
        
        if (prevUrl) {
            $(prevLink).attr('href', prevUrl);
            $(prevChapter).text(prevTitle);
            $(prevNumber).text(prevNum);
            $(prevLink).css('display', 'flex');
            
            // Add click handler that forces navigation
            $(prevLink).on('click', function(e) {
                e.preventDefault();
                window.location.href = prevUrl;
            });
        } else {
            $(prevLink).css('display', 'none');
        }
    } else {
        $(prevLink).css('display', 'none');
    }
    
    // Handle next page
    if (currentIndex < menuItems.length - 1) {
        const nextItem = menuItems.eq(currentIndex + 1);
        const nextUrl = nextItem.attr('href');
        const nextTitle = nextItem.find('[class*="fg-nav_item-title"]').text().trim();
        const nextNum = nextItem.find('[class*="fg-nav_item-number"]').text().trim();
        
        if (nextUrl) {
            $(nextLink).attr('href', nextUrl);
            $(nextChapter).text(nextTitle);
            $(nextNumber).text(nextNum);
            $(nextLink).css('display', 'flex');
            
            // Add click handler that forces navigation
            $(nextLink).on('click', function(e) {
                e.preventDefault();
                window.location.href = nextUrl;
            });
        } else {
            $(nextLink).css('display', 'none');
        }
    } else {
        $(nextLink).css('display', 'none');
    }
});

/* -----------------------
03 – Nav Keyboard Bindings
----------------------- */
$(document).ready(function() {
    // Create a mapping of key shortcuts to their corresponding links
    const keyMap = new Map();

    // Function to build keymap
    function buildKeyMap() {
        // Clear the existing map
        keyMap.clear();
        
        // Build the key mapping from the nav items
        $('[class*="fg-nav_row"][class*="is-primary"] > a[class*="fg-nav_item"]').not('[class*="fg-nav_cta-wrapper"] a[class*="fg-nav_item"]').each(function() {
            const $link = $(this);
            const keyValue = $link.find('[class*="fg-nav_item-number"]').text().toLowerCase();
            
            if (keyValue) {
                keyMap.set(keyValue, $link);
            }
        });
    }

    // Initially build the key map
    buildKeyMap();

    // Handle keyboard events
    $(document).on('keypress', function(e) {
        // Convert keyCode to character
        const key = String.fromCharCode(e.which).toLowerCase();
        
        // Special case for 'a' key - navigate to CTA wrapper item URL
        if (key === 'a') {
            const $ctaLink = $('[class*="fg-nav_cta-wrapper"] a[class*="fg-nav_item"]').first();
            const ctaUrl = $ctaLink.attr('href');
            if (ctaUrl) {
                window.location.href = ctaUrl;
            }
            return;
        }
        
        // Check if we have a link mapped to this key
        const $targetLink = keyMap.get(key);
        if ($targetLink) {
            const url = $targetLink.attr('href');
            if (url) {
                window.location.href = url;
            }
        }
    });

    // Re-run the buildKeyMap function after a brief delay to ensure the nav items are fully loaded
    setTimeout(function() {
        buildKeyMap(); // Rebuild the key map after 250ms
    }, 250);
});

/* -----------------------
04 – Tablet/Mobile Menu
----------------------- */
$(document).on('click', '[class*="fg-nav_item"], [class*="fg-nav_overlay"]', function () {
    $('[class*="fg-nav_button"]').trigger('click');
});

/* -----------------------
05 – Copy HEX Color
----------------------- */
$('[class*="fg-color_wrapper"]').on('click', function() {
    const hexValue = $(this).find('.is-hex').text();
    navigator.clipboard.writeText(hexValue);
});

/* -----------------------
06 – Font Section: Typewriter
----------------------- */
$(document).ready(function() {
  // Function to check if device width is 991px or larger
  function isLargeDevice() {
    return window.matchMedia('(min-width: 991px)').matches;
  }

  // Function to create typewriter effect
  function typeWriter($element, text, callback) {
    // If device is too small, just show the text without animation
    if (!isLargeDevice()) {
      $element.text(text);
      if (callback) callback();
      return;
    }

    // Split text into words
    const words = text.split(' ');
    
    // Create spans for each character in each word, keeping words together
    const html = words.map(word => {
      // Wrap all characters of a word in a word-container that prevents breaks
      return `<span class="word" style="white-space: nowrap; display: inline-block;">
                ${word.split('').map(char =>
                  `<span style="opacity: 0; display: inline-block;">${char}</span>`
                ).join('')}
              </span><span style="opacity: 0; display: inline-block;">&nbsp;</span>`;
    }).join('');
    
    $element.html(html);
    
    // Animate each character's opacity
    const $chars = $element.find('span:not(.word)'); // Don't select the word containers
    let i = 0;
    
    function revealNext() {
      if (i < $chars.length) {
        $chars.eq(i).css({
          'opacity': '1',
          'transition': 'opacity 50ms'
        });
        i++;
        setTimeout(revealNext, 50);
      } else if (callback) {
        callback();
      }
    }
    
    revealNext();
  }

  // Store original text for both elements
  const textContent = $('[class*="fg-font-preview_text"]').text();
  const nameContent = $('[class*="fg-font-preview_name"]').text();

  // Only set up hover events if device is large enough
  if (isLargeDevice()) {
    // Hover in
    $('[class*="fg-font-preview_component"]').on('mouseenter', function() {
      const $nameWrapper = $(this).find('[class*="fg-font-preview_name-wrapper"]');
      const $text = $(this).find('[class*="fg-font-preview_text"]');
      
      // Hide name wrapper immediately
      $nameWrapper.hide();
      
      // Show and animate text with typewriter effect
      $text.show();
      typeWriter($text, textContent);
    });

    // Hover out
    $('[class*="fg-font-preview_component"]').on('mouseleave', function() {
      const $sampleWrapper = $(this).find('[class*="fg-font-preview_sample-wrapper"]');
      const $name = $(this).find('[class*="fg-font-preview_name"]');
      const $nameWrapper = $(this).find('[class*="fg-font-preview_name-wrapper"]');
      
      // Show sample wrapper and name wrapper
      $sampleWrapper.show();
      $nameWrapper.show();
      
      // Clear and animate name
      $name.empty().show();
      typeWriter($name, nameContent);
    });
  }

  // Handle resize events
  let resizeTimer;
  $(window).on('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      // Remove event handlers if device becomes too small
      if (!isLargeDevice()) {
        $('[class*="fg-font-preview_component"]').off('mouseenter mouseleave');
      }
    }, 250);
  });
});

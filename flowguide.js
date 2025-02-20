/* -----------------------
00 – Class Prefix Utilities
----------------------- */
function getClassPrefix(baseClass) {
  const element = $(`[class*="${baseClass}"]`).first();
  if (!element.length) return '';
  
  const classes = element[0].className.split(' ');
  const matchingClass = classes.find(cls => cls.includes(baseClass));
  if (!matchingClass) return '';
  
  const parts = matchingClass.split('--');
  return parts.length > 1 ? parts[0] + '--' : '';
}

function getPrefixedClass(baseClass) {
  const prefix = getClassPrefix('fg-nav_fixed'); // Use a reliable base class
  return prefix ? `${prefix}${baseClass}` : baseClass;
}

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
      
      var $firstItem = $subnavRow.children().first();
      console.log("First item saved:", $firstItem.prop('outerHTML'));
      
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
            class: `${getPrefixedClass('fg-nav_item')} is-subnav`,
            href: '#' + sectionId
          }).text(customText);

          navItems.push($navItem);
          console.log("Created nav item:", $navItem.prop('outerHTML'));
        }
      });

      $firstItem.after(navItems);
      
      console.log("Subnav generated successfully.");
    } else {
      /* -----------------------
      01.2 – Create Nav (onepage)
      ----------------------- */
      console.log("Subnav row not found, generating primary nav...");

      var $primaryNavRow = $('[class*="fg-nav_row"][class*="is-primary"]');
      if (!$primaryNavRow.length) return console.warn("Primary nav row not found.");

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

          var $navItem = $('<a>', {
            class: `${getPrefixedClass('fg-nav_item')} w-inline-block`,
            href: '#' + sectionId
          });

          var $navBrackets = $('<div>', { 
            class: getPrefixedClass('fg-nav_item-brackets')
          });
          
          var $bracketOpen = $('<div>', { 
            class: getPrefixedClass('fg-nav_item-bracket'),
            text: '['
          });
          
          var $navNumber = $('<div>', { 
            class: getPrefixedClass('fg-nav_item-number'),
            text: navIndex++
          });
          
          var $bracketClose = $('<div>', { 
            class: getPrefixedClass('fg-nav_item-bracket'),
            text: ']'
          });

          var $navTitle = $('<div>', {
            class: getPrefixedClass('fg-nav_item-title'),
            text: customText
          });

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
    const hexValue = $(this).find('[class*="is-hex"]').text();
    navigator.clipboard.writeText(hexValue);
});

/* -----------------------
06 – Font Section: Typewriter
----------------------- */
$(document).ready(function() {
    function isLargeDevice() {
        return window.matchMedia('(min-width: 991px)').matches;
    }

    function typeWriter($element, text, callback) {
        if (!isLargeDevice()) {
            $element.text(text);
            if (callback) callback();
            return;
        }

        // Find direct parent with name-wrapper class
        const $wrapper = $element.closest('[class*="fg-font-preview_name-wrapper"]');
        const $target = $wrapper.length ? $element : $element;

        const words = text.split(' ');
        const html = words.map(word => {
            return `<span class="${getPrefixedClass('word')}" style="white-space: nowrap; display: inline-block;">
                        ${word.split('').map(char =>
                            `<span style="opacity: 0; display: inline-block;">${char}</span>`
                        ).join('')}
                    </span><span style="opacity: 0; display: inline-block;">&nbsp;</span>`;
        }).join('');
        
        // Replace content at the correct level
        $target.html(html);
        
        const $chars = $target.find('span:not([class*="word"])');
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

    // Cache the original content and structure
    const $components = $('[class*="fg-font-preview_component"]');
    $components.each(function() {
        const $this = $(this);
        const $text = $this.find('[class*="fg-font-preview_text"]');
        const $name = $this.find('[class*="fg-font-preview_name"]');
        const $nameWrapper = $this.find('[class*="fg-font-preview_name-wrapper"]');
        
        // Store original HTML structure
        $text.data('original-html', $text.html());
        $name.data('original-html', $name.html());
        $nameWrapper.data('original-html', $nameWrapper.html());
    });

    if (isLargeDevice()) {
        $components.on('mouseenter', function() {
            const $nameWrapper = $(this).find('[class*="fg-font-preview_name-wrapper"]');
            const $text = $(this).find('[class*="fg-font-preview_text"]');
            
            $nameWrapper.hide();
            $text.show();
            typeWriter($text, $text.data('original-html'));
        });

        $components.on('mouseleave', function() {
            const $this = $(this);
            const $sampleWrapper = $this.find('[class*="fg-font-preview_sample-wrapper"]');
            const $nameWrapper = $this.find('[class*="fg-font-preview_name-wrapper"]');
            const $name = $this.find('[class*="fg-font-preview_name"]');
            const $text = $this.find('[class*="fg-font-preview_text"]');
            
            // Reset text to original state
            $text.html($text.data('original-html'));
            
            // Reset name wrapper to original state before starting new animation
            $nameWrapper.html($nameWrapper.data('original-html'));
            
            $sampleWrapper.show();
            $nameWrapper.show();
            
            // Find the name element again after resetting HTML
            const $newName = $nameWrapper.find('[class*="fg-font-preview_name"]');
            typeWriter($newName, $newName.text());
        });
    }

    let resizeTimer;
    $(window).on('resize', function() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(function() {
            if (!isLargeDevice()) {
                $components.off('mouseenter mouseleave');
                
                // Reset all elements to their original structure
                $components.each(function() {
                    const $this = $(this);
                    const $text = $this.find('[class*="fg-font-preview_text"]');
                    const $nameWrapper = $this.find('[class*="fg-font-preview_name-wrapper"]');
                    
                    $text.html($text.data('original-html'));
                    $nameWrapper.html($nameWrapper.data('original-html'));
                });
                
                $('[class*="fg-font-preview_name-wrapper"]').show();
            }
        }, 250);
    });
});

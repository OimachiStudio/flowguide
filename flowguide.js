/* -----------------------
00 – Class Prefix Utilities
----------------------- */
function getClassPrefix(baseClass) {
  const element = $(`[class*="${baseClass}"]`).first();
  if (!element.length) return "";

  const classes = element[0].className.split(" ");
  const matchingClass = classes.find((cls) => cls.includes(baseClass));
  if (!matchingClass) return "";

  const parts = matchingClass.split("--");
  return parts.length > 1 ? parts[0] + "--" : "";
}

function getPrefixedClass(baseClass) {
  const prefix = getClassPrefix("fg-nav_fixed");
  return prefix ? `${prefix}${baseClass}` : baseClass;
}

/* -----------------------
  01 – Auto-Generate Nav
  ----------------------- */
Webflow.push(function () {
  console.log("Starting navigation generation...");

  // Add stagger animation styles
  var staggerStyle = document.createElement("style");
  staggerStyle.textContent = `
      .fg-nav_item.is-stagger {
        opacity: 0;
        transition: opacity 0.1s ease-in-out;
      }
      .fg-nav_item.is-stagger.is-visible {
        opacity: 1;
      }
    `;
  document.head.appendChild(staggerStyle);

  setTimeout(function () {
    var $subnavRow = $('[class*="fg-nav_row"][class*="is-subnav"]');

    if ($subnavRow.length) {
      /* -----------------------
            01.1 – Create Subnav
            ----------------------- */
      console.log("Creating subnav...");
      var $firstItem = $subnavRow.children().first();
      $subnavRow.children().not($firstItem).remove();

      var navItems = [];

      $('[class*="fg-title_heading"]').each(function () {
        var $heading = $(this);
        var headingText = $heading.text().trim();
        var sectionId = headingText
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        var $section = $heading.closest('[class*="section"]');
        if ($section.length) {
          $section.attr("id", sectionId);
        } else {
          return;
        }

        if ($heading.attr("fg-show-menu")?.toLowerCase() !== "false") {
          var customText = $heading.attr("fg-nav-title") || headingText;

          var $navItem = $("<a>", {
            class: `${getPrefixedClass("fg-nav_item")} is-subnav is-stagger`,
            href: "#" + sectionId,
          }).text(customText);

          navItems.push($navItem);
        }
      });

      $firstItem.after(navItems);

      // Stagger animation for subnav
      navItems.forEach((item, index) => {
        setTimeout(() => {
          $(item).addClass("is-visible");
        }, 50 * (index + 1));
      });

      console.log("Subnav creation complete!");
    } else {
      /* -----------------------
          01.2 – Create Nav (onepage)
          ----------------------- */
      console.log("Subnav row not found, generating primary nav...");

      var $primaryNavRow = $('[class*="fg-nav_row"][class*="is-primary"]');
      if (!$primaryNavRow.length)
        return console.warn("Primary nav row not found.");

      $primaryNavRow.children('[class*="fg-nav_item"]').remove();

      var navIndex = 1;
      var $firstChild = $primaryNavRow.children().first();
      var navItems = [];

      $('[class*="fg-title_heading"]').each(function () {
        var $heading = $(this);
        var headingText = $heading.text().trim();
        var sectionId = headingText
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        var $section = $heading.closest('[class*="section"]');
        if ($section.length) {
          $section.attr("id", sectionId);
        } else {
          return console.warn("No section found for:", headingText);
        }

        if ($heading.attr("fg-show-menu")?.toLowerCase() !== "false") {
          var customText = $heading.attr("fg-nav-title") || headingText;

          var $navItem = $("<a>", {
            class: `${getPrefixedClass(
              "fg-nav_item"
            )} w-inline-block is-stagger`,
            href: "#" + sectionId,
          });

          var $navBrackets = $("<div>", {
            class: getPrefixedClass("fg-nav_item-brackets"),
          });

          var $bracketOpen = $("<div>", {
            class: getPrefixedClass("fg-nav_item-bracket"),
            text: "[",
          });

          var $navNumber = $("<div>", {
            class: getPrefixedClass("fg-nav_item-number"),
            text: navIndex++,
          });

          var $bracketClose = $("<div>", {
            class: getPrefixedClass("fg-nav_item-bracket"),
            text: "]",
          });

          var $navTitle = $("<div>", {
            class: getPrefixedClass("fg-nav_item-title"),
            text: customText,
          });

          $navBrackets.append($bracketOpen, $navNumber, $bracketClose);
          $navItem.append($navBrackets, $navTitle);
          navItems.push($navItem);
        }
      });

      $firstChild.after(navItems);

      // Stagger animation for primary nav
      navItems.forEach((item, index) => {
        setTimeout(() => {
          $(item).addClass("is-visible");
        }, 50 * (index + 1));
      });

      console.log("Primary nav generated successfully.");
    }

    /* -----------------------
      02 – Set up Pagination
      ----------------------- */
    console.log("Setting up pagination...");

    // Get all main nav items with valid links
    var $regularNavItems = $(
      '.fg-nav_row.is-primary > [class^="fg-nav_item"] > a.fg-nav_item'
    ).filter(function () {
      return $(this).attr("href") !== "#";
    });

    // Get CTA nav item (usually Assets)
    var $ctaNavItem = $(
      ".fg-nav_row.is-primary .fg-nav_cta-wrapper a.fg-nav_item"
    ).not(".fg-nav_web");

    // Combine in order
    var $allNavItems = $().add($regularNavItems).add($ctaNavItem);

    // Log all found items
    console.log("Navigation items found:", $allNavItems.length);
    $allNavItems.each(function (i) {
      console.log("Item", i + ":", {
        title: $(this).find(".fg-nav_item-title").text(),
        number: $(this).find(".fg-nav_item-number").text(),
        href: $(this).attr("href"),
        hasCurrent: $(this).hasClass("w--current"),
      });
    });

    // Find current page index
    var currentIndex = -1;
    $allNavItems.each(function (i) {
      if ($(this).hasClass("w--current")) {
        currentIndex = i;
        console.log(
          "Found current page at index:",
          i,
          "out of",
          $allNavItems.length,
          "items"
        );
        return false;
      }
    });

    var currentPage = false;
    var prevPage = false;
    var nextPage = false;

    if (currentIndex !== -1) {
      // Set current page info
      var $currentItem = $allNavItems.eq(currentIndex);
      currentPage = {
        element: $currentItem,
        href: $currentItem.attr("href"),
        title: $currentItem.find(".fg-nav_item-title").text(),
      };

      // Set previous page info if not first page
      if (currentIndex > 0) {
        var $prevItem = $allNavItems.eq(currentIndex - 1);
        prevPage = {
          element: $prevItem,
          href: $prevItem.attr("href"),
          title: $prevItem.find(".fg-nav_item-title").text(),
        };
      }

      // Set next page info if not last page
      if (currentIndex < $allNavItems.length - 1) {
        var $nextItem = $allNavItems.eq(currentIndex + 1);
        nextPage = {
          element: $nextItem,
          href: $nextItem.attr("href"),
          title: $nextItem.find(".fg-nav_item-title").text(),
        };
      }
    }

    // Store pagination state
    window.fgPagination = {
      current: currentPage,
      prev: prevPage,
      next: nextPage,
      isReady: true,
    };

    console.log("=== Navigation State ===");
    console.log("Current page:", currentPage ? currentPage.title : "None");
    console.log("Previous page:", prevPage ? prevPage.title : "None");
    console.log("Next page:", nextPage ? nextPage.title : "None");
    console.log("=====================");
  }, 200);
});

/* -----------------------
    02 – Configure Pagination
    ----------------------- */
Webflow.push(function () {
  function configurePagination() {
    // Wait for navigation to be ready
    if (!window.fgPagination || !window.fgPagination.isReady) {
      setTimeout(configurePagination, 100);
      return;
    }

    // Get pagination elements
    const $paginationComponent = $(".fg-pagination_component");
    const $prevLink = $('[fg-pagination="prev-link"]');
    const $prevChapter = $('[fg-pagination="prev-chapter"]');
    const $prevNumber = $('[fg-pagination="prev-number"]');
    const $nextLink = $('[fg-pagination="next-link"]');
    const $nextChapter = $('[fg-pagination="next-chapter"]');
    const $nextNumber = $('[fg-pagination="next-number"]');

    // Validate elements exist
    if (
      !$paginationComponent.length ||
      !$prevLink.length ||
      !$prevChapter.length ||
      !$prevNumber.length ||
      !$nextLink.length ||
      !$nextChapter.length ||
      !$nextNumber.length
    ) {
      console.log("Missing required pagination elements");
      return;
    }

    // Configure previous page
    if (window.fgPagination.prev) {
      $prevLink.attr("href", window.fgPagination.prev.href).show();
      $prevChapter.text(window.fgPagination.prev.title);
      $prevNumber.text(
        window.fgPagination.prev.element.find(".fg-nav_item-number").text()
      );
    } else {
      $prevLink.hide();
      $prevChapter.text("");
      $prevNumber.text("");
    }

    // Configure next page
    if (window.fgPagination.next) {
      $nextLink.attr("href", window.fgPagination.next.href).show();
      $nextChapter.text(window.fgPagination.next.title);
      $nextNumber.text(
        window.fgPagination.next.element.find(".fg-nav_item-number").text()
      );
    } else {
      $nextLink.hide();
      $nextChapter.text("");
      $nextNumber.text("");
    }

    // Show component if we have navigation
    $paginationComponent.toggle(
      !!window.fgPagination.prev || !!window.fgPagination.next
    );
  }

  // Start configuration
  configurePagination();
});

/* -----------------------
03 – Keyboard Navigation
----------------------- */
Webflow.push(function () {
  // Create a mapping of key shortcuts to their corresponding links
  const keyMap = new Map();

  // Function to build keymap
  function buildKeyMap() {
    // Clear the existing map
    keyMap.clear();

    // Build the key mapping from the nav items
    $('.fg-nav_row.is-primary > [class^="fg-nav_item"] > a.fg-nav_item')
      .not(".fg-nav_cta-wrapper a.fg-nav_item")
      .each(function () {
        const $link = $(this);
        const keyValue = $link.find(".fg-nav_item-number").text().toLowerCase();

        if (keyValue) {
          console.log(
            "Adding keyboard shortcut:",
            keyValue,
            "for link:",
            $link.find(".fg-nav_item-title").text()
          );
          keyMap.set(keyValue, $link);
        }
      });

    // Add special case for Assets link
    const $ctaLink = $(".fg-nav_cta-wrapper a.fg-nav_item")
      .not(".fg-nav_web")
      .first();
    if ($ctaLink.length) {
      console.log(
        "Adding keyboard shortcut: a for link:",
        $ctaLink.find(".fg-nav_item-title").text()
      );
      keyMap.set("a", $ctaLink);
    }
  }

  // Function to initialize keyboard navigation
  function initKeyboardNav() {
    // Check if navigation is ready
    if (!window.fgPagination || !window.fgPagination.isReady) {
      console.log("Navigation not ready, waiting...");
      setTimeout(initKeyboardNav, 100);
      return;
    }

    console.log("Navigation ready, setting up keyboard shortcuts...");

    // Build the initial key map
    buildKeyMap();

    // Handle keyboard events
    $(document).on("keypress.fgNav", function (e) {
      // Ignore key events if target is an input or textarea
      if ($(e.target).is("input, textarea")) {
        return;
      }

      // Convert keyCode to character
      const key = String.fromCharCode(e.which).toLowerCase();

      // Check if we have a link mapped to this key
      const $targetLink = keyMap.get(key);
      if ($targetLink) {
        console.log(
          "Keyboard navigation:",
          key,
          "→",
          $targetLink.find(".fg-nav_item-title").text()
        );
        const url = $targetLink.attr("href");
        if (url) {
          window.location.href = url;
        }
      }
    });

    // Log active shortcuts
    console.log(
      "Active keyboard shortcuts:",
      Array.from(keyMap.keys()).join(", ")
    );
  }

  // Clean up any existing handlers before starting
  $(document).off("keypress.fgNav");

  // Start initialization
  initKeyboardNav();
});

/* -----------------------
04 – Tablet/Mobile Menu
----------------------- */
$(document).on(
  "click",
  '[class*="fg-nav_item"][href^="#"], [class*="fg-nav_overlay"]',
  function (e) {
    // Log debugging information
    console.log("Clicked element:", this);
    console.log("Href:", $(this).attr("href"));
    console.log("Nav button:", $('[fg-nav="button"]'));
    console.log("Nav button alternative:", $('[class*="fg-nav_button"]'));

    // Only prevent default for anchor links
    if ($(this).attr("href") && $(this).attr("href").startsWith("#")) {
      e.preventDefault();
    }

    // Try multiple ways to trigger menu close
    var $navButton = $('[fg-nav="button"]');
    if (!$navButton.length) {
      $navButton = $('[class*="fg-nav_button"]');
    }

    if ($navButton.length) {
      $navButton.click();
    } else {
      console.error("No nav button found to close menu");
    }
  }
);

/* -----------------------
05 – Copy HEX Color
----------------------- */
$('[class*="fg-color_wrapper"]').on("click", function () {
  const hexValue = $(this).find('[class*="is-hex"]').text();
  navigator.clipboard.writeText(hexValue);
});

/* -----------------------
06 – Font Section: Typewriter
----------------------- */
$(document).ready(function () {
  function isLargeDevice() {
    return window.matchMedia("(min-width: 991px)").matches;
  }

  function typeWriter($element, text, callback) {
    if (!isLargeDevice()) {
      $element.text(text);
      if (callback) callback();
      return;
    }

    // Find direct parent with name-wrapper class
    const $wrapper = $element.closest(
      '[class*="fg-font-preview_name-wrapper"]'
    );
    const $target = $wrapper.length ? $element : $element;

    const words = text.split(" ");
    const html = words
      .map((word) => {
        return `<span class="${getPrefixedClass(
          "word"
        )}" style="white-space: nowrap; display: inline-block;">
                        ${word
                          .split("")
                          .map(
                            (char) =>
                              `<span style="opacity: 0; display: inline-block;">${char}</span>`
                          )
                          .join("")}
                    </span><span style="opacity: 0; display: inline-block;">&nbsp;</span>`;
      })
      .join("");

    // Replace content at the correct level
    $target.html(html);

    const $chars = $target.find('span:not([class*="word"])');
    let i = 0;

    function revealNext() {
      if (i < $chars.length) {
        $chars.eq(i).css({
          opacity: "1",
          transition: "opacity 50ms",
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
  $components.each(function () {
    const $this = $(this);
    const $text = $this.find('[class*="fg-font-preview_text"]');
    const $name = $this.find('[class*="fg-font-preview_name"]');
    const $nameWrapper = $this.find('[class*="fg-font-preview_name-wrapper"]');

    // Store original HTML structure
    $text.data("original-html", $text.html());
    $name.data("original-html", $name.html());
    $nameWrapper.data("original-html", $nameWrapper.html());
  });

  if (isLargeDevice()) {
    $components.on("mouseenter", function () {
      const $nameWrapper = $(this).find(
        '[class*="fg-font-preview_name-wrapper"]'
      );
      const $text = $(this).find('[class*="fg-font-preview_text"]');

      $nameWrapper.hide();
      $text.show();
      typeWriter($text, $text.data("original-html"));
    });

    $components.on("mouseleave", function () {
      const $this = $(this);
      const $sampleWrapper = $this.find(
        '[class*="fg-font-preview_sample-wrapper"]'
      );
      const $nameWrapper = $this.find(
        '[class*="fg-font-preview_name-wrapper"]'
      );
      const $name = $this.find('[class*="fg-font-preview_name"]');
      const $text = $this.find('[class*="fg-font-preview_text"]');

      // Reset text to original state
      $text.html($text.data("original-html"));

      // Reset name wrapper to original state before starting new animation
      $nameWrapper.html($nameWrapper.data("original-html"));

      $sampleWrapper.show();
      $nameWrapper.show();

      // Find the name element again after resetting HTML
      const $newName = $nameWrapper.find('[class*="fg-font-preview_name"]');
      typeWriter($newName, $newName.text());
    });
  }

  let resizeTimer;
  $(window).on("resize", function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (!isLargeDevice()) {
        $components.off("mouseenter mouseleave");

        // Reset all elements to their original structure
        $components.each(function () {
          const $this = $(this);
          const $text = $this.find('[class*="fg-font-preview_text"]');
          const $nameWrapper = $this.find(
            '[class*="fg-font-preview_name-wrapper"]'
          );

          $text.html($text.data("original-html"));
          $nameWrapper.html($nameWrapper.data("original-html"));
        });

        $('[class*="fg-font-preview_name-wrapper"]').show();
      }
    }, 250);
  });
});

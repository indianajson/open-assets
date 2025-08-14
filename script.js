$(function () {
  /* Initialize File List and Parameters */

  let currentTab = "tiles";
  let sortField = null;
  let sortAsc = true;
  let currentAudio = null;
  let currentlyPlayingRow = null;
  let isLooping = false;

  // Initialize tabs
  $(".tab").on("click", function () {
    const tab = $(this).data("tab");
    window.location.hash = tab;
    $(".tab").removeClass("active");
    $(this).addClass("active");
    $(".tab-content").removeClass("active");
    $(`#${tab}-content`).addClass("active");
    currentTab = tab;

    if (tab === "tiles") {
      $('.filter[data-filter="type"]').removeClass("hidden");
    } else {
      $('.filter[data-filter="type"]').addClass("hidden");
      // Also uncheck any type filters when hiding
      $('.filter[data-filter="type"] input').prop("checked", false);
      $("#type-both").prop("checked", true);
    }
    if (tab === "tools") {
      $('.filter[data-filter="tooltype"]').removeClass("hidden");
    } else {
      $('.filter[data-filter="tooltype"]').addClass("hidden");
      // Also uncheck any type filters when hiding
      $('.filter[data-filter="tooltype"] input').prop("checked", false);
    }

    if (tab === "scripts" || tab === "tools") {
      $('.filter[data-filter="game"]').addClass("hidden");
      $('.filter[data-filter="game"] input').prop("checked", false);
    } else {
      $('.filter[data-filter="game"]').removeClass("hidden");
    }

    // Stop audio if switching away from music tab
    if (tab !== "music" && currentAudio) {
      currentAudio.pause();
      currentAudio = null;
      if (currentlyPlayingRow) {
        currentlyPlayingRow.find(".music-play-btn").text("▶");
        $("#play-btn").text("▶");
        $("#disc-image").css({ "animation-play-state": "paused" });

        currentlyPlayingRow = null;
      }
    }

    // Rebuild filter options for new tab
    buildFilterOptions();
    renderList();
  });

  function handleHashOnLoad() {
    const hash = window.location.hash.substring(1); // Remove the #
    const params = new URLSearchParams(hash);
    const tab = params.get("tab");
    const itemId = params.get("item");
    const validTabs = [
      "tiles",
      "backgrounds",
      "npcs",
      "music",
      "scripts",
      "tools",
    ];

    if (tab && validTabs.includes(tab)) {
      // Trigger click on the corresponding tab
      $(`.tab[data-tab="${tab}"]`).trigger("click");

      // After tab loads, select the item if specified
      if (itemId) {
        setTimeout(() => {
          const $rows = $(`#${tab}-content table.file-list tbody tr`);
          $rows.each(function () {
            const rowItemId = $(this).data("item-id");
            if (rowItemId == itemId) {
              $(this).trigger("click");
              $(this)[0].scrollIntoView({ block: "nearest" });
            }
          });
        }, 100); // Small delay to ensure tab content is loaded
      }
    }
  }

  // Search functionality
  $("#search-input").on("input", function () {
    renderList();
    updateClearButton();
  });

  buildFilterOptions();
  const field = $(this).data("sort");
  if (sortField === "game") {
    sortAsc = !sortAsc;
  } else if (
    currentTab == "music" ||
    currentTab == "tiles" ||
    currentTab == "npcs"
  ) {
    sortField = "game";
    sortAsc = true;
  } else if (currentTab == "tools") {
    sortField = "tooltype";
    sortAsc = true;
  } else if (currentTab == "scripts") {
    sortField = "scripttype";
    sortAsc = true;
  }

  renderList();

  $(".menu-bar .filter > label").on("click", function () {
    const f = $(this).parent();
    $(".menu-bar .filter").not(f).removeClass("open");
    f.toggleClass("open");
  });
  $(document).on("click", (e) => {
    if (!$(e.target).closest(".filter").length)
      $(".menu-bar .filter").removeClass("open");
  });

  $("#clear-filters").on("click", () => {
    // reset filters
    $(".filter[data-filter=game] .dropdown input:checkbox").prop(
      "checked",
      false
    );
    $(".filter[data-filter=author] .dropdown input:checkbox").prop(
      "checked",
      false
    );
    $(".filter[data-filter=tooltype] .dropdown input:checkbox").prop(
      "checked",
      false
    );
    $("#type-both").prop("checked", true);
    $("#clear-filters").prop("disabled", true);
    $("#search-input").val("");
    renderList();
  });

  $("th.sortable").on("click", function () {
    const field = $(this).data("sort");
    if (sortField === field) sortAsc = !sortAsc;
    else {
      sortField = field;
      sortAsc = true;
    }
    renderList();
  });

  // ---------- Modal open/close handlers ----------
  $("#feedback-btn").on("click", function () {
    console.log("clicckedsx");
    $("#modal-overlay").fadeIn(100);
    $("#feedback-modal").fadeIn(100);
  });

  // Close when “X” is clicked
  $("#feedback-modal .close-btn").on("click", function () {
    $("#feedback-modal").fadeOut(100);
    $("#modal-overlay").fadeOut(100);
  });

  // Also close if the user clicks on the overlay itself
  $("#modal-overlay").on("click", function () {
    $("#feedback-modal").fadeOut(100);
    $("#modal-overlay").fadeOut(100);
  });

  /* Functions to Build Filters */

  function buildFilterOptions() {
    const games = [
      "EXE1/BN1",
      "EXE2/BN2",
      "EXE3/BN3",
      "EXETM/NT",
      "EXEGP/BCC",
      "EXE4/BN4",
      "EXE4.5",
      "EXEPoN",
      "EXE5/BN5",
      "EXE6/BN6",
      "EXELoN",
      "SSR1/SF1",
      "SSR2/SF2",
      "SSR3/SF3",
      "Shanghai",
      "Custom",
      "Other",
    ];
    const $game = $(".filter[data-filter=game] .dropdown");
    $game.empty(); // Clear existing options
    games.forEach((g) => {
      $game.append(
        `<div><input type="checkbox" value="${g}" id="g-${g}"><label for="g-${g}"> ${g}</label></div>`
      );
    });

    // Get authors from current tab's data
    let currentData;
    if (currentTab === "tiles") {
      currentData = allData;
    } else if (currentTab === "backgrounds") {
      currentData = allBackgrounds;
    } else if (currentTab === "npcs") {
      currentData = allNPCs;
    } else if (currentTab === "music") {
      currentData = allMusic;
    } else if (currentTab === "scripts") {
      currentData = allScripts;
    } else if (currentTab === "tools") {
      currentData = allTools;
    }

    const authors = [...new Set(currentData.map((x) => x.author))].sort();
    const $auth = $(".filter[data-filter=author] .dropdown");
    $auth.empty(); // Clear existing options
    authors.forEach((a) => {
      if (Array.isArray(a)) {
        //Ignore multi-author items for simplicity
      } else {
        const id = "a-" + a.replace(/\s+/g, "_");
        $auth.append(
          `<div><input type="checkbox" value="${a}" id="${id}"><label for="${id}"> ${a}</label></div>`
        );
      }
    });

    const tooltype = [...new Set(allTools.map((x) => x.tooltype))].sort();
    const $tooltype = $(".filter[data-filter=tooltype] .dropdown");
    $tooltype.empty(); // Clear existing options
    tooltype.forEach((a) => {
      const id = "tt-" + a.replace(/\s+/g, "_");
      $tooltype.append(
        `<div><input type="checkbox" value="${a}" id="${id}"><label for="${id}"> ${a}</label></div>`
      );
    });

    if (currentTab === "tiles") {
      $(".filter[data-filter=tooltype] input").on("change", () => {
        renderList();
        updateClearButton();
      });
    }
    if (currentTab === "tiles") {
      $(".filter[data-filter=type] input").on("change", () => {
        renderList();
        updateClearButton();
      });
    }

    $(".filter[data-filter=game] input, .filter[data-filter=author] input").on(
      "change",
      () => {
        renderList();
        updateClearButton();
      }
    );

    $(".dropdown input").on("change", () => {
      renderList();
      updateClearButton();
    });
  }

  function getFilters() {
    const games = $(".filter[data-filter=game] .dropdown input:checked")
      .map((i, e) => e.value)
      .get();
    const type = $(".filter[data-filter=type] .dropdown input:checked").val();
    const authors = $(".filter[data-filter=author] .dropdown input:checked")
      .map((i, e) => e.value)
      .get();
    const tooltype = $(".filter[data-filter=tooltype] .dropdown input:checked")
      .map((i, e) => e.value)
      .get();

    const searchTerm = $("#search-input").val().toLowerCase();
    return { games, type, authors, tooltype, searchTerm };
  }

  function updateClearButton() {
    const { games, type, authors, tooltype, searchTerm } = getFilters();
    const any =
      games.length > 0 ||
      authors.length > 0 ||
      tooltype.length > 0 ||
      type !== "both" ||
      searchTerm !== "";
    $("#clear-filters").prop("disabled", !any);
  }

  /* Functions to Render File Lists and File Previews */

  function renderList() {
    const { games, type, authors, tooltype, searchTerm } = getFilters();
    let currentData;

    if (currentTab === "tiles") {
      currentData = allData;
    } else if (currentTab === "backgrounds") {
      currentData = allBackgrounds;
    } else if (currentTab === "npcs") {
      currentData = allNPCs;
    } else if (currentTab === "music") {
      currentData = allMusic;
    } else if (currentTab === "scripts") {
      currentData = allScripts;
    } else if (currentTab === "tools") {
      currentData = allTools;
    }

    if (games.includes("EXE1/BN1")) {
      games.push("EXEOSS");
    }
    if (games.includes("EXE5/BN5")) {
      games.push("EXE5DS/BN5DS");
    }
    let rows = currentData.filter((item) => {
      if (
        games.length &&
        !games.includes(item.game) &&
        currentTab !== "scripts" &&
        currentTab !== "tools"
      )
        return false;
      if (authors.length && !authors.includes(item.author)) return false;
      if (
        tooltype.length &&
        !tooltype.includes(item.tooltype) &&
        currentTab == "tools"
      )
        return false;
      if (
        type !== "both" &&
        item.type !== type &&
        currentTab !== "music" &&
        currentTab !== "scripts" &&
        currentTab !== "tools"
      )
        return false;
      if (searchTerm && !item.name.toLowerCase().includes(searchTerm))
        return false;
      return true;
    });

    if (currentTab == "scripts") {
      if (sortField == "game") {
        sortField = "scripttype";
      }
    } else if (currentTab == "tools") {
      if (sortField == "game") {
        sortField = "tooltype";
      }
    }
    if (sortField) {
      rows.sort((a, b) => {
        // Handle cases where the field might be an array
        const av = Array.isArray(a[sortField])
          ? a[sortField].join(", ")
          : a[sortField];
        const bv = Array.isArray(b[sortField])
          ? b[sortField].join(", ")
          : b[sortField];

        // Convert to lowercase strings for comparison
        avLower = String(av).toLowerCase();
        if (avLower == "custom") {
          avLower = "zcustom";
        }
        if (avLower == "other") {
          avLower = "yother";
        }
        bvLower = String(bv).toLowerCase();
        if (bvLower == "custom") {
          bvLower = "zcustom";
        }
        if (bvLower == "other") {
          bvLower = "yother";
        }
        return (
          (avLower < bvLower ? -1 : avLower > bvLower ? 1 : 0) *
          (sortAsc ? 1 : -1)
        );
      });
    }

    const $tb = $(`#${currentTab}-content table.file-list tbody`).empty();

    if (currentTab === "music") {
      rows.forEach((it, index) => {
        $tb.append(
          `<tr data-item-id="${it.id || index}">
              <td><input type="checkbox" class="sel"/></td>
              <td><button class="music-play-btn">▶</button></td>
              <td>${it.name}</td>
              <td>${it.ostname}</td>
              <td>${it.game}</td>
              <td>${
                Array.isArray(it.author) ? "<i>Multiple</i>" : it.author
              }</td>
            </tr>`
        );
      });
    } else if (currentTab === "scripts") {
      rows.forEach((it, index) => {
        $tb.append(
          `<tr data-item-id="${it.id || index}">
              <td><input type="checkbox" class="sel"/></td>
              <td>${it.name}</td>
              <td>${it.scripttype}</td>
              <td>${
                Array.isArray(it.author) ? "<i>Multiple</i>" : it.author
              }</td>
            </tr>`
        );
      });
    } else if (currentTab === "tools") {
      rows.forEach((it, index) => {
        $tb.append(
          `<tr data-item-id="${it.id || index}">
              <td><input type="checkbox" class="sel"/></td>
              <td>${it.name}</td>
              <td>${it.tooltype}</td>
              <td>${
                Array.isArray(it.author) ? "<i>Multiple</i>" : it.author
              }</td>
            </tr>`
        );
      });
    } else {
      rows.forEach((it, index) => {
        $tb.append(
          `<tr data-item-id="${it.id || index}">
              <td><input type="checkbox" class="sel"/></td>
              <td>${it.name}</td>
              <td>${it.game}</td>
              <td>${
                Array.isArray(it.author) ? "<i>Multiple</i>" : it.author
              }</td>
            </tr>`
        );
      });
    }

    // Set up row click handlers based on current tab
    if (currentTab === "music") {
      $(`#${currentTab}-content table.file-list tbody tr`).on(
        "click",
        function (e) {
          $("#play-btn").text("▶");
          if (
            $(e.target).hasClass("music-play-btn") ||
            $(e.target).hasClass("sel")
          )
            return;

          $("table.file-list tr").removeClass("selected");
          $(this).addClass("selected");
          const itemId = $(this).data("item-id");
          const params = new URLSearchParams();
          params.set("tab", currentTab);
          params.set("item", itemId);
          window.location.hash = params.toString();

          showMusicPreview(rows[$(this).index()]);
        }
      );

      // Music play button handler
      $(`#${currentTab}-content .music-play-btn`).on("click", function (e) {
        e.stopPropagation();
        const $row = $(this).closest("tr");
        const index = $row.index();
        const item = rows[index];

        if (currentlyPlayingRow && currentlyPlayingRow[0] === $row[0]) {
          // Toggle play/pause for current track
          if (currentAudio.paused) {
            currentAudio.play();
            $(this).text("❚❚");
            $("#disc-image").css({ "animation-play-state": "running" });
            $("#play-btn").text("❚❚");
          } else {
            currentAudio.pause();
            $("#disc-image").css({ "animation-play-state": "paused" });
            $(this).text("▶");
            $("#play-btn").text("▶");
          }
        } else {
          // New track selected
          if (currentlyPlayingRow) {
            currentlyPlayingRow.find(".music-play-btn").text("▶");
            $("#disc-image").css({ "animation-play-state": "paused" });
          }
          currentlyPlayingRow = $row;
          $(this).text("❚❚");
          $("#play-btn").text("❚❚");
          showMusicPreview(item);
          currentAudio.play();
          $("#disc-image").css({ "animation-play-state": "running" });
        }
      });
    } else if (currentTab === "scripts" || currentTab === "tools") {
      $(`#${currentTab}-content table.file-list tbody tr`).on(
        "click",
        function (e) {
          if (e.target.type === "checkbox") return;
          $("table.file-list tr").removeClass("selected");
          $(this).addClass("selected");
          const itemId = $(this).data("item-id");
          const params = new URLSearchParams();
          params.set("tab", currentTab);
          params.set("item", itemId);
          window.location.hash = params.toString();

          showInfoPreview(rows[$(this).index()]);
        }
      );
    } else if (currentTab === "tiles") {
      $(`#${currentTab}-content table.file-list tbody tr`).on(
        "click",
        function (e) {
          $("#preview-animated").empty();
          if (e.target.type === "checkbox") return;
          $("table.file-list tr").removeClass("selected");
          $(this).addClass("selected");
          const itemId = $(this).data("item-id");
          const params = new URLSearchParams();
          params.set("tab", currentTab);
          params.set("item", itemId);
          window.location.hash = params.toString();

          showPreview(rows[$(this).index()]);
        }
      );
    } else if (currentTab === "backgrounds") {
      $(`#${currentTab}-content table.file-list tbody tr`).on(
        "click",
        function (e) {
          if (e.target.type === "checkbox") return;
          $("table.file-list tr").removeClass("selected");
          $(this).addClass("selected");
          const itemId = $(this).data("item-id");
          const params = new URLSearchParams();
          params.set("tab", currentTab);
          params.set("item", itemId);
          window.location.hash = params.toString();
          showBackgroundPreview(rows[$(this).index()]);
        }
      );
    } else if (currentTab === "npcs") {
      $(`#${currentTab}-content table.file-list tbody tr`).on(
        "click",
        function (e) {
          if (e.target.type === "checkbox") return;
          $("table.file-list tr").removeClass("selected");
          $(this).addClass("selected");
          const itemId = $(this).data("item-id");
          const params = new URLSearchParams();
          params.set("tab", currentTab);
          params.set("item", itemId);
          window.location.hash = params.toString();

          showNPCPreview(rows[$(this).index()]);
        }
      );
    }

    $(".sel").on("change", () => {
      $("#download-selected").prop("disabled", $(".sel:checked").length === 0);
    });

    $("#download-selected")
      .off()
      .on("click", () => {
        const checked = $(".sel:checked")
          .closest("tr")
          .map((i, tr) => rows[$(tr).index()])
          .get();
        downloadMultiple(checked);
      });

    // reset preview based on current tab
    if (currentTab === "tiles") {
      $(".preview-animated").empty();
      $("#preview-image").attr("src", "");
      $("#detail-author,#detail-game").text("—");
      $("#download-single").prop("disabled", true).off();
    } else if (currentTab === "backgrounds") {
      $("#preview-image-bg").empty();
      $(
        "#detail-author-bg,#detail-game-bg,#detail-velx-bg,#detail-vely-bg"
      ).text("—");
      $("#download-single-bg").prop("disabled", true).off();
    } else if (currentTab === "npcs") {
      $("#preview-image-npc").empty();
      $("#detail-author-npc,#detail-game-npc").text("—");
      $("#download-single-npc").prop("disabled", true).off();
    } else if (currentTab === "music") {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
      }
      $("#detail-author-music,#detail-game-music").text("—");
      $("#download-single-music").prop("disabled", true).off();
      $("#current-time, #duration").text("0:00");
      $("#audio-timeline").val(0);
    } else if (currentTab === "scripts") {
      $("#script-details").empty();
    } else if (currentTab === "tools") {
      $("#tool-details").empty();
    }
  }

  function showPreview(item) {
    $(".preview-animated").empty();
    const imgPath = "files/" + item.preview;
    const tsxPath = imgPath.replace(".png", ".tsx");
    animateTSX(tsxPath, ".preview-animated");
    $("#preview-image").attr("src", imgPath).css({ transform: "" });
    $("#detail-author").text(
      Array.isArray(item.author) ? item.author.join(", ") : item.author
    );
    $("#detail-game").text(item.game);
    $("#download-single")
      .prop("disabled", false)
      .off()
      .on("click", () => downloadMultiple([item]));
  }

  function showInfoPreview(item) {
    let detailsHtml = "";

    if (currentTab === "scripts") {
        detailsHtml = `
            <p><strong>Name:</strong> ${item.name}</p>
            <p><strong>Author:</strong> ${
                Array.isArray(item.author) ? item.author.join(", ") : item.author
            }</p>
            <p><strong>Description:</strong> ${item.description}</p>
        `;
    } else if (currentTab === "tools") {
        detailsHtml = `
            <p><strong>Name:</strong> ${item.name}</p>
            <p><strong>Author:</strong> ${
                Array.isArray(item.author) ? item.author.join(", ") : item.author
            }</p>
            ${item.repository ? `<p><strong>Repository:</strong> <a href="${item.repository}" target="_blank">${item.repository}</a></p>` : ''}
            <p><strong>Description:</strong> ${item.description}</p>
        `;
    }

    // Update the correct details div
      if (currentTab === "scripts") {
          $("#script-details").html(detailsHtml);
      } else if (currentTab === "tools") {
          $("#tool-details").html(detailsHtml);
      }
    
      // Scroll to top when new content is loaded
      $(".preview-scrollable").scrollTop(0);
  }

  /* Functions for NPC Preview */

  function showNPCPreview(item) {
    const imgPath = "npc/" + item.preview;
    $("#preview-image-npc").empty(); // Clear previous content
    $("#detail-author-npc").text(
      Array.isArray(item.author) ? item.author.join(", ") : item.author
    );
    $("#detail-game-npc").text(item.game);
    //createNPCHorizontalAnimation('npc/'+item.preview); // Use new function for NPCs
    previewNPCAnimation("npc/" + item.preview); // Use new function for NPCs

    $("#download-single-npc")
      .prop("disabled", false)
      .off()
      .on("click", () => downloadMultipleNPC([item]));
  }

  function previewNPCAnimation(animationUrl) {
    // 1) Clear anything already rendered:
    $("#preview-image-npc").empty();

    // 2) Load the .animation text via AJAX:
    $.get(animationUrl, function (text) {
      const lines = text.split("\n");
      let spriteSrc = "";
      const animations = {};
      let currentState = null;
      const attrRegex = /(\w+)="([^"]+)"/g;

      // 3) Parse out imagePath + every "animation state=…" block and its frames
      lines.forEach((rawLine) => {
        const line = rawLine.trim();
        if (!line) return;

        // 3.a) If this line begins with imagePath="…", grab the quoted value:
        if (line.startsWith("imagePath=")) {
          const m = /imagePath="([^"]+)"/.exec(line);
          if (m) spriteSrc = m[1];
        }
        // 3.b) If this begins an animation state block:
        else if (line.startsWith("animation state=")) {
          const attrs = {};
          let match;
          while ((match = attrRegex.exec(line)) !== null) {
            attrs[match[1]] = match[2];
          }
          if (attrs.state) {
            currentState = attrs.state;
            animations[currentState] = [];
          }
        }
        // 3.c) If this is "frame …" inside a currentState, extract its attributes:
        else if (line.startsWith("frame ") && currentState) {
          const attrs = {};
          let match;
          while ((match = attrRegex.exec(line)) !== null) {
            attrs[match[1]] = match[2];
          }
          animations[currentState].push({
            duration: parseFloat(attrs.duration) || 0,
            x: parseInt(attrs.x, 10) || 0,
            y: parseInt(attrs.y, 10) || 0,
            w: parseInt(attrs.w, 10) || 0,
            h: parseInt(attrs.h, 10) || 0,
            originx: parseInt(attrs.originx, 10) || 0,
            originy: parseInt(attrs.originy, 10) || 0,
            flipx: attrs.flipx === "1",
          });
        }
      });

      if (!spriteSrc) {
        console.error(
          "⚠️ previewNPCAnimation: no imagePath found in",
          animationUrl
        );
        return;
      }

      // 4) Preload the sprite sheet:
      const spriteImg = new Image();
      spriteImg.onload = function () {
        // 5) Once the sheet is loaded, iterate every state:
        Object.keys(animations).forEach((stateName) => {
          flip = false;
          const frames = animations[stateName];
          if (!frames.length) return;

          // 5.a) Compute the per-state maxima:
          //      maxOriginX = max(frame.originx)
          //      maxOriginY = max(frame.originy)
          //      maxRight   = max(frame.w - frame.originx)
          //      maxBelow   = max(frame.h - frame.originy)
          let maxOriginX = 0,
            maxOriginY = 0;
          let maxRight = 0,
            maxBelow = 0;
          frames.forEach((f) => {
            if (f.flipx) {
              flip = true;
            }
            if (f.originx > maxOriginX) maxOriginX = f.originx;
            if (f.originy > maxOriginY) maxOriginY = f.originy;
            const right = f.w - f.originx;
            const below = f.h - f.originy;
            if (right > maxRight) maxRight = right;
            if (below > maxBelow) maxBelow = below;
          });

          // 5.b) Build a “baseline container” whose size is big enough so that
          //      each frame’s origin can sit at (maxOriginX, maxOriginY) without clipping.
          const containerW = maxOriginX + maxRight;
          const containerH = maxOriginY + maxBelow;
          $container = "";
          if (flip == true) {
            $container = $("<div>")
              .css({
                position: "relative",
                width: containerW * 2 + "px",
                height: containerH * 2 + "px",
                overflow: "visible", // mask inside will hide everything except the one frame
                display: "inline-block", // so multiple states line up side by side
                verticalAlign: "bottom", // all states share same baseline
                margin: "8px",
                transform: "scaleX(-1)",
              })
              .attr("data-state", stateName);
          } else {
            $container = $("<div>")
              .css({
                position: "relative",
                width: containerW * 2 + "px",
                height: containerH * 2 + "px",
                overflow: "visible", // mask inside will hide everything except the one frame
                display: "inline-block", // so multiple states line up side by side
                verticalAlign: "bottom", // all states share same baseline
                margin: "8px",
              })
              .attr("data-state", stateName);
          }
          // (Optional label) Uncomment if you want the state name above each animation:
          // $('<div>')
          //   .text(stateName)
          //   .css({ textAlign: 'center', fontSize: '0.8em', marginBottom: '4px' })
          //   .appendTo($container);

          // 5.c) Inside that, create a “mask” DIV that will hold exactly one frame at a time:
          //      – It must have `overflow: hidden` so nothing else from the spritesheet shows.
          //      – We will resize it to fit each frame’s w×h every tick, and move it so
          //        the origin lines up at (maxOriginX, maxOriginY).
          const $mask = $("<div>").css({
            position: "absolute",
            top: "0px", // will be overridden per frame
            left: "0px", // will be overridden per frame
            width: "0px", // will be set to f.w
            height: "0px", // will be set to f.h
            overflow: "hidden", // 🔒 without this, neighboring frames can peek through!
          });
          // 5.d) Clone the preloaded <img> into that mask (so we don’t re-download):
          const $img = $(spriteImg)
            .clone()
            .css({
              position: "absolute",
              top: "0px",
              left: "0px",
              width: spriteImg.width + "px",
              height: spriteImg.height + "px",
            });

          // Nest them and append to #preview-image-npc:
          $mask.append($img);
          $container.append($mask);
          $("#preview-image-npc").append($container);

          // 6) Now start the per-state frame loop:
          (function animateState($maskEl, $imgEl, framesArray, maxOX, maxOY) {
            let idx = 0;

            function showNextFrame() {
              const f = framesArray[idx];

              // 6.a) Resize the mask to exactly this frame’s w×h:
              //      That ensures only this rectangle is ever visible.
              $maskEl.css({
                width: f.w * 2 + "px",
                height: f.h * 2 + "px",
              });

              // 6.b) Move the mask so that (f.originx, f.originy) within it lines up
              //      at (maxOriginX, maxOriginY) in the parent container:
              //
              //       →  maskTop  = maxOriginY − f.originy
              //       →  maskLeft = maxOriginX − f.originx
              //
              const maskTop = maxOY - f.originy;
              const maskLeft = maxOX - f.originx;
              $maskEl.css({
                top: maskTop * 2 + "px",
                left: maskLeft * 2 + "px",
              });

              // 6.c) Move the <img> inside the mask so that (f.x, f.y) in the sheet
              //      appears at the mask’s (0,0). Everything else is clipped:
              //
              //       →  imgTop  = −f.y
              //       →  imgLeft = −f.x
              $imgEl.css({
                top: -f.y + "px",
                left: -f.x + "px",
              });

              // Advance to next frame in [0..framesArray.length-1], looping back at end:
              idx = (idx + 1) % framesArray.length;
              setTimeout(showNextFrame, f.duration * 1000);
            }

            // Kick off the loop:
            showNextFrame();
          })(
            $mask, // the DIV that hides everything except one rectangle
            $img, // the <img> inside it
            frames, // array of {x,y,w,h,originx,originy,duration, …}
            maxOriginX,
            maxOriginY
          );
        });
      };

      spriteImg.src = "npc/" + spriteSrc; // start loading the PNG
    }).fail(function () {
      console.error("⚠️ previewNPCAnimation: failed to load", animationUrl);
    });
  }

  /* Functions for Background Animation */

  let animationFrames = [];
  let currentFrameIndex = 0;
  let lastFrameTime = 0;
  let frameDuration = 0;
  let spriteWidth = 0;
  let spriteHeight = 0;
  let xVelocity = 0;
  let yVelocity = 0;
  let xOffset = 0;
  let yOffset = 0;
  let animationId = null;
  let spriteImage = null;
  let container = null;

  function createAnimatedBackground(animationFile, xVel, yVel) {
    xVelocity = xVel;
    yVelocity = yVel;

    // Clear any existing animation
    if (animationId) {
      cancelAnimationFrame(animationId);
      animationId = null;
    }

    // Clear container
    container =
      currentTab === "npcs" ? $("#preview-image-npc") : $("#preview-image-bg");
    container.empty();

    // Load the animation file
    fetch(animationFile)
      .then((response) => response.text())
      .then(parseAnimationFile)
      .then(loadSpriteImage)
      .catch((error) => console.error("Error:", error));
  }

  function parseAnimationFile(data) {
    // Reset animation data
    animationFrames = [];
    currentFrameIndex = 0;
    lastFrameTime = 0;

    // Parse the animation file
    const lines = data.split("\n");
    let imagePath = "";

    // A regex to capture any key="value" pair
    const attrRegex = /(\w+)\s*=\s*"([^"]*)"/g;

    for (const line of lines) {
      // Look for imagePath="..."
      if (line.includes("imagePath=")) {
        const match = /imagePath\s*=\s*"([^"]*)"/.exec(line);
        if (match) {
          imagePath = match[1];
        }
        continue;
      }

      // Look for lines that start with "frame "
      if (line.trim().startsWith("frame ")) {
        // Build an object of all attributes on this line
        const frameAttrs = {};
        let m;
        while ((m = attrRegex.exec(line)) !== null) {
          // m[1] is the attribute name, m[2] is its value
          frameAttrs[m[1]] = m[2];
        }

        // Now pick out the mandatory fields (duration, x, y, w, h, originx, originy)
        // and optional fields (flipx, flipy). If flipx/flipy are missing, default to 0.
        const frame = {
          duration: parseFloat(frameAttrs.duration),
          x: parseInt(frameAttrs.x, 10),
          y: parseInt(frameAttrs.y, 10),
          w: parseInt(frameAttrs.w, 10),
          h: parseInt(frameAttrs.h, 10),
          originx: parseInt(frameAttrs.originx, 10),
          originy: parseInt(frameAttrs.originy, 10),
          flipx:
            frameAttrs.flipx !== undefined ? parseInt(frameAttrs.flipx, 10) : 0,
          flipy:
            frameAttrs.flipy !== undefined ? parseInt(frameAttrs.flipy, 10) : 0,
        };

        animationFrames.push(frame);
      }
    }

    if (animationFrames.length === 0) {
      throw new Error("No animation frames found in file");
    }

    // Set initial sprite dimensions from first frame
    spriteWidth = animationFrames[0].w;
    spriteHeight = animationFrames[0].h;

    // Only apply velocity scaling for backgrounds, not NPCs

    if (currentTab === "backgrounds") {
      xVelocity = (xVelocity * -1 * 200 * spriteWidth) / 120;
      yVelocity = (yVelocity * -1 * 200 * spriteWidth) / 120;
    } else {
      xVelocity = 0;
      yVelocity = 0;
    }

    frameDuration = animationFrames[0].duration;

    return imagePath;
  }

  function loadSpriteImage(imagePath) {
    return new Promise((resolve, reject) => {
      spriteImage = new Image();
      spriteImage.onload = () => {
        createTiles();
        resolve();
      };
      spriteImage.onerror = () => {
        reject(new Error("Failed to load sprite image"));
      };
      if (currentTab === "npcs") {
        spriteImage.src = "npc/" + imagePath;
      } else {
        spriteImage.src = "files/" + imagePath;
      }
    });
  }

  function createTiles() {
    const containerWidth = container.width();
    const containerHeight = container.height();

    // Calculate how many tiles we need in each direction
    const tilesX = Math.ceil(containerWidth / spriteWidth) + 2;
    const tilesY = Math.ceil(containerHeight / spriteHeight) + 2;

    // Create tiles
    for (let y = -1; y < tilesY; y++) {
      for (let x = -1; x < tilesX; x++) {
        const tile = $('<div class="tile"></div>');
        tile.css({
          "--sprite-sheet": `url(${spriteImage.src})`,
          "--sprite-w": `${spriteWidth}px`,
          "--sprite-h": `${spriteHeight}px`,
          left: `${x * spriteWidth}px`,
          top: `${y * spriteHeight}px`,
        });
        container.append(tile);
      }
    }

    // Start animation loop
    lastFrameTime = performance.now();
    animationId = requestAnimationFrame(animate);
  }
  function animate(timestamp) {
    // For NPCs, we only want one tile centered
    if (currentTab === "npcs") {
      // Calculate time since last frame
      const deltaTime = (timestamp - lastFrameTime) / 1000; // in seconds
      lastFrameTime = timestamp;

      // Update animation frame if needed
      frameDuration -= deltaTime;
      if (frameDuration <= 0) {
        currentFrameIndex = (currentFrameIndex + 1) % animationFrames.length;
        const frame = animationFrames[currentFrameIndex];
        frameDuration = frame.duration;

        // Update the single tile with new sprite position
        $(".tile").css("--sprite-pos", `-${frame.x}px -${frame.y}px`);
      }

      // Center the single tile
      const containerWidth = container.width();
      const containerHeight = container.height();
      $(".tile").css({
        left: `${(containerWidth - spriteWidth) / 2}px`,
        top: `${(containerHeight - spriteHeight) / 2}px`,
      });

      // Continue animation loop
      animationId = requestAnimationFrame(animate);
      return;
    }

    // Calculate time since last frame
    const deltaTime = (timestamp - lastFrameTime) / 1000; // in seconds
    lastFrameTime = timestamp;

    // Update animation frame if needed
    frameDuration -= deltaTime;
    if (frameDuration <= 0) {
      currentFrameIndex = (currentFrameIndex + 1) % animationFrames.length;
      const frame = animationFrames[currentFrameIndex];
      frameDuration = frame.duration;

      // Update all tiles with new sprite position
      $(".tile").css("--sprite-pos", `-${frame.x}px -${frame.y}px`);
    }
    // Update position based on velocity
    xOffset = (xOffset + xVelocity * deltaTime) % spriteWidth;
    yOffset = (yOffset + yVelocity * deltaTime) % spriteHeight;

    // Position tiles to create infinite scroll
    const containerWidth = container.width();
    const containerHeight = container.height();
    const tilesX = Math.ceil(containerWidth / spriteWidth) + 2;
    const tilesY = Math.ceil(containerHeight / spriteHeight) + 2;

    let tileIndex = 0;
    for (let y = -1; y < tilesY; y++) {
      for (let x = -1; x < tilesX; x++) {
        const tile = $(".tile").eq(tileIndex);
        tile.css({
          left: `${x * spriteWidth - xOffset}px`,
          top: `${y * spriteHeight - yOffset}px`,
        });
        tileIndex++;
      }
    }

    // Continue animation loop
    animationId = requestAnimationFrame(animate);
  }

  /* Function for Background Preview */

  function showBackgroundPreview(item) {
    const imgPath = "files/" + item.preview;
    //$('#preview-image-bg').attr('src','#');
    $("#detail-author-bg").text(
      Array.isArray(item.author) ? item.author.join(", ") : item.author
    );
    $("#detail-game-bg").text(item.game);
    $("#detail-velx-bg").text(item.velx !== undefined ? item.velx : "—");
    $("#detail-vely-bg").text(item.vely !== undefined ? item.vely : "—");
    createAnimatedBackground("files/" + item.preview, item.velx, item.vely);
    $("#download-single-bg")
      .prop("disabled", false)
      .off()
      .on("click", () => downloadMultiple([item]));
  }

  /* Function to Music Player */

  let currentVolume = 1;
  let slideshowInterval = null
  function showMusicPreview(item) {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
    }
    if (currentAudio) {
      currentAudio.pause();
      $("#disc-image").css({ "animation-play-state": "paused" });
      currentAudio = null;
    }
    if (item.disc) {
      $("#disc-image").attr("src", "img/disc/" + item.disc);
      $("#disc-image").css({ display: "" });
    } else {
      $("#disc-image").css({ display: "none" });
    }
    if (item.gameimage) {
        const $container = $("#game-image-container").empty();
        
        if (Array.isArray(item.gameimage)) {
            // Create slideshow for multiple images
            item.gameimage.forEach((img, index) => {
                $container.append($('<img>')
                    .attr('src', 'img/logo/' + img)
                    .css('opacity', index === 0 ? 1 : 0) // Start with first image visible
                    .addClass(index === 0 ? 'active' : ''));
            });
            
            // Start slideshow with proper fading
            let currentIndex = 0;
            slideshowInterval = setInterval(() => {
                const $images = $container.find('img');
                $images.removeClass('active');
                
                // Fade out current image
                $images.eq(currentIndex).css('opacity', 0);
                
                // Calculate next index
                currentIndex = (currentIndex + 1) % item.gameimage.length;
                
                // Fade in next image after a small delay
                setTimeout(() => {
                    $images.eq(currentIndex)
                        .css('opacity', 1)
                        .addClass('active');
                }, 50);
            }, 2000); // Change image every 2 seconds (with 0.5s fade)
        } else {
            // Single image
            $container.append($('<img>')
                .attr('src', 'img/logo/' + item.gameimage)
                .css('opacity', 1)
                .addClass('active'));
        }
    } else {
        $("#game-image-container").empty();
    }
    $("#detail-title-music").text(item.name);
    $("#detail-author-music").text(
      Array.isArray(item.author) ? item.author.join(", ") : item.author
    );
    $("#detail-game-music").text(
      Array.isArray(item.game) ? item.game.join(", ") : item.game
    );
    $("#detail-loopstart-music").text(item.start);
    $("#detail-loopend-music").text(item.stop);
    $("#detail-places-music").text(item.places);
    $("#detail-ostname-music").text(item.ostname);
    $("#detail-composer-music").text(
      Array.isArray(item.composer) ? item.composer.join(", ") : item.composer
    );
    $("#download-single-music")
      .prop("disabled", false)
      .off()
      .on("click", () => downloadMultipleMusic([item]));
    $("#current-time").text("0:00");
    $("#duration").text(item.duration);
    file_duration = item.duration;
    const audioPath = "music/" + item.files[0];
    currentAudio = new Audio(audioPath);
    currentAudio.loopStart = item.start * 0.001;
    currentAudio.loopEnd = item.stop * 0.001;
    let loopStart = currentAudio.loopStart || 0;
    let loopEnd = currentAudio.loopEnd || currentAudio.duration;

    currentAudio.volume = currentVolume;
    $("#volume-slider").off().on("input", function() {
      currentVolume = $(this).val() / 100;
      if (currentAudio) {
        currentAudio.volume = currentVolume;
      }
    });
    $("#volume-slider").val(currentVolume * 100);

    // Set up audio player controls
    $("#play-btn")
      .off()
      .on("click", function () {
        if (currentAudio.paused) {
          currentAudio.play();
          $(this).text("❚❚");
          $("#disc-image").css({ "animation-play-state": "running" });
          $("#play-btn").text("❚❚");
          if (currentlyPlayingRow) {
            currentlyPlayingRow.find(".music-play-btn").text("❚❚");
          }
        } else {
          currentAudio.pause();
          $(this).text("▶");
          $("#disc-image").css({ "animation-play-state": "paused" });
          $("#play-btn").text("▶");
          if (currentlyPlayingRow) {
            currentlyPlayingRow.find(".music-play-btn").text("▶");
          }
        }
      });

    // Toggle loop button
    $("#toggleLoop")
      .off()
      .on("click", function () {
        isLooping = !isLooping;
        $(this).text(isLooping ? "Disable Looping" : "Enable Looping");
      });

    currentAudio.addEventListener("timeupdate", function () {
      const currentTime = formatTime(currentAudio.currentTime);
      $("#current-time").text(currentTime);
      const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
      $("#audio-timeline").val(progress || 0);

      // Handle looping
      if (isLooping && loopEnd > 0 && currentAudio.currentTime >= loopEnd) {
        currentAudio.currentTime = loopStart;
        currentAudio.play();
      }
      $("#detail-curtime-music").text(currentAudio.currentTime);
    });

    $("#audio-timeline")
      .off()
      .on("input", function () {
        const seekTime = (currentAudio.duration * $(this).val()) / 100;
        currentAudio.currentTime = seekTime;
      });

    currentAudio.addEventListener("ended", function () {
      if (isLooping) {
        currentAudio.currentTime = loopStart;
        currentAudio.play();
      } else {
        $("#disc-image").css({ "animation-play-state": "paused" });
        $("#play-btn").text("▶");
        if (currentlyPlayingRow) {
          currentlyPlayingRow.find(".music-play-btn").text("▶");
        }
      }
    });
  }

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }

  /* Function to Animate TSX files */

  function animateTSX(tsxUrl, containerSelector) {
    $(".preview-animated").empty();
    // 1) Fetch TSX via AJAX as XML
    $.ajax({
      url: tsxUrl,
      dataType: "xml",
    })
      .done(function (xml) {
        // 2) Parse <tileset> attributes
        var $tileset = $(xml).find("tileset").first();
        var tileWidth = parseInt($tileset.attr("tilewidth"), 10);
        var tileHeight = parseInt($tileset.attr("tileheight"), 10);
        var columns = parseInt($tileset.attr("columns"), 10);

        // 3) Get <image> source (relative path inside TSX)
        var imageSource = $tileset.find("image").attr("source");

        // Compute base path of TSX, so we can resolve the image path:
        //  e.g. if tsxUrl = 'assets/Beach Arrows.tsx' → base = 'assets/'
        var lastSlashIndex = tsxUrl.lastIndexOf("/");
        var basePath =
          lastSlashIndex >= 0 ? tsxUrl.substr(0, lastSlashIndex + 1) : "";
        var imagePath = basePath + imageSource;

        // 4) Find every <tile> that has an <animation> child
        var $tiles = $(xml)
          .find("tile")
          .filter(function () {
            return $(this).find("animation").length > 0;
          });

        // If no animations found, do nothing (or you could show a console warning)
        if ($tiles.length === 0) {
          return;
        }

        // 5) For each animated tile, build its frame list & durations, then create a DIV
        $tiles.each(function () {
          var $tile = $(this);
          var animationFrames = [];
          // Collect each <frame> under <animation>
          $tile.find("animation > frame").each(function () {
            var tileId = parseInt($(this).attr("tileid"), 10);
            var dur = parseInt($(this).attr("duration"), 10);
            animationFrames.push({ tileid: tileId, duration: dur });
          });

          // Create a wrapper DIV for this single animation, float left
          var $animDiv = $("<div>").css({
            margin: "2px",
            float: "left",
            zoom: "200%",
            width: tileWidth + "px",
            height: tileHeight + "px",
            overflow: "hidden",
            "background-image": 'url("' + imagePath + '")',
            "background-repeat": "no-repeat",
          });

          // Append to container
          $(".preview-animated").append($animDiv);

          // Precompute the background-position coordinates for each frame
          var frameBgs = animationFrames.map(function (frame) {
            var id = frame.tileid;
            var cx = (id % columns) * tileWidth;
            var cy = Math.floor(id / columns) * tileHeight;
            // background-position needs negative offsets
            return {
              posX: -cx,
              posY: -cy,
              duration: frame.duration,
            };
          });

          // 6) Start cycling through frames (using recursive setTimeout so durations can vary)
          var idx = 0;
          function showNextFrame() {
            var fb = frameBgs[idx];
            // Move the background so that the correct tile shows
            $animDiv.css(
              "background-position",
              fb.posX + "px " + fb.posY + "px"
            );
            // Schedule next frame
            var nextIndex = (idx + 1) % frameBgs.length;
            setTimeout(function () {
              idx = nextIndex;
              showNextFrame();
            }, fb.duration);
          }
          // Kick off the animation loop
          showNextFrame();
        });
      })
      .fail(function (jqXHR, status, err) {
        console.error("Failed to load TSX:", tsxUrl, status, err);
      });
  }

  /* Arrow Key Navigation */
  $(document).on("keydown", function (e) {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      const $rows = $(`#${currentTab}-content table.file-list tbody tr`);
      let idx = $rows.index($("tr.selected"));
      if (idx < 0) {
        idx = e.key === "ArrowDown" ? -1 : 0;
      }
      const nextIdx =
        e.key === "ArrowDown"
          ? Math.min(idx + 1, $rows.length - 1)
          : Math.max(idx - 1, 0);

      const $nextRow = $rows.eq(nextIdx);
      $nextRow.trigger("click");
      // <-- scroll the newly‐selected row into view
      $nextRow[0].scrollIntoView({ block: "nearest" });

      e.preventDefault();
    }
  });

  /* File Download Function */

  function downloadMultiple(items) {
    const zip = new JSZip();
    const promises = [];
    console.log(items);
    items.forEach((item) => {
      item.files.forEach((filename) => {
        promises.push(
          fetch("files/" + filename)
            .then((response) => response.blob())
            .then((blob) => zip.file(filename, blob))
        );
      });
    });

    Promise.all(promises)
      .then(() => zip.generateAsync({ type: "blob" }))
      .then((content) => saveAs(content, "files.zip"));
  }
  function downloadSingleMusic(filename) {
    console.log(items);
    fetch("music/" + filename)
      .then((response) => response.blob())
      .then((blob) => {
        saveAs(blob, filename);
      })
      .catch((error) => {
        console.error('Error downloading file:', error);
      });
  }
  function downloadMultipleMusic(items) {
    const zip = new JSZip();
    const promises = [];
    console.log(items);
    items.forEach((item) => {
      item.files.forEach((filename) => {
        promises.push(
          fetch("music/" + filename)
            .then((response) => response.blob())
            .then((blob) => zip.file(filename, blob))
        );
      });
    });

    Promise.all(promises)
      .then(() => zip.generateAsync({ type: "blob" }))
      .then((content) => saveAs(content, "music.zip"));
  }
  function downloadMultipleNPC(items) {
    const zip = new JSZip();
    const promises = [];
    console.log(items);
    items.forEach((item) => {
      item.files.forEach((filename) => {
        promises.push(
          fetch("npc/" + filename)
            .then((response) => response.blob())
            .then((blob) => zip.file(filename, blob))
        );
      });
    });

    Promise.all(promises)
      .then(() => zip.generateAsync({ type: "blob" }))
      .then((content) => saveAs(content, "npc.zip"));
  }

  handleHashOnLoad();
});

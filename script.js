$(function () {
  // Ensure localization engine is ready before initializing app logic
  i18n.init().then(() => {
    startApp();    
  });

  function startApp() {
    
    /* Initialize File List and Parameters */
    let currentTab = "tiles";
    let sortField = null;
    let sortAsc = true;
    let currentAudio = null;
    let currentlyPlayingRow = null;
    let isLooping = false;
    const tabsWithoutSelection = ["scripts", "tools"];
    const $tabMenuList = $("#tab-menu-list");
    const $tabMenuItems = $("#tab-menu-list .tab-menu-item");
    const $mainTitle = $(".title-bar .title-bar-text").first();
    const fullTitleText = i18n.t("ui.title");
    const compactTitleText = i18n.t("ui.title_compact");
    const $feedbackLabel = $("#feedback-btn span");
    const fullFeedbackText = i18n.t("ui.feedback_btn");
    const compactFeedbackText = i18n.t("ui.feedback_btn_compact");

    function selectionEnabled(tab = currentTab) {
      return !tabsWithoutSelection.includes(tab);
    }

    // Initialize tabs
    $(".tab").on("click", function () {
      const tab = $(this).data("tab");
      window.location.hash = tab;
      $(".tab").removeClass("active");
      $(this).addClass("active");
      $(".tab-content").removeClass("active");
      $(`#${tab}-content`).addClass("active");
      currentTab = tab;
      setMobileTabActive(tab);

      if (tab === "tiles") {
        $('.filter[data-filter="type"]').removeClass("hidden");
      } else {
        $('.filter[data-filter="type"]').addClass("hidden");
        $('.filter[data-filter="type"] input').prop("checked", false);
        $("#type-both").prop("checked", true);
      }
      if (tab === "tools") {
        $('.filter[data-filter="tooltype"]').removeClass("hidden");
      } else {
        $('.filter[data-filter="tooltype"]').addClass("hidden");
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

      buildFilterOptions();
      renderList();
      applyResponsiveAdjustments();
    });

    $("#tab-menu-button").on("click", function (e) {
      e.stopPropagation();
      $tabMenuList.toggleClass("open");
    });

    $tabMenuItems.on("click", function () {
      const tab = $(this).data("tab");
      $tabMenuList.removeClass("open");
      $(`.tab[data-tab="${tab}"]`).trigger("click");
    });

    $(document).on("click", function (e) {
      if (!$(e.target).closest(".tab-menu-mobile").length) {
        $tabMenuList.removeClass("open");
      }
    });

    function handleHashOnLoad() {
      const hash = window.location.hash.substring(1);
      let tab = null;
      let itemId = null;
      
      try {
        const params = new URLSearchParams(hash);
        tab = params.get("tab");
        itemId = params.get("item");
      } catch (e) {
        tab = hash;
      }
      
      if (!tab && hash) tab = hash;
      
      const validTabs = ["tiles", "backgrounds", "npcs", "music", "scripts", "tools"];
      if (tab && validTabs.includes(tab)) {
        $(`.tab[data-tab="${tab}"]`).trigger("click");
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
          }, 100);
        }
      }
    }

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
      if (!$(e.target).closest(".filter").length) $(".menu-bar .filter").removeClass("open");
    });

    $("#clear-filters").on("click", () => {
      $(".filter[data-filter=game] .dropdown input:checkbox").prop("checked", false);
      $(".filter[data-filter=author] .dropdown input:checkbox").prop("checked", false);
      $(".filter[data-filter=tooltype] .dropdown input:checkbox").prop("checked", false);
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
      $("#modal-overlay").fadeIn(100);
      $("#feedback-modal").fadeIn(100);
    });

    $("#feedback-modal .close-btn").on("click", function () {
      $("#feedback-modal").fadeOut(100);
      $("#modal-overlay").fadeOut(100);
    });

    $("#modal-overlay").on("click", function () {
      $("#feedback-modal").fadeOut(100);
      $("#modal-overlay").fadeOut(100);
    });

    /* Functions to Build Filters */
    function buildFilterOptions() {
      const games = [
        "EXE1/BN1", "EXE2/BN2", "EXE3/BN3", "EXETM/NT", "EXEGP/BCC",
        "EXE4/BN4", "EXE4.5", "EXEPoN", "EXE5/BN5", "EXE6/BN6", "EXELoN",
        "SSR1/SF1", "SSR2/SF2", "SSR3/SF3", "Shanghai", "Custom", "Other"
      ];

      const $game = $(".filter[data-filter=game] .dropdown");
      // Preserve filter state across rebuilds
      const checkedGames = $game.find("input:checked").map((_, el) => el.value).get();

      $game.empty();
      games.forEach((g) => {
        const isChecked = checkedGames.includes(g) ? 'checked' : '';
        $game.append(`<div><input type="checkbox" value="${g}" id="g-${g}" ${isChecked}><label for="g-${g}"> ${i18n.t("ui.game." + g, g)}</label></div>`);
      });

      let currentData;
      if (currentTab === "tiles") currentData = allData;
      else if (currentTab === "backgrounds") currentData = allBackgrounds;
      else if (currentTab === "npcs") currentData = allNPCs;
      else if (currentTab === "music") currentData = allMusic;
      else if (currentTab === "scripts") currentData = allScripts;
      else if (currentTab === "tools") currentData = allTools;

      const authors = [...new Set(currentData.map((x) => x.author))].sort();
      const $auth = $(".filter[data-filter=author] .dropdown");
      $auth.empty();
      authors.forEach((a) => {
        if (!Array.isArray(a)) {
          const id = "a-" + a.replace(/\s+/g, "_");
          $auth.append(`<div><input type="checkbox" value="${a}" id="${id}"><label for="${id}"> ${a}</label></div>`);
        }
      });

      const tooltype = [...new Set(allTools.map((x) => x.tooltype))].sort();
      const $tooltype = $(".filter[data-filter=tooltype] .dropdown");
      $tooltype.empty();
      tooltype.forEach((a) => {
        const id = "tt-" + a.replace(/\s+/g, "_");
        $tooltype.append(`<div><input type="checkbox" value="${a}" id="${id}"><label for="${id}"> ${a}</label></div>`);
      });

      if (currentTab === "tiles") {
        $(".filter[data-filter=tooltype] input").on("change", () => { renderList(); updateClearButton(); });
        $(".filter[data-filter=type] input").on("change", () => { renderList(); updateClearButton(); });
      }

      $(".filter[data-filter=game] input, .filter[data-filter=author] input").on("change", () => {
        renderList();
        updateClearButton();
      });

      $(".dropdown input").on("change", () => {
        renderList();
        updateClearButton();
      });
    }

    function getFilters() {
      const games = $(".filter[data-filter=game] .dropdown input:checked").map((i, e) => e.value).get();
      const type = $(".filter[data-filter=type] .dropdown input:checked").val();
      const authors = $(".filter[data-filter=author] .dropdown input:checked").map((i, e) => e.value).get();
      const tooltype = $(".filter[data-filter=tooltype] .dropdown input:checked").map((i, e) => e.value).get();
      const searchTerm = $("#search-input").val().toLowerCase();
      return { games, type, authors, tooltype, searchTerm };
    }

    function updateClearButton() {
      const { games, type, authors, tooltype, searchTerm } = getFilters();
      const any = games.length > 0 || authors.length > 0 || tooltype.length > 0 || type !== "both" || searchTerm !== "";
      $("#clear-filters").prop("disabled", !any);
    }

    function setMobileTabActive(tab) {
      $tabMenuItems.removeClass("active");
      $tabMenuItems.filter(`[data-tab="${tab}"]`).addClass("active");
    }

    function applyResponsiveAdjustments() {
      const isNarrow = window.innerWidth < 800;
      if (isNarrow) {
        $mainTitle.text(compactTitleText);
        $feedbackLabel.text(compactFeedbackText);
        setMobileTabActive(currentTab);
      } else {
        $mainTitle.text(fullTitleText);
        $feedbackLabel.text(fullFeedbackText);
      }
    }

    function updateDownloadSelectedVisibility(supportsSelection = selectionEnabled()) {
      const $downloadBtn = $("#download-selected");
      if (supportsSelection) {
        $downloadBtn.show();
        $downloadBtn.prop("disabled", $(".sel:checked").length === 0);
      } else {
        $downloadBtn.hide().prop("disabled", true);
      }
    }

    /* Functions to Render File Lists and File Previews */
    function renderList() {
      const { games, type, authors, tooltype, searchTerm } = getFilters();
      const supportsSelection = selectionEnabled();
      let currentData;

      if (currentTab === "tiles") currentData = allData;
      else if (currentTab === "backgrounds") currentData = allBackgrounds;
      else if (currentTab === "npcs") currentData = allNPCs;
      else if (currentTab === "music") currentData = allMusic;
      else if (currentTab === "scripts") currentData = allScripts;
      else if (currentTab === "tools") currentData = allTools;

      if (games.includes("EXE1/BN1")) games.push("EXEOSS");
      if (games.includes("EXE5/BN5")) games.push("EXE5DS/BN5DS");
      if (games.includes("Other")) { games.push("#COMPASS"); games.push("#COMPASS:LA"); }

      let rows = currentData.filter((item) => {
        if (games.length && !games.includes(item.game) && currentTab !== "scripts" && currentTab !== "tools") return false;
        if (authors.length && !authors.includes(item.author)) return false;
        if (tooltype.length && !tooltype.includes(item.tooltype) && currentTab == "tools") return false;
        if (type !== "both" && item.type !== type && currentTab !== "music" && currentTab !== "scripts" && currentTab !== "tools") return false;
        if (searchTerm && !item.name.toLowerCase().includes(searchTerm)) return false;
        return true;
      });

      if (currentTab == "scripts" && sortField == "game") sortField = "scripttype";
      else if (currentTab == "tools" && sortField == "game") sortField = "tooltype";

      if (sortField) {
        rows.sort((a, b) => {
          const av = Array.isArray(a[sortField]) ? a[sortField].join(", ") : a[sortField];
          const bv = Array.isArray(b[sortField]) ? b[sortField].join(", ") : b[sortField];
          let avLower = String(av).toLowerCase();
          let bvLower = String(bv).toLowerCase();
          if (avLower == "custom") avLower = "zcustom";
          if (avLower == "other") avLower = "yother";
          if (bvLower == "custom") bvLower = "zcustom";
          if (bvLower == "other") bvLower = "yother";
          return ((avLower < bvLower ? -1 : avLower > bvLower ? 1 : 0) * (sortAsc ? 1 : -1));
        });
      }

      const $tb = $(`#${currentTab}-content table.file-list tbody`).empty();
      const selectionCell = supportsSelection ? '<td><input type="checkbox" class="sel"/></td>' : '';

      if (currentTab === "music") {
        rows.forEach((it, index) => {
          $tb.append(`<tr data-item-id="${it.id || index}">
            ${selectionCell}
            <td><button class="music-play-btn">▶</button></td>
            <td>${i18n.getLocalized(it, "name")}</td>
            <td>${i18n.getLocalized(it, "ostname")}</td>
            <td>${i18n.getLocalized(it, "game")}</td>
            <td>${Array.isArray(it.author) ? `<i>${i18n.t("ui.table.multi_author")}</i>` : i18n.getLocalized(it, "author")}</td>
          </tr>`);
        });
      } else if (currentTab === "scripts") {
        rows.forEach((it, index) => {
          $tb.append(`<tr data-item-id="${it.id || index}">
            <td>${i18n.getLocalized(it, "name")}</td>
            <td>${i18n.getLocalized(it, "scripttype")}</td>
            <td>${Array.isArray(it.author) ? `<i>${i18n.t("ui.table.multi_author")}</i>` : i18n.getLocalized(it, "author")}</td>
          </tr>`);
        });
      } else if (currentTab === "tools") {
        rows.forEach((it, index) => {
          $tb.append(`<tr data-item-id="${it.id || index}">
            <td>${i18n.getLocalized(it, "name")}</td>
            <td>${i18n.getLocalized(it, "tooltype")}</td>
            <td>${Array.isArray(it.author) ? `<i>${i18n.t("ui.table.multi_author")}</i>` : i18n.getLocalized(it, "author")}</td>
          </tr>`);
        });
      } else {
        rows.forEach((it, index) => {
          $tb.append(`<tr data-item-id="${it.id || index}">
            ${selectionCell}
            <td>${i18n.getLocalized(it, "name")}</td>
            <td>${i18n.getLocalized(it, "game")}</td>
            <td>${Array.isArray(it.author) ? `<i>${i18n.t("ui.table.multi_author")}</i>` : i18n.getLocalized(it, "author")}</td>
          </tr>`);
        });
      }

      // Set up row click handlers
      if (currentTab === "music") {
        $(`#${currentTab}-content table.file-list tbody tr`).on("click", function (e) {
          $("#play-btn").text("▶");
          if ($(e.target).hasClass("music-play-btn") || $(e.target).hasClass("sel")) return;
          $("table.file-list tr").removeClass("selected");
          $(this).addClass("selected");
          const itemId = $(this).data("item-id");
          const params = new URLSearchParams();
          params.set("tab", currentTab);
          params.set("item", itemId);
          window.location.hash = params.toString();
          showMusicPreview(rows[$(this).index()]);
        });

        $(`#${currentTab}-content .music-play-btn`).on("click", function (e) {
          e.stopPropagation();
          const $row = $(this).closest("tr");
          const index = $row.index();
          const item = rows[index];

          if (currentlyPlayingRow && currentlyPlayingRow[0] === $row[0]) {
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
        $(`#${currentTab}-content table.file-list tbody tr`).on("click", function (e) {
          if (e.target.type === "checkbox") return;
          $("table.file-list tr").removeClass("selected");
          $(this).addClass("selected");
          const itemId = $(this).data("item-id");
          const params = new URLSearchParams();
          params.set("tab", currentTab);
          params.set("item", itemId);
          window.location.hash = params.toString();
          showInfoPreview(rows[$(this).index()]);
        });
      } else if (currentTab === "tiles") {
        $(`#${currentTab}-content table.file-list tbody tr`).on("click", function (e) {
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
        });
      } else if (currentTab === "backgrounds") {
        $(`#${currentTab}-content table.file-list tbody tr`).on("click", function (e) {
          if (e.target.type === "checkbox") return;
          $("table.file-list tr").removeClass("selected");
          $(this).addClass("selected");
          const itemId = $(this).data("item-id");
          const params = new URLSearchParams();
          params.set("tab", currentTab);
          params.set("item", itemId);
          window.location.hash = params.toString();
          showBackgroundPreview(rows[$(this).index()]);
        });
      } else if (currentTab === "npcs") {
        $(`#${currentTab}-content table.file-list tbody tr`).on("click", function (e) {
          if (e.target.type === "checkbox") return;
          $("table.file-list tr").removeClass("selected");
          $(this).addClass("selected");
          const itemId = $(this).data("item-id");
          const params = new URLSearchParams();
          params.set("tab", currentTab);
          params.set("item", itemId);
          window.location.hash = params.toString();
          showNPCPreview(rows[$(this).index()]);
        });
      }

      if (supportsSelection) {
        $(".sel").on("change", () => updateDownloadSelectedVisibility(supportsSelection));
        $("#download-selected").off().on("click", () => {
          const checked = $(".sel:checked").closest("tr").map((i, tr) => rows[$(tr).index()]).get();
          downloadMultiple(checked);
        });
      } else {
        $("#download-selected").off();
      }

      // reset preview based on current tab
      if (currentTab === "tiles") {
        $(".preview-animated").empty();
        $("#preview-image").attr("src", "");
        $("#detail-author,#detail-game").text("—");
        $("#download-single").prop("disabled", true).off();
      } else if (currentTab === "backgrounds") {
        $("#preview-image-bg").empty();
        $("#detail-author-bg,#detail-game-bg,#detail-velx-bg,#detail-vely-bg").text("—");
        $("#download-single-bg").prop("disabled", true).off();
      } else if (currentTab === "npcs") {
        $("#preview-image-npc").empty();
        $("#detail-author-npc,#detail-game-npc").text("—");
        $("#download-single-npc").prop("disabled", true).off();
      } else if (currentTab === "music") {
        if (currentAudio) { currentAudio.pause(); currentAudio = null; }
        $("#detail-author-music,#detail-game-music").text("—");
        $("#download-single-music").prop("disabled", true).off();
        $("#current-time, #duration").text(i18n.t("ui.music.time_format"));
        $("#audio-timeline").val(0);
      } else if (currentTab === "scripts") {
        $("#script-details").empty();
      } else if (currentTab === "tools") {
        $("#tool-details").empty();
      }
      updateDownloadSelectedVisibility(supportsSelection);
    }

    function showPreview(item) {
      $(".preview-animated").empty();
      const imgPath = "files/" + item.preview;
      const tsxPath = imgPath.replace(".png", ".tsx");
      animateTSX(tsxPath, ".preview-animated");
      $("#preview-image").attr("src", imgPath).css({ transform: "" });
      $("#detail-author").text(i18n.getLocalized(item, "author"));
      $("#detail-game").text(i18n.getLocalized(item, "game"));
      $("#download-single").prop("disabled", false).off().on("click", () => downloadMultiple([item]));
    }

    function showInfoPreview(item) {
      let detailsHtml = "";
      if (currentTab === "scripts") {
        detailsHtml = `
            <p><strong>${i18n.t("ui.table.name")}:</strong> ${i18n.getLocalized(item, "name")}</p>
            <p><strong>${i18n.t("ui.table.author")}:</strong> ${i18n.getLocalized(item, "author")}</p>
            <p><strong>${i18n.t("ui.table.description")}:</strong> ${i18n.getLocalized(item, "description")}</p>`;
      } else if (currentTab === "tools") {
        detailsHtml = `
            <p><strong>${i18n.t("ui.table.name")}:</strong> ${i18n.getLocalized(item, "name")}</p>
            <p><strong>${i18n.t("ui.table.author")}:</strong> ${i18n.getLocalized(item, "author")}</p>
            ${item.repository ? `<p><strong>${i18n.t("ui.table.repo")}:</strong> <a href="${item.repository}" target="_blank">${item.repository}</a></p>` : ''}
            <p><strong>${i18n.t("ui.table.description")}:</strong> ${i18n.getLocalized(item, "description")}</p>`;
      }
      if (currentTab === "scripts") $("#script-details").html(detailsHtml);
      else if (currentTab === "tools") $("#tool-details").html(detailsHtml);
      $(".preview-scrollable").scrollTop(0);
    }

    function showNPCPreview(item) {
      const imgPath = "npc/" + item.preview;
      $("#preview-image-npc").empty();
      $("#detail-author-npc").text(i18n.getLocalized(item, "author"));
      $("#detail-game-npc").text(i18n.getLocalized(item, "game"));
      previewNPCAnimation("npc/" + item.preview);
      $("#download-single-npc").prop("disabled", false).off().on("click", () => downloadMultipleNPC([item]));
    }

    function previewNPCAnimation(animationUrl) {
      $("#preview-image-npc").empty();
      $.get(animationUrl, function (text) {
        const lines = text.split("\n");
        let spriteSrc = "";
        const animations = {};
        let currentState = null;
        const attrRegex = /(\w+)="([^"]+)"/g;

        lines.forEach((rawLine) => {
          const line = rawLine.trim();
          if (!line) return;
          if (line.startsWith("imagePath=")) {
            const m = /imagePath="([^"]+)"/.exec(line);
            if (m) spriteSrc = m[1];
          } else if (line.startsWith("animation state=")) {
            const attrs = {};
            let match;
            while ((match = attrRegex.exec(line)) !== null) attrs[match[1]] = match[2];
            if (attrs.state) { currentState = attrs.state; animations[currentState] = []; }
          } else if (line.startsWith("frame ") && currentState) {
            const attrs = {};
            let match;
            while ((match = attrRegex.exec(line)) !== null) attrs[match[1]] = match[2];
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

        if (!spriteSrc) { console.error("⚠️ previewNPCAnimation: no imagePath found in", animationUrl); return; }

        const spriteImg = new Image();
        spriteImg.onload = function () {
          Object.keys(animations).forEach((stateName) => {
            flip = false;
            const frames = animations[stateName];
            if (!frames.length) return;
            let maxOriginX = 0, maxOriginY = 0, maxRight = 0, maxBelow = 0;
            frames.forEach((f) => {
              if (f.flipx) flip = true;
              if (f.originx > maxOriginX) maxOriginX = f.originx;
              if (f.originy > maxOriginY) maxOriginY = f.originy;
              if (f.w - f.originx > maxRight) maxRight = f.w - f.originx;
              if (f.h - f.originy > maxBelow) maxBelow = f.h - f.originy;
            });
            const containerW = maxOriginX + maxRight;
            const containerH = maxOriginY + maxBelow;
            const $container = $("<div>")
              .css({
                position: "relative", width: containerW * 2 + "px", height: containerH * 2 + "px",
                overflow: "visible", display: "inline-block", verticalAlign: "bottom", margin: "8px",
                ...(flip ? { transform: "scaleX(-1)" } : {})
              })
              .attr("data-state", stateName);

            const $mask = $("<div>").css({
              position: "absolute", top: "0px", left: "0px", width: "0px", height: "0px", overflow: "hidden"
            });
            const $img = $(spriteImg).clone().css({
              position: "absolute", top: "0px", left: "0px", width: spriteImg.width + "px", height: spriteImg.height + "px"
            });
            $mask.append($img);
            $container.append($mask);
            $("#preview-image-npc").append($container);

            (function animateState($maskEl, $imgEl, framesArray, maxOX, maxOY) {
              let idx = 0;
              function showNextFrame() {
                const f = framesArray[idx];
                $maskEl.css({ width: f.w * 2 + "px", height: f.h * 2 + "px" });
                $maskEl.css({ top: (maxOY - f.originy) * 2 + "px", left: (maxOX - f.originx) * 2 + "px" });
                $imgEl.css({ top: -f.y + "px", left: -f.x + "px" });
                idx = (idx + 1) % framesArray.length;
                setTimeout(showNextFrame, f.duration * 1000);
              }
              showNextFrame();
            })($mask, $img, frames, maxOriginX, maxOriginY);
          });
        };
        spriteImg.src = "npc/" + spriteSrc;
      }).fail(function () { console.error("⚠️ previewNPCAnimation: failed to load", animationUrl); });
    }

    let imageWidth = 0, imageHeight = 0, animationFrames = [], currentFrameIndex = 0, lastFrameTime = 0;
    let frameDuration = 0, spriteWidth = 0, spriteHeight = 0, xVelocity = 0, yVelocity = 0;
    let xOffset = 0, yOffset = 0, animationId = null, spriteImage = null, container = null;

    function createAnimatedBackground(item) {
      xVelocity = item.velx;
      yVelocity = item.vely;
      if (animationId) { cancelAnimationFrame(animationId); animationId = null; }
      container = currentTab === "npcs" ? $("#preview-image-npc") : $("#preview-image-bg");
      container.empty();
      const animationFile = item.files.find(f => f.endsWith('.animation'));
      const pngFile = item.files.find(f => f.endsWith('.png'));
      fetch("files/" + animationFile)
        .then((response) => response.text())
        .then((data) => { parseAnimationFile(data); return pngFile; })
        .then(loadSpriteImage)
        .catch((error) => console.error("Error:", error));
    }

    function parseAnimationFile(data) {
      imageWidth = 0; imageHeight = 0; animationFrames = []; currentFrameIndex = 0; lastFrameTime = 0;
      const lines = data.split("\n");
      const attrRegex = /(\w+)\s*=\s*"([^"]*)"/g;
      for (const line of lines) {
        if (line.trim().startsWith("frame ")) {
          const frameAttrs = {};
          let m;
          while ((m = attrRegex.exec(line)) !== null) frameAttrs[m[1]] = m[2];
          animationFrames.push({
            duration: parseFloat(frameAttrs.duration),
            x: parseInt(frameAttrs.x, 10), y: parseInt(frameAttrs.y, 10),
            w: parseInt(frameAttrs.w, 10), h: parseInt(frameAttrs.h, 10),
            originx: parseInt(frameAttrs.originx, 10), originy: parseInt(frameAttrs.originy, 10),
            flipx: frameAttrs.flipx !== undefined ? parseInt(frameAttrs.flipx, 10) : 0,
            flipy: frameAttrs.flipy !== undefined ? parseInt(frameAttrs.flipy, 10) : 0,
          });
        }
      }
      if (animationFrames.length === 0) throw new Error("No animation frames found in file");
      spriteWidth = animationFrames[0].w;
      spriteHeight = animationFrames[0].h;
      if (currentTab === "backgrounds") {
        xVelocity = (xVelocity * -1 * 200 * spriteWidth) / 120;
        yVelocity = (yVelocity * -1 * 200 * spriteHeight) / 120;
      } else { xVelocity = 0; yVelocity = 0; }
      frameDuration = animationFrames[0].duration;
    }

    function loadSpriteImage(imagePath) {
      return new Promise((resolve, reject) => {
        spriteImage = new Image();
        spriteImage.onload = () => { createTiles(); resolve(); };
        spriteImage.onerror = () => reject(new Error("Failed to load sprite image"));
        spriteImage.src = currentTab === "npcs" ? "npc/" + imagePath : "files/" + imagePath;
      });
    }

    function createTiles() {
      const containerWidth = container.width();
      const containerHeight = container.height();
      const tilesX = Math.ceil(containerWidth / spriteWidth) + 2;
      const tilesY = Math.ceil(containerHeight / spriteHeight) + 2;
      for (let y = -1; y < tilesY; y++) {
        for (let x = -1; x < tilesX; x++) {
          const tile = $('<div class="tile"></div>');
          tile.css({
            "--sprite-sheet": `url(${spriteImage.src})`, "--sprite-w": `${spriteWidth}px`,
            "--sprite-h": `${spriteHeight}px`, left: `${x * spriteWidth}px`, top: `${y * spriteHeight}px`
          });
          container.append(tile);
        }
      }
      lastFrameTime = performance.now();
      animationId = requestAnimationFrame(animate);
    }

    function animate(timestamp) {
      if (currentTab === "npcs") {
        const deltaTime = (timestamp - lastFrameTime) / 1000;
        lastFrameTime = timestamp;
        frameDuration -= deltaTime;
        if (frameDuration <= 0) {
          currentFrameIndex = (currentFrameIndex + 1) % animationFrames.length;
          const frame = animationFrames[currentFrameIndex];
          frameDuration = frame.duration;
          $(".tile").css("--sprite-pos", `-${frame.x}px -${frame.y}px`);
        }
        const containerWidth = container.width();
        const containerHeight = container.height();
        $(".tile").css({ left: `${(containerWidth - spriteWidth) / 2}px`, top: `${(containerHeight - spriteHeight) / 2}px` });
        animationId = requestAnimationFrame(animate);
        return;
      }
      const deltaTime = (timestamp - lastFrameTime) / 1000;
      lastFrameTime = timestamp;
      frameDuration -= deltaTime;
      if (frameDuration <= 0) {
        currentFrameIndex = (currentFrameIndex + 1) % animationFrames.length;
        const frame = animationFrames[currentFrameIndex];
        frameDuration = frame.duration;
        $(".tile").css("--sprite-pos", `-${frame.x}px -${frame.y}px`);
      }
      xOffset = (xOffset + xVelocity * deltaTime) % spriteWidth;
      yOffset = (yOffset + yVelocity * deltaTime) % spriteHeight;
      const containerWidth = container.width();
      const containerHeight = container.height();
      const tilesX = Math.ceil(containerWidth / spriteWidth) + 2;
      const tilesY = Math.ceil(containerHeight / spriteHeight) + 2;
      let tileIndex = 0;
      for (let y = -1; y < tilesY; y++) {
        for (let x = -1; x < tilesX; x++) {
          const tile = $(".tile").eq(tileIndex);
          tile.css({ left: `${x * spriteWidth - xOffset}px`, top: `${y * spriteHeight - yOffset}px` });
          tileIndex++;
        }
      }
      animationId = requestAnimationFrame(animate);
    }

    function showBackgroundPreview(item) {
      const imgPath = "files/" + item.preview;
      $("#detail-author-bg").text(i18n.getLocalized(item, "author"));
      $("#detail-game-bg").text(i18n.getLocalized(item, "game"));
      $("#detail-velx-bg").text(item.velx !== undefined ? item.velx : "—");
      $("#detail-vely-bg").text(item.vely !== undefined ? item.vely : "—");
      createAnimatedBackground(item);
      $("#download-single-bg").prop("disabled", false).off().on("click", () => downloadMultiple([item]));
    }

    let currentVolume = 1, slideshowInterval = null;
    function showMusicPreview(item) {
      if (slideshowInterval) { clearInterval(slideshowInterval); slideshowInterval = null; }
      if (currentAudio) { currentAudio.pause(); $("#disc-image").css({ "animation-play-state": "paused" }); currentAudio = null; }
      
      if (item.disc) {
        $("#disc-image").attr("src", "img/disc/" + item.disc).css({ display: "" });
      } else {
        $("#disc-image").css({ display: "none" });
      }
      
      if (item.gameimage) {
        const $container = $("#game-image-container").empty();
        if (Array.isArray(item.gameimage)) {
          item.gameimage.forEach((img, index) => {
            $container.append($('<img>').attr('src', 'img/logo/' + img).css('opacity', index === 0 ? 1 : 0).addClass(index === 0 ? 'active' : ''));
          });
          let currentIndex = 0;
          slideshowInterval = setInterval(() => {
            const $images = $container.find('img');
            $images.removeClass('active');
            $images.eq(currentIndex).css('opacity', 0);
            currentIndex = (currentIndex + 1) % item.gameimage.length;
            setTimeout(() => { $images.eq(currentIndex).css('opacity', 1).addClass('active'); }, 50);
          }, 2000);
        } else {
          $container.append($('<img>').attr('src', 'img/logo/' + item.gameimage).css('opacity', 1).addClass('active'));
        }
      } else {
        $("#game-image-container").empty();
      }

      $("#detail-title-music").text(i18n.getLocalized(item, "name"));
      $("#detail-author-music").text(i18n.getLocalized(item, "author"));
      $("#detail-game-music").text(Array.isArray(i18n.getLocalized(item, "game")) ? i18n.getLocalized(item, "game").join(", ") : i18n.getLocalized(item, "game"));
      $("#detail-loopstart-music").text(item.start);
      $("#detail-loopend-music").text(item.stop);
      $("#detail-places-music").text(i18n.getLocalized(item, "places"));
      $("#detail-ostname-music").text(i18n.getLocalized(item, "ostname"));
      $("#detail-composer-music").text(Array.isArray(i18n.getLocalized(item, "composer")) ? i18n.getLocalized(item, "composer").join(", ") : i18n.getLocalized(item, "composer"));
      
      $("#download-single-music").prop("disabled", false).off().on("click", () => downloadMultipleMusic([item]));
      $("#current-time").text(i18n.t("ui.music.time_format"));
      $("#duration").text(item.duration);
      file_duration = item.duration;
      const audioPath = "music/" + item.files[0];
      currentAudio = new Audio(audioPath);
      currentAudio.loopStart = item.start * 0.001;
      currentAudio.loopEnd = item.stop * 0.001;
      let loopStart = currentAudio.loopStart || 0;
      let loopEnd = currentAudio.loopEnd || currentAudio.duration;
      currentAudio.volume = currentVolume;

      $("#volume-slider").off().on("input", function () {
        currentVolume = $(this).val() / 100;
        if (currentAudio) currentAudio.volume = currentVolume;
      });
      $("#volume-slider").val(currentVolume * 100);

      $("#play-btn").off().on("click", function () {
        if (currentAudio.paused) {
          currentAudio.play();
          $(this).text("❚❚");
          $("#disc-image").css({ "animation-play-state": "running" });
          $("#play-btn").text("❚❚");
          if (currentlyPlayingRow) currentlyPlayingRow.find(".music-play-btn").text("❚❚");
        } else {
          currentAudio.pause();
          $(this).text("▶");
          $("#disc-image").css({ "animation-play-state": "paused" });
          $("#play-btn").text("▶");
          if (currentlyPlayingRow) currentlyPlayingRow.find(".music-play-btn").text("▶");
        }
      });

      $("#toggleLoop").off().on("click", function () {
        isLooping = !isLooping;
        $(this).text(isLooping ? i18n.t("ui.music.loop.disable") : i18n.t("ui.music.loop.enable"));
      });

      currentAudio.addEventListener("timeupdate", function () {
        const currentTime = formatTime(currentAudio.currentTime);
        $("#current-time").text(currentTime);
        const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
        $("#audio-timeline").val(progress || 0);
        if (isLooping && loopEnd > 0 && currentAudio.currentTime >= loopEnd) {
          currentAudio.currentTime = loopStart;
          currentAudio.play();
        }
      });

      $("#audio-timeline").off().on("input", function () {
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
          if (currentlyPlayingRow) currentlyPlayingRow.find(".music-play-btn").text("▶");
        }
      });
    }

    function formatTime(seconds) {
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }

    function animateTSX(tsxUrl, containerSelector) {
      $(".preview-animated").empty();
      $.ajax({ url: tsxUrl, dataType: "xml" })
        .done(function (xml) {
          var $tileset = $(xml).find("tileset").first();
          var tileWidth = parseInt($tileset.attr("tilewidth"), 10);
          var tileHeight = parseInt($tileset.attr("tileheight"), 10);
          var columns = parseInt($tileset.attr("columns"), 10);
          var imageSource = $tileset.find("image").attr("source");
          var lastSlashIndex = tsxUrl.lastIndexOf("/");
          var basePath = lastSlashIndex >= 0 ? tsxUrl.substr(0, lastSlashIndex + 1) : "";
          var imagePath = basePath + imageSource;
          var $tiles = $(xml).find("tile").filter(function () { return $(this).find("animation").length > 0; });
          if ($tiles.length === 0) return;
          $tiles.each(function () {
            var $tile = $(this);
            var animationFrames = [];
            $tile.find("animation > frame").each(function () {
              var tileId = parseInt($(this).attr("tileid"), 10);
              var dur = parseInt($(this).attr("duration"), 10);
              animationFrames.push({ tileid: tileId, duration: dur });
            });
            var $animDiv = $("<div>").css({
              margin: "2px", float: "left", zoom: "200%", width: tileWidth + "px", height: tileHeight + "px",
              overflow: "hidden", "background-image": 'url("' + imagePath + '")', "background-repeat": "no-repeat"
            });
            $(".preview-animated").append($animDiv);
            var frameBgs = animationFrames.map(function (frame) {
              var id = frame.tileid;
              var cx = (id % columns) * tileWidth;
              var cy = Math.floor(id / columns) * tileHeight;
              return { posX: -cx, posY: -cy, duration: frame.duration };
            });
            var idx = 0;
            function showNextFrame() {
              var fb = frameBgs[idx];
              $animDiv.css("background-position", fb.posX + "px " + fb.posY + "px");
              var nextIndex = (idx + 1) % frameBgs.length;
              setTimeout(function () { idx = nextIndex; showNextFrame(); }, fb.duration);
            }
            showNextFrame();
          });
        })
        .fail(function (jqXHR, status, err) { console.error("Failed to load TSX:", tsxUrl, status, err); });
    }

    $(document).on("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        const $rows = $(`#${currentTab}-content table.file-list tbody tr`);
        let idx = $rows.index($("tr.selected"));
        if (idx < 0) idx = e.key === "ArrowDown" ? -1 : 0;
        const nextIdx = e.key === "ArrowDown" ? Math.min(idx + 1, $rows.length - 1) : Math.max(idx - 1, 0);
        const $nextRow = $rows.eq(nextIdx);
        $nextRow.trigger("click");
        $nextRow[0].scrollIntoView({ block: "nearest" });
        e.preventDefault();
      }
    });

    function downloadMultiple(items) {
      const zip = new JSZip();
      const promises = [];
      items.forEach((item) => {
        item.files.forEach((filename) => {
          promises.push(fetch("files/" + filename).then((response) => response.blob()).then((blob) => zip.file(filename, blob)));
        });
      });
      Promise.all(promises).then(() => zip.generateAsync({ type: "blob" })).then((content) => saveAs(content, "files.zip"));
    }

    function downloadSingleMusic(filename) {
      fetch("music/" + filename).then((response) => response.blob()).then((blob) => saveAs(blob, filename)).catch((error) => console.error('Error downloading file:', error));
    }

    function downloadMultipleMusic(items) {
      const zip = new JSZip();
      const promises = [];
      items.forEach((item) => {
        item.files.forEach((filename) => {
          promises.push(fetch("music/" + filename).then((response) => response.blob()).then((blob) => zip.file(filename, blob)));
        });
      });
      Promise.all(promises).then(() => zip.generateAsync({ type: "blob" })).then((content) => saveAs(content, "music.zip"));
    }

    function downloadMultipleNPC(items) {
      const zip = new JSZip();
      const promises = [];
      items.forEach((item) => {
        item.files.forEach((filename) => {
          promises.push(fetch("npc/" + filename).then((response) => response.blob()).then((blob) => zip.file(filename, blob)));
        });
      });
      Promise.all(promises).then(() => zip.generateAsync({ type: "blob" })).then((content) => saveAs(content, "npc.zip"));
    }

    // Hook for dynamic content refresh on language change
    window.onI18nLanguageChange = function(lang) {
      const $selectedRow = $("tr.selected");
      const itemId = $selectedRow.length ? $selectedRow.data("item-id") : null;
      
      renderList();
      buildFilterOptions(); // Rebuilds dropdown with new labels

      if (itemId !== null) {
        const $newRow = $(`#${currentTab}-content table.file-list tbody tr[data-item-id="${itemId}"]`);
        if ($newRow.length > 0) {
          $newRow.trigger("click");
        }
      }
    };
    handleHashOnLoad();
    applyResponsiveAdjustments();
    $(window).on("resize", applyResponsiveAdjustments);
  }
});

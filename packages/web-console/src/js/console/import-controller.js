/*******************************************************************************
 *     ___                  _   ____  ____
 *    / _ \ _   _  ___  ___| |_|  _ \| __ )
 *   | | | | | | |/ _ \/ __| __| | | |  _ \
 *   | |_| | |_| |  __/\__ \ |_| |_| | |_) |
 *    \__\_\\__,_|\___||___/\__|____/|____/
 *
 *  Copyright (c) 2014-2019 Appsicle
 *  Copyright (c) 2019-2022 QuestDB
 *
 *  Licensed under the Apache License, Version 2.0 (the "License");
 *  you may not use this file except in compliance with the License.
 *  You may obtain a copy of the License at
 *
 *  http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 *
 ******************************************************************************/

import $ from "jquery"

function setHeight(element, height) {
  element.css("height", height + "px")
}

let upperHalfHeight = 515
function resize() {
  const footer = $(".footer")
  const importTopPanel = $("#import-top")
  const importDetail = $("#import-detail")
  const importMenu = $("#import-menu")[0]
  const h = $(window)[0].innerHeight
  const footerHeight = footer.offsetHeight

  setHeight(importTopPanel, upperHalfHeight)
  setHeight(
    importDetail,
    h - footerHeight - upperHalfHeight - importMenu.offsetHeight - 50,
  )
}

function splitterResize(x, p) {
  upperHalfHeight += p
  $(window).trigger("resize")
}

export function setupImportController(bus) {
  $(window).bind("resize", resize)

  $("#dragTarget").dropbox(bus)
  $("#import-file-list").importManager(bus)
  $("#import-detail").importEditor(bus)

  bus.on("splitter.import.resize", splitterResize)
}

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

import React, { useEffect } from "react"
import styled from "styled-components"
import { BusEvent } from "../../consts"
import Footer from "../Footer"
import Console from "../Console"
import Import from "../Import"
import News from "../News"
import SideMenu from "../SideMenu"
import { QuestProvider } from "../../providers"
import { useSelector } from "react-redux"
import { selectors } from "../../store"

const Page = styled.div`
  display: flex;
  width: 100%;
  height: calc(100% - 4rem);
  flex-direction: column;
  flex: 1;
  overflow: hidden;
  font-size: 1.4rem;
  background: #21222c;

  ::selection {
    background: #44475a;
  }
`

const Root = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
`

const Main = styled.div<{ sideOpened: boolean }>`
  flex: 1;
  width: ${({ sideOpened }) => (sideOpened ? "calc(100% - 50rem)" : "100%")};
`

const Drawer = styled.div`
  background: ${({ theme }) => theme.color.backgroundDarker};
`

const Layout = () => {
  const activePanel = useSelector(selectors.console.getActivePanel)

  useEffect(() => {
    window.bus.trigger(BusEvent.REACT_READY)
  }, [])

  return (
    <QuestProvider>
      <Root>
        <Main sideOpened={activePanel === "news"}>
          <Page
            style={{
              display:
                activePanel === "console" || activePanel === "news"
                  ? "flex"
                  : "none",
            }}
          >
            <Console />
          </Page>

          <Page style={{ display: activePanel === "import" ? "flex" : "none" }}>
            <Import />
          </Page>
        </Main>

        <Drawer id="side-panel-right" />
      </Root>

      <SideMenu />

      <Footer />
    </QuestProvider>
  )
}

export default Layout

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

import React, { MouseEvent, ReactNode, useCallback } from "react"
import styled from "styled-components"
import { Rocket } from "@styled-icons/boxicons-regular"
import { SortDown } from "@styled-icons/boxicons-regular"
import { RightArrow } from "@styled-icons/boxicons-regular"
import { CheckboxBlankCircle } from "@styled-icons/remix-line"
import { ExclamationOctagon } from "@styled-icons/bootstrap"
import { ExclamationTriangle } from "@styled-icons/bootstrap"
import { CodeSSlash } from "@styled-icons/remix-line"
import { Information } from "@styled-icons/remix-line"
import { Table as TableIcon } from "@styled-icons/remix-line"
import { FileList, PieChart } from "@styled-icons/remix-line"
import type { TreeNodeKind } from "../../../components/Tree"

import {
  SecondaryButton,
  Text,
  TransitionDuration,
  IconWithTooltip,
} from "../../../components"
import type { TextProps } from "../../../components"
import { color } from "../../../utils"
import { useEditor } from "../../../providers"

type Props = Readonly<{
  className?: string
  designatedTimestamp?: string
  description?: string
  expanded?: boolean
  indexed?: boolean
  kind: TreeNodeKind
  name: string
  onClick?: (event: MouseEvent) => void
  partitionBy?: string
  walEnabled?: boolean
  suffix?: ReactNode
  tooltip?: boolean
  type?: string
  tableSuspended?: boolean
  txnOffset?: number
}>

const Type = styled(Text)`
  margin-right: 1rem;
  flex: 0;
  transition: opacity ${TransitionDuration.REG}ms;
`

const Title = styled(Text)<TextProps & { kind: TreeNodeKind }>`
  cursor: ${({ kind }) =>
    ["folder", "table"].includes(kind) ? "pointer" : "initial"};
`

const PlusButton = styled(SecondaryButton)<Pick<Props, "tooltip">>`
  position: absolute;
  right: ${({ tooltip }) => (tooltip ? "3rem" : "1rem")};
  margin-left: 1rem;
  opacity: 0;
`

const Wrapper = styled.div<Pick<Props, "expanded">>`
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 0.5rem 0;
  padding-left: 1rem;
  transition: background ${TransitionDuration.REG}ms;

  &:hover
    ${/* sc-selector */ PlusButton},
    &:active
    ${/* sc-selector */ PlusButton} {
    opacity: 1;
  }

  &:hover,
  &:active {
    background: ${color("selection")};
  }

  &:hover ${/* sc-selector */ Type} {
    opacity: 0;
  }
`

const FlexRow = styled.div`
  display: flex;
  align-items: center;
`

const Spacer = styled.span`
  flex: 1;
`

const InfoIcon = styled(Information)`
  color: ${color("purple")};
`

const RocketIcon = styled(Rocket)`
  color: ${color("orange")};
  margin-right: 1rem;
`

const SortDownIcon = styled(SortDown)`
  color: ${color("green")};
  margin-right: 0.8rem;
`

const RightArrowIcon = styled(RightArrow)`
  color: ${color("gray2")};
  margin-right: 0.8rem;
  cursor: pointer;
`

const DownArrowIcon = styled(RightArrowIcon)`
  transform: rotateZ(90deg);
`

const DotIcon = styled(CheckboxBlankCircle)`
  color: ${color("gray2")};
  margin-right: 1rem;
`

const TitleIcon = styled(TableIcon)`
  min-height: 18px;
  min-width: 18px;
  margin-right: 1rem;
  color: ${color("cyan")};
`

const InfoIconWrapper = styled.div`
  display: flex;
  padding: 0 1rem;
  align-items: center;
  justify-content: center;
`

const PartitionByWrapper = styled.div`
  margin-right: 1rem;
  display: flex;
  align-items: center;
`

const SuspendedWrapper = styled.div`
  margin-right: 1rem;
  display: flex;
  align-items: center;
`

const OffsetWrapper = styled.div`
  margin-right: 1rem;
  display: flex;
  align-items: center;
`

const PieChartIcon = styled(PieChart)`
  color: ${color("gray2")};
  margin-right: 0.5rem;
`

const FileListIcon = styled(FileList)`
  color: ${color("yellow")};
  margin-right: 0.5rem;
`

const ExclamationOctagonIcon = styled(ExclamationOctagon)`
  color: ${color("red")};
  margin-right: 0.5rem;
`

const ExclamationTriangleIcon = styled(ExclamationTriangle)`
  color: ${color("pinkDarker")};
  margin-right: 0.5rem;
`

const Row = ({
  className,
  designatedTimestamp,
  description,
  expanded,
  kind,
  indexed,
  name,
  partitionBy,
  walEnabled,
  onClick,
  suffix,
  tooltip,
  type,
  tableSuspended,
  txnOffset
}: Props) => {
 
  const { insertTextAtCursor } = useEditor()

  const handlePlusButtonClick = useCallback(
    (event: MouseEvent) => {
      event.stopPropagation()
      insertTextAtCursor(
        kind === "table" && !/^[a-z0-9_]+$/i.test(name) ? `"${name}"` : name,
      )
    },
    [name, kind],
  )

  return (
    <Wrapper className={className} expanded={expanded} onClick={onClick}>
      <FlexRow>
        {kind === "table" && <TitleIcon size="18px" />}

        {kind === "column" && indexed && (
          <IconWithTooltip
            icon={<RocketIcon size="13px" />}
            placement="top"
            tooltip="Indexed"
          />
        )}

        {kind === "folder" && expanded && <DownArrowIcon size="14px" />}

        {kind === "folder" && !expanded && <RightArrowIcon size="14px" />}

        {kind === "column" && !indexed && name === designatedTimestamp && (
          <IconWithTooltip
            icon={<SortDownIcon size="14px" />}
            placement="top"
            tooltip="Designated timestamp"
          />
        )}

        {kind === "column" && !indexed && type !== "TIMESTAMP" && (
          <DotIcon size="12px" />
        )}

        <Title color="foreground" ellipsis kind={kind}>
          {name}
        </Title>
        {suffix}

        <Spacer />

        {type && (
          <Type _style="italic" color="pinkLighter" transform="lowercase">
            {type}
          </Type>
        )}

        {kind === "table" && partitionBy !== "NONE" && (
          <PartitionByWrapper>
            <PieChartIcon size="14px" />
            <Text color="gray2">{partitionBy}</Text>
          </PartitionByWrapper>
        )}

        {kind === "table" && walEnabled && (
          <PartitionByWrapper>
            <FileListIcon size="14px" />
            <Text color="yellow">WAL</Text>
          </PartitionByWrapper>
        )}

        {kind === "table" && walEnabled && tableSuspended !== undefined && tableSuspended && (
          <SuspendedWrapper>
            <ExclamationOctagonIcon size="14px" />
            <Text color="red">SUSPENDED</Text>
          </SuspendedWrapper>
        )}

        { kind === "table" && walEnabled && txnOffset !== undefined && txnOffset > 100 && (
          <OffsetWrapper>
            <ExclamationTriangleIcon size="14px" />
            <Text color="pinkDarker">TXN</Text>
          </OffsetWrapper>
        )}

        {["column", "table"].includes(kind) && (
          <PlusButton
            onClick={handlePlusButtonClick}
            size="sm"
            tooltip={tooltip}
          >
            <CodeSSlash size="16px" />
            <span>Add</span>
          </PlusButton>
        )}

        {tooltip && description && (
          <IconWithTooltip
            icon={
              <InfoIconWrapper>
                <InfoIcon size="10px" />
              </InfoIconWrapper>
            }
            placement="right"
            tooltip={description}
          />
        )}
      </FlexRow>

      {!tooltip && <Text color="comment">{description}</Text>}
    </Wrapper>
  )
}

export default Row

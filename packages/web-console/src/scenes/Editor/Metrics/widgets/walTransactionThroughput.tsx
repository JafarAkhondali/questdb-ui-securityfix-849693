import React from "react"
import uPlot from "uplot"
import type { Widget, WallTransactionThroughout } from "../types"
import { sqlValueToFixed, formatNumbers } from "../utils"
import { TelemetryTable } from "../../../../consts"

export const walTransactionThroughput: Widget = {
  distribution: 1,
  label: "WAL Transaction Throughput",
  chartTitle: "Transaction Throughput (txn/s)",
  getDescription: () => (
    <>
      This chart monitors the rate at which transactions are applied to tables.
      Performance is influenced by:
      <ul>
        <li>
          Batch merging efficiency (multiple transactions processed together)
        </li>
        <li>Data ingestion rate from source</li>
        <li>Storage performance and contention</li>
        <li>Concurrent writes across multiple tables sharing resources</li>
      </ul>
      Compare against data source metrics to distinguish between ingestion
      bottlenecks and system performance limitations.
    </>
  ),
  icon:
    '<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">\n' +
    '    <path d="M1.99997 30.0002C1.99804 23.5333 4.23467 17.2651 8.32997 12.2602L6.78997 11.0002C2.40316 16.3605 0.00634766 23.0737 0.00634766 30.0002C0.00634766 36.9268 2.40316 43.6399 6.78997 49.0002L8.32997 47.7402C4.23467 42.7353 1.99804 36.4671 1.99997 30.0002Z" fill="url(#paint0_linear_208_15)"/>\n' +
    '    <path d="M30 58.0002C24.9262 57.9962 19.9489 56.6136 15.6 54.0002L14.6 55.7202C19.2639 58.5085 24.5961 59.9809 30.03 59.9809C35.4638 59.9809 40.7961 58.5085 45.46 55.7202L44.4 54.0002C40.051 56.6136 35.0737 57.9962 30 58.0002Z" fill="url(#paint1_linear_208_15)"/>\n' +
    '    <path d="M51.67 12.2602C55.7677 17.2642 58.0068 23.5325 58.0068 30.0002C58.0068 36.468 55.7677 42.7362 51.67 47.7402L53.21 49.0002C57.5968 43.6399 59.9936 36.9268 59.9936 30.0002C59.9936 23.0737 57.5968 16.3605 53.21 11.0002L51.67 12.2602Z" fill="url(#paint2_linear_208_15)"/>\n' +
    '    <path d="M15.6 6.00023C19.9502 3.39152 24.9275 2.01356 30 2.01356C35.0725 2.01356 40.0497 3.39152 44.4 6.00023L45.4 4.28023C40.7361 1.49194 35.4038 0.0195313 29.97 0.0195312C24.5361 0.0195313 19.2039 1.49194 14.54 4.28023L15.6 6.00023Z" fill="url(#paint3_linear_208_15)"/>\n' +
    '    <path d="M7.99997 8.00023C7.99997 8.59357 8.17592 9.17359 8.50557 9.66694C8.83521 10.1603 9.30375 10.5448 9.85192 10.7719C10.4001 10.9989 11.0033 11.0583 11.5852 10.9426C12.1672 10.8268 12.7017 10.5411 13.1213 10.1216C13.5409 9.70199 13.8266 9.16744 13.9423 8.5855C14.0581 8.00356 13.9987 7.40036 13.7716 6.85218C13.5446 6.304 13.16 5.83547 12.6667 5.50582C12.1733 5.17618 11.5933 5.00023 11 5.00023C10.2043 5.00023 9.44126 5.3163 8.87865 5.87891C8.31604 6.44152 7.99997 7.20458 7.99997 8.00023ZM12 8.00023C12 8.19801 11.9413 8.39135 11.8314 8.5558C11.7216 8.72025 11.5654 8.84842 11.3827 8.92411C11.1999 8.9998 10.9989 9.0196 10.8049 8.98102C10.6109 8.94243 10.4327 8.84719 10.2929 8.70734C10.153 8.56748 10.0578 8.3893 10.0192 8.19532C9.9806 8.00134 10.0004 7.80027 10.0761 7.61755C10.1518 7.43482 10.28 7.27864 10.4444 7.16876C10.6089 7.05888 10.8022 7.00023 11 7.00023C11.2652 7.00023 11.5195 7.10559 11.7071 7.29312C11.8946 7.48066 12 7.73501 12 8.00023Z" fill="url(#paint4_linear_208_15)"/>\n' +
    '    <path d="M52 8.00023C52 7.40689 51.824 6.82687 51.4944 6.33352C51.1647 5.84017 50.6962 5.45566 50.148 5.22859C49.5998 5.00153 48.9966 4.94212 48.4147 5.05788C47.8328 5.17363 47.2982 5.45935 46.8787 5.87891C46.4591 6.29847 46.1734 6.83302 46.0576 7.41496C45.9419 7.9969 46.0013 8.6001 46.2283 9.14828C46.4554 9.69646 46.8399 10.165 47.3333 10.4946C47.8266 10.8243 48.4066 11.0002 49 11.0002C49.7956 11.0002 50.5587 10.6842 51.1213 10.1216C51.6839 9.55894 52 8.79588 52 8.00023ZM48 8.00023C48 7.80245 48.0586 7.60911 48.1685 7.44466C48.2784 7.28021 48.4346 7.15204 48.6173 7.07635C48.8 7.00066 49.0011 6.98086 49.1951 7.01945C49.389 7.05803 49.5672 7.15327 49.7071 7.29312C49.8469 7.43298 49.9422 7.61116 49.9808 7.80514C50.0193 7.99912 49.9995 8.20019 49.9239 8.38291C49.8482 8.56564 49.72 8.72182 49.5555 8.8317C49.3911 8.94158 49.1978 9.00023 49 9.00023C48.7348 9.00023 48.4804 8.89487 48.2929 8.70734C48.1053 8.5198 48 8.26545 48 8.00023Z" fill="url(#paint5_linear_208_15)"/>\n' +
    '    <path d="M11 49.0002C10.4066 49.0002 9.82661 49.1762 9.33326 49.5058C8.83992 49.8355 8.4554 50.304 8.22833 50.8522C8.00127 51.4004 7.94186 52.0036 8.05762 52.5855C8.17337 53.1674 8.4591 53.702 8.87865 54.1215C9.29821 54.5411 9.83276 54.8268 10.4147 54.9426C10.9966 55.0583 11.5998 54.9989 12.148 54.7719C12.6962 54.5448 13.1647 54.1603 13.4944 53.6669C13.824 53.1736 14 52.5936 14 52.0002C14 51.2046 13.6839 50.4415 13.1213 49.8789C12.5587 49.3163 11.7956 49.0002 11 49.0002ZM11 53.0002C10.8022 53.0002 10.6089 52.9416 10.4444 52.8317C10.28 52.7218 10.1518 52.5656 10.0761 52.3829C10.0004 52.2002 9.9806 51.9991 10.0192 51.8051C10.0578 51.6112 10.153 51.433 10.2929 51.2931C10.4327 51.1533 10.6109 51.058 10.8049 51.0194C10.9989 50.9809 11.1999 51.0007 11.3827 51.0764C11.5654 51.152 11.7216 51.2802 11.8314 51.4447C11.9413 51.6091 12 51.8024 12 52.0002C12 52.2654 11.8946 52.5198 11.7071 52.7073C11.5195 52.8949 11.2652 53.0002 11 53.0002Z" fill="url(#paint6_linear_208_15)"/>\n' +
    '    <path d="M49 49.0002C48.4066 49.0002 47.8266 49.1762 47.3333 49.5058C46.8399 49.8355 46.4554 50.304 46.2283 50.8522C46.0013 51.4004 45.9419 52.0036 46.0576 52.5855C46.1734 53.1674 46.4591 53.702 46.8787 54.1215C47.2982 54.5411 47.8328 54.8268 48.4147 54.9426C48.9966 55.0583 49.5998 54.9989 50.148 54.7719C50.6962 54.5448 51.1647 54.1603 51.4944 53.6669C51.824 53.1736 52 52.5936 52 52.0002C52 51.2046 51.6839 50.4415 51.1213 49.8789C50.5587 49.3163 49.7956 49.0002 49 49.0002ZM49 53.0002C48.8022 53.0002 48.6089 52.9416 48.4444 52.8317C48.28 52.7218 48.1518 52.5656 48.0761 52.3829C48.0004 52.2002 47.9806 51.9991 48.0192 51.8051C48.0578 51.6112 48.153 51.433 48.2929 51.2931C48.4327 51.1533 48.6109 51.058 48.8049 51.0194C48.9989 50.9809 49.1999 51.0007 49.3827 51.0764C49.5654 51.152 49.7216 51.2802 49.8314 51.4447C49.9413 51.6091 50 51.8024 50 52.0002C50 52.2654 49.8946 52.5198 49.7071 52.7073C49.5195 52.8949 49.2652 53.0002 49 53.0002Z" fill="url(#paint7_linear_208_15)"/>\n' +
    '    <path d="M49 22.0002V14.0002C49 10.0502 37.06 9.00023 30 9.00023C22.94 9.00023 11 10.0502 11 14.0002V22.0002C11.0266 22.4098 11.1537 22.8064 11.3699 23.1553C11.5862 23.5041 11.885 23.7943 12.24 24.0002C11.8873 24.2089 11.5903 24.4997 11.3744 24.848C11.1585 25.1962 11.03 25.5916 11 26.0002V34.0002C11.0266 34.4098 11.1537 34.8064 11.3699 35.1553C11.5862 35.5041 11.885 35.7943 12.24 36.0002C11.8873 36.2089 11.5903 36.4997 11.3744 36.848C11.1585 37.1962 11.03 37.5916 11 38.0002V46.0002C11 50.0002 22.94 51.0002 30 51.0002C37.06 51.0002 49 50.0002 49 46.0002V38.0002C48.9699 37.5916 48.8415 37.1962 48.6256 36.848C48.4096 36.4997 48.1127 36.2089 47.76 36.0002C48.1149 35.7943 48.4137 35.5041 48.63 35.1553C48.8463 34.8064 48.9733 34.4098 49 34.0002V26.0002C48.9699 25.5916 48.8415 25.1962 48.6256 24.848C48.4096 24.4997 48.1127 24.2089 47.76 24.0002C48.1149 23.7943 48.4137 23.5041 48.63 23.1553C48.8463 22.8064 48.9733 22.4098 49 22.0002ZM13 16.4602C16.7 18.4102 24.72 19.0002 30 19.0002C35.28 19.0002 43.3 18.4102 47 16.4602V22.0002C46.69 23.0502 40.6 25.0002 30 25.0002C19.4 25.0002 13.31 23.0002 13 22.0002V16.4602ZM30 11.0002C40.55 11.0002 46.64 12.9402 47 14.0002C46.64 15.0602 40.55 17.0002 30 17.0002C19.45 17.0002 13.31 15.0002 13 14.0002C13.31 13.0002 19.41 11.0002 30 11.0002ZM13 28.4602C16.7 30.4102 24.72 31.0002 30 31.0002C35.28 31.0002 43.3 30.4102 47 28.4602V34.0002C46.69 35.0002 40.6 37.0002 30 37.0002C19.4 37.0002 13.31 35.0002 13 34.0002V28.4602ZM30 49.0002C19.4 49.0002 13.31 47.0002 13 46.0002V40.4602C16.7 42.4102 24.72 43.0002 30 43.0002C35.28 43.0002 43.3 42.4102 47 40.4602V46.0002C46.69 47.0002 40.6 49.0002 30 49.0002ZM47 38.0002C46.7 39.0602 40.6 41.0002 30 41.0002C19.4 41.0002 13.31 39.0002 13 38.0002C13 38.0002 13.2 37.5802 14.44 37.0602C18.51 38.5402 25.33 39.0002 30 39.0002C34.67 39.0002 41.49 38.5402 45.56 37.0802C46.79 37.6002 47 38.0002 47 38.0002ZM47 26.0002C46.7 27.0602 40.6 29.0002 30 29.0002C19.4 29.0002 13.31 27.0002 13 26.0002C13 26.0002 13.2 25.5802 14.44 25.0602C18.51 26.5402 25.33 27.0002 30 27.0002C34.67 27.0002 41.49 26.5402 45.56 25.0802C46.79 25.6002 47 26.0002 47 26.0002Z" fill="url(#paint8_linear_208_15)"/>\n' +
    '    <path d="M31 21.0002H29V23.0002H31V21.0002Z" fill="url(#paint9_linear_208_15)"/>\n' +
    '    <path d="M31 33.0002H29V35.0002H31V33.0002Z" fill="url(#paint10_linear_208_15)"/>\n' +
    '    <path d="M31 45.0002H29V47.0002H31V45.0002Z" fill="url(#paint11_linear_208_15)"/>\n' +
    "    <defs>\n" +
    '        <linearGradient id="paint0_linear_208_15" x1="30" y1="0.0195312" x2="30" y2="59.9809" gradientUnits="userSpaceOnUse">\n' +
    '            <stop stop-color="#8BE9FD"/>\n' +
    '            <stop offset="1" stop-color="#3EA0B4"/>\n' +
    "        </linearGradient>\n" +
    '        <linearGradient id="paint1_linear_208_15" x1="30" y1="0.0195312" x2="30" y2="59.9809" gradientUnits="userSpaceOnUse">\n' +
    '            <stop stop-color="#8BE9FD"/>\n' +
    '            <stop offset="1" stop-color="#3EA0B4"/>\n' +
    "        </linearGradient>\n" +
    '        <linearGradient id="paint2_linear_208_15" x1="30" y1="0.0195312" x2="30" y2="59.9809" gradientUnits="userSpaceOnUse">\n' +
    '            <stop stop-color="#8BE9FD"/>\n' +
    '            <stop offset="1" stop-color="#3EA0B4"/>\n' +
    "        </linearGradient>\n" +
    '        <linearGradient id="paint3_linear_208_15" x1="30" y1="0.0195312" x2="30" y2="59.9809" gradientUnits="userSpaceOnUse">\n' +
    '            <stop stop-color="#8BE9FD"/>\n' +
    '            <stop offset="1" stop-color="#3EA0B4"/>\n' +
    "        </linearGradient>\n" +
    '        <linearGradient id="paint4_linear_208_15" x1="30" y1="0.0195312" x2="30" y2="59.9809" gradientUnits="userSpaceOnUse">\n' +
    '            <stop stop-color="#8BE9FD"/>\n' +
    '            <stop offset="1" stop-color="#3EA0B4"/>\n' +
    "        </linearGradient>\n" +
    '        <linearGradient id="paint5_linear_208_15" x1="30" y1="0.0195312" x2="30" y2="59.9809" gradientUnits="userSpaceOnUse">\n' +
    '            <stop stop-color="#8BE9FD"/>\n' +
    '            <stop offset="1" stop-color="#3EA0B4"/>\n' +
    "        </linearGradient>\n" +
    '        <linearGradient id="paint6_linear_208_15" x1="30" y1="0.0195312" x2="30" y2="59.9809" gradientUnits="userSpaceOnUse">\n' +
    '            <stop stop-color="#8BE9FD"/>\n' +
    '            <stop offset="1" stop-color="#3EA0B4"/>\n' +
    "        </linearGradient>\n" +
    '        <linearGradient id="paint7_linear_208_15" x1="30" y1="0.0195312" x2="30" y2="59.9809" gradientUnits="userSpaceOnUse">\n' +
    '            <stop stop-color="#8BE9FD"/>\n' +
    '            <stop offset="1" stop-color="#3EA0B4"/>\n' +
    "        </linearGradient>\n" +
    '        <linearGradient id="paint8_linear_208_15" x1="30" y1="0.0195312" x2="30" y2="59.9809" gradientUnits="userSpaceOnUse">\n' +
    '            <stop stop-color="#8BE9FD"/>\n' +
    '            <stop offset="1" stop-color="#3EA0B4"/>\n' +
    "        </linearGradient>\n" +
    '        <linearGradient id="paint9_linear_208_15" x1="30" y1="0.0195312" x2="30" y2="59.9809" gradientUnits="userSpaceOnUse">\n' +
    '            <stop stop-color="#8BE9FD"/>\n' +
    '            <stop offset="1" stop-color="#3EA0B4"/>\n' +
    "        </linearGradient>\n" +
    '        <linearGradient id="paint10_linear_208_15" x1="30" y1="0.0195312" x2="30" y2="59.9809" gradientUnits="userSpaceOnUse">\n' +
    '            <stop stop-color="#8BE9FD"/>\n' +
    '            <stop offset="1" stop-color="#3EA0B4"/>\n' +
    "        </linearGradient>\n" +
    '        <linearGradient id="paint11_linear_208_15" x1="30" y1="0.0195312" x2="30" y2="59.9809" gradientUnits="userSpaceOnUse">\n' +
    '            <stop stop-color="#8BE9FD"/>\n' +
    '            <stop offset="1" stop-color="#3EA0B4"/>\n' +
    "        </linearGradient>\n" +
    "    </defs>\n" +
    "</svg>\n",
  isTableMetric: true,
  querySupportsRollingAppend: true,
  getQuery: ({ tableId, sampleBySeconds, from, to }) => {
    if (sampleBySeconds === 1) {
      return `select
            created created
            , count() commit_rate
          from ${TelemetryTable.WAL}
          where ${tableId ? `tableId = ${tableId} and ` : ""}
          event = 103
          sample by 1s
          FROM timestamp_floor('${sampleBySeconds}s', '${from}')
             TO timestamp_floor('${sampleBySeconds}s', '${to}')
          fill(0)`
    } else {
      return `select created, max(commit_rate) commit_rate from (
        select
          created created
          , count() commit_rate
        from ${TelemetryTable.WAL}
        where ${tableId ? `tableId = ${tableId} and ` : ""}
        event = 103
        sample by 1s FROM timestamp_floor('1s', '${from}') TO timestamp_floor('1s', '${to}') fill(0)
        ) sample by ${sampleBySeconds}s`
    }
  },
  alignData: (data: WallTransactionThroughout[]): uPlot.AlignedData => [
    data.map((l) => Date.parse(l.created)),
    data.map((l) => sqlValueToFixed(l.commit_rate)),
  ],
  mapYValue: (rawValue: number) => formatNumbers(rawValue),
}

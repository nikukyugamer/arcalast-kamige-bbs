import axios, { AxiosResponse, AxiosError } from 'axios'
import fs from 'fs'
import 'dotenv/config'

type ResponseData = {
  comments: Array<{
    id: string
    nickname: string
    body: string
    image_url: string
    comment_no: number
    good_vote: number
    bad_vote: number
    created_at: string
  }>
  cursor: string
}

const apiResponseData: any = async (cursor: string | null) => {
  let requestUrl = 'https://vg-gamemedia-kamigame-enquete.appspot.com/comment/list?path=%2Farcalast%2F%25E6%258E%25B2%25E7%25A4%25BA%25E6%259D%25BF.html&no_pager='

  if (cursor !== null) {
    requestUrl = `${requestUrl}false&cursor=${cursor}`
  }

  const axiosProxyHost: string | undefined = process.env.AXIOS_PROXY_HOST
  const axiosProxyPort: number = Number(process.env.AXIOS_PROXY_PORT)

  if (axiosProxyHost !== undefined && !Number.isNaN(axiosProxyPort)) {
    axios.defaults.proxy = {
      host: axiosProxyHost,
      port: axiosProxyPort
    }
  }

  return axios.get(requestUrl)
    .then((response: AxiosResponse) => {
      return response.data
    })
    .catch((error: AxiosError) => {
      console.log(error)
    })
    .then((responseData: ResponseData) => {
      return responseData
    })
}

export const saveResponseJsonFiles = async () => {
  const responseData: ResponseData = await apiResponseData(null)

  console.log('========== 00001st comments JSON ==========')
  fs.writeFileSync(`./out/arcalast_${'1'.padStart(5, '0')}.json`, JSON.stringify(responseData))

  let latestCursor: string = responseData.cursor
  // CLI実行にしてこの値を渡せるようにしたい
  const numberOfGettingPages: number = 3

  for (let i = 2; i <= numberOfGettingPages; i++) {
    // 仮に全部取得する場合には数千リクエストが飛んでしまうので、十分な間隔を開けること
    // CLI実行にしてこの値を渡せるようにしたい
    const intervalMsec: number = 10000
    await sleep(intervalMsec);

    const latestResponseData: ResponseData = await apiResponseData(latestCursor)

    const fileIndexNumberString: string = i.toString().padStart(5, '0')
    console.log(`========== ${fileIndexNumberString}th comments JSON ==========`)
    fs.writeFileSync(`./out/arcalast_${fileIndexNumberString}.json`, JSON.stringify(latestResponseData))

    latestCursor = latestResponseData.cursor

    if (!latestCursor) break
  }
}

// https://stackoverflow.com/questions/14249506/how-can-i-wait-in-node-js-javascript-l-need-to-pause-for-a-period-of-time
const sleep = (msec: number) => {
  return new Promise((resolve) => {
    setTimeout(resolve, msec);
  });
}

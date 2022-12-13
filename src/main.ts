import { supportedLanguages } from './config'
import { ErrorType, TranslateCompletion, TranslateQuery } from './types'
import { langMap, langMapReverse, translateStatusCode } from './utils'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function supportLanguages(): ReadonlyArray<string> {
  return supportedLanguages.map(([standardLang]) => standardLang)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function translate(
  query: TranslateQuery,
  completion: (data: TranslateCompletion) => void,
): void {

  ; (async () => {
    const targetLanguage = langMap.get(query.detectTo)

    $log.info(`translate to ${targetLanguage}`)

    if (!targetLanguage) {
      const err = new Error()
      Object.assign(err, {
        _type: 'unsupportLanguage',
        _message: '不支持该语种',
      })
      throw err
    }

    const response = await $http.request<{
      code: number
      lang: string
      data: string
      msg: string
    }>({
      method: 'POST',
      url: $option.api,
      header: {
        'Content-Type': 'application/json',
      },
      body: {
        text: query.text,
        target_lang: targetLanguage,
        source_lang: langMap.get(query.detectFrom) ?? 'auto'
      },
    })

    if (response.error) {
      const { statusCode } = response.response

      let reason: ErrorType

      if (statusCode >= 400 && statusCode < 500) {
        reason = 'param'
      } else {
        reason = 'api'
      }

      if (response.data?.code) {
        completion({
          error: {
            type: reason,
            message: `接口响应错误: code=${response.data?.code}, msg=${response.data?.msg}`,
            addtion: JSON.stringify(response),
          },
        })
      } else {
        completion({
          error: {
            type: reason,
            message: `接口响应错误 ${translateStatusCode(statusCode)}`,
            addtion: JSON.stringify(response),
          },
        })
      }
    } else {
      const data = response.data

      if (!data) {
        completion({
          error: {
            type: 'api',
            message: '接口未返回翻译结果',
          },
        })

        return
      }

      completion({
        result: {
          from: langMapReverse.get(data.lang),
          toParagraphs: [data.data],
        },
      })
    }
  })().catch((err) => {
    completion({
      error: {
        type: err._type || 'unknown',
        message: err._message || '未知错误',
        addtion: err._addtion,
      },
    })
  })
}

import { IGitLogInfo } from './IGitLogInfo'

enum LogStage {
  NOT_INIT = 'not_init',
  SHA = 'sha',
  AUTHOR = 'author',
  DATE = 'date',
  COMMENT = 'comment',
  DIFF = 'diff',
}

const logStageProcessor = {
  [LogStage.NOT_INIT]: () => { return '' },
  [LogStage.SHA]: (line: string) => { // eg. `commit 4b07a8f139ad5513bf0275e5d878b6641eef322c`
    const [, sha] = line.trim().split(' ')
    return sha
  },
  [LogStage.AUTHOR]: (line: string) => { // eg. `Author: Aura-zx <kaomygod@gmail.com>`
    const [, author, email] = line.trim().split(' ')
    return author + email
  },
  [LogStage.DATE]: (line: string) => { // eg. `Date:   Wed Dec 11 00:45:34 2019 +0800`
    const [, ...rest] = line.trim().split(' ')
    return rest.join(' ').trim()
  },
  [LogStage.COMMENT]: (line: string) => { return line.trim() },
  [LogStage.DIFF]: (line: string) => { // eg. `1 file changed, 217 insertions(+), 99 deletions(-)`
    let cluster = { ins: 0, del: 0 }
    const [, ...diffs] = line.trim().split(',')
    diffs.forEach(diff => {
      if (diff !== undefined) {
        const [count, attr] = diff.trim().split(' ')
        if (attr.includes('+')) {
          cluster.ins += parseInt(count, 10)
        }
        if (attr.includes('-')) {
          cluster.del += parseInt(count, 10)
        }
      }
    })

    return cluster
  },
}

type Diff = ReturnType<typeof logStageProcessor[LogStage.DIFF]>

function isDiff(d: any): d is Diff { return d.ins !== undefined }
function isString(s: any): s is string { return typeof s === "string" }

function buildGitInfo(stage: LogStage, parseResult: string | Diff, gitInfo: IGitLogInfo) {
  if (stage === LogStage.SHA) {
    if (isString(parseResult)) {
      gitInfo['sha'] = parseResult
    }
  } else if (stage === LogStage.AUTHOR) {
    if (isString(parseResult)) {
      gitInfo['author'] = parseResult
    }
  } else if (stage === LogStage.DATE) {
    if (isString(parseResult)) {
      gitInfo['date'] = parseResult
    }
  } else if (stage === LogStage.COMMENT) {
    if (isString(parseResult)) {
      if (gitInfo['commitMsg'] === undefined) {
        gitInfo['commitMsg'] = ''
      } else {
        gitInfo['commitMsg'] += parseResult
      }
    }
  } else if (stage === LogStage.DIFF) {
    if (isDiff(parseResult)) {
      gitInfo['insertions'] = parseResult.ins
      gitInfo['deletions'] = parseResult.del
    }
  }
}

function getCurrentStage(lastStage: LogStage, line: string): LogStage {
  if (line.startsWith('commit') && (lastStage === LogStage.NOT_INIT || lastStage === LogStage.DIFF)) {
    return LogStage.SHA
  }
  if (line.startsWith('Author') && lastStage === LogStage.SHA) {
    return LogStage.AUTHOR
  }
  if (line.startsWith('Date') && lastStage === LogStage.AUTHOR) {
    return LogStage.DATE
  }
  if (line.length === 0 && lastStage === LogStage.DATE) {
    return LogStage.COMMENT
  }
  if (line.trim().startsWith('1 file changed') === false && lastStage === LogStage.COMMENT) {
    return LogStage.COMMENT
  }
  if (line.trim().startsWith('1 file changed') && lastStage === LogStage.COMMENT) {
    return LogStage.DIFF
  }
  throw new Error(`parse stage error, lastStage=${lastStage}, current line=${line}`)
}

function parseGitLog(log: string): IGitLogInfo[] {
  let gitLogInfo: IGitLogInfo[] = []
  if (log.length === 0) {
    return gitLogInfo
  }

  let currentLogIndex = 0
  let lastStage = LogStage.NOT_INIT
  log.split('\n').reduce((logs, line) => {
    const stage = getCurrentStage(lastStage, line)
    lastStage = stage
    if (logs[currentLogIndex] === undefined) {
      logs.push({ sha: '', author: '', date: '', commitMsg: '', insertions: 0, deletions: 0 })
    }
    buildGitInfo(stage, logStageProcessor[stage](line), logs[currentLogIndex])
    return logs
  }, gitLogInfo)

  return gitLogInfo
}

export { parseGitLog }
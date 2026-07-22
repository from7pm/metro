// XML 파싱 함수
const parseXMLResponse = (xmlString) => {
  try {
    const parser = new DOMParser()
    const xmlDoc = parser.parseFromString(xmlString, 'text/xml')
    
    const route = xmlDoc.querySelector('route')
    if (!route) return null

    const getTextContent = (tagName) => {
      const element = route.querySelector(tagName)
      return element ? element.textContent : ''
    }

    // 경로 정보 파싱
    const pathList = Array.from(route.querySelectorAll('sPath pathList')).map(path => ({
      startStation: path.querySelector('startStationName')?.textContent || '',
      endStation: path.querySelector('endStationName')?.textContent || '',
      line: path.querySelector('line')?.textContent || '',
      runTime: path.querySelector('runTime')?.textContent || '',
      pathType: path.querySelector('pathType')?.textContent || ''
    }))

    // 환승 정보 파싱
    const transferList = Array.from(route.querySelectorAll('sTransfer transferList')).map(transfer => ({
      beforeLine: transfer.querySelector('beforeLine')?.textContent || '',
      afterLine: transfer.querySelector('afterLine')?.textContent || '',
      timeavg: transfer.querySelector('timeavg')?.textContent || '' // 평균 환승 소요 시간
    }))

    return {
      startStation: getTextContent('startStationName'),
      endStation: getTextContent('endStationName'),
      totalTime: getTextContent('totalTime'),
      transferNum: getTextContent('transferNum'),
      price: getTextContent('price'),
      distance: getTextContent('distance'),
      pathList,
      transferList,
    }
  } catch (error) {
    console.error('XML 파싱 오류:', error)
    return null
  }
}

export { parseXMLResponse }
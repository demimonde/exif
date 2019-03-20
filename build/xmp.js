function findXMPinJPEG(file) {
  if (!('DOMParser' in self)) {
    // console.warn('XML parsing not supported without DOMParser');
    return
  }
  var dataView = new DataView(file)

  if (debug) console.log('Got file of length ' + file.byteLength)
  if ((dataView.getUint8(0) != 0xFF) || (dataView.getUint8(1) != 0xD8)) {
    if (debug) console.log('Not a valid JPEG')
    return false // not a valid jpeg
  }

  var offset = 2,
    length = file.byteLength,
    dom = new DOMParser()

  while (offset < (length-4)) {
    if (getStringFromDB(dataView, offset, 4) == 'http') {
      var startOffset = offset - 1
      var sectionLength = dataView.getUint16(offset - 2) - 1
      var xmpString = getStringFromDB(dataView, startOffset, sectionLength)
      var xmpEndIndex = xmpString.indexOf('xmpmeta>') + 8
      xmpString = xmpString.substring( xmpString.indexOf( '<x:xmpmeta' ), xmpEndIndex )

      var indexOfXmp = xmpString.indexOf('x:xmpmeta') + 10
      //Many custom written programs embed xmp/xml without any namespace. Following are some of them.
      //Without these namespaces, XML is thought to be invalid by parsers
      xmpString = xmpString.slice(0, indexOfXmp)
                        + 'xmlns:Iptc4xmpCore="http://iptc.org/std/Iptc4xmpCore/1.0/xmlns/" '
                        + 'xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" '
                        + 'xmlns:tiff="http://ns.adobe.com/tiff/1.0/" '
                        + 'xmlns:plus="http://schemas.android.com/apk/lib/com.google.android.gms.plus" '
                        + 'xmlns:ext="http://www.gettyimages.com/xsltExtension/1.0" '
                        + 'xmlns:exif="http://ns.adobe.com/exif/1.0/" '
                        + 'xmlns:stEvt="http://ns.adobe.com/xap/1.0/sType/ResourceEvent#" '
                        + 'xmlns:stRef="http://ns.adobe.com/xap/1.0/sType/ResourceRef#" '
                        + 'xmlns:crs="http://ns.adobe.com/camera-raw-settings/1.0/" '
                        + 'xmlns:xapGImg="http://ns.adobe.com/xap/1.0/g/img/" '
                        + 'xmlns:Iptc4xmpExt="http://iptc.org/std/Iptc4xmpExt/2008-02-29/" '
                        + xmpString.slice(indexOfXmp)

      var domDocument = dom.parseFromString( xmpString, 'text/xml' )
      return xml2Object(domDocument)
    } else{
      offset++
    }
  }
}

function xml2json(xml) {
  var json = {}

  if (xml.nodeType == 1) { // element node
    if (xml.attributes.length > 0) {
      json['@attributes'] = {}
      for (var j = 0; j < xml.attributes.length; j++) {
        var attribute = xml.attributes.item(j)
        json['@attributes'][attribute.nodeName] = attribute.nodeValue
      }
    }
  } else if (xml.nodeType == 3) { // text node
    return xml.nodeValue
  }

  // deal with children
  if (xml.hasChildNodes()) {
    for(var i = 0; i < xml.childNodes.length; i++) {
      var child = xml.childNodes.item(i)
      var nodeName = child.nodeName
      if (json[nodeName] == null) {
        json[nodeName] = xml2json(child)
      } else {
        if (json[nodeName].push == null) {
          var old = json[nodeName]
          json[nodeName] = []
          json[nodeName].push(old)
        }
        json[nodeName].push(xml2json(child))
      }
    }
  }

  return json
}

function xml2Object(xml) {
  try {
    var obj = {}
    if (xml.children.length > 0) {
      for (var i = 0; i < xml.children.length; i++) {
        var item = xml.children.item(i)
        var attributes = item.attributes
        for(var idx in attributes) {
          var itemAtt = attributes[idx]
          var dataKey = itemAtt.nodeName
          var dataValue = itemAtt.nodeValue

          if(dataKey !== undefined) {
            obj[dataKey] = dataValue
          }
        }
        var nodeName = item.nodeName

        if (typeof (obj[nodeName]) == 'undefined') {
          obj[nodeName] = xml2json(item)
        } else {
          if (typeof (obj[nodeName].push) == 'undefined') {
            var old = obj[nodeName]

            obj[nodeName] = []
            obj[nodeName].push(old)
          }
          obj[nodeName].push(xml2json(item))
        }
      }
    } else {
      obj = xml.textContent
    }
    return obj
  } catch (e) {
    console.log(e.message)
  }
}
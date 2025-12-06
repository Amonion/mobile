import React from 'react'
import { Image } from 'react-native'

type DocImageProps = {
  extension: string
}

const DocImage: React.FC<DocImageProps> = ({ extension }) => {
  return (
    <>
      {extension.includes('pdf') ? (
        <Image
          source={require('@/assets/images/files/pdf.png')}
          style={{
            height: 25,
            width: 25,
            resizeMode: 'contain',
            marginRight: 12,
          }}
        />
      ) : extension.includes('csv') ? (
        <Image
          source={require('@/assets/images/files/csv.png')}
          style={{
            height: 25,
            width: 25,
            resizeMode: 'contain',
            marginRight: 12,
          }}
        />
      ) : extension.includes('doc') ? (
        <Image
          source={require('@/assets/images/files/doc.png')}
          style={{
            height: 25,
            width: 25,
            resizeMode: 'contain',
            marginRight: 12,
          }}
        />
      ) : extension.includes('ppt') ? (
        <Image
          source={require('@/assets/images/files/ppt.png')}
          style={{
            height: 25,
            width: 25,
            resizeMode: 'contain',
            marginRight: 12,
          }}
        />
      ) : extension.includes('xls') ? (
        <Image
          source={require('@/assets/images/files/xls.png')}
          style={{
            height: 25,
            width: 25,
            resizeMode: 'contain',
            marginRight: 12,
          }}
        />
      ) : (
        <Image
          source={require('@/assets/images/files/pdf.png')}
          style={{
            height: 25,
            width: 25,
            resizeMode: 'contain',
            marginRight: 12,
          }}
        />
      )}
    </>
  )
}

export default DocImage

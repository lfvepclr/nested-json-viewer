import React, {useState} from 'react'
import {Button} from 'antd'
import {DownloadOutlined, FullscreenOutlined, PlusOutlined, MinusOutlined} from '@ant-design/icons'
import {generateImageFileName} from '../utils/fileNameGenerator'

// 内联 imageUtils 功能
const base64ToBlob = (base64: string, mimeType: string): Blob => {
    const byteCharacters = atob(base64)
    const byteNumbers = new Array(byteCharacters.length)

    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
    }

    const byteArray = new Uint8Array(byteNumbers)
    return new Blob([byteArray], {type: mimeType})
}

const downloadFile = (blob: Blob, filename: string): void => {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
}

interface InlineImagePreviewProps {
    base64Data: string
    imageType: string
    maxHeight?: number
}

export const InlineImagePreview: React.FC<InlineImagePreviewProps> = ({
                                                                          base64Data,
                                                                          imageType,
                                                                          maxHeight = 300
                                                                      }) => {
    const [scale, setScale] = useState(1)

    const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3.0))
    const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.25))
    const resetZoom = () => setScale(1)

    const handleDownload = () => {
        if (!base64Data) return

        const mimeType = `image/${imageType}`
        const blob = base64ToBlob(base64Data, mimeType)
        const filename = generateImageFileName(imageType)
        downloadFile(blob, filename)
    }

    const handleFullscreen = () => {
        if (!base64Data) return
        
        const dataUrl = `data:image/${imageType};base64,${base64Data}`
        const newWindow = window.open('', '_blank')
        if (newWindow) {
            newWindow.document.write(`
                <!DOCTYPE html>
                <html>
                <head>
                    <title>图片预览 - ${imageType.toUpperCase()}</title>
                    <style>
                        * { margin: 0; padding: 0; box-sizing: border-box; }
                        body {
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            min-height: 100vh;
                            background: #1f2937;
                            padding: 20px;
                        }
                        img {
                            max-width: 100%;
                            max-height: 100vh;
                            object-fit: contain;
                            border-radius: 8px;
                            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                        }
                    </style>
                </head>
                <body>
                    <img src="${dataUrl}" alt="图片预览" />
                </body>
                </html>
            `)
            newWindow.document.close()
        }
    }

    const dataUrl = `data:image/${imageType};base64,${base64Data}`

    return (
        <div style={{
            overflow: 'hidden'
        }}>
            {/* 工具栏 - 下载、全屏、缩放按钮 */}
            <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 0px',
                marginBottom: '8px',
                borderBottom: '1px solid #d9d9d9',
            }}>
                <Button
                    size="small"
                    type="text"
                    icon={<DownloadOutlined/>}
                    onClick={handleDownload}
                    style={{fontSize: '12px'}}
                >
                    下载
                </Button>
                <Button
                    size="small"
                    type="text"
                    icon={<FullscreenOutlined/>}
                    onClick={handleFullscreen}
                    style={{fontSize: '12px'}}
                >
                    全屏查看
                </Button>
                <div style={{display: 'flex', alignItems: 'center', marginLeft: '8px', borderLeft: '1px solid #d9d9d9', paddingLeft: '8px'}}>
                    <Button size="small" icon={<MinusOutlined/>} onClick={zoomOut} disabled={scale <= 0.25}/>
                    <span 
                        style={{fontSize: '12px', margin: '0 6px', cursor: 'pointer', minWidth: '45px', textAlign: 'center'}} 
                        onClick={resetZoom}
                        title="点击重置"
                    >
                        {Math.round(scale * 100)}%
                    </span>
                    <Button size="small" icon={<PlusOutlined/>} onClick={zoomIn} disabled={scale >= 3.0}/>
                </div>
                <div style={{fontSize: '12px', color: '#6b7280', marginLeft: 'auto'}}>
                    {imageType.toUpperCase()} 图片预览
                </div>
            </div>

            {/* 图片内容 - 支持缩放 */}
            <div style={{
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'flex-start',
                maxHeight: maxHeight,
                overflow: 'auto'
            }}>
                <img
                    src={dataUrl}
                    alt="Base64 预览"
                    style={{
                        maxWidth: scale === 1 ? '100%' : 'none',
                        width: scale !== 1 ? `${scale * 100}%` : 'auto',
                        height: 'auto',
                        objectFit: 'contain',
                        transition: 'width 0.2s ease'
                    }}
                    onError={(e) => {
                        console.error('图片加载失败:', e)
                        e.currentTarget.style.display = 'none'
                    }}
                />
            </div>
        </div>
    )
}

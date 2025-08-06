/* eslint-disable @next/next/no-img-element */

import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const preferredRegion = ['iad1']

// Helper function to load background image
async function loadBackgroundImage(): Promise<ArrayBuffer> {
  return fetch(new URL('background.png', import.meta.url)).then(res => res.arrayBuffer())
}

// Helper function to load font
async function loadGeistFont(): Promise<ArrayBuffer> {
  return fetch(new URL('../../assets/geist-semibold.ttf', import.meta.url)).then(res =>
    res.arrayBuffer()
  )
}

// Helper function to get title styles
function getTitleStyles(): React.CSSProperties {
  return {
    color: 'rgb(244 244 245)',
    letterSpacing: 'tight',
    flexGrow: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    lineHeight: 1.1,
    fontWeight: 500,
    fontSize: 80,
    backgroundColor: 'black',
  }
}

// Helper function to get container styles
function getContainerStyles(): React.CSSProperties {
  return {
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    height: '100%',
    width: '750px',
    justifyContent: 'center',
    left: '50px',
    paddingRight: '50px',
    paddingTop: '116px',
    paddingBottom: '166px',
  }
}

// Helper function to generate OpenGraph JSX content
function generateOGContent(
  title: string | null,
  description: string | null,
  imageData: ArrayBuffer
) {
  return (
    <div
      style={{
        display: 'flex',
        height: '100%',
        width: '100%',
        backgroundColor: 'black',
        fontFamily: 'Geist Sans',
      }}
    >
      <img
        src={`data:image/png;base64,${Buffer.from(imageData).toString('base64')}`}
        alt="vercel opengraph background"
      />
      <div style={getContainerStyles()}>
        <div style={getTitleStyles()}>{title}</div>
        <div style={{ fontSize: '40px', color: '#7D7D7D' }}>{description}</div>
      </div>
    </div>
  )
}

export async function GET(request: Request): Promise<ImageResponse> {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title')
  const description = searchParams.get('description')

  const [imageData, geistSemibold] = await Promise.all([loadBackgroundImage(), loadGeistFont()])

  return new ImageResponse(generateOGContent(title, description, imageData), {
    width: 1200,
    height: 628,
    fonts: [
      {
        name: 'geist',
        data: geistSemibold,
        style: 'normal',
      },
    ],
  })
}

"use client"

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Checkbox } from '@/components/ui/checkbox'

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
const PROXY_PREFIX = 'https://v4.gh-proxy.org/'

const DEFAULT_VERSION = process.env.VERSION ?? '1.0.1'

export default function Home() {
  const [version, setVersion] = useState(DEFAULT_VERSION)
  const [versionReady, setVersionReady] = useState(false)
  const [proxyEnabled, setProxyEnabled] = useState(false)
  const wasAwayRef = useRef(false)

  useEffect(() => {
    const queryVersion = new URLSearchParams(window.location.search).get('version')?.trim()
    if (queryVersion) {
      setVersion(queryVersion)
    }
    setVersionReady(true)
  }, [])

  const downloadBase = `https://github.com/aigate2024/bbx-release/releases/download/v${version}`
  const isBeta = version.toLowerCase().includes('beta')
  const appName = isBeta ? 'AI百宝箱内测版.app' : 'AI百宝箱2026.app'
  const installers = [
    {
      title: 'macOS（Apple 芯片）',
      logo: '/logo/mac.svg',
      invertOnDark: true,
      href: `${downloadBase}/bbx-image-${version}-arm64.dmg`,
    },
    {
      title: 'macOS（Intel 芯片）',
      logo: '/logo/mac.svg',
      invertOnDark: true,
      href: `${downloadBase}/bbx-image-${version}-x64.dmg`,
    },
    // {
    //   title: 'Linux DEB',
    //   logo: '/logo/linux.svg',
    //   invertOnDark: false,
    //   href: `${downloadBase}/bbx-image_${version}_amd64.deb`,
    // },
    // {
    //   title: 'Linux AppImage',
    //   logo: '/logo/linux.svg',
    //   invertOnDark: false,
    //   href: `${downloadBase}/bbx-image-${version}.AppImage`,
    // },
    {
      title: 'Windows',
      logo: '/logo/windows.svg',
      invertOnDark: true,
      href: `${downloadBase}/bbx-image-${version}-setup.exe`,
    },
  ]

  useEffect(() => {
    const reloadIfReturned = () => {
      if (wasAwayRef.current) {
        window.location.reload()
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        wasAwayRef.current = true
        return
      }

      reloadIfReturned()
    }

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload()
      }
    }

    const handleBlur = () => {
      wasAwayRef.current = true
    }

    window.addEventListener('blur', handleBlur)
    window.addEventListener('focus', reloadIfReturned)
    window.addEventListener('pageshow', handlePageShow)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      window.removeEventListener('blur', handleBlur)
      window.removeEventListener('focus', reloadIfReturned)
      window.removeEventListener('pageshow', handlePageShow)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  return (
    <>
      {!versionReady && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground">正在获取版本信息…</p>
        </div>
      )}
      <div className={`space-y-4 max-w-2xl mx-auto px-4 pt-[8%] ${!versionReady ? 'pointer-events-none select-none' : ''}`}>
      <p className='w-full text-3xl font-bold flex justify-center items-center gap-2'>
        <img src={`${BASE}/logo/icon.png`} alt="" className="size-10" />
        <span>AI百宝箱</span>
        {isBeta && <span>内测版</span>}
      </p>
      <p className="text-center text-sm text-muted-foreground">v{version}</p>
      <div>
        <h2 className="mb-3 text-lg font-semibold">下载安装包</h2>

        <div className="mb-4 flex flex-col gap-2 rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
          <label className="inline-flex cursor-pointer items-center gap-3 text-sm font-medium text-slate-900 dark:text-slate-100">
            <Checkbox
              checked={proxyEnabled}
              onCheckedChange={(checked) => setProxyEnabled(checked === true)}
            />
            启用下载加速代理
          </label>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            将 GitHub 链接转换为多区域加速链接，解决 GitHub 访问慢、下载失败等问题。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {installers.map((installer) => {
            const href = proxyEnabled ? `${PROXY_PREFIX}${installer.href}` : installer.href

            return (
              <Link
                key={href}
                className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3 transition-colors hover:bg-muted"
                href={versionReady ? href : '#'}
                aria-disabled={!versionReady}
                target="_blank"
                rel="noreferrer"
              >
                <img className={`h-8 w-8 shrink-0 ${installer.invertOnDark ? 'dark:invert' : ''}`} src={`${BASE}${installer.logo}`} alt="" />
                <span className="min-w-0">
                  <span className="block font-medium leading-5">{installer.title}</span>
                </span>
              </Link>
            )
          })}
        </div>
        <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4 dark:border-yellow-900 dark:bg-yellow-950">
          <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">macOS 用户注意</p>
          <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">安装后，请在终端中执行以下命令：</p>
          <div className="bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono space-y-1 overflow-x-auto">
            <div>xattr -cr /Applications/{appName}</div>
            <div>codesign --force --deep --sign - /Applications/{appName}</div>
          </div>
        </div>
      </div>
      </div>
    </>
  )
}

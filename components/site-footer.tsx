"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { AtSign, Copy, Check, X } from "lucide-react"
import XLogoPng from "@/Images/Ardra Assets/Xlogo.png"

const emailAddress = "manager@ardra.xyz"

export function SiteFooter() {
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!showEmailModal) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowEmailModal(false)
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [showEmailModal])

  useEffect(() => {
    if (!copied) return
    const timeout = window.setTimeout(() => setCopied(false), 2000)
    return () => window.clearTimeout(timeout)
  }, [copied])

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(emailAddress)
        setCopied(true)
      } else {
        throw new Error("Clipboard API unavailable")
      }
    } catch (error) {
      window.prompt("Copy the contact email:", emailAddress)
    }
  }

  const closeModal = () => {
    setShowEmailModal(false)
    setCopied(false)
  }

  return (
    <footer className="-mt-px">
      {/* Wrap the frame inside site width to avoid extra-wide footer */}
      <div className="site-wrap mx-auto -mt-px">
        <div className="frame frame--bottom-link relative overflow-hidden">
          <div className="flex flex-col gap-2 px-6 py-3 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <span>&copy; 2025 Ardra</span>
            <div className="flex flex-wrap items-center gap-4">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="border-white/15 bg-transparent text-white/70 transition-colors hover:border-white/30 hover:text-white"
          >
            <Link href="https://forms.gle/6h4ZonFJvFzwGccU9" target="_blank" rel="noopener noreferrer">
              Affiliate program
            </Link>
          </Button>
          <button
            type="button"
            onClick={() => setShowEmailModal(true)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/30 hover:text-white"
            aria-label="Open Ardra email popup"
            title={emailAddress}
          >
            <AtSign className="h-5 w-5" aria-hidden="true" />
          </button>
          <Link
            href="https://x.com/ArdraHub"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/70 transition-colors hover:border-white/30 hover:text-white"
            aria-label="Open Ardra on X"
            title="@ArdraHub on X"
          >
            <Image src={XLogoPng} alt="X logo" width={20} height={20} className="h-5 w-5 object-contain" />
          </Link>
            </div>
          </div>
        </div>
      </div>

      {showEmailModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="footer-email-title"
            className="relative w-full max-w-sm rounded-2xl border border-white/10 bg-black/95 p-6 text-white shadow-xl"
          >
            <button
              type="button"
              onClick={closeModal}
              className="absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-full border border-white/10 text-white/60 transition-colors hover:border-white/30 hover:text-white"
              aria-label="Close popup"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
            <h3 id="footer-email-title" className="text-lg font-semibold text-white">
              Contact Ardra
            </h3>
            <p className="mt-2 text-sm text-white/70">
              Copy the email below to reach our team.
            </p>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-mono text-sm text-white">
              <span className="select-all">{emailAddress}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCopy}
                className="border-white/20 text-white/80 hover:border-white/30 hover:text-white"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="mt-6 flex justify-end">
              <Button
                type="button"
                variant="ghost"
                onClick={closeModal}
                className="text-white/70 hover:text-white"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </footer>
  )
}


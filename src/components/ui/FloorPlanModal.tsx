'use client';

import { useState } from 'react';
import { Dialog, DialogPanel, Transition, TransitionChild } from '@headlessui/react';
import { X, Download, FileText } from 'lucide-react';

interface Props {
  triggerLabel: string;
  closeLabel: string;
  title: string;
  imageUrl: string;
  pdfUrl?: string;
  /** Optional alt text for the floor-plan image (e.g. "4BR Beach Estate floor plan") */
  alt: string;
}

export default function FloorPlanModal({
  triggerLabel,
  closeLabel,
  title,
  imageUrl,
  pdfUrl,
  alt,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex-1 flex items-center justify-center gap-1.5 h-[40px] bg-gray-100 text-xs text-gray-700 hover:bg-gray-200 hover:text-black transition-colors"
      >
        <FileText className="w-3.5 h-3.5" />
        {triggerLabel}
      </button>

      <Transition show={open}>
        <Dialog onClose={() => setOpen(false)} className="relative z-50">
          {/* Backdrop */}
          <TransitionChild
            enter="transition-opacity ease-out duration-200"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-in duration-150"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/80" aria-hidden="true" />
          </TransitionChild>

          {/* Centered panel container */}
          <div className="fixed inset-0 flex items-center justify-center p-4 md:p-8">
            <TransitionChild
              enter="transition-all ease-out duration-200"
              enterFrom="opacity-0 scale-[0.97]"
              enterTo="opacity-100 scale-100"
              leave="transition-all ease-in duration-150"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-[0.97]"
            >
              <DialogPanel className="relative w-full max-w-5xl bg-white max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-5 md:px-7 py-4 border-b border-gray-200">
                  <h3 className="text-sm md:text-base font-medium text-black tracking-wide">{title}</h3>
                  <div className="flex items-center gap-3">
                    {pdfUrl && (
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-black transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        PDF
                      </a>
                    )}
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label={closeLabel}
                      className="text-gray-500 hover:text-black transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Image */}
                <div className="flex-1 overflow-auto bg-[#f5f5f5] p-4 md:p-6">
                  <div className="relative w-full h-full min-h-[60vh] flex items-center justify-center">
                    {/* Use unoptimised Image so Next doesn't proxy/cache the floor plan
                        with mismatched dimensions — preserves the source crispness. */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={alt}
                      className="max-w-full max-h-[78vh] w-auto h-auto object-contain"
                    />
                  </div>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}

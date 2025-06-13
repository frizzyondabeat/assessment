'use client';

import { buttonVariants } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { XIcon } from 'lucide-react';
import React, { FC, ReactNode } from 'react';

type ModalType = {
  children: ReactNode | ReactNode[];
  defaultOpen?: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  alignment?: 'left' | 'right' | 'top' | 'bottom' | 'center';
  title?: string;
  description?: string;
  className?: string;
  footerClassName?: string;
};

const Modal: FC<ModalType> = ({
  children,
  open,
  defaultOpen = false,
  onOpenChange,
  alignment = 'center',
  title,
  description,
  className = '',
  footerClassName = '',
}) => {
  const isMobile = useIsMobile();

  const [content, footer] = Array.isArray(children)
    ? children
    : [children, null];

  if (isMobile) {
    // On mobile, use Drawer for bottom alignment, Sheet for sides
    if (alignment === 'bottom' || alignment === 'top') {
      return (
        <Drawer
          defaultOpen={defaultOpen}
          open={open}
          onOpenChange={onOpenChange}
          direction={alignment}
        >
          <DrawerContent>
            <DrawerHeader>
              {(title || description) && (
                <div className="flex flex-row items-center justify-between border-b bg-white">
                  <div>
                    {title && (
                      <DrawerTitle className="text-lg font-semibold">
                        {title}
                      </DrawerTitle>
                    )}
                    {description && (
                      <DrawerDescription className="text-muted-foreground text-sm">
                        {description}
                      </DrawerDescription>
                    )}
                  </div>
                  <DrawerClose
                    className={cn(
                      buttonVariants({ variant: 'ghost', size: 'icon' })
                    )}
                  >
                    <XIcon className="size-4" />
                    <span className="sr-only">Close</span>
                  </DrawerClose>
                </div>
              )}
            </DrawerHeader>
            {content}
            {footer && (
              <DrawerFooter className={cn('', footerClassName)}>
                {footer}
              </DrawerFooter>
            )}
          </DrawerContent>
        </Drawer>
      );
    } else {
      const side = alignment === 'center' ? 'bottom' : alignment;

      return (
        <Sheet open={open} onOpenChange={onOpenChange}>
          <SheetContent
            side={side}
            className={cn(
              'bg-background-1 gap-0 w-full overflow-hidden border-0',
              className,
              {
                'rounded-tl-2xl rounded-tr-2xl': side === 'bottom',
                'rounded-r-2xl': side === 'left',
                'rounded-l-2xl': side === 'right',
              }
            )}
          >
            {(title || description) && (
              <SheetHeader className="flex flex-row p-4 text-white items-center h-full justify-between bg-[#755ae2]">
                <div>
                  {title && <SheetTitle className="text-lg text-white font-semibold">{title}</SheetTitle>}
                  {description && (
                    <SheetDescription className="text-muted-foreground text-sm">{description}</SheetDescription>
                  )}
                </div>
                <SheetClose
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'default' }),
                    "hover:bg-[#F5F3FF33] hover:text-white cursor-pointer"
                  )}
                >
                  <span>Close</span>
                </SheetClose>
              </SheetHeader>
            )}
            <div className="bg-[#F5F3FF]">
              {content}
              {footer && <SheetFooter className="rounded-lg bg-white p-4 flex sm:items-center sm:justify-end">{footer}</SheetFooter>}
            </div>
          </SheetContent>
        </Sheet>
      );
    }
  } else {
    // On desktop:
    // Use Dialog for center alignment
    if (alignment === 'center') {
      return (
        <Dialog
          defaultOpen={defaultOpen}
          open={open}
          onOpenChange={onOpenChange}
        >
          <DialogContent showCloseButton={false} className={cn('p-0 overflow-hidden border-0 space-y-0 gap-0', className)}>
            {(title || description) && (
              <DialogHeader className="flex flex-row p-4 text-white items-center h-full justify-between bg-[#755ae2]">
                <div>
                  {title && (
                    <DialogTitle className="text-lg font-semibold">
                      {title}
                    </DialogTitle>
                  )}
                  {description && (
                    <DialogDescription className="text-muted-foreground text-sm">
                      {description}
                    </DialogDescription>
                  )}
                </div>
                <DialogClose
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'default' })
                  , "hover:bg-[#F5F3FF33] hover:text-white cursor-pointer")}
                >
                  <span>Close</span>
                </DialogClose>
              </DialogHeader>
            )}
            <div className="bg-[#F5F3FF]">

            {content}
            {footer && <DialogFooter className="rounded-lg bg-white p-4 flex sm:items-center sm:justify-end">{footer}</DialogFooter>}
            </div>
          </DialogContent>
        </Dialog>
      );
    } else {
      // Use Sheet for other alignments on desktop
      return (
        <Sheet
          defaultOpen={defaultOpen}
          open={open}
          onOpenChange={onOpenChange}
        >
          <SheetContent
            side={alignment}
            className={cn(
              'bg-background-1 overflow-hidden border-0',
              className,
              {
                'rounded-br-2xl rounded-bl-2xl': alignment === 'top',
                'rounded-tl-2xl rounded-tr-2xl': alignment === 'bottom',
                'rounded-r-2xl': alignment === 'left',
                'rounded-l-2xl': alignment === 'right',
              }
            )}
          >
            {(title || description) && (
              <SheetHeader className="flex flex-row p-4 text-white items-center h-full justify-between bg-[#755ae2]">
                <div>
                  {title && <SheetTitle className="text-lg font-semibold">{title}</SheetTitle>}
                  {description && (
                    <SheetDescription className="text-muted-foreground text-sm">{description}</SheetDescription>
                  )}
                </div>
                <SheetClose
                  className={cn(
                    buttonVariants({ variant: 'ghost', size: 'default' }),
                    "hover:bg-[#F5F3FF33] hover:text-white cursor-pointer"
                  )}
                >
                  <span>Close</span>
                </SheetClose>
              </SheetHeader>
            )}
            <div className="bg-[#F5F3FF]">
              {content}
              {footer && <SheetFooter className="rounded-lg bg-white p-4 flex sm:items-center sm:justify-end">{footer}</SheetFooter>}
            </div>
          </SheetContent>
        </Sheet>
      );
    }
  }
};

export default Modal;

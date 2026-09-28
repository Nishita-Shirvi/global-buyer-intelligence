import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

type Variant = 'primary' | 'secondary' | 'ghost' | 'link'

const styles: Record<Variant, string> = {
  primary:
    'inline-flex items-center justify-center gap-2 rounded-md bg-harbor px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-harbor-soft disabled:cursor-not-allowed disabled:opacity-50',
  secondary:
    'inline-flex items-center justify-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5 text-sm font-medium text-ink transition-colors hover:bg-paper disabled:cursor-not-allowed disabled:opacity-50',
  ghost:
    'inline-flex items-center justify-center gap-2 rounded-md px-2.5 py-1 text-sm font-medium text-muted transition-colors hover:bg-sunken hover:text-ink disabled:cursor-not-allowed disabled:opacity-50',
  link: 'font-medium text-ink underline decoration-line underline-offset-4 hover:decoration-ink disabled:opacity-50',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }

export default function Button({ variant = 'primary', className = '', type = 'button', ...props }: ButtonProps) {
  return <button type={type} className={`${styles[variant]} ${className}`} {...props} />
}

/** Navigation styled as a button. Use for actions that go to another page. */
export function ButtonLink({ variant = 'primary', className = '', ...props }: LinkProps & { variant?: Variant }) {
  return <Link className={`${styles[variant]} ${className}`} {...props} />
}

import { ButtonLink } from '../components/Button'
import { PageHeading } from '../components/Header'
import { PRODUCTS } from '../types/product'

/** Products the business trades. Configuration, so this page works without the backend. */
export default function Products() {
  return (
    <>
      <PageHeading
        title="Products"
        description="Products we look for buyers of. Coffee is the first proof of concept; more products can be added."
      />
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PRODUCTS.map((p) => (
          <li key={p.id} className="flex flex-col rounded-lg border border-line bg-surface p-6">
            <h2 className="text-lg font-bold text-ink">{p.name}</h2>
            <p className="mt-1 text-[13px]">
              {p.hsCode ? (
                <span className="text-muted">HS code <span className="tabular font-semibold text-ink">{p.hsCode}</span></span>
              ) : (
                <span className="text-faint">HS code not yet verified</span>
              )}
            </p>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{p.description}</p>
            <ButtonLink to={`/buyers?product=${encodeURIComponent(p.name)}`} variant="secondary" className="mt-5 self-start">
              View buyers →
            </ButtonLink>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-[13px] text-faint">
        HS codes are added only once verified from a reliable source. Arabica, Robusta, and instant-coffee codes are not set yet.
      </p>
    </>
  )
}

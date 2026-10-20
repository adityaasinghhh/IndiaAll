/**
 * Consistent section heading: optional gold eyebrow, serif title, optional lead text.
 * `align` controls text alignment; `dark` renders for charcoal backgrounds.
 */
export default function SectionHeading({ eyebrow, title, lead, align = 'center', dark = false }) {
  const alignment = align === 'center' ? 'text-center mx-auto' : 'text-left'
  const titleColor = dark ? 'text-off-white' : 'text-charcoal'
  const leadColor = dark ? 'text-titanium/80' : 'text-text-secondary'

  return (
    <div className={`max-w-3xl ${alignment}`}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className={`font-serif text-3xl font-bold leading-tight md:text-4xl ${titleColor}`}>
        {title}
      </h2>
      {lead && <p className={`mt-4 text-base font-medium leading-7 md:text-lg ${leadColor}`}>{lead}</p>}
    </div>
  )
}

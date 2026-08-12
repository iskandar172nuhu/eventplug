interface CurrencyDisplayProps {
  amount: number | string
  className?: string
  showDecimals?: boolean
}

export function CurrencyDisplay({
  amount,
  className,
  showDecimals = true,
}: CurrencyDisplayProps) {
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount
  const formatted = showDecimals
    ? numericAmount.toLocaleString("en-GH", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : numericAmount.toLocaleString("en-GH", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })

  return <span className={className}>GH₵{formatted}</span>
}

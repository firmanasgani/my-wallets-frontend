export type SelectValue = string | number | null | undefined

export interface SelectOption<T extends SelectValue = SelectValue> {
  value: T
  label: string
  description?: string
  group?: string
  disabled?: boolean
}

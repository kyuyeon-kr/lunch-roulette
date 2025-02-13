export function Checkbox({ checked, onCheckedChange }) {
  return <input type="checkbox" checked={checked} onChange={onCheckedChange} />;
}

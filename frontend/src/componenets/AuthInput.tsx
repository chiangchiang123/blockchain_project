export default function AuthInput({
  value,
  onChange,
  placeholder,
  type,
}: any) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
      className="border p-2 w-full"
    />
  );
}
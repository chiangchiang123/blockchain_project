export default function ArrowButton({ onClick, disabled, text }: any) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {text}
    </button>
  );
}
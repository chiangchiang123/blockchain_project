export default function SignupPage({ onSubmit, onSwitch }: any) {
  return (
    <div>
      <h1>Signup</h1>
      <button onClick={onSubmit}>Create</button>
      <button onClick={onSwitch}>Login</button>
    </div>
  );
}
// Displays a success or error message banner
export default function Flash({ flash }) {
  if (!flash) return null;
  return <div className={`flash flash-${flash.type}`}>{flash.text}</div>;
}

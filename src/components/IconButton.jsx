export default function IconButton({ children, onClick, color }) {
  return (
    <button
      onClick={onClick}
      class={`${
        color || "text-white border-white"
      } border rounded-full p-3 place-items-center grid`}
    >
      {children}
    </button>
  );
}

/**
 * @typedef {Object} IconButtonProperties
 * @property {string} [color]
 * @property {import("solid-js").JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent> } [onClick]
 */
/**
 * @param {import("solid-js").ParentProps<IconButtonProperties>} properties
 * @returns {import("solid-js").JSX.Element}
 */
export default function IconButton({ children, onClick, color }) {
  return (
    <button
      onClick={onClick}
      class={`${
        color || "text-white border-white"
      } border rounded-full p-3 place-items-center grid box-border`}
    >
      {children}
    </button>
  );
}

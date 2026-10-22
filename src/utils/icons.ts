import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

type IconProps = { color?: string; size?: number };

// Pensado para íconos de lucide-react-native: si el ícono no define color ni
// tamaño, se le asignan los del componente que lo contiene.
export function withIconDefaults(icon: ReactNode, defaults: Required<IconProps>): ReactNode {
  if (!isValidElement<IconProps>(icon)) {
    return icon;
  }

  return cloneElement(icon as ReactElement<IconProps>, {
    color: icon.props.color ?? defaults.color,
    size: icon.props.size ?? defaults.size,
  });
}

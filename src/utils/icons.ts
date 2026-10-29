import { Briefcase, GraduationCap, House, type LucideIcon } from "lucide-react-native";
import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

import type { LugarGuardado } from "@/types";

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

// Ícono de cada lugar guardado (chips de F1_04, F3_01)
export const ICONO_LUGAR: Record<LugarGuardado["nombre"], LucideIcon> = {
  Casa: House,
  Trabajo: Briefcase,
  U: GraduationCap,
};

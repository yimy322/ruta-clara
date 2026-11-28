// Notificaciones locales (6.3, expo-notifications). Solo locales: el push
// remoto necesita una development build. Avisos de viaje (F1_08, F1_09) y
// recordatorios semanales de las alertas diarias (F3_03). Las pantallas
// usan estas funciones a través del repositorio o de useAvisoProgramado.
import * as Notifications from "expo-notifications";

export type ContenidoAviso = { titulo: string; cuerpo: string };

// Recordatorio de una alerta diaria, ya con sus textos
export type Recordatorio = ContenidoAviso & {
  alertaId: string;
  // Hora de salida y días como en Date.getDay() (0 = domingo)
  hora: number;
  minuto: number;
  dias: number[];
  minutosAntes: number;
};

const PREFIJO_ALERTA = "alerta:";

// Con la app abierta, los avisos de viaje no se muestran (ya sale el toast);
// los recordatorios sí
Notifications.setNotificationHandler({
  handleNotification: async (notificacion) => {
    const mostrar = notificacion.request.content.data?.soloFuera !== true;
    return {
      shouldShowBanner: mostrar,
      shouldShowList: mostrar,
      shouldPlaySound: mostrar,
      shouldSetBadge: false,
    };
  },
});

async function hayPermiso(): Promise<boolean> {
  try {
    return (await Notifications.getPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

// Pide el permiso solo si todavía no se respondió. true = concedido
export async function pedirPermisoNotificaciones(): Promise<boolean> {
  try {
    const actual = await Notifications.getPermissionsAsync();
    if (actual.granted || !actual.canAskAgain) {
      return actual.granted;
    }
    return (await Notifications.requestPermissionsAsync()).granted;
  } catch {
    return false;
  }
}

// Aviso único dentro de `segundos`; el mismo id reemplaza al anterior
export async function programarAviso(id: string, { titulo, cuerpo }: ContenidoAviso, segundos: number): Promise<void> {
  if (!(await hayPermiso())) {
    return;
  }
  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title: titulo, body: cuerpo, data: { soloFuera: true } },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: Math.max(1, Math.round(segundos)) },
  }).catch(() => {});
}

export async function cancelarAviso(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id).catch(() => {});
}

// Vuelve a programar todos los recordatorios: uno semanal por alerta y día,
// a la hora de salida menos minutosAntes (puede caer el día anterior)
export async function reprogramarRecordatorios(lista: Recordatorio[]): Promise<void> {
  try {
    const programadas = await Notifications.getAllScheduledNotificationsAsync();
    await Promise.all(
      programadas
        .filter((n) => n.identifier.startsWith(PREFIJO_ALERTA))
        .map((n) => Notifications.cancelScheduledNotificationAsync(n.identifier)),
    );
    if (lista.length === 0 || !(await hayPermiso())) {
      return;
    }
    const minutosSemana = 7 * 24 * 60;
    await Promise.all(
      lista.flatMap((r) =>
        r.dias.map((dia) => {
          const total = (((dia * 24 * 60 + r.hora * 60 + r.minuto - r.minutosAntes) % minutosSemana) + minutosSemana) % minutosSemana;
          return Notifications.scheduleNotificationAsync({
            identifier: `${PREFIJO_ALERTA}${r.alertaId}:${dia}`,
            content: { title: r.titulo, body: r.cuerpo },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
              // expo-notifications: 1 = domingo
              weekday: Math.floor(total / (24 * 60)) + 1,
              hour: Math.floor((total % (24 * 60)) / 60),
              minute: total % 60,
            },
          });
        }),
      ),
    );
  } catch {
    // Sin notificaciones la app sigue funcionando (solo toasts)
  }
}

// Al cerrar sesión: no deben llegar avisos de la cuenta anterior
export async function cancelarTodosLosAvisos(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync().catch(() => {});
}

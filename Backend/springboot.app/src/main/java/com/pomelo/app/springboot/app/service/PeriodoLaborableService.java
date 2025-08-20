package com.pomelo.app.springboot.app.service;

import com.pomelo.app.springboot.app.entity.PeriodoLaborable;
import com.pomelo.app.springboot.app.entity.Cita;
import com.pomelo.app.springboot.app.repository.PeriodoLaborableRepository;
import com.pomelo.app.springboot.app.repository.CitaRepository;
import com.pomelo.app.springboot.app.service.EmailService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
public class PeriodoLaborableService {

    @Autowired
    private PeriodoLaborableRepository periodoLaborableRepository;
    
    @Autowired
    private CitaRepository citaRepository;
    
    @Autowired
    private GoogleCalendarService googleCalendarService;
    
    @Autowired
    private EmailService emailService;

    /**
     * Crear un nuevo período laborable
     */
    public PeriodoLaborable crearPeriodo(PeriodoLaborable periodo) {
        // Validar que no haya solapamiento con otros períodos
        List<PeriodoLaborable> periodosSolapados = periodoLaborableRepository.findPeriodosSolapados(
            periodo.getFechaInicio(), periodo.getFechaFin());
        
        if (!periodosSolapados.isEmpty()) {
            throw new RuntimeException("Ya existe un período que se solapa con las fechas especificadas");
        }

        // Validar que el nombre no esté duplicado
        List<PeriodoLaborable> periodosConMismoNombre = periodoLaborableRepository.findByNombreIgnoreCase(periodo.getNombre());
        if (!periodosConMismoNombre.isEmpty()) {
            throw new RuntimeException("Ya existe un período con ese nombre");
        }

        PeriodoLaborable periodoGuardado = periodoLaborableRepository.save(periodo);
        
        // Verificar si hay citas existentes que ahora están en días no laborables
        verificarCitasExistentesEnPeriodoNuevo(periodo);
        
        return periodoGuardado;
    }
    
    /**
     * Verifica si hay citas existentes que ahora están en días no laborables del nuevo período
     */
    private void verificarCitasExistentesEnPeriodoNuevo(PeriodoLaborable periodo) {
        System.out.println("🔍 Verificando citas existentes para nuevo período: " + periodo.getNombre());
        
        // Buscar todas las citas en el rango de fechas del período
        List<Cita> citasEnRango = citaRepository.findByFechaHoraBetweenAndEstadoNot(
            periodo.getFechaInicio().atStartOfDay(),
            periodo.getFechaFin().atTime(23, 59, 59),
            "cancelada"
        );
        
        System.out.println("   Citas existentes en el rango: " + citasEnRango.size());
        
        int citasCanceladas = 0;
        for (Cita cita : citasEnRango) {
            LocalDate fechaCita = cita.getFechaHora().toLocalDate();
            DayOfWeek diaSemanaCita = fechaCita.getDayOfWeek();
            String diaSemanaStr = diaSemanaCita.toString();
            
            System.out.println("   Verificando cita ID " + cita.getId() + " - Fecha: " + fechaCita + " - Día: " + diaSemanaStr);
            
            // Si la cita está en un día que NO está marcado como laborable en el período, cancelarla
            if (!periodo.getDiasLaborables().contains(diaSemanaStr)) {
                System.out.println("   Cancelando cita ID " + cita.getId() + " - Día no laborable en nuevo período");
                
                                 cita.setEstado("cancelada");
                 cita.setComentario("Cita cancelada automáticamente: día no laborable en nuevo período '" + periodo.getNombre() + "'");
                 citaRepository.save(cita);
                 
                 // Enviar email de cancelación al cliente
                 try {
                     DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
                     String fechaHoraFormateada = cita.getFechaHora().format(formatter);
                     
                     emailService.enviarCancelacionCita(
                         cita.getCliente().getEmail(),
                         cita.getCliente().getNombre(),
                         cita.getServicio().getNombre(),
                         cita.getFechaHora(),
                         cita.getServicio().getDuracionMinutos(),
                         cita.getServicio().getPrecio()
                     );
                     System.out.println("📧 Email de cancelación enviado a: " + cita.getCliente().getEmail());
                 } catch (Exception e) {
                     System.err.println("❌ Error al enviar email de cancelación para cita ID " + cita.getId() + ": " + e.getMessage());
                 }
                 
                 // Eliminar eventos de Google Calendar
                 try {
                     googleCalendarService.deleteCalendarEventsForUserAndAdmin(cita, cita.getCliente());
                     System.out.println("🗑️ Eventos de Google Calendar eliminados para cita ID: " + cita.getId());
                 } catch (Exception e) {
                     System.err.println("❌ Error al eliminar eventos de Google Calendar para cita ID " + cita.getId() + ": " + e.getMessage());
                 }
                
                citasCanceladas++;
            }
        }
        
        if (citasCanceladas > 0) {
            System.out.println("⚠️ Se han cancelado " + citasCanceladas + " citas existentes debido al nuevo período '" + periodo.getNombre() + "'");
        }
    }

    /**
     * Obtener todos los períodos activos
     */
    public List<PeriodoLaborable> obtenerPeriodosActivos() {
        return periodoLaborableRepository.findByActivoTrue();
    }

    /**
     * Obtener períodos activos para una fecha específica
     */
    public List<PeriodoLaborable> obtenerPeriodosActivosPorFecha(LocalDate fecha) {
        return periodoLaborableRepository.findPeriodosActivosPorFecha(fecha);
    }

    /**
     * Obtener un período por ID
     */
    public Optional<PeriodoLaborable> obtenerPeriodoPorId(Long id) {
        return periodoLaborableRepository.findById(id);
    }

    /**
     * Eliminar un período
     */
    public void eliminarPeriodo(Long id) {
        Optional<PeriodoLaborable> periodoExistente = periodoLaborableRepository.findById(id);
        
        if (periodoExistente.isEmpty()) {
            throw new RuntimeException("Período no encontrado");
        }
        
        PeriodoLaborable periodo = periodoExistente.get();
        
        // Cancelar todas las citas en el rango del período antes de eliminarlo
        cancelarCitasEnPeriodoEliminado(periodo);
        
        periodoLaborableRepository.deleteById(id);
    }
    
    /**
     * Cancela todas las citas en un período que se va a eliminar
     */
    private void cancelarCitasEnPeriodoEliminado(PeriodoLaborable periodo) {
        System.out.println("🗑️ Eliminando período: " + periodo.getNombre() + " - Cancelando todas las citas en el rango");
        
        // Buscar todas las citas en el rango de fechas del período
        List<Cita> citasAAfectar = citaRepository.findByFechaHoraBetweenAndEstadoNot(
            periodo.getFechaInicio().atStartOfDay(),
            periodo.getFechaFin().atTime(23, 59, 59),
            "cancelada"
        );
        
        System.out.println("   Citas encontradas en el período a eliminar: " + citasAAfectar.size());
        
        int citasCanceladas = 0;
        for (Cita cita : citasAAfectar) {
            LocalDate fechaCita = cita.getFechaHora().toLocalDate();
            DayOfWeek diaSemanaCita = fechaCita.getDayOfWeek();
            String diaSemanaStr = diaSemanaCita.toString();
            
            // Solo cancelar si el día estaba marcado como laborable en el período
            if (periodo.getDiasLaborables().contains(diaSemanaStr)) {
                System.out.println("   Cancelando cita ID " + cita.getId() + " - Fecha: " + fechaCita + " - Día: " + diaSemanaStr);
                
                                 cita.setEstado("cancelada");
                 cita.setComentario("Cita cancelada automáticamente: período '" + periodo.getNombre() + "' eliminado");
                 citaRepository.save(cita);
                 
                 // Enviar email de cancelación al cliente
                 try {
                     DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
                     String fechaHoraFormateada = cita.getFechaHora().format(formatter);
                     
                     emailService.enviarCancelacionCita(
                         cita.getCliente().getEmail(),
                         cita.getCliente().getNombre(),
                         cita.getServicio().getNombre(),
                         cita.getFechaHora(),
                         cita.getServicio().getDuracionMinutos(),
                         cita.getServicio().getPrecio()
                     );
                     System.out.println("📧 Email de cancelación enviado a: " + cita.getCliente().getEmail());
                 } catch (Exception e) {
                     System.err.println("❌ Error al enviar email de cancelación para cita ID " + cita.getId() + ": " + e.getMessage());
                 }
                 
                 // Eliminar eventos de Google Calendar
                 try {
                     googleCalendarService.deleteCalendarEventsForUserAndAdmin(cita, cita.getCliente());
                     System.out.println("🗑️ Eventos de Google Calendar eliminados para cita ID: " + cita.getId());
                 } catch (Exception e) {
                     System.err.println("❌ Error al eliminar eventos de Google Calendar para cita ID " + cita.getId() + ": " + e.getMessage());
                 }
                
                citasCanceladas++;
            }
        }
        
        if (citasCanceladas > 0) {
            System.out.println("⚠️ Se han cancelado " + citasCanceladas + " citas debido a la eliminación del período '" + periodo.getNombre() + "'");
        }
    }

    /**
     * Verificar si una fecha específica es laborable según los períodos configurados
     */
    public boolean esFechaLaborable(LocalDate fecha) {
        List<PeriodoLaborable> periodosActivos = periodoLaborableRepository.findPeriodosActivosPorFecha(fecha);
        
        if (periodosActivos.isEmpty()) {
            return false; // Si no hay períodos activos para esa fecha, no es laborable
        }

        // Verificar si el día de la semana está en los días laborables de algún período
        DayOfWeek diaSemana = fecha.getDayOfWeek();
        String diaSemanaStr = diaSemana.toString();

        // Si hay períodos activos para esta fecha, SOLO es laborable si está explícitamente marcado como laborable
        for (PeriodoLaborable periodo : periodosActivos) {
            if (periodo.getDiasLaborables().contains(diaSemanaStr)) {
                return true; // Solo es laborable si está explícitamente en la lista de días laborables
            }
        }

        // Si hay períodos activos pero el día no está en la lista de días laborables, NO es laborable
        return false;
    }

    /**
     * Obtener información de disponibilidad para una fecha específica
     */
    public String obtenerInformacionDisponibilidad(LocalDate fecha) {
        List<PeriodoLaborable> periodosActivos = periodoLaborableRepository.findPeriodosActivosPorFecha(fecha);
        
        if (periodosActivos.isEmpty()) {
            return "Cerrado: No hay períodos activos para esta fecha";
        }

        DayOfWeek diaSemana = fecha.getDayOfWeek();
        String diaSemanaStr = diaSemana.toString();

        for (PeriodoLaborable periodo : periodosActivos) {
            if (periodo.getDiasLaborables().contains(diaSemanaStr)) {
                return "Abierto: " + periodo.getNombre();
            }
        }

        return "Cerrado: Día no laborable según los períodos configurados";
    }

    /**
     * Actualizar un período existente
     */
    public PeriodoLaborable actualizarPeriodo(Long id, PeriodoLaborable periodoActualizado) {
        Optional<PeriodoLaborable> periodoExistente = periodoLaborableRepository.findById(id);
        
        if (periodoExistente.isEmpty()) {
            throw new RuntimeException("Período no encontrado");
        }

        PeriodoLaborable periodo = periodoExistente.get();
        
        // Guardar los días laborables anteriores para comparar
        List<String> diasLaborablesAnteriores = periodo.getDiasLaborables();
        
        // Actualizar el período
        periodo.setNombre(periodoActualizado.getNombre());
        periodo.setFechaInicio(periodoActualizado.getFechaInicio());
        periodo.setFechaFin(periodoActualizado.getFechaFin());
        periodo.setDiasLaborables(periodoActualizado.getDiasLaborables());
        periodo.setDescripcion(periodoActualizado.getDescripcion());
        periodo.setActivo(periodoActualizado.isActivo());

        // Guardar el período actualizado
        PeriodoLaborable periodoGuardado = periodoLaborableRepository.save(periodo);
        
        // Verificar y cancelar citas afectadas
        verificarYCancelarCitasAfectadas(periodo, diasLaborablesAnteriores, periodoActualizado.getDiasLaborables());
        
        return periodoGuardado;
    }
    
    /**
     * Verifica y cancela las citas que ya no son válidas después de actualizar un período
     */
    private void verificarYCancelarCitasAfectadas(PeriodoLaborable periodo, List<String> diasAnteriores, List<String> diasNuevos) {
        System.out.println("🔍 Verificando cancelación automática para período: " + periodo.getNombre());
        System.out.println("   Días anteriores: " + diasAnteriores);
        System.out.println("   Días nuevos: " + diasNuevos);
        
        // Encontrar días que ya no son laborables
        List<String> diasCancelados = diasAnteriores.stream()
            .filter(dia -> !diasNuevos.contains(dia))
            .toList();
        
        System.out.println("   Días cancelados: " + diasCancelados);
        
        if (diasCancelados.isEmpty()) {
            System.out.println("   No hay días cancelados, no hay citas que cancelar");
            return; // No hay días cancelados, no hay citas que cancelar
        }
        
        // Buscar citas en el rango de fechas del período que están en días cancelados
        List<Cita> citasAAfectar = citaRepository.findByFechaHoraBetweenAndEstadoNot(
            periodo.getFechaInicio().atStartOfDay(),
            periodo.getFechaFin().atTime(23, 59, 59),
            "cancelada"
        );
        
        System.out.println("   Citas encontradas en el rango: " + citasAAfectar.size());
        
        int citasCanceladas = 0;
        for (Cita cita : citasAAfectar) {
            LocalDate fechaCita = cita.getFechaHora().toLocalDate();
            DayOfWeek diaSemanaCita = fechaCita.getDayOfWeek();
            String diaSemanaStr = diaSemanaCita.toString();
            
            System.out.println("   Verificando cita ID " + cita.getId() + " - Fecha: " + fechaCita + " - Día: " + diaSemanaStr);
            
                         // Si la cita está en un día que ya no es laborable, cancelarla
             if (diasCancelados.contains(diaSemanaStr)) {
                 cita.setEstado("cancelada");
                 cita.setComentario("Cita cancelada automáticamente: día marcado como no laborable en período '" + periodo.getNombre() + "'");
                 citaRepository.save(cita);
                 
                 // Enviar email de cancelación al cliente
                 try {
                     DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
                     String fechaHoraFormateada = cita.getFechaHora().format(formatter);
                     
                     emailService.enviarCancelacionCita(
                         cita.getCliente().getEmail(),
                         cita.getCliente().getNombre(),
                         cita.getServicio().getNombre(),
                         cita.getFechaHora(),
                         cita.getServicio().getDuracionMinutos(),
                         cita.getServicio().getPrecio()
                     );
                     System.out.println("📧 Email de cancelación enviado a: " + cita.getCliente().getEmail());
                 } catch (Exception e) {
                     System.err.println("❌ Error al enviar email de cancelación para cita ID " + cita.getId() + ": " + e.getMessage());
                 }
                 
                 // Eliminar eventos de Google Calendar
                 try {
                     googleCalendarService.deleteCalendarEventsForUserAndAdmin(cita, cita.getCliente());
                     System.out.println("🗑️ Eventos de Google Calendar eliminados para cita ID: " + cita.getId());
                 } catch (Exception e) {
                     System.err.println("❌ Error al eliminar eventos de Google Calendar para cita ID " + cita.getId() + ": " + e.getMessage());
                 }
                 
                 citasCanceladas++;
             }
        }
        
        if (citasCanceladas > 0) {
            System.out.println("⚠️ Se han cancelado " + citasCanceladas + " citas debido a cambios en el período '" + periodo.getNombre() + "'");
        }
    }
}
